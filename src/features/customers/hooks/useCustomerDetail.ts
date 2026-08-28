import { useCallback, useEffect, useState } from "react";
import {
  api,
  cacheGet,
  cacheSet,
  cacheClearKeySync,
  CacheTTL,
  suppressGlobalLoading,
  unsuppressGlobalLoading,
} from "@/services";
import { resolveMediaUrl } from "@/services/http";
import { CustomerStatus } from "../types/customer.types";

const ERROR_MESSAGE = "មិនអាចទាញយកទិន្នន័យបាន";
const STALE_TTL = CacheTTL.LONG;

/* =========================================================
   TYPES
========================================================= */

export interface CustomerDailyTotal {
  /**
   * Display date:
   * DD/MM/YYYY
   */
  date: string;

  /**
   * Total order amount for this date.
   */
  total: number;
}

export interface FeatureCustomer {
  id: string;
  code: string;
  name: string;
  initials: string;
  avatarColor: string;
  phone: string;
  location: string;
  status: CustomerStatus;

  /**
   * Number of unique orders.
   */
  totalOrders: number;

  /**
   * Total value of all orders.
   *
   * IMPORTANT:
   * This is calculated from order.totalAmount.
   *
   * It is NOT customer.balance.
   */
  totalSpent: number;

  memberSince: string;
  note: string;

  /**
   * Customer order history.
   */
  orders: {
    id: string;
    code: string;
    date: string;
    status: string;
    total: number;
    itemCount: number;
  }[];

  /**
   * Total amount grouped by order date.
   */
  dailyTotals: CustomerDailyTotal[];

  imageUrl?: string | null;
  _photoPath?: string | null;
}

/* =========================================================
   CONSTANTS
========================================================= */

const AVATAR_COLORS = [
  "#2563EB",
  "#EA580C",
  "#16A34A",
  "#9333EA",
  "#CA8A04",
  "#DC2626",
];

/* =========================================================
   HELPERS
========================================================= */

/**
 * Create customer initials.
 *
 * Example:
 *
 * "John Smith" -> "JS"
 * "Dara"       -> "D"
 */
function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Safely convert API values to number.
 */
function toSafeNumber(value: unknown): number {
  const number = Number(value ?? 0);

  return Number.isFinite(number)
    ? number
    : 0;
}

/**
 * Format customer member date.
 *
 * IMPORTANT:
 * We read the date portion directly from
 * the API ISO string instead of relying on
 * JavaScript timezone conversion.
 *
 * Example:
 *
 * 2026-08-28T03:30:00Z
 * -> 28/08/2026
 */
function formatDate(iso: string): string {
  if (!iso) {
    return "-";
  }

  const match = String(iso).match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (!match) {
    return "-";
  }

  const [, year, month, day] = match;

  return `${day}/${month}/${year}`;
}

/**
 * Format order date for Order History.
 *
 * IMPORTANT:
 * DO NOT use:
 *
 * new Date(iso).toLocaleString()
 *
 * because timezone conversion can change
 * the displayed calendar date.
 *
 * API:
 *
 * 2026-08-28T03:30:00Z
 *
 * Result:
 *
 * 28/08/2026 03:30
 */
function formatOrderDate(iso: string): string {
  if (!iso) {
    return "-";
  }

  const dateMatch = String(iso).match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (!dateMatch) {
    return "-";
  }

  const [, year, month, day] =
    dateMatch;

  const timeMatch = String(iso).match(
    /T(\d{2}):(\d{2})/
  );

  const hours =
    timeMatch?.[1] ?? "00";

  const minutes =
    timeMatch?.[2] ?? "00";

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Get date key directly from API.
 *
 * Example:
 *
 * 2026-08-28T03:30:00Z
 *
 * -> 2026-08-28
 *
 * We intentionally DO NOT call new Date()
 * here.
 */
function getDateKey(iso: string): string {
  if (!iso) {
    return "";
  }

  const match = String(iso).match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (!match) {
    return "";
  }

  const [, year, month, day] =
    match;

  return `${year}-${month}-${day}`;
}

/**
 * Convert YYYY-MM-DD to DD/MM/YYYY.
 */
function formatDateKey(
  dateKey: string
): string {
  const match = dateKey.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) {
    return dateKey;
  }

  const [, year, month, day] =
    match;

  return `${day}/${month}/${year}`;
}

/**
 * Remove duplicate orders.
 */
function removeDuplicateOrders<
  T extends {
    id: string | number;
  }
>(orders: T[]): T[] {
  const seen = new Set<string>();

  return orders.filter((order) => {
    const id = String(order.id);

    if (seen.has(id)) {
      return false;
    }

    seen.add(id);

    return true;
  });
}

/**
 * Calculate total customer spending.
 *
 * Example:
 *
 * Order #1 = $12.50
 * Order #2 = $20.00
 * Order #3 = $5.00
 *
 * Total Spend = $37.50
 */
function calculateTotalSpent(
  orders: Array<{
    totalAmount?: number | null;
  }>
): number {
  return orders.reduce(
    (sum, order) => {
      return (
        sum +
        toSafeNumber(
          order.totalAmount
        )
      );
    },
    0
  );
}

/**
 * Calculate daily customer order totals.
 *
 * Example:
 *
 * 28/08/2026
 * Order #1 = $12.50
 * Order #2 = $20.00
 *
 * Total = $32.50
 *
 * 29/08/2026
 * No order
 *
 * There will be no fake order created.
 * The UI can show $0.00 for that date.
 */
function calculateDailyTotals(
  orders: Array<{
    createdAt: string;
    totalAmount?: number | null;
  }>
): CustomerDailyTotal[] {
  const totals =
    new Map<string, number>();

  for (const order of orders) {
    const dateKey =
      getDateKey(order.createdAt);

    if (!dateKey) {
      continue;
    }

    const amount =
      toSafeNumber(
        order.totalAmount
      );

    const current =
      totals.get(dateKey) ?? 0;

    totals.set(
      dateKey,
      current + amount
    );
  }

  return Array.from(
    totals.entries()
  )
    .sort(
      ([dateA], [dateB]) =>
        dateA.localeCompare(dateB)
    )
    .map(
      ([date, total]) => ({
        date: formatDateKey(date),
        total,
      })
    );
}

/* =========================================================
   HOOK
========================================================= */

export function useCustomerDetail(
  customerId: string
) {
  const [
    customer,
    setCustomer,
  ] =
    useState<FeatureCustomer | null>(
      null
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
     LOAD
  ======================================================= */

  const load = useCallback(
    async (
      isRefresh: boolean
    ) => {
      if (!customerId) {
        setCustomer(null);
        setError(null);
        setIsLoading(false);
        setIsRefreshing(false);

        return;
      }

      let cancelled = false;

      setError(null);

      if (isRefresh) {
        setIsRefreshing(true);

        /*
         * Refresh uses its own UI.
         */
        suppressGlobalLoading();
      } else {
        setIsLoading(true);
      }

      const cacheKey =
        `customer:${customerId}`;

      try {
        /* =================================================
           CACHE
        ================================================= */

        /*
         * Only use cached data on initial load.
         *
         * DO NOT clear cache before cacheGet().
         */
        if (!isRefresh) {
          const cached =
            await cacheGet<FeatureCustomer>(
              cacheKey
            );

          if (
            cached &&
            !cancelled
          ) {
            setCustomer(cached);
            setIsLoading(false);
          }
        }

        if (cancelled) {
          return;
        }

        /* =================================================
           CUSTOMER
        ================================================= */

        const response =
          await api.customers.get(
            customerId
          );

        if (cancelled) {
          return;
        }

        /*
         * Support both:
         *
         * { data: customer }
         *
         * and:
         *
         * customer
         */
        const c =
          (response as any)?.data ??
          response;

        /* =================================================
           ORDERS
        ================================================= */

        const orders =
          await api.customers.getOrders(
            customerId
          );

        if (cancelled) {
          return;
        }

        /*
         * Remove duplicate orders.
         */
        const uniqueOrders =
          removeDuplicateOrders(
            orders ?? []
          );

        /* =================================================
           TOTAL ORDERS
        ================================================= */

        const totalOrders =
          uniqueOrders.length;

        /* =================================================
           TOTAL SPEND
        ================================================= */

        /*
         * IMPORTANT:
         *
         * Total Spend =
         * SUM(order.totalAmount)
         *
         * NOT:
         *
         * customer.balance
         * customer.paidAmount
         * customer.remainingAmount
         */
        const totalSpent =
          calculateTotalSpent(
            uniqueOrders
          );

        /* =================================================
           DAILY TOTALS
        ================================================= */

        const dailyTotals =
          calculateDailyTotals(
            uniqueOrders
          );

        /* =================================================
           ORDER HISTORY
        ================================================= */

        const orderHistory =
          uniqueOrders.map(
            (order) => ({
              id: String(
                order.id
              ),

              code:
                order.code ?? "",

              /*
               * FIX:
               * Use direct API date parsing.
               */
              date:
                formatOrderDate(
                  order.createdAt
                ),

              status:
                order.status ?? "",

              total:
                toSafeNumber(
                  order.totalAmount
                ),

              itemCount:
                Array.isArray(
                  order.lines
                )
                  ? order.lines.length
                  : 0,
            })
          );

        /* =================================================
           CUSTOMER ID
        ================================================= */

        const numericCustomerId =
          parseInt(
            String(
              c?.id ??
                customerId
            ),
            10
          ) || 0;

        /* =================================================
           MAPPED CUSTOMER
        ================================================= */

        const mapped:
          FeatureCustomer = {
          id: String(
            c?.id ??
              customerId
          ),

          code:
            `CUS-${
              c?.id ??
              customerId
            }`,

          name:
            c?.name ?? "",

          initials:
            getInitials(
              c?.name ?? ""
            ),

          avatarColor:
            AVATAR_COLORS[
              Math.abs(
                numericCustomerId
              ) %
                AVATAR_COLORS.length
            ] ??
            "#2563EB",

          phone:
            c?.phone ?? "",

          location:
            c?.address ?? "",

          status:
            c?.status ===
            "inactive"
              ? CustomerStatus.Inactive
              : CustomerStatus.Active,

          /*
           * Real order count.
           */
          totalOrders,

          /*
           * Real order spending.
           */
          totalSpent,

          memberSince:
            c?.createdAt
              ? formatDate(
                  c.createdAt
                )
              : "-",

          note:
            c?.description?.trim()
              ? String(
                  c.description
                )
              : "-",

          imageUrl:
            resolveMediaUrl(
              c?.photoPath
            ),

          _photoPath:
            c?.photoPath ??
            null,

          /*
           * Order history.
           */
          orders:
            orderHistory,

          /*
           * Daily totals.
           */
          dailyTotals,
        };

        /* =================================================
           CACHE
        ================================================= */

        await cacheSet(
          cacheKey,
          mapped,
          STALE_TTL
        ).catch(() => {});

        if (cancelled) {
          return;
        }

        /* =================================================
           UPDATE UI
        ================================================= */

        setCustomer(mapped);
        setError(null);

        /* =================================================
           DEBUG
        ================================================= */

        if (__DEV__) {
          console.log(
            "[CUSTOMER DETAIL] Customer:",
            customerId
          );

          console.log(
            "[CUSTOMER DETAIL] Total Orders:",
            totalOrders
          );

          console.log(
            "[CUSTOMER DETAIL] Total Spend:",
            totalSpent
          );

          console.log(
            "[CUSTOMER DETAIL] Daily Totals:",
            dailyTotals
          );

          console.log(
            "[CUSTOMER DETAIL] Order History:",
            orderHistory
          );

          console.log(
            "[CUSTOMER DETAIL] Raw Orders:",
            uniqueOrders.map(
              (order) => ({
                id: order.id,
                createdAt:
                  order.createdAt,
                totalAmount:
                  order.totalAmount,
              })
            )
          );
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (__DEV__) {
          console.error(
            "[CUSTOMER DETAIL] Failed to load:",
            err
          );
        }

        /*
         * During refresh:
         * keep existing data.
         */
        if (!isRefresh) {
          setCustomer(null);
        }

        setError(
          ERROR_MESSAGE
        );
      } finally {
        if (cancelled) {
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
    [customerId]
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!active) {
        return;
      }

      await load(false);
    };

    run();

    return () => {
      active = false;
    };
  }, [load]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh =
    useCallback(async () => {
      await load(true);
    }, [load]);

  /* =======================================================
     RETURN
  ======================================================= */

  return {
    customer,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}

/* ===========================================================
   CLEAR CUSTOMER DETAIL CACHE
=========================================================== */

export function clearCustomerDetailCache(
  customerId: string
): void {
  cacheClearKeySync(
    `customer:${customerId}`
  );
}