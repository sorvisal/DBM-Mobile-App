import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { CustomerOrderSummary } from "../types/customer.types";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: string; iconColor: string }> = {
  "កំពុងដឹក": { bg: "bg-purple-50", text: "text-purple-600", icon: "bag-handle-outline", iconColor: "#9333EA" },
  "បានបញ្ចប់": { bg: "bg-green-50", text: "text-green-600", icon: "bag-handle-outline", iconColor: "#16A34A" },
  "បោះបង់": { bg: "bg-red-50", text: "text-red-600", icon: "bag-handle-outline", iconColor: "#DC2626" },
  "រង់ចាំ": { bg: "bg-orange-50", text: "text-orange-600", icon: "bag-handle-outline", iconColor: "#EA580C" },
};

type CustomerOrderHistoryListProps = {
  orders: CustomerOrderSummary[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onRetry?: () => void;
  onPressOrder?: (orderId: string) => void;
  ListHeaderComponent?: ReactElement | null;
};

export function CustomerOrderHistoryList({
  orders,
  isLoading,
  isRefreshing,
  error,
  onRefresh,
  onRetry,
  onPressOrder,
  ListHeaderComponent,
}: CustomerOrderHistoryListProps) {
  return (
    <FlatList
      className="flex-1 px-5 pt-4"
      data={orders}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        isLoading ? (
          <LoadingState compact />
        ) : error ? (
          <ErrorState compact message={error} onRetry={onRetry} />
        ) : (
          <EmptyState compact icon="receipt-outline" text="មិនមានប្រវត្តិការបញ្ជាទិញទេ" />
        )
      }
      renderItem={({ item }) => {
        const tone = STATUS_COLORS[item.status] ?? STATUS_COLORS["រង់ចាំ"];
        return (
          <TouchableOpacity
            onPress={() => onPressOrder?.(item.id)}
            className="flex-row items-center bg-white rounded-2xl p-3 mb-3"
            style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
          >
            <View className={`${tone.bg} w-11 h-11 rounded-xl items-center justify-center`}>
              <Ionicons name="bag-handle-outline" size={20} color={tone.iconColor} />
            </View>

            <View className="flex-1 ml-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-khmerMedium text-gray-900 text-xl" numberOfLines={1}>
                  {item.code}
                </Text>
                <View className={`rounded-full px-2 py-0.5 ${tone.bg}`}>
                  <Text className={`font-khmer text-[16px] ${tone.text}`}>{item.status}</Text>
                </View>
              </View>
              <Text className="font-khmer text-gray-400 text-[16px] mt-1">{item.date}</Text>
              <View className="flex-row items-center justify-between mt-1.5">
                <Text className="font-khmer text-gray-400 text-[16px]">{item.itemCount} មុខទំនិញ</Text>
                <Text className="font-khmerBold text-blue-600 text-xl">${item.total.toFixed(2)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}
