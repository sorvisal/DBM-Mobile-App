import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "./Dropdown";
import { DateField } from "./DateField";
import { api } from "@/services";
import { androidInputStyle } from "@/theme/inputStyles";
import type { Category } from "@/types/api";
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
  imageUrl: string;
};

type StockFormProps = {
  onSubmit: (values: StockFormValues) => void;
  isLoading?: boolean;
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
  imageUrl: "",
};

const PRODUCT_OPTIONS = [
  { label: "Coca-Cola 330ml", value: "coca-cola-330" },
  { label: "Pepsi 330ml", value: "pepsi-330" },
  { label: "Fanta Orange 330ml", value: "fanta-orange-330" },
  { label: "Sprite 330ml", value: "sprite-330" },
  { label: "ទឹកសុទ្ធ 1.5L", value: "water-1.5l" },
];
function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="font-khmerMedium text-xl text-gray-900 mb-1.5">
        {label}{required && " *"}
      </Text>
      {children}
    </View>
  );
}

export function StockForm({ onSubmit, isLoading }: StockFormProps) {
  const [values, setValues] = useState<StockFormValues>(initialValues);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const didUpload = useRef(false);

  useEffect(() => {
    api.categories
      .list()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoadingCategories(false));
  }, []);

  const update = (key: keyof StockFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!values.category) {
      Alert.alert("ប្រភេទ", "សូមជ្រើសរើសប្រភេទផលិតផល");
      return;
    }
    onSubmit(values);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setImagePreview(asset.uri);
    setUploading(true);
    try {
      const fileName = asset.uri.split("/").pop() ?? `image_${Date.now()}.jpg`;
      const res = await api.products.uploadImage({
        uri: asset.uri,
        name: fileName,
        type: asset.mimeType ?? "image/jpeg",
      });
      if (res?.url) {
        setValues((prev) => ({ ...prev, imageUrl: res.url }));
        didUpload.current = true;
      }
    } catch {
      // Upload failed: keep the local preview but do NOT persist the session-local
      // blob URI (it becomes a dead URL once the page reloads).
      Alert.alert("រូបភាព", "បរាជ័យក្នុងការ Upload រូបភាព");
    } finally {
      setUploading(false);
    }
  };

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
      <FormField label="ប្រភេទ" required>
        <Dropdown
          placeholder={loadingCategories ? "ជ្រើសរើសប្រភេទ" : "ជ្រើសរើសប្រភេទ"}
          options={categories.map((c) => ({ label: c.name, value: c.id }))}
          value={values.category || null}
          onChange={(v) => update("category", v)}
        />
      </FormField>

      <FormField label="ចំនួន" required>
        <View className="flex-row items-center">
          <TextInput
            value={values.quantity}
            onChangeText={(v) => update("quantity", v)}
            keyboardType="numeric"
            placeholder="បញ្ចូលចំនួន"
            placeholderTextColor="#D1D5DB"
            className="font-khmer border border-gray-200 rounded-xl px-3 h-11 flex-1 text-lg text-gray-800"
            style={androidInputStyle}
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
              className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
              style={androidInputStyle}
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
              className="font-khmer border border-gray-200 rounded-xl px-3 h-11 text-lg text-gray-800"
              style={androidInputStyle}
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
            className="font-khmer border border-gray-200 rounded-xl px-3 py-2.5 text-lg text-gray-800 h-20"
          style={{ ...androidInputStyle, textAlignVertical: "top" }}
        />
      </FormField>

      <FormField label="រូបភាពផលិតផល">
        <TouchableOpacity
          onPress={pickImage}
          disabled={uploading}
          className="flex-row items-center justify-center border-2 border-dashed border-gray-300 rounded-xl h-28"
        >
          {imagePreview ? (
            <Image source={{ uri: imagePreview }} className="w-full h-full rounded-xl" resizeMode="cover" />
          ) : (
            <>
              <Ionicons name={uploading ? "hourglass-outline" : "image-outline"} size={32} color="#9CA3AF" />
              <Text className="font-khmer text-gray-400 text-xl ml-2">
                {uploading ? "កំពុងអបឡូ..." : "ចុចដើម្បីជ្រើសរើសរូបភាព"}
              </Text>
            </>
          )}
        </TouchableOpacity>
        {values.imageUrl && (
          <Text className="font-khmer text-gray-400 text-[12px] mt-1">កំពុង Upload...</Text>
        )}
      </FormField>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading || uploading}
        className={`bg-blue-600 rounded-xl h-12 items-center justify-center mt-2 mb-8 ${
          (isLoading || uploading) ? "opacity-60" : ""
        }`}
      >
        <Text className="font-khmerBold text-white text-2xl">
          {isLoading ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
