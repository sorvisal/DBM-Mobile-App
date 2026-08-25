import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { ChartPoint } from "../types/income.types";

type RevenueBarChartProps = {
  data: ChartPoint[];
  height?: number;
};

const BAR_COLOR = "#2563EB";
const LABEL_COLOR = "#9CA3AF";
const MAX_RENDERED_BARS = 20; // beyond this, thin bars get cramped — downsample instead

function downsample(data: ChartPoint[], maxPoints: number): ChartPoint[] {
  if (data.length <= maxPoints) return data;
  const bucketSize = data.length / maxPoints;
  const result: ChartPoint[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.floor((i + 1) * bucketSize);
    const bucket = data.slice(start, Math.max(end, start + 1));
    if (bucket.length === 0) continue;
    const avgAmount =
      bucket.reduce((sum, p) => sum + p.amount, 0) / bucket.length;
    const mid = bucket[Math.floor(bucket.length / 2)];
    result.push({ ...mid, amount: avgAmount });
  }
  return result;
}

/** Pick which bars get a value/date label, so dense ranges don't overlap */
function getVisibleLabelIndices(count: number) {
  const targetLabels = 6;
  if (count <= targetLabels) return new Set(Array.from({ length: count }, (_, i) => i));

  const step = Math.ceil((count - 1) / (targetLabels - 1));
  const indices = new Set<number>();
  for (let i = 0; i < count; i += step) indices.add(i);
  indices.add(count - 1);
  return indices;
}

export function RevenueBarChart({ data, height = 140 }: RevenueBarChartProps) {
  const displayData = useMemo(
    () => downsample(data ?? [], MAX_RENDERED_BARS),
    [data]
  );

  const maxAmount = useMemo(
    () => Math.max(...displayData.map((d) => d.amount), 1),
    [displayData]
  );

  const visibleLabelIndices = useMemo(
    () => getVisibleLabelIndices(displayData.length),
    [displayData.length]
  );

  // wider bars when there are few of them, narrower when there are many —
  // percentage width (relative to each flex-1 column) instead of a fixed px value
  const barWidthPercent = useMemo(() => {
    if (displayData.length <= 7) return "45%";
    if (displayData.length <= 14) return "60%";
    return "70%";
  }, [displayData.length]);

  if (!data || data.length === 0) {
    return (
      <View
        className="items-center justify-center py-10"
        style={{ height: height + 32 }}
      >
        <Text className="font-khmer text-gray-400 text-base">
          មិនមានទិន្នន័យ
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-end justify-between" style={{ height: height + 32 }}>
      {displayData.map((point, index) => {
        const barHeight = Math.max((point.amount / maxAmount) * height, 4);
        const showLabel = visibleLabelIndices.has(index);

        return (
          <View key={`${point.label}-${index}`} className="items-center flex-1">
            <Text
              className="font-khmerBold text-blue-600 text-[12px] mb-1"
              numberOfLines={1}
              style={{ opacity: showLabel ? 1 : 0 }}
            >
              ${Math.round(point.amount)}
            </Text>
            <View
              className="rounded-t-md"
              style={{ height: barHeight, width: barWidthPercent, backgroundColor: BAR_COLOR }}
            />
            <Text
              className="font-khmer text-[11px] mt-1.5"
              numberOfLines={1}
              style={{ color: LABEL_COLOR, opacity: showLabel ? 1 : 0 }}
            >
              {point.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}