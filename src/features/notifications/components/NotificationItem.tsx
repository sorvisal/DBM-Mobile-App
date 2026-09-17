import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/theme";
import type { Notification } from "../types/notification.types";
import {
  notificationIcon,
  notificationIconBackground,
  notificationIconColor,
} from "../types/notification.types";

export function formatRelativeTime(value: string): string {
  const date = new Date(value);
  const parsed = date.getTime();
  if (!Number.isFinite(parsed)) return "";

  const now = Date.now();
  const diffSeconds = Math.max(0, Math.floor((now - parsed) / 1000));

  if (diffSeconds < 60) return "ឥឡូវនេះ";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} នាទីមុន`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} ម៉ោងមុន`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ថ្ងៃមុន`;

  return date.toLocaleDateString();
}

type NotificationItemProps = {
  notification: Notification;
  onPress: () => void;
  onDelete?: () => void;
};

export function NotificationItem({
  notification,
  onPress,
  onDelete,
}: NotificationItemProps) {
  const unread = !notification.read;
  const icon = notificationIcon(notification.type);
  const iconColor = notificationIconColor(notification.type);
  const iconBackground = notificationIconBackground(notification.type);
  const timeLabel = formatRelativeTime(notification.createdAt);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`px-4 py-3 flex-row items-start border-b border-gray-100 ${
        unread ? "bg-blue-50/70" : "bg-white"
      }`}
      style={styles.row}
    >
      {/* Icon */}
      <View
        className={`w-11 h-11 rounded-full items-center justify-center ${iconBackground}`}
      >
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={22} color={iconColor} />
      </View>

      {/* Content */}
      <View className="flex-1 ml-3 pr-1">
        <Text
          className={`font-khmerBold text-gray-900 text-xl ${unread ? "" : "opacity-80"}`}
          numberOfLines={1}
          maxFontSizeMultiplier={typography.maxFontSizeMultiplier}
        >
          {notification.title || "ការជូនដំណឹង"}
        </Text>

        {notification.body ? (
          <Text
            className="font-khmer text-gray-600 text-lg mt-0.5 leading-relaxed"
            numberOfLines={2}
            maxFontSizeMultiplier={typography.maxFontSizeMultiplier}
          >
            {notification.body}
          </Text>
        ) : null}

        <Text
          className="font-khmer text-gray-400 text-sm mt-1"
          maxFontSizeMultiplier={typography.maxFontSizeMultiplier}
        >
          {timeLabel}
        </Text>
      </View>

      {/* Right column: unread dot + delete */}
      <View className="items-end justify-between self-stretch py-0.5 ml-1">
        <View
          className={`w-2.5 h-2.5 rounded-full ${
            unread ? "bg-blue-600" : "bg-gray-200"
          }`}
        />

        {onDelete ? (
          <TouchableOpacity
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Delete notification"
          >
            <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 18 }} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 76,
  },
});