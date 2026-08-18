import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DateField } from "../../stock/components/DateField";
import { Dropdown } from "../../stock/components/Dropdown";
import { CustomerStatus } from "../types/customer.types";
import { androidInputStyle } from "@/theme/inputStyles";
import { AddressAutocomplete, type AddressResult } from "@/components/AddressAutocomplete";

const generateCode = () => `CUS-${String(Math.floor(Math.random() * 900) + 100)}`;

export type CreateCustomerValues = {
  code: string;
  name: string;
  phone: string;
  address: string;
  latitude: string;
  longitude: string;
  category: string;
  joinDate: Date | null;
  description: string;
  status: CustomerStatus;
};

const initialValues: CreateCustomerValues = {
  code: "",
  name: "",
  phone: "",
  address: "",
  latitude: "",
  longitude: "",
  category: "",
  joinDate: null,
  description: "",
  status: CustomerStatus.Active,
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

type CreateCustomerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: CreateCustomerValues) => void;
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

export function CreateCustomerModal({ visible, onClose, onSubmit }: CreateCustomerModalProps) {
  const [values, setValues] = useState<CreateCustomerValues>(initialValues);

  const update = (key: keyof CreateCustomerValues, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (visible) {
      setValues((prev) => ({ ...prev, code: generateCode() }));
    }
  }, [visible]);

  const handleSubmit = () => {
    onSubmit({ ...values, code: values.code || generateCode() });
    setValues({ ...initialValues, code: generateCode() });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[85%]">
          <View className="flex-row items-center justify-between px-5 pt-4 pb-3 bg-blue-600 rounded-t-xl border-gray-100">
            <Text className="font-khmerBold text-white text-xl">បង្កើតអតិថិជនថ្មី</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-5 pt-4" showsVerticalScrollIndicator={false}>
            <FormField label="លេខកូដអតិថិជន">
              <TextInput
                value={values.code}
                onChangeText={(v) => update("code", v)}
                placeholderTextColor="#D1D5DB"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
                style={androidInputStyle}
              />
            </FormField>

            <FormField label="ឈ្មោះអតិថិជន" required>
              <TextInput
                value={values.name}
                onChangeText={(v) => update("name", v)}
                placeholder="បញ្ចូលឈ្មោះអតិថិជន"
                placeholderTextColor="#D1D5DB"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
                style={{ outlineWidth: 0, paddingVertical: 0, includeFontPadding: false, textAlignVertical: "center" }}
              />
            </FormField>

            <FormField label="លេខទូរស័ព្ទ" required>
              <TextInput
                value={values.phone}
                onChangeText={(v) => update("phone", v)}
                keyboardType="phone-pad"
                placeholder="012 345 678"
                placeholderTextColor="#D1D5DB"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
                style={{ outlineWidth: 0, paddingVertical: 0, includeFontPadding: false, textAlignVertical: "center" }}
              />
            </FormField>

            <FormField label="អាសយដ្ឋាន">
              <AddressAutocomplete
                value={values.address}
                onChange={(v) => update("address", v)}
                onSelect={(place: AddressResult) => {
                  setValues((prev) => ({
                    ...prev,
                    address: place.displayName,
                    latitude: place.latitude,
                    longitude: place.longitude,
                  }));
                }}
                placeholder="ភ្នំពេញ, ខណ្ឌចំការមន"
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

            <FormField label="ថ្ងៃចុះឈ្មោះជាសមាជិក">
              <DateField
                placeholder="ជ្រើសរើសកាលបរិច្ឆេទ"
                value={values.joinDate}
                onChange={(date) => setValues((prev) => ({ ...prev, joinDate: date }))}
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
                className="font-khmer border border-gray-200 rounded-xl px-3 py-2.5 text-lg text-gray-800 h-20"
                style={{ ...androidInputStyle, textAlignVertical: "top" }}
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