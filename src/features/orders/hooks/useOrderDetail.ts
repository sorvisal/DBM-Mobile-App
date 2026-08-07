import { useSyncExternalStore } from "react";
import { getOrders, subscribeToOrders } from "./useOrderList";

export function useOrderDetail(orderId: string) {
  const allOrders = useSyncExternalStore(subscribeToOrders, getOrders, getOrders);
  const order = allOrders.find((o) => o.id === orderId) ?? null;

  return { order, isLoading: false };
}