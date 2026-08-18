import { useCallback, useEffect, useRef, useState } from "react";
import { api, suppressGlobalLoading, unsuppressGlobalLoading } from "@/services";
import type { MonthlyIncomeSummary } from "../types/income.types";
import { useDebtors } from "./useDebtors";

const ERROR_MESSAGE = "មិនអាចទាញយកទិន្នន័យបាន";

export function useMonthlyIncome(month: string) {
  const { allDebtors, totalDebt, isLoading: debtorsLoading } = useDebtors();
  const [summary, setSummary] = useState<MonthlyIncomeSummary>({
    month,
    totalIncome: 0,
    orderCount: 0,
    dailyChart: [],
    debtors: allDebtors,
    totalDebt,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debtorsRef = useRef({ allDebtors, totalDebt });
  debtorsRef.current = { allDebtors, totalDebt };

  const load = useCallback(
    (isRefresh: boolean) => {
      let cancelled = false;
      setError(null);
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      // Suppress global overlay for refresh (pull-to-refresh uses its own UI)
      if (isRefresh) suppressGlobalLoading();

      api.reports
        .revenueChart("30d")
        .then((points) => {
          if (cancelled) return;
          const chart = points.map((p) => ({ label: p.date, amount: p.revenue }));
          const totalIncome = chart.reduce((s, p) => s + p.amount, 0);
          setSummary({
            month,
            totalIncome,
            orderCount: chart.length,
            dailyChart: chart,
            debtors: debtorsRef.current.allDebtors,
            totalDebt: debtorsRef.current.totalDebt,
          });
          setError(null);
        })
        .catch(() => {
          if (cancelled) return;
          setSummary({ month, totalIncome: 0, orderCount: 0, dailyChart: [], debtors: debtorsRef.current.allDebtors, totalDebt: debtorsRef.current.totalDebt });
          setError(ERROR_MESSAGE);
        })
        .finally(() => {
          if (cancelled) return;
          if (isRefresh) {
            unsuppressGlobalLoading();
            setIsRefreshing(false);
          } else {
            setIsLoading(false);
          }
        });

      return () => { cancelled = true; };
    },
    [month]
  );

  useEffect(() => load(false), [load]);

  useEffect(() => {
    setSummary((prev) => ({ ...prev, debtors: allDebtors, totalDebt }));
  }, [allDebtors, totalDebt]);

  const refresh = useCallback(() => {
    load(true);
  }, [load]);

  return { summary, isLoading: isLoading || debtorsLoading, isRefreshing, error, refresh };
}
