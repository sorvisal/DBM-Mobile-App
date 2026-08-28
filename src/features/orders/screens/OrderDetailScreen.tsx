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

import { OrderStatus } from "../types/types";
import { useOrderDetail } from "../hooks/useOrderDetail";
import { useUpdateOrderStatus } from "../hooks/useUpdateOrderStatus";
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
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "មិនទាន់បង់",
  partial: "បង់រួចផ្នែក",
  paid: "បានបង់រួច",
};

export function OrderDetailScreen({
  orderId,
  onBack,
}: OrderDetailScreenProps) {
  // =========================================================
  // HOOKS
  // IMPORTANT:
  // ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURN
  // =========================================================

  const { order, isLoading, refresh } =
    useOrderDetail(orderId);

  const {
    confirmOrder,
    approveOrder,
    assignDriver,
    completeOrder,
    uncompleteOrder,
    cancelOrder,
  } = useUpdateOrderStatus();

  const [assignDriverVisible, setAssignDriverVisible] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  // FIX:
  // This hook must be declared with the other hooks.
  const [showReport, setShowReport] =
    useState(false);

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

      // Reload order after successful action
      refresh();
    } catch (error) {
      if (__DEV__) {
        console.error(
          `[ORDER ACTION] ${key} failed:`,
          error
        );
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
  //
  // IMPORTANT:
  // This is AFTER all hooks.
  // No hooks are declared below this point.
  //

  if (showReport) {
    return (
      <ViewReport
        order={order}
        onBack={() => setShowReport(false)}
      />
    );
  }

  // =========================================================
  // ORDER ACTIONS
  // =========================================================

  const handleApprove = () => {
    runAction(
      "approve",
      () => approveOrder(order.id)
    );
  };

  const handleConfirm = () => {
    runAction(
      "confirm",
      () => confirmOrder(order.id)
    );
  };

  const handleAssignDriver = (values: {
    driverName: string;
    driverPhone: string;
    vehiclePlate: string;
  }) => {
    setAssignDriverVisible(false);

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

  const handleComplete = () => {
    const remaining =
      order.remainingAmount ?? 0;

    if (remaining > 0) {
      Alert.alert(
        "មិនអាចបញ្ចប់ការបញ្ជាទិញបានទេ",
        `អតិថិជននៅមិនទាន់បង់ប្រាក់ $${remaining.toFixed(
          2
        )}។ សូមទូទាត់ប្រាក់ជាមុនសិន។`,
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

  const handleCancel = () => {
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
              () => cancelOrder(order.id)
            ),
        },
      ]
    );
  };

  const handleUncomplete = () => {
    runAction(
      "uncomplete",
      () => uncompleteOrder(order.id)
    );
  };

  // =========================================================
  // CALL DRIVER
  // =========================================================

  const callDriver = () => {
    if (order.delivery?.driverPhone) {
      const phone =
        order.delivery.driverPhone.replace(
          /\s/g,
          ""
        );

      Linking.openURL(`tel:${phone}`);
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
      <Text className="font-khmerBold text-white text-xl">
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
        ] ?? order.paymentStatus
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

        {/* <View className="bg-white rounded-2xl p-4 mb-3">
          <OrderStepper status={order.status} />
        </View> */}

        {/* =================================================
            CUSTOMER INFORMATION
        ================================================== */}

        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="font-khmerBold text-gray-900 text-2xl mb-3">
            ព័ត៌មានអតិថិជន
          </Text>

          {/* Name */}
          <View className="flex-row items-start justify-between py-1">
            <Text className="font-khmer text-gray-400 text-xl">
              ឈ្មោះ
            </Text>

            <Text className="font-khmer text-gray-800 text-xl text-right flex-1 ml-4">
              {order.customer.name}
            </Text>
          </View>

          {/* Phone */}
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

          {/* Address */}
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

          {/* Order Note */}
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
                  {order.delivery.driverName}
                </Text>
              </View>
            ) : null}

            {order.delivery.driverPhone ? (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">
                  ទូរស័ព្ទអ្នកដឹក
                </Text>

                <Text className="font-khmer text-gray-800 text-xl">
                  {order.delivery.driverPhone}
                </Text>
              </View>
            ) : null}

            {order.delivery.vehiclePlate ? (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">
                  លេខរថយន្ត
                </Text>

                <Text className="font-khmer text-gray-800 text-xl">
                  {order.delivery.vehiclePlate}
                </Text>
              </View>
            ) : null}

            {order.delivery.confirmedAt ? (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">
                  ការបញ្ជាក់
                </Text>

                <Text className="font-khmer text-gray-800 text-xl">
                  {order.delivery.confirmedAt}
                </Text>
              </View>
            ) : null}

            {order.delivery.deliveredAt ? (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">
                  បានដឹកជញ្ជូន
                </Text>

                <Text className="font-khmer text-gray-800 text-xl">
                  {order.delivery.deliveredAt}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* =================================================
            ORDER ITEMS
        ================================================== */}

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
            deliveryFee={order.deliveryFee}
            total={order.total}
          />
        </View>

        {/* =================================================
            PAYMENT INFORMATION
        ================================================== */}

        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="font-khmerBold text-gray-900 text-2xl mb-3">
            ព័ត៌មានបង់ប្រាក់
          </Text>

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

          {order.paidAmount != null ? (
            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">
                បានបង់
              </Text>

              <Text className="font-khmer text-gray-800 text-xl">
                $
                {order.paidAmount.toFixed(
                  2
                )}
              </Text>
            </View>
          ) : null}

          {order.remainingAmount != null &&
          order.remainingAmount > 0 ? (
            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">
                នៅសល់
              </Text>

              <Text className="font-khmer text-red-500 text-xl">
                $
                {order.remainingAmount.toFixed(
                  2
                )}
              </Text>
            </View>
          ) : null}

          {order.paymentMethod ? (
            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">
                វិធីបង់ប្រាក់
              </Text>

              <Text className="font-khmer text-gray-800 text-xl">
                {order.paymentMethod}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* =================================================
          ACTION BUTTONS
      ================================================== */}

      {(order.status ===
        OrderStatus.New ||
        order.status ===
          OrderStatus.Pending) && (
        <View className="px-5 py-3 bg-white border-t border-gray-100 flex-row gap-3">
          <TouchableOpacity
            onPress={handleCancel}
            disabled={!!actionLoading}
            className="flex-1 border border-red-500 rounded-xl h-12 items-center justify-center"
          >
            <Text className="font-khmerBold text-red-500 text-xl">
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

      {/* =================================================
          APPROVED
      ================================================== */}

      {order.status ===
        OrderStatus.Approved && (
        <View className="px-5 py-3 bg-white border-t border-gray-100 flex-row gap-3">
          <TouchableOpacity
            onPress={() =>
              setAssignDriverVisible(true)
            }
            disabled={!!actionLoading}
            className="flex-1 bg-blue-600 rounded-xl h-12 items-center justify-center mb-8"
          >
            {actionLabel(
              "assignDriver",
              "កំណត់ការដឹកជញ្ជូន"
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* =================================================
          SHIPPING
      ================================================== */}

      {order.status ===
        OrderStatus.Shipping && (
        <View className="px-5 py-3 bg-white border-t border-gray-100 flex-row gap-3 mb-6">
          {order.delivery?.driverPhone ? (
            <TouchableOpacity
              onPress={callDriver}
              disabled={!!actionLoading}
              className="flex-1 border border-blue-600 rounded-xl h-12 items-center justify-center flex-row gap-1.5"
            >
              <Ionicons
                name="call-outline"
                size={16}
                color="#2563EB"
              />

              <Text className="font-khmerBold text-blue-600 text-xl">
                ទាក់ទងអ្នកដឹកជញ្ជូន
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!!actionLoading}
            className="flex-1 bg-blue-600 rounded-xl h-12 items-center justify-center"
          >
            {actionLabel(
              "confirm",
              "បញ្ជាក់ការដឹកជញ្ជូន"
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* =================================================
          CONFIRMED
      ================================================== */}

      {order.status ===
        OrderStatus.Confirmed && (
        <View className="px-5 py-3 bg-white border-t border-gray-100 flex-row gap-3">
          <TouchableOpacity
            onPress={handleComplete}
            disabled={!!actionLoading}
            className="flex-1 bg-blue-600 rounded-xl h-12 items-center justify-center mb-8"
          >
            {actionLabel(
              "complete",
              "បញ្ចប់ការដឹកជញ្ជូន"
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* =================================================
          COMPLETED
      ================================================== */}

      {order.status ===
        OrderStatus.Completed && (
        <View className="px-5 py-3 bg-white border-t border-gray-100 flex-row gap-3">
          {/* Uncomplete */}
          <TouchableOpacity
            onPress={handleUncomplete}
            disabled={!!actionLoading}
            className="flex-1 border border-orange-500 rounded-xl h-12 items-center justify-center mb-8"
          >
            {actionLoading ===
            "uncomplete" ? (
              <ActivityIndicator
                size="small"
                color="#EA580C"
              />
            ) : (
              <Text className="font-khmerBold text-orange-500 text-xl">
                មិនទាន់បញ្ចប់
              </Text>
            )}
          </TouchableOpacity>

          {/* View Report */}
          <TouchableOpacity
            onPress={() =>
              setShowReport(true)
            }
            disabled={!!actionLoading}
            activeOpacity={0.7}
            className="flex-1 border border-blue-600 rounded-xl h-12 items-center justify-center mb-8"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="receipt-outline"
                size={19}
                color="#2563EB"
              />

              <Text className="font-khmerBold text-blue-600 text-xl ml-2">
                មើលវិក័យប័ត្រ
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* =================================================
          ASSIGN DRIVER MODAL
      ================================================== */}

      <AssignDriverModal
        visible={assignDriverVisible}
        loading={
          actionLoading === "assignDriver"
        }
        onCancel={() =>
          setAssignDriverVisible(false)
        }
        onSubmit={handleAssignDriver}
      />
    </DetailLayout>
  );
}