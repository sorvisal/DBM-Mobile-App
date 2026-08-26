import { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
} from "react-native";

import { StockTabBar } from "../components/StockTabBar";
import { StockForm } from "../components/StockForm";

import type { StockTabKey } from "./StockScreen";

type AddStockScreenProps = {
  onNavigate: (
    tab: StockTabKey
  ) => void;
};

export function AddStockScreen({
  onNavigate,
}: AddStockScreenProps) {
  const [showOverlay, setShowOverlay] =
    useState(true);

  useEffect(() => {
    const timer = setTimeout(
      () => setShowOverlay(false),
      1000
    );

    return () =>
      clearTimeout(timer);
  }, []);

  return (
    <View
      className="flex-1 bg-gray-50"
      style={{ minHeight: 0 }}
    >
      {/* =========================
          SUB NAVBAR
      ========================== */}
      <StockTabBar
        active="add"
        onChange={onNavigate}
      />

      {/* =========================
          STOCK FORM
      ========================== */}
      <StockForm
        onSuccess={() =>
          onNavigate("products")
        }
      />

      {/* =========================
          INITIAL LOADING
      ========================== */}
      {showOverlay && (
        <View
          className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center"
          style={{
            backgroundColor:
              "rgba(255,255,255,0.96)",
            zIndex: 50,
          }}
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text className="font-khmer text-gray-500 text-sm mt-3">
            កំពុងផ្ទុក...
          </Text>
        </View>
      )}
    </View>
  );
}
