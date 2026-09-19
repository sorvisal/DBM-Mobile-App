import { useEffect, useState } from "react";
import { StockListScreen } from "./StockListScreen";
import { StockHistoryScreen } from "./StockHistoryScreen";
import { LowStockScreen } from "./LowStockScreen";
import { AddStockScreen } from "./AddStockScreen";
import { ProductDetailScreen } from "./ProductDetailScreen";

export type StockTabKey = "add" | "history" | "products" | "expiry";

type StockScreenProps = {
  initialTab?: StockTabKey;
  /** Deep-link: product id to open (from a notification). */
  openProductId?: string | null;
  /** Called once `openProductId` has been consumed. */
  onOpenProductHandled?: () => void;
};

export function StockScreen({
  initialTab = "products",
  openProductId,
  onOpenProductHandled,
}: StockScreenProps) {
  const [activeStockTab, setActiveStockTab] =
    useState<StockTabKey>(initialTab);

  const [selectedProductId, setSelectedProductId] =
    useState<string | null>(null);

  useEffect(() => {
    if (!openProductId) return;
    setActiveStockTab("products");
    setSelectedProductId(openProductId);
    onOpenProductHandled?.();
  }, [openProductId, onOpenProductHandled]);

  if (selectedProductId) {
    return (
      <ProductDetailScreen
        productId={selectedProductId}
        onBack={() => setSelectedProductId(null)}
      />
    );
  }

  switch (activeStockTab) {
    case "add":
      return <AddStockScreen onNavigate={setActiveStockTab} />;

    case "history":
      return <StockHistoryScreen onNavigate={setActiveStockTab} />;

    case "expiry":
      return <LowStockScreen onNavigate={setActiveStockTab} />;

    case "products":
    default:
      return (
        <StockListScreen
          onNavigate={setActiveStockTab}
          onSelectProduct={setSelectedProductId}
        />
      );
  }
}