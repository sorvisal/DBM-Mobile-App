import { View, Text, TouchableOpacity, Image } from "react-native";

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
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl p-3 mb-3"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      {imageUrl && !/^(blob|data):/i.test(imageUrl) ? (
        <Image source={{ uri: imageUrl }} className="w-12 h-16 rounded-xl" />
      ) : (
        <View className="w-12 h-16 rounded-xl bg-gray-100" />
      )}

      <View className="flex-1 ml-3">
        <Text className="font-khmerMedium text-gray-900 text-xl" numberOfLines={1}>
          {name}
        </Text>
        <Text className="font-khmer text-gray-400 text-[16px] mt-0.5">{unit}</Text>
        <Text className="font-khmer text-gray-400 text-[16px] mt-1">
          តម្លៃទិញ: {buyPrice}  |  តម្លៃលក់: {sellPrice}
        </Text>
      </View>

      <View className="items-end">
        <Text className={`font-khmerBold text-2xl ${isLowStock ? "text-red-600" : "text-blue-600"}`}>{quantity}</Text>
        <Text className="font-khmer text-gray-400 text-[17px] mt-0.5">កេស</Text>
      </View>
    </TouchableOpacity>
  );
}