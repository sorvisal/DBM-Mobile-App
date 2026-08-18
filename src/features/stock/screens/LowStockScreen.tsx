import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StockTabBar } from "../components/StockTabBar";
import { ProductCard } from "../components/ProductCard";
import type { StockTabKey } from "./StockScreen";
import { useLowStock } from "../hooks/useLowStock";

const EXPIRY_SUMMARY = [
  { label: "ដល់ថ្ងៃ 7 ថ្ងៃ", count: 8, unit: "មុខទំនិញ", bg: "bg-red-50", text: "text-red-600" },
  { label: "ដល់ថ្ងៃ 15 ថ្ងៃ", count: 5, unit: "មុខទំនិញ", bg: "bg-orange-50", text: "text-orange-600" },
  { label: "លើសពី 15 ថ្ងៃ", count: 2, unit: "មុខទំនិញ", bg: "bg-green-50", text: "text-green-600" },
] as const;

type LowStockScreenProps = {
  onNavigate: (tab: StockTabKey) => void;
};

export function LowStockScreen({ onNavigate }: LowStockScreenProps) {
  const { data, isLoading } = useLowStock();

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>

      {/* Sub navbar */}
      <StockTabBar active="expiry" onChange={onNavigate} />

      <View className="flex-row gap-2 px-5 pt-3 pb-2">
        {EXPIRY_SUMMARY.map((item) => (
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
            <Text className="font-khmer text-gray-400 text-xl">កំពុងដាក់បញ្ជី...</Text>
          </View>
        ) : data.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="cube-outline" size={36} color="#D1D5DB" />
            <Text className="font-khmer text-gray-400 text-xl mt-2">មិនមានផលិតផលផុតកំណត់</Text>
          </View>
        ) : (
          data.map((product) => (
            <ProductCard
              key={product.id}
              imageUrl={product.imageUrl ?? ""}
              name={product.name}
              unit={product.category ?? ""}
              price={`${product.sellPrice}`}
              quantity={product.quantity}
              isLowStock={true}
              onPress={() => {}}
            />
          ))
        )}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
