import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OrderStatus, Order } from "../types/types";
import { useOrderList, addOrder } from "../hooks/useOrderList";
import { OrderCard } from "../components/OrderCard";
import { OrderFilterTabs } from "../components/OrderFilterTabs";
import { OrderStatsBar } from "../components/OrderStatsBar";
import { CreateOrderModal, CreateOrderValues } from "../components/CreateOrderModal";

type OrderListScreenProps = {
  onSelectOrder: (orderId: string) => void;
};

function formatDate(date: Date | null) {
  if (!date) return new Date().toLocaleString();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function OrderListScreen({ onSelectOrder }: OrderListScreenProps) {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const { orders, counts } = useOrderList(activeFilter);

  const filteredOrders = orders.filter(
    (o) =>
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateOrder = (values: CreateOrderValues) => {
    const price = Number(values.price) || 0;
    const quantity = Number(values.quantity) || 1;
    const subtotal = price * quantity;

    const newOrder: Order = {
      id: String(Date.now()),
      code: values.code || `ORD-${Date.now()}`,
      status: OrderStatus.New,
      customer: { name: values.customerName, phone: "" },
      createdAt: formatDate(values.date),
      items: [
        {
          id: String(Date.now()),
          name: values.item,
          imageUrl: "https://picsum.photos/seed/neworder/100",
          price,
          quantity,
        },
      ],
      subtotal,
      deliveryFee: 0.5,
      total: subtotal + 0.5,
    };

    addOrder(newOrder);
    setCreateModalVisible(false);
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Top navbar */}
      <View className="bg-white px-5 pt-3 pb-3 flex-row items-center justify-between border-b border-gray-100">
         <Ionicons name="menu-outline" size={36} color="#1F2937" />
        <Text className="font-khmerBold text-gray-900 text-lg">ការបញ្ជាទិញ</Text>
        <TouchableOpacity className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center">
          <Ionicons name="notifications-outline" size={18} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <OrderStatsBar
        totalOrders={counts.all ?? 0}
        totalShipping={counts[OrderStatus.Shipping] ?? 0}
        totalConfirmed={counts[OrderStatus.Confirmed] ?? 0}
        totalCancelled={counts[OrderStatus.Cancelled] ?? 0}
      />

      {/* Search */}
      <View className="px-5 pt-3 pb-2 bg-gray-50">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 h-11">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ស្វែងរកលេខ ORD ឬឈ្មោះអតិថិជន..."
            placeholderTextColor="#9CA3AF"
            className="font-khmer flex-1 ml-2 text-sm text-gray-800"
            style={{ outlineWidth: 0, borderWidth: 0, backgroundColor: "transparent" }}
          />
          <Ionicons name="options-outline" size={18} color="#9CA3AF" />
        </View>
      </View>

      <OrderFilterTabs active={activeFilter} onChange={setActiveFilter} counts={counts} />

      <View className="flex-1" style={{ minHeight: 0 }}>
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
          <View className="h-24" />
        </ScrollView>

        {/* Floating create button */}
        <TouchableOpacity
          onPress={() => setCreateModalVisible(true)}
          className="absolute bottom-5 right-5 w-14 h-14 rounded-full bg-blue-600 items-center justify-center"
          style={{ shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <CreateOrderModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateOrder}
      />
    </View>
  );
}