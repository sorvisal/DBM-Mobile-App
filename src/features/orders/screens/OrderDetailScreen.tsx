import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "@/hooks/useResponsive";
import { useActiveRefresh } from "@/hooks/useActiveRefresh";

import { OrderStatus } from "../types/types";
import { useOrderDetail } from "../hooks/useOrderDetail";
import { useUpdateOrderStatus } from "../hooks/useUpdateOrderStatus";
import { useReorderOrder } from "../hooks/useReorderOrder";
import {
  isOrderClosedError,
  isUnpaidBalanceError,
} from "@/services";
import {
  Snackbar,
  useSnackbar,
} from "@/components/ui/Snackbar";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { OrderStepper } from "../components/OrderStepper";
import { OrderItemRow } from "../components/OrderItemRow";
import { OrderSummary } from "../components/OrderSummary";
import { AssignDriverModal } from "../components/AssignDriverModal";
import { DetailLayout } from "../../../layouts/DetailLayout";
import { ViewReport } from "./ViewReport";

type OrderDetailScreenProps = {
  orderId: string;
  onBack: () => void;
  onOpenOrder?: (orderId: string) => void;
  isActive?: boolean;
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "មិនទាន់បង់",
  partial: "ជំពាក់ប្រាក់",
  paid: "បានបង់រួច",
};

/*
 * ============================================================
 * CURRENCY
 * ============================================================
 *
 * CreateOrderScreen:
 *
 * cash = KHR
 * bank = USD
 *
 * Exchange rate:
 * 1 USD = 4,046.81 KHR
 */
const USD_TO_KHR = 4046.81;

const PAYMENT_CURRENCY_LABELS: Record<string, string> = {
  cash: "🇰🇭 លុយខ្មែរ (៛)",
  bank: "🇺🇸 លុយដុល្លារ ($)",
};

/*
 * ============================================================
 * FORMAT CURRENCY
 * ============================================================
 */

const formatUSD = (amount: number) => {
  return `$${amount.toFixed(2)}`;
};

const formatKHR = (amount: number) => {
  return `${Math.round(amount).toLocaleString(
    "en-US"
  )} ៛`;
};

export function OrderDetailScreen({
  orderId,
  onBack,
  onOpenOrder,
  isActive,
}: OrderDetailScreenProps) {
  // =========================================================
  // HOOKS
  // =========================================================

  const {
    order,
    isLoading,
    refresh,
    refreshLatest,
  } = useOrderDetail(orderId);

  /**
   * The Orders tab stays mounted while the user pays a debt from the
   * Income / Debtors tab, so this screen can hold stale payment data.
   * Refetch whenever the Orders tab becomes active again.
   */
  useActiveRefresh(refresh, isActive);

  const insets = useSafeAreaInsets();

  const { isSmallPhone } =
    useResponsive();

  const footerStyle = {
    paddingBottom: Math.max(
      insets.bottom,
      8
    ),
  };

  const {
    confirmOrder,
    approveOrder,
    assignDriver,
    completeOrder,
    uncompleteOrder,
    cancelOrder,
  } = useUpdateOrderStatus();

  const {
    reorder,
    isReordering,
  } = useReorderOrder();

  const { snackbar, showSnackbar } =
    useSnackbar();

  const [
    assignDriverVisible,
    setAssignDriverVisible,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState<string | null>(null);

  const [
    showReport,
    setShowReport,
  ] = useState(false);

  // =========================================================
  // ACTION HELPER
  // =========================================================

  const runAction = async (
    key: string,
    fn: () => Promise<void>
  ) => {
    if (actionLoading) return;

    setActionLoading(key);

    try {
      await fn();

      refresh();
    } catch (error) {
      if (__DEV__) {
        console.error(
          `[ORDER ACTION] ${key} failed:`,
          error
        );
      }

      if (isUnpaidBalanceError(error)) {
        void refresh();

        Alert.alert(
          "មិនអាចបញ្ចប់ការបញ្ជាទិញបានទេ",
          "ការបញ្ជាទិញនេះនៅមានប្រាក់ជំពាក់។ សូមពិនិត្យព័ត៌មានការទូទាត់។",
          [
            {
              text: "យល់ព្រម",
            },
          ]
        );

        return;
      }

      if (isOrderClosedError(error)) {
        Alert.alert(
          "ការបញ្ជាទិញបានបិទ",
          "ការបញ្ជាទិញនេះត្រូវបានលុបចោល ឬបិទរួចហើយ។",
          [
            {
              text: "យល់ព្រម",
              style: "default",
            },
          ]
        );
        void refresh();
        return;
      }

      Alert.alert(
        "កំហុស",
        "មានបញ្ហាក្នុងការធ្វើបច្ចុប្បន្នភាព។ សូមព្យាយាមម្តងទៀត។"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <DetailLayout
        title="ព័ត៌មានការបញ្ជាទិញ"
        onBack={onBack}
      >
        <View className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text className="font-khmer text-gray-400 text-sm mt-3">
            កំពុងផ្ទុក...
          </Text>
        </View>
      </DetailLayout>
    );
  }

  // =========================================================
  // ORDER NOT FOUND
  // =========================================================

  if (!order) {
    return (
      <DetailLayout
        title="ព័ត៌មានការបញ្ជាទិញ"
        onBack={onBack}
      >
        <View className="flex-1 items-center justify-center px-6 bg-gray-50">
          <Ionicons
            name="alert-circle-outline"
            size={34}
            color="#D1D5DB"
          />

          <Text className="font-khmer text-gray-400 text-sm mt-2 text-center">
            រកមិនឃើញការបញ្ជាទិញ
          </Text>
        </View>
      </DetailLayout>
    );
  }

  // =========================================================
  // VIEW REPORT
  // =========================================================

  if (showReport) {
    return (
      <ViewReport
        order={order}
        onBack={() =>
          setShowReport(false)
        }
      />
    );
  }

  // =========================================================
  // ORDER ACTIONS
  // =========================================================

  const handleApprove = () => {
    runAction(
      "approve",
      () =>
        approveOrder(order.id)
    );
  };

  const handleConfirm = () => {
    runAction(
      "confirm",
      () =>
        confirmOrder(order.id)
    );
  };

const handleAssignDriver = (values: {
  method: "delivery" | "pickup";
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
}) => {
  setAssignDriverVisible(false);

  // ============================================================
  // PICKUP
  // ============================================================

  if (values.method === "pickup") {
    runAction(
      "complete",
      () => completeOrder(order.id)
    );

    return;
  }

  // ============================================================
  // DELIVERY
  // ============================================================

  runAction(
    "assignDriver",
    () =>
      assignDriver(
        order.id,
        values.driverName,
        values.driverPhone
      )
  );
};

  // =========================================================
  // PAYMENT / CURRENCY
  // =========================================================

  /*
   * cash = KHR
   * bank = USD
   */
  const isKHRPayment =
    order.paymentMethod === "cash";

  const paidAmountUSD =
    order.paidAmount ?? 0;

  const remainingAmountUSD =
    order.remainingAmount ?? 0;

  const paidAmountKHR =
    paidAmountUSD * USD_TO_KHR;

  const remainingAmountKHR =
    remainingAmountUSD * USD_TO_KHR;

  // =========================================================
  // COMPLETE
  // =========================================================

  /**
   * Payments can be recorded from the Income / Debtors screens while this
   * order is open, so never trust the local copy. Always re-fetch the
   * latest server state before completing.
   */
const handleComplete = () => {
  const paidAmount = Number(order.paidAmount ?? 0);

  // No payment yet → do not allow complete.
  // Partial payment → allow complete and create customer debt.
  if (paidAmount <= 0) {
    Alert.alert(
      "មិនអាចបញ្ចប់ការបញ្ជាទិញបានទេ",
      "សូមកត់ត្រាការបង់ប្រាក់យ៉ាងហោចណាស់មួយចំនួនជាមុនសិន។",
      [
        {
          text: "យល់ព្រម",
        },
      ]
    
    );

    return;
  }

  runAction(
    "complete",
    () => completeOrder(order.id)
  );
};

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    if (order.status === OrderStatus.Cancelled) {
      return;
    }

    Alert.alert(
      "បោះបង់ការបញ្ជាទិញ",
      "តើអ្នកប្រាកដថាចង់បោះបង់ការបញ្ជាទិញនេះទេ?",
      [
        {
          text: "ទេ",
          style: "cancel",
        },
        {
          text: "បោះបង់",
          style: "destructive",
          onPress: () =>
            runAction(
              "cancel",
              () =>
                cancelOrder(order.id)
            ),
        },
      ]
    );
  };

  // =========================================================
  // UNCOMPLETE
  // =========================================================

  const handleUncomplete = () => {
    runAction(
      "uncomplete",
      () =>
        uncompleteOrder(order.id)
    );
  };

  // =========================================================
  // REORDER
  // =========================================================

  /*
   * Creates a brand-new order from the current order's products.
   *
   * - Current stock is validated first (Snackbar UI on failure).
   * - Current product prices are applied by the backend.
   * - The old order (payment/debt) is NEVER modified.
   * - On success we navigate to the newly created order.
   */
  const handleReorder = async () => {
    if (!order || isReordering) return;

    const result = await reorder(order);

    if (result.ok) {
      if (onOpenOrder) {
        onOpenOrder(result.orderId);
      } else {
        onBack();
      }

      return;
    }

    if (
      result.failure.reason ===
      "insufficient_stock"
    ) {
      const issue =
        result.failure.issues[0];

      if (issue) {
        showSnackbar({
          title: "ស្តុកមិនគ្រប់ចំនួន",
          message: `${issue.productName} មានស្តុកតែ ${issue.available} ប៉ុណ្ណោះ ប៉ុន្តែត្រូវការ ${issue.requested}។`,
        });
      }

      return;
    }

    Alert.alert(
      "កំហុស",
      result.failure.message ??
        "មានបញ្ហាក្នុងការបង្កើតការបញ្ជាទិញម្តងទៀត។ សូមព្យាយាមម្តងទៀត។"
    );
  };

  // =========================================================
  // CALL DRIVER
  // =========================================================

  const callDriver = () => {
    if (
      order.delivery?.driverPhone
    ) {
      const phone =
        order.delivery.driverPhone.replace(
          /\s/g,
          ""
        );

      Linking.openURL(
        `tel:${phone}`
      );
    }
  };

  // =========================================================
  // ACTION LABEL
  // =========================================================

  const actionLabel = (
    key: string,
    label: string
  ) =>
    actionLoading === key ? (
      <ActivityIndicator
        size="small"
        color="#FFFFFF"
      />
    ) : (
      <Text
        className="font-khmerBold text-white text-xl"
        maxFontSizeMultiplier={1.3}
      >
        {label}
      </Text>
    );

  // =========================================================
  // PAYMENT STATUS
  // =========================================================

  const paymentStatusLabel =
    order.paymentStatus
      ? PAYMENT_STATUS_LABELS[
          order.paymentStatus
        ] ??
        order.paymentStatus
      : null;

  // =========================================================
  // PAYMENT CURRENCY LABEL
  // =========================================================

  const paymentCurrencyLabel =
    order.paymentMethod
      ? PAYMENT_CURRENCY_LABELS[
          order.paymentMethod
        ] ??
        order.paymentMethod
      : null;

  // =========================================================
  // NORMAL ORDER DETAIL
  // =========================================================

  return (
    <DetailLayout
      title={order.code}
      onBack={onBack}
    >
      <ScrollView
        className="flex-1 bg-gray-50 px-5 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            ORDER INFORMATION
        ================================================== */}

        <View className="bg-white rounded-2xl p-4 mb-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-start flex-1">
              <View className="w-12 h-12 rounded-xl bg-orange-50 items-center justify-center">
                <Ionicons
                  name="bag-handle-outline"
                  size={26}
                  color="#EA580C"
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="font-khmerBold text-gray-900 text-xl">
                  {order.code}
                </Text>

                <Text className="font-khmer text-gray-400 text-lg mt-0.5">
                  {order.createdAt}
                </Text>
              </View>
            </View>

            <OrderStatusBadge
              status={order.status}
            />
          </View>
        </View>

        {/* =================================================
            STATUS / STEPPER
        ================================================== */}

        {/*
        <View className="bg-white rounded-2xl p-4 mb-3">
          <OrderStepper status={order.status} />
        </View>
        */}

        {/* =================================================
            CUSTOMER INFORMATION
        ================================================== */}

        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="font-khmerBold text-gray-900 text-2xl mb-3">
            ព័ត៌មានអតិថិជន
          </Text>

          <View className="flex-row items-start justify-between py-1">
            <Text className="font-khmer text-gray-400 text-xl">
              ឈ្មោះ
            </Text>

            <Text className="font-khmer text-gray-800 text-xl text-right flex-1 ml-4">
              {order.customer.name}
            </Text>
          </View>

          {order.customer.phone ? (
            <View className="flex-row items-start justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">
                ទូរស័ព្ទ
              </Text>

              <Text className="font-khmer text-gray-800 text-xl text-right flex-1 ml-4">
                {order.customer.phone}
              </Text>
            </View>
          ) : null}

          {order.customer.address ||
          order.address ? (
            <View className="flex-row items-start justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">
                អាស័យដ្ឋាន
              </Text>

              <Text className="font-khmer text-gray-800 text-xl text-right flex-1 ml-4">
                {order.address ||
                  order.customer.address}
              </Text>
            </View>
          ) : null}

          {order.note?.trim() ? (
            <View className="flex-row items-start justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">
                កំណត់ចំណាំ
              </Text>

              <Text className="font-khmer text-gray-800 text-xl text-right flex-1 ml-4">
                {order.note}
              </Text>
            </View>
          ) : null}
        </View>

        {/* =================================================
            DELIVERY INFORMATION
        ================================================== */}

        {order.delivery && (
          <View className="bg-white rounded-2xl p-4 mb-3">
            <Text className="font-khmerBold text-gray-900 text-2xl mb-3">
              ព័ត៌មានដឹកជញ្ជូន
            </Text>

            {order.delivery.driverName ? (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">
                  អ្នកដឹកជញ្ជូន
                </Text>

                <Text className="font-khmer text-gray-800 text-xl">
                  {
                    order.delivery
                      .driverName
                  }
                </Text>
              </View>
            ) : null}

            {order.delivery.driverPhone ? (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">
                  ទូរស័ព្ទអ្នកដឹក
                </Text>

                <Text className="font-khmer text-gray-800 text-xl">
                  {
                    order.delivery
                      .driverPhone
                  }
                </Text>
              </View>
            ) : null}
            {order.delivery.vehiclePlate ? (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">
                  លេខរថយន្ត
                </Text>

                <Text className="font-khmer text-gray-800 text-xl">
                  {
                    order.delivery
                      .vehiclePlate
                  }
                </Text>
              </View>
            ) : null}
            {order.delivery.confirmedAt ? (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">
                  ការបញ្ជាក់
                </Text>
                <Text className="font-khmer text-gray-800 text-xl">
                  {
                    order.delivery
                      .confirmedAt
                  }
                </Text>
              </View>
            ) : null}

            {order.delivery.deliveredAt ? (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">
                  បានដឹកជញ្ជូន
                </Text>

                <Text className="font-khmer text-gray-800 text-xl">
                  {
                    order.delivery
                      .deliveredAt
                  }
                </Text>
              </View>
            ) : null}
          </View>
        )}

        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="font-khmerBold text-gray-900 text-2xl mb-1">
            ទំនិញ ({order.lines.length} មុខ)
          </Text>

          {order.lines.map(
            (item, index) => (
              <OrderItemRow
                key={`${item.id}-${index}`}
                item={item}
              />
            )
          )}

          <OrderSummary
            subtotal={order.subtotal}
            deliveryFee={
              order.deliveryFee
            }
            total={order.total}
          />
        </View>
        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="font-khmerBold text-gray-900 text-2xl mb-3">
            ព័ត៌មានបង់ប្រាក់
          </Text>

          {/* PAYMENT STATUS */}
          {paymentStatusLabel ? (
            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">
                ស្ថានភាព
              </Text>

              <Text
                className={`font-khmerBold text-xl ${
                  order.paymentStatus ===
                  "paid"
                    ? "text-green-600"
                    : order.paymentStatus ===
                        "partial"
                    ? "text-orange-600"
                    : "text-red-600"
                }`}
              >
                {paymentStatusLabel}
              </Text>
            </View>
          ) : null}

          {/* PAID AMOUNT */}
          {order.paidAmount !=
          null ? (
            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">
                បានបង់
              </Text>

              <View className="items-end">
                <Text className="font-khmerBold text-green-600 text-xl">
                  {isKHRPayment
                    ? formatKHR(
                        paidAmountKHR
                      )
                    : formatUSD(
                        paidAmountUSD
                      )}
                </Text>

                {isKHRPayment ? (
                  <Text className="font-khmer text-gray-400 text-sm mt-0.5">
                    (
                    {formatUSD(
                      paidAmountUSD
                    )}
                    )
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* REMAINING AMOUNT */}
          {order.remainingAmount !=
            null &&
          remainingAmountUSD > 0 ? (
            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">
                នៅសល់
              </Text>

              <View className="items-end">
                <Text className="font-khmer text-red-500 text-xl">
                  {isKHRPayment
                    ? formatKHR(
                        remainingAmountKHR
                      )
                    : formatUSD(
                        remainingAmountUSD
                      )}
                </Text>

                {isKHRPayment ? (
                  <Text className="font-khmer text-gray-400 text-sm mt-0.5">
                    (
                    {formatUSD(
                      remainingAmountUSD
                    )}
                    )
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* PAYMENT METHOD */}
          {paymentCurrencyLabel ? (
            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">
                រូបិយប័ណ្ណ
              </Text>

              <Text className="font-khmer text-gray-800 text-xl">
                {
                  paymentCurrencyLabel
                }
              </Text>
            </View>
          ) : null}

          {/* EXCHANGE RATE */}
          {isKHRPayment ? (
            <View className="mt-3 pt-3 border-t border-gray-100">
              <Text className="font-khmer text-gray-400 text-sm">
                អត្រាប្តូរប្រាក់៖ 1 USD
                ={" "}
                {USD_TO_KHR.toLocaleString(
                  "en-US",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}{" "}
                ៛
              </Text>
            </View>
          ) : null}
        </View>

        <View className="h-6" />
      </ScrollView>
      {(order.status ===
        OrderStatus.New ||
        order.status ===
          OrderStatus.Pending) && (
        <View
          className="px-5 pt-3 bg-white border-t border-gray-100 flex-row gap-3"
          style={footerStyle}
        >
          <TouchableOpacity
            onPress={handleCancel}
            disabled={!!actionLoading}
            className="flex-1 border border-red-500 rounded-xl h-12 items-center justify-center"
          >
            <Text
              className="font-khmerBold text-red-500 text-xl"
              maxFontSizeMultiplier={1.3}
            >
              បោះបង់
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleApprove}
            disabled={!!actionLoading}
            className="flex-1 bg-blue-600 rounded-xl h-12 items-center justify-center"
          >
            {actionLabel(
              "approve",
              "ពិនិត្យ"
            )}
          </TouchableOpacity>
        </View>
      )}
      {order.status ===
        OrderStatus.Approved && (
        <View
          className="px-5 pt-3 bg-white border-t border-gray-100"
          style={footerStyle}
        >
          <TouchableOpacity
            onPress={() =>
              setAssignDriverVisible(
                true
              )
            }
            disabled={!!actionLoading}
            className="bg-blue-600 rounded-xl h-12 items-center justify-center"
          >
            {actionLabel(
              "assignDriver",
              "កំណត់ការដឹកជញ្ជូន"
            )}
          </TouchableOpacity>
        </View>
      )}
      {order.status ===
        OrderStatus.Shipping && (
        <View
          className={`px-5 pt-3 bg-white border-t border-gray-100 gap-3 ${
            isSmallPhone
              ? ""
              : "flex-row"
          }`}
          style={footerStyle}
        >
          {order.delivery
            ?.driverPhone ? (
            <TouchableOpacity
              onPress={callDriver}
              disabled={!!actionLoading}
              className={`${
                isSmallPhone
                  ? ""
                  : "flex-1"
              } border border-blue-600 rounded-xl h-12 items-center justify-center flex-row gap-1.5`}
            >
              <Ionicons
                name="call-outline"
                size={16}
                color="#2563EB"
              />

              <Text
                className="font-khmerBold text-blue-600 text-xl"
                maxFontSizeMultiplier={
                  1.3
                }
              >
                ទាក់ទងអ្នកដឹកជញ្ជូន
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!!actionLoading}
            className={`${
              isSmallPhone
                ? ""
                : "flex-1"
            } bg-blue-600 rounded-xl h-12 items-center justify-center`}
          >
            {actionLabel(
              "confirm",
              "បញ្ជាក់ការដឹកជញ្ជូន"
            )}
          </TouchableOpacity>
        </View>
      )}
      {order.status ===
        OrderStatus.Confirmed && (
        <View
          className="px-5 pt-3 bg-white border-t border-gray-100"
          style={footerStyle}
        >
          <TouchableOpacity
            onPress={handleComplete}
            disabled={!!actionLoading}
            className="bg-blue-600 rounded-xl h-12 items-center justify-center"
          >
            {actionLabel(
              "complete",
              "បញ្ចប់ការដឹកជញ្ជូន"
            )}
          </TouchableOpacity>
        </View>
      )}
      {order.status ===
        OrderStatus.Completed && (
        <View
          className="px-5 pt-3 bg-white border-t border-gray-100"
          style={footerStyle}
        >
          <TouchableOpacity
            onPress={handleUncomplete}
            disabled={!!actionLoading}
            activeOpacity={0.7}
            className="border border-orange-500 rounded-xl h-12 items-center justify-center"
          >
            {actionLoading ===
            "uncomplete" ? (
              <ActivityIndicator
                size="small"
                color="#EA580C"
              />
            ) : (
              <Text
                className="font-khmerBold text-orange-500 text-xl"
                maxFontSizeMultiplier={
                  1.3
                }
              >
                មិនទាន់បញ្ចប់
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setShowReport(true)
            }
            disabled={!!actionLoading}
            activeOpacity={0.7}
            className="border border-blue-600 rounded-xl h-12 items-center justify-center mt-3"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="receipt-outline"
                size={19}
                color="#2563EB"
              />

              <Text
                className="font-khmerBold text-blue-600 text-xl ml-2"
                maxFontSizeMultiplier={
                  1.3
                }
              >
                មើលវិក័យប័ត្រ
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
      {order.status !==
        OrderStatus.Cancelled && (
        <View
          className="px-5 pt-3 bg-white border-t border-gray-100"
          style={footerStyle}
        >
        </View>
      )}
      <Snackbar data={snackbar} />
      <AssignDriverModal
        visible={assignDriverVisible}
        loading={
          actionLoading ===
          "assignDriver"
        }
        onCancel={() =>
          setAssignDriverVisible(
            false
          )
        }
        onSubmit={
          handleAssignDriver
        }
      />
    </DetailLayout>
  );
}