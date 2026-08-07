import { OrderStatus, OrderDelivery } from "../types/types";
import { setOrderStatus } from "./useOrderList";

export function useUpdateOrderStatus() {
  const updateOrderStatus = (orderId: string, status: OrderStatus, deliveryPatch?: Partial<OrderDelivery>) => {
    setOrderStatus(orderId, status, deliveryPatch);
  };

  return { updateOrderStatus };
}