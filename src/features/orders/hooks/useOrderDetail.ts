import { useEffect, useState } from "react";
import { api, cacheGet, cacheSet, cacheClearKeySync, CacheTTL, suppressGlobalLoading, unsuppressGlobalLoading } from "@/services";
import { OrderStatus } from "../types/types";
import type { Order } from "../types/types";

const STALE_TTL = CacheTTL.MEDIUM;

function mapApiOrder(o: import("@/types/api").Order): Order {
  const apiItems = o.items ?? [];
  const items = apiItems
    .map((i) => ({
      id: i.productId,
      name: i.productName,
      imageUrl: i.imageUrl ?? `https://picsum.photos/seed/${i.productId}/100`,
      price: i.unitPrice,
      quantity: i.quantity,
    }))
    .filter((item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return {
    id: o.id,
    code: o.code,
    status: (o.status as unknown as OrderStatus) ?? OrderStatus.Pending,
    customer: { name: o.customerName, phone: o.driverPhone ?? "" },
    createdAt: o.createdAt,
    items,
    subtotal,
    deliveryFee: 0.5,
    total: o.totalAmount,
    paymentMethod: o.paymentMethod ?? undefined,
    address: o.deliveryAddress ?? undefined,
    note: o.note ?? undefined,
    paymentStatus: o.paymentStatus,
    delivery: o.driverName
      ? {
          driverName: o.driverName,
          driverPhone: o.driverPhone ?? undefined,
          confirmedAt: o.confirmedAt ?? undefined,
          deliveredAt: o.completedAt ?? undefined,
        }
      : undefined,
  };
}

export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { setOrder(null); setIsLoading(false); return; }
    let cancelled = false;
    setIsLoading(true);
    const cacheKey = `order:${orderId}`;

    (async () => {
      // Restore from cache first
      const cached = await cacheGet<Order>(cacheKey);
      if (cached && !cancelled) {
        setOrder(cached);
        setIsLoading(false);
      }

      if (!cancelled) {
        // Suppress global overlay if we already have cached data visible
        if (cached) suppressGlobalLoading();
        try {
          const o = await api.orders.get(orderId);
          if (cancelled) return;
          const mapped = mapApiOrder(o);
          cacheSet(cacheKey, mapped, STALE_TTL).catch(() => {});
          setOrder(mapped);
        } catch {
          if (!cancelled) setOrder(null);
        } finally {
          if (cached) unsuppressGlobalLoading();
          if (!cancelled) setIsLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [orderId]);

  return { order, isLoading };
}

export function clearOrderDetailCache(orderId: string): void {
  cacheClearKeySync(`order:${orderId}`);
}