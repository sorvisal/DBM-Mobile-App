import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useYearlyIncome } from "../hooks/useYearlyIncome";
import { RevenueAreaChart } from "../components/RevenueAreaChart";
import { DebtorListItem } from "../components/DebtorListItem";
import { OutstandingDebtCard } from "../components/OutstandingDebtCard";
import { RevenueBarChart } from "../components/RevenueBarChart";
type YearlyIncomeDetailScreenProps = {
  onBack: () => void;
  onGoDebtors: () => void;
};
export function YearlyIncomeDetailScreen({ onBack, onGoDebtors }: YearlyIncomeDetailScreenProps) {
  const [year] = useState("2025");
  const { summary } = useYearlyIncome(year);

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Header */}
      <View className="bg-white px-5 pt-3 pb-3 flex-row items-center justify-between relative border-b border-gray-100">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center justify-center pointer-events-none">
          <Text className="font-khmerBold text-gray-900 text-3xl">ចំណូលប្រចាំឆ្នាំ</Text>
        </View>
        <Ionicons name="calendar-outline" size={20} color="#1F2937" />
      </View>

      {/* Year navigator */}
      <View className="bg-white px-5 py-3 flex-row items-center justify-between mt-1">
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={18} color="#6B7280" />
        </TouchableOpacity>
        <Text className="font-khmer text-gray-800 text-xl">{summary.year}</Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View className="bg-blue-600 rounded-2xl p-4 flex-row items-center justify-between">
          <View>
            <Text className="font-khmer text-white/80 text-xl">ចំណូលសរុប</Text>
            <Text className="font-khmerBold text-white text-2xl mt-1">${summary.totalIncome.toFixed(2)}</Text>
            <View className="flex-row items-center mt-1">
              <Text className="font-khmer text-white/70 text-[14px]">
                ការបញ្ជាទិញ {summary.orderCount} ការកម្មង់
              </Text>
              {summary.growthPercent !== 0 && (
                <Text className="font-khmer text-green-300 text-[14px] ml-2">
                  ▲{summary.growthPercent}%
                </Text>
              )}
            </View>
          </View>
          <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center">
            <Ionicons name="wallet-outline" size={20} color="white" />
          </View>
        </View>

        {/* Chart */}
        <View className="bg-white rounded-2xl p-4 mt-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-khmerBold text-gray-900 text-xl">ក្រាហ្វបំណូលប្រចាំខែក្នុងឆ្នាំនេះ</Text>
            <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-1">
              <Text className="font-khmer text-gray-600 text-xl">ខែ</Text>
              <Ionicons name="chevron-down" size={12} color="#6B7280" style={{ marginLeft: 4 }} />
            </View>
          </View>
          <RevenueAreaChart data={summary.monthlyChart} height={150} />
        </View>

        {/* Debtors */}
        <View className="mt-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-khmerBold text-gray-900 text-xl">បំណុលអតិថិជន</Text>
            <TouchableOpacity onPress={onGoDebtors} className="flex-row items-center gap-1">
              <Text className="font-khmer text-blue-600 text-xl">មើលទាំងអស់</Text>
              <Ionicons name="chevron-forward" size={16} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {summary.debtors.map((debtor) => (
            <DebtorListItem key={debtor.id} debtor={debtor} />
          ))}
        </View>

        <OutstandingDebtCard totalDebt={summary.totalDebt} debtorCount={summary.debtors.length} />

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}