import { useState } from "react";
import { api } from "@/services";
import { OrderStatus } from "../types/types";
import type { OrderDelivery } from "../types/types";

export function useUpdateOrderStatus() {
  const [isLoading, setIsLoading] = useState(false);

  const updateOrderStatus = async (orderId: string, status: OrderStatus, deliveryPatch?: Partial<OrderDelivery>) => {
    setIsLoading(true);
    try {
      if (status === OrderStatus.Cancelled) {
        await api.orders.setStatus(orderId, status as any);
      } else {
        await api.orders.confirm(orderId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const confirmOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      await api.orders.confirm(orderId);
    } finally {
      setIsLoading(false);
    }
  };

  return { updateOrderStatus, confirmOrder, isLoading };
}
