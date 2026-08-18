import { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ListRenderItemInfo, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDebtors } from "../hooks/useDebtors";
import { DebtorListItem } from "../components/DebtorListItem";
import { DebtorListItemSkeleton } from "../../customers/components/CustomerCardSkeleton";
import { useDebounce } from "@/hooks/useDebounce";

type DebtorsScreenProps = {
  onBack: () => void;
};

const ITEM_HEIGHT = 72;

export function DebtorsScreen({ onBack }: DebtorsScreenProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { allDebtors, totalDebt, debtorCount, isLoading, isFetchingMore, hasMore, loadMore, stale } = useDebtors();

  // Client-side filter — instant, no API call
  const filteredDebtors = debouncedSearch
    ? allDebtors.filter(
        (d) =>
          d.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          d.code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          d.phone.includes(debouncedSearch)
      )
    : allDebtors;

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

  const renderRow = useCallback(({ item }: ListRenderItemInfo<typeof filteredDebtors[0]>) => (
    <DebtorListItem key={item.id} debtor={item} />
  ), []);

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
      <View className="bg-white px-5 pt-3 pb-3 flex-row items-center justify-between relative border-b border-gray-100">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={26} color="#1F2937" />
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center justify-center pointer-events-none">
          <Text className="font-khmerBold text-gray-900 text-3xl">បំណុលអតិថិជន</Text>
        </View>
        <Ionicons name="filter-outline" size={22} color="#1F2937" />
      </View>

      <View className="bg-red-50 px-5 py-3 flex-row items-center justify-between mt-1">
        <View className="flex-row items-center">
          <View className="w-11 h-11 rounded-full bg-red-500 items-center justify-center">
            <Ionicons name="cash-outline" size={22} color="white" />
          </View>
          <View className="ml-2.5">
            <Text className="font-khmer text-red-500 text-[16px]">សរុបបំណុល</Text>
            <Text className="font-khmerBold text-red-600 text-xl">${totalDebt.toFixed(2)}</Text>
          </View>
        </View>
        <Text className="font-khmer text-red-400 text-xl">{debtorCount} អតិថិជន</Text>
      </View>

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
            <TouchableOpacity>
              <Ionicons name="refresh-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredDebtors}
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
              {Array.from({ length: 8 }).map((_, i) => <DebtorListItemSkeleton key={`ds-${i}`} />)}
            </View>
          ) : (
            <View className="items-center justify-center py-16">
              <Ionicons name="checkmark-circle-outline" size={36} color="#D1D5DB" />
              <Text className="font-khmer text-gray-400 text-xl mt-2">មិនមានបំណុលទេ</Text>
            </View>
          )
        }
      />
    </View>
  );
}
