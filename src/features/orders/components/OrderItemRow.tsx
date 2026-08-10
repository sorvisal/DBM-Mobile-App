import { View, Text, Image } from "react-native";
import { OrderItem } from "../types/types";

type OrderItemRowProps = {
  item: OrderItem;
};

export function OrderItemRow({ item }: OrderItemRowProps) {
  return (
    <View className="flex-row items-center py-2.5">
      <Image source={{ uri: item.imageUrl }} className="w-12 h-12 rounded-xl bg-gray-100" />
      <View className="flex-1 ml-3">
        <View className="flex-row items-center">
          <Text className="font-khmerMedium text-gray-900 text-xl flex-1" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="font-khmer text-gray-400 text-xl mr-2">x{item.quantity}</Text>
        </View>
        <Text className="font-khmer text-gray-400 text-xl mt-0.5">${item.price.toFixed(2)}</Text>
      </View>
      <Text className="font-khmerBold text-gray-900 text-xl">
        ${(item.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  );
}