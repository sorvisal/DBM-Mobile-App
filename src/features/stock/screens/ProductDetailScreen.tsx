import { View, Text, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { DetailLayout } from "../../../layouts/DetailLayout";
import { LoadingState, ErrorState } from "@/components/states";
import { useProductDetail } from "../hooks/useProductDetail";

type ProductDetailScreenProps = {
  productId: string;
  onBack: () => void;
};

function money(value: number): string {
  return `$${Number(value || 0).toFixed(2)}`;
}

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueClassName?: string;
};

function InfoRow({ icon, label, value, valueClassName }: InfoRowProps) {
  return (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      <View className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center">
        <Ionicons name={icon} size={18} color="#6B7280" />
      </View>
      <Text className="font-khmer text-gray-500 text-lg ml-3 flex-1">
        {label}
      </Text>
      <Text
        className={`font-khmerBold text-lg text-gray-900 ${valueClassName ?? ""}`}
      >
        {value}
      </Text>
    </View>
  );
}

export function ProductDetailScreen({
  productId,
  onBack,
}: ProductDetailScreenProps) {
  const { product, isLoading, error, refetch } = useProductDetail(productId);

  if (isLoading && !product) {
    return (
      <DetailLayout title="ព័ត៌មានផលិតផល" onBack={onBack}>
        <LoadingState compact text="កំពុងផ្ទុកព័ត៌មានផលិតផល..." />
      </DetailLayout>
    );
  }

  if (error && !product) {
    return (
      <DetailLayout title="ព័ត៌មានផលិតផល" onBack={onBack}>
        <ErrorState compact onRetry={() => refetch(productId)} />
      </DetailLayout>
    );
  }

  if (!product) {
    return (
      <DetailLayout title="ព័ត៌មានផលិតផល" onBack={onBack}>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cube-outline" size={34} color="#D1D5DB" />
          <Text className="font-khmer text-gray-400 text-sm mt-2 text-center">
            រកមិនឃើញផលិតផល
          </Text>
        </View>
      </DetailLayout>
    );
  }

  const lowStock = product.stock <= product.lowStockThreshold;
  const hasImage =
    !!product.imageUrl && !/^(blob|data):/i.test(product.imageUrl);

  return (
    <DetailLayout title="ព័ត៌មានផលិតផល" onBack={onBack}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          {hasImage ? (
            <Image
              source={{ uri: product.imageUrl }}
              resizeMode="cover"
              className="w-32 h-32 rounded-2xl"
            />
          ) : (
            <View className="w-32 h-32 rounded-2xl bg-gray-100 items-center justify-center">
              <Ionicons name="image-outline" size={36} color="#D1D5DB" />
            </View>
          )}

          <Text className="font-khmerBold text-gray-900 text-2xl mt-3 text-center">
            {product.name}
          </Text>

          <Text className="font-khmer text-gray-400 text-lg mt-1">
            {product.category}
          </Text>

          <View
            className={`mt-2 px-3 py-1 rounded-full ${
              product.isActive ? "bg-green-50" : "bg-gray-100"
            }`}
          >
            <Text
              className={`font-khmer text-base ${
                product.isActive ? "text-green-600" : "text-gray-500"
              }`}
            >
              {product.isActive ? "កំពុងដំណើរការ" : "បានបិទ"}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl px-4 mt-5">
          <InfoRow
            icon="pricetag-outline"
            label="លេខកូដ (SKU)"
            value={product.sku || "-"}
          />
          <InfoRow
            icon="cash-outline"
            label="តម្លៃទិញ"
            value={money(product.costPrice)}
          />
          <InfoRow
            icon="trending-up-outline"
            label="តម្លៃលក់"
            value={money(product.salePrice)}
            valueClassName="text-blue-600"
          />
          <InfoRow
            icon="cube-outline"
            label="បរិមាណស្តុក"
            value={`${product.stock}${product.unit ? ` ${product.unit}` : ""}`}
            valueClassName={lowStock ? "text-red-600" : "text-gray-900"}
          />
          {product.unit ? (
            <InfoRow
              icon="layers-outline"
              label="ឯកតា"
              value={product.unit}
            />
          ) : null}
          <InfoRow
            icon="alert-circle-outline"
            label="កម្រិតស្តុកទាប"
            value={String(product.lowStockThreshold)}
          />
          {product.expiryDate ? (
            <InfoRow
              icon="calendar-outline"
              label="ថ្ងៃផុតកំណត់"
              value={product.expiryDate.slice(0, 10)}
            />
          ) : null}
        </View>
      </ScrollView>
    </DetailLayout>
  );
}
