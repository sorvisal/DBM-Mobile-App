import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
import type { Product } from "@/types/api";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

type ProductPreviewProps = {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
};

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start justify-between py-1.5">
      <Text
        className="font-khmer text-gray-600 text-xl"
        maxFontSizeMultiplier={1.3}
        style={{ flexShrink: 0 }}
      >
        {label}
      </Text>
      <Text
        className="font-khmerMedium text-gray-900 text-xl text-right"
        maxFontSizeMultiplier={1.3}
        style={{ flex: 1, marginLeft: 12 }}
      >
        {value}
      </Text>
    </View>
  );
}

export function ProductPreview({
  product,
  isLoading,
  error,
}: ProductPreviewProps) {
  if (isLoading) {
    return (
      <View className="bg-blue-50 rounded-xl p-4 mb-4 items-center">
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />
        <Text className="font-khmer text-gray-500 text-sm mt-2">
          កំពុងផ្ទុកព័ត៌មានផលិតផល...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-red-50 rounded-xl p-4 mb-4">
        <View className="flex-row items-center">
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color="#EF4444"
          />
          <Text className="font-khmer text-red-600 text-lg ml-2">
            {error}
          </Text>
        </View>
      </View>
    );
  }

  if (!product) return null;

  return (
    <View className="bg-white rounded-xl p-4 mb-4  border border-gray-200">
     {/* Centered wrapper */}
<View className="items-center">
  {/* Product Image */}
  {product.imageUrl ? (
    <Image
      source={{ uri: product.imageUrl }}
      className="w-40 h-40 rounded-xl mb-3"
      resizeMode="cover"
    />
  ) : (
    <View className="w-40 h-40 rounded-xl mb-3 bg-gray-200 items-center justify-center">
      <Ionicons
        name="image-outline"
        size={48}
        color="#9CA3AF"
      />
      <Text className="font-khmer text-gray-400 text-sm mt-1">
        មិនមានរូបភាព
      </Text>
    </View>
  )}

  {/* Product Name */}
  <Text className="font-khmerBold text-blue-700 text-2xl mb-1 text-center" maxFontSizeMultiplier={1.3}>
    {product.name}
  </Text>

  {/* SKU */}
  <Text className="font-khmer text-gray-500 text-base mb-3 text-center">
   លេខកូដ: {product.sku}
  </Text>
</View>

      {/* Divider */}
      <View className="border-t border-blue-100 mb-2" />

      {/* Info Rows */}
      <InfoRow
        label="ប្រភេទ"
        value={product.category}
      />
      <InfoRow
        label="តម្លៃទិញចូល"
        value={formatCurrency(product.costPrice)}
      />
      <InfoRow
        label="កាលបរិច្ឆេទផលិត"
        value={formatDate(product.createdAt)}
      />
      {product.expiryDate && (
        <InfoRow
          label="កាលបរិច្ឆេទផុតកំណត់"
          value={formatDate(product.expiryDate)}
        />
      )}
    </View>
  );
}
