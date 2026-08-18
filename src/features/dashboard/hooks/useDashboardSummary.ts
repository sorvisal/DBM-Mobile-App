import { useEffect, useState, useCallback, useRef } from "react";
import { api, cacheGetStale, cacheSet, cacheClearKeySync, CacheTTL, suppressGlobalLoading, unsuppressGlobalLoading } from "@/services";
import type { Order, RevenuePoint } from "@/types/api";
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

function mapApiOrder(o: Order) {
  const apiItems = o.items ?? [];
  const items = apiItems.map((i) => ({
    id: i.productId,
    name: i.productName,
    imageUrl: `https://picsum.photos/seed/${i.productId}/100`,
    price: i.unitPrice,
    quantity: i.quantity,
  }));
  const subtotal = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0);
  const statusMap: Record<string, string> = {
    pending: "pending",
    confirmed: "confirmed",
    delivering: "shipping",
    completed: "completed",
    cancelled: "cancelled",
  };
  return {
    id: o.id,
    code: o.code,
    status: (statusMap[o.status] ?? "pending"),
    customer: { name: o.customerName, phone: o.driverPhone ?? "" },
    createdAt: o.createdAt,
    items,
    subtotal,
    deliveryFee: 0.5,
    total: o.totalAmount,
    paymentMethod: o.paymentMethod ?? undefined,
    address: o.deliveryAddress ?? undefined,
    note: o.note ?? undefined,
    paymentStatus: o.paymentStatus,
    delivery: o.driverName
      ? {
          driverName: o.driverName,
          driverPhone: o.driverPhone ?? undefined,
          confirmedAt: o.confirmedAt ?? undefined,
          deliveredAt: o.completedAt ?? undefined,
        }
      : undefined,
  };
}

type DashboardCache = {
  stats: DashboardStat[];
  recentActivity: RecentActivity[];
  totalCustomers: number;
  revenueData: RevenueData | null;
  chartData: ChartPoint[];
  receivablesData: ReceivablesData | null;
};

async function fetchDashboardData(revenuePeriod: RevenuePeriod, chartRange: ChartRange): Promise<DashboardCache> {
  const [productRes, orderRes, customerRes, revenueRes, receivablesRes, chartRes] =
    await Promise.allSettled([
      api.products.summary(),
      api.orders.list({ page: 1, pageSize: 10 }),
      api.customers.list({ pageSize: 1 }),
      api.reports.revenue(revenuePeriod === "day" ? "today" : revenuePeriod === "week" ? "thisWeek" : "thisMonth"),
      api.reports.receivables(),
      api.reports.revenueChart(chartRange),
    ]);

  const productSummary = productRes.status === "fulfilled" ? productRes.value : null;
  const orderList = orderRes.status === "fulfilled" ? orderRes.value : null;
  const customerList = customerRes.status === "fulfilled" ? customerRes.value : null;
  const revenueResData = revenueRes.status === "fulfilled" ? revenueRes.value : null;
  const receivablesResData = receivablesRes.status === "fulfilled" ? receivablesRes.value : null;
  const chartResData = chartRes.status === "fulfilled" ? chartRes.value : [];

  const newStats: DashboardStat[] = [
    {
      key: "totalSkus",
      icon: "cube-outline",
      iconBg: "bg-blue-400",
      title: productSummary?.total != null ? String(productSummary.total) : "0",
      value: String(productSummary?.total ?? 0),
      unit: "SKU",
    },
    {
      key: "lowStock",
      icon: "warning-outline",
      iconBg: "bg-orange-400",
      title: productSummary?.lowStockCount != null ? String(productSummary.lowStockCount) : "0",
      value: String(productSummary?.lowStockCount ?? 0),
      unit: "មុខ",
    },
    {
      key: "expiringSoon",
      icon: "time-outline",
      iconBg: "bg-red-400",
      title: productSummary?.expiringCount != null ? String(productSummary.expiringCount) : "0",
      value: String(productSummary?.expiringCount ?? 0),
      unit: "មុខ",
    },
  ];

  const newTotalCustomers = customerList?.total ?? 0;

  const newRecentActivity: RecentActivity[] = (orderList?.items ?? [])
    .filter((o: Order, idx: number, arr: Order[]) => arr.findIndex((x) => x.id === o.id) === idx)
    .slice(0, 3)
    .map((o: Order) => ({
      id: o.id,
      icon: "cart-outline",
      iconBg: "bg-blue-100",
      iconColor: "#2563EB",
      title: `${o.code} - ${o.customerName}`,
      time: new Date(o.createdAt).toLocaleString(),
    }));

  const newRevenueData: RevenueData | null = revenueResData
    ? {
        period: revenuePeriod,
        totalRevenue: revenueResData.totalRevenue,
        totalCost: revenueResData.totalCost,
        netProfit: revenueResData.netProfit,
        ordersCount: revenueResData.ordersCount,
        averageOrderValue: revenueResData.averageOrderValue,
      }
    : null;

  const newReceivablesData: ReceivablesData | null = receivablesResData ?? null;

  const newChartData: ChartPoint[] = (chartResData ?? []).map((p: RevenuePoint) => ({ date: p.date, revenue: p.revenue }));

  return {
    stats: newStats,
    recentActivity: newRecentActivity,
    totalCustomers: newTotalCustomers,
    revenueData: newRevenueData,
    chartData: newChartData,
    receivablesData: newReceivablesData,
  };
}

export function useDashboardSummary() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("day");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartRange, setChartRange] = useState<ChartRange>("7d");
  const [receivablesData, setReceivablesData] = useState<ReceivablesData | null>(null);
  const fetchingRef = useRef(false);

  const applyData = useCallback((data: DashboardCache) => {
    setStats(data.stats);
    setRecentActivity(data.recentActivity);
    setTotalCustomers(data.totalCustomers);
    setRevenueData(data.revenueData);
    setChartData(data.chartData);
    setReceivablesData(data.receivablesData);
  }, []);

  const fetchData = useCallback(async (isBackground = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    if (!isBackground) setIsLoading(true);
    setError(null);

    try {
      // Stale-while-revalidate: show cached data instantly, then refresh in background
      const [cached, stale] = await cacheGetStale<DashboardCache>(CACHE_KEY);

      if (cached) {
        applyData(cached);
        setIsLoading(false);

        if (!stale) {
          // Data is fresh, no need to revalidate
          return;
        }
        // Data is stale — revalidate in background (suppress global overlay)
        suppressGlobalLoading();
        try {
          const freshData = await fetchDashboardData(revenuePeriod, chartRange);
          applyData(freshData);
          await cacheSet(CACHE_KEY, freshData, CacheTTL.MEDIUM).catch(() => {});
        } finally {
          unsuppressGlobalLoading();
        }
      } else {
        // No cache — fetch with global overlay tracking
        const freshData = await fetchDashboardData(revenuePeriod, chartRange);
        applyData(freshData);
        await cacheSet(CACHE_KEY, freshData, CacheTTL.MEDIUM).catch(() => {});
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [revenuePeriod, chartRange, applyData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    cacheClearKeySync(CACHE_KEY);
    fetchData();
  }, [fetchData]);

  const setPeriod = useCallback((period: RevenuePeriod) => {
    setRevenuePeriod(period);
  }, []);

  const setRange = useCallback((range: ChartRange) => {
    setChartRange(range);
  }, []);

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
