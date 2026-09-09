import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IncomeOrder = {
  id: string | number;
  code?: string;
  customerName?: string;
  time?: string;
  amount?: number;
};

type IncomeOrderRowProps = {
  order: IncomeOrder;
};

export function IncomeOrderRow({ order }: IncomeOrderRowProps) {
  return (
    <View className="bg-white rounded-2xl px-4 py-3 mb-3">
      <View className="flex-row items-center justify-between">
        {/* Order information */}
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
            <Ionicons
              name="receipt-outline"
              size={20}
              color="#2563EB"
            />
          </View>

          <View className="ml-3 flex-1">
            <Text
              className="font-khmerBold text-gray-900 text-lg"
              numberOfLines={1}
            >
              {order.code || "គ្មានលេខកូដ"}
            </Text>

            <Text
              className="font-khmer text-gray-500 text-base mt-0.5"
              numberOfLines={1}
            >
              {order.customerName || "អតិថិជនទូទៅ"}
            </Text>

            <Text className="font-khmer text-gray-400 text-sm mt-0.5">
              {order.time || "--:--"}
            </Text>
          </View>
        </View>

        {/* Amount */}
        <View className="items-end ml-3">
          <Text
            className="font-khmerBold text-blue-600 text-lg"
            numberOfLines={1}
          >
            ${Number(order.amount ?? 0).toFixed(2)}
          </Text>

          <Text className="font-khmer text-gray-400 text-sm">
            ចំណូល
          </Text>
        </View>
      </View>
    </View>
  );
}