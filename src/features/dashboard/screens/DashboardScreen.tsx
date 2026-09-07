import { useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useDashboardSummary } from "../hooks/useDashboardSummary";
import { SummaryStatsCard } from "../components/SummaryStatsCard";
import { QuickActionGrid } from "../components/QuickActionGrid";
import { RecentActivityList } from "../components/RecentActivityList";
import { QuickAction } from "../types/dashboard.types";
import { DashboardStat } from "../types/dashboard.types";
import { useAuth } from "@/hooks/useAuth";

const QUICK_ACTIONS: QuickAction[] = [
  { key: "stock", icon: "cube-outline", iconBg: "bg-blue-50", iconColor: "#2563EB", title: "ស្តុក", subtitle: "គ្រប់គ្រងស្តុកទំនិញ" },
  { key: "orders", icon: "cart-outline", iconBg: "bg-green-50", iconColor: "#16A34A", title: "ការបញ្ជាទិញ", subtitle: "គ្រប់គ្រងការបញ្ជាទិញ" },
  { key: "customers", icon: "people-outline", iconBg: "bg-purple-50", iconColor: "#9333EA", title: "អតិថិជន", subtitle: "គ្រប់គ្រងអតិថិជន" },
  { key: "income", icon: "bar-chart-outline", iconBg: "bg-orange-50", iconColor: "#EA580C", title: "ហិរញ្ញវត្ថុ", subtitle: "របាយការណ៍ចំណូល" },
];
type DashboardScreenProps = {
  onNavigateTab?: (
    tab: "stock" | "orders" | "customers" | "income"
  ) => void;

  onNavigateStockTab?: (tab: "products" | "expiry" | "history" | "add") => void;
};

export function DashboardScreen({
  onNavigateTab,
  onNavigateStockTab,
}: DashboardScreenProps) {
  // If your hook returns a refresh/refetch function, destructure it here (e.g., refresh)
  const { stats, recentActivity, isLoading, refresh } = useDashboardSummary();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (refresh) {
      setIsRefreshing(true);
      await refresh();
      setIsRefreshing(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing || isLoading}
          onRefresh={handleRefresh}
          colors={["#2563EB"]} // Android loading spinner color
          tintColor="#2563EB"   // iOS loading spinner color
        />
      }
    >
      {/* Greeting */}
      <View className="px-5 pt-2 pb-4">
        <Text className="font-khmerBold text-2xl text-gray-900" numberOfLines={1} maxFontSizeMultiplier={1.3}>
          Hi, {user?.storeName ?? "Store"} 👋
        </Text>

        <Text className="font-khmer text-xl text-gray-400 mt-0.5" numberOfLines={2} maxFontSizeMultiplier={1.3}>
          សូមស្វាគមន៍មកកាន់{" "}
          <Text className="font-bold text-xl text-gray-400">
            DBM App
          </Text>
        </Text>
      </View>

<SummaryStatsCard
  stats={stats}
  onPressStat={(stat: DashboardStat) => {
    switch (stat.key) {
      case "totalStock":
        onNavigateTab?.("stock");
        break;

      case "totalIncome":
        onNavigateTab?.("income");
        break;

      case "totalOrder":
        onNavigateTab?.("orders");
        break;

      case "expiringSoon":
        onNavigateStockTab?.("expiry");
        break;

      default:
        break;
    }
  }}
/>

      <QuickActionGrid
        actions={QUICK_ACTIONS}
        onPressAction={(key) => onNavigateTab?.(key as "stock" | "orders" | "customers" | "income")}
      />
      <RecentActivityList items={recentActivity} isLoading={isLoading} onViewAll={() => onNavigateTab?.("orders")} />
    </ScrollView>
  );
}