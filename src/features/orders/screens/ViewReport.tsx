import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
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

function buildInvoiceHtml(order: Order) {
  const itemsHtml = order.lines
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.name)}</td>
          <td class="center">${item.qty}</td>
          <td class="right">$${item.price.toFixed(2)}</td>
          <td class="right">
            $${(item.price * item.qty).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");

  const paymentStatus =
    order.paymentStatus === "paid"
      ? "បានបង់ប្រាក់រួច"
      : order.paymentStatus === "partial"
      ? "បង់រួចផ្នែក"
      : "មិនទាន់បង់ប្រាក់";

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

  html, body {
    margin: 0;
    padding: 0;
  }

  body {
    font-family: "Noto Sans Khmer", Arial, sans-serif;
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

  <div class="header">
    <div class="title">
      វិក័យប័ត្រ
    </div>

    <div class="subtitle">
      ORDER INVOICE
    </div>
  </div>

  <div class="divider"></div>

  <div class="section-title">
    ព័ត៌មានការបញ្ជាទិញ
  </div>

  <table class="info-table">
    <tr>
      <td class="label">លេខបញ្ជាទិញ</td>
      <td class="value">
        ${escapeHtml(order.code)}
      </td>
    </tr>

    <tr>
      <td class="label">កាលបរិច្ឆេទ</td>
      <td class="value">
        ${escapeHtml(formatDate(order.createdAt))}
      </td>
    </tr>

    <tr>
      <td class="label">អតិថិជន</td>
      <td class="value">
        ${escapeHtml(order.customer.name)}
      </td>
    </tr>

    ${
      order.customer.phone
        ? `
    <tr>
      <td class="label">ទូរស័ព្ទ</td>
      <td class="value">
        ${escapeHtml(order.customer.phone)}
      </td>
    </tr>
    `
        : ""
    }

    ${
      order.address
        ? `
    <tr>
      <td class="label">អាស័យដ្ឋាន</td>
      <td class="value">
        ${escapeHtml(order.address)}
      </td>
    </tr>
    `
        : ""
    }
  </table>

  <div class="divider"></div>

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

  <div class="summary">

    <div class="summary-row">
      <span>សរុបទំនិញ</span>
      <span>
        $${order.subtotal.toFixed(2)}
      </span>
    </div>

    <div class="summary-row">
      <span>ថ្លៃដឹកជញ្ជូន</span>
      <span>
        $${order.deliveryFee.toFixed(2)}
      </span>
    </div>

    <div class="summary-row total">
      <span>សរុប</span>
      <span>
        $${order.total.toFixed(2)}
      </span>
    </div>

    <div class="summary-row">
      <span>បានបង់</span>
      <span>
        $${(order.paidAmount ?? 0).toFixed(2)}
      </span>
    </div>

    ${
      (order.remainingAmount ?? 0) > 0
        ? `
    <div class="summary-row">
      <span>នៅសល់</span>
      <span>
        $${(order.remainingAmount ?? 0).toFixed(2)}
      </span>
    </div>
    `
        : ""
    }

  </div>

  <div class="divider"></div>

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
        វិធីបង់ប្រាក់
      </td>

      <td class="value">
        ${escapeHtml(order.paymentMethod)}
      </td>
    </tr>
    `
        : ""
    }
  </table>

  ${
    order.note
      ? `
  <div class="note">
    <strong>កំណត់ចំណាំ</strong><br />
    ${escapeHtml(order.note)}
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

export function ViewReport({
  order,
  onBack,
}: ViewReportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const insets = useSafeAreaInsets();

  const handleDownload = async () => {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);

    try {
      const html = buildInvoiceHtml(order);

      /**
       * Generate PDF.
       */
      const result =
        await Print.printToFileAsync({
          html,
          base64: false,
        });

      if (!result.uri) {
        throw new Error(
          "PDF was not generated."
        );
      }

      /**
       * Open native share/save sheet.
       *
       * iOS:
       *   Save to Files
       *   AirDrop
       *   Messages
       *   etc.
       *
       * Android:
       *   Files
       *   Drive
       *   Downloads
       *   other installed apps
       */
      const sharingAvailable =
        await Sharing.isAvailableAsync();

      if (sharingAvailable) {
        await Sharing.shareAsync(
          result.uri,
          {
            mimeType: "application/pdf",
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
      setIsGenerating(false);
    }
  };

  return (
        <View className="flex-1 bg-gray-50">
        <StatusBar
            barStyle="dark-content"
            backgroundColor="#FFFFFF"
            translucent={false}
        />

        {/* Header */}
        <View
            className="bg-white px-5 pb-4 border-b border-gray-100"
            style={{
            paddingTop: insets.top + 8,
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
            onPress={handleDownload}
            disabled={isGenerating}
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

      {/* Invoice preview */}
        <ScrollView
        className="flex-1"
        contentContainerStyle={{
            padding: 16,
            paddingBottom: 140 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-2xl p-5">
          {/* Invoice header */}
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

          {/* Customer */}
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
                  {order.customer.phone}
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

          {/* Items */}
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
                      {item.price.toFixed(2)}
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

          {/* Summary */}
          <View className="border-t border-gray-100 pt-4 mt-4">
            <View className="flex-row justify-between py-1.5">
              <Text className="font-khmer text-gray-500 text-lg">
                សរុបទំនិញ
              </Text>

              <Text className="font-khmerMedium text-gray-800 text-lg">
                ${order.subtotal.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between py-1.5">
              <Text className="font-khmer text-gray-500 text-lg">
                ថ្លៃដឹកជញ្ជូន
              </Text>

              <Text className="font-khmerMedium text-gray-800 text-lg">
                ${order.deliveryFee.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between border-t border-gray-200 mt-2 pt-3">
              <Text className="font-khmerBold text-gray-900 text-xl">
                សរុប
              </Text>

              <Text className="font-khmerBold text-blue-600 text-lg">
                ${order.total.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between py-1.5 mt-2">
              <Text className="font-khmer text-gray-500 text-lg">
                ទឹកប្រាក់ដែលបានបង់
              </Text>

              <Text className="font-khmerMedium text-green-600 text-lg">
                ${(order.paidAmount ?? 0).toFixed(2)}
              </Text>
            </View>

           {(order.remainingAmount ?? 0) > 0 ? (
            <View className="flex-row justify-between py-1.5">
                <Text className="font-khmer text-gray-500 text-lg">
                នៅសល់
                </Text>

                <Text className="font-khmerMedium text-red-600 text-lg">
                ${(order.remainingAmount ?? 0).toFixed(2)}
                </Text>
            </View>
            ) : null}
          </View>

          {/* Payment */}
          <View className="border-t border-gray-100 pt-4 mt-4">
            <Text className="font-khmerBold text-gray-900 text-xl mb-3">
              ការទូទាត់
            </Text>

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

            {order.paymentMethod ? (
              <View className="flex-row justify-between py-1.5">
                <Text className="font-khmer text-gray-400 text-lg">
                  វិធីបង់ប្រាក់
                </Text>

                <Text className="font-khmerMedium text-gray-800 text-lg">
                  {order.paymentMethod}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Note */}
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

          {/* Footer */}
          <View className="items-center mt-7">
            <Text className="font-khmer text-gray-400 text-xl">
              សូមអរគុណសម្រាប់ចំពោះការកម្មង់របស់អ្នក❤️
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Download button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-3"
        style={{
            paddingBottom: Math.max(insets.bottom, 12),
        }}
        >
        <TouchableOpacity
          onPress={handleDownload}
          disabled={isGenerating}
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