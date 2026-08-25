import { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useYearlyIncome } from "../hooks/useYearlyIncome";
import { RevenueAreaChart } from "../components/RevenueAreaChart";
import { DebtorListItem } from "../components/DebtorListItem";
import { OutstandingDebtCard } from "../components/OutstandingDebtCard";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";
import { YearDropdown } from "../components/YearDropdown";
import { DetailLayout } from "../../../layouts/DetailLayout"; // adjust path if needed

type YearlyIncomeDetailScreenProps = {
  onBack: () => void;
  onGoDebtors: () => void;
};

export function YearlyIncomeDetailScreen({ onBack, onGoDebtors }: YearlyIncomeDetailScreenProps) {
  const [year] = useState("2025");
  const { summary, isLoading, isRefreshing, error, refresh } = useYearlyIncome(year);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const calendarButton = (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Calendar">
      <Ionicons name="calendar-outline" size={22} color="black" />
    </TouchableOpacity>
  );

  return (
    <DetailLayout title="ចំណូលប្រចាំឆ្នាំ" onBack={onBack} rightAction={calendarButton}>
      {/* Year navigator */}
      <View className="bg-white px-5 py-3 flex-row items-center justify-between mt-1 mx-5 rounded-full">
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={18} color="#6B7280" />
        </TouchableOpacity>
        <Text className="font-khmer text-gray-800 text-xl">{summary.year}</Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {isLoading && summary.monthlyChart.length === 0 ? (
        <LoadingState text="កំពុងផ្ទុកទិន្នន័យចំណូល..." />
      ) : error && summary.monthlyChart.length === 0 ? (
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
                  <Text className="font-khmerBold text-white text-2xl mt-1">${summary.totalIncome.toFixed(2)}</Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="font-khmer text-white/70 text-[14px]">
                      ការបញ្ជាទិញ {summary.orderCount} ការកម្មង់
                    </Text>
                    {summary.growthPercent !== 0 && (
                      <Text className="font-khmer text-green-300 text-[14px] ml-2">
                        ▲{summary.growthPercent}%
                      </Text>
                    )}
                  </View>
                </View>
                <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center">
                  <Ionicons name="wallet-outline" size={20} color="white" />
                </View>
              </View>

              {/* Chart */}
              <View className="bg-white rounded-xl p-2 mt-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-khmerBold text-gray-900 text-xl">
                    ចំណូលប្រចាំឆ្នាំ {selectedYear}
                  </Text>
                  <YearDropdown value={selectedYear} onChange={setSelectedYear} />
                </View>
                <RevenueAreaChart data={summary.monthlyChart} height={160} />
              </View>

              {/* Debtors */}
              <View className="mt-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-khmerBold text-gray-900 text-xl">ចំណូលអតិថិជនសរុប</Text>
                  <TouchableOpacity onPress={onGoDebtors} className="flex-row items-center gap-1">
                    <Text className="font-khmer text-blue-600 text-xl">មើលទាំងអស់</Text>
                    <Ionicons name="chevron-forward" size={16} color="#2563EB" />
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
              <EmptyState compact icon="people-outline" text="មិនមានចំណូលអតិថិជន" />
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
    </DetailLayout>
  );
}