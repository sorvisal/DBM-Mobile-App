import { useSyncExternalStore } from "react";
import { getOrders, subscribeToOrders } from "../../orders/hooks/useOrderList";
import { getCustomers, subscribeToCustomers } from "../../customers/hooks/useCustomerList";
import { OrderStatus } from "../../orders/types/types";
import { DashboardStat, QuickAction, RecentActivity } from "../types/dashboard.types";

export function useDashboardSummary() {
  const orders = useSyncExternalStore(subscribeToOrders, getOrders, getOrders);
  const customers = useSyncExternalStore(subscribeToCustomers, getCustomers, getCustomers);

  const todayRevenue = orders
    .filter((o) => o.status === OrderStatus.Completed)
    .reduce((sum, o) => sum + o.total, 0);

  const newOrdersCount = orders.filter(
    (o) => o.status === OrderStatus.New || o.status === OrderStatus.Pending
  ).length;

  // TODO: replace with real Stock data once PRODUCTS is lifted into a shared useStockList hook
  const totalStockPlaceholder = "1,250";
  const lowStockPlaceholder = "15";

  const stats: DashboardStat[] = [
    { key: "stock", icon: "swap-vertical-outline", iconBg: "bg-blue-400", title: "ស្តុកសរុប", value: totalStockPlaceholder, unit: "ឯកតា" },
    { key: "revenue", icon: "cash-outline", iconBg: "bg-green-400", title: "ចំណូលថ្ងៃនេះ", value: `$${todayRevenue.toFixed(0)}`, unit: "ដុល្លារ" },
    { key: "lowstock", icon: "warning-outline", iconBg: "bg-orange-400", title: "ស្តុកជិតអស់", value: lowStockPlaceholder, unit: "មុខ" },
    { key: "neworders", icon: "document-text-outline", iconBg: "bg-purple-400", title: "បញ្ជីទិញថ្មីៗ", value: String(newOrdersCount), unit: "កម្មង់" },
  ];

  const recentActivity: RecentActivity[] = orders
    .slice(0, 3)
    .map((order) => ({
      id: order.id,
      icon: "cart-outline",
      iconBg: "bg-blue-100",
      iconColor: "#2563EB",
      title: `${order.code} - ${order.customer.name}`,
      time: order.createdAt,
    }));

  return {
    stats,
    recentActivity,
    totalCustomers: customers.length,
    isLoading: false,
  };
}