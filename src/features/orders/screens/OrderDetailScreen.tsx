import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Linking } from "react-native";
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
  const { order } = useOrderDetail(orderId);
  const { updateOrderStatus } = useUpdateOrderStatus();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  if (!order) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center" style={{ minHeight: 0 }}>
        <Text className="font-khmer text-gray-400 text-sm">រកមិនឃើញការបញ្ជាទិញ</Text>
      </View>
    );
  }

  const handleConfirmOrder = () => {
    updateOrderStatus(order.id, OrderStatus.Shipping, {
      confirmedAt: new Date().toLocaleString(),
    });
    setConfirmModalVisible(false);
  };

  const handleReceived = () => {
    updateOrderStatus(order.id, OrderStatus.Completed, {
      deliveredAt: new Date().toLocaleString(),
    });
  };

  const callNumber = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone.replace(/\s/g, "")}`);
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Top navbar */}
      <View className="bg-white px-5 pt-3 pb-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="font-khmerBold text-gray-900 text-base">{order.code}</Text>
        <OrderStatusBadge status={order.status} />
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* Customer info */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <View className="flex-row items-center">
            <View className="w-11 h-11 rounded-full bg-blue-50 items-center justify-center">
              <Ionicons name="person-outline" size={20} color="#2563EB" />
            </View>
            <View className="ml-3">
              <Text className="font-khmerMedium text-gray-900 text-sm">{order.customer.name}</Text>
              <Text className="font-khmer text-gray-400 text-[11px] mt-0.5">{order.customer.phone}</Text>
              <Text className="font-khmer text-gray-400 text-[11px] mt-0.5">{order.createdAt}</Text>
            </View>
          </View>
        </View>

        {/* Stepper */}
        {order.status !== OrderStatus.Pending && (
          <View className="bg-white rounded-2xl p-4 mb-3">
            <OrderStepper status={order.status} />
          </View>
        )}

        {/* Delivery info */}
        {order.delivery && (
          <View className="bg-white rounded-2xl p-4 mb-3">
            <Text className="font-khmerBold text-gray-900 text-sm mb-3">ព័ត៌មានការដឹកជញ្ជូន</Text>

            {order.delivery.driverName && (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xs">អ្នកដឹក</Text>
                <Text className="font-khmer text-gray-800 text-xs">{order.delivery.driverName}</Text>
              </View>
            )}
            {order.delivery.driverPhone && (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xs">លេខទូរស័ព្ទ</Text>
                <Text className="font-khmer text-gray-800 text-xs">{order.delivery.driverPhone}</Text>
              </View>
            )}
            {order.delivery.vehiclePlate && (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xs">ស្លាកលេខរថយន្ត</Text>
                <Text className="font-khmer text-gray-800 text-xs">{order.delivery.vehiclePlate}</Text>
              </View>
            )}
            {order.delivery.confirmedAt && (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xs">ម៉ោងបញ្ជាក់</Text>
                <Text className="font-khmer text-gray-800 text-xs">{order.delivery.confirmedAt}</Text>
              </View>
            )}
            {order.delivery.deliveredAt && (
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-khmer text-gray-400 text-xs">ម៉ោងទទួល</Text>
                <Text className="font-khmer text-green-600 text-xs">{order.delivery.deliveredAt}</Text>
              </View>
            )}
          </View>
        )}

        {/* Items */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="font-khmerBold text-gray-900 text-sm mb-1">
            ទំនិញ ({order.items.length} មុខ)
          </Text>
          {order.items.map((item) => (
            <OrderItemRow key={item.id} item={item} />
          ))}
          <OrderSummary subtotal={order.subtotal} deliveryFee={order.deliveryFee} total={order.total} />
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Action buttons */}
      <View className="px-5 py-3 bg-white border-t border-gray-100 flex-row gap-3">
        {order.status === OrderStatus.Pending && (
          <>
            <TouchableOpacity className="flex-1 border border-red-500 rounded-xl h-12 items-center justify-center">
              <Text className="font-khmerBold text-red-500 text-sm">លុបចោល</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setConfirmModalVisible(true)}
              className="flex-1 bg-blue-600 rounded-xl h-12 items-center justify-center"
            >
              <Text className="font-khmerBold text-white text-sm">បញ្ជាក់ការទិញ</Text>
            </TouchableOpacity>
          </>
        )}

        {order.status === OrderStatus.Shipping && (
          <>
            <TouchableOpacity
              onPress={() => callNumber(order.delivery?.driverPhone)}
              className="flex-1 border border-blue-600 rounded-xl h-12 items-center justify-center flex-row gap-1.5"
            >
              <Ionicons name="call-outline" size={16} color="#2563EB" />
              <Text className="font-khmerBold text-blue-600 text-sm">ទាក់ទងអ្នកដឹក</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReceived}
              className="flex-1 bg-blue-600 rounded-xl h-12 items-center justify-center"
            >
              <Text className="font-khmerBold text-white text-sm">បានទទួល</Text>
            </TouchableOpacity>
          </>
        )}

        {order.status === OrderStatus.Completed && (
          <TouchableOpacity className="flex-1 border border-gray-200 rounded-xl h-12 items-center justify-center">
            <Text className="font-khmerBold text-gray-700 text-sm">មើលវិក្កយបត្រ</Text>
          </TouchableOpacity>
        )}

        {order.status === OrderStatus.Confirmed && (
          <TouchableOpacity
            onPress={() => updateOrderStatus(order.id, OrderStatus.Shipping)}
            className="flex-1 bg-blue-600 rounded-xl h-12 items-center justify-center"
          >
            <Text className="font-khmerBold text-white text-sm">ចាប់ផ្តើមដឹកជញ្ជូន</Text>
          </TouchableOpacity>
        )}
      </View>

      <OrderConfirmModal
        visible={confirmModalVisible}
        onConfirm={handleConfirmOrder}
        onCancel={() => setConfirmModalVisible(false)}
      />
    </View>
  );
}
