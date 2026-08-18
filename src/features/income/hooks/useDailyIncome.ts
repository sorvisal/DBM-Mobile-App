import { useCallback, useEffect, useState } from "react";
import { api, cacheGetStale, cacheSet, CacheTTL, suppressGlobalLoading, unsuppressGlobalLoading } from "@/services";
import type { DailyIncomeSummary, IncomeOrderStatus } from "../types/income.types";

const ERROR_MESSAGE = "មិនអាចទាញយកទិន្នន័យបាន";

function cacheKeyForDate(date: string): string {
  return `income:daily:${date}`;
}

function buildSummary(date: string, orders: { id: string; code: string; customerId: string; customerName: string; totalAmount: number; paidAmount: number; status: string; createdAt: string }[]) {
  const targetDate = new Date(date);
  const dayOrders = orders
    .filter((o) => {
      const d = new Date(o.createdAt);
      return d.toDateString() === targetDate.toDateString() && o.status === "completed";
    })
    .filter((o, idx, arr) => arr.findIndex((x) => x.id === o.id) === idx);

  const totalIncome = dayOrders.reduce((s, o) => s + o.totalAmount, 0);

  return {
    date,
    totalIncome,
    orderCount: dayOrders.length,
    orders: dayOrders.map((o) => ({
      id: o.id,
      code: o.code,
      time: new Date(o.createdAt).toLocaleTimeString(),
      customerCode: o.customerId,
      customerName: o.customerName,
      amount: o.totalAmount,
      status: o.status as IncomeOrderStatus,
    })),
    cashCollected: dayOrders.reduce((s, o) => s + o.paidAmount, 0),
    discount: 0,
    otherExpense: 0,
    netTotal: totalIncome,
  };
}

export function useDailyIncome(date: string) {
  const [summary, setSummary] = useState<DailyIncomeSummary>({
    date,
    totalIncome: 0,
    orderCount: 0,
    orders: [],
    cashCollected: 0,
    discount: 0,
    otherExpense: 0,
    netTotal: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    (isRefresh: boolean) => {
      let cancelled = false;
      setError(null);
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const key = cacheKeyForDate(date);

      (async () => {
        try {
          // Check stale cache first for instant display
          const [cached, stale] = await cacheGetStale<DailyIncomeSummary>(key);
          if (cached && !cancelled) {
            setSummary(cached);
            setIsLoading(false);
            if (!stale) return;

            // Stale — revalidate in background (suppress global overlay)
            suppressGlobalLoading();
            try {
              const res = await api.orders.list({ page: 1, pageSize: 100 });
              if (cancelled) return;
              const result = buildSummary(date, res.items ?? []);
              setSummary(result);
              setError(null);
              await cacheSet(key, result, CacheTTL.MEDIUM).catch(() => {});
            } catch {
              // keep stale data on background error
            } finally {
              unsuppressGlobalLoading();
            }
          } else {
            // No cache — fetch with global overlay tracking
            const res = await api.orders.list({ page: 1, pageSize: 100 });
            if (cancelled) return;
            const result = buildSummary(date, res.items ?? []);
            setSummary(result);
            setError(null);
            await cacheSet(key, result, CacheTTL.MEDIUM).catch(() => {});
          }
        } catch {
          if (cancelled) return;
          setSummary({ date, totalIncome: 0, orderCount: 0, orders: [], cashCollected: 0, discount: 0, otherExpense: 0, netTotal: 0 });
          setError(ERROR_MESSAGE);
        } finally {
          if (!cancelled) {
            if (isRefresh) setIsRefreshing(false);
            else setIsLoading(false);
          }
        }
      })();

      return () => { cancelled = true; };
    },
    [date]
  );

  useEffect(() => load(false), [load]);

  const refresh = useCallback(() => {
    load(true);
  }, [load]);

  return { summary, isLoading, isRefreshing, error, refresh };
}
