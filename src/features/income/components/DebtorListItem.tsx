import { View, Text, TouchableOpacity } from "react-native";
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
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      className="flex-row items-center bg-white rounded-2xl p-3 mb-2"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor:
            debtor.avatarColor,
        }}
        className="items-center justify-center"
      >
        <Text className="font-khmerBold text-white text-xl">
          {debtor.initials}
        </Text>
      </View>

      {/* Customer information */}
      <View className="flex-1 ml-3">
        {/* Customer code + name */}
        <Text
          className="font-khmerMedium text-gray-900 text-xl"
          numberOfLines={1}
        >
          {debtor.code} | {debtor.name}
        </Text>

       {/* Phone */}
      <View className="flex-row items-center mt-1">
        <Ionicons
          name="call-outline"
          size={14}
          color="#6B7280"
        />

       <Text
        className="font-khmer text-gray-500 text-[15px] ml-1"
        numberOfLines={1}
      >
        {debtor.phone}
      </Text>
      </View>
      </View>

      {/* Debt */}
      <View className="items-end ml-2">
        <Text
          className="font-khmerBold text-red-500 text-xl text-right"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          maxFontSizeMultiplier={1.3}
          style={{ alignSelf: "flex-end", maxWidth: "100%" }}
        >
          $
          {Number(
            debtor.amount ?? 0
          ).toFixed(2)}
        </Text>

        <Text className="font-khmer text-gray-400 text-[14px] mt-0.5" numberOfLines={1} maxFontSizeMultiplier={1.3}>
          {debtor.dueDate}
        </Text>
      </View>
    </TouchableOpacity>
  );
}