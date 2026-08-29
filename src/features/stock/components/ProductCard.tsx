import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExpiryBadge } from "./ExpiryBadge";

type ProductCardProps = {
  imageUrl: string;
  name: string;
  unit: string;
  price: string;
  quantity: number;
  expiryDate?: string;
  daysLeft?: number;
  isLowStock?: boolean;
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
  isLowStock,
  onPress,
}: ProductCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row bg-white rounded-xl p-2.5 mb-2"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          resizeMode="cover"
          className="w-[60px] h-[68px] rounded-xl"
        />
      ) : (
        <View className="w-[60px] h-[68px] rounded-xl bg-gray-100 items-center justify-center">
          <Ionicons name="image-outline" size={24} color="#D1D5DB" />
        </View>
      )}

      <View className="flex-1 ml-3">
       <View className="flex-row items-start justify-between">
          <Text
            className="font-khmerMedium text-gray-900 text-xl flex-1 pr-2"
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
          >
            {name}
          </Text>

          {daysLeft !== undefined && (
            <ExpiryBadge daysLeft={daysLeft} />
          )}
        </View>

        <Text className="font-khmer text-gray-400 text-[15px] mt-0.5" maxFontSizeMultiplier={1.3}>{unit}</Text>

        {expiryDate && (
          <Text className="font-khmer text-gray-500 text-[15px] mt-1.5" maxFontSizeMultiplier={1.3}>
            ថ្ងៃផុតកំណត់: <Text className="font-khmerMedium text-gray-700">{expiryDate}</Text>
          </Text>
        )}

        <Text className="font-khmer text-gray-500 text-[15px] mt-0.5" maxFontSizeMultiplier={1.3}>
          សល់:{" "}
          <Text className={isLowStock ? "font-khmerBold text-red-600" : "font-khmerMedium text-gray-700"}>
            {quantity} កេស
          </Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}