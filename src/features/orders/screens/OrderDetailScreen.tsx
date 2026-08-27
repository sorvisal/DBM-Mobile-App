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
import { OrderConfirmModal } from "../components/OrderConfirmModal";
import { DetailLayout } from "../../../layouts/DetailLayout";

type OrderDetailScreenProps = {
  orderId: string;
  onBack: () => void;
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "មិនទាន់បង់",
  partial: "បង់រួចផ្នែក",
  paid: "បានបង់រួច",
};

export function OrderDetailScreen({ orderId, onBack }: OrderDetailScreenProps) {
  const { order, isLoading, refresh } = useOrderDetail(orderId);
  const {
    updateOrderStatus,
    confirmOrder,
    completeOrder,
    uncompleteOrder,
    cancelOrder,
  } = useUpdateOrderStatus();

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const runAction = async (key: string, fn: () => Promise<void>) => {
    if (actionLoading) return;
    setActionLoading(key);
    try {
      await fn();
      refresh();
    } catch {
      Alert.alert("កំហុស", "មានបញ្ហាក្នុងការធ្វើបច្ចុប្បន្នភាព។ សូមព្យាយាមម្តងទៀត។");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <DetailLayout title="ព័ត៌មានការបញ្ជាទិញ" onBack={onBack}>
        <View className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="font-khmer text-gray-400 text-sm mt-3">កំពុងផ្ទុក...</Text>
        </View>
      </DetailLayout>
    );
  }

  if (!order) {
    return (
      <DetailLayout title="ព័ត៌មានការបញ្ជាទិញ" onBack={onBack}>
        <View className="flex-1 items-center justify-center px-6 bg-gray-50">
          <Ionicons name="alert-circle-outline" size={34} color="#D1D5DB" />
          <Text className="font-khmer text-gray-400 text-sm mt-2 text-center">
            រកមិនឃើញការបញ្ជាទិញ
          </Text>
        </View>
      </DetailLayout>
    );
  }

  const handleConfirm = () => {
    setConfirmModalVisible(false);
    runAction("confirm", () => confirmOrder(order!.id));
  };

  const handleShipping = () => {
    runAction("shipping", () => updateOrderStatus(order!.id, OrderStatus.Shipping));
  };

  const handleComplete = () => {
    runAction("complete", () => completeOrder(order!.id));
  };

  const handleCancel = () => {
    Alert.alert("បោះបង់ការបញ្ជាទិញ", "តើអ្នកប្រាកដថាចង់បោះបង់ការបញ្ជាទិញនេះទេ?", [
      { text: "ទេ", style: "cancel" },
      {
        text: "បោះបង់",
        style: "destructive",
        onPress: () => runAction("cancel", () => cancelOrder(order!.id)),
      },
    ]);
  };

  const handleUncomplete = () => {
    runAction("uncomplete", () => uncompleteOrder(order!.id));
  };

  const callDriver = () => {
    if (order.delivery?.driverPhone) {
      Linking.openURL(`tel:${order.delivery.driverPhone.replace(/\s/g, "")}`);
    }
  };

  const actionLabel = (key: string, label: string) =>
    actionLoading === key ? (
      <ActivityIndicator size="small" color="#fff" />
    ) : (
      <Text className="font-khmerBold text-white text-xl">{label}</Text>
    );

  const paymentStatusLabel =
    order.paymentStatus ? PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus : null;

  return (
    <DetailLayout title={order.code} onBack={onBack}>
      <ScrollView className="flex-1 bg-gray-50 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {/* ── Order Information ── */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-start flex-1">
              <View className="w-12 h-12 rounded-xl bg-orange-50 items-center justify-center">
                <Ionicons name="bag-handle-outline" size={26} color="#EA580C" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-khmerBold text-gray-900 text-xl">{order.code}</Text>
                <Text className="font-khmer text-gray-400 text-lg mt-0.5">{order.createdAt}</Text>
              </View>
            </View>
            <OrderStatusBadge status={order.status} />
          </View>
        </View>

        {/* ── Status / Stepper ── */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <OrderStepper status={order.status} />
        </View>

        {/* ── Customer Information ── */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="font-khmerBold text-gray-900 text-2xl mb-3">ព័ត៌មានអតិថិជន</Text>
          <View className="flex-row items-center justify-between py-1">
            <Text className="font-khmer text-gray-400 text-xl">ឈ្មោះ</Text>
            <Text className="font-khmer text-gray-800 text-xl">{order.customer.name}</Text>
          </View>
          {order.customer.phone ? (
            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">ទូរស័ព្ទ</Text>
              <Text className="font-khmer text-gray-800 text-xl">{order.customer.phone}</Text>
            </View>
          ) : null}
          {order.address ? (
            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">អាស័យដ្ឋាន</Text>
              <Text className="font-khmer text-gray-800 text-xl text-right flex-1 ml-4" numberOfLines={2}>
                {order.address}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── Delivery Information ── */}
        {order.delivery && (
          <View className="bg-white rounded-2xl p-4 mb-3">
            <Text className="font-khmerBold text-gray-900 text-2xl mb-3">ព័ត៌មានដឹកជញ្ជូន</Text>

            {order.delivery.driverName ? (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">អ្នកដឹកជញ្ជូន</Text>
                <Text className="font-khmer text-gray-800 text-xl">{order.delivery.driverName}</Text>
              </View>
            ) : null}
            {order.delivery.driverPhone ? (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">ទូរស័ព្ទអ្នកដឹក</Text>
                <Text className="font-khmer text-gray-800 text-xl">{order.delivery.driverPhone}</Text>
              </View>
            ) : null}
            {order.delivery.vehiclePlate ? (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">លេខរថយន្ត</Text>
                <Text className="font-khmer text-gray-800 text-xl">{order.delivery.vehiclePlate}</Text>
              </View>
            ) : null}
            {order.delivery.confirmedAt ? (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">ការបញ្ជាក់</Text>
                <Text className="font-khmer text-gray-800 text-xl">{order.delivery.confirmedAt}</Text>
              </View>
            ) : null}
            {order.delivery.deliveredAt ? (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">បានដឹកជញ្ជូន</Text>
                <Text className="font-khmer text-gray-800 text-xl">{order.delivery.deliveredAt}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* ── Order Items ── */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="font-khmerBold text-gray-900 text-2xl mb-1">
            ទំនិញ ({order.lines.length} មុខ)
          </Text>
          {order.lines.map((item, index) => (
            <OrderItemRow key={`${item.id}-${index}`} item={item} />
          ))}
          <OrderSummary subtotal={order.subtotal} deliveryFee={order.deliveryFee} total={order.total} />
        </View>

        {/* ── Payment Information ── */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="font-khmerBold text-gray-900 text-2xl mb-3">ព័ត៌មានបង់ប្រាក់</Text>

          {paymentStatusLabel ? (
            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">ស្ថានភាព</Text>
              <Text
                className={`font-khmerBold text-xl ${
                  order.paymentStatus === "paid"
                    ? "text-green-600"
                    : order.paymentStatus === "partial"
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
              <Text className="font-khmer text-gray-400 text-xl">បានបង់</Text>
              <Text className="font-khmer text-gray-800 text-xl">${order.paidAmount.toFixed(2)}</Text>
            </View>
          ) : null}
          {order.remainingAmount != null && order.remainingAmount > 0 ? (
            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">នៅសល់</Text>
              <Text className="font-khmer text-red-500 text-xl">${order.remainingAmount.toFixed(2)}</Text>
            </View>
          ) : null}
          {order.paymentMethod ? (
            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">វិធីបង់ប្រាក់</Text>
              <Text className="font-khmer text-gray-800 text-xl">{order.paymentMethod}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Notes ── */}
        {order.note ? (
          <View className="bg-white rounded-2xl p-4 mb-3">
            <Text className="font-khmerBold text-gray-900 text-2xl mb-3">កំណត់ចំណាំ</Text>
            <Text className="font-khmer text-gray-800 text-xl">{order.note}</Text>
          </View>
        ) : null}

        <View className="h-6" />
      </ScrollView>

      {/* ── Action Buttons ── */}
      {(order.status === OrderStatus.New || order.status === OrderStatus.Pending) && (
        <View className="px-5 py-3 bg-white border-t border-gray-100 flex-row gap-3">
          <TouchableOpacity
            onPress={handleCancel}
            disabled={!!actionLoading}
            className="flex-1 border border-red-500 rounded-xl h-12 items-center justify-center"
          >
            <Text className="font-khmerBold text-red-500 text-xl">បោះបង់</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setConfirmModalVisible(true)}
            disabled={!!actionLoading}
            className="flex-1 bg-blue-600 rounded-xl h-12 items-center justify-center"
          >
            {actionLabel("confirm", "បញ្ជាក់ការទិញ")}
          </TouchableOpacity>
        </View>
      )}

      {order.status === OrderStatus.Confirmed && (
        <View className="px-5 py-3 bg-white border-t border-gray-100 flex-row gap-3">
          <TouchableOpacity
            onPress={handleShipping}
            disabled={!!actionLoading}
            className="flex-1 bg-blue-600 rounded-xl h-12 items-center justify-center mb-8"
          >
            {actionLabel("shipping", "ដឹកជញ្ជូន")}
          </TouchableOpacity>
        </View>
      )}

      {order.status === OrderStatus.Shipping && (
        <View className="px-5 py-3 bg-white border-t border-gray-100 flex-row gap-3">
          {order.delivery?.driverPhone ? (
            <TouchableOpacity
              onPress={callDriver}
              disabled={!!actionLoading}
              className="flex-1 border border-blue-600 rounded-xl h-12 items-center justify-center flex-row gap-1.5"
            >
              <Ionicons name="call-outline" size={16} color="#2563EB" />
              <Text className="font-khmerBold text-blue-600 text-xl">ទាក់ទងអ្នកដឹក</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={handleComplete}
            disabled={!!actionLoading}
            className="flex-1 bg-blue-600 rounded-xl h-12 items-center justify-center"
          >
            {actionLabel("complete", "បានទទួល")}
          </TouchableOpacity>
        </View>
      )}

      {order.status === OrderStatus.Completed && (
        <View className="px-5 py-3 bg-white border-t border-gray-100 flex-row gap-3">
          <TouchableOpacity
            onPress={handleUncomplete}
            disabled={!!actionLoading}
            className="flex-1 border border-orange-500 rounded-xl h-12 items-center justify-center"
          >
            {actionLoading === "uncomplete" ? (
              <ActivityIndicator size="small" color="#EA580C" />
            ) : (
              <Text className="font-khmerBold text-orange-500 text-xl">មិនបញ្ចប់</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!!actionLoading}
            className="flex-1 border border-blue-600 rounded-xl h-12 items-center justify-center"
          >
            <Text className="font-khmerBold text-blue-600 text-xl">មើលវិក័យប័ត្រ</Text>
          </TouchableOpacity>
        </View>
      )}

      <OrderConfirmModal
        visible={confirmModalVisible}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModalVisible(false)}
      />
    </DetailLayout>
  );
}
