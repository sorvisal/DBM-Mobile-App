import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ReactElement } from "react";

import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/states";

import type { CustomerOrderSummary } from "../types/customer.types";

const STATUS_COLORS: Record<
  string,
  {
    bg: string;
    text: string;
    iconColor: string;
  }
> = {
  "កំពុងដឹក": {
    bg: "bg-amber-50",
    text: "text-amber-600",
    iconColor: "#D97706",
  },

  "បានបញ្ចប់": {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    iconColor: "#059669",
  },

  "បោះបង់": {
    bg: "bg-rose-50",
    text: "text-rose-600",
    iconColor: "#E11D48",
  },

  "រង់ចាំ": {
    bg: "bg-orange-50",
    text: "text-orange-600",
    iconColor: "#EA580C",
  },

  "បញ្ជាក់": {
    bg: "bg-blue-50",
    text: "text-blue-600",
    iconColor: "#2563EB",
  },
};

type CustomerOrderHistoryListProps = {
  orders: CustomerOrderSummary[];

  isLoading?: boolean;
  isRefreshing?: boolean;

  error?: string | null;

  onRefresh?: () => void;
  onRetry?: () => void;

  onPressOrder?: (
    orderId: string
  ) => void;

  ListHeaderComponent?:
    | ReactElement
    | null;
};

/**
 * Normalize API status into the Khmer
 * status used by the UI.
 */
function getStatusText(
  status?: string
): string {
  if (!status) {
    return "រង់ចាំ";
  }

  switch (status.toLowerCase()) {
    case "pending":
      return "រង់ចាំ";

    case "confirmed":
      return "បញ្ជាក់";

    case "shipping":
    case "delivering":
    case "outfordelivery":
      return "កំពុងដឹក";

    case "completed":
      return "បានបញ្ចប់";

    case "cancelled":
    case "canceled":
      return "បោះបង់";

    /*
     * If the API already returns Khmer,
     * keep it.
     */
    case "រង់ចាំ":
    case "បញ្ជាក់":
    case "កំពុងដឹក":
    case "បានបញ្ចប់":
    case "បោះបង់":
      return status;

    default:
      return status;
  }
}

function getStatusTone(status?: string) {
  const statusText =
    getStatusText(status);

  return (
    STATUS_COLORS[statusText] ??
    STATUS_COLORS["រង់ចាំ"]
  );
}

function safeTotal(
  value: unknown
): number {
  const total = Number(value ?? 0);

  return Number.isFinite(total)
    ? total
    : 0;
}

function safeItemCount(
  value: unknown
): number {
  const count = Number(value ?? 0);

  return Number.isFinite(count)
    ? count
    : 0;
}

export function CustomerOrderHistoryList({
  orders,
  isLoading = false,
  isRefreshing = false,
  error = null,
  onRefresh,
  onRetry,
  onPressOrder,
  ListHeaderComponent,
}: CustomerOrderHistoryListProps) {
  /*
   * Remove duplicate orders.
   *
   * This is important because the same order
   * should never appear twice in customer history.
   */
  const uniqueOrders =
    (orders ?? []).filter(
      (order, index, array) =>
        array.findIndex(
          (item) =>
            String(item.id) ===
            String(order.id)
        ) === index
    );

  return (
    <FlatList
      className="flex-1 bg-gray-50"
      data={uniqueOrders}

      keyExtractor={(item) =>
        String(item.id)
      }

      showsVerticalScrollIndicator={false}

      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        flexGrow:
          uniqueOrders.length === 0
            ? 1
            : undefined,
      }}

      refreshing={isRefreshing}

      onRefresh={onRefresh}

      ListHeaderComponent={
        ListHeaderComponent
      }

      ListEmptyComponent={
        isLoading ? (
          <LoadingState compact />
        ) : error ? (
          <ErrorState
            compact
            message={error}
            onRetry={onRetry}
          />
        ) : (
          <EmptyState
            compact
            icon="receipt-outline"
            text="មិនមានប្រវត្តិការបញ្ជាទិញទេ"
          />
        )
      }

      renderItem={({ item }) => {
        /*
         * ==========================================
         * STATUS
         * ==========================================
         */
        const statusText =
          getStatusText(
            item.status
          );

        const tone =
          getStatusTone(
            item.status
          );

        /*
         * ==========================================
         * TOTAL
         * ==========================================
         *
         * Always convert to a safe number
         * before calling toFixed().
         */
        const total =
          safeTotal(item.total);

        /*
         * ==========================================
         * ITEM COUNT
         * ==========================================
         */
        const itemCount =
          safeItemCount(
            item.itemCount
          );

        return (
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={!onPressOrder}
            onPress={() =>
              onPressOrder?.(
                String(item.id)
              )
            }
            className="flex-row items-center bg-white rounded-2xl p-4 mb-3 border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.03,
              shadowRadius: 8,
              elevation: 1,
            }}
          >
            {/* ====================================
                LEFT ICON
            ==================================== */}
            <View
              className={`${tone.bg} w-11 h-11 rounded-xl items-center justify-center mr-3`}
            >
              <Ionicons
                name="bag-handle-outline"
                size={20}
                color={tone.iconColor}
              />
            </View>

            {/* ====================================
                MIDDLE CONTENT
            ==================================== */}
            <View className="flex-1">
              {/* --------------------------------
                  ORDER CODE + STATUS
              --------------------------------- */}
              <View className="flex-row items-center justify-between mb-1">
                <Text
                  className="font-khmerMedium text-gray-900 text-lg flex-1 mr-2"
                  numberOfLines={1}
                >
                  {item.code ||
                    `#${item.id}`}
                </Text>

                <View
                  className={`rounded-full px-2.5 py-0.5 ${tone.bg}`}
                >
                  <Text
                    className={`font-khmer text-lg font-medium ${tone.text}`}
                  >
                    {statusText}
                  </Text>
                </View>
              </View>

              {/* --------------------------------
                  DATE
              --------------------------------- */}
              <Text className="font-khmer text-gray-600 text-lg mb-2">
                {item.date || "-"}
              </Text>

              {/* --------------------------------
                  ITEM COUNT + TOTAL
              --------------------------------- */}
              <View className="flex-row items-center justify-between">
                <Text className="font-khmer text-gray-600 text-lg">
                  {itemCount} មុខទំនិញ
                </Text>

                <Text className="font-khmerBold text-blue-600 text-lg">
                  ${total.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* ====================================
                RIGHT ARROW
            ==================================== */}
            {onPressOrder && (
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#9CA3AF"
                style={{
                  marginLeft: 8,
                }}
              />
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
}