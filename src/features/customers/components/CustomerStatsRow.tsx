import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type CustomerStatsRowProps = {
  totalCustomers: number;
  activeCustomers: number;
  totalOrders: number;
  totalSpent: number;
};

export function CustomerStatsRow({
  totalCustomers,
  activeCustomers,
  totalOrders,
  totalSpent,
}: CustomerStatsRowProps) {
  const valueStyle = {
    maxFontSizeMultiplier: 1.3,
  } as const;

  return (
    <View className="flex-row px-5 pt-3 pb-1 gap-2">
      <View className="flex-1 bg-white rounded-2xl p-3 items-center">
        <View className="bg-blue-50 w-11 h-11 rounded-full items-center justify-center mb-1.5">
          <Ionicons name="people-outline" size={24} color="#2563EB" />
        </View>
        <Text className="font-khmerBold text-gray-900 text-2xl text-center" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={{ width: "100%", ...valueStyle }}>{totalCustomers}</Text>
        <Text className="font-khmer text-gray-400 text-[16px] mt-0.5 text-center" numberOfLines={2} maxFontSizeMultiplier={1.3}>
          អតិថិជនសរុប
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-2xl p-3 items-center">
        <View className="bg-green-50 w-11 h-11 rounded-full items-center justify-center mb-1.5">
          <Ionicons name="checkmark-circle-outline" size={24} color="#16A34A" />
        </View>
        <Text className="font-khmerBold text-gray-900 text-2xl text-center" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={{ width: "100%", ...valueStyle }}>{activeCustomers}</Text>
        <Text className="font-khmer text-gray-400 text-[16px] mt-0.5 text-center" numberOfLines={2} maxFontSizeMultiplier={1.3}>
          អតិថិជនសកម្ម
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-2xl p-3 items-center">
        <View className="bg-orange-50 w-11 h-11 rounded-full items-center justify-center mb-1.5">
          <Ionicons name="cart-outline" size={24} color="#EA580C" />
        </View>
        <Text className="font-khmerBold text-gray-900 text-2xl text-center" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={{ width: "100%", ...valueStyle }}>{totalOrders}</Text>
        <Text className="font-khmer text-gray-400 text-[16px] mt-0.5 text-center" numberOfLines={2} maxFontSizeMultiplier={1.3}>
          ការបញ្ជាទិញ
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-2xl p-3 items-center">
        <View className="bg-purple-50 w-11 h-11 rounded-full items-center justify-center mb-1.5">
          <Ionicons name="cash-outline" size={24} color="#9333EA" />
        </View>
        <Text className="font-khmerBold text-gray-900 text-2xl text-center" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} style={{ width: "100%", ...valueStyle }}>${totalSpent.toFixed(0)}</Text>
        <Text className="font-khmer text-gray-400 text-[16px] mt-0.5 text-center" numberOfLines={2} maxFontSizeMultiplier={1.3}>
          ចំណូលសរុប
        </Text>
      </View>
    </View>
  );
}