import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OrderStatus } from "../types/types";
import { useOrderList } from "../hooks/useOrderList";
import { OrderCard } from "../components/OrderCard";
import { OrderFilterTabs } from "../components/OrderFilterTabs";

type OrderListScreenProps = {
  onSelectOrder: (orderId: string) => void;
};

export function OrderListScreen({ onSelectOrder }: OrderListScreenProps) {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const { orders } = useOrderList(activeFilter);

  const filteredOrders = orders.filter(
    (o) =>
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Top navbar */}
      <View className="bg-white px-5 pt-3 pb-3 flex-row items-center justify-between border-b border-gray-100">
        <Text className="font-khmerBold text-gray-900 text-lg">ការបញ្ជាទិញ</Text>
        <TouchableOpacity className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center">
          <Ionicons name="notifications-outline" size={18} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-5 pt-3 pb-2 bg-white">
        <View className="flex-row items-center border border-gray-200 rounded-xl px-3 h-11">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ស្វែងរកលេខ ORD ឬឈ្មោះអតិថិជន..."
            placeholderTextColor="#9CA3AF"
            className="font-khmer flex-1 ml-2 text-sm text-gray-800"
            style={{ outlineWidth: 0, borderWidth: 0, backgroundColor: "transparent" }}
          />
        </View>
      </View>

      <OrderFilterTabs active={activeFilter} onChange={setActiveFilter} />

      <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Ionicons name="receipt-outline" size={36} color="#D1D5DB" />
            <Text className="font-khmer text-gray-400 text-xs mt-2">មិនមានការបញ្ជាទិញទេ</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onPress={() => onSelectOrder(order.id)} />
          ))
        )}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
