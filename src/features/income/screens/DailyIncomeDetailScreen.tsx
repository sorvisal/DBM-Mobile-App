import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDailyIncome } from "../hooks/useDailyIncome";
import { IncomeOrderRow } from "../components/IncomeOrderRow";

type DailyIncomeDetailScreenProps = {
  onBack: () => void;
};

export function DailyIncomeDetailScreen({ onBack }: DailyIncomeDetailScreenProps) {
  const [date] = useState("25/05/2025");
  const { summary } = useDailyIncome(date);

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Header */}
      <View className="bg-white px-5 pt-3 pb-3 flex-row items-center justify-between relative border-b border-gray-100">
        <TouchableOpacity onPress={onBack}>
        <Ionicons name="arrow-back" size={26} color="#1F2937" />
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center justify-center pointer-events-none">
          <Text className="font-khmerBold text-gray-900 text-3xl">ចំណូលប្រចាំថ្ងៃ</Text>
        </View>
        <Ionicons name="calendar-outline" size={22} color="#1F2937" />
      </View>

      {/* Date navigator */}
      <View className="bg-white px-5 py-3 flex-row items-center justify-between rounded-full mt-1">
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={18} color="#6B7280" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-1.5">
          <Text className="font-khmer text-gray-800 text-xl">{summary.date}</Text>
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
        </View>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View className="bg-blue-600 rounded-2xl p-4 flex-row items-center justify-between">
          <View>
            <Text className="font-khmer text-white/80 text-xs">ចំណូលសរុប</Text>
            <Text className="font-khmerBold text-white text-2xl mt-1">${summary.totalIncome.toFixed(2)}</Text>
            <Text className="font-khmer text-white/70 text-[16px] mt-1">
              ការបញ្ជាទិញ {summary.orderCount} ការកម្មង់
            </Text>
          </View>
          <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center">
            <Ionicons name="wallet-outline" size={20} color="white" />
          </View>
        </View>

        {/* Orders */}
        <Text className="font-khmerBold text-gray-900 text-xl mt-4 mb-2">ការបញ្ជាទិញ</Text>
        {summary.orders.map((order) => (
          <IncomeOrderRow key={order.id} order={order} />
        ))}

        {/* Breakdown */}
        <View className="bg-white rounded-2xl p-4 mt-2">
          <View className="flex-row items-center justify-between py-1.5">
            <Text className="font-khmer text-gray-500 text-xl">សាច់ប្រាក់ចូល</Text>
            <Text className="font-khmer text-gray-800 text-xl">${summary.cashCollected.toFixed(2)}</Text>
          </View>
          <View className="flex-row items-center justify-between py-1.5">
            <Text className="font-khmer text-gray-500 text-xl">បញ្ចុះតម្លៃ</Text>
            <Text className="font-khmer text-gray-800 text-xl">${summary.discount.toFixed(2)}</Text>
          </View>
          <View className="flex-row items-center justify-between py-1.5">
            <Text className="font-khmer text-gray-500 text-xl">ចំណាយផ្សេង</Text>
            <Text className="font-khmer text-gray-800 text-xl">${summary.otherExpense.toFixed(2)}</Text>
          </View>
          <View className="flex-row items-center justify-between pt-2 mt-1 border-t border-gray-100">
            <Text className="font-khmerBold text-gray-900 text-xl">សរុបចំណេញ</Text>
            <Text className="font-khmerBold text-blue-600 text-xl">${summary.netTotal.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity className="bg-blue-600 rounded-xl h-12 items-center justify-center flex-row gap-2 mt-4 mb-6">
          <Ionicons name="download-outline" size={16} color="white" />
          <Text className="font-khmerBold text-white text-xl">ទាញយកជារបាយការណ៍</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}