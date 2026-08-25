import { useState, useEffect, useCallback } from "react";
import { OrderListScreen } from "./OrderListScreen";
import { OrderDetailScreen } from "./OrderDetailScreen";

type OrdersScreenProps = {
  onChromeChange?: (hidden: boolean) => void;
};

export function OrdersScreen({ onChromeChange }: OrdersScreenProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Notify RootLayout to hide MainLayout's header & footer when viewing an order detail
  useEffect(() => {
    onChromeChange?.(selectedOrderId !== null);
  }, [selectedOrderId, onChromeChange]);

  const handleSelectOrder = useCallback((id: string | null) => {
    setSelectedOrderId(id);
  }, []);

  if (selectedOrderId) {
    return (
      <OrderDetailScreen 
        orderId={selectedOrderId} 
        onBack={() => handleSelectOrder(null)} 
      />
    );
  }

  return <OrderListScreen onSelectOrder={handleSelectOrder} />;
}