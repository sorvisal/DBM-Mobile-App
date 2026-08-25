import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { CustomerOrderSummary } from "../types/customer.types";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";

const STATUS_COLORS: Record<string, { bg: string; text: string; iconColor: string }> = {
  "កំពុងដឹក": { bg: "bg-amber-50", text: "text-amber-600", iconColor: "#D97706" },
  "បានបញ្ចប់": { bg: "bg-emerald-50", text: "text-emerald-600", iconColor: "#059669" },
  "បោះបង់": { bg: "bg-rose-50", text: "text-rose-600", iconColor: "#E11D48" },
  "រង់ចាំ": { bg: "bg-orange-50", text: "text-orange-600", iconColor: "#EA580C" },
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
      className="flex-1 bg-gray-50" // Added bg-gray-50 to match CustomerDetailScreen background
      data={orders}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }} // Matched px-5 (20px) padding
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
            className="flex-row items-center bg-white rounded-2xl p-4 mb-3 border border-gray-100"
            style={{ shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 }}
          >
            {/* Left Bag Icon */}
            <View className={`${tone.bg} w-11 h-11 rounded-xl items-center justify-center mr-3`}>
              <Ionicons name="bag-handle-outline" size={20} color={tone.iconColor} />
            </View>

            {/* Middle Content */}
            <View className="flex-1">
              {/* Top Row: Code & Status Badge */}
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-khmerMedium text-gray-900 text-base" numberOfLines={1}>
                  {item.code}
                </Text>
                <View className={`rounded-full px-2.5 py-0.5 ${tone.bg}`}>
                  <Text className={`font-khmer text-xs font-medium ${tone.text}`}>
                    {item.status}
                  </Text>
                </View>
              </View>

              {/* Middle Row: Date & Time */}
              <Text className="font-khmer text-gray-600 text-base mb-2">
                {item.date}
              </Text>

              {/* Bottom Row: Item Count & Total Price */}
              <View className="flex-row items-center justify-between">
                <Text className="font-khmer text-gray-600 text-base">
                  {item.itemCount} មុខទំនិញ
                </Text>
                <Text className="font-khmerBold text-blue-600 text-base">
                  ${item.total.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Right Arrow */}
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        );
      }}
    />
  );
}