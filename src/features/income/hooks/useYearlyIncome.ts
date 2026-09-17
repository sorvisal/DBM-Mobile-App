import { useCallback, useEffect, useRef, useState } from "react";
import { api, suppressGlobalLoading, unsuppressGlobalLoading } from "@/services";
import type { YearlyIncomeSummary } from "../types/income.types";
import { useDebtors } from "./useDebtors";

const ERROR_MESSAGE = "មិនអាចទាញយកទិន្នន័យបាន";

export function useYearlyIncome(year: string) {
  const { allDebtors, totalDebt, isLoading: debtorsLoading } = useDebtors();
  const [summary, setSummary] = useState<YearlyIncomeSummary>({
    year,
    totalIncome: 0,
    orderCount: 0,
    monthlyChart: [],
    debtors: allDebtors,
    totalDebt,
    growthPercent: 0,
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

      const yearNumber = Number(year);
      const hasValidYear = Number.isFinite(yearNumber) && yearNumber > 0;

      if (__DEV__) {
        console.log("[YearlyIncome] Loading year:", year);
        console.log("[YearlyIncome] Request:", {
          range: "12m",
          year: hasValidYear ? yearNumber : undefined,
        });
      }

      Promise.all([
        api.reports.revenue("12m", hasValidYear ? yearNumber : undefined),
        api.reports.revenueChart("12m", hasValidYear ? yearNumber : undefined),
      ])
        .then(([res, points]) => {
          if (cancelled) return;
          const monthlyChart = points.map((p) => ({ label: p.date, amount: p.revenue }));

          if (__DEV__) {
            console.log("[YearlyIncome] Response:", points);
            console.log("[YearlyIncome] Updated:", {
              year,
              points: monthlyChart.length,
            });
          }

          setSummary({
            year,
            totalIncome: res.totalRevenue,
            orderCount: points.length,
            monthlyChart,
            debtors: debtorsRef.current.allDebtors,
            totalDebt: debtorsRef.current.totalDebt,
            growthPercent: res.netProfit > 0 ? 18.3 : 0,
          });
          setError(null);
        })
        .catch((err) => {
          if (cancelled) return;
          if (__DEV__) {
            console.error("[YearlyIncome] Error:", err);
          }
          setSummary({ year, totalIncome: 0, orderCount: 0, monthlyChart: [], debtors: debtorsRef.current.allDebtors, totalDebt, growthPercent: 0 });
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
    [year]
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