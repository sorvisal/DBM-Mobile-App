import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { api } from "@/services";

import type {
  Order,
} from "@/types/api";

import type {
  ChartPoint,
  IncomeOverview,
} from "../types/income.types";

import { useDebtors } from "./useDebtors";

/* =========================================================
   TYPES
========================================================= */

type RevenuePoint = {
  label?: string;
  date?: string;
  revenue?: number;
  amount?: number;
};

/* =========================================================
   EMPTY OVERVIEW
========================================================= */

const EMPTY_OVERVIEW: IncomeOverview = {
  todayIncome: 0,
  todayDate: "",
  monthIncome: 0,
  monthLabel: "",
  monthGrowthPercent: 0,
  yearIncome: 0,
  yearLabel: "",
  yearGrowthPercent: 0,
  totalDebt: 0,
  debtorCount: 0,
  weeklyChart: [],
  topDebtors: [],
};

/* =========================================================
   TODAY DATE
========================================================= */

function formatTodayDate(): string {
  const today = new Date();

  return `${String(
    today.getDate()
  ).padStart(2, "0")}/${String(
    today.getMonth() + 1
  ).padStart(2, "0")}/${today.getFullYear()}`;
}

/* =========================================================
   GET TODAY KEY
========================================================= */

/**
 * Returns today's local date as:
 *
 * YYYY-MM-DD
 *
 * Example:
 *
 * 2026-08-28
 */
function getTodayKey(): string {
  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      today.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =========================================================
   API DATE KEY
========================================================= */

/**
 * IMPORTANT:
 *
 * Do NOT use:
 *
 * new Date(value)
 *
 * for comparing order dates.
 *
 * This avoids timezone shifting.
 *
 * Example:
 *
 * 2026-08-28T03:30:00Z
 *
 * becomes:
 *
 * 2026-08-28
 */
function getApiDateKey(
  value?: string | null
): string {
  if (!value) {
    return "";
  }

  const text =
    String(value).trim();

  const match =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (!match) {
    return "";
  }

  const [
    ,
    year,
    month,
    day,
  ] = match;

  return `${year}-${month}-${day}`;
}

/* =========================================================
   CHECK COMPLETED
========================================================= */

function isCompletedOrder(
  order: Order
): boolean {
  return (
    String(
      order.status ?? ""
    ).toLowerCase() ===
    "completed"
  );
}

/* =========================================================
   GET TODAY INCOME
========================================================= */

/**
 * SAME LOGIC AS DASHBOARD
 *
 * Today Income =
 *
 * Today's completed orders
 *        ↓
 * SUM(totalAmount)
 */
function getTodayIncome(
  orders: Order[]
): number {
  const todayKey =
    getTodayKey();

  const todayCompletedOrders =
    orders.filter(
      (order) =>
        getApiDateKey(
          order.createdAt
        ) === todayKey &&
        isCompletedOrder(order)
    );

  const total =
    todayCompletedOrders.reduce(
      (
        sum,
        order
      ) =>
        sum +
        Number(
          order.totalAmount ?? 0
        ),
      0
    );

  if (__DEV__) {
    console.log(
      "[INCOME] Today:",
      todayKey
    );

    console.log(
      "[INCOME] Today's completed orders:",
      todayCompletedOrders.length
    );

    console.log(
      "[INCOME] Today income:",
      total
    );
  }

  return total;
}

function mapChart(
  points: RevenuePoint[]
): ChartPoint[] {
  return points.map(
    (point) => ({
      label:
        point.label ??
        point.date ??
        "",

      amount:
        Number(
          point.revenue ??
          point.amount ??
          0
        ),
    })
  );
}

export function useIncomeSummary(): {
  overview: IncomeOverview;
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const {
    allDebtors,
    totalDebt,
    debtorCount,
  } =
    useDebtors();

  const [
    overview,
    setOverview,
  ] =
    useState<IncomeOverview>(
      EMPTY_OVERVIEW
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const load =
    useCallback(async () => {
      try {
        setIsLoading(true);
        const [
          monthRevenue,
          chartResponse,
          orderResponse,
        ] =
          await Promise.all([

            api.reports.revenue(
              "thisMonth"
            ),

            api.reports
              .revenueChart("7")
              .catch(() => []),

            api.orders.list({
              page: 1,
              pageSize: 100,
            }),
          ]);

        const rawPoints =
          (chartResponse ??
            []) as unknown as RevenuePoint[];

        console.log(
          "[INCOME] Revenue chart:",
          rawPoints
        );

        const weeklyChart =
          mapChart(
            rawPoints
          );

        const orders =
          orderResponse?.items ??
          [];

        const todayIncome =
          getTodayIncome(
            orders
          );

        console.log(
          "[INCOME] Today income:",
          todayIncome
        );

        const monthIncome =
          Number(
            monthRevenue?.totalRevenue ??
              0
          );

        const now =
          new Date();

        const currentMonth =
          now.getMonth() + 1;

        const currentYear =
          now.getFullYear();

        setOverview({
          todayIncome,

          todayDate:
            formatTodayDate(),
          monthIncome,

          monthLabel:
            `${currentMonth}/${currentYear}`,

          monthGrowthPercent:
            0,
          yearIncome:
            monthIncome,

          yearLabel:
            String(
              currentYear
            ),

          yearGrowthPercent:
            0,

          totalDebt:
            Number(
              totalDebt ?? 0
            ),

          debtorCount:
            Number(
              debtorCount ?? 0
            ),
          weeklyChart,

          topDebtors:
            allDebtors.slice(
              0,
              3
            ),
        });
      } catch (error) {
        console.error(
          "[INCOME] Failed:",
          error
        );

        setOverview({
          ...EMPTY_OVERVIEW,

          todayDate:
            formatTodayDate(),

          totalDebt:
            Number(
              totalDebt ?? 0
            ),

          debtorCount:
            Number(
              debtorCount ?? 0
            ),

          topDebtors:
            allDebtors.slice(
              0,
              3
            ),
        });
      } finally {
        setIsLoading(
          false
        );
      }
    }, [
      allDebtors,
      totalDebt,
      debtorCount,
    ]);
  useEffect(() => {
    load();
  }, [load]);
  const refresh =
    useCallback(async () => {
      await load();
    }, [load]);
  return {
    overview,
    isLoading,
    refresh,
  };
}