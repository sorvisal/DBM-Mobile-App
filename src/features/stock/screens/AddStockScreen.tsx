import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StockTabBar } from "../components/StockTabBar";
import { StockForm } from "../components/StockForm";
import type { StockTabKey } from "./StockScreen";
import { useAddStock } from "../hooks/useAddStock";

type AddStockScreenProps = {
  onNavigate: (tab: StockTabKey) => void;
};

export function AddStockScreen({ onNavigate }: AddStockScreenProps) {
  const { mutate, isLoading } = useAddStock();
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowOverlay(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Sub navbar */}
      <StockTabBar active="add" onChange={onNavigate} />

      <StockForm
        onSubmit={(values) => {
          mutate({
            name: values.productName,
            category: values.category,
            quantity: values.quantity,
            buyPrice: values.buyPrice,
            sellPrice: values.sellPrice,
            expiresAt: values.expiryDate?.toISOString()?.split("T")[0] ?? "",
            imageUrl: values.imageUrl,
            note: values.note,
          }).then(() => onNavigate("products")).catch(() => {});
        }}
        isLoading={isLoading}
      />

      {showOverlay && (
        <View
          className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,100)", zIndex: 50 }}
        >
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="font-khmer text-gray-500 text-sm mt-3">កំពុងផ្ទុក...</Text>
        </View>
      )}
    </View>
  );
}