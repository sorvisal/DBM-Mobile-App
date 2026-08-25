import { useState, useCallback, useEffect, useRef } from "react";
import { api, cacheGet, cacheGetStale, cacheSet, CacheTTL, suppressGlobalLoading, unsuppressGlobalLoading } from "@/services";
import { resolveMediaUrl } from "@/services/http";
import type { StockStatus, Product as StockProduct } from "../types/stock.types";

const PAGE_SIZE = 20;

function cacheKey(search: string, p: number) {
  const safe = (search || "all").replace(/\s+/g, "_");
  return `products:list:${safe}:p${p}`;
}

export function mapApiProduct(p: { id: string; name: string; category: string; stock: number; costPrice: number; salePrice: number; expiryDate?: string | null; imageUrl?: string | null; lowStockThreshold?: number }, index: number): StockProduct {
  const threshold = p.lowStockThreshold ?? 0;
  const status: StockStatus = p.stock === 0 ? "out_of_stock" : p.stock <= threshold ? "low_stock" : "in_stock";
  const resolvedImageUrl = resolveMediaUrl(p.imageUrl) ?? undefined;
  if (__DEV__) {
    console.log('[MAP] mapApiProduct', p.name, '| in imageUrl ->', p.imageUrl, '| out imageUrl ->', resolvedImageUrl);
  }
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    quantity: p.stock,
    buyPrice: p.costPrice,
    sellPrice: p.salePrice,
    expiresAt: p.expiryDate ?? null,
    imageUrl: resolvedImageUrl,
    status,
  };
}

// --- Instant cross-instance sync -------------------------------------------------
// Every mounted useStockList() has its own React state. When a product is created
// elsewhere (e.g. AddStockScreen via useAddStock), we broadcast the newly created
// product to every currently-mounted hook instance so the Stock/Product list
// updates instantly — no refetch, navigation, or reload required.
type NewProductListener = (product: StockProduct) => void;
const newProductListeners = new Set<NewProductListener>();

export function notifyNewProduct(product: StockProduct) {
  newProductListeners.forEach((listener) => listener(product));
}

// Merges a newly created product into the default ("all", page 1) list cache so a
// fresh mount — or a mount that briefly shows stale cache before its live fetch
// resolves — also sees it immediately. Call this AFTER invalidateStockCache(),
// since that clears the "products:" prefix and would otherwise wipe this merge.
export async function mergeNewProductIntoCache(product: StockProduct): Promise<void> {
  const key = cacheKey("", 1);
  try {
    const cached = await cacheGet<StockProduct[]>(key);
    if (cached && !cached.some((p) => p.id === product.id)) {
      await cacheSet(key, [product, ...cached], CacheTTL.LONG);
    }
  } catch {
    // No cache yet for this key — nothing to merge; next normal load will fetch fresh.
  }
}
// -----------------------------------------------------------------------------------

export function useStockList(search?: string) {
  const [data, setData] = useState<StockProduct[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const searchRef = useRef(search);
  searchRef.current = search;

  const loadPage = useCallback(async (p: number, append = false) => {
    const searchVal = searchRef.current || "";
    if (append) setIsFetchingMore(true);
    else { setIsLoading(true); if (!append) setData([]); setError(null); }
    try {
      const res = await api.products.list({ search: searchVal, page: p, pageSize: PAGE_SIZE });
      const mapped = (res.items ?? [])
        .map((item, i) => mapApiProduct(item as Parameters<typeof mapApiProduct>[0], (p - 1) * PAGE_SIZE + i))
        .filter((item: StockProduct, idx: number, arr: StockProduct[]) => arr.findIndex((x) => x.id === item.id) === idx);
      cacheSet(cacheKey(searchVal, p), mapped, CacheTTL.LONG).catch(() => {});
      if (p === 1) {
        setData(mapped);
        setTotal(res.total ?? mapped.length);
      } else {
        setData((prev) => {
          const existingIds = new Set(prev.map((x) => x.id));
          return [...prev, ...mapped.filter((x) => !existingIds.has(x.id))];
        });
      }
      setPage(p);
      setError(null);
      setStale(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
      if (!append) setData([]);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  const prefetchRemainingPages = useCallback(async (currentTotal: number, fromPage: number) => {
    const totalPages = Math.ceil(currentTotal / PAGE_SIZE);
    const searchVal = searchRef.current || "";
    const promises: Promise<void>[] = [];
    for (let p = fromPage + 1; p <= totalPages; p++) {
      promises.push(
        cacheGet<StockProduct[]>(cacheKey(searchVal, p)).then((cached) => {
          if (cached) return;
          api.products.list({ search: searchVal, page: p, pageSize: PAGE_SIZE }).then((res) => {
            const mapped = (res.items ?? []).map((item, i) => mapApiProduct(item as Parameters<typeof mapApiProduct>[0], (p - 1) * PAGE_SIZE + i));
            cacheSet(cacheKey(searchVal, p), mapped, CacheTTL.LONG).catch(() => {});
          }).catch(() => {});
        })
      );
    }
    await Promise.allSettled(promises);
  }, []);

  // SWR: load from cache instantly, then fetch
  useEffect(() => {
    let cancelled = false;
    const searchVal = search || "";

    (async () => {
      // Show cached data instantly
      const [cached, staleData] = await cacheGetStale<StockProduct[]>(cacheKey(searchVal, 1));
      if (cached && !cancelled) {
        const seen = new Set<string>();
        const unique = cached.filter((p: StockProduct) => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
        setData(unique);
        setTotal(unique.length);
        setIsLoading(false);
        setStale(true);

        if (!staleData) return; // Data is fresh, skip API

        // Stale — revalidate in background (suppress global overlay)
        suppressGlobalLoading();
        try {
          await loadPage(1);
        } finally {
          unsuppressGlobalLoading();
        }
      } else {
        // No cache — load with global overlay tracking
        loadPage(1).catch(() => { if (!cancelled) setIsLoading(false); });
      }
    })();

    return () => { cancelled = true; };
  }, [search]); // Re-fetch when search changes

  // Subscribe this instance to instant "new product" broadcasts so any screen
  // using this hook updates immediately when a product is created anywhere in
  // the app (e.g. from AddStockScreen), without a refetch/navigation/reload.
  useEffect(() => {
    const listener: NewProductListener = (product) => {
      const term = (searchRef.current || "").trim().toLowerCase();
      const matches = !term || product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term);
      if (!matches) return; // doesn't match this instance's active search/filter
      setData((prev) => {
        if (prev.some((p) => p.id === product.id)) return prev; // prevent duplicates
        return [product, ...prev];
      });
      setTotal((prev) => prev + 1);
    };
    newProductListeners.add(listener);
    return () => { newProductListeners.delete(listener); };
  }, []);

  const hasMore = data.length < total;
  const loadMore = useCallback(() => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    const searchVal = searchRef.current || "";
    cacheGet<StockProduct[]>(cacheKey(searchVal, nextPage)).then((cached) => {
      if (cached) {
        setData((prev) => {
          const existingIds = new Set(prev.map((x) => x.id));
          return [...prev, ...cached.filter((x) => !existingIds.has(x.id))];
        });
        setPage(nextPage);
        setIsFetchingMore(false);
        prefetchRemainingPages(total, nextPage);
        return;
      }
      loadPage(nextPage, true);
    });
  }, [isFetchingMore, hasMore, page, total, loadPage, prefetchRemainingPages]);

  return { data, isLoading, isFetchingMore, hasMore, loadMore, error, stale, refresh: () => loadPage(1) };
}