import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StockTabBar } from "../components/StockTabBar";
import { ProductCard } from "../components/ProductCard";
import type { StockTabKey } from "./StockScreen";

const EXPIRY_SUMMARY = [
  { label: "ដល់ថ្ងៃ 7 ថ្ងៃ", count: 8, unit: "មុខទំនិញ", bg: "bg-red-50", text: "text-red-600" },
  { label: "ដល់ថ្ងៃ 15 ថ្ងៃ", count: 5, unit: "មុខទំនិញ", bg: "bg-orange-50", text: "text-orange-600" },
  { label: "លើសពី 15 ថ្ងៃ", count: 2, unit: "មុខទំនិញ", bg: "bg-green-50", text: "text-green-600" },
] as const;

const EXPIRING_PRODUCTS = [
  { id: "1", imageUrl: "https://www.monde-selection.com/wp-content/uploads/2024/05/1041890-768x768.png", name: "Express 330ml", unit: "1 កេស", price: "5.00$", quantity: 5, expiryDate: "30/05/2025", daysLeft: 24 },
  { id: "2", imageUrl: "https://png.pngtree.com/png-clipart/20231024/original/pngtree-pepsi-produced-in-tyumen-russia-by-pepsico-many-photo-png-image_13418754.png", name: "Pepsi 330ml", unit: "1 កេស", price: "6.00$", quantity: 6, expiryDate: "31/05/2025", daysLeft: 18 },
  { id: "3", imageUrl: "https://www.monde-selection.com/wp-content/uploads/2026/05/1046265.png", name: "IDOL 330ml", unit: "1 កេស", price: "8.00$", quantity: 8, expiryDate: "02/06/2025", daysLeft: 15 },
  { id: "4", imageUrl: "https://www.monde-selection.com/wp-content/uploads/2026/05/1045923.png", name: "Crud 330ml", unit: "1 កេស", price: "4.00$", quantity: 4, expiryDate: "28/05/2025", daysLeft: 32 },
  { id: "5", imageUrl: "https://static.vecteezy.com/system/resources/previews/071/508/482/non_2x/sprite-drink-in-a-can-on-a-transparent-background-free-png.png", name: "Sprite 330ml", unit: "1 កេស", price: "7.00$", quantity: 7, expiryDate: "01/06/2025", daysLeft: 20 },
] as const;

type LowStockScreenProps = {
  onNavigate: (tab: StockTabKey) => void;
};

export function LowStockScreen({ onNavigate }: LowStockScreenProps) {
  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Top navbar */}
      <View className="bg-blue-600 px-5 pt-3 pb-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => onNavigate("products")}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="font-khmerBold text-white text-lg">ស្តុក</Text>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Sub navbar */}
      <StockTabBar active="expiry" onChange={onNavigate} />

      <View className="flex-row gap-2 px-5 pt-3 pb-2">
        {EXPIRY_SUMMARY.map((item) => (
          <View key={item.label} className={`${item.bg} flex-1 rounded-xl p-2.5 items-center`}>
            <Text className={`font-khmerBold text-xs ${item.text}`}>{item.label}</Text>
            <Text className={`font-khmerBold text-sm mt-1 ${item.text}`}>
              {item.count} {item.unit}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {EXPIRING_PRODUCTS.map((product) => (
          <ProductCard
            key={product.id}
            imageUrl={product.imageUrl}
            name={product.name}
            unit={product.unit}
            price={product.price}
            quantity={product.quantity}
            expiryDate={product.expiryDate}
            daysLeft={product.daysLeft}
            onPress={() => {}}
          />
        ))}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}