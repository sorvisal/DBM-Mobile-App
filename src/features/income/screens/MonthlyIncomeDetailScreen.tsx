import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { useMonthlyIncome } from "../hooks/useMonthlyIncome";
import { RevenueBarChart } from "../components/RevenueBarChart";
import { DebtorListItem } from "../components/DebtorListItem";
import { OutstandingDebtCard } from "../components/OutstandingDebtCard";
import { generateMonthlyIncomeReport } from "../utils/generateMonthlyIncomeReport";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/states";
import { DetailLayout } from "../../../layouts/DetailLayout";

type MonthlyIncomeDetailScreenProps = {
  onBack: () => void;
  onGoDebtors: () => void;
};

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

type MonthOption = {
  value: string;
  label: string;
  month: number;
  year: number;
};

const CURRENT_YEAR = new Date().getFullYear();

const YEAR_RANGE = Array.from(
  { length: 1 },
  (_, index) => CURRENT_YEAR + index
);

function getMonthOptions(): MonthOption[] {
  const options: MonthOption[] = [];

  for (const year of YEAR_RANGE) {
    for (let month = 1; month <= 12; month++) {
      options.push({
        value: `${month}/${year}`,
        label: `${KHMER_MONTH_NAMES[month - 1]} ${year}`,
        month,
        year,
      });
    }
  }

  return options;
}

export function MonthlyIncomeDetailScreen({
  onBack,
  onGoDebtors,
}: MonthlyIncomeDetailScreenProps) {
  const monthOptions = useMemo(
    () => getMonthOptions(),
    []
  );

  const defaultMonth = useMemo(() => {
    const now = new Date();

    const currentMonth =
      now.getMonth() + 1;

    const currentYear =
      now.getFullYear();

    const candidate =
      `${currentMonth}/${currentYear}`;

    const exists = monthOptions.some(
      (item) => item.value === candidate
    );

    return exists
      ? candidate
      : monthOptions[0].value;
  }, [monthOptions]);

  const [month, setMonth] =
    useState(defaultMonth);

  const {
    summary,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useMonthlyIncome(month);

  const [monthDropdownOpen, setMonthDropdownOpen] =
    useState(false);

  const [isDownloading, setIsDownloading] =
    useState(false);

  const currentIndex =
    monthOptions.findIndex(
      (item) => item.value === month
    );

  const currentLabel =
    monthOptions[currentIndex]?.label ??
    month;

  const canGoBack =
    currentIndex > 0;

  const canGoForward =
    currentIndex <
    monthOptions.length - 1;

  const goBack = () => {
    if (!canGoBack) return;

    setMonth(
      monthOptions[
        currentIndex - 1
      ].value
    );
  };

  const goForward = () => {
    if (!canGoForward) return;

    setMonth(
      monthOptions[
        currentIndex + 1
      ].value
    );
  };

  const chartData = useMemo(() => {
    if (isLoading) {
      return [];
    }

    return summary.dailyChart ?? [];
  }, [
    summary.dailyChart,
    isLoading,
  ]);

  const calendarButton = (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Calendar"
      activeOpacity={0.7}
    >
      <Ionicons
        name="calendar-outline"
        size={22}
        color="black"
      />
    </TouchableOpacity>
  );

  /*
   * ========================================
   * DOWNLOAD MONTHLY INCOME REPORT
   * ========================================
   */
  const handleDownloadReport = async () => {
    if (isDownloading || isLoading) {
      return;
    }

    const [monthValue, yearValue] = month
      .split("/")
      .map(Number);

    if (
      !monthValue ||
      !yearValue ||
      monthValue < 1 ||
      monthValue > 12
    ) {
      Alert.alert(
        "មានបញ្ហា",
        "មិនអាចបង្កើតរបាយការណ៍បានទេ"
      );
      return;
    }

    if (summary.dailyChart.length === 0) {
      Alert.alert(
        "មិនមានទិន្នន័យ",
        "មិនមានទិន្នន័យចំណូលសម្រាប់ខែនេះទេ"
      );
      return;
    }

    setIsDownloading(true);

    try {
      const { uri, html } =
        await generateMonthlyIncomeReport({
          month: monthValue,
          year: yearValue,
          summary,
        });

      const sharingAvailable =
        await Sharing.isAvailableAsync();

      if (sharingAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle:
            "ទាញយករបាយការណ៍ចំណូល",
          UTI: "com.adobe.pdf",
        });
      } else {
        await Print.printAsync({
          html,
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error(
          "[MONTHLY INCOME REPORT] Failed:",
          error
        );
      }

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      const isCancel =
        /cancel|dismiss|user.*(cancel|dismiss)/i.test(
          message
        );

      if (!isCancel) {
        Alert.alert(
          "មានបញ្ហា",
          "មិនអាចបង្កើតរបាយការណ៍បានទេ"
        );
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <DetailLayout
      title="ចំណូលប្រចាំខែ"
      onBack={onBack}
      rightAction={calendarButton}
    >
      <View className="mx-5 mt-1 flex-row items-center justify-between rounded-full bg-white px-5 py-3">
        <TouchableOpacity
          onPress={goBack}
          disabled={!canGoBack}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={
              canGoBack
                ? "#6B7280"
                : "#D1D5DB"
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            setMonthDropdownOpen(true)
          }
          activeOpacity={0.7}
          className="flex-row items-center px-3 py-1"
        >
          <Text
            className="font-khmer text-xl text-gray-800"
            maxFontSizeMultiplier={1.3}
          >
            {currentLabel}
          </Text>

          <Ionicons
            name="chevron-down"
            size={14}
            color="#6B7280"
            style={{
              marginLeft: 4,
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goForward}
          disabled={!canGoForward}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={
              canGoForward
                ? "#6B7280"
                : "#D1D5DB"
            }
          />
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={monthDropdownOpen}
        animationType="fade"
        onRequestClose={() =>
          setMonthDropdownOpen(false)
        }
      >
        <Pressable
          className="flex-1 bg-black/20"
          onPress={() =>
            setMonthDropdownOpen(false)
          }
        >
          <View
            className="absolute self-center rounded-xl border border-gray-100 bg-white py-1"
            style={{
              top: 110,
              width: 220,
              maxHeight: 350,
            }}
          >
            <FlatList
              data={monthOptions}
              keyExtractor={(item) =>
                item.value
              }
              showsVerticalScrollIndicator={
                false
              }
              initialScrollIndex={
                currentIndex > 0
                  ? Math.max(
                      currentIndex - 2,
                      0
                    )
                  : 0
              }
              getItemLayout={(
                _data,
                index
              ) => ({
                length: 46,
                offset: 46 * index,
                index,
              })}
              renderItem={({ item }) => {
                const selected =
                  item.value === month;

                return (
                  <TouchableOpacity
                    onPress={() => {
                      if (
                        item.value ===
                        month
                      ) {
                        setMonthDropdownOpen(
                          false
                        );
                        return;
                      }

                      setMonth(
                        item.value
                      );

                      setMonthDropdownOpen(
                        false
                      );
                    }}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between px-4 py-2.5"
                  >
                    <Text
                      className={`font-khmer text-xl ${
                        selected
                          ? "text-blue-600"
                          : "text-gray-700"
                      }`}
                      numberOfLines={1}
                      maxFontSizeMultiplier={
                        1.3
                      }
                    >
                      {item.label}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={17}
                        color="#2563EB"
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>

      {isLoading &&
      summary.dailyChart.length === 0 ? (
        <LoadingState
          text="កំពុងផ្ទុកទិន្នន័យចំណូល..."
        />
      ) : error &&
        summary.dailyChart.length === 0 ? (
        <ErrorState
          onRetry={refresh}
        />
      ) : (
        <FlatList
          key={month}
          className="flex-1 px-5 pt-3"
          data={summary.debtors}
          keyExtractor={(item) =>
            item.id
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={{
            paddingBottom: 8,
          }}
          refreshing={isRefreshing}
          onRefresh={refresh}
          ListHeaderComponent={
            <>
              <View className="flex-row items-center justify-between rounded-2xl bg-blue-600 p-4">
                <View className="flex-1">
                  <Text className="font-khmer text-xl text-white/80">
                    ចំណូលសរុប
                  </Text>

                  <Text
                    className="mt-1 font-khmerBold text-3xl text-white"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                    maxFontSizeMultiplier={1.3}
                  >
                    $
                    {summary.totalIncome.toFixed(
                      2
                    )}
                  </Text>

                  <Text className="mt-1 font-khmer text-[16px] text-white/70">
                    ការបញ្ជាទិញ{" "}
                    {summary.orderCount}{" "}
                    ការកម្មង់
                  </Text>
                </View>

                <View className="h-11 w-11 items-center justify-center rounded-full bg-white/20">
                  <Ionicons
                    name="wallet-outline"
                    size={20}
                    color="white"
                  />
                </View>
              </View>

             

              <View className="mt-4 rounded-2xl bg-white p-4">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text
                    className="mr-2 flex-1 font-khmerBold text-xl text-gray-900"
                    numberOfLines={2}
                    maxFontSizeMultiplier={1.3}
                  >
                    ក្រាហ្វចំណូលប្រចាំខែ
                  </Text>

                  <View className="rounded-full bg-gray-100 px-3 py-1">
                    <Text
                      className="font-khmer text-xl text-gray-600"
                      maxFontSizeMultiplier={1.3}
                    >
                      ថ្ងៃ
                    </Text>
                  </View>
                </View>

                <RevenueBarChart
                  key={`chart-${month}`}
                  data={chartData}
                  totalIncome={
                    summary.totalIncome
                  }
                  height={180}
                />
              </View>

              <View className="mt-4">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text
                    className="mr-2 flex-1 font-khmerBold text-xl text-gray-900"
                    numberOfLines={2}
                    maxFontSizeMultiplier={1.3}
                  >
                    ចំណូលអតិថិជនសរុប
                  </Text>

                  <TouchableOpacity
                    onPress={
                      onGoDebtors
                    }
                    activeOpacity={0.7}
                    className="flex-row items-center"
                  >
                    <Text
                      className="font-khmer text-xl text-blue-600"
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.3}
                    >
                      មើលទាំងអស់
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={13}
                      color="#2563EB"
                      style={{
                        marginLeft: 3,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
 {/* DOWNLOAD MONTHLY INCOME REPORT BUTTON */}

              <TouchableOpacity
                onPress={handleDownloadReport}
                disabled={isDownloading}
                activeOpacity={0.8}
                className="mt-4 flex-row h-12 items-center justify-center rounded-2xl bg-blue-600"
              >
                {isDownloading ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

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
            </>
          }
          ListEmptyComponent={
            isLoading ? (
              <LoadingState
                compact
                text="កំពុងផ្ទុកចំណូលអតិថិជន..."
              />
            ) : error ? (
              <ErrorState
                compact
                onRetry={refresh}
              />
            ) : (
              <EmptyState
                compact
                icon="people-outline"
                text="មិនមានចំណូលអតិថិជន"
              />
            )
          }
          ListFooterComponent={
            <>
              <OutstandingDebtCard
                totalDebt={
                  summary.totalDebt
                }
                debtorCount={
                  summary.debtors.length
                }
              />

              <View className="h-6" />
            </>
          }
          renderItem={({ item }) => (
            <DebtorListItem
              debtor={item}
            />
          )}
          
        />
      )}
    </DetailLayout>
  );
}