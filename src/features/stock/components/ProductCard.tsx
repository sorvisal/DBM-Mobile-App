import { View, Text, TouchableOpacity, Image } from "react-native";
import { ExpiryBadge } from "./ExpiryBadge";

type ProductCardProps = {
  imageUrl: string;
  name: string;
  unit: string;
  price: string;
  quantity: number;
  expiryDate?: string;
  daysLeft?: number;
  onPress?: () => void;
};

export function ProductCard({
  imageUrl,
  name,
  unit,
  price,
  quantity,
  expiryDate,
  daysLeft,
  onPress,
}: ProductCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white rounded-xl p-2 mb-1"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      <Image source={{ uri: imageUrl }} className="w-12 h-16 rounded-xl" />

      <View className="flex-1 ml-3">
        <Text className="font-khmerMedium text-gray-900 text-sm" numberOfLines={1}>
          {name}
        </Text>
        <Text className="font-khmer text-gray-400 text-[11px] mt-0.5">
          {unit}
          {expiryDate ? `  •  ${expiryDate}` : ""}
        </Text>
        {daysLeft !== undefined && <View className="mt-1.5"><ExpiryBadge daysLeft={daysLeft} /></View>}
      </View>

      <View className="items-end">
        <Text className="font-khmerBold text-gray-900 text-sm">{price}</Text>
        <Text className="font-khmer text-gray-400 text-[11px] mt-1">{quantity} កេស</Text>
      </View>
    </TouchableOpacity>
  );
}