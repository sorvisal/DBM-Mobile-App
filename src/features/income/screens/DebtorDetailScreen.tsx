import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { DetailLayout } from "../../../layouts/DetailLayout";

import {
  useDebtorDetail,
  DebtorOrder,
} from "../hooks/useDebtorDetail";

import { Debtor } from "../types/income.types";

type DebtorDetailScreenProps = {
  debtor: Debtor;
  onBack: () => void;
};

export function DebtorDetailScreen({
  debtor,
  onBack,
}: DebtorDetailScreenProps) {
  const {
    data,
    orders,
    totalDebt,
    isLoading,
    error,
    refresh,
  } = useDebtorDetail(debtor);

  const customer = data?.customer;

  // =========================================================
  // CALL CUSTOMER
  // =========================================================

  const handleCall = async () => {
    const phone =
      customer?.phone ||
      debtor.phone;

    if (!phone) {
      return;
    }

    try {
      await Linking.openURL(
        `tel:${phone}`
      );
    } catch (err) {
      console.error(
        "Unable to call customer:",
        err
      );
    }
  };

  // =========================================================
  // MONEY
  // =========================================================

  const money = (value: number) =>
    `$${Number(value || 0).toFixed(2)}`;

  // =========================================================
  // DATE
  // =========================================================

  const formatDate = (
    value?: string
  ) => {
    if (!value) {
      return "-";
    }

    try {
      return new Date(
        value
      ).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );
    } catch {
      return value;
    }
  };

  // =========================================================
  // PAYMENT STATUS
  // =========================================================

  const getPaymentStatus = (
    order: DebtorOrder
  ) => {
    const value =
      order.paymentStatus.toLowerCase();

    if (
      value.includes("paid") &&
      !value.includes("partial")
    ) {
      return {
        label: "បានបង់",
        color: "#16A34A",
        bg: "#DCFCE7",
      };
    }

    if (
      value.includes("partial") ||
      value.includes("part")
    ) {
      return {
        label: "បង់ខ្លះ",
        color: "#D97706",
        bg: "#FEF3C7",
      };
    }

    return {
      label: "មិនទាន់បង់",
      color: "#DC2626",
      bg: "#FEE2E2",
    };
  };

  // =========================================================
  // ORDER STATUS
  // =========================================================

  const getOrderStatus = (
    status: string
  ) => {
    const value =
      status.toLowerCase();

    if (
      value.includes("complete") ||
      value.includes("deliver")
    ) {
      return "បានបញ្ចប់";
    }

    if (value.includes("approve")) {
      return "បានអនុម័ត";
    }

    if (value.includes("confirm")) {
      return "បានបញ្ជាក់";
    }

    if (value.includes("process")) {
      return "កំពុងដំណើរការ";
    }

    if (value.includes("pending")) {
      return "រង់ចាំ";
    }

    return status || "-";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading && !data) {
    return (
      <DetailLayout
        title="ព័ត៌មានអតិថិជនជំពាក់"
        onBack={onBack}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#EF4444"
          />

          <Text className="font-khmer text-gray-400 text-base mt-3">
            កំពុងផ្ទុកព័ត៌មាន...
          </Text>
        </View>
      </DetailLayout>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !data) {
    return (
      <DetailLayout
        title="ព័ត៌មានអតិថិជនជំពាក់"
        onBack={onBack}
      >
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
            <Ionicons
              name="alert-circle-outline"
              size={38}
              color="#EF4444"
            />
          </View>

          <Text className="font-khmerBold text-gray-900 text-xl mt-4">
            មិនអាចផ្ទុកព័ត៌មានបានទេ
          </Text>

          <Text className="font-khmer text-gray-400 text-center mt-2">
            {error}
          </Text>

          <TouchableOpacity
            onPress={refresh}
            className="bg-gray-900 rounded-xl px-6 py-3 mt-5"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="refresh-outline"
                size={18}
                color="white"
              />

              <Text className="font-khmerBold text-white ml-2">
                ព្យាយាមម្ដងទៀត
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </DetailLayout>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <DetailLayout
      title="ព័ត៌មានអតិថិជនជំពាក់"
      onBack={onBack}
      rightAction={
        <TouchableOpacity
          onPress={refresh}
          disabled={isLoading}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons
            name="refresh-outline"
            size={22}
            color={
              isLoading
                ? "#D1D5DB"
                : "#111827"
            }
          />
        </TouchableOpacity>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >
        {/* =====================================================
            CUSTOMER PROFILE
        ====================================================== */}

        <View className="px-5 pt-4">
          <View
            className="bg-white rounded-2xl p-4"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 1,
            }}
          >
            <View className="flex-row items-center">

              {/* Avatar */}

              <View
                className="items-center justify-center"
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor:
                    debtor.avatarColor ||
                    "#6B7280",
                }}
              >
                <Text className="font-khmerBold text-white text-2xl">
                  {debtor.initials}
                </Text>
              </View>

              {/* Name */}

              <View className="flex-1 ml-3">
                <Text
                  className="font-khmerBold text-gray-900 text-xl"
                  numberOfLines={1}
                >
                  {customer?.name ||
                    debtor.name}
                </Text>

                <Text className="font-khmer text-gray-400 text-lg mt-1">
                  {debtor.code}
                </Text>
              </View>

              {/* Call */}

              {(customer?.phone ||
                debtor.phone) && (
                <TouchableOpacity
                  onPress={handleCall}
                  className="w-11 h-11 rounded-full bg-green-50 items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="call"
                    size={21}
                    color="#16A34A"
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Phone */}

            {(customer?.phone ||
              debtor.phone) && (
              <View className="flex-row items-center mt-4">
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#6B7280"
                />

                <Text className="font-khmer text-gray-600 text-lg ml-2">
                  {customer?.phone ||
                    debtor.phone}
                </Text>
              </View>
            )}

            {/* Address */}

            {customer?.address && (
              <View className="flex-row items-start mt-3">
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#6B7280"
                />

                <Text className="font-khmer text-gray-600 text-lg ml-2 flex-1">
                  {customer.address}
                </Text>
              </View>
            )}

            {/* Status */}

            {customer?.status && (
              <View className="flex-row items-center mt-3">
                <Ionicons
                  name="person-circle-outline"
                  size={20}
                  color="#6B7280"
                />

                <Text className="font-khmer text-gray-500 ml-2">
                  ស្ថានភាព៖{" "}
                  {customer.status ===
                  "active"
                    ? "សកម្ម"
                    : "អសកម្ម"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* =====================================================
            TOTAL DEBT
        ====================================================== */}

        <View className="px-5 mt-4">
          <View className="bg-red-50 border border-red-100 rounded-2xl p-5">
            <View className="flex-row items-center">
              <View className="w-11 h-11 rounded-full bg-red-100 items-center justify-center">
                <Ionicons
                  name="wallet-outline"
                  size={23}
                  color="#DC2626"
                />
              </View>

              <View className="ml-3">
                <Text className="font-khmer text-gray-500 text-lg">
                  ប្រាក់ជំពាក់សរុប
                </Text>

                <Text className="font-khmerBold text-red-600 text-3xl mt-1">
                  {money(totalDebt)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =====================================================
            ORDER COUNT
        ====================================================== */}

        <View className="px-5 mt-5">
          <View className="flex-row items-center justify-between">
            <Text className="font-khmerBold text-gray-900 text-xl">
              ទំនិញដែលជំពាក់
            </Text>

            <View className="bg-red-50 rounded-full px-3 py-1">
              <Text className="font-khmerBold text-red-500 text-lg">
                {orders.length} Order
              </Text>
            </View>
          </View>
        </View>

        {/* =====================================================
            ORDERS
        ====================================================== */}

        <View className="px-5 mt-3">
          {orders.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <View className="w-16 h-16 rounded-full bg-green-50 items-center justify-center">
                <Ionicons
                  name="checkmark-circle-outline"
                  size={38}
                  color="#16A34A"
                />
              </View>

              <Text className="font-khmerBold text-gray-800 text-lg mt-3">
                មិនមានទំនិញជំពាក់ទេ
              </Text>

              <Text className="font-khmer text-gray-400 text-center mt-1">
                អតិថិជននេះបានបង់ប្រាក់គ្រប់
              </Text>
            </View>
          ) : (
            orders.map((order) => {
              const payment =
                getPaymentStatus(order);

              return (
                <View
                  key={order.id}
                  className="bg-white rounded-2xl p-4 mb-4"
                  style={{
                    shadowColor: "#000",
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 1,
                  }}
                >
                  {/* ORDER HEADER */}

                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="font-khmerBold text-gray-900 text-lg">
                        {order.orderNumber}
                      </Text>

                      <Text className="font-khmer text-gray-400 text-lg mt-1">
                        {formatDate(
                          order.orderDate
                        )}
                      </Text>
                    </View>

                    <View
                      className="rounded-full px-3 py-1"
                      style={{
                        backgroundColor:
                          payment.bg,
                      }}
                    >
                      <Text
                        className="font-khmerBold text-lg"
                        style={{
                          color:
                            payment.color,
                        }}
                      >
                        {payment.label}
                      </Text>
                    </View>
                  </View>

                  {/* ORDER STATUS */}

                  <View className="flex-row items-center mt-3">
                    <View className="flex-row items-center bg-gray-50 rounded-lg px-2 py-1">
                      <Ionicons
                        name="cube-outline"
                        size={15}
                        color="#6B7280"
                      />

                      <Text className="font-khmer text-gray-500 text-lg ml-1">
                        {getOrderStatus(
                          order.status
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* DIVIDER */}

                  <View className="h-px bg-gray-100 my-3" />

                  {/* PRODUCTS */}

                  <Text className="font-khmerBold text-gray-800 text-lg mb-2">
                    ទំនិញ
                  </Text>

                  {order.products.map(
                    (product) => (
                      <View
                        key={product.id}
                        className="flex-row items-center bg-gray-50 rounded-xl p-3 mb-2"
                      >
                        {/* PRODUCT IMAGE */}

                        <View className="h-12 w-12 overflow-hidden rounded-xl bg-gray-100 items-center justify-center">
                          {product.imageUrl ? (
                            <Image
                              source={{
                                uri: product.imageUrl,
                              }}
                              className="h-full w-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <Ionicons
                              name="cube-outline"
                              size={22}
                              color="#9CA3AF"
                            />
                          )}
                        </View>

                        {/* PRODUCT INFO */}

                        <View className="flex-1 ml-3">
                          <Text
                            className="font-khmerMedium text-gray-900 text-lg"
                            numberOfLines={1}
                          >
                            {product.name}
                          </Text>

                          <Text className="font-khmer text-gray-500 text-lg mt-1">
                            {product.quantity} ×{" "}
                            {money(
                              product.price
                            )}
                          </Text>
                        </View>

                        {/* PRODUCT TOTAL */}

                        <Text className="font-khmerBold text-gray-900 text-lg">
                          {money(
                            product.total
                          )}
                        </Text>
                      </View>
                    )
                  )}

                  {/* =================================================
                      PAYMENT SUMMARY
                  ================================================== */}

                  <View className="bg-gray-50 rounded-xl p-3 mt-2">

                    {/* TOTAL */}

                    <View className="flex-row justify-between">
                      <Text className="font-khmer text-gray-500">
                        តម្លៃសរុប
                      </Text>

                      <Text className="font-khmerMedium text-gray-800">
                        {money(
                          order.total
                        )}
                      </Text>
                    </View>

                    {/* PAID */}

                    <View className="flex-row justify-between mt-2">
                      <Text className="font-khmer text-gray-500">
                        បានបង់
                      </Text>

                      <Text className="font-khmerMedium text-green-600">
                        {money(
                          order.paidAmount
                        )}
                      </Text>
                    </View>

                    {/* REMAINING */}

                    <View className="h-px bg-gray-200 my-2" />

                    <View className="flex-row justify-between">
                      <Text className="font-khmerBold text-gray-700">
                        នៅជំពាក់
                      </Text>

                      <Text className="font-khmerBold text-red-600 text-lg">
                        {money(
                          order.remainingAmount
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </DetailLayout>
  );
}