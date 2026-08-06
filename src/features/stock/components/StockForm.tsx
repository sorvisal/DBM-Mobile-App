import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "./Dropdown";
import { DateField } from "./DateField";
type StockFormValues = {
  productName: string;
  brand: string;
  category: string;
  supplier: string;
  quantity: string;
  buyPrice: string;
  sellPrice: string;
  importDate: Date | null;
  expiryDate: Date | null;
  note: string;
};

type StockFormProps = {
  onSubmit: (values: StockFormValues) => void;
};

const initialValues: StockFormValues = {
  productName: "",
  brand: "",
  category: "",
  supplier: "",
  quantity: "",
  buyPrice: "",
  sellPrice: "",
  importDate: null,
  expiryDate: null,
  note: "",
};

const PRODUCT_OPTIONS = [
  { label: "Coca-Cola 330ml", value: "coca-cola-330" },
  { label: "Pepsi 330ml", value: "pepsi-330" },
  { label: "Fanta Orange 330ml", value: "fanta-orange-330" },
  { label: "Sprite 330ml", value: "sprite-330" },
  { label: "ទឹកសុទ្ធ 1.5L", value: "water-1.5l" },
];

const BRAND_OPTIONS = [
  { label: "Coca-Cola", value: "coca-cola" },
  { label: "PepsiCo", value: "pepsico" },
  { label: "ផ្សេងៗ", value: "other" },
];

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="font-khmerMedium text-sm text-gray-900 mb-1.5">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      {children}
    </View>
  );
}

export function StockForm({ onSubmit }: StockFormProps) {
  const [values, setValues] = useState<StockFormValues>(initialValues);

  const update = (key: keyof StockFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <ScrollView className="flex-1 bg-white px-5 pt-4" showsVerticalScrollIndicator={false}>
      <FormField label="ឈ្មោះផលិតផល" required> 
        <Dropdown
          placeholder="ជ្រើសរើសផលិតផល"
          options={PRODUCT_OPTIONS}
          value={values.productName || null}
          onChange={(v) => update("productName", v)}
        />
      </FormField>

      <FormField label="ម៉ាក">
        <Dropdown
          placeholder="ជ្រើសរើសម៉ាក"
          options={BRAND_OPTIONS}
          value={values.brand || null}
          onChange={(v) => update("brand", v)}
        />
      </FormField>

      <FormField label="ចំនួន" required>
        <View className="flex-row items-center ">
          <TextInput
            value={values.quantity}
            onChangeText={(v) => update("quantity", v)}
            keyboardType="numeric"
            placeholder="បញ្ចូលចំនួន"
            placeholderTextColor="#D1D5DB"
            className="font-khmer border border-gray-200 rounded-xl  px-3 h-11 flex-1 text-sm text-gray-800"
          />
        </View>
      </FormField>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField label="តម្លៃទិញចូល ($)" required>
            <TextInput
              value={values.buyPrice}
              onChangeText={(v) => update("buyPrice", v)}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#D1D5DB"
              className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-sm text-gray-800"
            />
          </FormField>
        </View>
        <View className="flex-1">
          <FormField label="តម្លៃលក់ ($)" required>
            <TextInput
              value={values.sellPrice}
              onChangeText={(v) => update("sellPrice", v)}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#D1D5DB"
              className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-sm text-gray-800"
            />
          </FormField>
        </View>
      </View>

     <FormField label="កាលបរិច្ឆេទចូល">
        <DateField
          placeholder="ជ្រើសរើសកាលបរិច្ឆេទ"
          value={values.importDate}
          onChange={(date) => setValues((prev) => ({ ...prev, importDate: date }))}
        />
      </FormField>

      <FormField label="កាលបរិច្ឆេទផុតកំណត់">
        <DateField
          placeholder="ជ្រើសរើសកាលបរិច្ឆេទ"
          value={values.expiryDate}
          onChange={(date) => setValues((prev) => ({ ...prev, expiryDate: date }))}
        />
      </FormField>

      <FormField label="កំណត់ចំណាំ">
        <TextInput
          value={values.note}
          onChangeText={(v) => update("note", v)}
          placeholder="បញ្ចូលកំណត់ចំណាំ"
          placeholderTextColor="#D1D5DB"
          multiline
          className="font-khmer border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 h-20"
          style={{ textAlignVertical: "top" }}
        />
      </FormField>

      <TouchableOpacity
        onPress={() => onSubmit(values)}
        className="bg-blue-600 rounded-xl h-12 items-center justify-center mt-2 mb-8"
      >
        <Text className="font-khmerBold text-white text-sm">រក្សាទុក</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}