import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "../../stock/components/Dropdown";
import { Customer, CustomerStatus } from "../types/customer.types";

export type EditCustomerValues = {
  name: string;
  phone: string;
  address: string;
  category: string;
  description: string;
  status: CustomerStatus;
};

const CATEGORY_OPTIONS = [
  { label: "អតិថិជនថ្មី", value: "អតិថិជនថ្មី" },
  { label: "អតិថិជនប្រចាំ", value: "អតិថិជនប្រចាំ" },
  { label: "អតិថិជនធំ", value: "អតិថិជនធំ" },
];

const STATUS_OPTIONS = [
  { label: "សកម្ម", value: CustomerStatus.Active },
  { label: "មិនសកម្ម", value: CustomerStatus.Inactive },
];

type EditCustomerModalProps = {
  visible: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (values: EditCustomerValues) => void;
};

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="font-khmerMedium text-xl text-gray-900 mb-1.5">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      {children}
    </View>
  );
}

export function EditCustomerModal({ visible, customer, onClose, onSubmit }: EditCustomerModalProps) {
  const [values, setValues] = useState<EditCustomerValues>({
    name: "",
    phone: "",
    address: "",
    category: "",
    description: "",
    status: CustomerStatus.Active,
  });

  // Pre-fill form whenever a new customer is opened for editing
  useEffect(() => {
    if (customer) {
      setValues({
        name: customer.name,
        phone: customer.phone,
        address: customer.location,
        category: customer.customerType,
        description: customer.note === "-" ? "" : customer.note,
        status: customer.status,
      });
    }
  }, [customer]);

  const update = (key: keyof EditCustomerValues, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    onSubmit(values);
  };

  if (!customer) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[85%]">
          <View className="flex-row items-center justify-between px-5 pt-4 pb-3 bg-blue-600 rounded-t-xl border-gray-100">
            <Text className="font-khmerBold text-white text-xl">កែប្រែព័ត៌មានអតិថិជន</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-5 pt-4" showsVerticalScrollIndicator={false}>
            <FormField label="លេខកូដអតិថិជន">
              <View className="border border-gray-100 bg-gray-50 rounded-xl px-3 h-11 justify-center">
                <Text className="font-khmer text-gray-400 text-xl">{customer.code}</Text>
              </View>
            </FormField>

            <FormField label="ឈ្មោះអតិថិជន" required>
              <TextInput
                value={values.name}
                onChangeText={(v) => update("name", v)}
                placeholder="បញ្ចូលឈ្មោះអតិថិជន"
                placeholderTextColor="#D1D5DB"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-xl text-gray-800"
                style={{ outlineWidth: 0 }}
              />
            </FormField>

            <FormField label="លេខទូរស័ព្ទ" required>
              <TextInput
                value={values.phone}
                onChangeText={(v) => update("phone", v)}
                keyboardType="phone-pad"
                placeholder="012 345 678"
                placeholderTextColor="#D1D5DB"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-xl text-gray-800"
                style={{ outlineWidth: 0 }}
              />
            </FormField>

            <FormField label="អាសយដ្ឋាន">
              <TextInput
                value={values.address}
                onChangeText={(v) => update("address", v)}
                placeholder="ភ្នំពេញ, ខណ្ឌចំការមន"
                placeholderTextColor="#D1D5DB"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-xl text-gray-800"
                style={{ outlineWidth: 0 }}
              />
            </FormField>

            <FormField label="ប្រភេទអតិថិជន" required>
              <Dropdown
                placeholder="ជ្រើសរើសប្រភេទ"
                options={CATEGORY_OPTIONS}
                value={values.category || null}
                onChange={(v) => update("category", v)}
              />
            </FormField>

            <FormField label="ស្ថានភាព" required>
              <Dropdown
                placeholder="ជ្រើសរើសស្ថានភាព"
                options={STATUS_OPTIONS}
                value={values.status}
                onChange={(v) => update("status", v as CustomerStatus)}
              />
            </FormField>

            <FormField label="ការពិពណ៌នា">
              <TextInput
                value={values.description}
                onChangeText={(v) => update("description", v)}
                placeholder="កំណត់ចំណាំបន្ថែម"
                placeholderTextColor="#D1D5DB"
                multiline
                className="font-khmer border border-gray-200 rounded-xl px-3 py-2.5 text-xl text-gray-800 h-20"
                style={{ textAlignVertical: "top", outlineWidth: 0 }}
              />
            </FormField>

            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-blue-600 rounded-xl h-12 items-center justify-center mt-2 mb-8"
            >
              <Text className="font-khmerBold text-white text-xl">រក្សាទុក</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}