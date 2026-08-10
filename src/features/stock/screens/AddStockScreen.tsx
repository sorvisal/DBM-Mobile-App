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
      <View className="bg-white  px-5 pt-3 pb-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => onNavigate("products")}>
          <Ionicons name="menu-outline" size={36} color="#1F2937" />
        </TouchableOpacity>
        <Text className="font-khmerBold text-gray-900 text-3xl">ស្តុក</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={22} color="white" />
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