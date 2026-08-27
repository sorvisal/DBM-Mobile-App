import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {
    create as createAxiosClient,
    isAxiosError,
    type AxiosError,
    type AxiosRequestConfig,
    type InternalAxiosRequestConfig,
} from 'axios';
import { Platform } from 'react-native';
import { getTokens, setTokens, clearTokens } from './storage';
import { cacheClearAll } from './cache';
import { startLoading, finishLoading } from './loading';

/* ── Extend AxiosRequestConfig for global loading flag ── */
declare module 'axios' {
  interface AxiosRequestConfig {
    skipGlobalLoading?: boolean;
  }
}

/** URLs that must never trigger the global loading overlay. */
const AUTH_URLS = ['/auth/login', '/auth/refresh', '/auth/register', '/auth/me'];

function shouldTrackLoading(config: AxiosRequestConfig | undefined): boolean {
  if (!config) return false;
  if (config.skipGlobalLoading) return false;
  const url = config.url ?? '';
  for (let i = 0; i < AUTH_URLS.length; i++) {
    if (url.includes(AUTH_URLS[i])) return false;
  }
  return true;
}

const rawBase = (process.env.EXPO_PUBLIC_API_URL ?? "https://dbmapi.palsatya.site").replace(/\/+$/, "");
export const API_BASE_URL = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`;
export const API_ORIGIN = rawBase;

/**
 * Converts a relative media path returned by the backend into a full,
 * loadable URL.
 *
 * The backend (ProductsController) stores uploaded files under uploads/products/
 * on disk, but the API response only returns the path relative to "uploads/"
 * (e.g. "products/product-xxxxx.jpg"). The files are actually served publicly
 * from https://<host>/uploads/products/product-xxxxx.jpg — so this always
 * prefixes "uploads/" unless the path already has it, to avoid a double
 * "uploads/uploads/" segment.
 *
 * resolveMediaUrl("products/product-xxxxx.jpg")
 *   -> "https://dbmapi.palsatya.site/uploads/products/product-xxxxx.jpg"
 * resolveMediaUrl("uploads/products/product-xxxxx.jpg")
 *   -> "https://dbmapi.palsatya.site/uploads/products/product-xxxxx.jpg" (no double prefix)
 * resolveMediaUrl("https://dbmapi.palsatya.site/uploads/products/product-xxxxx.jpg")
 *   -> unchanged (already absolute)
 * resolveMediaUrl(null | undefined) -> undefined
 */
export function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path) {
    if (__DEV__) console.log('[MEDIA] resolveMediaUrl: no path ->', path);
    return undefined;
  }
  if (/^(blob|data):/i.test(path)) {
    if (__DEV__) console.log('[MEDIA] resolveMediaUrl: blob/data URI, ignoring ->', path);
    return undefined;
  }
  if (/^https?:\/\//.test(path)) {
    if (__DEV__) console.log('[MEDIA] resolveMediaUrl: already absolute ->', path);
    return path;
  }
  const clean = path.replace(/^\/+/, '');
  const withUploads = /^uploads\//i.test(clean) ? clean : `uploads/${clean}`;
  const url = `${rawBase}/${withUploads}`;
  if (__DEV__) console.log('[MEDIA] resolveMediaUrl:', path, '->', url);
  return url;
}

type BackendApiResponse<T> = {
  success: boolean;
  data?: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  } | null;
  error?: string | null;
};

const client = createAxiosClient({
   baseURL: API_BASE_URL,
   timeout: 20000,
   withCredentials: true,
   headers: { 'X-Client-App': 'mobile' },
 });

/**
 * Separate Axios client for token refresh only.
 * Does NOT have request/response interceptors, so:
 * - No expired Authorization header is attached
 * - No 401 retry loop can occur
 * - No global loading tracking interference
 */
const refreshClient = createAxiosClient({
  baseURL: API_BASE_URL,
  timeout: 20000,
  withCredentials: true,
  headers: { 'X-Client-App': 'mobile' },
});

let accessToken: string | null = null;

const isWeb = Platform.OS === 'web';
const TOKEN_COOKIE = 'access_token';
const TOKEN_STORAGE_KEY = 'accessToken';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

async function persistToken(token: string | null): Promise<void> {
  if (isWeb) {
    document.cookie = token
      ? `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; SameSite=Lax`
      : `${TOKEN_COOKIE}=; Path=/; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
  if (token) {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  persistToken(token);
}

/** Presence check only — never exposes the token value. */
export function hasAccessToken(): boolean {
  return !!accessToken;
}

export async function restoreAccessToken(): Promise<boolean> {
  const stored = await getTokens();
  if (stored?.accessToken) {
    accessToken = stored.accessToken;
    return true;
  }
  const fromCookie = isWeb ? readCookie(TOKEN_COOKIE) : null;
  const token = fromCookie ?? (await AsyncStorage.getItem(TOKEN_STORAGE_KEY));
  if (token) {
    accessToken = token;
    return true;
  }
  return false;
}

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
   if (accessToken) {
     config.headers.Authorization = `Bearer ${accessToken}`;
   }
   if (config.data instanceof FormData) {
     delete config.headers['Content-Type'];
   }
   // Global loading tracking — skip retried requests (401 retry) and auth URLs
   const cfg = config as InternalAxiosRequestConfig & { _retry?: boolean };
   if (!cfg._retry && shouldTrackLoading(config)) {
     startLoading();
   }
   return config;
 });

type LogoutListener = () => void;
const logoutListeners = new Set<LogoutListener>();

export function onUnauthorized(listener: LogoutListener): () => void {
  logoutListeners.add(listener);
  return () => logoutListeners.delete(listener);
}

let logoutFired = false;
function forceLogout() {
  if (logoutFired) return;
  logoutFired = true;
  accessToken = null;
  persistToken(null);
  clearTokens().catch(() => {});
  cacheClearAll().catch(() => {});
  logoutListeners.forEach((listener) => listener());
  setTimeout(() => { logoutFired = false; }, 2000);
}

/* ── Single-flight token refresh ── */
let refreshPromise: Promise<string> | null = null;

function doRefresh(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      // Guard: if logout already fired, do not attempt refresh
      if (logoutFired) {
        throw new Error('Logout already triggered');
      }

      if (__DEV__) console.log('[API] 401 → TOKEN REFRESH');
      const stored = await getTokens();
      if (!stored?.refreshToken) {
        if (__DEV__) console.log('[API] TOKEN REFRESH FAILED: no refresh token in storage');
        throw new Error('No refresh token');
      }

      /**
       * Use refreshClient (no interceptors) to avoid:
       * - Sending an expired accessToken in the Authorization header
       * - Triggering another 401 → refresh loop
       * - Interfering with global loading tracking
       */
      const resp = await refreshClient.post<{ accessToken: string; refreshToken: string }>(
        '/auth/refresh',
        { refreshToken: stored.refreshToken },
      );
      const newTokens = resp.data;

      // Guard again — logout may have fired while refresh was in flight
      if (logoutFired) {
        if (__DEV__) console.log('[API] TOKEN REFRESH OK but logout already fired, discarding');
        throw new Error('Logout already triggered');
      }

      accessToken = newTokens.accessToken;
      await setTokens(newTokens);
      if (__DEV__) console.log('[API] TOKEN REFRESH SUCCESS');
      return newTokens.accessToken;
    } catch (err) {
      if (__DEV__) console.log('[API] TOKEN REFRESH FAILED');
      forceLogout();
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

client.interceptors.response.use(
  (response) => {
    // Finish global loading tracking for non-retry, non-auth requests
    if (shouldTrackLoading(response.config)) {
      finishLoading();
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      const url = original.url ?? '';

      // Auth URLs — never retry refresh on these
      if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/register')) {
        if (__DEV__) console.log(`[API] ${url} 401 (auth endpoint, not retrying)`);
        if (shouldTrackLoading(original)) finishLoading();
        return Promise.reject(error);
      }

      // Post-logout guard — do not attempt refresh if user already logged out
      if (logoutFired) {
        if (__DEV__) console.log(`[API] ${url} 401 after logout, rejecting`);
        if (shouldTrackLoading(original)) finishLoading();
        return Promise.reject(error);
      }

      try {
        if (__DEV__) console.log(`[API] ${url} 401 → attempting token refresh`);
        await doRefresh();
        original._retry = true;
        if (__DEV__) console.log(`[API] ${url} → RETRY with new token`);
        return client.request(original);
      } catch (refreshError) {
        // Refresh failed (forceLogout already called inside doRefresh)
        if (__DEV__) console.log(`[API] ${url} RETRY FAILED after refresh`);
        finishLoading();
        return Promise.reject(error);
      }
    }

    // Non-401 error — log for debugging, finish loading
    if (shouldTrackLoading(original)) {
      finishLoading();
    }

    if (__DEV__) {
      const method = (original?.method ?? "???").toUpperCase();
      const url = original?.url ?? "???";
      const status = error.response?.status ?? "N/A";
      const statusText = error.response?.statusText ?? "";
      const resData = error.response?.data;
      console.log(
        `[API ERROR]\nMethod: ${method}\nURL: ${url}\nStatus: ${status}${statusText ? " " + statusText : ""}\nResponse: ${JSON.stringify(resData, null, 2)}\nMessage: ${error.message}`,
      );
    }

    return Promise.reject(error);
  },
);

/* ── Error classification ── */
export type AppErrorCode = 'unauthorized' | 'forbidden' | 'not_found' | 'conflict'
  | 'validation' | 'rate_limit' | 'network' | 'timeout' | 'server' | 'unknown';

export function httpErrorCode(error: unknown): AppErrorCode {
  if (!isAxiosError(error)) return 'unknown';
  const status = error.response?.status;
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 422) return 'validation';
  if (status === 429) return 'rate_limit';
  if (status && status >= 500) return 'server';
  if (error.code === 'ERR_NETWORK') return 'network';
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) return 'timeout';
  return 'unknown';
}

/** Legacy helper — returns a displayable error string (preserves old behavior). */
export function httpErrorMessage(error: unknown): string | null {
  if (!isAxiosError(error)) return null;
  const body = error.response?.data as
    | { code?: string; message?: string; error?: string; title?: string }
    | undefined;
  if (body?.code) return body.code;
  if (body?.error) return body.error;
  if (error.response?.status === 401) return 'unauthorized';
  if (error.code === 'ERR_NETWORK') return 'network';
  return body?.message ?? body?.title ?? null;
}

function unwrapData<T>(payload: BackendApiResponse<T> | T): T {
  if (payload && typeof payload === 'object' && 'success' in (payload as object)) {
    const wrapped = payload as BackendApiResponse<T>;
    if (!wrapped.success) {
      throw new Error(wrapped.error || 'Request failed');
    }
    return wrapped.data as T;
  }
  return payload as T;
}

/* ── Performance logging (dev only) ── */
function perfLog(method: string, url: string, start: number, extra?: string) {
  if (__DEV__) {
    const ms = Date.now() - start;
    console.log(`[API] ${method} ${url} ${ms}ms${extra ? ' ' + extra : ''}`);
  }
}

/* ── Request deduplication (GET only) ── */
const inflight = new Map<string, Promise<unknown>>();

function dedupKey(method: string, url: string, config?: AxiosRequestConfig): string {
  const params = config?.params ? JSON.stringify(config.params) : '';
  return `${method}:${url}:${params}`;
}

/* ── HTTP helpers ── */

export async function httpGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const key = dedupKey('GET', url, config);

  if (inflight.has(key)) {
    if (__DEV__) console.log(`[API] DEDUPE GET ${url}`);
    return inflight.get(key) as Promise<T>;
  }

  const start = Date.now();
  const promise = client
    .get<BackendApiResponse<T> | T>(url, config)
    .then((res) => {
      perfLog('GET', url, start);
      return unwrapData(res.data);
    })
    .catch((err) => {
      perfLog('GET', url, start, 'ERROR');
      throw err;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
}

export async function httpPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const start = Date.now();
  try {
    const { data } = await client.post<BackendApiResponse<T> | T>(url, body, config);
    perfLog('POST', url, start);
    return unwrapData(data);
  } catch (err) {
    perfLog('POST', url, start, 'ERROR');
    throw err;
  }
}

export async function httpPut<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const start = Date.now();
  try {
    const { data } = await client.put<BackendApiResponse<T> | T>(url, body, config);
    perfLog('PUT', url, start);
    return unwrapData(data);
  } catch (err) {
    perfLog('PUT', url, start, 'ERROR');
    throw err;
  }
}

export async function httpDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const start = Date.now();
  try {
    const { data } = await client.delete<BackendApiResponse<T> | T>(url, config);
    perfLog('DELETE', url, start);
    return unwrapData(data);
  } catch (err) {
    perfLog('DELETE', url, start, 'ERROR');
    throw err;
  }
}

export async function httpDownloadBlob(url: string, config?: AxiosRequestConfig): Promise<unknown> {
  const start = Date.now();
  try {
    const { data } = await client.get<unknown>(url, {
      ...config,
      responseType: 'blob',
    });
    perfLog('BLOB', url, start);
    return data;
  } catch (err) {
    perfLog('BLOB', url, start, 'ERROR');
    throw err;
  }
}

export async function httpGetPaginated<T>(url: string, config?: AxiosRequestConfig): Promise<{
  items: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number } | null;
}> {
  const key = dedupKey('GET', url, config);

  if (inflight.has(key)) {
    if (__DEV__) console.log(`[API] DEDUPE GET ${url}`);
    return inflight.get(key) as Promise<{ items: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number } | null }>;
  }

  const start = Date.now();
  const promise = client
    .get<BackendApiResponse<T[]>>(url, config)
    .then((response) => {
      perfLog('GET', url, start);
      const body = response.data as BackendApiResponse<T[]>;
      if (!body?.success) throw new Error(body.error || 'Request failed');
      const rawMeta = body.meta;
      return {
        items: body.data ?? [],
        meta: rawMeta
          ? { page: rawMeta.page ?? 1, pageSize: rawMeta.pageSize ?? 20, total: rawMeta.total ?? 0, totalPages: rawMeta.totalPages ?? 1 }
          : null,
      };
    })
    .catch((err) => {
      perfLog('GET', url, start, 'ERROR');
      throw err;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
}

/** Cancel inflight dedup entries matching a URL prefix (useful for search cancellation). */
export function cancelInflight(urlPrefix: string): void {
  for (const [key] of inflight) {
    if (key.includes(urlPrefix)) {
      inflight.delete(key);
    }
  }
}