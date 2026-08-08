import { View, Text } from "react-native";

type ExpiryBadgeProps = {
  daysLeft: number;
};

export function ExpiryBadge({ daysLeft }: ExpiryBadgeProps) {
  const tone =
    daysLeft <= 7
      ? { bg: "bg-red-50", text: "text-red-600" }
      : daysLeft <= 15
      ? { bg: "bg-orange-50", text: "text-orange-600" }
      : { bg: "bg-green-50", text: "text-green-600" };

  return (
    <View className={`${tone.bg} rounded-full px-2.5 py-1 self-start`}>
      <Text className={`font-khmer text-[14px] ${tone.text}`}>{daysLeft} ថ្ងៃទៀត</Text>
    </View>
  );
}