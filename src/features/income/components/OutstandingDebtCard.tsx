import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type OutstandingDebtCardProps = {
  totalDebt: number;
  debtorCount: number;
  onPress?: () => void;
};

export function OutstandingDebtCard({ totalDebt, debtorCount, onPress }: OutstandingDebtCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center bg-red-50 rounded-2xl p-4 mt-3"
    >
      <View className="w-12 h-12 rounded-full bg-red-500 items-center justify-center">
        <Ionicons name="cash-outline" size={27} color="white" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="font-khmer text-red-500 text-xl">បំណុលអតិថិជនមិនទាន់សង</Text>
        <Text className="font-khmerBold text-red-600 text-xl mt-0.5">${totalDebt.toFixed(2)}</Text>
      </View>
      <View className="items-end">
        <Text className="font-khmer text-red-400 text-[16px]">{debtorCount} អតិថិជន</Text>
        {onPress && <Ionicons name="chevron-forward" size={18} color="#F87171" style={{ marginTop: 4 }} />}
      </View>
    </TouchableOpacity>
  );
}