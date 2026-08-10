import { View, Text } from "react-native";
import { ChartPoint } from "../types/income.types";

type RevenueBarChartProps = {
  data: ChartPoint[];
  height?: number;
};

export function RevenueBarChart({ data, height = 140 }: RevenueBarChartProps) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <View className="flex-row items-end justify-between" style={{ height: height + 32 }}>
      {data.map((point) => {
        const barHeight = (point.amount / maxAmount) * height;
        return (
          <View key={point.label} className="items-center flex-1">
            <Text className="font-khmer text-gray-500 text-[14px] mb-1">${point.amount}</Text>
            <View
              className="bg-blue-600 rounded-t-md"
              style={{ height: Math.max(barHeight, 4), width: 18 }}
            />
            <Text className="font-khmer text-gray-400 text-[14px] mt-1.5" numberOfLines={1}>
              {point.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}