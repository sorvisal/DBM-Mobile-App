import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMonthlyIncome } from "../hooks/useMonthlyIncome";
import { RevenueBarChart } from "../components/RevenueBarChart";
import { DebtorListItem } from "../components/DebtorListItem";
import { OutstandingDebtCard } from "../components/OutstandingDebtCard";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";
import { DetailLayout } from "../../../layouts/DetailLayout"; // adjust path if needed

type MonthlyIncomeDetailScreenProps = {
  onBack: () => void;
  onGoDebtors: () => void;
};

const KHMER_MONTH_NAMES = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ",
];

const STATIC_CHART_DATA: { label: string; amount: number }[] = [
  { label: "មករា", amount: 1200 },
  { label: "កុម្ភៈ", amount: 1850 },
  { label: "មីនា", amount: 900 },
  { label: "មេសា", amount: 2400 },
  { label: "ឧសភា", amount: 1600 },
  { label: "មិថុនា", amount: 2100 },
];

type MonthOption = { value: string; label: string };

const YEAR_RANGE = [2026, 2027, 2028, 2029, 2030];

function getMonthOptions(): MonthOption[] {
  const options: MonthOption[] = [];
  for (const y of YEAR_RANGE) {
    for (let m = 0; m < 12; m++) {
      options.push({
        value: `${m + 1}/${y}`,
        label: `${KHMER_MONTH_NAMES[m]} ${y}`,
      });
    }
  }
  return options;
}

export function MonthlyIncomeDetailScreen({ onBack, onGoDebtors }: MonthlyIncomeDetailScreenProps) {
  const monthOptions = useMemo(() => getMonthOptions(), []);

  const defaultMonth = useMemo(() => {
    const now = new Date();
    const candidate = `${now.getMonth() + 1}/${now.getFullYear()}`;
    return monthOptions.some((o) => o.value === candidate) ? candidate : monthOptions[0].value;
  }, [monthOptions]);

  const [month, setMonth] = useState(defaultMonth);
  const { summary, isLoading, isRefreshing, error, refresh } = useMonthlyIncome(month);

  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);

  const currentIndex = monthOptions.findIndex((o) => o.value === month);
  const currentLabel = monthOptions[currentIndex]?.label ?? month;
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < monthOptions.length - 1;

  const goBack = () => canGoBack && setMonth(monthOptions[currentIndex - 1].value);
  const goForward = () => canGoForward && setMonth(monthOptions[currentIndex + 1].value);

  const chartData = STATIC_CHART_DATA;

  const calendarButton = (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Calendar">
      <Ionicons name="calendar-outline" size={22} color="black" />
    </TouchableOpacity>
  );

  return (
    <DetailLayout title="ចំណូលប្រចាំខែ" onBack={onBack} rightAction={calendarButton}>
      {/* Month navigator */}
      <View className="bg-white px-5 py-3 flex-row items-center justify-between mt-1 rounded-full mx-5">
        <TouchableOpacity onPress={goBack} disabled={!canGoBack}>
          <Ionicons name="chevron-back" size={18} color={canGoBack ? "#6B7280" : "#D1D5DB"} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMonthDropdownOpen(true)}
          className="flex-row items-center gap-1 px-2 py-1"
        >
          <Text className="font-khmer text-gray-800 text-xl">{currentLabel}</Text>
          <Ionicons name="chevron-down" size={14} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity onPress={goForward} disabled={!canGoForward}>
          <Ionicons name="chevron-forward" size={18} color={canGoForward ? "#6B7280" : "#D1D5DB"} />
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={monthDropdownOpen}
        animationType="fade"
        onRequestClose={() => setMonthDropdownOpen(false)}
      >
        <Pressable className="flex-1 bg-black/20" onPress={() => setMonthDropdownOpen(false)}>
          <View
            className="absolute bg-white rounded-xl py-1 shadow-lg border border-gray-100 self-center"
            style={{ top: 110, width: 180, maxHeight: 320 }}
          >
            <FlatList
              data={monthOptions}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setMonth(item.value);
                    setMonthDropdownOpen(false);
                  }}
                  className="flex-row items-center justify-between px-4 py-2.5"
                >
                  <Text
                    className={`font-khmer text-xl ${
                      item.value === month ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    {item.label}
                  </Text>
                  {item.value === month && <Ionicons name="checkmark" size={16} color="#2563EB" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>

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

                  <View className="bg-gray-100 rounded-full px-3 py-1">
                    <Text className="font-khmer text-gray-600 text-xl">ខែ</Text>
                  </View>
                </View>
                <RevenueBarChart data={chartData} height={130} />
              </View>

              {/* Debtors */}
              <View className="mt-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-khmerBold text-gray-900 text-xl">ចំណូលអតិថិជនសរុប</Text>
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