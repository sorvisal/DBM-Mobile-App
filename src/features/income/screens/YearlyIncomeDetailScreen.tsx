import { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useYearlyIncome } from "../hooks/useYearlyIncome";
import { RevenueAreaChart } from "../components/RevenueAreaChart";
import { DebtorListItem } from "../components/DebtorListItem";
import { OutstandingDebtCard } from "../components/OutstandingDebtCard";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";
import { YearDropdown } from "../components/YearDropdown";
import { generateYearlyIncomeReport } from "../utils/generateYearlyIncomeReport";
import { DetailLayout } from "../../../layouts/DetailLayout"; // adjust path if needed

type YearlyIncomeDetailScreenProps = {
  onBack: () => void;
  onGoDebtors: () => void;
};

// Define available years or let it compute dynamically
const AVAILABLE_YEARS = [2024, 2025, 2026, 2027, 2028];

export function YearlyIncomeDetailScreen({ onBack, onGoDebtors }: YearlyIncomeDetailScreenProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Pass selectedYear as a string to your hook
  const { summary, isLoading, isRefreshing, error, refresh } = useYearlyIncome(selectedYear.toString());

  const [isDownloading, setIsDownloading] = useState(false);

  const currentIndex = AVAILABLE_YEARS.indexOf(selectedYear);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < AVAILABLE_YEARS.length - 1 && currentIndex !== -1;

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
                  <Text className="font-khmerBold text-white text-2xl mt-1" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} maxFontSizeMultiplier={1.3} style={{ width: "100%" }}>${summary.totalIncome.toFixed(2)}</Text>
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

              {/* DOWNLOAD YEARLY INCOME REPORT BUTTON */}
              <TouchableOpacity
                onPress={handleDownloadReport}
                disabled={isDownloading}
                activeOpacity={0.8}
                className="mt-4 flex-row h-12 items-center justify-center rounded-2xl bg-blue-600"
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

              {/* Chart */}
              <View className="bg-white rounded-xl px-3 py-3  mt-3 mx-0">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-khmerBold text-gray-900 text-xl flex-1 mr-2" numberOfLines={2} maxFontSizeMultiplier={1.3}>
                    ចំណូលប្រចាំឆ្នាំ {selectedYear}
                  </Text>
                  <YearDropdown value={selectedYear} onChange={setSelectedYear} />
                </View>
                <RevenueAreaChart data={summary.monthlyChart} height={160} />
              </View>

              {/* Debtors */}
              <View className="mt-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-khmerBold text-gray-900 text-lg flex-1 mr-2" numberOfLines={2} maxFontSizeMultiplier={1.3}>ចំណូលអតិថិជនសរុប</Text>
                  <TouchableOpacity onPress={onGoDebtors} className="flex-row items-center gap-1">
                    <Text className="font-khmer text-blue-600 text-lg" numberOfLines={1} maxFontSizeMultiplier={1.3}>មើលទាំងអស់</Text>
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