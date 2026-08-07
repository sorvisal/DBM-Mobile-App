import { ScrollView, TouchableOpacity, Text } from "react-native";
import { OrderStatus }  from "../types/types";
import { ORDER_FILTERS } from "../constants/order.constants";

type OrderFilterTabsProps = {
  active: OrderStatus | "all";
  onChange: (status: OrderStatus | "all") => void;
};

export function OrderFilterTabs({ active, onChange }: OrderFilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="bg-white px-5 pb-3"
      contentContainerStyle={{ gap: 8 }}
    >
      {ORDER_FILTERS.map((filter) => {
        const isActive = filter.key === active;
        return (
          <TouchableOpacity
            key={filter.key}
            onPress={() => onChange(filter.key)}
            className={`px-4 py-2 rounded-full ${isActive ? "bg-blue-600" : "bg-gray-100"}`}
          >
            <Text className={`font-khmer text-xs ${isActive ? "text-white" : "text-gray-600"}`}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}