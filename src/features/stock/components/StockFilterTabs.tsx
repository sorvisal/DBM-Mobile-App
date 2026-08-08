import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PERIODS = ["ទាំងអស់", "ចូល", "ចេញ"] as const;

const PERIOD_COLORS: Record<(typeof PERIODS)[number], string> = {
  "ទាំងអស់": "bg-blue-600",
  "ចូល": "bg-green-600",
  "ចេញ": "bg-red-600",
};

type StockFilterTabsProps = {
  activePeriod: (typeof PERIODS)[number] | null;
  onSelectPeriod: (period: (typeof PERIODS)[number]) => void;
  selectedDate: string;
  onPressDate: () => void;
};

export function StockFilterTabs({
  activePeriod,
  onSelectPeriod,
  selectedDate,
  onPressDate,
}: StockFilterTabsProps) {
  return (
    <View className="flex-row items-center gap-2 px-5 py-3 bg-white">
      {PERIODS.map((period) => {
        const isActive = period === activePeriod;
        return (
          <TouchableOpacity
            key={period}
            onPress={() => onSelectPeriod(period)}
            className={`px-4 py-2 rounded-full ${isActive ? PERIOD_COLORS[period] : "bg-gray-100"}`}
          >
            <Text className={`font-khmer text-xl ${isActive ? "text-white" : "text-gray-600"}`}>
              {period}
            </Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        onPress={onPressDate}
        className="flex-1 flex-row items-center justify-end gap-1.5"
      >
        <Text className="font-khmer text-xl text-gray-600">{selectedDate}</Text>
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
}