import { View } from "react-native";
import { StockTabBar } from "../components/StockTabBar";
import { StockFilterTabs } from "../components/StockFilterTabs";
import type { StockTabKey } from "./StockScreen";

type StockHistoryScreenProps = {
  onNavigate: (tab: StockTabKey) => void;
};

export function StockHistoryScreen({ onNavigate }: StockHistoryScreenProps) {
  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      <StockTabBar active="history" onChange={onNavigate} />
      <StockFilterTabs />
    </View>
  );
}
