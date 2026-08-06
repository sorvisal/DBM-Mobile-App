import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StockTabBar } from "../components/StockTabBar";
import { StockForm } from "../components/StockForm";
import type { StockTabKey } from "./StockScreen";

type AddStockScreenProps = {
  onNavigate: (tab: StockTabKey) => void;
};

export function AddStockScreen({ onNavigate }: AddStockScreenProps) {
  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Top navbar */}
      <View className="bg-blue-600 px-5 pt-3 pb-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => onNavigate("products")}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="font-khmerBold text-white text-lg">ស្តុក</Text>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Sub navbar */}
      <StockTabBar active="add" onChange={onNavigate} />

      <StockForm
        onSubmit={(values) => {
          Alert.alert("បានរក្សាទុក", JSON.stringify(values, null, 2));
        }}
      />
    </View>
  );
}