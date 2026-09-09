import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IncomeOrder } from "../types/income.types";

const STATUS_MAP: Record<
  IncomeOrder["status"],
  {
    label: string;
    bg: string;
    text: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  completed: {
    label: "បញ្ចប់",
    bg: "bg-green-50",
    text: "text-green-600",
    iconBg: "bg-orange-50",
    iconColor: "#EA580C",
  },

  shipping: {
    label: "កំពុងដឹក",
    bg: "bg-purple-50",
    text: "text-purple-600",
    iconBg: "bg-purple-50",
    iconColor: "#9333EA",
  },

  cancelled: {
    label: "បោះបង់",
    bg: "bg-red-50",
    text: "text-red-600",
    iconBg: "bg-red-50",
    iconColor: "#DC2626",
  },
};

/**
 * Format API date without timezone conversion.
 *
 * Example:
 *
 * 2026-08-28T03:30:00Z
 *
 * -> 28/08/2026 03:30
 *
 * We intentionally do NOT use:
 *
 * new Date(value).toLocaleString()
 *
 * because timezone conversion can change the
 * displayed calendar date/year.
 */
function formatOrderDate(value: unknown): string {
  if (!value) {
    return "-";
  }

  const text = String(value);

  const dateMatch = text.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (!dateMatch) {
    return text;
  }

  const [, year, month, day] = dateMatch;

  const timeMatch = text.match(
    /T(\d{2}):(\d{2})/
  );

  if (!timeMatch) {
    return `${day}/${month}/${year}`;
  }

  const [, hours, minutes] = timeMatch;

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

type IncomeOrderRowProps = {
  order: IncomeOrder;
  onPress?: () => void;
};

export function IncomeOrderRow({
  order,
  onPress,
}: IncomeOrderRowProps) {
  const tone =
    STATUS_MAP[order.status] ??
    STATUS_MAP.completed;

  /*
   * If IncomeOrder has createdAt,
   * use it directly.
   *
   * Otherwise keep the existing order.time.
   */
  const displayTime =
    "createdAt" in order &&
    order.createdAt
      ? formatOrderDate(order.createdAt)
      : order.time;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      className="flex-row items-center bg-white rounded-2xl p-3 mb-2"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      {/* Icon */}
      <View
        className={`${tone.iconBg} w-10 h-10 rounded-xl items-center justify-center`}
      >
        <Ionicons
          name="bag-handle-outline"
          size={18}
          color={tone.iconColor}
        />
      </View>

      {/* Information */}
      <View className="flex-1 ml-3">
        {/* Order code */}
        <Text
          className="font-khmerMedium text-gray-900 text-xl"
          numberOfLines={1}
        >
          {order.code}
        </Text>

        {/* Date / Time */}
        <Text className="font-khmer text-gray-400 text-[16px] mt-0.5" numberOfLines={1} maxFontSizeMultiplier={1.3}>
          {displayTime}
        </Text>

        {/* Customer */}
        <Text
          className="font-khmer text-gray-400 text-[16px] mt-0.5"
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          {order.customerName}
        </Text>
      </View>

      {/* Amount */}
      <View className="items-end ml-2">
        {/* Status */}
        <View
          className={`${tone.bg} rounded-full px-2 py-0.5 mb-1`}
        >
          <Text
            className={`font-khmer text-[14px] ${tone.text}`}
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
          >
            {tone.label}
          </Text>
        </View>

        {/* Total */}
        <Text className="font-khmerBold text-gray-900 text-xl text-right" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} maxFontSizeMultiplier={1.3} style={{ alignSelf: "flex-end", maxWidth: "100%" }}>
          $
          {Number(
            order.amount ?? 0
          ).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}