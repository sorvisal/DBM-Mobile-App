import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/theme";
import { DashboardStat } from "../types/dashboard.types";

type StatItemProps = {
  stat: DashboardStat;
  onPress?: () => void;
};

export function StatItem({ stat, onPress }: StatItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center"
      android_ripple={{ color: "rgba(255,255,255,0.12)" }}
    >
      <View
        className={`${stat.iconBg} h-11 w-11 items-center justify-center rounded-full`}
      >
        <Ionicons
          name={stat.icon as keyof typeof Ionicons.glyphMap}
          size={24}
          color="white"
        />
      </View>

      <Text
        className="font-khmer text-white/80 text-[16px] text-center mt-2"
        numberOfLines={1}
        maxFontSizeMultiplier={typography.maxFontSizeMultiplier}
      >
        {stat.title}
      </Text>

      <Text
        className="font-khmerBold text-white text-3xl mt-1 text-center"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        maxFontSizeMultiplier={typography.maxFontSizeMultiplier}
        style={{ width: "100%" }}
      >
        {stat.value}
      </Text>

      <Text
        className="font-khmerMedium text-white/70 text-[16px] text-center mt-1"
        numberOfLines={1}
        maxFontSizeMultiplier={typography.maxFontSizeMultiplier}
      >
        {stat.unit}
      </Text>
    </Pressable>
  );
}