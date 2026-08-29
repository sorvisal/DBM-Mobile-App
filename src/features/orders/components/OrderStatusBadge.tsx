import { View, Text } from "react-native";
import { STATUS_LABELS, STATUS_COLORS, normalizeOrderStatus } from "../constants/order.constants";

type OrderStatusBadgeProps = {
  status: string | undefined;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const normalized = normalizeOrderStatus(status);
  const tone = STATUS_COLORS[normalized] ?? STATUS_COLORS.pending;

  return (
    <View className={`${tone.bg} rounded-full px-2.5 py-1 self-start`}>
      <Text className={`font-khmerBold text-[14px] ${tone.text}`} numberOfLines={1} allowFontScaling={false}>
        {STATUS_LABELS[normalized]}
      </Text>
    </View>
  );
}