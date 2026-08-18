import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCustomerDetail } from "../hooks/useCustomerDetail";
import { deleteCustomer, updateCustomer } from "../hooks/useCustomerList";
import { CustomerInfoCard } from "../components/CustomerInfoCard";
import { CustomerSpendingCard } from "../components/CustomerSpendingCard";
import { CustomerActionButtons } from "../components/CustomerActionButtons";
import { EditCustomerModal, EditCustomerValues } from "../components/EditCustomerModal";

type CustomerDetailScreenProps = {
  customerId: string;
  onBack: () => void;
  onViewHistory: (customerId: string) => void;
};

export function CustomerDetailScreen({ customerId, onBack, onViewHistory }: CustomerDetailScreenProps) {
  const { customer, isLoading } = useCustomerDetail(customerId);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Only show "not found" once loading has finished and there's really no customer
  if (!isLoading && !customer) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center" style={{ minHeight: 0 }}>
        <Text className="font-khmer text-gray-400 text-sm">រកមិនឃើញអតិថិជន</Text>
      </View>
    );
  }

  const handleSaveEdit = (values: EditCustomerValues) => {
    if (!customer) return;
    updateCustomer(customer.id, {
      name: values.name,
      phone: values.phone,
      address: values.address,
      status: values.status,
    });
    setEditModalVisible(false);
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Header */}
      <View className="bg-white px-5 pt-3 pb-3 flex-row items-center justify-between relative border-b border-gray-100">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View className="absolute left-0 right-0 items-center justify-center pointer-events-none">
          <Text className="font-khmerBold text-gray-900 text-3xl">ព័ត៌មានអតិថិជន</Text>
        </View>

        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {customer && (
        <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
          <CustomerInfoCard customer={customer} />
          <CustomerSpendingCard customer={customer} />
          <CustomerActionButtons
            customer={customer}
            onEdit={() => setEditModalVisible(true)}
            onDelete={() => {
              deleteCustomer(customer.id);
              onBack();
            }}
          />
          <View className="h-6" />
        </ScrollView>
      )}

      {/* Dropdown menu triggered by "..." */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable className="flex-1" onPress={() => setMenuVisible(false)}>
          <View className="absolute top-14 right-5 bg-white rounded-2xl overflow-hidden" style={{ minWidth: 220, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 }}>
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                onViewHistory(customer!.id);
              }}
              className="flex-row items-center px-4 py-3"
            >
              <Ionicons name="time-outline" size={18} color="#2563EB" />
              <Text className="font-khmer text-gray-800 text-xl ml-2.5">ប្រវត្តិការបញ្ជាទិញ</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {customer && (
        <EditCustomerModal
          visible={editModalVisible}
          customer={customer}
          onClose={() => setEditModalVisible(false)}
          onSubmit={handleSaveEdit}
        />
      )}

      {/* Loading overlay — sits on top of the screen while the request is in flight */}
      {isLoading && (
        <View
          className="absolute inset-0 items-center justify-center bg-white"
          style={{ zIndex: 50 }}
        >
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="font-khmer text-gray-400 text-sm mt-3">កំពុងផ្ទុក...</Text>
        </View>
      )}
    </View>
  );
}