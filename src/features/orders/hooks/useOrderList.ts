import { useEffect, useState, useRef } from "react";
import { api, cacheGet, cacheGetStale, cacheSet, invalidateOrderCache, CacheTTL, suppressGlobalLoading, unsuppressGlobalLoading } from "@/services";
import { OrderStatus } from "../types/types";
import type { Order } from "../types/types";

const PAGE_SIZE = 20;
const STALE_TTL = CacheTTL.MEDIUM;

function cacheKeyFor(filterStatus: OrderStatus | "all") {
  return `orders:list:${filterStatus}`;
}

function cacheKeyForPage(filterStatus: OrderStatus | "all", p: number) {
  return `orders:list:${filterStatus}:p${p}`;
}

function mapApiOrder(o: import("@/types/api").Order): Order {
  const apiItems = o.items ?? [];
  const items = apiItems.map((i) => ({
    id: i.productId,
    name: i.productName,
    imageUrl: `https://picsum.photos/seed/${i.productId}/100`,
    price: i.unitPrice,
    quantity: i.quantity,
  }));
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

export function useOrderList(filterStatus: OrderStatus | "all") {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [stale, setStale] = useState(false);
  const ordersRef = useRef(allOrders);
  ordersRef.current = allOrders;
  const filterRef = useRef(filterStatus);
  filterRef.current = filterStatus;

  const loadPage = async (p: number, append = false) => {
    if (append) setIsFetchingMore(true);
    else { setIsLoading(true); setAllOrders([]); }
    try {
      const res = await api.orders.list({ page: p, pageSize: PAGE_SIZE });
      const mapped = res.items
        .map(mapApiOrder)
        .filter((o: Order, idx: number, arr: Order[]) => arr.findIndex((x) => x.id === o.id) === idx);
      // Cache each page
      cacheSet(cacheKeyForPage(filterRef.current, p), mapped, STALE_TTL).catch(() => {});
      if (p === 1) {
        setAllOrders(mapped);
        setTotal(res.total ?? mapped.length);
      } else {
        const existingIds = new Set(allOrders.map((o) => o.id));
        setAllOrders((prev) => [...prev, ...mapped.filter((o) => !existingIds.has(o.id))]);
      }
      setPage(p);
      setStale(false);
    } catch {
      if (!append) setAllOrders([]);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Restore page 1 from cache
      const cached = await cacheGet<Order[]>(cacheKeyForPage(filterStatus, 1));
      if (cached && !cancelled) {
        const seen = new Set<string>();
        const unique = cached.filter((o) => { if (seen.has(o.id)) return false; seen.add(o.id); return true; });
        setAllOrders(unique);
        setTotal(unique.length);
        setIsLoading(false);
        setStale(true);
      }

      if (!cancelled) {
        // Suppress global overlay if we already have cached data visible
        if (cached) suppressGlobalLoading();
        try {
          await loadPage(1);
        } catch {
          // error already handled in loadPage
        } finally {
          if (cached) unsuppressGlobalLoading();
        }
      }
    })();

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasMore = allOrders.length < total;
  const loadMore = () => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    // Check cache first
    cacheGet<Order[]>(cacheKeyForPage(filterStatus, nextPage)).then((cached) => {
      if (cached) {
        const existingIds = new Set(allOrders.map((o) => o.id));
        setAllOrders((prev) => [...prev, ...cached.filter((o) => !existingIds.has(o.id))]);
        setPage(nextPage);
        setIsFetchingMore(false);
        return;
      }
      loadPage(nextPage, true);
    });
  };

  // Filter locally — instant, no API
  const filteredOrders = filterStatus === "all"
    ? allOrders
    : allOrders.filter((o) => o.status === filterStatus);

  const counts: Record<string, number> = { all: total };
  allOrders.forEach((order) => { counts[order.status] = (counts[order.status] ?? 0) + 1; });

  return { orders: filteredOrders, counts, isLoading, isFetchingMore, hasMore, loadMore, stale };
}

export function refreshOrderList(): void {
  invalidateOrderCache();
}

export async function addOrder(_order: Order) {
  await api.orders.create(_order as any);
  refreshOrderList();
}

export async function deleteOrder(orderId: string) {
  await api.orders.setStatus(orderId, OrderStatus.Cancelled as any);
  refreshOrderList();
}
