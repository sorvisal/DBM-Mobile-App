import { View, Text, ScrollView } from "react-native";
import { useDashboardSummary } from "../hooks/useDashboardSummary";
import { SummaryStatsCard } from "../components/SummaryStatsCard";
import { QuickActionGrid } from "../components/QuickActionGrid";
import { RecentActivityList } from "../components/RecentActivityList";
import { QuickAction } from "../types/dashboard.types";

const QUICK_ACTIONS: QuickAction[] = [
  { key: "stock", icon: "cube-outline", iconBg: "bg-blue-50", iconColor: "#2563EB", title: "ស្តុក", subtitle: "គ្រប់គ្រងស្តុកទំនិញ" },
  { key: "orders", icon: "cart-outline", iconBg: "bg-green-50", iconColor: "#16A34A", title: "ការបញ្ជាទិញ", subtitle: "គ្រប់គ្រងការបញ្ជាទិញ" },
  { key: "customers", icon: "people-outline", iconBg: "bg-purple-50", iconColor: "#9333EA", title: "អតិថិជន", subtitle: "គ្រប់គ្រងអតិថិជន" },
  { key: "income", icon: "bar-chart-outline", iconBg: "bg-orange-50", iconColor: "#EA580C", title: "ហិរញ្ញវត្ថុ", subtitle: "របាយការណ៍ចំណូល" },
];

type DashboardScreenProps = {
  onNavigateTab?: (tab: "stock" | "orders" | "customers" | "income") => void;
};

export function DashboardScreen({ onNavigateTab }: DashboardScreenProps) {
  const { stats, recentActivity } = useDashboardSummary();

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      {/* Greeting */}
      <View className="px-5 pt-2 pb-4">
        <Text className="font-khmerBold text-2xl text-gray-900">សួស្ដី, វិសាល 👋</Text>
        <Text className="font-khmer text-2xl text-gray-400 mt-0.5">
          សូមស្វាគមន៍មកកាន់ <Text className="font-bold text-2xl text-gray-400">DBM App</Text>
        </Text>
      </View>

      <SummaryStatsCard stats={stats} />

      <QuickActionGrid
        actions={QUICK_ACTIONS}
        onPressAction={(key) => onNavigateTab?.(key as "stock" | "orders" | "customers" | "income")}
      />

      <RecentActivityList items={recentActivity} onViewAll={() => onNavigateTab?.("orders")} />
    </ScrollView>
  );
}