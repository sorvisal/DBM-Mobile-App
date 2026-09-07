import { useState } from "react";
import { StockListScreen } from "./StockListScreen";
import { StockHistoryScreen } from "./StockHistoryScreen";
import { LowStockScreen } from "./LowStockScreen";
import { AddStockScreen } from "./AddStockScreen";

export type StockTabKey = "add" | "history" | "products" | "expiry";

type StockScreenProps = {
  initialTab?: StockTabKey;
};

export function StockScreen({
  initialTab = "products",
}: StockScreenProps) {
  const [activeStockTab, setActiveStockTab] =
    useState<StockTabKey>(initialTab);

  switch (activeStockTab) {
    case "add":
      return <AddStockScreen onNavigate={setActiveStockTab} />;

    case "history":
      return <StockHistoryScreen onNavigate={setActiveStockTab} />;

    case "expiry":
      return <LowStockScreen onNavigate={setActiveStockTab} />;

    case "products":
    default:
      return <StockListScreen onNavigate={setActiveStockTab} />;
  }
}