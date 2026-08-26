import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StockTabBar } from "../components/StockTabBar";
import { ProductCard } from "../components/ProductCard";
import type { StockTabKey } from "./StockScreen";
import { useExpiringStock, type ExpiringProduct } from "../hooks/useExpiringStock";
import { formatDate } from "@/utils/formatDate";

type LowStockScreenProps = {
  onNavigate: (tab: StockTabKey) => void;
};

export function LowStockScreen({ onNavigate }: LowStockScreenProps) {
  const { data, isLoading } = useExpiringStock();

  const critical = data.filter((p) => p.expiryBucket === "critical");
  const warning = data.filter((p) => p.expiryBucket === "warning");
  const safe = data.filter((p) => p.expiryBucket === "safe");

  const summary = [
    { label: "ដល់ថ្ងៃ 7 ថ្ងៃ", count: critical.length, unit: "មុខទំនិញ", bg: "bg-red-50", text: "text-red-600" },
    { label: "ដល់ថ្ងៃ 15 ថ្ងៃ", count: warning.length, unit: "មុខទំនិញ", bg: "bg-orange-50", text: "text-orange-600" },
    { label: "លើសពី 15 ថ្ងៃ", count: safe.length, unit: "មុខទំនិញ", bg: "bg-green-50", text: "text-green-600" },
  ] as const;

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      <StockTabBar active="expiry" onChange={onNavigate} />

      <View className="flex-row gap-2 px-5 pt-3 pb-2">
        {summary.map((item) => (
          <View key={item.label} className={`${item.bg} flex-1 rounded-xl p-2.5 items-center`}>
            <Text className={`font-khmerBold text-2xl ${item.text}`}>{item.label}</Text>
            <Text className={`font-khmerBold text-xl mt-1 ${item.text}`}>
              {item.count} {item.unit}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="font-khmer text-gray-400 text-xl mt-3">កំពុងផ្ទុក...</Text>
          </View>
        ) : data.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="cube-outline" size={36} color="#D1D5DB" />
            <Text className="font-khmer text-gray-400 text-xl mt-2">មិនមានផលិតផលផុតកំណត់</Text>
          </View>
        ) : (
          data.map((product: ExpiringProduct) => (
            <ProductCard
              key={product.id}
              imageUrl={product.imageUrl ?? ""}
              name={product.name}
              unit={product.category ?? ""}
              price={`${product.sellPrice}`}
              quantity={product.quantity}
              expiryDate={product.expiresAt ? formatDate(product.expiresAt) : undefined}
              daysLeft={product.daysUntilExpiry}
              isLowStock={false}
              onPress={() => {}}
            />
          ))
        )}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}