import { useState, useEffect, useCallback } from "react";
import { OrderListScreen } from "./OrderListScreen";
import { OrderDetailScreen } from "./OrderDetailScreen";
import { CreateOrderScreen } from "./CreateOrderScreen";

type OrdersScreenProps = {
  onChromeChange?: (hidden: boolean) => void;
  isActive?: boolean;
  /** Deep-link: order id to open (from a notification). */
  openOrderId?: string | null;
  /** Called once `openOrderId` has been consumed. */
  onOpenOrderHandled?: () => void;
};

export function OrdersScreen({
  onChromeChange,
  isActive,
  openOrderId,
  onOpenOrderHandled,
}: OrdersScreenProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  const isSubView = selectedOrderId !== null || showCreateOrder;

  useEffect(() => {
    onChromeChange?.(isSubView);
  }, [isSubView, onChromeChange]);

  useEffect(() => {
    if (!openOrderId) return;
    setShowCreateOrder(false);
    setSelectedOrderId(openOrderId);
    onOpenOrderHandled?.();
  }, [openOrderId, onOpenOrderHandled]);

  const handleSelectOrder = useCallback((id: string | null) => {
    setSelectedOrderId(id);
  }, []);

  const handleOpenCreateOrder = useCallback(() => {
    setShowCreateOrder(true);
  }, []);

  const handleCloseCreateOrder = useCallback(() => {
    setShowCreateOrder(false);
  }, []);

  if (showCreateOrder) {
    return (
      <CreateOrderScreen onBack={handleCloseCreateOrder} />
    );
  }

  if (selectedOrderId) {
    return (
      <OrderDetailScreen
        orderId={selectedOrderId}
        onBack={() => handleSelectOrder(null)}
        onOpenOrder={handleSelectOrder}
        isActive={isActive}
      />
    );
  }

  return (
    <OrderListScreen
      onSelectOrder={handleSelectOrder}
      onCreateOrder={handleOpenCreateOrder}
    />
  );
}
