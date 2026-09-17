import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ChartPoint } from "../types/income.types";

type RevenueBarChartProps = {
  data: ChartPoint[];
  totalIncome?: number;
  height?: number;
};

const MAX_RENDERED_BARS = 20;
const Y_AXIS_TICKS = 4;
const Y_AXIS_WIDTH = 36;
const LABEL_AREA_HEIGHT = 16;
const MIN_BAR_WIDTH = 8;
const MAX_BAR_WIDTH = 26;

// Purple, matching the reference design. The API only returns a single
// revenue value per point, so we render one series (no fabricated 2nd bar).
const BAR_COLOR = "#7C5CFC";
const GRID_COLOR = "#E7E5F5";
const AXIS_TEXT_COLOR = "#9CA3AF";

/* ── Downsampling (unchanged from the original implementation) ── */
function downsample(
  data: ChartPoint[],
  maxPoints: number
): ChartPoint[] {
  if (data.length <= maxPoints) {
    return data;
  }

  const bucketSize = data.length / maxPoints;
  const result: ChartPoint[] = [];

  for (let i = 0; i < maxPoints; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.floor((i + 1) * bucketSize);
    const bucket = data.slice(start, Math.max(end, start + 1));

    if (bucket.length === 0) {
      continue;
    }

    const average =
      bucket.reduce(
        (sum, point) => sum + (Number(point.amount) || 0),
        0
      ) / bucket.length;

    const middlePoint = bucket[Math.floor(bucket.length / 2)];

    result.push({
      ...middlePoint,
      amount: average,
    });
  }

  return result;
}

function getVisibleLabelIndices(count: number) {
  const maxLabels = 6;

  if (count <= maxLabels) {
    return new Set(
      Array.from({ length: count }, (_, index) => index)
    );
  }

  const step = Math.ceil((count - 1) / (maxLabels - 1));
  const indices = new Set<number>();

  for (let i = 0; i < count; i += step) {
    indices.add(i);
  }

  indices.add(count - 1);

  return indices;
}

/* ── "Nice number" Y-axis scaling: picks a rounded max/step instead of
   always defaulting to a hardcoded ceiling like $40. ── */
function niceNumber(value: number): number {
  if (value <= 0) return 1;

  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);

  let niceFraction: number;

  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;

  return niceFraction * Math.pow(10, exponent);
}

function computeYAxis(maxValue: number, ticks: number) {
  const safeMax = Math.max(maxValue, 1);
  const step = niceNumber(safeMax / ticks) || 1;
  const axisMax = step * ticks;

  const values: number[] = [];
  for (let i = ticks; i >= 0; i--) {
    values.push(step * i);
  }

  return { axisMax, values };
}

function formatAxisValue(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  if (Number.isInteger(value)) return `$${value}`;
  return `$${value.toFixed(1)}`;
}

function formatBarValue(amount: number): string {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  if (amount >= 100 || Number.isInteger(amount)) return amount.toFixed(0);
  return amount.toFixed(1);
}

/* ── Single animated bar. Owns its own shared value so each bar animates
   independently and smoothly from 0 → target whenever its amount changes
   (including on month switch, since RevenueBarChart is remounted per
   month by the parent screen's `key`, which naturally resets bars to 0
   and animates them up to the new month's values). ── */
type AnimatedBarProps = {
  amount: number;
  axisMax: number;
  barHeight: number;
  barWidth: number;
};

function AnimatedBar({
  amount,
  axisMax,
  barHeight,
  barWidth,
}: AnimatedBarProps) {
  const targetHeight =
    axisMax > 0 && amount > 0
      ? Math.max((amount / axisMax) * barHeight, 3)
      : 0;

  const animatedHeight = useSharedValue(0);

  useEffect(() => {
    animatedHeight.value = withTiming(targetHeight, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  return (
    <View
      className="items-center justify-end"
      style={{ height: LABEL_AREA_HEIGHT + barHeight, width: "100%" }}
    >
      <View
        style={{ height: LABEL_AREA_HEIGHT }}
        className="items-center justify-end"
      >
        {amount > 0 && (
          <Text
            className="font-khmer text-[10px] text-gray-500"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {formatBarValue(amount)}
          </Text>
        )}
      </View>

      <Animated.View
        className="rounded-t-xl"
        style={[
          {
            width: barWidth,
            backgroundColor: BAR_COLOR,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

export function RevenueBarChart({
  data,
  totalIncome = 0,
  height = 180,
}: RevenueBarChartProps) {
  // Measures the actual space the chart has inside its parent card, so
  // bar/grid sizing is always responsive to the real container — not a
  // hardcoded desktop width and not just the raw screen width (which
  // wouldn't account for card padding/margins).
  const [plotWidth, setPlotWidth] = useState(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setPlotWidth((previous) =>
      Math.abs(previous - width) > 1 ? width : previous
    );
  }, []);

  const displayData = useMemo(
    () => downsample(data ?? [], MAX_RENDERED_BARS),
    [data]
  );

  const safeTotalIncome = Math.max(Number(totalIncome) || 0, 0);

  const maxAmount = useMemo(() => {
    const highestBar = Math.max(
      ...displayData.map((point) => Number(point.amount) || 0),
      0
    );

    return Math.max(highestBar, safeTotalIncome, 1);
  }, [displayData, safeTotalIncome]);

  const yAxis = useMemo(
    () => computeYAxis(maxAmount, Y_AXIS_TICKS),
    [maxAmount]
  );

  const visibleLabelIndices = useMemo(
    () => getVisibleLabelIndices(displayData.length),
    [displayData.length]
  );

  const barHeight = Math.max(
    height - 42 - LABEL_AREA_HEIGHT,
    40
  );

  const barWidth = useMemo(() => {
    if (displayData.length === 0 || plotWidth <= 0) {
      return MIN_BAR_WIDTH;
    }

    const slotWidth = plotWidth / displayData.length;

    return Math.max(
      Math.min(slotWidth * 0.5, MAX_BAR_WIDTH),
      MIN_BAR_WIDTH
    );
  }, [displayData.length, plotWidth]);

  if (displayData.length === 0) {
    return (
      <View
        className="w-full items-center justify-center"
        style={{ height }}
      >
        <Text className="font-khmer text-sm text-gray-400">
          មិនមានទិន្នន័យចំណូល
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full flex-row" style={{ height }}>
      {/* Y Axis */}
      <View
        style={{
          width: Y_AXIS_WIDTH,
          height: barHeight,
          marginTop: LABEL_AREA_HEIGHT,
        }}
        className="justify-between pr-1"
      >
        {yAxis.values.map((value, index) => (
          <Text
            key={`y-${index}`}
            className="text-right font-khmer text-[9px]"
            style={{ color: AXIS_TEXT_COLOR }}
            numberOfLines={1}
          >
            {formatAxisValue(value)}
          </Text>
        ))}
      </View>

      {/* Plot area: grid (dotted) behind the bars, X-axis labels below */}
      <View className="flex-1" onLayout={onLayout}>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: LABEL_AREA_HEIGHT,
            left: 0,
            right: 0,
            height: barHeight,
            justifyContent: "space-between",
          }}
        >
          {yAxis.values.map((_, index) => (
            <View
              key={`grid-${index}`}
              style={{
                borderTopWidth: 1,
                borderColor: GRID_COLOR,
                borderStyle: "dashed",
              }}
            />
          ))}
        </View>

        <View className="flex-row items-end">
          {displayData.map((item, index) => {
            const amount = Number(item.amount) || 0;
            const showLabel = visibleLabelIndices.has(index);

            return (
              <View
                key={`${item.label}-${index}`}
                className="items-center"
                style={{ flex: 1, minWidth: 0 }}
              >
                <AnimatedBar
                  amount={amount}
                  axisMax={yAxis.axisMax}
                  barHeight={barHeight}
                  barWidth={barWidth}
                />

                <Text
                  className="mt-2 font-khmer text-[10px] text-gray-500"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}
                  style={{
                    width: "100%",
                    textAlign: "center",
                    paddingHorizontal: 1,
                  }}
                >
                  {showLabel ? String(item.label) : ""}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}