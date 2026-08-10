import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCustomerList, addCustomer } from "../hooks/useCustomerList";
import { CustomerCard } from "../components/CustomerCard";
import { CustomerStatsRow } from "../components/CustomerStatsRow";
import { CreateCustomerModal, CreateCustomerValues } from "../components/CreateCustomerModal";
import { Customer, CustomerStatus } from "../types/customer.types";

type CustomerListScreenProps = {
  onSelectCustomer: (customerId: string) => void;
};

function formatDate(date: Date | null) {
  if (!date) return new Date().toLocaleDateString();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ["#2563EB", "#EA580C", "#16A34A", "#9333EA", "#CA8A04", "#DC2626"];

export function CustomerListScreen({ onSelectCustomer }: CustomerListScreenProps) {
  const [search, setSearch] = useState("");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const { customers, stats } = useCustomerList();

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleCreateCustomer = (values: CreateCustomerValues) => {
    const newCustomer: Customer = {
      id: String(Date.now()),
      code: values.code || `CUS-${Date.now()}`,
      name: values.name,
      initials: getInitials(values.name || "??"),
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      phone: values.phone,
      location: values.address,
      status: values.status,
      totalOrders: 0,
      totalSpent: 0,
      memberSince: formatDate(values.joinDate),
      customerType: values.category,
      note: values.description || "-",
      orders: [],
    };

    addCustomer(newCustomer);
    setCreateModalVisible(false);
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Top navbar */}
      <View className="bg-white px-5 pt-3 pb-3 flex-row items-center justify-between">
        <Ionicons name="menu-outline" size={36} color="black" />
        <Text className="font-khmerBold text-black text-3xl">អតិថិជន</Text>
        <TouchableOpacity className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center">
          <Ionicons name="notifications-outline" size={18} color="black" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <CustomerStatsRow
        totalCustomers={stats.totalCustomers}
        activeCustomers={stats.activeCustomers}
        totalOrders={stats.totalOrders}
        totalSpent={stats.totalSpent}
      />

      {/* Search */}
      <View className="px-5 pt-3 pb-2 bg-gray-50">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 h-11">
          <Ionicons name="search-outline" size={22} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ស្វែងរកឈ្មោះ ឬលេខទូរស័ព្ទ..."
            placeholderTextColor="#9CA3AF"
            className="font-khmer flex-1 ml-2 text-xl text-gray-800"
            style={{ outlineWidth: 0, borderWidth: 0, backgroundColor: "transparent" }}
          />
          <Ionicons name="options-outline" size={22} color="#9CA3AF" />
        </View>
      </View>

      <View className="flex-1" style={{ minHeight: 0 }}>
        <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
          {filteredCustomers.length === 0 ? (
            <View className="items-center justify-center py-16">
              <Ionicons name="people-outline" size={36} color="#D1D5DB" />
              <Text className="font-khmer text-gray-400 text-xl mt-2">មិនមានអតិថិជនទេ</Text>
            </View>
          ) : (
            filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onPress={() => onSelectCustomer(customer.id)}
              />
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

      <CreateCustomerModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateCustomer}
      />
    </View>
  );
}