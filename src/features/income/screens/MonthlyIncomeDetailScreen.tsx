import { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMonthlyIncome } from "../hooks/useMonthlyIncome";
import { RevenueBarChart } from "../components/RevenueBarChart";
import { DebtorListItem } from "../components/DebtorListItem";
import { OutstandingDebtCard } from "../components/OutstandingDebtCard";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";

type MonthlyIncomeDetailScreenProps = {
  onBack: () => void;
  onGoDebtors: () => void;
};

export function MonthlyIncomeDetailScreen({ onBack, onGoDebtors }: MonthlyIncomeDetailScreenProps) {
  const [month] = useState("5/2025");
  const { summary, isLoading, isRefreshing, error, refresh } = useMonthlyIncome(month);

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Header */}
      <View className="bg-white px-5 pt-3 pb-3 flex-row items-center justify-between relative border-b border-gray-100">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={26} color="#1F2937" />
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center justify-center pointer-events-none">
          <Text className="font-khmerBold text-gray-900 text-3xl">ចំណូលប្រចាំខែ</Text>
        </View>
        <Ionicons name="calendar-outline" size={22} color="#1F2937" />
      </View>

      {/* Month navigator */}
      <View className="bg-white px-5 py-3 flex-row items-center justify-between mt-1 rounded-full">
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={18} color="#6B7280" />
        </TouchableOpacity>
        <Text className="font-khmer text-gray-800 text-xl">{summary.month}</Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {isLoading && summary.dailyChart.length === 0 ? (
        <LoadingState text="កំពុងផ្ទុកទិន្នន័យចំណូល..." />
      ) : error && summary.dailyChart.length === 0 ? (
        <ErrorState onRetry={refresh} />
      ) : (
        <FlatList
          className="flex-1 px-5 pt-3"
          data={summary.debtors}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
          refreshing={isRefreshing}
          onRefresh={refresh}
          ListHeaderComponent={
            <>
              {/* Summary */}
              <View className="bg-blue-600 rounded-2xl p-4 flex-row items-center justify-between">
                <View>
                  <Text className="font-khmer text-white/80 text-xl">ចំណូលសរុប</Text>
                  <Text className="font-khmerBold text-white text-3xl mt-1">${summary.totalIncome.toFixed(2)}</Text>
                  <Text className="font-khmer text-white/70 text-[16px] mt-1">
                    ការបញ្ជាទិញ {summary.orderCount} ការកម្មង់
                  </Text>
                </View>
                <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center">
                  <Ionicons name="wallet-outline" size={20} color="white" />
                </View>
              </View>

              {/* Chart */}
              <View className="bg-white rounded-2xl p-4 mt-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="font-khmerBold text-gray-900 text-xl">ក្រាហ្វប្រចាំថ្ងៃក្នុងខែនេះ</Text>
                  <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-1">
                    <Text className="font-khmer text-gray-600 text-xl">ថ្ងៃ</Text>
                    <Ionicons name="chevron-down" size={12} color="#6B7280" style={{ marginLeft: 4 }} />
                  </View>
                </View>
                <RevenueBarChart data={summary.dailyChart} height={130} />
              </View>

              {/* Debtors */}
              <View className="mt-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-khmerBold text-gray-900 text-xl">បំណុលអតិថិជន</Text>
                  <TouchableOpacity onPress={onGoDebtors} className="flex-row items-center gap-1">
                    <Text className="font-khmer text-blue-600 text-xl">មើលទាំងអស់</Text>
                    <Ionicons name="chevron-forward" size={12} color="#2563EB" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          }
          ListEmptyComponent={
            isLoading ? (
              <LoadingState compact text="កំពុងផ្ទុកបំណុលអតិថិជន..." />
            ) : error ? (
              <ErrorState compact onRetry={refresh} />
            ) : (
              <EmptyState compact icon="people-outline" text="មិនមានបំណុលអតិថិជន" />
            )
          }
          ListFooterComponent={
            <>
              <OutstandingDebtCard totalDebt={summary.totalDebt} debtorCount={summary.debtors.length} />
              <View className="h-6" />
            </>
          }
          renderItem={({ item }) => <DebtorListItem debtor={item} />}
        />
      )}
    </View>
  );
}
