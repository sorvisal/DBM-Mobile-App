import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DashboardStat } from "../types/dashboard.types";

type StatItemProps = {
  stat: DashboardStat;
};

export function StatItem({ stat }: StatItemProps) {
  return (
    <View className="flex-1 items-center">
      <View className={`${stat.iconBg} h-11 w-11 items-center justify-center rounded-full`}>
        <Ionicons name={stat.icon as keyof typeof Ionicons.glyphMap} size={24} color="white" />
      </View>

      <Text className="font-khmer text-white/80 text-[16px] text-center mt-2" numberOfLines={1}>
        {stat.title}
      </Text>

      <Text className="font-khmerBold text-white text-3xl mt-1">{stat.value}</Text>

      <Text className="font-khmerMedium text-white/70 text-[16px] text-center mt-1" numberOfLines={1}>
        {stat.unit}
      </Text>
    </View>
  );
}