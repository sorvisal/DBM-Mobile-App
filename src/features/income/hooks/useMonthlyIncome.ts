import { useCallback, useEffect, useRef, useState } from "react";
import {
  api,
  suppressGlobalLoading,
  unsuppressGlobalLoading,
} from "@/services";
import type { MonthlyIncomeSummary } from "../types/income.types";
import { useDebtors } from "./useDebtors";
import {
  filterOrdersByMonth,
  type IncomeOrderSource,
} from "./incomeOrders";

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
      orders: [],
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
      orders: [],
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

        /*
         * Fetch the revenue chart AND the order list together. Each call is
         * guarded individually so one slow endpoint does not blank the whole
         * month screen.
         */
        const [points, orderResponse] = await Promise.all([
          api.reports.monthlyRevenueChart(month),

          api.orders
            .list({ page: 1, pageSize: 100 })
            .catch(() => ({ items: [] })),
        ]);

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

        /*
         * =====================================================
         * MONTHLY ORDERS
         * =====================================================
         *
         * The API order shape is FLAT (`customerName` string). Filter to the
         * selected month, keep only COMPLETED orders (income), dedupe by id,
         * then map to the shared IncomeOrder shape with safe defaults.
         */
        const monthKey = `${String(monthValue).padStart(
          2,
          "0"
        )}/${yearValue}`;

        const rawOrders = (orderResponse?.items ??
          []) as IncomeOrderSource[];

        const orders = filterOrdersByMonth(
          rawOrders,
          monthKey
        );

        if (__DEV__) {
          console.log(
            "[MonthlyIncome] Completed orders for month:",
            orders.length
          );

          console.log(
            "[MonthlyIncome] Orders:",
            orders.map((order) => ({
              id: order.id,
              code: order.code,
              customerName: order.customerName,
              amount: order.amount,
            }))
          );
        }

        setSummary({
          month,
          totalIncome,
          orderCount: orders.length,
          dailyChart: chart,
          orders,
          debtors: debtorsRef.current.allDebtors,
          totalDebt: debtorsRef.current.totalDebt,
        });

        if (__DEV__) {
          console.log("[MonthlyIncome] Updated:", {
            month,
            totalIncome,
            points: chart.length,
            orderCount: orders.length,
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
          orders: [],
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