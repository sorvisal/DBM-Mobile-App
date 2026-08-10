import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DateField } from "../../stock/components/DateField";

export type CreateOrderValues = {
  code: string;
  customerName: string;
  date: Date | null;
  item: string;
  price: string;
  quantity: string;
  address: string;
};

const initialValues: CreateOrderValues = {
  code: "",
  customerName: "",
  date: null,
  item: "",
  price: "",
  quantity: "",
  address: "",
};

type CreateOrderModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: CreateOrderValues) => void;
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

export function CreateOrderModal({ visible, onClose, onSubmit }: CreateOrderModalProps) {
  const [values, setValues] = useState<CreateOrderValues>(initialValues);

  const update = (key: keyof CreateOrderValues, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    onSubmit(values);
    setValues(initialValues);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[85%] shadow-slate-50">
          <View className="flex-row bg-blue-600 items-center justify-between px-5 pt-4 pb-3 rounded-t-xl">
            <Text className="font-khmerBold text-white text-xl">បង្កើតការបញ្ជាទិញថ្មី</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-5 pt-3" showsVerticalScrollIndicator={false}>
            <FormField label="លេខកូដ" required>
              <TextInput
                value={values.code}
                onChangeText={(v) => update("code", v)}
                placeholder="ORD-250525-006"
                placeholderTextColor="#D1D5DB"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-xl text-gray-800"
                style={{ outlineWidth: 0 }}
              />
            </FormField>

            <FormField label="ឈ្មោះអតិថិជន" required>
              <TextInput
                value={values.customerName}
                onChangeText={(v) => update("customerName", v)}
                placeholder="បញ្ចូលឈ្មោះអតិថិជន"
                placeholderTextColor="#D1D5DB"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-xl text-gray-800"
                style={{ outlineWidth: 0 }}
              />
            </FormField>

            <FormField label="កាលបរិច្ឆេទ" required>
              <DateField
                placeholder="ជ្រើសរើសកាលបរិច្ឆេទ"
                value={values.date}
                onChange={(date) => setValues((prev) => ({ ...prev, date }))}
              />
            </FormField>

            <FormField label="ទំនិញ" required>
              <TextInput
                value={values.item}
                onChangeText={(v) => update("item", v)}
                placeholder="ឈ្មោះទំនិញ"
                placeholderTextColor="#D1D5DB"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-xl text-gray-800"
                style={{ outlineWidth: 0 }}
              />
            </FormField>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormField label="តម្លៃ ($)" required>
                  <TextInput
                    value={values.price}
                    onChangeText={(v) => update("price", v)}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#D1D5DB"
                    className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-xl text-gray-800"
                    style={{ outlineWidth: 0 }}
                  />
                </FormField>
              </View>
              <View className="flex-1">
                <FormField label="ចំនួន" required>
                  <TextInput
                    value={values.quantity}
                    onChangeText={(v) => update("quantity", v)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#D1D5DB"
                    className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-xl text-gray-800"
                    style={{ outlineWidth: 0 }}
                  />
                </FormField>
              </View>
            </View>

            <FormField label="អាសយដ្ឋាន">
              <TextInput
                value={values.address}
                onChangeText={(v) => update("address", v)}
                placeholder="បញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន"
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