import { useState } from "react";
import { OrderListScreen } from "./OrderListScreen";
import { OrderDetailScreen } from "./OrderDetailScreen";

export function OrdersScreen() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  if (selectedOrderId) {
    return <OrderDetailScreen orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />;
  }

  return <OrderListScreen onSelectOrder={setSelectedOrderId} />;
}
