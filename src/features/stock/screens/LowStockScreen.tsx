import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StockTabBar } from "../components/StockTabBar";
import { ProductCard } from "../components/ProductCard";
import type { StockTabKey } from "./StockScreen";
import { useExpiringStock, type ExpiringProduct } from "../hooks/useExpiringStock";
import { formatDate } from "@/utils/formatDate";

type FilterKey = "all" | "critical" | "warning" | "safe";

type LowStockScreenProps = {
  onNavigate: (tab: StockTabKey) => void;
};

export function LowStockScreen({ onNavigate }: LowStockScreenProps) {
  const { data, isLoading } = useExpiringStock();
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("all");

  const critical = data.filter((p) => p.expiryBucket === "critical");
  const warning = data.filter((p) => p.expiryBucket === "warning");
  const safe = data.filter((p) => p.expiryBucket === "safe");

  const filteredProducts =
    selectedFilter === "all"
      ? data
      : selectedFilter === "critical"
        ? critical
        : selectedFilter === "warning"
          ? warning
          : safe;

  const summary = [
    { key: "critical" as const, label: " ស្តុកផុតកំណត់ក្នុង 7 ថ្ងៃ", count: critical.length, unit: "មុខទំនិញ", bg: "bg-red-50", text: "text-red-600", selectedBg: "bg-red-100", border: "border-red-400" },
    { key: "warning" as const, label: " ស្តុកផុតកំណត់ក្នុង 15 ថ្ងៃ", count: warning.length, unit: "មុខទំនិញ", bg: "bg-orange-50", text: "text-orange-600", selectedBg: "bg-orange-100", border: "border-orange-400" },
    { key: "safe" as const, label: "​ស្តុកលើសពី 15 ថ្ងៃ", count: safe.length, unit: "មុខទំនិញ", bg: "bg-green-50", text: "text-green-600", selectedBg: "bg-green-100", border: "border-green-400" },
  ] as const;

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      <StockTabBar active="expiry" onChange={onNavigate} />

      <View className="flex-row gap-2 px-5 pt-3 pb-2">
        {summary.map((item) => {
          const isSelected = selectedFilter === item.key;
          return (
            <Pressable
              key={item.label}
              onPress={() => setSelectedFilter(isSelected ? "all" : item.key)}
              className={`${isSelected ? item.selectedBg : item.bg} flex-1 rounded-xl p-2.5 items-center ${isSelected ? `border-2 ${item.border}` : "border-2 border-transparent"}`}
            >
              <Text className={`font-khmerBold text-2xl ${item.text}`}>{item.label}</Text>
              <Text className={`font-khmerBold text-xl mt-1 ${item.text}`}>
                {item.count} {item.unit}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="font-khmer text-gray-400 text-xl mt-3">កំពុងផ្ទុក...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="cube-outline" size={36} color="#D1D5DB" />
            <Text className="font-khmer text-gray-400 text-xl mt-2">
              {selectedFilter === "all"
                ? "មិនមានផលិតផលផុតកំណត់"
                : "មិនមានផលិតផលក្នុងចំណាត់ថ្នាក់នេះ"}
            </Text>
          </View>
        ) : (
          filteredProducts.map((product: ExpiringProduct) => (
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