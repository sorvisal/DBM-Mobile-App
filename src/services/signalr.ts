import * as signalR from "@microsoft/signalr";
import { AppState } from "react-native";
import { API_ORIGIN, getAccessToken } from "@/services/http";

/**
 * Reusable Notification SignalR service (singleton).
 *
 * Connects to the backend NotificationsHub (outside /api/v1), authenticates
 * with the JWT via accessTokenFactory (never logged), reconnects
 * automatically, stops cleanly, avoids duplicate connections, and never
 * crashes the app on connection errors.
 */

export const NOTIFICATION_HUB_URL = `${API_ORIGIN}/hubs/notifications`;

const HUB_LOG_PREFIX = "[SignalR:notifications]";

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

function devLog(message: string): void {
  if (__DEV__) console.log(`${HUB_LOG_PREFIX} ${message}`);
}

function devError(message: string, error?: unknown): void {
  if (__DEV__) {
    const detail = error instanceof Error ? error.message : String(error);
    console.log(`${HUB_LOG_PREFIX} ${message} ${detail}`);
  }
}

function handleError(error: unknown): void {
  if (__DEV__) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`${HUB_LOG_PREFIX} connection error: ${message}`);
  }
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
      // Authenticate with the existing in-memory JWT (never logged).
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

  built.onreconnecting(() => devLog("reconnecting..."));
  built.onreconnected(() => {
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
    if (error) devError("closed with error:", error);
    else devLog("closed");
    if (wishToRun && connection === built) {
      // Automatic reconnect was exhausted; restart after a short delay so the
      // connection recovers when the backend/network comes back.
      setTimeout(() => {
        if (wishToRun && connection === built) {
          startNotificationSignalR().catch((restartError) =>
            devError("restart failed:", restartError)
          );
        }
      }, 10_000);
    }
  });

  return built;
}

/**
 * Starts the notification SignalR connection. Safe to call repeatedly —
 * it never creates duplicate connections.
 */
export async function startNotificationSignalR(): Promise<void> {
  wishToRun = true;

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
    devLog("connected");
  } catch (error) {
    handleError(error);
    wishToRun = true; // allow retry later, but keep from spamming every start call
    throw error;
  }
}

/**
 * Stops the notification SignalR connection cleanly. Idempotent.
 */
export async function stopNotificationSignalR(): Promise<void> {
  wishToRun = false;

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
    devError("stop failed:", error);
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
    if (!connection) return;
    if (connection.state === signalR.HubConnectionState.Disconnected) {
      startNotificationSignalR().catch((error) => devError("foreground restart failed:", error));
    }
  });
}

ensureAppStateListener();