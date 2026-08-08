import { View, Text, Image } from "react-native";
import { OrderItem }  from "../types/types";

type OrderItemRowProps = {
  item: OrderItem;
};

export function OrderItemRow({ item }: OrderItemRowProps) {
  return (
    <View className="flex-row items-center py-2">
      <Image source={{ uri: item.imageUrl }} className="w-14 h-14 rounded-lg bg-gray-100" />
      <View className="flex-1 ml-3">
        <Text className="font-khmerMedium text-gray-900 text-xl" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="font-khmer text-gray-400 text-[14px] mt-0.5">${item.price.toFixed(2)}</Text>
      </View>
      <Text className="font-khmer text-gray-500 text-xl mr-3">x{item.quantity}</Text>
      <Text className="font-khmerBold text-gray-900 text-xl">
        ${(item.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  );
}