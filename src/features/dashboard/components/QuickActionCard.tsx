import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { QuickAction } from "../types/dashboard.types";

type QuickActionCardProps = {
  action: QuickAction;
  onPress?: () => void;
};

export function QuickActionCard({ action, onPress }: QuickActionCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-[47%] bg-white rounded-2xl p-4"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      <View className={`${action.iconBg} w-10 h-10 rounded-full items-center justify-center mb-3`}>
        <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={28} color={action.iconColor} />
      </View>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-khmerMedium text-gray-900 text-2xl">{action.title}</Text>
          <Text className="font-khmer text-gray-400 text-[16px] mt-0.5" numberOfLines={1}>
            {action.subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}