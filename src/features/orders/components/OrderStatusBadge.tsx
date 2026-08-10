import { View, Text } from "react-native";
import { OrderStatus }  from "../types/types";
import { STATUS_LABELS, STATUS_COLORS } from "../constants/order.constants";

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const tone = STATUS_COLORS[status];

  return (
    <View className={`${tone.bg} rounded-full px-2.5 py-1 self-start`}>
      <Text className={`font-khmerBold text-[16px] ${tone.text}`}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}