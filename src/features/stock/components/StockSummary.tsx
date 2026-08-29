import { View, Text } from "react-native";
import type { Product } from "@/types/api";
import { formatCurrency } from "@/utils/formatCurrency";

type StockSummaryProps = {
  product: Product | null;
  quantity: string;
  sellPrice: string;
};

export function StockSummary({
  product,
  quantity,
  sellPrice,
}: StockSummaryProps) {
  if (!product || (!quantity && !sellPrice)) return null;

  const qty = Number(quantity) || 0;
  const price = Number(sellPrice) || 0;

  return (
    <View className="bg-white rounded-xl p-4 mb-4  border border-gray-200">
      <Text className="font-khmerBold text-green-700 text-xl mb-2">
        សង្ខេបស្តុក
      </Text>

      <View className="border-t border-green-100 mb-2" />

      <View className="flex-row justify-between py-1">
        <Text className="font-khmer text-gray-500 text-xl" style={{ flexShrink: 0 }}>
          ផលិតផល
        </Text>
        <Text
          className="font-khmerMedium text-gray-900 text-xl text-right"
          numberOfLines={1}
          style={{ flex: 1, marginLeft: 12 }}
        >
          {product.name}
        </Text>
      </View>

      {qty > 0 && (
        <View className="flex-row justify-between py-1">
          <Text className="font-khmer text-gray-500 text-xl">
            ចំនួន
          </Text>
          <Text className="font-khmerMedium text-green-600 text-xl" maxFontSizeMultiplier={1.3}>
            +{qty}
          </Text>
        </View>
      )}

      {price > 0 && (
        <View className="flex-row justify-between py-1">
          <Text className="font-khmer text-gray-500 text-xl" style={{ flexShrink: 0 }}>
            តម្លៃលក់
          </Text>
          <Text className="font-khmerMedium text-gray-900 text-xl text-right" maxFontSizeMultiplier={1.3}>
            {formatCurrency(price)}
          </Text>
        </View>
      )}

      {product.costPrice > 0 && (
        <View className="flex-row justify-between py-1">
          <Text className="font-khmer text-gray-500 text-xl" style={{ flexShrink: 0 }}>
            តម្លៃទិញចូល
          </Text>
          <Text className="font-khmerMedium text-gray-400 text-xl text-right" maxFontSizeMultiplier={1.3}>
            {formatCurrency(product.costPrice)}
          </Text>
        </View>
      )}
    </View>
  );
}
