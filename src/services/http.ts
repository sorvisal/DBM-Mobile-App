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

export function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^(blob|data):/i.test(path)) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${rawBase}/uploads/${path}`;
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
      if (__DEV__) console.log('[API] TOKEN REFRESH');
      const stored = await getTokens();
      if (!stored?.refreshToken) throw new Error('No refresh token');

      const resp = await client.post<{ accessToken: string; refreshToken: string }>(
        '/auth/refresh',
        { refreshToken: stored.refreshToken },
      );
      const newTokens = resp.data;
      accessToken = newTokens.accessToken;
      await setTokens(newTokens);
      if (__DEV__) console.log('[API] TOKEN REFRESH OK');
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
      if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/register')) {
        // Auth URLs — finish loading then reject
        if (shouldTrackLoading(original)) finishLoading();
        return Promise.reject(error);
      }
      try {
        await doRefresh();
        original._retry = true;
        // Retry fires a new request — loading already counted on first attempt.
        // The retry's request interceptor sees _retry=true and skips startLoading(),
        // and the retry's response interceptor will call finishLoading().
        return client.request(original);
      } catch {
        // Refresh failed — finish loading for this request
        finishLoading();
        return Promise.reject(error);
      }
    }

    // Non-401 error — finish loading
    if (shouldTrackLoading(original)) {
      finishLoading();
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
