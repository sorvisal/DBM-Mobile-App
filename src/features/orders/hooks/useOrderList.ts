import { useEffect, useState, useRef, useCallback } from "react";
import { api, cacheGet, cacheSet, invalidateOrderCache, CacheTTL, suppressGlobalLoading, unsuppressGlobalLoading } from "@/services";
import { OrderStatus } from "../types/types";
import { normalizeOrderStatus } from "../constants/order.constants";
import type { Order } from "../types/types";
import type { CreateOrderValues } from "../components/CreateOrderModal";

const PAGE_SIZE = 20;
const STALE_TTL = CacheTTL.MEDIUM;

function cacheKeyForPage(filterStatus: OrderStatus | "all", p: number) {
  return `orders:list:${filterStatus}:p${p}`;
}

function mapApiOrder(o: import("@/types/api").Order): Order {
  const apiLines = o.lines ?? [];
  const lines = apiLines.map((i) => ({
    id: String(i.productId),
    name: i.productName,
    imageUrl: i.imageUrl ?? "",
    price: i.unitPrice,
    qty: i.qty,
  }));
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  return {
    id: String(o.id),
    code: o.code,
    status: normalizeOrderStatus(o.status),
    customer: { id: String(o.customerId), name: o.customerName },
    createdAt: o.createdAt,
    lines,
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

export function useOrderList(filterStatus: OrderStatus | "all") {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [stale, setStale] = useState(false);
  
  const filterRef = useRef(filterStatus);
  filterRef.current = filterStatus;

  const loadPage = useCallback(async (p: number, append = false) => {
    if (append) setIsFetchingMore(true);
    else { setIsLoading(true); setAllOrders([]); }
    try {
      const res = await api.orders.list({ page: p, pageSize: PAGE_SIZE });
      if (filterRef.current !== filterStatus) return;

      const mapped = (res.items ?? [])
        .map(mapApiOrder)
        .filter((o: Order, idx: number, arr: Order[]) => arr.findIndex((x) => x.id === o.id) === idx);

      cacheSet(cacheKeyForPage(filterStatus, p), mapped, STALE_TTL).catch(() => {});

      if (p === 1) {
        setAllOrders(mapped);
        setTotal(res.total ?? mapped.length);
      } else {
        setAllOrders((prev) => {
          const existingIds = new Set(prev.map((o) => o.id));
          return [...prev, ...mapped.filter((o) => !existingIds.has(o.id))];
        });
      }
      setPage(p);
      setStale(false);
    } catch {
      if (!append && filterRef.current === filterStatus) setAllOrders([]);
    } finally {
      if (filterRef.current === filterStatus) {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    }
  }, [filterStatus]);

  useEffect(() => {
    let cancelled = false;
    setAllOrders([]);
    setPage(1);

    (async () => {
      const cached = await cacheGet<Order[]>(cacheKeyForPage(filterStatus, 1));
      if (cached && !cancelled && filterRef.current === filterStatus) {
        const seen = new Set<string>();
        const unique = cached.filter((o) => { if (seen.has(o.id)) return false; seen.add(o.id); return true; });
        setAllOrders(unique);
        setTotal(unique.length);
        setIsLoading(false);
        setStale(true);
      }

      if (!cancelled) {
        if (cached) suppressGlobalLoading();
        try {
          await loadPage(1, false);
        } catch {
          // Handled inside loadPage
        } finally {
          if (cached) unsuppressGlobalLoading();
        }
      }
    })();

    return () => { cancelled = true; };
  }, [filterStatus, loadPage]);

  const hasMore = allOrders.length < total;
  const loadMore = () => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    cacheGet<Order[]>(cacheKeyForPage(filterStatus, nextPage)).then((cached) => {
      if (cached) {
        setAllOrders((prev) => {
          const existingIds = new Set(prev.map((o) => o.id));
          return [...prev, ...cached.filter((o) => !existingIds.has(o.id))];
        });
        setPage(nextPage);
        return;
      }
      loadPage(nextPage, true);
    });
  };

  const refresh = async () => {
    await loadPage(1, false);
  };

  const filteredOrders = filterStatus === "all"
    ? allOrders
    : allOrders.filter((o) => o.status === filterStatus);

  const counts: Record<string, number> = { all: total };
  allOrders.forEach((order) => { counts[order.status] = (counts[order.status] ?? 0) + 1; });

  return { orders: filteredOrders, counts, isLoading, isFetchingMore, hasMore, loadMore, refresh, stale };
}

export function refreshOrderList(): void {
  invalidateOrderCache();
}

export async function addOrder(values: CreateOrderValues) {
  const customerId = Number(values.customerId) || 0;
  const productId = Number(values.productId) || 0;
  const qty = Number(values.quantity) || 1;

  await api.orders.create({
    customerId,
    lines: [{ productId, qty }],
    deliveryAddress: values.address || "",
    description: values.item || "",
  });
  refreshOrderList();
}

export async function deleteOrder(orderId: string) {
  await api.orders.setStatus(orderId, OrderStatus.Cancelled as any);
  refreshOrderList();
}