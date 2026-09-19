export { NotificationScreen } from "./screens/NotificationScreen";
export { NotificationItem, formatRelativeTime } from "./components/NotificationItem";
export { NotificationBadge } from "./components/NotificationBadge";
export {
  useNotifications,
  loadNotifications,
  refreshNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  startNotificationService,
  stopNotificationService,
} from "./hooks/useNotifications";
export type { NotificationsState } from "./hooks/useNotifications";
export type {
  Notification,
  NotificationType,
  NotificationTarget,
} from "./types/notification.types";
export {
  notificationIcon,
  notificationIconColor,
  notificationIconBackground,
  parseNotificationPayload,
  parseUnreadCountPayload,
  parseNotificationIdPayload,
  resolveNotificationTarget,
  NOTIFICATION_TYPES,
} from "./types/notification.types";