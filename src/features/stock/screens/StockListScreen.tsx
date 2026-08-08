import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StockTabBar } from "../components/StockTabBar";
import { TotalProductCard } from "../components/totalProdcutCard";
import type { StockTabKey } from "./StockScreen";

const PRODUCTS = [
  { id: "1", imageUrl: "https://png.pngtree.com/png-clipart/20231116/original/pngtree-cocacola-can-resting-on-a-blank-photo-png-image_13582802.png", name: "Coca-Cola 330ml", unit: "កេស", buyPrice: "3.00$", sellPrice: "5.00$", quantity: 205 },
  { id: "2", imageUrl: "https://png.pngtree.com/png-clipart/20231024/original/pngtree-pepsi-produced-in-tyumen-russia-by-pepsico-many-photo-png-image_13418754.png", name: "Pepsi 330ml", unit: "កេស", buyPrice: "4.00$", sellPrice: "6.00$", quantity: 600 },
  { id: "3", imageUrl: "https://png.pngtree.com/png-vector/20250429/ourmid/pngtree-iconic-orange-fanta-can-with-condensation-png-image_16058435.png", name: "Fanta Orange 330ml", unit: "កេស", buyPrice: "5.00$", sellPrice: "8.00$", quantity: 800 },
  { id: "4", imageUrl: "https://www.vital.com.kh/2018/image/cache/catalog/Vital-Bottle-1500ml-Eng-800x800.png", name: "ទឹកសុទ្ធ 1.5L", unit: "កេស", buyPrice: "2.00$", sellPrice: "4.00$", quantity: 432 },
  { id: "5", imageUrl: "https://static.vecteezy.com/system/resources/previews/071/508/482/non_2x/sprite-drink-in-a-can-on-a-transparent-background-free-png.png", name: "Sprite 330ml", unit: "កេស", buyPrice: "3.50$", sellPrice: "7.00$", quantity: 700 },
  { id: "6", imageUrl: "https://www.monde-selection.com/wp-content/uploads/2024/05/1041890-768x768.png", name: "Express 330ml", unit: "កេស", buyPrice: "2.50$", sellPrice: "5.00$", quantity: 500 },
  { id: "7", imageUrl: "https://www.monde-selection.com/wp-content/uploads/2026/05/1046265.png", name: "IDOL 330ml", unit: "កេស", buyPrice: "6.00$", sellPrice: "8.00$", quantity: 200 },
  { id: "8", imageUrl: "https://www.monde-selection.com/wp-content/uploads/2026/05/1045923.png", name: "Crud 330ml", unit: "កេស", buyPrice: "1.50$", sellPrice: "4.00$", quantity: 200 },
] as const;

type StockListScreenProps = {
  onNavigate: (tab: StockTabKey) => void;
};

export function StockListScreen({ onNavigate }: StockListScreenProps) {
  const [search, setSearch] = useState("");

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Top navbar */}
      <View className="bg-blue-600  px-5 pt-3 pb-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => onNavigate("products")}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="font-khmerBold text-white text-lg">ស្តុក</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Sub navbar */}
      <StockTabBar active="products" onChange={onNavigate} />

      <View className="px-5 pt-3 pb-2 bg-gray-50">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 h-11">
          <Ionicons name="search-outline" size={24} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ស្វែងរកទំនិញ..."
            placeholderTextColor="#9CA3AF"
            className="font-khmer flex-1 ml-2 text-2xl text-gray-800"
          />
          <Ionicons name="options-outline" size={24} color="#9CA3AF" />
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-1" showsVerticalScrollIndicator={false}>
        {PRODUCTS.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).map((product) => (
          <TotalProductCard
            key={product.id}
            imageUrl={product.imageUrl}
            name={product.name}
            unit={product.unit}
            buyPrice={product.buyPrice}
            sellPrice={product.sellPrice}
            quantity={product.quantity}
            onPress={() => {}}
          />
        ))}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}