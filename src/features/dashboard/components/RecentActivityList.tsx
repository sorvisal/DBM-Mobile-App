import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RecentActivity } from "../types/dashboard.types";
import { RecentActivityItem } from "./RecentActivityItem";

type RecentActivityListProps = {
  items: RecentActivity[];
  onViewAll?: () => void;
};

export function RecentActivityList({ items, onViewAll }: RecentActivityListProps) {
  return (
    <View className="px-5 mt-6 mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="font-khmerMedium text-gray-900 text-2xl">ការជូនដំណឹងថ្មីៗ</Text>
        <TouchableOpacity onPress={onViewAll} className="flex-row items-center gap-1">
          <Text className="font-khmerMedium text-blue-600 text-2xl">មើលទាំងអស់</Text>
          <Ionicons name="chevron-forward" size={12} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <View className="bg-white rounded-2xl overflow-hidden">
        {items.length === 0 ? (
          <Text className="font-khmer text-gray-400 text-sm text-center py-6">មិនមានសកម្មភាពថ្មីៗទេ</Text>
        ) : (
          items.map((item, index) => (
            <RecentActivityItem key={item.id} item={item} isLast={index === items.length - 1} />
          ))
        )}
      </View>
    </View>
  );
}