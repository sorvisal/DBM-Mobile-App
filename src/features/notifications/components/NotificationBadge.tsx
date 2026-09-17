import { Text, View } from "react-native";
import { typography } from "@/theme";

/**
 * Red unread-count badge for the notification bell.
 *
 * - count <= 0  -> rendered as nothing (callers should not render at all)
 * - count 1..9  -> "1", "5", ...
 * - count 10+   -> "9+"
 * - count 100+  -> "99+"
 */
export function NotificationBadge({ count }: { count: number }) {
  if (!Number.isFinite(count) || count <= 0) return null;

  const label = count > 99 ? "99+" : count > 9 ? "9+" : String(count);

  return (
    <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 items-center justify-center px-[4px] border-2 border-white">
      <Text
        className="text-white font-khmerBold"
        maxFontSizeMultiplier={typography.maxFontSizeMultiplier}
        style={{
          fontSize: 10,
          lineHeight: 12,
        }}
      >
        {label}
      </Text>
    </View>
  );
}