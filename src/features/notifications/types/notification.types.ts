import type { AppNotification } from "@/types/api";
import { resolveNotificationType } from "@/types/api";

/**
 * Notification domain types for the mobile app.
 *
 * Field names mirror the backend Notification DTO already consumed by the
 * existing API layer (`BackendNotificationDto` in src/services/api.ts):
 *   { id, userId, title, body, isRead, createdAt }
 * which is mapped to `AppNotification` via `mapNotification`.
 */

export type NotificationType = AppNotification["type"];

export type Notification = AppNotification;

export const NOTIFICATION_TYPES: readonly NotificationType[] = [
  "order",
  "stock",
  "payment",
  "debt",
  "customer",
  "system",
] as const;

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  order: "cart-outline",
  stock: "cube-outline",
  payment: "card-outline",
  debt: "wallet-outline",
  customer: "people-outline",
  system: "notifications-outline",
};

const NOTIFICATION_ICON_COLORS: Record<NotificationType, string> = {
  order: "#2563EB",
  stock: "#D97706",
  payment: "#16A34A",
  debt: "#DC2626",
  customer: "#7C3AED",
  system: "#6B7280",
};

const NOTIFICATION_ICON_BACKGROUNDS: Record<NotificationType, string> = {
  order: "bg-blue-50",
  stock: "bg-amber-50",
  payment: "bg-green-50",
  debt: "bg-red-50",
  customer: "bg-purple-50",
  system: "bg-gray-100",
};

export function notificationIcon(type: NotificationType): string {
  return NOTIFICATION_ICONS[type] ?? NOTIFICATION_ICONS.system;
}

export function notificationIconColor(type: NotificationType): string {
  return NOTIFICATION_ICON_COLORS[type] ?? NOTIFICATION_ICON_COLORS.system;
}

export function notificationIconBackground(type: NotificationType): string {
  return (
    NOTIFICATION_ICON_BACKGROUNDS[type] ??
    NOTIFICATION_ICON_BACKGROUNDS.system
  );
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/**
 * Parses a raw SignalR `newNotification` payload into a `Notification`.
 *
 * Accepts the backend Notification DTO directly
 * ({ id, title, body, isRead, createdAt }) and, defensively, an object that
 * wraps the notification at `notification`/`data`. Returns null when the
 * payload cannot be parsed so events never crash the app.
 */
export function parseNotificationPayload(payload: unknown): Notification | null {
  const raw = asRecord(payload);
  if (!raw) return null;

  const payloadNotification = asRecord(raw.notification) ?? asRecord(raw.data);
  const source = payloadNotification ?? raw;

  const idValue = source.id ?? source.notificationId;
  const id = idValue === undefined || idValue === null ? null : String(idValue);
  if (!id) return null;

  const title = asString(source.title) ?? "";
  const body = asString(source.body) ?? asString(source.message) ?? "";

  const isRead =
    asBoolean(source.isRead) ??
    asBoolean(source.read) ??
    false;

  const createdAt =
    asString(source.createdAt) ?? new Date().toISOString();

  const entityType =
    asString(source.entityType) ?? asString(source.entity_type) ?? null;

  const entityIdValue = source.entityId ?? source.entity_id;
  const entityId =
    entityIdValue === undefined || entityIdValue === null
      ? null
      : String(entityIdValue);

  return {
    id,
    type: resolveNotificationType(entityType, title, body),
    title,
    body,
    read: isRead,
    createdAt,
    entityType,
    entityId,
  };
}

/** A deep-link target derived from a notification's entity metadata. */
export type NotificationTarget =
  | { tab: "orders"; kind: "order"; id: string }
  | { tab: "customers"; kind: "customer"; id: string }
  | { tab: "income"; kind: "debt"; id: string }
  | { tab: "stock"; kind: "product"; id: string };

/**
 * Maps a notification to the screen it should open. Returns null for
 * notifications without entity metadata (e.g. older records), which callers
 * should handle gracefully instead of navigating.
 */
export function resolveNotificationTarget(
  notification: Notification
): NotificationTarget | null {
  const { entityType, entityId } = notification;
  if (!entityType || !entityId) return null;

  switch (entityType.toLowerCase()) {
    case "order":
      return { tab: "orders", kind: "order", id: entityId };
    case "customer":
      return { tab: "customers", kind: "customer", id: entityId };
    case "debt":
      return { tab: "income", kind: "debt", id: entityId };
    case "product":
      return { tab: "stock", kind: "product", id: entityId };
    default:
      return null;
  }
}

/**
 * Parses a raw SignalR `unreadCountChanged` payload (number, numeric string,
 * or `{ count }`/`{ unreadCount }`) into a non-negative integer, or null.
 */
export function parseUnreadCountPayload(payload: unknown): number | null {
  if (typeof payload === "number") {
    return Number.isFinite(payload) ? Math.max(0, Math.floor(payload)) : null;
  }
  if (typeof payload === "string") {
    const value = Number(payload);
    return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : null;
  }
  const raw = asRecord(payload);
  if (!raw) return null;
  const value = raw.count ?? raw.unreadCount;
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : null;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : null;
  }
  return null;
}

/**
 * Parses a raw SignalR `notificationRead` / `notificationDeleted` payload into
 * a notification id string, or null. Accepts the id itself or an object
 * containing `id`/`notificationId`.
 */
export function parseNotificationIdPayload(payload: unknown): string | null {
  if (typeof payload === "string" || typeof payload === "number") {
    return String(payload);
  }
  const raw = asRecord(payload);
  if (!raw) return null;
  const value = raw.id ?? raw.notificationId;
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return null;
}