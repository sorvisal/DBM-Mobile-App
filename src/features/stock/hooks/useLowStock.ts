import { useEffect, useState } from "react";
import { api, resolveMediaUrl, cacheGetStale, cacheSet, CacheTTL, suppressGlobalLoading, unsuppressGlobalLoading } from "@/services";
import type { Product as ApiProduct } from "@/types/api";
import type { StockStatus, Product as StockProduct } from "../types/stock.types";

const CACHE_KEY = "products:lowstock";

function mapApiProduct(p: ApiProduct): StockProduct {
  const status: StockStatus =
    p.stock === 0 ? "out_of_stock" : p.stock <= p.lowStockThreshold ? "low_stock" : "in_stock";
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    quantity: p.stock,
    buyPrice: p.costPrice,
    sellPrice: p.salePrice,
    expiresAt: p.expiryDate ?? null,
    imageUrl: resolveMediaUrl(p.imageUrl),
    status,
  };
}

export function useLowStock() {
  const [data, setData] = useState<StockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // SWR: show cached data instantly
      const [cached, stale] = await cacheGetStale<StockProduct[]>(CACHE_KEY);
      if (cached && !cancelled) {
        const seen = new Set<string>();
        const unique = cached.filter((p: StockProduct) => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
        setData(unique);
        setIsLoading(false);
        if (!stale) return;

        // Stale — revalidate in background (suppress global overlay)
        suppressGlobalLoading();
        try {
          const res = await api.products.list({ lowStock: true, page: 1, pageSize: 100 });
          if (cancelled) return;
          const mapped = res.items
            .map(mapApiProduct)
            .filter((p: StockProduct, idx: number, arr: StockProduct[]) => arr.findIndex((x) => x.id === p.id) === idx);
          cacheSet(CACHE_KEY, mapped, CacheTTL.LONG).catch(() => {});
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
          const res = await api.products.list({ lowStock: true, page: 1, pageSize: 100 });
          if (cancelled) return;
          const mapped = res.items
            .map(mapApiProduct)
            .filter((p: StockProduct, idx: number, arr: StockProduct[]) => arr.findIndex((x) => x.id === p.id) === idx);
          cacheSet(CACHE_KEY, mapped, CacheTTL.LONG).catch(() => {});
          setData(mapped);
        } catch {
          if (!cancelled && !cached) setData([]);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { data, isLoading };
}
