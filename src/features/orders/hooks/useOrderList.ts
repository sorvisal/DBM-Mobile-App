import { useSyncExternalStore } from "react";
import { Order, OrderStatus, OrderDelivery } from "../types/types";
import { MOCK_ORDERS } from "../constants/order.constants";

let orders: Order[] = [...MOCK_ORDERS];
let listeners: Array<() => void> = [];

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function getOrders() {
  return orders;
}

export function setOrderStatus(orderId: string, status: OrderStatus, deliveryPatch?: Partial<OrderDelivery>) {
  orders = orders.map((order) =>
    order.id === orderId
      ? { ...order, status, delivery: { ...order.delivery, ...deliveryPatch } }
      : order
  );
  emitChange();
}

export function addOrder(order: Order) {
  orders = [order, ...orders];
  emitChange();
}

export function deleteOrder(orderId: string) {
  orders = orders.filter((order) => order.id !== orderId);
  emitChange();
}

export function subscribeToOrders(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function useOrderList(filterStatus: OrderStatus | "all") {
  const allOrders = useSyncExternalStore(subscribeToOrders, getOrders, getOrders);

  const filteredOrders =
    filterStatus === "all" ? allOrders : allOrders.filter((order) => order.status === filterStatus);

  const counts: Partial<Record<OrderStatus | "all", number>> = { all: allOrders.length };
  allOrders.forEach((order) => {
    counts[order.status] = (counts[order.status] ?? 0) + 1;
  });

  return { orders: filteredOrders, counts, isLoading: false };
}