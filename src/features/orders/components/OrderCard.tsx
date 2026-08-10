import { useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { Order, OrderStatus } from "../types/types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { deleteOrder } from "../hooks/useOrderList";

type OrderCardProps = {
  order: Order;
  onPress: () => void;
};

function DeleteAction({ progress, orderId }: { progress: Animated.AnimatedInterpolation<number>; orderId: string }) {
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <TouchableOpacity
      onPress={() => deleteOrder(orderId)}
      className="bg-red-500 rounded-2xl mb-3 ml-2 items-center justify-center"
      style={{ width: 72 }}
    >
      <Animated.View style={{ transform: [{ scale }] }} className="items-center">
        <Ionicons name="trash-outline" size={20} color="white" />
        <Text className="font-khmer text-white text-[10px] mt-1">លុប</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const isCancelled = order.status === OrderStatus.Cancelled;

  const cardContent = (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl p-3 mb-3"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      <View className="w-11 h-11 rounded-xl bg-blue-50 items-center justify-center">
        <Ionicons name="receipt-outline" size={26} color="#2563EB" />
      </View>

      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-khmerMedium text-gray-900 text-xl" numberOfLines={1}>
            {order.code}
          </Text>
          <OrderStatusBadge status={order.status} />
        </View>
        <Text className="font-khmerMedium text-gray-400 text-[17px] mt-1" numberOfLines={1}>
          {order.customer.name}
        </Text>
        <View className="flex-row items-center justify-between mt-1.5">
          <Text className="font-khmer text-gray-400 text-[15px]">{order.createdAt}</Text>
          <Text className="font-khmerBold text-gray-900 text-xl">${order.total.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!isCancelled) {
    return cardContent;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={(progress) => <DeleteAction progress={progress} orderId={order.id} />}
      overshootRight={false}
    >
      {cardContent}
    </Swipeable>
  );
}