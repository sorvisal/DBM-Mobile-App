import { useCallback, useEffect, useRef, useState } from "react";
import {
  api,
  suppressGlobalLoading,
  unsuppressGlobalLoading,
} from "@/services";
import type { MonthlyIncomeSummary } from "../types/income.types";
import { useDebtors } from "./useDebtors";

const ERROR_MESSAGE = "មិនអាចទាញយកទិន្នន័យបាន";

export function useMonthlyIncome(month: string) {
  const {
    allDebtors,
    totalDebt,
    isLoading: debtorsLoading,
  } = useDebtors();

  const debtorsRef = useRef({
    allDebtors,
    totalDebt,
  });

  debtorsRef.current = {
    allDebtors,
    totalDebt,
  };

  const requestIdRef = useRef(0);

  const [summary, setSummary] =
    useState<MonthlyIncomeSummary>({
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

  const clearMonthData = useCallback(() => {
    setSummary({
      month,
      totalIncome: 0,
      orderCount: 0,
      dailyChart: [],
      debtors: debtorsRef.current.allDebtors,
      totalDebt: debtorsRef.current.totalDebt,
    });
  }, [month]);

  const loadMonth = useCallback(
    async (isRefresh = false) => {
      const requestId = ++requestIdRef.current;

      if (isRefresh) {
        setIsRefreshing(true);
        suppressGlobalLoading();
      } else {
        setIsLoading(true);
      }

      setError(null);
      clearMonthData();

      try {
        const [monthValue, yearValue] = month
          .split("/")
          .map(Number);

        if (
          !monthValue ||
          !yearValue ||
          monthValue < 1 ||
          monthValue > 12
        ) {
          throw new Error(`Invalid month: ${month}`);
        }

        if (__DEV__) {
          console.log(
            "[MonthlyIncome] Loading:",
            `${monthValue}/${yearValue}`
          );

          console.log("[MonthlyIncome] Request params:", {
            month: monthValue,
            year: yearValue,
          });
        }

        const points =
          await api.reports.monthlyRevenueChart(month);

        if (requestId !== requestIdRef.current) {
          return;
        }

          const chart = (points ?? []).map((point) => ({
        label: String(point.date),
        amount: Number(point.revenue) || 0,
      }));

        if (__DEV__) {
          console.log(
            "[MonthlyIncome] Response labels:",
            chart.map((point) => point.label)
          );
        }

        const totalIncome = chart.reduce(
          (sum, point) => sum + point.amount,
          0
        );

        setSummary({
          month,
          totalIncome,
          orderCount: chart.filter(
            (point) => point.amount > 0
          ).length,
          dailyChart: chart,
          debtors: debtorsRef.current.allDebtors,
          totalDebt: debtorsRef.current.totalDebt,
        });

        if (__DEV__) {
          console.log("[MonthlyIncome] Updated:", {
            month,
            totalIncome,
            points: chart.length,
            chart,
          });
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        console.error(
          "[MonthlyIncome] Error:",
          err
        );

        setSummary({
          month,
          totalIncome: 0,
          orderCount: 0,
          dailyChart: [],
          debtors: debtorsRef.current.allDebtors,
          totalDebt: debtorsRef.current.totalDebt,
        });

        setError(ERROR_MESSAGE);
      } finally {
        if (requestId !== requestIdRef.current) {
          return;
        }

        if (isRefresh) {
          unsuppressGlobalLoading();
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [month, clearMonthData]
  );

  useEffect(() => {
    loadMonth(false);

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadMonth]);

  useEffect(() => {
    setSummary((previous) => ({
      ...previous,
      debtors: allDebtors,
      totalDebt,
    }));
  }, [allDebtors, totalDebt]);

  const refresh = useCallback(() => {
    return loadMonth(true);
  }, [loadMonth]);

  return {
    summary,
    isLoading: isLoading || debtorsLoading,
    isRefreshing,
    error,
    refresh,
  };
}