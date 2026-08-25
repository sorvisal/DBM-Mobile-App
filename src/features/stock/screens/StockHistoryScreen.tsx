import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { StockTabBar } from "../components/StockTabBar";
import { StockFilterTabs } from "../components/StockFilterTabs";
import type { StockTabKey } from "./StockScreen";

type StockHistoryScreenProps = {
  onNavigate: (tab: StockTabKey) => void;
};

export function StockHistoryScreen({ onNavigate }: StockHistoryScreenProps) {
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowOverlay(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      <StockTabBar active="history" onChange={onNavigate} />
      <StockFilterTabs />

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