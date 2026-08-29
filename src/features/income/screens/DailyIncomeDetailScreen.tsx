import { useState } from "react";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useDailyIncome } from "../hooks/useDailyIncome";
import { IncomeOrderRow } from "../components/IncomeOrderRow";

import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/states";

import { DetailLayout } from "../../../layouts/DetailLayout";

type DailyIncomeDetailScreenProps = {
  onBack: () => void;
};

/**
 * Format Date -> DD/MM/YYYY
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Parse DD/MM/YYYY -> Date
 */
function parseDate(value: string): Date {
  const parts = value.split("/");

  if (parts.length === 3) {
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);

    if (
      Number.isFinite(day) &&
      Number.isFinite(month) &&
      Number.isFinite(year)
    ) {
      return new Date(year, month - 1, day);
    }
  }

  return new Date();
}

/**
 * Change selected date by N days.
 */
function changeDate(value: string, days: number): string {
  const date = parseDate(value);

  date.setDate(date.getDate() + days);

  return formatDate(date);
}

/**
 * Today's date.
 */
function getToday(): string {
  return formatDate(new Date());
}

export function DailyIncomeDetailScreen({
  onBack,
}: DailyIncomeDetailScreenProps) {
  const [date, setDate] = useState(getToday);

  const {
    summary,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useDailyIncome(date);

  /*
   * ========================================
   * PREVIOUS DAY
   * ========================================
   */
  const handlePreviousDay = () => {
    setDate((current) => changeDate(current, -1));
  };

  /*
   * ========================================
   * NEXT DAY
   * ========================================
   */
  const handleNextDay = () => {
    setDate((current) => changeDate(current, 1));
  };

  /*
   * ========================================
   * GO TO TODAY
   * ========================================
   */
  const handleCalendar = () => {
    setDate(getToday());
  };

  /*
   * ========================================
   * CALENDAR BUTTON
   * ========================================
   */
  const calendarButton = (
    <TouchableOpacity
      onPress={handleCalendar}
      accessibilityRole="button"
      accessibilityLabel="Calendar"
      hitSlop={{
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      }}
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
   * DOWNLOAD DAILY INCOME REPORT
   * ========================================
   */
  const handleDownloadReport = async () => {
    try {
      const orderRows = summary.orders
        .map(
          (order, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(order.code)}</td>
              <td>${escapeHtml(order.customerName)}</td>
              <td>${escapeHtml(order.time)}</td>
              <td>$${Number(order.amount ?? 0).toFixed(2)}</td>
            </tr>
          `
        )
        .join("");

      const html = `
        <!DOCTYPE html>

        <html>
          <head>
            <meta charset="UTF-8" />

            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />

            <style>
              * {
                box-sizing: border-box;
              }

              body {
                font-family: Arial, sans-serif;
                padding: 30px;
                color: #1f2937;
                background: #ffffff;
              }

              .header {
                text-align: center;
                margin-bottom: 25px;
              }

              .title {
                font-size: 24px;
                font-weight: bold;
              }

              .date {
                margin-top: 6px;
                color: #6b7280;
                font-size: 14px;
              }

              .summary {
                background: #080808;
                color: white;
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 20px;
              }

              .summary-title {
                font-size: 14px;
                opacity: 0.85;
              }

              .income {
                font-size: 28px;
                font-weight: bold;
                margin-top: 6px;
              }

              .orders-count {
                margin-top: 6px;
                opacity: 0.85;
              }

              h2 {
                font-size: 18px;
                margin-top: 25px;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 12px;
              }

              th {
                background: #f3f4f6;
                text-align: left;
                padding: 10px;
                font-size: 12px;
              }

              td {
                padding: 10px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 12px;
              }

              .amount {
                text-align: right;
                font-weight: bold;
              }

              .breakdown {
                margin-top: 25px;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 15px;
              }

              .row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
              }

              .total {
                border-top: 1px solid #e5e7eb;
                margin-top: 8px;
                padding-top: 12px;
                font-weight: bold;
                font-size: 16px;
              }

              .footer {
                text-align: center;
                color: #9ca3af;
                margin-top: 30px;
                font-size: 11px;
              }

              .empty {
                text-align: center;
                color: #9ca3af;
                padding: 20px;
              }
            </style>
          </head>

          <body>

            <!-- HEADER -->

            <div class="header">
              <div class="title">
                របាយការណ៍ចំណូលប្រចាំថ្ងៃ
              </div>

              <div class="date">
                ${escapeHtml(summary.date)}
              </div>
            </div>


            <!-- TOTAL INCOME -->

            <div class="summary">

              <div class="summary-title">
                ចំណូលសរុប
              </div>

              <div class="income">
                $${Number(summary.totalIncome ?? 0).toFixed(2)}
              </div>

              <div class="orders-count">
                ការបញ្ជាទិញ ${Number(summary.orderCount ?? 0)}
              </div>

            </div>


            <!-- ORDERS -->

            <h2>
              ការបញ្ជាទិញ
            </h2>

            ${
              summary.orders.length > 0
                ? `
                  <table>

                    <thead>
                      <tr>
                        <th>#</th>
                        <th>លេខកូដ</th>
                        <th>អតិថិជន</th>
                        <th>ម៉ោង</th>
                        <th>ចំនួនទឹកប្រាក់</th>
                      </tr>
                    </thead>

                    <tbody>
                      ${orderRows}
                    </tbody>

                  </table>
                `
                : `
                  <div class="empty">
                    មិនមានការបញ្ជាទិញ
                  </div>
                `
            }


            <!-- INCOME BREAKDOWN -->

            <div class="breakdown">

              <div class="row">
                <span>
                  សាច់ប្រាក់ចូល
                </span>

                <span>
                  $${Number(summary.cashCollected ?? 0).toFixed(2)}
                </span>
              </div>
              <div class="row">
                <span>
                  បញ្ចុះតម្លៃ
                </span>
                <span>
                  $${Number(summary.discount ?? 0).toFixed(2)}
                </span>
              </div>
              <div class="row">
                <span>
                  ចំណាយផ្សេង
                </span>
                <span>
                  $${Number(summary.otherExpense ?? 0).toFixed(2)}
                </span>
              </div>
              <div class="row total">
                <span>
                  សរុបទាំងអស់
                </span>

                <span>
                  $${Number(summary.netTotal ?? 0).toFixed(2)}
                </span>
              </div>

            </div>


            <!-- FOOTER -->

            <div class="footer">
              Generated by DBM App
            </div>

          </body>
        </html>
      `;

      /*
       * ========================================
       * CREATE PDF
       * ========================================
       */

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (!uri) {
        throw new Error("PDF URI was not generated");
      }

      /*
       * ========================================
       * SHARE PDF
       * ========================================
       */

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
        /*
         * Fallback for platforms where
         * sharing is unavailable.
         */

        await Print.printAsync({
          html,
        });
      }
    } catch (error) {
      console.error(
        "[DAILY INCOME REPORT] Failed:",
        error
      );

      Alert.alert(
        "មានបញ្ហា",
        "មិនអាចបង្កើតរបាយការណ៍បានទេ"
      );
    }
  };

  return (
    <DetailLayout
      title="ចំណូលប្រចាំថ្ងៃ"
      onBack={onBack}
      rightAction={calendarButton}
    >

      <View className="bg-white px-5 py-3 flex-row items-center justify-between rounded-full mt-1">

        {/* Previous */}

        <TouchableOpacity
          onPress={handlePreviousDay}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color="#6B7280"
          />
        </TouchableOpacity>


        {/* Selected date */}

        <TouchableOpacity
          onPress={handleCalendar}
          className="flex-row items-center gap-1.5"
          activeOpacity={0.7}
        >
          <Text className="font-khmer text-gray-800 text-xl">
            {date}
          </Text>

          <Ionicons
            name="calendar-outline"
            size={14}
            color="#9CA3AF"
          />
        </TouchableOpacity>


        {/* Next */}

        <TouchableOpacity
          onPress={handleNextDay}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#6B7280"
          />
        </TouchableOpacity>

      </View>


      {/* ====================================
          LOADING / ERROR / CONTENT
      ==================================== */}

      {isLoading && summary.orders.length === 0 ? (
        <LoadingState
          text="កំពុងផ្ទុកទិន្នន័យចំណូល..."
        />
      ) : error && summary.orders.length === 0 ? (
        <ErrorState onRetry={refresh} />
      ) : (
        <FlatList
          className="flex-1 px-5 pt-3"
          data={summary.orders}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 8,
          }}
          refreshing={isRefreshing}
          onRefresh={refresh}

          /*
           * ==================================
           * HEADER
           * ==================================
           */

          ListHeaderComponent={
            <>
              {/* DAILY SUMMARY */}

              <View className="bg-blue-600 rounded-2xl p-4 flex-row items-center justify-between">

                <View>

                  <Text className="font-khmerMedium text-white/80 text-lg">
                    ចំណូលសរុប
                  </Text>

                  <Text className="font-khmerBold text-white text-2xl mt-1" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} maxFontSizeMultiplier={1.3} style={{ width: "100%" }}>
                    $
                    {Number(
                      summary.totalIncome ?? 0
                    ).toFixed(2)}
                  </Text>

                  <Text className="font-khmerMedium text-white/70 text-[16px] mt-1">
                    ការបញ្ជាទិញ{" "}
                    {Number(
                      summary.orderCount ?? 0
                    )}{" "}
                    ការកម្មង់
                  </Text>

                </View>


                <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center">

                  <Ionicons
                    name="wallet-outline"
                    size={20}
                    color="white"
                  />

                </View>

              </View>


              {/* ORDER TITLE */}

              <Text className="font-khmerBold text-gray-900 text-xl mt-4 mb-2">
                ការបញ្ជាទិញ
              </Text>
            </>
          }

          ListEmptyComponent={
            <EmptyState
              compact
              icon="receipt-outline"
              text="មិនមានការបញ្ជាទិញថ្ងៃនេះ"
            />
          }


          /*
           * ==================================
           * FOOTER
           * ==================================
           */

          ListFooterComponent={
            <>

              {/* BREAKDOWN */}

              <View className="bg-white rounded-2xl p-4 mt-2">

                {/* Cash */}

                <View className="flex-row items-center justify-between py-1.5">

                  <Text className="font-khmer text-gray-500 text-xl">
                    សាច់ប្រាក់ចូល
                  </Text>

                  <Text className="font-khmer text-gray-800 text-xl flex-shrink ml-3 text-right" numberOfLines={1} maxFontSizeMultiplier={1.3}>
                    $
                    {Number(
                      summary.cashCollected ?? 0
                    ).toFixed(2)}
                  </Text>

                </View>


                {/* Discount */}

                <View className="flex-row items-center justify-between py-1.5">

                  <Text className="font-khmer text-gray-500 text-xl">
                    បញ្ចុះតម្លៃ
                  </Text>

                  <Text className="font-khmer text-gray-800 text-xl flex-shrink ml-3 text-right" numberOfLines={1} maxFontSizeMultiplier={1.3}>
                    $
                    {Number(
                      summary.discount ?? 0
                    ).toFixed(2)}
                  </Text>

                </View>


                {/* Other expense */}

                <View className="flex-row items-center justify-between py-1.5">

                  <Text className="font-khmer text-gray-500 text-xl">
                    ចំណាយផ្សេង
                  </Text>

                  <Text className="font-khmer text-gray-800 text-xl flex-shrink ml-3 text-right" numberOfLines={1} maxFontSizeMultiplier={1.3}>
                    $
                    {Number(
                      summary.otherExpense ?? 0
                    ).toFixed(2)}
                  </Text>

                </View>


                {/* Net */}

                <View className="flex-row items-center justify-between pt-2 mt-1 border-t border-gray-100">

                  <Text className="font-khmerBold text-gray-900 text-xl">
                    សរុបចំណេញ
                  </Text>

                  <Text className="font-khmerBold text-blue-600 text-xl flex-shrink ml-3 text-right" numberOfLines={1} maxFontSizeMultiplier={1.3}>
                    $
                    {Number(
                      summary.netTotal ?? 0
                    ).toFixed(2)}
                  </Text>

                </View>

              </View>


              {/* REPORT BUTTON */}

              <TouchableOpacity
                onPress={handleDownloadReport}
                activeOpacity={0.8}
                className="bg-blue-600 rounded-xl h-12 items-center justify-center flex-row gap-2 mt-4 mb-6"
              >

                <Ionicons
                  name="download-outline"
                  size={16}
                  color="white"
                />

                <Text className="font-khmerBold text-white text-xl">
                  ទាញយកជារបាយការណ៍
                </Text>

              </TouchableOpacity>

            </>
          }


          /*
           * ==================================
           * ORDER ROW
           * ==================================
           */

          renderItem={({ item }) => (
            <IncomeOrderRow order={item} />
          )}
        />
      )}
    </DetailLayout>
  );
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}