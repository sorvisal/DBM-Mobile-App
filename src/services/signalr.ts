import * as signalR from "@microsoft/signalr";
import { AppState } from "react-native";
import {
  API_ORIGIN,
  getAccessToken,
  onAccessTokenChanged,
  restoreAccessToken,
} from "@/services/http";

/**
 * Reusable Notification SignalR service (singleton).
 *
 * Connects to the backend NotificationsHub (outside /api/v1), authenticates
 * with the JWT via accessTokenFactory (never logged), reconnects
 * automatically, stops cleanly, avoids duplicate connections, and never
 * crashes the app on connection errors.
 *
 * Error strategy:
 * - 401 / unauthorized: stop retrying, log a single warning, and wait for a
 *   fresh access token (login / token refresh) or the app returning to the
 *   foreground before resuming.
 * - Network / transport errors: retry with a capped exponential backoff.
 * - The app keeps working normally even if SignalR is unavailable.
 */

export const NOTIFICATION_HUB_URL = `${API_ORIGIN}/hubs/notifications`;

const HUB_LOG_PREFIX = "[SignalR:notifications]";

const RETRY_BASE_MS = 5_000;
const RETRY_MAX_MS = 60_000;

type NotificationEventName =
  | "newNotification"
  | "unreadCountChanged"
  | "notificationRead"
  | "notificationsReadAll"
  | "notificationDeleted";

type ListenerCallback<T> = (payload: T) => void;

type ReconnectedCallback = () => void;

/**
 * Payloads are intentionally `unknown`: the SignalR payload shape is owned by
 * the backend, and the consuming layer (useNotifications hook) parses them
 * with type guards instead of this service guessing at property names.
 */
const EVENT_LISTENERS: {
  key: NotificationEventName;
  listeners: Set<(payload: unknown) => void>;
}[] = [
  { key: "newNotification", listeners: new Set() },
  { key: "unreadCountChanged", listeners: new Set() },
  { key: "notificationRead", listeners: new Set() },
  { key: "notificationsReadAll", listeners: new Set() },
  { key: "notificationDeleted", listeners: new Set() },
];

const reconnectedListeners = new Set<ReconnectedCallback>();

function getListenerSet(key: NotificationEventName): Set<(payload: unknown) => void> {
  const spec = EVENT_LISTENERS.find((item) => item.key === key);
  if (!spec) throw new Error(`Unknown notification event: ${key}`);
  return spec.listeners;
}

let connection: signalR.HubConnection | null = null;
let wishToRun = false;
let hasAppStateListener = false;
let hasAccessTokenListener = false;
let unauthorizedPaused = false;
let lastLoggedNoToken = false;
let consecutiveFailures = 0;
let restartTimer: ReturnType<typeof setTimeout> | null = null;

function devLog(message: string): void {
  if (__DEV__) console.log(`${HUB_LOG_PREFIX} ${message}`);
}

function devWarn(message: string, error?: unknown): void {
  if (__DEV__) {
    if (error !== undefined) {
      const detail = error instanceof Error ? error.message : String(error);
      console.warn(`${HUB_LOG_PREFIX} ${message} ${detail}`);
    } else {
      console.warn(`${HUB_LOG_PREFIX} ${message}`);
    }
  }
}

function devError(message: string, error?: unknown): void {
  if (__DEV__) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`${HUB_LOG_PREFIX} ${message} ${detail}`);
  }
}

/**
 * Detects an authentication failure from a SignalR thrown error. SignalR
 * surfaces these as e.g. "Failed to complete negotiation with the server:
 * unauthorized: Status code '401'".
 */
function isUnauthorizedError(error: unknown): boolean {
  if (error == null) return false;
  const text = error instanceof Error ? error.message : String(error);
  return /401|unauthorized/i.test(text);
}

/** Decodes the JWT `exp` claim (ms). Returns null when it cannot be read. */
function jwtExpiryMs(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const b64url = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64url.padEnd(Math.ceil(b64url.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** True when a token is present and not already expired. Never logged. */
function isAccessTokenValid(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  const expiry = jwtExpiryMs(token);
  if (expiry === null) return true; // no exp claim — assume valid
  return expiry > Date.now();
}

function clearScheduledRestart(): void {
  if (restartTimer !== null) {
    clearTimeout(restartTimer);
    restartTimer = null;
  }
}

/**
 * Pauses the connection on 401. Logs once per pause, cancels any pending
 * restart, and stops the library's own reconnect loop so it never hammers
 * the server. Resumed by handleAccessTokenChanged or app foreground.
 */
function pauseForUnauthorized(): void {
  if (unauthorizedPaused) return;
  unauthorizedPaused = true;
  devWarn("Unauthorized. Waiting for valid authentication.");
  clearScheduledRestart();

  const current = connection;
  if (
    current &&
    current.state !== signalR.HubConnectionState.Disconnected &&
    current.state !== signalR.HubConnectionState.Disconnecting
  ) {
    current.stop().catch(() => {
      // Best-effort stop; onclose will fire and stay paused.
    });
  }
}

/** Controlled restart with capped exponential backoff. */
function scheduleRestart(): void {
  if (!wishToRun || unauthorizedPaused || !isAccessTokenValid()) return;
  clearScheduledRestart();

  const backoff = Math.min(
    RETRY_MAX_MS,
    RETRY_BASE_MS * 2 ** Math.min(consecutiveFailures, 4)
  );

  restartTimer = setTimeout(() => {
    restartTimer = null;
    if (!wishToRun || unauthorizedPaused || !isAccessTokenValid()) return;
    startNotificationSignalR().catch(() => {
      // Restart attempts are fully handled inside startNotificationSignalR.
    });
  }, backoff);
}

/** Executed when the in-memory access token changes (login / refresh / logout). */
function handleAccessTokenChanged(): void {
  if (!wishToRun) return;

  if (!getAccessToken()) {
    // Token removed (logout). Stop a live connection so it does not linger.
    lastLoggedNoToken = true;
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      connection.stop().catch(() => {
        // Best-effort stop.
      });
    }
    return;
  }

  lastLoggedNoToken = false;
  if (unauthorizedPaused) {
    unauthorizedPaused = false;
    devLog("Access token refreshed. Resuming connection.");
  }
  startNotificationSignalR().catch(() => {
    // Connection errors are handled inside startNotificationSignalR.
  });
}

function dispatch(eventName: NotificationEventName, payload: unknown): void {
  const set = getListenerSet(eventName);
  for (const listener of set) {
    try {
      listener(payload);
    } catch (error) {
      devError(`listener for "${eventName}" failed:`, error);
    }
  }
}

function buildConnection(): signalR.HubConnection {
  const built = new signalR.HubConnectionBuilder()
    .withUrl(NOTIFICATION_HUB_URL, {
      // Reads the current in-memory JWT on every (re)connect — never caches
      // a stale token. The token is refreshed from storage before start.
      accessTokenFactory: () => getAccessToken() ?? "",
    })
    .withAutomaticReconnect([0, 2_000, 5_000, 10_000, 30_000])
    .configureLogging(signalR.LogLevel.Error)
    .build();

  built.on("newNotification", (payload: unknown) =>
    dispatch("newNotification", payload)
  );
  built.on("unreadCountChanged", (payload: unknown) =>
    dispatch("unreadCountChanged", payload)
  );
  built.on("notificationRead", (payload: unknown) =>
    dispatch("notificationRead", payload)
  );
  built.on("notificationsReadAll", () =>
    dispatch("notificationsReadAll", undefined)
  );
  built.on("notificationDeleted", (payload: unknown) =>
    dispatch("notificationDeleted", payload)
  );

  built.onreconnecting((error?: Error) => {
    // An auth failure surfaced mid-reconnect — stop the retry loop now.
    if (error && isUnauthorizedError(error)) {
      pauseForUnauthorized();
      return;
    }
    if (!unauthorizedPaused) {
      devLog("reconnecting...");
    }
  });
  built.onreconnected((_connectionId?: string) => {
    unauthorizedPaused = false;
    consecutiveFailures = 0;
    lastLoggedNoToken = false;
    devLog("reconnected");
    for (const listener of reconnectedListeners) {
      try {
        listener();
      } catch (error) {
        devError("reconnected listener failed:", error);
      }
    }
  });
  built.onclose((error?: Error) => {
    // Auth failures: stay paused and wait for a valid token.
    if (error && isUnauthorizedError(error)) {
      pauseForUnauthorized();
      return;
    }
    if (error) {
      devWarn("closed with error:", error);
    } else {
      devLog("closed");
    }
    // Automatic reconnect was exhausted; retry with controlled backoff.
    consecutiveFailures += 1;
    scheduleRestart();
  });

  return built;
}

/**
 * Starts the notification SignalR connection. Safe to call repeatedly —
 * it never creates duplicate connections.
 */
export async function startNotificationSignalR(): Promise<void> {
  wishToRun = true;

  // A cold module reload can leave the in-memory token empty; restore it
  // from storage before deciding whether to connect.
  if (!getAccessToken()) {
    await restoreAccessToken();
  }

  if (!isAccessTokenValid()) {
    // Do not connect (or reconnect) without a valid token, and do not
    // repeatedly hammer negotiation with an expired token.
    if (!lastLoggedNoToken) {
      lastLoggedNoToken = true;
      devWarn("Skipping connection: no valid access token.");
    }
    return;
  }
  lastLoggedNoToken = false;

  if (unauthorizedPaused) {
    devLog("Waiting for valid authentication before reconnecting.");
    return;
  }

  if (!connection) {
    connection = buildConnection();
  }

  const state = connection.state;

  if (
    state === signalR.HubConnectionState.Connected ||
    state === signalR.HubConnectionState.Connecting ||
    state === signalR.HubConnectionState.Reconnecting
  ) {
    return;
  }

  try {
    await connection.start();
    consecutiveFailures = 0;
    unauthorizedPaused = false;
    devLog("connected");
  } catch (error) {
    if (isUnauthorizedError(error)) {
      pauseForUnauthorized();
      return;
    }
    consecutiveFailures += 1;
    devWarn("connection failed; will retry:", error);
    scheduleRestart();
  }
}

/**
 * Stops the notification SignalR connection cleanly. Idempotent.
 */
export async function stopNotificationSignalR(): Promise<void> {
  wishToRun = false;
  clearScheduledRestart();

  const current = connection;
  if (!current) return;

  try {
    if (
      current.state !== signalR.HubConnectionState.Disconnected &&
      current.state !== signalR.HubConnectionState.Disconnecting
    ) {
      await current.stop();
    }
  } catch (error) {
    devWarn("stop failed:", error);
  } finally {
    connection = null;
  }
}

/**
 * Registers a listener for the `newNotification` event.
 * Returns an unsubscribe function.
 */
export function onNewNotification(callback: ListenerCallback<unknown>): () => void {
  return subscribe("newNotification", callback);
}

export function offNewNotification(callback: ListenerCallback<unknown>): void {
  unsubscribe("newNotification", callback);
}

export function onUnreadCountChanged(callback: ListenerCallback<unknown>): () => void {
  return subscribe("unreadCountChanged", callback);
}

export function offUnreadCountChanged(callback: ListenerCallback<unknown>): void {
  unsubscribe("unreadCountChanged", callback);
}

export function onNotificationRead(callback: ListenerCallback<unknown>): () => void {
  return subscribe("notificationRead", callback);
}

export function offNotificationRead(callback: ListenerCallback<unknown>): void {
  unsubscribe("notificationRead", callback);
}

export function onNotificationsReadAll(callback: () => void): () => void {
  return subscribe("notificationsReadAll", callback);
}

export function offNotificationsReadAll(callback: () => void): void {
  unsubscribe("notificationsReadAll", callback);
}

export function onNotificationDeleted(callback: ListenerCallback<unknown>): () => void {
  return subscribe("notificationDeleted", callback);
}

export function offNotificationDeleted(callback: ListenerCallback<unknown>): void {
  unsubscribe("notificationDeleted", callback);
}

function subscribe(
  key: NotificationEventName,
  callback: (payload: unknown) => void
): () => void {
  const set = getListenerSet(key);
  set.add(callback);
  return () => {
    set.delete(callback);
  };
}

function unsubscribe(
  key: NotificationEventName,
  callback: (payload: unknown) => void
): void {
  const set = getListenerSet(key);
  set.delete(callback);
}

/**
 * Registers a callback that runs whenever the connection successfully
 * reconnects (including the initial connect). Returns an unsubscribe function.
 */
export function onReconnected(callback: ReconnectedCallback): () => void {
  reconnectedListeners.add(callback);
  return () => {
    reconnectedListeners.delete(callback);
  };
}

/**
 * Reacts to the app returning to the foreground by restarting the connection
 * if it dropped. Registered once.
 */
function ensureAppStateListener(): void {
  if (hasAppStateListener) return;
  hasAppStateListener = true;

  AppState.addEventListener("change", (nextState) => {
    if (nextState !== "active") return;
    if (!wishToRun) return;
    if (unauthorizedPaused) return;
    if (!isAccessTokenValid()) return;
    if (!connection) return;
    if (connection.state === signalR.HubConnectionState.Disconnected) {
      startNotificationSignalR().catch(() => {
        // Connection errors are handled inside startNotificationSignalR.
      });
    }
  });
}

/** Registered once — resumes the connection once valid auth is available. */
function ensureAccessTokenListener(): void {
  if (hasAccessTokenListener) return;
  hasAccessTokenListener = true;
  onAccessTokenChanged(handleAccessTokenChanged);
}

ensureAppStateListener();
ensureAccessTokenListener();