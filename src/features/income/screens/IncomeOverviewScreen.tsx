import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIncomeSummary } from "../hooks/useIncomeSummary";
import { IncomeTimeTabs } from "../components/IncomeTimeTabs";
import { IncomeSummaryCard } from "../components/IncomeSummaryCard";
import { OutstandingDebtCard } from "../components/OutstandingDebtCard";
import { DebtorListItem } from "../components/DebtorListItem";
import { RevenueAreaChart } from "../components/RevenueAreaChart";
type IncomeOverviewScreenProps = {
  onGoDaily: () => void;
  onGoMonthly: () => void;
  onGoYearly: () => void;
  onGoDebtors: () => void;
};

export function IncomeOverviewScreen({ onGoDaily, onGoMonthly, onGoYearly, onGoDebtors }: IncomeOverviewScreenProps) {
  const { overview } = useIncomeSummary();

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

      <ScrollView className="flex-1 px-5 pt-3 mt-2" showsVerticalScrollIndicator={false}>
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

      {/* Weekly chart */}
      <View className="bg-white rounded-2xl p-4 mt-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-khmerBold text-gray-900 text-xl">ក្រាភបំណូល (7 ថ្ងៃចុងក្រោយ)</Text>
          <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-1">
            <Text className="font-khmer text-gray-600 text-xl">7 ថ្ងៃ</Text>
            <Ionicons name="chevron-down" size={12} color="#6B7280" style={{ marginLeft: 4 }} />
          </View>
        </View>
        <RevenueAreaChart data={overview.weeklyChart} />
      </View>
        {/* Top debtors preview */}
        <View className="mt-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-khmerBold text-gray-900 text-xl">បំណុលអតិថិជន</Text>
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