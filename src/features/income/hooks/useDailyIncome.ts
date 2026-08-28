import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  api,
  cacheGetStale,
  cacheSet,
  CacheTTL,
  suppressGlobalLoading,
  unsuppressGlobalLoading,
} from "@/services";

import type {
  DailyIncomeSummary,
  IncomeOrderStatus,
} from "../types/income.types";

const ERROR_MESSAGE =
  "មិនអាចទាញយកទិន្នន័យបាន";

/* =========================================================
   DATE HELPERS
========================================================= */

/**
 * Extract YYYY-MM-DD directly from API ISO date.
 *
 * Example:
 *
 * 2026-08-28T03:30:00Z
 *              ↓
 * 2026-08-28
 *
 * IMPORTANT:
 * We DO NOT use new Date() here.
 *
 * This prevents timezone conversion from changing
 * the calendar date.
 */
function getApiDateKey(
  value: string
): string {
  if (!value) {
    return "";
  }

  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (!match) {
    return "";
  }

  const [, year, month, day] = match;

  return `${year}-${month}-${day}`;
}

/**
 * Convert DD/MM/YYYY to YYYY-MM-DD.
 *
 * Example:
 *
 * 28/08/2026
 *       ↓
 * 2026-08-28
 */
function displayDateToApiKey(
  date: string
): string {
  if (!date) {
    return "";
  }

  const parts = date.split("/");

  if (parts.length !== 3) {
    return "";
  }

  const [
    day,
    month,
    year,
  ] = parts;

  if (
    !day ||
    !month ||
    !year
  ) {
    return "";
  }

  return `${year}-${month}-${day}`;
}

/**
 * Convert DD/MM/YYYY to a local Date.
 *
 * Used only when we need a Date object
 * for fallback/display purposes.
 */
function parseDisplayDate(
  date: string
): Date {
  const parts = date.split("/");

  if (parts.length === 3) {
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);

    if (
      Number.isFinite(day) &&
      Number.isFinite(month) &&
      Number.isFinite(year)
    ) {
      return new Date(
        year,
        month - 1,
        day
      );
    }
  }

  /*
   * Fallback for ISO dates.
   */
  const parsed = new Date(date);

  if (
    !Number.isNaN(
      parsed.getTime()
    )
  ) {
    return new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate()
    );
  }

  /*
   * Last fallback.
   */
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
}

/**
 * Format Date -> DD/MM/YYYY
 */
function formatDisplayDate(
  date: Date
): string {
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const year =
    date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format API ISO date for Daily Income card.
 *
 * Example:
 *
 * 2026-08-28T03:30:00Z
 *
 * becomes:
 *
 * 28/08/2026 03:30
 *
 * No timezone conversion is performed.
 */
function formatOrderDate(
  value: string
): string {
  if (!value) {
    return "-";
  }

  const dateMatch =
    String(value).match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (!dateMatch) {
    return "-";
  }

  const [
    ,
    year,
    month,
    day,
  ] = dateMatch;

  const timeMatch =
    String(value).match(
      /T(\d{2}):(\d{2})/
    );

  if (!timeMatch) {
    return `${day}/${month}/${year}`;
  }

  const [
    ,
    hours,
    minutes,
  ] = timeMatch;

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Get only time from API date.
 *
 * Example:
 *
 * 2026-08-28T03:30:00Z
 *
 * -> 03:30
 */
function formatOrderTime(
  value: string
): string {
  if (!value) {
    return "-";
  }

  const match =
    String(value).match(
      /T(\d{2}):(\d{2})/
    );

  if (!match) {
    return "-";
  }

  const [
    ,
    hours,
    minutes,
  ] = match;

  return `${hours}:${minutes}`;
}

/* =========================================================
   CACHE
========================================================= */

function cacheKeyForDate(
  date: string
): string {
  return `income:daily:${date}`;
}

/* =========================================================
   API ORDER
========================================================= */

type ApiOrder = {
  id: string | number;
  code: string;
  customerId: string | number;
  customerName: string;
  totalAmount: number;
  paidAmount?: number | null;
  status: string;
  createdAt: string;
};

/* =========================================================
   STATUS
========================================================= */

function normalizeIncomeStatus(
  status: string
): IncomeOrderStatus {
  switch (
    String(status).toLowerCase()
  ) {
    case "completed":
      return "completed";

    case "shipping":
    case "delivering":
    case "outfordelivery":
      return "shipping";

    case "cancelled":
    case "canceled":
      return "cancelled";

    default:
      /*
       * Pending / Confirmed are not income.
       *
       * Income is counted only when
       * the order is completed.
       */
      return "shipping";
  }
}

/* =========================================================
   DATE MATCH
========================================================= */

/**
 * Compare API order date with selected date.
 *
 * IMPORTANT:
 *
 * Both dates are compared as strings:
 *
 * API:
 * 2026-08-28
 *
 * Selected:
 * 2026-08-28
 *
 * No timezone conversion.
 */
function isSameSelectedDay(
  createdAt: string,
  selectedDate: string
): boolean {
  const orderDate =
    getApiDateKey(createdAt);

  const selectedDateKey =
    displayDateToApiKey(
      selectedDate
    );

  if (
    !orderDate ||
    !selectedDateKey
  ) {
    return false;
  }

  return (
    orderDate ===
    selectedDateKey
  );
}

/* =========================================================
   BUILD SUMMARY
========================================================= */

function buildSummary(
  date: string,
  orders: ApiOrder[]
): DailyIncomeSummary {
  /*
   * Keep the selected date.
   */
  const targetDate =
    parseDisplayDate(date);

  const normalizedDate =
    formatDisplayDate(
      targetDate
    );

  /*
   * =======================================================
   * FILTER ORDERS BY EXACT API DATE
   * =======================================================
   *
   * Only COMPLETED orders are income.
   */
  const dayOrders = orders
    .filter((order) =>
      isSameSelectedDay(
        order.createdAt,
        date
      )
    )
    .filter(
      (order) =>
        String(
          order.status
        ).toLowerCase() ===
        "completed"
    )
    .filter(
      (order, index, array) =>
        array.findIndex(
          (item) =>
            String(item.id) ===
            String(order.id)
        ) === index
    );

  /*
   * =======================================================
   * TOTAL DAY INCOME
   * =======================================================
   *
   * Example:
   *
   * Order 1 = $10
   * Order 2 = $2.50
   *
   * Total = $12.50
   */
  const totalIncome =
    dayOrders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.totalAmount ?? 0
        ),
      0
    );

  /*
   * =======================================================
   * CASH COLLECTED
   * =======================================================
   */
  const cashCollected =
    dayOrders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.paidAmount ?? 0
        ),
      0
    );

  /*
   * =======================================================
   * RETURN
   * =======================================================
   */

  return {
    date:
      normalizedDate,

    totalIncome,

    orderCount:
      dayOrders.length,

    orders:
      dayOrders.map(
        (order) => ({
          id: String(
            order.id
          ),

          code:
            order.code ||
            `#${order.id}`,

          /*
           * FIXED:
           *
           * Use the API date directly.
           *
           * This guarantees:
           *
           * 28/08/2026
           *
           * instead of accidentally
           * displaying another year.
           */
          time:
            formatOrderDate(
              order.createdAt
            ),

          customerCode:
            String(
              order.customerId
            ),

          customerName:
            order.customerName ??
            "",

          amount:
            Number(
              order.totalAmount ??
                0
            ),

          status:
            normalizeIncomeStatus(
              order.status
            ),
        })
      ),

    cashCollected,

    /*
     * These fields are not currently
     * provided by the Order API.
     */
    discount: 0,

    otherExpense: 0,

    /*
     * Net total.
     */
    netTotal:
      totalIncome,
  };
}

/* =========================================================
   EMPTY SUMMARY
========================================================= */

const EMPTY_SUMMARY = (
  date: string
): DailyIncomeSummary => ({
  date,
  totalIncome: 0,
  orderCount: 0,
  orders: [],
  cashCollected: 0,
  discount: 0,
  otherExpense: 0,
  netTotal: 0,
});

/* =========================================================
   HOOK
========================================================= */

export function useDailyIncome(
  date: string
) {
  const [
    summary,
    setSummary,
  ] =
    useState<DailyIncomeSummary>(
      EMPTY_SUMMARY(date)
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(null);

  /* =======================================================
     LOAD DAILY INCOME
  ======================================================= */

  const load =
    useCallback(
      async (
        isRefresh: boolean
      ) => {
        if (!date) {
          setSummary(
            EMPTY_SUMMARY("")
          );

          setIsLoading(false);
          setIsRefreshing(false);

          return;
        }

        let cancelled = false;

        setError(null);

        if (isRefresh) {
          setIsRefreshing(true);

          suppressGlobalLoading();
        } else {
          setIsLoading(true);
        }

        const cacheKey =
          cacheKeyForDate(date);

        try {
          /* =================================================
             CACHE
          ================================================= */

          const [
            cached,
            stale,
          ] =
            await cacheGetStale<DailyIncomeSummary>(
              cacheKey
            );

          if (cancelled) {
            return;
          }

          if (cached) {
            setSummary(cached);

            setIsLoading(false);

            /*
             * Fresh cache.
             */
            if (!stale) {
              return;
            }

            /*
             * Stale cache:
             * keep displaying it while API loads.
             */
            suppressGlobalLoading();
          }

          /* =================================================
             API
          ================================================= */

          const response =
            await api.orders.list({
              page: 1,
              pageSize: 100,
            });

          if (cancelled) {
            return;
          }

          const orders =
            (response.items ??
              []) as ApiOrder[];

          /* =================================================
             BUILD DAILY SUMMARY
          ================================================= */

          const result =
            buildSummary(
              date,
              orders
            );

          if (cancelled) {
            return;
          }

          setSummary(result);

          setError(null);

          /* =================================================
             CACHE RESULT
          ================================================= */

          await cacheSet(
            cacheKey,
            result,
            CacheTTL.MEDIUM
          ).catch(() => {});

          /* =================================================
             DEBUG
          ================================================= */

          if (__DEV__) {
            console.log(
              "[DAILY INCOME] Selected date:",
              date
            );

            console.log(
              "[DAILY INCOME] API date:",
              displayDateToApiKey(
                date
              )
            );

            console.log(
              "[DAILY INCOME] Orders:",
              orders.map(
                (order) => ({
                  id: order.id,
                  code: order.code,
                  createdAt:
                    order.createdAt,
                  status:
                    order.status,
                  totalAmount:
                    order.totalAmount,
                })
              )
            );

            console.log(
              "[DAILY INCOME] Matching orders:",
              result.orders
            );

            console.log(
              "[DAILY INCOME] Total income:",
              result.totalIncome
            );
          }
        } catch (err) {
          if (cancelled) {
            return;
          }

          console.error(
            "[DAILY INCOME] Failed to load:",
            err
          );

          /*
           * Don't destroy existing
           * cached/displayed data.
           */
          setSummary(
            (current) =>
              current.orders.length >
              0
                ? current
                : EMPTY_SUMMARY(
                    date
                  )
          );

          setError(
            ERROR_MESSAGE
          );
        } finally {
          if (!cancelled) {
            if (isRefresh) {
              unsuppressGlobalLoading();

              setIsRefreshing(
                false
              );
            } else {
              setIsLoading(
                false
              );
            }
          }
        }
      },
      [date]
    );

  /* =======================================================
     DATE CHANGED
  ======================================================= */

  useEffect(() => {
    load(false);
  }, [load]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh =
    useCallback(() => {
      load(true);
    }, [load]);

  /* =======================================================
     RETURN
  ======================================================= */

  return {
    summary,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}