import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Debtor } from "../types/income.types";

type DebtorListItemProps = {
  debtor: Debtor;
  onPress?: () => void;
};

export function DebtorListItem({
  debtor,
  onPress,
}: DebtorListItemProps) {
  const amount = Number(debtor.amount ?? 0);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-2 flex-row items-center rounded-2xl bg-white p-3"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      {/* Avatar */}
      <View
        className="items-center justify-center"
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: debtor.avatarColor,
        }}
      >
        <Text className="font-khmerBold text-xl text-white">
          {debtor.initials}
        </Text>
      </View>

      {/* Customer information */}
      <View className="ml-3 flex-1">
        {/* Code + Name */}
        <Text
          className="font-khmerMedium text-xl text-gray-900"
          numberOfLines={1}
        >
          {debtor.code} | {debtor.name}
        </Text>

        {/* Phone */}
        <View className="mt-1 flex-row items-center">
          <Ionicons
            name="call-outline"
            size={14}
            color="#6B7280"
          />

          <Text
            className="font-khmer ml-1 text-[15px] text-gray-500"
            numberOfLines={1}
          >
            {debtor.phone || "មិនមានលេខទូរស័ព្ទ"}
          </Text>
        </View>
      </View>

      {/* Debt */}
      <View className="ml-2 items-end">
        <Text
          className="font-khmerBold text-xl text-red-500"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          maxFontSizeMultiplier={1.3}
        >
          ${amount.toFixed(2)}
        </Text>

        {debtor.dueDate && (
          <Text
            className="font-khmer mt-0.5 text-[14px] text-gray-400"
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
          >
            {debtor.dueDate}
          </Text>
        )}
      </View>

      {/* Arrow */}
      <Ionicons
        name="chevron-forward"
        size={18}
        color="#D1D5DB"
        style={{ marginLeft: 6 }}
      />
    </TouchableOpacity>
  );
}