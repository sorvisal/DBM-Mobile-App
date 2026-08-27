import { useCallback, useEffect, useRef, useState } from "react";
import { api, cacheGet, cacheSet, cacheClearKeySync, CacheTTL, suppressGlobalLoading, unsuppressGlobalLoading } from "@/services";
import { normalizeOrderStatus } from "../constants/order.constants";
import type { Order } from "../types/types";

const STALE_TTL = CacheTTL.MEDIUM;

function mapApiOrder(o: import("@/types/api").Order): Order {
  const apiLines = o.lines ?? [];
  const lines = apiLines
    .map((i) => ({
      id: i.productId,
      name: i.productName,
      imageUrl: i.imageUrl ?? "",
      price: i.unitPrice,
      qty: i.qty,
    }))
    .filter((item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx);
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  return {
    id: o.id,
    code: o.code,
    status: normalizeOrderStatus(o.status),
    customer: { name: o.customerName, phone: "" },
    createdAt: o.createdAt,
    lines,
    subtotal,
    deliveryFee: 0.5,
    total: o.totalAmount,
    paidAmount: o.paidAmount ?? 0,
    remainingAmount: o.totalAmount - (o.paidAmount ?? 0),
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
  const refreshKey = useRef(0);

  const refresh = useCallback(() => {
    refreshKey.current += 1;
  }, []);

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
  }, [orderId, refreshKey.current]);

  return { order, isLoading, refresh };
}

export function clearOrderDetailCache(orderId: string): void {
  cacheClearKeySync(`order:${orderId}`);
}