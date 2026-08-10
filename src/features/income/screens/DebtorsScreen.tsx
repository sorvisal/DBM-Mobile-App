import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDebtors } from "../hooks/useDebtors";
import { DebtorListItem } from "../components/DebtorListItem";

type DebtorsScreenProps = {
  onBack: () => void;
};

export function DebtorsScreen({ onBack }: DebtorsScreenProps) {
  const [search, setSearch] = useState("");
  const { debtors, totalDebt, debtorCount } = useDebtors();

  const filteredDebtors = debtors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search)
  );

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Header */}
      <View className="bg-white px-5 pt-3 pb-3 flex-row items-center justify-between relative border-b border-gray-100">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={26} color="#1F2937" />
        </TouchableOpacity>
        <View className="absolute left-0 right-0 items-center justify-center pointer-events-none">
          <Text className="font-khmerBold text-gray-900 text-3xl">បំណុលអតិថិជន</Text>
        </View>
        <Ionicons name="filter-outline" size={22} color="#1F2937" />
      </View>

      {/* Total summary strip */}
      <View className="bg-red-50 px-5 py-3 flex-row items-center justify-between mt-1">
        <View className="flex-row items-center">
          <View className="w-11 h-11 rounded-full bg-red-500 items-center justify-center">
            <Ionicons name="cash-outline" size={22} color="white" />
          </View>
          <View className="ml-2.5">
            <Text className="font-khmer text-red-500 text-[16px]">សរុបបំណុល</Text>
            <Text className="font-khmerBold text-red-600 text-xl">${totalDebt.toFixed(2)}</Text>
          </View>
        </View>
        <Text className="font-khmer text-red-400 text-xl">{debtorCount} អតិថិជន</Text>
      </View>

      {/* Search */}
      <View className="px-5 pt-3 pb-2 bg-gray-50">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 h-11">
          <Ionicons name="search-outline" size={22} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ស្វែងរកឈ្មោះ ឬលេខទូរស័ព្ទ..."
            placeholderTextColor="#9CA3AF"
            className="font-khmer flex-1 ml-2 text-xl text-gray-800"
            style={{ outlineWidth: 0, borderWidth: 0, backgroundColor: "transparent" }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {filteredDebtors.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Ionicons name="checkmark-circle-outline" size={36} color="#D1D5DB" />
            <Text className="font-khmer text-gray-400 text-xl mt-2">មិនមានបំណុលទេ</Text>
          </View>
        ) : (
          filteredDebtors.map((debtor) => <DebtorListItem key={debtor.id} debtor={debtor} />)
        )}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}