import { useState, useCallback, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ListRenderItemInfo, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCustomerList, addCustomer } from "../hooks/useCustomerList";
import { CustomerCard } from "../components/CustomerCard";
import { CustomerCardSkeleton } from "../components/CustomerCardSkeleton";
import { CustomerStatsRow } from "../components/CustomerStatsRow";
import { CreateCustomerModal, CreateCustomerValues } from "../components/CreateCustomerModal";
import { Customer, CustomerStatus } from "../types/customer.types";
import { useDebounce } from "@/hooks/useDebounce";

type CustomerListScreenProps = {
  onSelectCustomer: (customerId: string) => void;
};

const ITEM_HEIGHT = 84;

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
  const debouncedSearch = useDebounce(search, 300);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const { allCustomers, stats, isLoading, isFetchingMore, hasMore, loadMore, stale } = useCustomerList();

  // Blocking overlay shown for 3s whenever this screen mounts (e.g. returning from detail),
  // giving the list time to fetch/refresh data before it's revealed.
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowOverlay(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Filter cached data client-side — instant, no API call
  const filteredCustomers = debouncedSearch
    ? allCustomers.filter(
        (c: typeof allCustomers[0]) =>
          c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          c.code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          c.phone.includes(debouncedSearch)
      )
    : allCustomers;

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

  const handleEndReached = useCallback(() => {
    if (hasMore && !isFetchingMore) loadMore();
  }, [hasMore, isFetchingMore, loadMore]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 200) {
      handleEndReached();
    }
  }, [handleEndReached]);

  const getItemLayout = useCallback((_data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  const renderRow = useCallback(({ item }: ListRenderItemInfo<typeof filteredCustomers[0]>) => (
    <CustomerCard customer={item} onPress={() => onSelectCustomer(item.id)} />
  ), [onSelectCustomer]);

  const renderFooter = useCallback(() => {
    if (!isFetchingMore) return null;
    return (
      <View className="items-center py-4">
        <Ionicons name="hourglass-outline" size={20} color="#9CA3AF" className="animate-spin" />
        <Text className="font-khmer text-gray-400 text-sm mt-1">កំពុងផ្ទុកបន្ថែម...</Text>
      </View>
    );
  }, [isFetchingMore]);

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      <CustomerStatsRow
        totalCustomers={stats.totalCustomers}
        activeCustomers={stats.activeCustomers}
        totalOrders={stats.totalOrders}
        totalSpent={stats.totalSpent}
      />

      <View className="px-5 pt-3 pb-2 bg-gray-50">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 h-11">
          <Ionicons name="search-outline" size={22} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ស្វែងរកឈ្មោះ ឬលេខទូរស័ព្ទ..."
            placeholderTextColor="#9CA3AF"
            className="font-khmer flex-1 ml-2 text-lg text-gray-800"
            style={{ outlineWidth: 0, borderWidth: 0, backgroundColor: "transparent", paddingVertical: 0, includeFontPadding: false, textAlignVertical: "center" }}
          />
          {stale && (
            <TouchableOpacity onPress={() => {}} className="ml-1">
              <Ionicons name="refresh-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="flex-1" style={{ minHeight: 0 }}>
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          getItemLayout={getItemLayout}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.15}
          renderItem={renderRow}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            isLoading ? (
              <View className="flex-1 px-5 pt-2">
                {Array.from({ length: 8 }).map((_, i) => <CustomerCardSkeleton key={`cl-${i}`} />)}
              </View>
            ) : (
              <View className="items-center justify-center py-16">
                <Ionicons name="people-outline" size={36} color="#D1D5DB" />
                <Text className="font-khmer text-gray-400 text-xl mt-2">មិនមានអតិថិជនទេ</Text>
              </View>
            )
          }
        />

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

      {/* Blocking overlay for the first 3s after this screen mounts */}
      {showOverlay && (
        <View
          className="absolute inset-0 items-center justify-center bg-gray-50"
          style={{ zIndex: 50 }}
        >
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="font-khmer text-gray-400 text-sm mt-3">កំពុងផ្ទុក...</Text>
        </View>
      )}
    </View>
  );
}