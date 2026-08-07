import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Order }  from "../types/types";
import { OrderStatusBadge } from "./OrderStatusBadge";

type OrderCardProps = {
  order: Order;
  onPress: () => void;
};

export function OrderCard({ order, onPress }: OrderCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl p-3 mb-3"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      <View className="w-11 h-11 rounded-xl bg-blue-50 items-center justify-center">
        <Ionicons name="receipt-outline" size={20} color="#2563EB" />
      </View>

      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-khmerMedium text-gray-900 text-sm" numberOfLines={1}>
            {order.code}
          </Text>
          <OrderStatusBadge status={order.status} />
        </View>
        <Text className="font-khmer text-gray-400 text-[11px] mt-1" numberOfLines={1}>
          {order.customer.name}
        </Text>
        <View className="flex-row items-center justify-between mt-1.5">
          <Text className="font-khmer text-gray-400 text-[11px]">{order.createdAt}</Text>
          <Text className="font-khmerBold text-gray-900 text-sm">${order.total.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}