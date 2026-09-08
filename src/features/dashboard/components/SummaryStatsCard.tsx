import { Fragment } from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { typography } from "@/theme";
import { DashboardStat } from "../types/dashboard.types";
import { StatItem } from "./StatItem";

type SummaryStatsCardProps = {
  stats: DashboardStat[];
  onPressStat?: (stat: DashboardStat) => void;
};

export function SummaryStatsCard({
  stats,
  onPressStat,
}: SummaryStatsCardProps) {
  return (
    <View className="mx-5 bg-blue-600 rounded-2xl p-4">
      <View className="flex-row items-center gap-1.5 mb-4">
        <View className="bg-white/30 rounded-full p-1">
          <Feather
            name="trending-up"
            size={24}
            color="rgba(255,255,255,0.85)"
          />
        </View>

        <Text
          className="font-khmerMedium text-white/85 text-xl"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          maxFontSizeMultiplier={typography.maxFontSizeMultiplier}
          style={{ flexShrink: 1, width: "91%" }}
        >
          សង្ខេបព័ត៌មានប្រចាំថ្ងៃ
        </Text>
      </View>

      <View className="flex-row items-stretch">
        {stats.map((stat, index) => (
          <Fragment key={stat.key}>
            <StatItem
              stat={stat}
              onPress={() => onPressStat?.(stat)}
            />
            {index !== stats.length - 1 && (
              <View className="w-px bg-white/20 mx-1 my-1" />
            )}
          </Fragment>
        ))}
      </View>
    </View>
  );
}