import { useState } from "react";
import { api, invalidateOrderCache, invalidateOrderDetailCache } from "@/services";
import { OrderStatus } from "../types/types";
import type { OrderDelivery } from "../types/types";

export function useUpdateOrderStatus() {
  const [isLoading, setIsLoading] = useState(false);

  const updateOrderStatus = async (orderId: string, status: OrderStatus, deliveryPatch?: Partial<OrderDelivery>) => {
    setIsLoading(true);
    try {
      switch (status) {
        case OrderStatus.Cancelled:
          await api.orders.setStatus(orderId, status as any);
          break;
        case OrderStatus.Confirmed:
          await api.orders.confirm(orderId);
          break;
        case OrderStatus.Shipping:
          await api.orders.setStatus(orderId, OrderStatus.Shipping as any);
          break;
        case OrderStatus.Completed:
          await api.orders.complete(orderId);
          break;
        default:
          await api.orders.setStatus(orderId, status as any);
      }
      invalidateOrderCache();
      invalidateOrderDetailCache(orderId);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      await api.orders.confirm(orderId);
      invalidateOrderCache();
      invalidateOrderDetailCache(orderId);
    } finally {
      setIsLoading(false);
    }
  };

  const approveOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      await api.orders.approve(orderId);
      invalidateOrderCache();
      invalidateOrderDetailCache(orderId);
    } finally {
      setIsLoading(false);
    }
  };

  const assignDriver = async (orderId: string, driverName: string, driverPhone?: string) => {
    setIsLoading(true);
    try {
      await api.orders.assignDriver(orderId, driverName, driverPhone);
      invalidateOrderCache();
      invalidateOrderDetailCache(orderId);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      await api.orders.complete(orderId);
      invalidateOrderCache();
      invalidateOrderDetailCache(orderId);
    } finally {
      setIsLoading(false);
    }
  };

  const uncompleteOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      await api.orders.uncomplete(orderId);
      invalidateOrderCache();
      invalidateOrderDetailCache(orderId);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      await api.orders.setStatus(orderId, OrderStatus.Cancelled as any);
      invalidateOrderCache();
      invalidateOrderDetailCache(orderId);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateOrderStatus,
    confirmOrder,
    approveOrder,
    assignDriver,
    completeOrder,
    uncompleteOrder,
    cancelOrder,
    isLoading,
  };
}
