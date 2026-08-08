import { View, Text } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type OrderStatsBarProps = {
  totalOrders: number;
  totalShipping: number;
  totalConfirmed: number;
  totalCancelled: number;
};

export function OrderStatsBar({
  totalOrders,
  totalShipping,
  totalConfirmed,
  totalCancelled,
}: OrderStatsBarProps) {
  return (
    <View className="flex-row px-5 pt-3 pb-1 gap-2">
      <View className="flex-1 bg-white rounded-2xl p-3 items-center">
        <View className="bg-blue-50 w-12 h-12 rounded-full items-center justify-center mb-1.5">
          <Ionicons name="receipt-outline" size={26} color="#2563EB" />
        </View>
        <Text className="font-khmerBold text-gray-900 text-2xl">{totalOrders}</Text>
        <Text className="font-khmer text-gray-500 text-[16px] mt-0.5 text-center" numberOfLines={1}>
          ការបញ្ជាទិញ
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-2xl p-3 items-center">
        <View className="bg-orange-50 w-12 h-12 rounded-full items-center justify-center mb-1.5">
          <MaterialCommunityIcons name="truck-delivery-outline" size={26} color="#EA580C" />
        </View>
        <Text className="font-khmerBold text-gray-900 text-2xl">{totalShipping}</Text>
        <Text className="font-khmer text-gray-500 text-[16px] mt-0.5 text-center" numberOfLines={1}>
          កំពុងដឹក
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-2xl p-3 items-center">
        <View className="bg-green-50 w-12 h-12 rounded-full items-center justify-center mb-1.5">
          <Ionicons name="checkmark-circle-outline" size={26} color="#16A34A" />
        </View>
        <Text className="font-khmerBold text-gray-900 text-2xl">{totalConfirmed}</Text>
        <Text className="font-khmer text-gray-500 text-[16px] mt-0.5 text-center" numberOfLines={1}>
          បញ្ចប់
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-2xl p-3 items-center">
        <View className="bg-red-50 w-12 h-12 rounded-full items-center justify-center mb-1.5">
          <Ionicons name="close-circle-outline" size={26} color="#DC2626" />
        </View>
        <Text className="font-khmerBold text-gray-900 text-2xl">{totalCancelled}</Text>
        <Text className="font-khmer text-gray-500 text-[16px] mt-0.5 text-center" numberOfLines={1}>
          លុបចោល
        </Text>
      </View>
    </View>
  );
}