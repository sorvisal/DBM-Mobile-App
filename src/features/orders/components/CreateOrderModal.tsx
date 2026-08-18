import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DateField } from "../../stock/components/DateField";
import { Dropdown } from "../../stock/components/Dropdown";
import { useStockList } from "../../stock/hooks/useStockList"; // ← confirm this path
import { AddressAutocomplete, type AddressResult } from "@/components/AddressAutocomplete";

export type CreateOrderValues = {
  code: string;
  customerName: string;
  date: Date | null;
  productId: string;
  item: string;
  price: string;
  quantity: string;
  address: string;
};

const generateCode = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `ORD-${yy}${mm}${dd}-${seq}`;
};

const initialValues: CreateOrderValues = {
  code: "",
  customerName: "",
  date: null,
  productId: "",
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

const androidInputStyle = {
  paddingVertical: 0,
  includeFontPadding: false,
  textAlignVertical: "center" as const,
};

export function CreateOrderModal({ visible, onClose, onSubmit }: CreateOrderModalProps) {
  const [values, setValues] = useState<CreateOrderValues>(initialValues);
  const { data: products, isLoading: productsLoading } = useStockList();

  const productOptions = (products ?? []).map((p) => ({
    label: `${p.name} — $${p.sellPrice.toFixed(2)}`,
    value: p.id,
  }));

  const update = (key: keyof CreateOrderValues, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (visible) {
      setValues((prev) => ({ ...prev, code: generateCode() }));
    }
  }, [visible]);

  const handleSelectProduct = (productId: string) => {
    const product = (products ?? []).find((p) => p.id === productId);
    if (!product) return;
    setValues((prev) => ({
      ...prev,
      productId: product.id,
      item: product.name,
      price: String(product.sellPrice),
    }));
  };

  const handleSubmit = () => {
    onSubmit({ ...values, code: values.code || generateCode() });
    setValues({ ...initialValues, code: generateCode() });
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
            <FormField label="លេខកូដ">
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
                value={values.customerName}
                onChangeText={(v) => update("customerName", v)}
                placeholder="បញ្ចូលឈ្មោះអតិថិជន"
                placeholderTextColor="#D1D5DB"
                className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
                style={androidInputStyle}
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
            <Dropdown
              placeholder={productsLoading ? "កំពុងផ្ទុកទំនិញ..." : "ជ្រើសរើសទំនិញ"}
              options={productOptions}
              value={values.productId || null}
              onChange={handleSelectProduct}
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
                    className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
                    style={androidInputStyle}
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
                    className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
                    style={androidInputStyle}
                  />
                </FormField>
              </View>
            </View>

            <FormField label="អាសយដ្ឋាន">
              <AddressAutocomplete
                value={values.address}
                onChange={(v) => update("address", v)}
                onSelect={(place: AddressResult) => {
                  setValues((prev) => ({
                    ...prev,
                    address: place.displayName,
                  }));
                }}
                placeholder="បញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន"
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