import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * MonthlyOrderCard
 *
 * Renders a single completed order for the monthly income screen.
 *
 * IMPORTANT: the order data from the real API is FLAT — the customer is a
 * plain `customerName` string, NOT a nested `customer` object. There is no
 * `order.customer.displayName` in the payload. This card therefore receives
 * pre-mapped primitive fields and only ever renders strings/numbers.
 *
 * It is fully null-safe: loose/missing `customerName` falls back to a
 * meaningful "Unknown" label, missing amount defaults to $0.00.
 */

type MonthlyOrderCardProps = {
  code: string;
  /** Flat customer display name from the API (may be empty/null on old orders). */
  customerName?: string | null;
  /** Full display date/time, e.g. "28/09/2026 14:30". */
  dateLabel: string;
  amount?: number | null;
};

export function MonthlyOrderCard({
  code,
  customerName,
  dateLabel,
  amount,
}: MonthlyOrderCardProps) {
  const safeAmount = Number(amount ?? 0);

  return (
    <View className="mb-2 flex-row items-center rounded-2xl bg-white px-4 py-3">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-50">
        <Ionicons name="bag-handle-outline" size={18} color="#2563EB" />
      </View>

      <View className="ml-3 flex-1" style={{ minWidth: 0 }}>
        <Text
          className="font-khmerBold text-base text-gray-900"
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          {code}
        </Text>

        <Text
          className="mt-0.5 font-khmer text-xs text-gray-500"
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          {customerName ?? "Unknown"}
        </Text>

        <Text
          className="font-khmer text-xs text-gray-400"
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          {dateLabel}
        </Text>
      </View>

      <Text
        className="ml-2 font-khmerBold text-base text-gray-900"
        numberOfLines={1}
        maxFontSizeMultiplier={1.3}
      >
        ${safeAmount.toFixed(2)}
      </Text>
    </View>
  );
}