import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Linking, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OrderStatus } from "../types/types";
import { useOrderDetail } from "../hooks/useOrderDetail";
import { useUpdateOrderStatus } from "../hooks/useUpdateOrderStatus";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { OrderStepper } from "../components/OrderStepper";
import { OrderItemRow } from "../components/OrderItemRow";
import { OrderSummary } from "../components/OrderSummary";
import { OrderConfirmModal } from "../components/OrderConfirmModal";

type OrderDetailScreenProps = {
  orderId: string;
  onBack: () => void;
};

export function OrderDetailScreen({ orderId, onBack }: OrderDetailScreenProps) {
  const { order, isLoading } = useOrderDetail(orderId);
  const { updateOrderStatus } = useUpdateOrderStatus();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // Loading state — full-screen overlay, shown while the request is in flight
  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
        <View className="bg-white px-5 pt-3 pb-3 flex-row items-center justify-between relative border-b border-gray-100">
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="arrow-back" size={26} color="#1F2937" />
          </TouchableOpacity>
          <View className="absolute left-0 right-0 items-center justify-center pointer-events-none">
            <Text className="font-khmerBold text-gray-900 text-2xl">​</Text>
          </View>
          <View style={{ width: 26 }} />
        </View>

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="font-khmer text-gray-400 text-sm mt-3">កំពុងផ្ទុក...</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return null;
  }

  const handleConfirmOrder = () => {
    updateOrderStatus(order.id, OrderStatus.Shipping, {
      confirmedAt: new Date().toLocaleString(),
      driverName: "គង់ សុគន្ធ",
      driverPhone: "093 456 789",
      vehiclePlate: "1B-2345",
    });
    setConfirmModalVisible(false);
  };

  const handleCancelOrder = () => {
    updateOrderStatus(order.id, OrderStatus.Cancelled);
  };

  const handleReceived = () => {
    updateOrderStatus(order.id, OrderStatus.Completed, {
      deliveredAt: new Date().toLocaleString(),
    });
  };

  const callDriver = () => {
    if (order.delivery?.driverPhone) {
      Linking.openURL(`tel:${order.delivery.driverPhone.replace(/\s/g, "")}`);
    }
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Header */}
      <View className="bg-white px-5 pt-3 pb-3 flex-row items-center justify-between relative border-b border-gray-100">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={26} color="#1F2937" />
        </TouchableOpacity>

        <View className="absolute left-0 right-0 items-center justify-center pointer-events-none">
          <Text className="font-khmerBold text-gray-900 text-2xl">{order.code}</Text>
        </View>

        <View style={{ width: 26 }} />
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* Order card: code, status, customer, phone, date */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-start flex-1">
              <View className="w-12 h-12 rounded-xl bg-orange-50 items-center justify-center">
                <Ionicons name="bag-handle-outline" size={26} color="#EA580C" />
              </View>
              <View className="ml-3">
                <Text className="font-khmerBold text-gray-900 text-2xl">{order.code}</Text>
                <Text className="font-khmer text-gray-500 text-2xl mt-1">{order.customer.name}</Text>
                <Text className="font-khmer text-gray-400 text-2xl mt-0.5">{order.customer.phone}</Text>
                <Text className="font-khmer text-gray-400 text-2xl mt-0.5">{order.createdAt}</Text>
              </View>
            </View>
            <OrderStatusBadge status={order.status} />
          </View>
        </View>

        {/* Stepper — only for Confirmed, Shipping, Completed */}
        {(order.status === OrderStatus.Confirmed ||
          order.status === OrderStatus.Shipping ||
          order.status === OrderStatus.Completed) && (
          <View className="bg-white rounded-2xl p-4 mb-3">
            <OrderStepper status={order.status} />
          </View>
        )}

        {/* Delivery info — only while Shipping */}
        {order.delivery && order.status === OrderStatus.Shipping && (
          <View className="bg-white rounded-2xl p-4 mb-3">
            <Text className="font-khmerBold text-gray-900 text-2xl mb-3">ព័ត៌មានដឹកជញ្ជូន</Text>

            {order.delivery.driverName && (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">អ្នកដឹកជញ្ជូន</Text>
                <Text className="font-khmer text-gray-800 text-xl">{order.delivery.driverName}</Text>
              </View>
            )}
            {order.delivery.driverPhone && (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">លេខទូរស័ព្ទ</Text>
                <Text className="font-khmer text-gray-800 text-xl">{order.delivery.driverPhone}</Text>
              </View>
            )}
            {order.delivery.vehiclePlate && (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">លេខរថយន្ត</Text>
                <Text className="font-khmer text-gray-800 text-xl">{order.delivery.vehiclePlate}</Text>
              </View>
            )}
            {order.delivery.confirmedAt && (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xl">កំពុងធ្វើ</Text>
                <Text className="font-khmer text-gray-800 text-xl">{order.delivery.confirmedAt}</Text>
              </View>
            )}
          </View>
        )}

        {/* Completion info — only for Completed orders */}
        {order.status === OrderStatus.Completed && (
          <View className="bg-white rounded-2xl p-4 mb-3">
            <Text className="font-khmerBold text-gray-900 text-xl mb-3">ព័ត៌មានបញ្ចប់</Text>

            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">បញ្ចប់នៅ</Text>
              <Text className="font-khmer text-gray-800 text-xl">{order.delivery?.deliveredAt ?? "-"}</Text>
            </View>
            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">អ្នកទទួល</Text>
              <Text className="font-khmer text-gray-800 text-xl">{order.customer.name}</Text>
            </View>
            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">ការបង់ប្រាក់</Text>
              <Text className="font-khmerBold text-green-600 text-xl">{order.paymentStatus ?? "បានបង់រួច"}</Text>
            </View>
            <View className="flex-row items-center justify-between py-1">
              <Text className="font-khmer text-gray-400 text-xl">ចំណាំ</Text>
              <Text className="font-khmer text-gray-800 text-xl">អគុណ!</Text>
            </View>
          </View>
        )}

        {/* Order info: payment method, address, note */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="font-khmerBold text-gray-900 text-2xl mb-3">ព័ត៌មានការបញ្ជាទិញ</Text>

          <View className="flex-row items-center justify-between py-1">
            <Text className="font-khmer text-gray-400 text-xl">វិធីបង់ប្រាក់</Text>
            <Text className="font-khmer text-gray-800 text-xl">{order.paymentMethod ?? "-"}</Text>
          </View>
          <View className="flex-row items-center justify-between py-1">
            <Text className="font-khmer text-gray-400 text-xl">អាសយដ្ឋានដឹកជញ្ជូន</Text>
            <Text className="font-khmer text-gray-800 text-xl text-right flex-1 ml-4" numberOfLines={2}>
              {order.address ?? "-"}
            </Text>
          </View>
          <View className="flex-row items-center justify-between py-1">
            <Text className="font-khmer text-gray-400 text-xl">កំណត់ចំណាំ</Text>
            <Text className="font-khmer text-gray-800 text-xl">{order.note ?? "-"}</Text>
          </View>
        </View>

        {/* Items */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="font-khmerBold text-gray-900 text-2xl mb-1">
            ទំនិញ ({order.items.length} មុខ)
          </Text>
          {order.items.map((item, index) => (
            <OrderItemRow key={`${item.id}-${index}`} item={item} />
          ))}
          <OrderSummary subtotal={order.subtotal} deliveryFee={order.deliveryFee} total={order.total} />
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Action buttons */}
      {(order.status === OrderStatus.New || order.status === OrderStatus.Pending) && (
        <View className="px-5 py-3 bg-white border-t border-gray-100 flex-row gap-3">
          <TouchableOpacity
            onPress={handleCancelOrder}
            className="flex-1 border border-red-500 rounded-xl h-12 items-center justify-center"
          >
            <Text className="font-khmerBold text-red-500 text-xl">បោះបង់</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setConfirmModalVisible(true)}
            className="flex-1 bg-blue-600 rounded-xl h-12 items-center justify-center"
          >
            <Text className="font-khmerBold text-white text-xl">បញ្ជាក់ការទិញ</Text>
          </TouchableOpacity>
        </View>
      )}

      {order.status === OrderStatus.Confirmed && (
        <View className="px-5 py-3 bg-white border-t border-gray-100 flex-row gap-3">
          <TouchableOpacity
            onPress={() =>
              updateOrderStatus(order.id, OrderStatus.Shipping, {
                confirmedAt: new Date().toLocaleString(),
              })
            }
            className="flex-1 bg-blue-600 rounded-xl h-12 items-center justify-center"
          >
            <Text className="font-khmerBold text-white text-xl">ដឹកជញ្ជូន</Text>
          </TouchableOpacity>
        </View>
      )}

      {order.status === OrderStatus.Shipping && (
        <View className="px-5 py-3 bg-white border-t border-gray-100 flex-row gap-3">
          <TouchableOpacity
            onPress={callDriver}
            className="flex-1 border border-blue-600 rounded-xl h-12 items-center justify-center flex-row gap-1.5"
          >
            <Ionicons name="call-outline" size={16} color="#2563EB" />
            <Text className="font-khmerBold text-blue-600 text-xl">ទាក់ទងអ្នកដឹក</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleReceived}
            className="flex-1 bg-blue-600 rounded-xl h-12 items-center justify-center"
          >
            <Text className="font-khmerBold text-white text-xl">បានទទួល</Text>
          </TouchableOpacity>
        </View>
      )}

      {order.status === OrderStatus.Completed && (
        <View className="px-5 py-3 bg-white border-t border-gray-100">
          <TouchableOpacity
            onPress={() => {
              // TODO: navigate to invoice screen or open invoice modal
            }}
            className="border border-blue-600 rounded-xl h-12 items-center justify-center"
          >
            <Text className="font-khmerBold text-blue-600 text-xl">មើលវិក័យប័ត្រ</Text>
          </TouchableOpacity>
        </View>
      )}

      <OrderConfirmModal
        visible={confirmModalVisible}
        onConfirm={handleConfirmOrder}
        onCancel={() => setConfirmModalVisible(false)}
      />
    </View>
  );
}