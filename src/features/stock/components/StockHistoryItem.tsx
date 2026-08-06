import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type StockHistoryItemProps = {
  productName: string;
  note: string;
  time: string;
  quantityChange: number;
};

export function StockHistoryItem({ productName, note, time, quantityChange }: StockHistoryItemProps) {
  const isIncoming = quantityChange > 0;

  return (
    <View className="flex-row items-center bg-white rounded-2xl p-3 mb-3">
      <View
        className={`w-9 h-9 rounded-full items-center justify-center ${
          isIncoming ? "bg-green-50" : "bg-red-50"
        }`}
      >
        <Ionicons
          name={isIncoming ? "arrow-down-outline" : "arrow-up-outline"}
          size={16}
          color={isIncoming ? "#16A34A" : "#DC2626"}
        />
      </View>

      <View className="flex-1 ml-3">
        <Text className="font-khmerMedium text-gray-900 text-sm" numberOfLines={1}>
          {productName}
        </Text>
        <Text className="font-khmer text-gray-400 text-[11px] mt-0.5" numberOfLines={1}>
          {note}
        </Text>
      </View>

      <View className="items-end">
        <Text className={`font-khmerBold text-sm ${isIncoming ? "text-green-600" : "text-red-600"}`}>
          {isIncoming ? "+" : ""}
          {quantityChange} កេស
        </Text>
        <Text className="font-khmer text-gray-400 text-[11px] mt-0.5">{time}</Text>
      </View>
    </View>
  );
}