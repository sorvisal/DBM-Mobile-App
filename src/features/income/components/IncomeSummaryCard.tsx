import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IncomeSummaryCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  label: string;
  amount: number;
  subLabel: string;
  growthPercent?: number;
  onPress?: () => void;
};

export function IncomeSummaryCard({
  icon,
  iconBg,
  iconColor,
  label,
  amount,
  subLabel,
  growthPercent,
  onPress,
}: IncomeSummaryCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-1 bg-white rounded-2xl p-2"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      <View className={`${iconBg} w-10 h-10 rounded-lg items-center justify-center mb-2`}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text className="font-khmer text-gray-400 text-[17px]" numberOfLines={1}>
        {label}
      </Text>
      <Text className="font-khmerBold text-gray-900 text-xl mt-0.5">${amount.toFixed(2)}</Text>
      <View className="flex-row items-center mt-0.5">
        <Text className="font-khmer text-gray-400 text-[17px]">{subLabel}</Text>
        {growthPercent !== undefined && (
          <Text className="font-khmer text-green-600 text-[17px] ml-1">▲{growthPercent}%</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}