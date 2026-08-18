import { View, Text, TouchableOpacity } from "react-native";
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
          }).then(() => onNavigate("products")).catch(() => {});
        }}
        isLoading={isLoading}
      />
    </View>
  );
}
