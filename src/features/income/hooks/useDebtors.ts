import { useState, useCallback, useEffect } from "react";
import { api, cacheGet, cacheGetStale, cacheSet, CacheTTL, suppressGlobalLoading, unsuppressGlobalLoading } from "@/services";
import type { Debtor } from "../types/income.types";

const PAGE_SIZE = 20;
const CACHE_KEY = "debtors:list";
const STALE_TTL = CacheTTL.LONG;
const AVATAR_COLORS = ["#2563EB", "#EA580C", "#16A34A", "#9333EA", "#CA8A04", "#DC2626"];

function getInitials(name: string) {
  return name.trim().split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function mapDebtor(c: { customerId: string; customerName: string; balance: number; phone?: string }, index: number): Debtor {
  return {
    id: c.customerId,
    code: `CUS-${c.customerId}`,
    name: c.customerName,
    initials: getInitials(c.customerName),
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    phone: c.phone ?? "",
    amount: c.balance,
    dueDate: new Date().toLocaleDateString(),
  };
}

export function useDebtors() {
  const [allDebtors, setAllDebtors] = useState<Debtor[]>([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [debtorCount, setDebtorCount] = useState(0);
  const [displayedPage, setDisplayedPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [stale, setStale] = useState(false);

  const loadPage = useCallback(async (p: number, append = false) => {
    if (append) setIsFetchingMore(true);
    else { setIsLoading(true); setAllDebtors([]); }
    try {
      const res = await api.reports.receivables();
      const seen = new Set<string>();
      const all = (res.customers ?? [])
        .map((c, i) => mapDebtor(c, i))
        .filter((d) => { if (seen.has(d.id)) return false; seen.add(d.id); return true; });
      const pageData = all.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
      if (p === 1) setAllDebtors(pageData);
      else {
        const existingIds = new Set(allDebtors.map((d) => d.id));
        setAllDebtors((prev) => [...prev, ...pageData.filter((d) => !existingIds.has(d.id))]);
      }
      setTotalDebt(res.totalReceivable);
      setDebtorCount(all.length);
      setDisplayedPage(p);
      setStale(false);
      if (p === 1) cacheSet(CACHE_KEY, all, STALE_TTL).catch(() => {});
    } catch {
      if (!append) { setAllDebtors([]); setTotalDebt(0); setDebtorCount(0); }
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Restore from cache instantly (SWR)
      const [cached, stale] = await cacheGetStale<Debtor[]>(CACHE_KEY);
      if (cached && !cancelled) {
        const seen = new Set<string>();
        const unique = cached.filter((d) => { if (seen.has(d.id)) return false; seen.add(d.id); return true; });
        setAllDebtors(unique);
        setDebtorCount(unique.length);
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

  const hasMore = allDebtors.length < debtorCount;
  const loadMore = useCallback(() => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = displayedPage + 1;
    // Try cache first
    cacheGet<Debtor[]>(CACHE_KEY).then((cached) => {
      if (cached && cached.length >= nextPage * PAGE_SIZE) {
        // All data in cache — just extend the view
        const nextPageData = cached
          .slice((nextPage - 1) * PAGE_SIZE, nextPage * PAGE_SIZE)
          .filter((d) => !allDebtors.some((prev) => prev.id === d.id));
        setAllDebtors((prev) => [...prev, ...nextPageData]);
        setDisplayedPage(nextPage);
        setIsFetchingMore(false);
        return;
      }
      loadPage(nextPage, true);
    });
  }, [isFetchingMore, hasMore, displayedPage, loadPage]);

  return { allDebtors, totalDebt, debtorCount, isLoading, isFetchingMore, hasMore, loadMore, stale };
}

export function getDebtors() {
  return [];
}
