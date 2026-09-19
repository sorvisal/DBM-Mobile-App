import { useEffect, useState } from "react";
import { api } from "@/services/api";
import {
  startNotificationSignalR,
  stopNotificationSignalR,
  onNewNotification,
  onUnreadCountChanged,
  onNotificationRead,
  onNotificationsReadAll,
  onNotificationDeleted,
  onReconnected,
} from "@/services/signalr";
import {
  parseNotificationIdPayload,
  parseNotificationPayload,
  parseUnreadCountPayload,
} from "../types/notification.types";
import type { Notification } from "../types/notification.types";

/**
 * Notifications store — a module-level singleton.
 *
 * Any number of components can call `useNotifications()`; they all share the
 * same state, the same API loads and the same single SignalR subscription.
 * This guarantees no duplicate connections, no duplicate fetches and no
 * listeners left behind when a component unmounts.
 */

export type NotificationsState = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
};

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isRefreshing: false,
  error: null,
};

let state: NotificationsState = initialState;
const stateListeners = new Set<() => void>();
let requestVersion = 0;
let loadedOnce = false;

function setState(partial: Partial<NotificationsState>): void {
  state = { ...state, ...partial };
  stateListeners.forEach((listener) => listener());
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return String(error);
}

/* ── Data loading ── */

export async function loadNotifications(): Promise<void> {
  if (state.isRefreshing) return;

  const version = ++requestVersion;

  setState({
    isLoading: state.notifications.length === 0,
    error: null,
  });

  try {
    const [listResult, unreadCount] = await Promise.all([
      api.notifications.list(),
      api.notifications.count(),
    ]);

    if (version !== requestVersion) return;

    setState({
      notifications: listResult.items,
      unreadCount,
      isLoading: false,
      isRefreshing: false,
      error: null,
    });
    loadedOnce = true;
  } catch (error) {
    if (version !== requestVersion) return;

    setState({
      isLoading: false,
      isRefreshing: false,
      error: errorMessage(error),
    });
  }
}

export async function refreshNotifications(): Promise<void> {
  if (state.isRefreshing) return;

  const version = ++requestVersion;

  setState({ isRefreshing: true, error: null });

  try {
    const [listResult, unreadCount] = await Promise.all([
      api.notifications.list(),
      api.notifications.count(),
    ]);

    if (version !== requestVersion) return;

    setState({
      notifications: listResult.items,
      unreadCount,
      isRefreshing: false,
      error: null,
    });
    loadedOnce = true;
  } catch (error) {
    if (version !== requestVersion) return;

    setState({
      isRefreshing: false,
      error: errorMessage(error),
    });
  }
}

/* ── Actions ── */

export async function markAsRead(id: string): Promise<void> {
  const target = state.notifications.find((n) => n.id === id);
  if (!target || target.read) return;

  const previousNotifications = state.notifications;
  const previousUnreadCount = state.unreadCount;

  setState({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  });

  try {
    await api.notifications.markRead(id);
  } catch (error) {
    setState({
      notifications: previousNotifications,
      unreadCount: previousUnreadCount,
    });
    throw error;
  }
}

export async function markAllAsRead(): Promise<void> {
  if (state.unreadCount === 0) return;

  const previousNotifications = state.notifications;
  const previousUnreadCount = state.unreadCount;

  setState({
    notifications: state.notifications.map((n) =>
      n.read ? n : { ...n, read: true }
    ),
    unreadCount: 0,
  });

  try {
    await api.notifications.markAllRead();
  } catch (error) {
    setState({
      notifications: previousNotifications,
      unreadCount: previousUnreadCount,
    });
    throw error;
  }
}

export async function deleteNotification(id: string): Promise<void> {
  const target = state.notifications.find((n) => n.id === id);
  if (!target) return;

  const previousNotifications = state.notifications;
  const previousUnreadCount = state.unreadCount;
  const wasUnread = !target.read;

  setState({
    notifications: state.notifications.filter((n) => n.id !== id),
    unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
  });

  try {
    await api.notifications.delete(id);
  } catch (error) {
    setState({
      notifications: previousNotifications,
      unreadCount: previousUnreadCount,
    });
    throw error;
  }
}

/* ── Real-time events ── */

function handleNewNotification(payload: unknown): void {
  const notification = parseNotificationPayload(payload);
  if (!notification) return;

  setState({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1,
    error: null,
  });
}

function handleUnreadCountChanged(payload: unknown): void {
  const unreadCount = parseUnreadCountPayload(payload);
  if (unreadCount === null) return;

  setState({ unreadCount });
}

function handleNotificationRead(payload: unknown): void {
  const id = parseNotificationIdPayload(payload);
  if (!id) return;

  let decremented = false;

  const notifications = state.notifications.map((n) => {
    if (n.id !== id) return n;
    if (!n.read) decremented = true;
    return n.read ? n : { ...n, read: true };
  });

  setState({
    notifications,
    unreadCount: decremented
      ? Math.max(0, state.unreadCount - 1)
      : state.unreadCount,
  });
}

function handleNotificationsReadAll(): void {
  setState({
    notifications: state.notifications.map((n) =>
      n.read ? n : { ...n, read: true }
    ),
    unreadCount: 0,
  });
}

function handleNotificationDeleted(payload: unknown): void {
  const id = parseNotificationIdPayload(payload);
  if (!id) return;

  const target = state.notifications.find((n) => n.id === id);
  if (!target) return;

  setState({
    notifications: state.notifications.filter((n) => n.id !== id),
    unreadCount: target.read
      ? state.unreadCount
      : Math.max(0, state.unreadCount - 1),
  });
}

function handleReconnected(): void {
  // The connection dropped and came back; re-sync with the server.
  refreshNotifications().catch(() => {});
}

// Register SignalR listeners exactly once (module scope), so re-mounting the
// app tree never stacks duplicate handlers.
onNewNotification(handleNewNotification);
onUnreadCountChanged(handleUnreadCountChanged);
onNotificationRead(handleNotificationRead);
onNotificationsReadAll(handleNotificationsReadAll);
onNotificationDeleted(handleNotificationDeleted);
onReconnected(handleReconnected);

/* ── Service lifecycle ── */

/**
 * Starts the notification service: connects SignalR and loads the initial
 * list + unread count. Safe to call multiple times.
 */
export async function startNotificationService(): Promise<void> {
  try {
    await startNotificationSignalR();
  } catch (error) {
    // Connection errors must never crash the app.
    if (__DEV__) {
      console.warn(
        "[SignalR:notifications] start failed:",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  if (!loadedOnce) {
    await loadNotifications().catch((error) => {
      // loadNotifications records the error in state; only log the failure.
      if (__DEV__) {
        console.warn("[Notifications] initial load failed:", String(error));
      }
    });
  }
}

/**
 * Stops the notification service (SignalR connection is stopped cleanly).
 * Idempotent. Called on logout / app teardown.
 */
export async function stopNotificationService(): Promise<void> {
  await stopNotificationSignalR();
}

/* ── React hook ── */

export function useNotifications(): NotificationsState {
  const [snapshot, setSnapshot] = useState<NotificationsState>(state);

  useEffect(() => {
    const listener = () => setSnapshot(state);
    listener();
    stateListeners.add(listener);
    return () => {
      stateListeners.delete(listener);
    };
  }, []);

  return snapshot;
}