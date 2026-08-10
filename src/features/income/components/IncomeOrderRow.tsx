import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IncomeOrder } from "../types/income.types";

const STATUS_MAP: Record<IncomeOrder["status"], { label: string; bg: string; text: string; iconBg: string; iconColor: string }> = {
  completed: { label: "បញ្ចប់", bg: "bg-green-50", text: "text-green-600", iconBg: "bg-orange-50", iconColor: "#EA580C" },
  shipping: { label: "កំពុងដឹក", bg: "bg-purple-50", text: "text-purple-600", iconBg: "bg-purple-50", iconColor: "#9333EA" },
  cancelled: { label: "បោះបង់", bg: "bg-red-50", text: "text-red-600", iconBg: "bg-red-50", iconColor: "#DC2626" },
};

type IncomeOrderRowProps = {
  order: IncomeOrder;
  onPress?: () => void;
};

export function IncomeOrderRow({ order, onPress }: IncomeOrderRowProps) {
  const tone = STATUS_MAP[order.status];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center bg-white rounded-2xl p-3 mb-2"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      <View className={`${tone.iconBg} w-10 h-10 rounded-xl items-center justify-center`}>
        <Ionicons name="bag-handle-outline" size={18} color={tone.iconColor} />
      </View>

      <View className="flex-1 ml-3">
        <Text className="font-khmerMedium text-gray-900 text-xl" numberOfLines={1}>
          {order.code}
        </Text>
        <Text className="font-khmer text-gray-400 text-[16px] mt-0.5">{order.time}</Text>
        <Text className="font-khmer text-gray-400 text-[16px] mt-0.5" numberOfLines={1}>
          {order.customerCode} | {order.customerName}
        </Text>
      </View>

      <View className="items-end">
        <View className={`${tone.bg} rounded-full px-2 py-0.5 mb-1`}>
          <Text className={`font-khmer text-[14px] ${tone.text}`}>{tone.label}</Text>
        </View>
        <Text className="font-khmerBold text-gray-900 text-xl">${order.amount.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}