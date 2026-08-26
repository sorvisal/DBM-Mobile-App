import { useEffect, useState } from "react";
import { api, resolveMediaUrl, cacheGetStale, cacheSet, CacheTTL, suppressGlobalLoading, unsuppressGlobalLoading } from "@/services";
import type { Product as ApiProduct } from "@/types/api";
import type { StockStatus, Product as StockProduct } from "../types/stock.types";

const CACHE_KEY = "products:expiring";

export type ExpiryBucket = "critical" | "warning" | "safe"; // <=7 days, <=15 days, >15 days

export type ExpiringProduct = StockProduct & {
  daysUntilExpiry: number;
  expiryBucket: ExpiryBucket;
};

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

function toExpiringProduct(p: StockProduct): ExpiringProduct | null {
  if (!p.expiresAt) return null;

  const expiryDate = new Date(p.expiresAt);
  if (Number.isNaN(expiryDate.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilExpiry = Math.round((expiryDate.getTime() - today.getTime()) / msPerDay);

  const expiryBucket: ExpiryBucket =
    daysUntilExpiry <= 7 ? "critical" : daysUntilExpiry <= 15 ? "warning" : "safe";

  return { ...p, daysUntilExpiry, expiryBucket };
}

function dedupeAndFilter(products: StockProduct[]): ExpiringProduct[] {
  const seen = new Set<string>();
  const result: ExpiringProduct[] = [];
  for (const p of products) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    const expiring = toExpiringProduct(p);
    if (expiring) result.push(expiring);
  }
  // Soonest-expiring first
  return result.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}

export function useExpiringStock() {
  const [data, setData] = useState<ExpiringProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [cached, stale] = await cacheGetStale<ExpiringProduct[]>(CACHE_KEY);
      if (cached && !cancelled) {
        setData(cached);
        setIsLoading(false);
        if (!stale) return;

        suppressGlobalLoading();
        try {
          const res = await api.products.list({ page: 1, pageSize: 100 });
          if (cancelled) return;
          const mapped = dedupeAndFilter(res.items.map(mapApiProduct));
          cacheSet(CACHE_KEY, mapped, CacheTTL.LONG).catch(() => {});
          setData(mapped);
        } catch {
          // keep stale data on background error
        } finally {
          unsuppressGlobalLoading();
          if (!cancelled) setIsLoading(false);
        }
      } else {
        try {
          const res = await api.products.list({ page: 1, pageSize: 100 });
          if (cancelled) return;
          const mapped = dedupeAndFilter(res.items.map(mapApiProduct));
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