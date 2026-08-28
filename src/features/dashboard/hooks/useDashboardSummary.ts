import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import {
  api,
  cacheGetStale,
  cacheSet,
  cacheClearKeySync,
  CacheTTL,
  suppressGlobalLoading,
  unsuppressGlobalLoading,
} from "@/services";

import type {
  Order,
  RevenuePoint,
} from "@/types/api";

import type {
  DashboardStat,
  RecentActivity,
  RevenueData,
  ChartPoint,
  ReceivablesData,
  RevenuePeriod,
  ChartRange,
} from "../types/dashboard.types";

const CACHE_KEY = "dashboard:summary";

/* =========================================================
   DATE HELPERS
========================================================= */

/**
 * Get YYYY-MM-DD directly from API date.
 *
 * IMPORTANT:
 * Do not use new Date() here.
 *
 * Example:
 * 2026-08-28T03:30:00Z
 *              ↓
 * 2026-08-28
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

  const [
    ,
    year,
    month,
    day,
  ] = match;

  return `${year}-${month}-${day}`;
}

/**
 * Get today's YYYY-MM-DD using local device date.
 */
function getTodayKey(): string {
  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Format API date without timezone conversion.
 *
 * Example:
 *
 * 2026-08-28T03:30:00Z
 *
 * -> 28/08/2026 03:30
 */
function formatDashboardDate(
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

/* =========================================================
   ORDER MAPPER
========================================================= */

function mapApiOrder(o: Order) {
  const apiLines = o.lines ?? [];

  const lines = apiLines.map(
    (i) => ({
      id: i.productId,
      name: i.productName,
      imageUrl: i.imageUrl ?? "",
      price: i.unitPrice,
      qty: i.qty,
    })
  );

  const subtotal =
    lines.reduce(
      (
        s: number,
        i: {
          price: number;
          qty: number;
        }
      ) =>
        s +
        i.price * i.qty,
      0
    );

  const statusMap: Record<
    string,
    string
  > = {
    pending: "pending",
    confirmed: "confirmed",
    delivering: "shipping",
    completed: "completed",
    cancelled: "cancelled",
  };

  return {
    id: o.id,
    code: o.code,

    status:
      statusMap[o.status] ??
      "pending",

    customer: {
      name: o.customerName,
      phone: o.driverPhone ?? "",
    },

    createdAt:
      o.createdAt,

    lines,

    subtotal,

    deliveryFee: 0.5,

    total:
      o.totalAmount,

    paymentMethod:
      o.paymentMethod ??
      undefined,

    address:
      o.deliveryAddress ??
      undefined,

    note:
      o.note ??
      undefined,

    paymentStatus:
      o.paymentStatus,

    delivery:
      o.driverName
        ? {
            driverName:
              o.driverName,

            driverPhone:
              o.driverPhone ??
              undefined,

            confirmedAt:
              o.confirmedAt ??
              undefined,

            deliveredAt:
              o.completedAt ??
              undefined,
          }
        : undefined,
  };
}

/* =========================================================
   CACHE TYPE
========================================================= */

type DashboardCache = {
  stats: DashboardStat[];
  recentActivity: RecentActivity[];
  totalCustomers: number;
  revenueData: RevenueData | null;
  chartData: ChartPoint[];
  receivablesData: ReceivablesData | null;
};

/* =========================================================
   FETCH DASHBOARD DATA
========================================================= */

async function fetchDashboardData(
  revenuePeriod: RevenuePeriod,
  chartRange: ChartRange
): Promise<DashboardCache> {
  const [
    productRes,
    orderRes,
    customerRes,
    revenueRes,
    receivablesRes,
    chartRes,
  ] = await Promise.allSettled([
    /* ================================================
       STOCK
    ================================================ */

    api.products.summary(),

    /* ================================================
       ORDERS

       We need enough orders for dashboard.
    ================================================ */

    api.orders.list({
      page: 1,
      pageSize: 100,
    }),

    /* ================================================
       CUSTOMERS
    ================================================ */

    api.customers.list({
      pageSize: 1,
    }),

    /* ================================================
       REVENUE
    ================================================ */

    api.reports.revenue(
      revenuePeriod === "day"
        ? "today"
        : revenuePeriod === "week"
        ? "thisWeek"
        : "thisMonth"
    ),

    /* ================================================
       RECEIVABLES
    ================================================ */

    api.reports.receivables(),

    /* ================================================
       CHART
    ================================================ */

    api.reports.revenueChart(
      chartRange
    ),
  ]);

  /* =====================================================
     RESPONSE DATA
  ===================================================== */

  const productSummary =
    productRes.status ===
    "fulfilled"
      ? productRes.value
      : null;

  const orderList =
    orderRes.status ===
    "fulfilled"
      ? orderRes.value
      : null;

  const customerList =
    customerRes.status ===
    "fulfilled"
      ? customerRes.value
      : null;

  const revenueResData =
    revenueRes.status ===
    "fulfilled"
      ? revenueRes.value
      : null;

  const receivablesResData =
    receivablesRes.status ===
    "fulfilled"
      ? receivablesRes.value
      : null;

  const chartResData =
    chartRes.status ===
    "fulfilled"
      ? chartRes.value
      : [];

  /* =====================================================
     TODAY
  ===================================================== */

  const todayKey =
    getTodayKey();

  /* =====================================================
     ALL ORDERS
  ===================================================== */

  const allOrders =
    orderList?.items ?? [];

  /* =====================================================
     REMOVE DUPLICATES
  ===================================================== */

  const uniqueOrders =
    allOrders.filter(
      (
        order,
        index,
        array
      ) =>
        array.findIndex(
          (item) =>
            item.id ===
            order.id
        ) === index
    );

  /* =====================================================
     TODAY ORDERS
  ===================================================== */

  const todayOrders =
    uniqueOrders.filter(
      (order) =>
        getApiDateKey(
          order.createdAt
        ) === todayKey
    );

  /* =====================================================
     TODAY COMPLETED ORDERS
  ===================================================== */

  const todayCompletedOrders =
    todayOrders.filter(
      (order) =>
        String(
          order.status
        ).toLowerCase() ===
        "completed"
    );

  /* =====================================================
     TODAY INCOME
     
     ONLY COMPLETED ORDERS
  ===================================================== */

  const todayIncome =
    todayCompletedOrders.reduce(
      (
        total,
        order
      ) =>
        total +
        Number(
          order.totalAmount ??
            0
        ),
      0
    );

  /* =====================================================
     TODAY NEW ORDERS
     
     Count orders created today.
     
     Cancelled orders are excluded.
  ===================================================== */

  const todayNewOrders =
    todayOrders.filter(
      (order) =>
        String(
          order.status
        ).toLowerCase() !==
        "cancelled"
    ).length;

  /* =====================================================
     DEBUG
  ===================================================== */

  if (__DEV__) {
    console.log(
      "================================="
    );

    console.log(
      "[DASHBOARD] Today:",
      todayKey
    );

    console.log(
      "[DASHBOARD] All orders:",
      uniqueOrders.length
    );

    console.log(
      "[DASHBOARD] Today orders:",
      todayOrders.length
    );

    console.log(
      "[DASHBOARD] Completed today:",
      todayCompletedOrders.length
    );

    console.log(
      "[DASHBOARD] Today income:",
      todayIncome
    );

    console.log(
      "[DASHBOARD] New orders:",
      todayNewOrders
    );

    console.log(
      "================================="
    );
  }

  /* =====================================================
     DASHBOARD STATS
  ===================================================== */

  const newStats: DashboardStat[] =
    [
      /* ================================================
         TOTAL STOCK

         KEEP EXISTING WORKING LOGIC
      ================================================ */

      {
        key: "totalStock",

        icon:
          "cube-outline",

        iconBg:
          "bg-blue-400",

        title:
          "ស្តុកសរុប",

        value:
          String(
            productSummary?.total ??
              0
          ),

        unit:
          "ឯកតា",
      },

      /* ================================================
         TODAY INCOME

         FIXED
      ================================================ */

      {
        key:
          "totalIncome",

        icon:
          "cash-outline",

        iconBg:
          "bg-green-400",

        title:
          "ចំណូលថ្ងៃនេះ",

        value:
          `$${todayIncome.toFixed(
            2
          )}`,

        unit:
          "ដុល្លារ",
      },

      /* ================================================
         EXPIRY

         KEEP EXISTING WORKING LOGIC
      ================================================ */

      {
        key:
          "expiringSoon",

        icon:
          "warning-outline",

        iconBg:
          "bg-orange-400",

        title:
          "ស្តុកជិតផុតកំណត់",

        value:
          String(
            productSummary?.expiringCount ??
              0
          ),

        unit:
          "មុខ",
      },

      /* ================================================
         NEW ORDER

         FIXED
      ================================================ */

      {
        key:
          "totalOrder",

        icon:
          "document-text-outline",

        iconBg:
          "bg-purple-400",

        title:
          "បញ្ជាទិញថ្មី",

        value:
          String(
            todayNewOrders
          ),

        unit:
          "កម្មង់",
      },
    ];

  /* =====================================================
     TOTAL CUSTOMERS
  ===================================================== */

  const newTotalCustomers =
    customerList?.total ??
    0;

  /* =====================================================
     RECENT ACTIVITY
  ===================================================== */

  const newRecentActivity:
    RecentActivity[] =
    uniqueOrders
      .slice(0, 3)
      .map(
        (o) => ({
          id:
            String(o.id),

          icon:
            "cart-outline",

          iconBg:
            "bg-blue-100",

          iconColor:
            "#2563EB",

          title:
            `${o.code} - ${o.customerName}`,

          time:
            formatDashboardDate(
              o.createdAt
            ),
        })
      );

  /* =====================================================
     REVENUE DATA
  ===================================================== */

  const newRevenueData:
    RevenueData | null =
    revenueResData
      ? {
          period:
            revenuePeriod,

          totalRevenue:
            revenuePeriod ===
            "day"
              ? todayIncome
              : revenueResData.totalRevenue,

          totalCost:
            revenueResData.totalCost,

          netProfit:
            revenueResData.netProfit,

          ordersCount:
            revenuePeriod ===
            "day"
              ? todayNewOrders
              : revenueResData.ordersCount,

          averageOrderValue:
            revenueResData.averageOrderValue,
        }
      : null;

  /* =====================================================
     RECEIVABLES
  ===================================================== */

  const newReceivablesData:
    ReceivablesData | null =
    receivablesResData ??
    null;

  /* =====================================================
     CHART
  ===================================================== */

  const newChartData:
    ChartPoint[] =
    (chartResData ?? []).map(
      (
        p: RevenuePoint
      ) => ({
        date:
          p.date,

        revenue:
          p.revenue,
      })
    );

  /* =====================================================
     RETURN
  ===================================================== */

  return {
    stats:
      newStats,

    recentActivity:
      newRecentActivity,

    totalCustomers:
      newTotalCustomers,

    revenueData:
      newRevenueData,

    chartData:
      newChartData,

    receivablesData:
      newReceivablesData,
  };
}

/* =========================================================
   HOOK
========================================================= */

export function useDashboardSummary() {
  const [
    stats,
    setStats,
  ] =
    useState<
      DashboardStat[]
    >([]);

  const [
    recentActivity,
    setRecentActivity,
  ] =
    useState<
      RecentActivity[]
    >([]);

  const [
    totalCustomers,
    setTotalCustomers,
  ] =
    useState(0);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    revenueData,
    setRevenueData,
  ] =
    useState<
      RevenueData | null
    >(null);

  const [
    revenuePeriod,
    setRevenuePeriod,
  ] =
    useState<
      RevenuePeriod
    >("day");

  const [
    chartData,
    setChartData,
  ] =
    useState<
      ChartPoint[]
    >([]);

  const [
    chartRange,
    setChartRange,
  ] =
    useState<
      ChartRange
    >("7d");

  const [
    receivablesData,
    setReceivablesData,
  ] =
    useState<
      ReceivablesData | null
    >(null);

  const fetchingRef =
    useRef(false);

  /* =====================================================
     APPLY DATA
  ===================================================== */

  const applyData =
    useCallback(
      (
        data: DashboardCache
      ) => {
        setStats(
          data.stats
        );

        setRecentActivity(
          data.recentActivity
        );

        setTotalCustomers(
          data.totalCustomers
        );

        setRevenueData(
          data.revenueData
        );

        setChartData(
          data.chartData
        );

        setReceivablesData(
          data.receivablesData
        );
      },
      []
    );

  /* =====================================================
     FETCH
  ===================================================== */

  const fetchData =
    useCallback(
      async (
        isBackground = false
      ) => {
        if (
          fetchingRef.current
        ) {
          return;
        }

        fetchingRef.current =
          true;

        if (!isBackground) {
          setIsLoading(
            true
          );
        }

        setError(null);

        try {
          /* ============================================
             CACHE
          ============================================ */

          const [
            cached,
            stale,
          ] =
            await cacheGetStale<DashboardCache>(
              CACHE_KEY
            );

          if (cached) {
            applyData(
              cached
            );

            setIsLoading(
              false
            );

            /*
             * IMPORTANT:
             * Always refresh Dashboard
             * data in background.
             *
             * This prevents old
             * Income/New Order cards.
             */
            suppressGlobalLoading();

            try {
              const freshData =
                await fetchDashboardData(
                  revenuePeriod,
                  chartRange
                );

              applyData(
                freshData
              );

              await cacheSet(
                CACHE_KEY,
                freshData,
                CacheTTL.MEDIUM
              ).catch(
                () => {}
              );
            } finally {
              unsuppressGlobalLoading();
            }

            return;
          }

          /* ============================================
             NO CACHE
          ============================================ */

          const freshData =
            await fetchDashboardData(
              revenuePeriod,
              chartRange
            );

          applyData(
            freshData
          );

          await cacheSet(
            CACHE_KEY,
            freshData,
            CacheTTL.MEDIUM
          ).catch(
            () => {}
          );
        } catch (e) {
          console.error(
            "[DASHBOARD] Failed:",
            e
          );

          setError(
            e instanceof Error
              ? e.message
              : "Unknown error"
          );
        } finally {
          setIsLoading(
            false
          );

          fetchingRef.current =
            false;
        }
      },
      [
        revenuePeriod,
        chartRange,
        applyData,
      ]
    );

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =====================================================
     REFRESH
  ===================================================== */

  const refresh =
    useCallback(() => {
      cacheClearKeySync(
        CACHE_KEY
      );

      fetchData();
    }, [fetchData]);

  /* =====================================================
     PERIOD
  ===================================================== */

  const setPeriod =
    useCallback(
      (
        period: RevenuePeriod
      ) => {
        setRevenuePeriod(
          period
        );
      },
      []
    );

  /* =====================================================
     CHART RANGE
  ===================================================== */

  const setRange =
    useCallback(
      (
        range: ChartRange
      ) => {
        setChartRange(
          range
        );
      },
      []
    );

  /* =====================================================
     RETURN
  ===================================================== */

  return {
    stats,

    recentActivity,

    totalCustomers,

    isLoading,

    error,

    revenueData,

    chartData,

    receivablesData,

    refresh,

    setPeriod,

    setRange,
  };
}