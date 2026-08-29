import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OrderItem } from "../types/types";

type OrderItemRowProps = {
  item: OrderItem;
};

export function OrderItemRow({ item }: OrderItemRowProps) {
  return (
    <View className="flex-row items-center py-3">
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          className="w-10 h-12 rounded-xl bg-gray-100"
          resizeMode="cover"
        />
      ) : (
        <View className="w-12 h-12 rounded-xl bg-gray-100 items-center justify-center">
          <Ionicons
            name="image-outline"
            size={20}
            color="#D1D5DB"
          />
        </View>
      )}

      <View className="flex-1 ml-3">
        <View className="flex-row items-center">
          <Text
            className="font-khmerMedium text-gray-900 text-xl flex-1 mr-2"
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
          >
            {item.name}
          </Text>

          <Text className="font-khmer text-gray-400 text-xl" maxFontSizeMultiplier={1.3}>
            x{item.qty}
          </Text>
        </View>

        <Text className="font-khmer text-gray-400 text-xl mt-0.5" maxFontSizeMultiplier={1.3}>
          ${item.price.toFixed(2)}
        </Text>
      </View>

      <Text className="font-khmerBold text-gray-900 text-xl" maxFontSizeMultiplier={1.3}>
        ${(item.price * item.qty).toFixed(2)}
      </Text>
    </View>
  );
}