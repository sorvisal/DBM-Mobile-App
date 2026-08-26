import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIncomeSummary } from "../hooks/useIncomeSummary";
import { IncomeTimeTabs } from "../components/IncomeTimeTabs";
import { IncomeSummaryCard } from "../components/IncomeSummaryCard";
import { OutstandingDebtCard } from "../components/OutstandingDebtCard";
import { DebtorListItem } from "../components/DebtorListItem";
import { RevenueAreaChart } from "../components/RevenueAreaChart";
import { RangeDropdown, RevenueRange } from "../components/RangeDropdown";
import type { ChartPoint } from "../types/income.types";

type IncomeOverviewScreenProps = {
  onGoDaily: () => void;
  onGoMonthly: () => void;
  onGoYearly: () => void;
  onGoDebtors: () => void;
};

const RANGE_TITLE: Record<RevenueRange, string> = {
  "7": "ក្រាហ្វចំណូល (7 ថ្ងៃចុងក្រោយ)",
  "28": "ក្រាហ្វចំណូល (28 ថ្ងៃចុងក្រោយ)",
  "90": "ក្រាហ្វចំណូល (90 ថ្ងៃចុងក្រោយ)",
};

function buildPlaceholderChart(days: number): ChartPoint[] {
  const points: ChartPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const mockAmount = 100 + ((days - i) % 7) * 20;

    points.push({
      label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      amount: mockAmount,
    });
  }

  return points;
}

export function IncomeOverviewScreen({ onGoDaily, onGoMonthly, onGoYearly, onGoDebtors }: IncomeOverviewScreenProps) {
  const [chartRange, setChartRange] = useState<RevenueRange>("7");
  const [refreshing, setRefreshing] = useState(false);
  
  const { overview } = useIncomeSummary();

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate a brief refresh delay or re-fetch trigger if needed
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const chartData = useMemo(() => {
    if (chartRange === "7") return overview.weeklyChart;
    return buildPlaceholderChart(Number(chartRange));
  }, [chartRange, overview.weeklyChart]);

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      <IncomeTimeTabs
        active="overview"
        onChange={(key) => {
          if (key === "daily") onGoDaily();
          if (key === "monthly") onGoMonthly();
          if (key === "yearly") onGoYearly();
          if (key === "debt") onGoDebtors();
        }}
      />

      <ScrollView
        className="flex-1 px-5 pt-3 mt-2"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
      >
        {/* 3 summary cards */}
        <View className="flex-row gap-2">
          <IncomeSummaryCard
            icon="calendar-outline"
            iconBg="bg-blue-50"
            iconColor="#2563EB"
            label="ចំណូលថ្ងៃនេះ"
            amount={overview.todayIncome}
            subLabel={overview.todayDate}
            onPress={onGoDaily}
          />
          <IncomeSummaryCard
            icon="calendar-outline"
            iconBg="bg-green-50"
            iconColor="#16A34A"
            label="ចំណូលខែនេះ"
            amount={overview.monthIncome}
            subLabel={overview.monthLabel}
            growthPercent={overview.monthGrowthPercent}
            onPress={onGoMonthly}
          />
          <IncomeSummaryCard
            icon="calendar-outline"
            iconBg="bg-purple-50"
            iconColor="#9333EA"
            label="ចំណូលឆ្នាំ"
            amount={overview.yearIncome}
            subLabel={overview.yearLabel}
            growthPercent={overview.yearGrowthPercent}
            onPress={onGoYearly}
          />
        </View>

        <OutstandingDebtCard
          totalDebt={overview.totalDebt}
          debtorCount={overview.debtorCount}
          onPress={onGoDebtors}
        />

        {/* Revenue chart */}
        <View className="bg-white rounded-xl p-2 mt-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-khmerBold text-gray-900 text-lg">
              {RANGE_TITLE[chartRange]}
            </Text>
            <RangeDropdown value={chartRange} onChange={setChartRange} />
          </View>
          <RevenueAreaChart data={chartData} />
        </View>

        {/* Top debtors preview */}
        <View className="mt-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-khmerBold text-gray-900 text-xl">ចំណូលអតិថិជនសរុប</Text>
            <TouchableOpacity onPress={onGoDebtors} className="flex-row items-center gap-1">
              <Text className="font-khmer text-blue-600 text-xl">មើលទាំងអស់</Text>
              <Ionicons name="chevron-forward" size={16} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {overview.topDebtors.map((debtor) => (
            <DebtorListItem key={debtor.id} debtor={debtor} />
          ))}
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}