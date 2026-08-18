import { useEffect, useState } from "react";
import { api, cacheGetStale, cacheSet, CacheTTL, suppressGlobalLoading, unsuppressGlobalLoading } from "@/services";
import type { StockMovement as ApiStockMovement } from "@/types/api";
import type { StockTransaction } from "../types/stock.types";

function mapApiMovement(m: ApiStockMovement): StockTransaction {
  return {
    id: m.id,
    productId: m.productId,
    productName: m.productName,
    type: m.type === "in" ? "in" : "out",
    quantity: m.quantity,
    createdAt: m.createdAt,
  };
}

export function useStockHistory(page = 1, pageSize = 50) {
  const [data, setData] = useState<StockTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const key = `stock:movements:${page}:${pageSize}`;

    (async () => {
      setIsLoading(true);
      const [cached, stale] = await cacheGetStale<StockTransaction[]>(key);
      if (cached && !cancelled) {
        setData(cached);
        setIsLoading(false);
        if (!stale) return;

        // Stale — revalidate in background (suppress global overlay)
        suppressGlobalLoading();
        try {
          const res = await api.stock.movements({ page, pageSize });
          if (cancelled) return;
          const mapped = res.items.map(mapApiMovement);
          cacheSet(key, mapped, CacheTTL.SHORT).catch(() => {});
          setData(mapped);
        } catch {
          // keep stale data on background error
        } finally {
          unsuppressGlobalLoading();
          if (!cancelled) setIsLoading(false);
        }
      } else {
        // No cache — fetch with global overlay tracking
        try {
          const res = await api.stock.movements({ page, pageSize });
          if (cancelled) return;
          const mapped = res.items.map(mapApiMovement);
          cacheSet(key, mapped, CacheTTL.SHORT).catch(() => {});
          setData(mapped);
        } catch {
          if (!cancelled && !cached) setData([]);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [page, pageSize]);

  return { data, isLoading };
}
