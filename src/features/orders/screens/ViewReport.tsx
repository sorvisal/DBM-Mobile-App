import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import type { Order } from "../types/types";

type ViewReportProps = {
  order: Order;
  onBack: () => void;
};

/*
 * ============================================================
 * PAYMENT / CURRENCY
 * ============================================================
 *
 * CreateOrderScreen:
 *
 * cash = KHR
 * bank = USD
 *
 * Exchange rate:
 * 1 USD = 4,046.81 KHR
 */
const USD_TO_KHR = 4046.81;

const PAYMENT_CURRENCY_LABELS: Record<
  string,
  string
> = {
  cash: "🇰🇭 លុយខ្មែរ (៛)",
  bank: "🇺🇸 លុយដុល្លារ ($)",
};

/*
 * ============================================================
 * CURRENCY HELPERS
 * ============================================================
 */

function formatUSD(amount: number) {
  return `$${amount.toFixed(2)}`;
}

function formatKHR(amount: number) {
  return `${Math.round(amount).toLocaleString(
    "en-US"
  )} ៛`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("km-KH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/*
 * ============================================================
 * BUILD PDF HTML
 * ============================================================
 */

function buildInvoiceHtml(order: Order) {
  /*
   * ==========================================================
   * PAYMENT CURRENCY
   * ==========================================================
   */

  const isKHRPayment =
    order.paymentMethod === "cash";

  const paidUSD =
    order.paidAmount ?? 0;

  const remainingUSD =
    order.remainingAmount ?? 0;

  const paidKHR =
    paidUSD * USD_TO_KHR;

  const remainingKHR =
    remainingUSD * USD_TO_KHR;

  const totalKHR =
    order.total * USD_TO_KHR;

  const subtotalKHR =
    order.subtotal * USD_TO_KHR;

  /*
   * ==========================================================
   * ITEMS
   * ==========================================================
   *
   * Product prices remain USD because stock prices
   * are stored in USD.
   */

  const itemsHtml = order.lines
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>

          <td>
            ${escapeHtml(item.name)}
          </td>

          <td class="center">
            ${item.qty}
          </td>

          <td class="right">
            $${item.price.toFixed(2)}
          </td>

          <td class="right">
            $${(
              item.price * item.qty
            ).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");

  /*
   * ==========================================================
   * PAYMENT STATUS
   * ==========================================================
   */

  const paymentStatus =
    order.paymentStatus === "paid"
      ? "បានបង់ប្រាក់រួច"
      : order.paymentStatus === "partial"
      ? "បង់រួចផ្នែក"
      : "មិនទាន់បង់ប្រាក់";

  /*
   * ==========================================================
   * PAYMENT CURRENCY LABEL
   * ==========================================================
   */

  const paymentCurrency =
    order.paymentMethod
      ? PAYMENT_CURRENCY_LABELS[
          order.paymentMethod
        ] ??
        order.paymentMethod
      : "-";

  /*
   * ==========================================================
   * PAYMENT DISPLAY FOR PDF
   * ==========================================================
   */

  const paidDisplay = isKHRPayment
    ? `
        ${formatKHR(paidKHR)}
        <br />
        <span class="small-muted">
          (${formatUSD(paidUSD)})
        </span>
      `
    : formatUSD(paidUSD);

  const remainingDisplay =
    isKHRPayment
      ? `
          ${formatKHR(
            remainingKHR
          )}
          <br />
          <span class="small-muted">
            (${formatUSD(
              remainingUSD
            )})
          </span>
        `
      : formatUSD(
          remainingUSD
        );

  const totalDisplay = isKHRPayment
    ? `
        ${formatKHR(totalKHR)}
        <br />
        <span class="small-muted">
          (${formatUSD(order.total)})
        </span>
      `
    : formatUSD(
        order.total
      );

  const subtotalDisplay =
    isKHRPayment
      ? `
          ${formatKHR(
            subtotalKHR
          )}
          <br />
          <span class="small-muted">
            (${formatUSD(
              order.subtotal
            )})
          </span>
        `
      : formatUSD(
          order.subtotal
        );

  return `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8" />

<style>

  @page {
    size: A4;
    margin: 18mm 16mm;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
  }

  body {
    font-family: Arial, "Noto Sans Khmer", sans-serif;
    color: #111827;
    background: #ffffff;
    font-size: 13px;
    line-height: 1.45;
  }

  .header {
    text-align: center;
    margin-bottom: 16px;
    margin-top: 8px;
  }

  .title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 3px;
  }

  .subtitle {
    color: #6b7280;
    font-size: 12px;
    letter-spacing: 0.5px;
  }

  .divider {
    border-top: 1px solid #e5e7eb;
    margin: 14px 0;
  }

  .section-title {
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .info-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
  }

  .info-table td {
    padding: 3px 0;
    vertical-align: top;
    font-size: 12.5px;
  }

  .label {
    color: #6b7280;
    width: 38%;
  }

  .value {
    text-align: right;
    font-weight: 600;
  }

  .items {
    width: 100%;
    border-collapse: collapse;
    margin-top: 6px;
  }

  .items th {
    background: #f3f4f6;
    padding: 8px 6px;
    font-size: 11.5px;
    text-align: left;
  }

  .items td {
    border-bottom: 1px solid #e5e7eb;
    padding: 8px 6px;
    font-size: 12px;
  }

  .center {
    text-align: center;
  }

  .right {
    text-align: right;
  }

  .summary {
    width: 100%;
    margin-top: 14px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 12.5px;
  }

  .total {
    font-size: 17px;
    font-weight: bold;
    border-top: 2px solid #111827;
    margin-top: 6px;
    padding-top: 8px;
  }

  .small-muted {
    color: #9ca3af;
    font-size: 10.5px;
  }

  .currency-note {
    color: #6b7280;
    font-size: 10.5px;
    margin-top: 3px;
  }

  .note {
    background: #f9fafb;
    border-radius: 8px;
    padding: 11px;
    margin-top: 14px;
    font-size: 12px;
    line-height: 1.45;
  }

  .footer {
    text-align: center;
    margin-top: 20px;
    font-size: 11px;
    color: #6b7280;
  }

</style>

</head>

<body>

  <!-- ======================================================
       HEADER
  ======================================================= -->

  <div class="header">

    <div class="title">
      វិក័យប័ត្រ
    </div>

    <div class="subtitle">
      ORDER INVOICE
    </div>

  </div>

  <div class="divider"></div>

  <!-- ======================================================
       ORDER INFORMATION
  ======================================================= -->

  <div class="section-title">
    ព័ត៌មានការបញ្ជាទិញ
  </div>

  <table class="info-table">

    <tr>
      <td class="label">
        លេខបញ្ជាទិញ
      </td>

      <td class="value">
        ${escapeHtml(order.code)}
      </td>
    </tr>

    <tr>
      <td class="label">
        កាលបរិច្ឆេទ
      </td>

      <td class="value">
        ${escapeHtml(
          formatDate(
            order.createdAt
          )
        )}
      </td>
    </tr>

    <tr>
      <td class="label">
        អតិថិជន
      </td>

      <td class="value">
        ${escapeHtml(
          order.customer.name
        )}
      </td>
    </tr>

    ${
      order.customer.phone
        ? `
    <tr>
      <td class="label">
        ទូរស័ព្ទ
      </td>

      <td class="value">
        ${escapeHtml(
          order.customer.phone
        )}
      </td>
    </tr>
    `
        : ""
    }

    ${
      order.address
        ? `
    <tr>
      <td class="label">
        អាស័យដ្ឋាន
      </td>

      <td class="value">
        ${escapeHtml(
          order.address
        )}
      </td>
    </tr>
    `
        : ""
    }

  </table>

  <div class="divider"></div>

  <!-- ======================================================
       ITEMS
  ======================================================= -->

  <div class="section-title">
    ទំនិញ
  </div>

  <table class="items">

    <thead>
      <tr>
        <th>#</th>
        <th>ទំនិញ</th>
        <th>ចំនួន</th>
        <th>តម្លៃ</th>
        <th>សរុប</th>
      </tr>
    </thead>

    <tbody>
      ${itemsHtml}
    </tbody>

  </table>

  <!-- ======================================================
       SUMMARY
  ======================================================= -->

  <div class="summary">

    <div class="summary-row">

      <span>
        សរុបទំនិញ
      </span>

      <span>
        ${subtotalDisplay}
      </span>

    </div>

    <div class="summary-row">

      <span>
        ថ្លៃដឹកជញ្ជូន
      </span>

      <span>
        ${formatUSD(
          order.deliveryFee
        )}
      </span>

    </div>

    <div class="summary-row total">

      <span>
        សរុប
      </span>

      <span>
        ${totalDisplay}
      </span>

    </div>

    <div class="summary-row">

      <span>
        បានបង់
      </span>

      <span>
        ${paidDisplay}
      </span>

    </div>

    ${
      remainingUSD > 0
        ? `
    <div class="summary-row">

      <span>
        នៅសល់
      </span>

      <span>
        ${remainingDisplay}
      </span>

    </div>
    `
        : ""
    }

  </div>

  <div class="divider"></div>

  <!-- ======================================================
       PAYMENT
  ======================================================= -->

  <div class="section-title">
    ការទូទាត់
  </div>

  <table class="info-table">

    <tr>

      <td class="label">
        ស្ថានភាព
      </td>

      <td class="value">
        ${paymentStatus}
      </td>

    </tr>

    ${
      order.paymentMethod
        ? `
    <tr>

      <td class="label">
        រូបិយប័ណ្ណ
      </td>

      <td class="value">
        ${escapeHtml(
          paymentCurrency
        )}
      </td>

    </tr>

    <tr>

      <td class="label">
        បានបង់
      </td>

      <td class="value">
        ${paidDisplay}
      </td>

    </tr>

    ${
      isKHRPayment
        ? `
    <tr>

      <td class="label">
        អត្រាប្តូរប្រាក់
      </td>

      <td class="value">
        1 USD = ${USD_TO_KHR.toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )} ៛
      </td>

    </tr>
    `
        : ""
    }

    `
        : ""
    }

  </table>

  ${
    order.note
      ? `
  <div class="note">

    <strong>
      កំណត់ចំណាំ
    </strong>

    <br />

    ${escapeHtml(
      order.note
    )}

  </div>
  `
      : ""
  }

  <div class="footer">
    សូមអរគុណសម្រាប់ការគាំទ្រ!
  </div>

</body>

</html>
`;
}

/*
 * ============================================================
 * VIEW REPORT SCREEN
 * ============================================================
 */

export function ViewReport({
  order,
  onBack,
}: ViewReportProps) {
  const [
    isGenerating,
    setIsGenerating,
  ] = useState(false);

  const insets =
    useSafeAreaInsets();

  /*
   * ==========================================================
   * PAYMENT DISPLAY DATA
   * ==========================================================
   */

  const isKHRPayment =
    order.paymentMethod === "cash";

  /*
   * Backend stores payment amount
   * in USD-equivalent.
   */
  const paidUSD =
    order.paidAmount ?? 0;

  const remainingUSD =
    order.remainingAmount ?? 0;

  /*
   * Convert USD → KHR only for display.
   */
  const paidKHR =
    paidUSD * USD_TO_KHR;

  const remainingKHR =
    remainingUSD * USD_TO_KHR;

  const totalKHR =
    order.total * USD_TO_KHR;

  const subtotalKHR =
    order.subtotal * USD_TO_KHR;

  const paymentCurrency =
    order.paymentMethod
      ? PAYMENT_CURRENCY_LABELS[
          order.paymentMethod
        ] ??
        order.paymentMethod
      : "-";

  /*
   * ==========================================================
   * DOWNLOAD PDF
   * ==========================================================
   */

  const handleDownload =
    async () => {
      if (isGenerating) {
        return;
      }

      setIsGenerating(true);

      try {
        const html =
          buildInvoiceHtml(
            order
          );

        /*
         * Generate PDF
         */
        const result =
          await Print.printToFileAsync(
            {
              html,
              base64: false,
            }
          );

        if (!result.uri) {
          throw new Error(
            "PDF was not generated."
          );
        }

        /*
         * Open native share/save sheet.
         */
        const sharingAvailable =
          await Sharing.isAvailableAsync();

        if (sharingAvailable) {
          await Sharing.shareAsync(
            result.uri,
            {
              mimeType:
                "application/pdf",
              dialogTitle:
                `វិក័យប័ត្រ ${order.code}`,
              UTI: "com.adobe.pdf",
            }
          );
        } else {
          Alert.alert(
            "ជោគជ័យ",
            "វិក័យប័ត្រ PDF ត្រូវបានបង្កើតរួចរាល់។"
          );
        }
      } catch (error) {
        if (__DEV__) {
          console.error(
            "[INVOICE] Generate PDF failed:",
            error
          );
        }

        Alert.alert(
          "កំហុស",
          "មិនអាចបង្កើតវិក័យប័ត្រ PDF បានទេ។ សូមព្យាយាមម្តងទៀត។"
        );
      } finally {
        setIsGenerating(
          false
        );
      }
    };

  return (
    <View className="flex-1 bg-gray-50">

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <View
        className="bg-white px-5 pb-4 border-b border-gray-100"
        style={{
          paddingTop:
            insets.top + 8,
        }}
      >
        <View className="flex-row items-center">

          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#111827"
            />
          </TouchableOpacity>

          <View className="flex-1 ml-3">

            <Text className="font-khmerBold text-gray-900 text-2xl">
              មើលវិក័យប័ត្រ
            </Text>

            <Text className="font-khmer text-gray-400 text-lg">
              {order.code}
            </Text>

          </View>

          <TouchableOpacity
            onPress={
              handleDownload
            }
            disabled={
              isGenerating
            }
            className="w-11 h-11 rounded-full bg-blue-50 items-center justify-center"
          >
            {isGenerating ? (
              <ActivityIndicator
                size="small"
                color="#2563EB"
              />
            ) : (
              <Ionicons
                name="download-outline"
                size={23}
                color="#2563EB"
              />
            )}
          </TouchableOpacity>

        </View>
      </View>

      {/* =====================================================
          INVOICE PREVIEW
      ====================================================== */}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 16,
          paddingBottom:
            140 + insets.bottom,
        }}
        showsVerticalScrollIndicator={
          false
        }
      >

        <View className="bg-white rounded-2xl p-5">

          {/* =================================================
              INVOICE HEADER
          ================================================== */}

          <View className="items-center mb-5">

            <View className="w-16 h-16 rounded-2xl bg-blue-50 items-center justify-center mb-3">
              <Ionicons
                name="receipt-outline"
                size={34}
                color="#2563EB"
              />
            </View>

            <Text className="font-khmerBold text-gray-900 text-2xl">
              វិក័យប័ត្រ
            </Text>

            <Text className="font-khmer text-gray-400 text-base mt-1">
              {order.code}
            </Text>

          </View>

          {/* =================================================
              CUSTOMER
          ================================================== */}

          <View className="border-t border-gray-100 pt-4">

            <Text className="font-khmerBold text-gray-900 text-xl mb-3">
              ព័ត៌មានអតិថិជន
            </Text>

            <View className="flex-row justify-between py-1">

              <Text className="font-khmer text-gray-400 text-lg">
                ឈ្មោះ
              </Text>

              <Text className="font-khmerMedium text-gray-800 text-lg text-right flex-1 ml-4">
                {order.customer.name}
              </Text>

            </View>

            {order.customer.phone ? (
              <View className="flex-row justify-between py-1">

                <Text className="font-khmer text-gray-400 text-lg">
                  ទូរស័ព្ទ
                </Text>

                <Text className="font-khmerMedium text-gray-800 text-lg">
                  {
                    order.customer
                      .phone
                  }
                </Text>

              </View>
            ) : null}

            {order.address ? (
              <View className="flex-row justify-between py-1">

                <Text className="font-khmer text-gray-400 text-lg">
                  អាស័យដ្ឋាន
                </Text>

                <Text className="font-khmerMedium text-gray-800 text-base text-right flex-1 ml-4">
                  {order.address}
                </Text>

              </View>
            ) : null}

          </View>

          {/* =================================================
              ITEMS
          ================================================== */}

          <View className="border-t border-gray-100 pt-4 mt-4">

            <Text className="font-khmerBold text-gray-900 text-xl mb-3">
              ទំនិញ
            </Text>

            {order.lines.map(
              (item, index) => (
                <View
                  key={`${item.id}-${index}`}
                  className="flex-row items-center py-3 border-b border-gray-50"
                >

                  <View className="w-7">

                    <Text className="font-khmer text-gray-400 text-xl">
                      {index + 1}
                    </Text>

                  </View>

                  <View className="flex-1">

                    <Text
                      className="font-khmerMedium text-gray-800 text-lg"
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>

                    <Text className="font-khmer text-gray-400 text-lg mt-0.5">
                      x{item.qty} × $
                      {item.price.toFixed(
                        2
                      )}
                    </Text>

                  </View>

                  <Text className="font-khmerBold text-gray-900 text-lg">

                    $
                    {(
                      item.price *
                      item.qty
                    ).toFixed(2)}

                  </Text>

                </View>
              )
            )}

          </View>

          {/* =================================================
              SUMMARY
          ================================================== */}

          <View className="border-t border-gray-100 pt-4 mt-4">

            {/* SUBTOTAL */}

            <View className="flex-row justify-between py-1.5">

              <Text className="font-khmer text-gray-500 text-lg">
                សរុបទំនិញ
              </Text>

              <View className="items-end">

                <Text className="font-khmerMedium text-gray-800 text-lg">
                  {isKHRPayment
                    ? formatKHR(
                        subtotalKHR
                      )
                    : formatUSD(
                        order.subtotal
                      )}
                </Text>

                {isKHRPayment ? (
                  <Text className="font-khmer text-gray-400 text-sm">
                    (
                    {formatUSD(
                      order.subtotal
                    )}
                    )
                  </Text>
                ) : null}

              </View>

            </View>

            {/* DELIVERY */}

            <View className="flex-row justify-between py-1.5">

              <Text className="font-khmer text-gray-500 text-lg">
                ថ្លៃដឹកជញ្ជូន
              </Text>

              <Text className="font-khmerMedium text-gray-800 text-lg">
                {formatUSD(
                  order.deliveryFee
                )}
              </Text>

            </View>

            {/* TOTAL */}

            <View className="flex-row justify-between border-t border-gray-200 mt-2 pt-3">

              <Text className="font-khmerBold text-gray-900 text-xl">
                សរុប
              </Text>

              <View className="items-end">

                <Text className="font-khmerBold text-blue-600 text-lg">
                  {isKHRPayment
                    ? formatKHR(
                        totalKHR
                      )
                    : formatUSD(
                        order.total
                      )}
                </Text>

                {isKHRPayment ? (
                  <Text className="font-khmer text-gray-400 text-sm">
                    (
                    {formatUSD(
                      order.total
                    )}
                    )
                  </Text>
                ) : null}

              </View>

            </View>

            {/* PAID */}

            <View className="flex-row justify-between py-1.5 mt-2">

              <Text className="font-khmer text-gray-500 text-lg">
                ទឹកប្រាក់ដែលបានបង់
              </Text>

              <View className="items-end">

                <Text className="font-khmerMedium text-green-600 text-lg">
                  {isKHRPayment
                    ? formatKHR(
                        paidKHR
                      )
                    : formatUSD(
                        paidUSD
                      )}
                </Text>

                {isKHRPayment ? (
                  <Text className="font-khmer text-gray-400 text-sm">
                    (
                    {formatUSD(
                      paidUSD
                    )}
                    )
                  </Text>
                ) : null}

              </View>

            </View>

            {/* REMAINING */}

            {remainingUSD > 0 ? (
              <View className="flex-row justify-between py-1.5">

                <Text className="font-khmer text-gray-500 text-lg">
                  នៅសល់
                </Text>

                <View className="items-end">

                  <Text className="font-khmerMedium text-red-600 text-lg">
                    {isKHRPayment
                      ? formatKHR(
                          remainingKHR
                        )
                      : formatUSD(
                          remainingUSD
                        )}
                  </Text>

                  {isKHRPayment ? (
                    <Text className="font-khmer text-gray-400 text-sm">
                      (
                      {formatUSD(
                        remainingUSD
                      )}
                      )
                    </Text>
                  ) : null}

                </View>

              </View>
            ) : null}

          </View>

          {/* =================================================
              PAYMENT
          ================================================== */}

          <View className="border-t border-gray-100 pt-4 mt-4">

            <Text className="font-khmerBold text-gray-900 text-xl mb-3">
              ការទូទាត់
            </Text>

            {/* STATUS */}

            <View className="flex-row justify-between py-1.5">

              <Text className="font-khmer text-gray-400 text-lg">
                ស្ថានភាព
              </Text>

              <Text className="font-khmerMedium text-green-600 text-lg">

                {order.paymentStatus ===
                "paid"
                  ? "បានបង់ប្រាក់រួច"
                  : order.paymentStatus ===
                    "partial"
                  ? "បង់រួចផ្នែក"
                  : "មិនទាន់បង់ប្រាក់"}

              </Text>

            </View>

            {/* CURRENCY */}

            {order.paymentMethod ? (
              <View className="flex-row justify-between py-1.5">

                <Text className="font-khmer text-gray-400 text-lg">
                  រូបិយប័ណ្ណ
                </Text>

                <Text className="font-khmerMedium text-gray-800 text-lg text-right">

                  {
                    paymentCurrency
                  }

                </Text>

              </View>
            ) : null}

            {/* PAID */}

            {order.paidAmount !=
            null ? (
              <View className="flex-row justify-between py-1.5">

                <Text className="font-khmer text-gray-400 text-lg">
                  បានបង់
                </Text>

                <View className="items-end">

                  <Text className="font-khmerMedium text-green-600 text-lg">

                    {isKHRPayment
                      ? formatKHR(
                          paidKHR
                        )
                      : formatUSD(
                          paidUSD
                        )}

                  </Text>

                  {isKHRPayment ? (
                    <Text className="font-khmer text-gray-400 text-sm">
                      (
                      {formatUSD(
                        paidUSD
                      )}
                      )
                    </Text>
                  ) : null}

                </View>

              </View>
            ) : null}

            {/* REMAINING */}

            {remainingUSD > 0 ? (
              <View className="flex-row justify-between py-1.5">

                <Text className="font-khmer text-gray-400 text-lg">
                  នៅសល់
                </Text>

                <View className="items-end">

                  <Text className="font-khmerMedium text-red-600 text-lg">

                    {isKHRPayment
                      ? formatKHR(
                          remainingKHR
                        )
                      : formatUSD(
                          remainingUSD
                        )}

                  </Text>

                  {isKHRPayment ? (
                    <Text className="font-khmer text-gray-400 text-sm">
                      (
                      {formatUSD(
                        remainingUSD
                      )}
                      )
                    </Text>
                  ) : null}

                </View>

              </View>
            ) : null}

            {/* EXCHANGE RATE */}

            {isKHRPayment ? (
              <View className="border-t border-gray-100 mt-2 pt-3">

                <Text className="font-khmer text-gray-400 text-sm text-center">
                  អត្រាប្តូរប្រាក់៖ 1 USD
                  ={" "}
                  {USD_TO_KHR.toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}{" "}
                  ៛
                </Text>

              </View>
            ) : null}

          </View>

          {/* =================================================
              NOTE
          ================================================== */}

          {order.note ? (
            <View className="bg-gray-50 rounded-xl p-3 mt-4">

              <Text className="font-khmerBold text-gray-700 text-xl mb-1">
                កំណត់ចំណាំ
              </Text>

              <Text className="font-khmer text-gray-600 text-lg leading-6">
                {order.note}
              </Text>

            </View>
          ) : null}
          <View className="items-center mt-7">

            <Text className="font-khmer text-gray-400 text-xl">
              សូមអរគុណសម្រាប់ចំពោះការកម្មង់របស់អ្នក❤️
            </Text>

          </View>

        </View>

      </ScrollView>
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-3"
        style={{
          paddingBottom:
            Math.max(
              insets.bottom,
              12
            ),
        }}
      >

        <TouchableOpacity
          onPress={
            handleDownload
          }
          disabled={
            isGenerating
          }
          className="h-12 rounded-xl bg-blue-600 items-center justify-center flex-row"
        >

          {isGenerating ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="download-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text className="font-khmerBold text-white text-xl ml-2">
                ទាញយកវិក័យប័ត្រ PDF
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}