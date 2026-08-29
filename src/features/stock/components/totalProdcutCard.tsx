import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TotalProductCardProps = {
  imageUrl: string;
  name: string;
  unit: string;
  buyPrice: string;
  sellPrice: string;
  quantity: number;
  isLowStock?: boolean;
  onPress?: () => void;
};

export function TotalProductCard({
  imageUrl,
  name,
  unit,
  buyPrice,
  sellPrice,
  quantity,
  isLowStock,
  onPress,
}: TotalProductCardProps) {
  if (__DEV__) console.log('[RENDER] TotalProductCard', name, '-> imageUrl:', imageUrl);
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl p-3 mb-3"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      {imageUrl && !/^(blob|data):/i.test(imageUrl) ? (
        <Image source={{ uri: imageUrl }} resizeMode="cover" className="w-12 h-16 rounded-xl" />
      ) : (
        <View className="w-12 h-16 rounded-xl bg-gray-100 items-center justify-center">
          <Ionicons name="image-outline" size={20} color="#D1D5DB" />
        </View>
      )}

      <View className="flex-1 ml-3">
        <Text className="font-khmerMedium text-gray-900 text-xl" numberOfLines={1} maxFontSizeMultiplier={1.3}>
          {name}
        </Text>
        <Text className="font-khmer text-gray-400 text-[16px] mt-0.5" maxFontSizeMultiplier={1.3}>{unit}</Text>
        <Text className="font-khmer text-gray-400 text-[16px] mt-1" numberOfLines={2} maxFontSizeMultiplier={1.3}>
          តម្លៃទិញ: {buyPrice}  |  តម្លៃលក់: {sellPrice}
        </Text>
      </View>

      <View className="items-end">
        <Text className={`font-khmerBold text-2xl ${isLowStock ? "text-red-600" : "text-blue-600"}`} numberOfLines={1} maxFontSizeMultiplier={1.3}>{quantity}</Text>
        <Text className="font-khmer text-gray-400 text-[17px] mt-0.5" allowFontScaling={false}>ស្តុក</Text>
      </View>
    </TouchableOpacity>
  );
}