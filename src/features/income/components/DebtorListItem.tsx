import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Debtor } from "../types/income.types";

type DebtorListItemProps = {
  debtor: Debtor;
  onPress?: () => void;
};

export function DebtorListItem({ debtor, onPress }: DebtorListItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center bg-white rounded-2xl p-3 mb-2"
      style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
    >
      <View
        style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: debtor.avatarColor }}
        className="items-center justify-center"
      >
        <Text className="font-khmerBold text-white text-xl">{debtor.initials}</Text>
      </View>

      <View className="flex-1 ml-3">
        <Text className="font-khmerMedium text-gray-900 text-xl" numberOfLines={1}>
          {debtor.code} | {debtor.name}
        </Text>
        <View className="flex-row items-center mt-0.5">
          <Ionicons name="call-outline" size={11} color="#9CA3AF" />
          <Text className="font-khmer text-gray-400 text-[14px] ml-1">{debtor.phone}</Text>
        </View>
      </View>

      <View className="items-end">
        <Text className="font-khmerBold text-red-500 text-xl">${debtor.amount.toFixed(2)}</Text>
        <Text className="font-khmer text-gray-400 text-[14px] mt-0.5">{debtor.dueDate}</Text>
      </View>
    </TouchableOpacity>
  );
}