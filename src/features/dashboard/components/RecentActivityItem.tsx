import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RecentActivity } from "../types/dashboard.types";

type RecentActivityItemProps = {
  item: RecentActivity;
  isLast: boolean;
};

export function RecentActivityItem({ item, isLast }: RecentActivityItemProps) {
  return (
    <View className={`flex-row items-center px-4 py-3 ${!isLast ? "border-b border-gray-50" : ""}`}>
      <View className={`${item.iconBg} w-12 h-12 rounded-full items-center justify-center mr-3`}>
        <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={26} color={item.iconColor} />
      </View>
      <Text className="font-khmer text-gray-800 text-xl flex-1" numberOfLines={1}>
        {item.title}
      </Text>
      <Text className="font-khmer text-gray-400 text-xl ml-2">{item.time}</Text>
    </View>
  );
}