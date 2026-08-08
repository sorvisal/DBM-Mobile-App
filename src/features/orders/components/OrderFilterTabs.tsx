import { ScrollView, TouchableOpacity, Text } from "react-native";
import { OrderStatus } from "../types/types";
import { ORDER_FILTERS } from "../constants/order.constants";

const FILTER_COLORS: Record<OrderStatus | "all", string> = {
  all: "bg-blue-600",
  [OrderStatus.New]: "bg-blue-600",
  [OrderStatus.Pending]: "bg-orange-500",
  [OrderStatus.Confirmed]: "bg-blue-600",
  [OrderStatus.Shipping]: "bg-purple-600",
  [OrderStatus.Completed]: "bg-green-600",
  [OrderStatus.Cancelled]: "bg-red-600",
};

type OrderFilterTabsProps = {
  active: OrderStatus | "all";
  onChange: (status: OrderStatus | "all") => void;
  counts: Partial<Record<OrderStatus | "all", number>>;
};

export function OrderFilterTabs({ active, onChange, counts }: OrderFilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="bg-white px-5"
      style={{ flexGrow: 0, height: 52 }}
      contentContainerStyle={{ gap: 8, alignItems: "center" }}
    >
      {ORDER_FILTERS.map((filter) => {
        const isActive = filter.key === active;
        const count = counts[filter.key] ?? 0;
        return (
          <TouchableOpacity
            key={filter.key}
            onPress={() => onChange(filter.key)}
            className={`px-4 py-2 rounded-full ${isActive ? FILTER_COLORS[filter.key] : "bg-gray-100"}`}
          >
            <Text className={`font-khmer text-xl ${isActive ? "text-white" : "text-gray-600"}`}>
              {filter.label}({count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}