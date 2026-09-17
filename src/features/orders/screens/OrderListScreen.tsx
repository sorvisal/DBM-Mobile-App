import {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import { Swipeable } from "react-native-gesture-handler";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { OrderStatus } from "../types/types";
import type { Order } from "../types/types";

import { useOrderList } from "../hooks/useOrderList";
import { OrderCard } from "../components/OrderCard";
import { OrderFilterTabs } from "../components/OrderFilterTabs";
import { OrderStatsBar } from "../components/OrderStatsBar";
import { OrderCardSkeleton } from "../../customers/components/CustomerCardSkeleton";

import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/services";

type OrderListScreenProps = {
  onSelectOrder: (orderId: string) => void;
  onCreateOrder: () => void;
};

// =============================================================
// DELETE RULE
// =============================================================
//
// Allowed:
// new
// pending
// approved
// completed
// cancelled
//
// Not allowed:
// confirmed
// shipping
//
// Your backend currently uses "Delivering" for shipping.
// Therefore both "shipping" and "delivering" are protected.
// =============================================================

function canDeleteOrder(order: Order): boolean {
  const status = String(
    order.status ?? ""
  ).toLowerCase();

  // -----------------------------------------------------------
  // Confirmed cannot be deleted
  // -----------------------------------------------------------

  if (status === "confirmed") {
    return false;
  }

  // -----------------------------------------------------------
  // Shipping cannot be deleted
  // -----------------------------------------------------------

  if (status === "shipping") {
    return false;
  }

  // -----------------------------------------------------------
  // Backend currently uses "Delivering"
  // for the shipping state.
  // -----------------------------------------------------------

  if (status === "delivering") {
    return false;
  }

  return true;
}

export function OrderListScreen({
  onSelectOrder,
  onCreateOrder,
}: OrderListScreenProps) {
  const [activeFilter, setActiveFilter] =
    useState<OrderStatus | "all">("all");

  const [search, setSearch] =
    useState("");

  const debouncedSearch =
    useDebounce(
      search,
      300
    );

  const [showOverlay, setShowOverlay] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  // -----------------------------------------------------------
  // Currently deleting order
  // -----------------------------------------------------------

  const [deletingOrderId, setDeletingOrderId] =
    useState<string | null>(null);

  // -----------------------------------------------------------
  // Orders hidden immediately after successful delete
  // -----------------------------------------------------------

  const [deletedOrderIds, setDeletedOrderIds] =
    useState<Set<string>>(
      new Set()
    );

  const {
    orders,
    counts,
    isLoading,
    isFetchingMore,
    hasMore,
    loadMore,
    refresh,
    stale,
  } = useOrderList(
    activeFilter
  );

  // ===========================================================
  // INITIAL LOADING OVERLAY
  // ===========================================================

  useEffect(() => {
    const timer =
      setTimeout(() => {
        setShowOverlay(false);
      }, 900);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // ===========================================================
  // REFRESH
  // ===========================================================

  const handleRefresh =
    useCallback(
      async () => {
        if (refreshing) {
          return;
        }

        setRefreshing(true);

        try {
          await refresh();
        } finally {
          setRefreshing(false);
        }
      },
      [
        refreshing,
        refresh,
      ]
    );

// ===========================================================
// DELETE ORDER
// ===========================================================

const handleDeleteOrder = useCallback(
  (order: Order) => {
    console.log(
      "[ORDER DELETE] START:",
      order.id,
      order.code,
      order.status
    );

    if (deletingOrderId) {
      console.log(
        "[ORDER DELETE] Already deleting:",
        deletingOrderId
      );

      return;
    }

    const status = String(
      order.status ?? ""
    ).toLowerCase();

    // ---------------------------------------------------------
    // PROTECTED STATUS
    // ---------------------------------------------------------

    if (
      status === "confirmed" ||
      status === "shipping" ||
      status === "delivering"
    ) {
      Alert.alert(
        "មិនអាចលុបបាន",
        "Order ដែល Confirmed ឬកំពុងដឹកជញ្ជូន មិនអាចលុបបានទេ។"
      );

      return;
    }

    // ---------------------------------------------------------
    // CONFIRM
    // ---------------------------------------------------------

    Alert.alert(
      "លុបការបញ្ជាទិញ",
      `តើអ្នកប្រាកដថាចង់លុប ${order.code} មែនទេ?`,
      [
        {
          text: "បោះបង់",
          style: "cancel",
        },
        {
          text: "លុប",
          style: "destructive",

          onPress: async () => {
            console.log(
              "[ORDER DELETE] CONFIRMED:",
              order.id
            );

            try {
              setDeletingOrderId(
                order.id
              );

              // ------------------------------------------------
              // Hide immediately
              // ------------------------------------------------

              setDeletedOrderIds(
                (prev) => {
                  const next =
                    new Set(prev);

                  next.add(
                    order.id
                  );

                  return next;
                }
              );

              console.log(
                "[ORDER DELETE] Calling API:",
                `/orders/${order.id}`
              );

              // ------------------------------------------------
              // API
              // ------------------------------------------------

              await api.orders.remove(
                order.id
              );

              console.log(
                "[ORDER DELETE] API SUCCESS:",
                order.id
              );

              // ------------------------------------------------
              // Refresh
              // ------------------------------------------------

              await refresh();

              console.log(
                "[ORDER DELETE] REFRESH SUCCESS"
              );
            } catch (
              error: any
            ) {
              console.error(
                "[ORDER DELETE] FAILED:",
                error
              );

              console.error(
                "[ORDER DELETE] STATUS:",
                error?.response?.status
              );

              console.error(
                "[ORDER DELETE] RESPONSE:",
                error?.response?.data
              );

              console.error(
                "[ORDER DELETE] URL:",
                error?.config?.url
              );

              // ------------------------------------------------
              // Restore card
              // ------------------------------------------------

              setDeletedOrderIds(
                (prev) => {
                  const next =
                    new Set(prev);

                  next.delete(
                    order.id
                  );

                  return next;
                }
              );

              const errorData =
                error?.response
                  ?.data;

              let message =
                "មិនអាចលុបការបញ្ជាទិញបានទេ។";

              if (
                typeof errorData
                  ?.error ===
                "string"
              ) {
                message =
                  errorData.error;
              } else if (
                errorData
                  ?.error?.message
              ) {
                message =
                  errorData
                    .error.message;
              } else if (
                errorData?.message
              ) {
                message =
                  errorData.message;
              }

              Alert.alert(
                "បរាជ័យ",
                message
              );
            } finally {
              setDeletingOrderId(
                null
              );
            }
          },
        },
      ]
    );
  },
  [
    deletingOrderId,
    refresh,
  ]
);

  // ===========================================================
  // FILTER + SEARCH + SORT
  // ===========================================================

  const filteredOrders =
    useMemo(() => {
      const keyword =
        debouncedSearch
          .trim()
          .toLowerCase();

      // -------------------------------------------------------
      // Remove deleted orders first
      // -------------------------------------------------------

      let result =
        orders.filter(
          (order) =>
            !deletedOrderIds.has(
              order.id
            )
        );

      // -------------------------------------------------------
      // SEARCH
      // -------------------------------------------------------

      if (keyword) {
        result =
          result.filter(
            (order) => {
              const code =
                order.code
                  ?.toLowerCase() ??
                "";

              const customerName =
                order.customer
                  ?.name
                  ?.toLowerCase() ??
                "";

              return (
                code.includes(
                  keyword
                ) ||
                customerName.includes(
                  keyword
                )
              );
            }
          );
      }

      // -------------------------------------------------------
      // SORT
      // -------------------------------------------------------

      return [
        ...result,
      ].sort(
        (a, b) => {
          // ---------------------------------------------------
          // 1. Highest total first
          // ---------------------------------------------------

          const totalA =
            Number(
              a.total
            ) || 0;

          const totalB =
            Number(
              b.total
            ) || 0;

          if (
            totalA !==
            totalB
          ) {
            return (
              totalB -
              totalA
            );
          }

          // ---------------------------------------------------
          // 2. More product lines first
          // ---------------------------------------------------

          const productCountA =
            a.lines?.length ??
            0;

          const productCountB =
            b.lines?.length ??
            0;

          if (
            productCountA !==
            productCountB
          ) {
            return (
              productCountB -
              productCountA
            );
          }

          // ---------------------------------------------------
          // 3. Newest first
          // ---------------------------------------------------

          const timeA =
            new Date(
              a.createdAt
            ).getTime() || 0;

          const timeB =
            new Date(
              b.createdAt
            ).getTime() || 0;

          return (
            timeB -
            timeA
          );
        }
      );
    }, [
      orders,
      debouncedSearch,
      deletedOrderIds,
    ]);

  // ===========================================================
  // LOAD MORE
  // ===========================================================

  const handleEndReached =
    useCallback(
      () => {
        if (
          hasMore &&
          !isFetchingMore
        ) {
          loadMore();
        }
      },
      [
        hasMore,
        isFetchingMore,
        loadMore,
      ]
    );

  // ===========================================================
  // RENDER ORDER ROW
  // ===========================================================

  const renderRow =
    useCallback(
      ({
        item,
      }: ListRenderItemInfo<Order>) => {
        const isDeleting =
          deletingOrderId ===
          item.id;

        const canDelete =
          canDeleteOrder(
            item
          );

        // =====================================================
        // NORMAL CARD
        // =====================================================

        const orderCard = (
          <OrderCard
            order={item}
            onPress={() =>
              onSelectOrder(
                item.id
              )
            }
          />
        );

        // =====================================================
        // CONFIRMED / SHIPPING
        // NO SWIPE DELETE
        // =====================================================

        if (!canDelete) {
          return orderCard;
        }

        // =====================================================
        // DELETE ACTION
        // =====================================================

        const renderRightActions =
          () => {
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={
                  isDeleting
                }
                onPress={() =>
                  handleDeleteOrder(
                    item
                  )
                }
                className="bg-red-500 rounded-2xl mb-2 ml-2 items-center justify-center"
                style={{
                  width: 78,
                }}
              >
                {isDeleting ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="trash-outline"
                      size={25}
                      color="#FFFFFF"
                    />

                    <Text className="font-khmerBold text-white text-sm mt-1">
                      លុប
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            );
          };

        // =====================================================
        // SWIPEABLE
        // =====================================================

        return (
          <Swipeable
            renderRightActions={
              renderRightActions
            }
            overshootRight={
              false
            }
            rightThreshold={
              40
            }
            friction={2}
            enableTrackpadTwoFingerGesture
          >
            {orderCard}
          </Swipeable>
        );
      },
      [
        onSelectOrder,
        deletingOrderId,
        handleDeleteOrder,
      ]
    );

  // ===========================================================
  // FOOTER
  // ===========================================================

  const renderFooter =
    useCallback(
      () => {
        if (
          !isFetchingMore
        ) {
          return null;
        }

        return (
          <View className="items-center py-4">
            <Ionicons
              name="hourglass-outline"
              size={20}
              color="#9CA3AF"
              className="animate-spin"
            />

            <Text className="font-khmer text-gray-400 text-sm mt-1">
              កំពុងផ្ទុកបន្ថែម...
            </Text>
          </View>
        );
      },
      [
        isFetchingMore,
      ]
    );

  // ===========================================================
  // EMPTY STATE
  // ===========================================================

  const renderEmpty =
    useCallback(
      () => {
        if (isLoading) {
          return (
            <View className="flex-1 px-5 pt-2">
              {Array.from({
                length: 8,
              }).map(
                (_, i) => (
                  <OrderCardSkeleton
                    key={`ol-${i}`}
                  />
                )
              )}
            </View>
          );
        }

        return (
          <View className="items-center justify-center py-16">
            <Ionicons
              name="receipt-outline"
              size={36}
              color="#D1D5DB"
            />

            <Text className="font-khmer text-gray-400 text-xl mt-2">
              មិនមានការបញ្ជាទិញទេ
            </Text>
          </View>
        );
      },
      [
        isLoading,
      ]
    );

  // ===========================================================
  // UI
  // ===========================================================

  return (
    <View
      className="flex-1 bg-gray-50"
      style={{
        minHeight: 0,
      }}
    >
      {/* =====================================================
          ORDER STATS
      ====================================================== */}

      <OrderStatsBar
        totalOrders={
          counts.all ?? 0
        }
        totalShipping={
          counts[
            OrderStatus.Shipping
          ] ?? 0
        }
        totalConfirmed={
          counts[
            OrderStatus.Confirmed
          ] ?? 0
        }
        totalCancelled={
          counts[
            OrderStatus.Cancelled
          ] ?? 0
        }
      />

      {/* =====================================================
          SEARCH
      ====================================================== */}

      <View className="px-5 pt-3 pb-2 bg-gray-50">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 h-11">
          <Ionicons
            name="search-outline"
            size={24}
            color="#9CA3AF"
          />

          <TextInput
            value={search}
            onChangeText={
              setSearch
            }
            placeholder="ស្វែងរកលេខ DO ឬឈ្មោះអតិថិជន..."
            placeholderTextColor="#9CA3AF"
            className="font-khmer flex-1 ml-2 text-lg text-gray-800"
            style={{
              outlineWidth: 0,
              borderWidth: 0,
              backgroundColor:
                "transparent",
              paddingVertical: 0,
              includeFontPadding:
                false,
              textAlignVertical:
                "center",
            }}
          />

          {stale && (
            <TouchableOpacity
              onPress={
                handleRefresh
              }
              disabled={
                refreshing
              }
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
          FILTER TABS
      ====================================================== */}

      <OrderFilterTabs
        active={
          activeFilter
        }
        onChange={
          setActiveFilter
        }
        counts={counts}
      />

      {/* =====================================================
          LIST
      ====================================================== */}

      <View
        className="flex-1"
        style={{
          minHeight: 0,
        }}
      >
        <FlatList
          data={
            filteredOrders
          }
          keyExtractor={(
            item
          ) =>
            item.id
          }
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            paddingBottom: 90,
          }}
          showsVerticalScrollIndicator={
            false
          }
          initialNumToRender={
            8
          }
          maxToRenderPerBatch={
            8
          }
          updateCellsBatchingPeriod={
            50
          }
          windowSize={
            7
          }
          removeClippedSubviews={
            false
          }
          keyboardShouldPersistTaps="handled"
          onEndReached={
            handleEndReached
          }
          onEndReachedThreshold={
            0.2
          }
          renderItem={
            renderRow
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                handleRefresh
              }
              colors={[
                "#2563EB",
              ]}
              tintColor="#2563EB"
            />
          }
          ListFooterComponent={
            renderFooter
          }
          ListEmptyComponent={
            renderEmpty()
          }
        />

        {/* ===================================================
            CREATE ORDER BUTTON
        ==================================================== */}

        <TouchableOpacity
          onPress={
            onCreateOrder
          }
          className="absolute bottom-5 right-5 w-14 h-14 rounded-full bg-blue-600 items-center justify-center"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Ionicons
            name="add"
            size={28}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* =====================================================
          LOADING OVERLAY
      ====================================================== */}

      {showOverlay && (
        <View
          className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center bg-gray-50"
          style={{
            zIndex: 50,
          }}
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text className="font-khmer text-gray-500 text-sm mt-3">
            កំពុងផ្ទុក...
          </Text>
        </View>
      )}
    </View>
  );
}