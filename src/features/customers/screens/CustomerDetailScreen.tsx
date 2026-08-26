import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCustomerDetail } from "../hooks/useCustomerDetail";
import { deleteCustomer, updateCustomer } from "../hooks/useCustomerList";
import { CustomerInfoCard } from "../components/CustomerInfoCard";
import { CustomerSpendingCard } from "../components/CustomerSpendingCard";
import { CustomerActionButtons } from "../components/CustomerActionButtons";
import { EditCustomerModal, EditCustomerValues } from "../components/EditCustomerModal";
import { CustomerStatus } from "../types/customer.types";
import { DetailLayout } from "../../../layouts/DetailLayout"; // adjust relative path as needed

type CustomerDetailScreenProps = {
  customerId: string;
  onBack: () => void;
  onViewHistory: (customerId: string) => void;
};

export function CustomerDetailScreen({ customerId, onBack, onViewHistory }: CustomerDetailScreenProps) {
  const { customer, isLoading, error, refresh } = useCustomerDetail(customerId);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const menuButton = (
    <TouchableOpacity onPress={() => setMenuVisible(true)} accessibilityRole="button" accessibilityLabel="Options">
      <Ionicons name="ellipsis-horizontal" size={22} color="#1F2937" />
    </TouchableOpacity>
  );

  if (!isLoading && !customer) {
    return (
      <DetailLayout title="ព័ត៌មានអតិថិជន" onBack={onBack}>
        <View className="flex-1 items-center justify-center px-6 bg-gray-50">
          <Ionicons name="alert-circle-outline" size={34} color="#D1D5DB" />
          <Text className="font-khmer text-gray-400 text-sm mt-2 text-center">
            {error ?? "រកមិនឃើញអតិថិជន"}
          </Text>
        </View>
      </DetailLayout>
    );
  }

  const handleSaveEdit = async (values: EditCustomerValues) => {
    if (!customer) return;
    try {
      await updateCustomer(customer.id, {
        name: values.name,
        phone: values.phone,
        address: values.address,
        status: values.status === CustomerStatus.Active ? "active" : "inactive",
        description: values.description,
      });
      setEditModalVisible(false);
      refresh(); // Refresh customer details after successful update
    } catch (err) {
      console.error("Failed to update customer:", err);
    }
  };

  return (
    <DetailLayout title="ព័ត៌មានអតិថិជន" onBack={onBack} rightAction={menuButton}>
      {customer && (
        <ScrollView className="flex-1 bg-gray-50 px-5 pt-4" showsVerticalScrollIndicator={false}>
          <CustomerInfoCard customer={customer} />
          <CustomerSpendingCard
            customer={customer}
            onViewHistory={onViewHistory}
          />
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

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable className="flex-1" onPress={() => setMenuVisible(false)}>
          <View
            className="absolute top-14 right-5 bg-white rounded-2xl overflow-hidden border border-gray-100"
            style={{ minWidth: 220, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, elevation: 5 }}
          >
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                if (customer) onViewHistory(customer.id);
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

      {isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-white" style={{ zIndex: 50 }}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="font-khmer text-gray-400 text-sm mt-3">កំពុងផ្ទុក...</Text>
        </View>
      )}
    </DetailLayout>
  );
}