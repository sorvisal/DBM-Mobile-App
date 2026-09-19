import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useYearlyIncome } from "../hooks/useYearlyIncome";
import { RevenueAreaChart } from "../components/RevenueAreaChart";
import { MonthlyOrderCard } from "../components/MonthlyOrderCard";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";
import { YearDropdown } from "../components/YearDropdown";
import { generateYearlyIncomeReport } from "../utils/generateYearlyIncomeReport";
import { MONTH_NAMES } from "../utils/generateMonthlyIncomeReport";
import { getOrderMonthNumber } from "../hooks/incomeOrders";
import type { IncomeOrder } from "../types/income.types";
import { DetailLayout } from "../../../layouts/DetailLayout";

type YearlyIncomeDetailScreenProps = {
  onBack: () => void;
};

/*
 * Years you can navigate between: 4 behind to 1 ahead of the current year.
 * Built dynamically so this screen never hard-codes a year.
 */
const CURRENT_YEAR = new Date().getFullYear();

const AVAILABLE_YEARS = Array.from(
  { length: 6 },
  (_, index) => CURRENT_YEAR - 4 + index
);

const KHMER_MONTH_NAMES = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

/** A single month section inside the yearly order list. */
type YearlyOrderGroup = {
  month: number;
  /** English month title from the shared report constant, e.g. "January 2026". */
  label: string;
  count: number;
  total: number;
  orders: IncomeOrder[];
};

export function YearlyIncomeDetailScreen({ onBack }: YearlyIncomeDetailScreenProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Pass selectedYear as a string to your hook
  const { summary, isLoading, isRefreshing, error, refresh } = useYearlyIncome(selectedYear.toString());

  const [isDownloading, setIsDownloading] = useState(false);

  const currentIndex = AVAILABLE_YEARS.indexOf(selectedYear);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex !== -1 && currentIndex < AVAILABLE_YEARS.length - 1;

  const goBack = () => {
    if (canGoBack) {
      setSelectedYear(AVAILABLE_YEARS[currentIndex - 1]);
    } else {
      // Fallback if year isn't explicitly in array
      setSelectedYear((prev) => prev - 1);
    }
  };

  const goForward = () => {
    if (canGoForward) {
      setSelectedYear(AVAILABLE_YEARS[currentIndex + 1]);
    } else {
      setSelectedYear((prev) => prev + 1);
    }
  };

  const calendarButton = (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Calendar">
      <Ionicons name="calendar-outline" size={22} color="black" />
    </TouchableOpacity>
  );

  const safeTotalIncome = Number(summary.totalIncome ?? 0);
  const safeOrderCount = Number(summary.orderCount ?? 0);
  const safeGrowthPercent = Number(summary.growthPercent ?? 0);

  /*
   * Group the (already year-filtered, completed-only) orders by calendar month.
   * Only months that actually have orders produce a section — we never render
   * fake/empty month cards. Each group carries a running total for the
   * "សរុបខែ…" row.
   */
  const orderGroups = useMemo<YearlyOrderGroup[]>(() => {
    const byMonth = new Map<number, YearlyOrderGroup>();

    for (const order of summary.orders) {
      const month = getOrderMonthNumber(order.createdAt);

      if (!month) {
        continue;
      }

      const amount = Number(order.amount ?? 0);
      const existing = byMonth.get(month);

      if (existing) {
        existing.orders.push(order);
        existing.count += 1;
        existing.total += amount;
      } else {
        byMonth.set(month, {
          month,
          label: `${MONTH_NAMES[month - 1] ?? ""} ${selectedYear}`,
          count: 1,
          total: amount,
          orders: [order],
        });
      }
    }

    return Array.from(byMonth.values()).sort((a, b) => a.month - b.month);
  }, [summary.orders, selectedYear]);

  /*
   * ========================================
   * DOWNLOAD YEARLY INCOME REPORT
   * ========================================
   */
  const handleDownloadReport = async () => {
    if (isDownloading || isLoading) {
      return;
    }

    if (!Number.isFinite(selectedYear) || selectedYear <= 0) {
      Alert.alert("មានបញ្ហា", "មិនអាចបង្កើតរបាយការណ៍បានទេ");
      return;
    }

    if (summary.monthlyChart.length === 0) {
      Alert.alert("មិនមានទិន្នន័យ", "មិនមានទិន្នន័យចំណូលសម្រាប់ឆ្នាំនេះទេ");
      return;
    }

    setIsDownloading(true);

    try {
      const { uri, html } = await generateYearlyIncomeReport({
        year: selectedYear,
        summary,
      });

      const sharingAvailable = await Sharing.isAvailableAsync();

      if (sharingAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "ទាញយករបាយការណ៍ចំណូល",
          UTI: "com.adobe.pdf",
        });
      } else {
        await Print.printAsync({ html });
      }
    } catch (error) {
      if (__DEV__) {
        console.error("[YEARLY INCOME REPORT] Failed:", error);
      }

      const message = error instanceof Error ? error.message : String(error);
      const isCancel = /cancel|dismiss|user.*(cancel|dismiss)/i.test(message);

      if (!isCancel) {
        Alert.alert("មានបញ្ហា", "មិនអាចបង្កើតរបាយការណ៍បានទេ");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadButton = (
    <TouchableOpacity
      onPress={handleDownloadReport}
      disabled={isDownloading}
      activeOpacity={0.8}
      className="flex-row h-12 items-center justify-center rounded-2xl bg-blue-600"
    >
      {isDownloading ? (
        <>
          <ActivityIndicator size="small" color="#FFFFFF" />

          <Text
            className="ml-2 font-khmerBold text-white text-xl"
            maxFontSizeMultiplier={1.3}
          >
            កំពុងបង្កើតរបាយការណ៍...
          </Text>
        </>
      ) : (
        <>
          <Ionicons
            name="download-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text
            className="ml-2 font-khmerBold text-white text-xl"
            maxFontSizeMultiplier={1.3}
          >
            ទាញយករបាយការណ៍
          </Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <DetailLayout title="ចំណូលប្រចាំឆ្នាំ" onBack={onBack} rightAction={calendarButton}>
      {/* Year navigator */}
      <View className="bg-white px-5 py-3 flex-row items-center justify-between mt-1 mx-0 rounded-2xl">
        <TouchableOpacity onPress={goBack}>
          <Ionicons name="chevron-back" size={18} color="#6B7280" />
        </TouchableOpacity>

        <Text className="font-khmer text-gray-800 text-xl">{summary.year || selectedYear}</Text>

        <TouchableOpacity onPress={goForward}>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {isLoading && summary.orders.length === 0 ? (
        <LoadingState text="កំពុងផ្ទុកទិន្នន័យចំណូល..." />
      ) : error && summary.orders.length === 0 ? (
        <ErrorState onRetry={refresh} />
      ) : (
        <FlatList
          className="flex-1 px-5 pt-3"
          data={orderGroups}
          keyExtractor={(item) => String(item.month)}
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
                  <Text className="font-khmerBold text-white text-2xl mt-1" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} maxFontSizeMultiplier={1.3} style={{ width: "100%" }}>${safeTotalIncome.toFixed(2)}</Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="font-khmer text-white/70 text-[14px]">
                      ការបញ្ជាទិញ {safeOrderCount} ការកម្មង់
                    </Text>
                    {safeGrowthPercent !== 0 && (
                      <Text className="font-khmer text-green-300 text-[14px] ml-2">
                        ▲{safeGrowthPercent}%
                      </Text>
                    )}
                  </View>
                </View>
                <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center">
                  <Ionicons name="wallet-outline" size={20} color="white" />
                </View>
              </View>

              {/* Chart */}
              <View className="bg-white rounded-xl px-3 py-3 mt-3 mx-0">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-khmerBold text-gray-900 text-xl flex-1 mr-2" numberOfLines={2} maxFontSizeMultiplier={1.3}>
                    ចំណូលប្រចាំឆ្នាំ {selectedYear}
                  </Text>
                  <YearDropdown value={selectedYear} onChange={setSelectedYear} />
                </View>
                <RevenueAreaChart data={summary.monthlyChart} height={160} />
              </View>

              {/* Orders section title */}
              <View className="flex-row items-center justify-between mt-4 mb-2">
                <Text className="font-khmerBold text-gray-900 text-lg flex-1 mr-2" numberOfLines={2} maxFontSizeMultiplier={1.3}>
                  ការបញ្ជាទិញប្រចាំឆ្នាំ {selectedYear}
                </Text>
                <View className="rounded-full bg-gray-100 px-3 py-1">
                  <Text className="font-khmer text-gray-600" maxFontSizeMultiplier={1.3}>
                    {safeOrderCount} កម្មង់
                  </Text>
                </View>
              </View>
            </>
          }
          ListEmptyComponent={
            isLoading ? (
              <LoadingState compact text="កំពុងផ្ទុកការបញ្ជាទិញ..." />
            ) : error ? (
              <ErrorState compact onRetry={refresh} />
            ) : (
              <EmptyState compact icon="receipt-outline" text="មិនមានការបញ្ជាទិញក្នុងឆ្នាំនេះ" />
            )
          }
          ListFooterComponent={
            <>
              {downloadButton}
              <View className="h-6" />
            </>
          }
          renderItem={({ item }) => (
            <View className="mb-5">
              {/* Month header */}
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-khmerBold text-lg text-gray-900 flex-1 mr-2" numberOfLines={1} maxFontSizeMultiplier={1.3}>
                  {item.label}
                </Text>
                <View className="rounded-full bg-gray-100 px-3 py-1">
                  <Text className="font-khmer text-gray-600" maxFontSizeMultiplier={1.3}>
                    {item.count} កម្មង់
                  </Text>
                </View>
              </View>

              {/* Order cards */}
              {item.orders.map((order) => (
                <MonthlyOrderCard
                  key={order.id}
                  code={order.code}
                  customerName={order.customerName}
                  dateLabel={order.time}
                  amount={order.amount}
                />
              ))}

              {/* Monthly total */}
              <View className="mt-1 flex-row items-center justify-between rounded-2xl bg-blue-50 px-4 py-2">
                <Text className="font-khmer text-blue-700" maxFontSizeMultiplier={1.3}>
                  សរុបខែ{KHMER_MONTH_NAMES[item.month - 1]}: ${item.total.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </DetailLayout>
  );
}