import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useDebtors } from "../hooks/useDebtors";
import { DebtorListItem } from "../components/DebtorListItem";
import { DebtorListItemSkeleton } from "../../customers/components/CustomerCardSkeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { useActiveRefresh } from "../../../hooks/useActiveRefresh";
import { DetailLayout } from "../../../layouts/DetailLayout";
import { DebtorDetailScreen } from "./DebtorDetailScreen";
import type { Debtor } from "../types/income.types";

type DebtorsScreenProps = {
  onBack: () => void;
  isActive?: boolean;
  /** Deep-link: debtor (customer) id to open (from a notification). */
  openDebtorId?: string | null;
  /** Called once `openDebtorId` has been consumed. */
  onOpenDebtorHandled?: () => void;
};

function createPlaceholderDebtor(id: string): Debtor {
  return {
    id,
    code: "",
    name: "",
    initials: "",
    avatarColor: "#2563EB",
    phone: "",
    amount: 0,
    dueDate: "",
  };
}

export function DebtorsScreen({
  onBack,
  isActive,
  openDebtorId,
  onOpenDebtorHandled,
}: DebtorsScreenProps) {
  const [search, setSearch] = useState("");

  // =========================================================
  // DEBTOR DETAIL
  // =========================================================

  const [selectedDebtor, setSelectedDebtor] = useState<
    ReturnType<typeof useDebtors>["allDebtors"][number] | null
  >(null);

  // =========================================================
  // DEBTOR DATA
  // =========================================================

  const {
    allDebtors,
    isLoading,
    isFetchingMore,
    hasMore,
    loadMore,
    stale,
    refresh,
  } = useDebtors();

  // =========================================================
  // PULL TO REFRESH
  // =========================================================

  const [refreshing, setRefreshing] =
    useState(false);

  const handleManualRefresh =
    useCallback(async () => {
      try {
        setRefreshing(true);
        await refresh();
      } finally {
        setRefreshing(false);
      }
    }, [refresh]);

  // =========================================================
  // AUTO REFRESH ON FOCUS
  //
  // Triggered when the income tab becomes active again, or when
  // returning from the debtor detail screen (list becomes visible).
  // =========================================================

  const listActive =
    Boolean(isActive) &&
    !selectedDebtor;

  useActiveRefresh(refresh, listActive);

  // =========================================================
  // DEEP LINK FROM NOTIFICATION
  //
  // Opens the debtor detail for a customer id even when that customer is
  // not (or no longer) present in the receivables list — e.g. a "Debt paid"
  // notification. Falls back to a placeholder that DebtorDetailScreen
  // hydrates from the API by id.
  // =========================================================

  useEffect(() => {
    if (!openDebtorId) return;

    const match = allDebtors.find(
      (debtor) => String(debtor.id) === String(openDebtorId)
    );

    setSelectedDebtor(match ?? createPlaceholderDebtor(openDebtorId));
    onOpenDebtorHandled?.();
  }, [openDebtorId, allDebtors, onOpenDebtorHandled]);

  // =========================================================
  // SEARCH DEBOUNCE
  // =========================================================

  const debouncedSearch = useDebounce(search, 300);

  // =========================================================
  // SEARCH / FILTER
  // =========================================================

  const filteredDebtors = debouncedSearch
    ? allDebtors.filter((debtor) => {
        const keyword = debouncedSearch.toLowerCase().trim();

        return (
          debtor.name?.toLowerCase().includes(keyword) ||
          debtor.code?.toLowerCase().includes(keyword) ||
          debtor.phone?.includes(debouncedSearch)
        );
      })
    : allDebtors;

  // =========================================================
  // OPEN DETAIL
  // =========================================================

  const handleOpenDetail = useCallback(
    (debtor: ReturnType<typeof useDebtors>["allDebtors"][number]) => {
      setSelectedDebtor(debtor);
    },
    []
  );

  // =========================================================
  // CLOSE DETAIL
  // =========================================================

  const handleCloseDetail = useCallback(() => {
    setSelectedDebtor(null);
  }, []);

  // =========================================================
  // LOAD MORE
  // =========================================================

  const handleEndReached = useCallback(() => {
    if (!hasMore || isFetchingMore) {
      return;
    }

    loadMore();
  }, [hasMore, isFetchingMore, loadMore]);

  // =========================================================
  // SCROLL
  // =========================================================

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {
        contentOffset,
        contentSize,
        layoutMeasurement,
      } = event.nativeEvent;

      const distanceFromBottom =
        contentSize.height -
        (contentOffset.y + layoutMeasurement.height);

      if (distanceFromBottom <= 200) {
        handleEndReached();
      }
    },
    [handleEndReached]
  );

  // =========================================================
  // RENDER DEBTOR
  // =========================================================

  const renderRow = useCallback(
    ({
      item,
    }: ListRenderItemInfo<
      ReturnType<typeof useDebtors>["allDebtors"][number]
    >) => {
      return (
        <DebtorListItem
          debtor={item}
          onPress={() => handleOpenDetail(item)}
        />
      );
    },
    [handleOpenDetail]
  );

  // =========================================================
  // FOOTER
  // =========================================================

  const renderFooter = useCallback(() => {
    if (!isFetchingMore) {
      return null;
    }

    return (
      <View className="items-center py-4">
        <Ionicons
          name="hourglass-outline"
          size={20}
          color="#9CA3AF"
        />

        <Text className="font-khmer mt-1 text-sm text-gray-400">
          កំពុងផ្ទុកបន្ថែម...
        </Text>
      </View>
    );
  }, [isFetchingMore]);

  // =========================================================
  // FILTER BUTTON
  // =========================================================

  const filterButton = (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Filter"
      activeOpacity={0.7}
    >
      <Ionicons
        name="filter-outline"
        size={22}
        color="black"
      />
    </TouchableOpacity>
  );

  // =========================================================
  // DETAIL SCREEN
  // =========================================================

  if (selectedDebtor) {
    return (
      <DebtorDetailScreen
        debtor={selectedDebtor}
        onBack={handleCloseDetail}
        isActive={isActive}
      />
    );
  }

  // =========================================================
  // DEBTOR LIST
  // =========================================================

  return (
    <DetailLayout
      title="បញ្ចីរាយនាមអតិថិជនជំពាក់"
      onBack={onBack}
      rightAction={filterButton}
    >
      {/* =====================================================
          SEARCH
      ===================================================== */}

      <View className="bg-gray-50 px-5 pb-2 pt-3">
        <View className="h-11 flex-row items-center rounded-xl border border-gray-200 bg-white px-3">
          <Ionicons
            name="search-outline"
            size={22}
            color="#9CA3AF"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ស្វែងរកឈ្មោះ ឬលេខទូរស័ព្ទ..."
            placeholderTextColor="#9CA3AF"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            className="font-khmer ml-2 flex-1 text-lg text-gray-800"
            style={{
              outlineWidth: 0,
              borderWidth: 0,
              backgroundColor: "transparent",
              paddingVertical: 0,
              includeFontPadding: false,
              textAlignVertical: "center",
            }}
          />

          {/* Refresh icon when data is stale */}

          {stale && (
            <TouchableOpacity
              className="ml-2"
              activeOpacity={0.7}
              onPress={handleManualRefresh}
              accessibilityRole="button"
              accessibilityLabel="Refresh"
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* =====================================================
          DEBTOR LIST
      ===================================================== */}

      <FlatList
        data={filteredDebtors}
        keyExtractor={(item) => String(item.id)}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.15}
        renderItem={renderRow}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={handleManualRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          isLoading ? (
            <View className="pt-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <DebtorListItemSkeleton
                  key={`debtor-skeleton-${index}`}
                />
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-16">
              <Ionicons
                name="checkmark-circle-outline"
                size={40}
                color="#D1D5DB"
              />

              <Text className="font-khmer mt-2 text-center text-xl text-gray-400">
                មិនមានអតិថិជនជំពាក់ទេ
              </Text>
            </View>
          )
        }
      />
    </DetailLayout>
  );
}