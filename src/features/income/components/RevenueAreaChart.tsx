import React, { useMemo, useCallback, useState } from "react";
import { View, Text } from "react-native";
import Svg, {
  Path,
  Circle,
  Line,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { ChartPoint } from "../types/income.types";

type RevenueAreaChartProps = {
  data: ChartPoint[];
  height?: number;
  showYAxis?: boolean;
  showGrid?: boolean;
};

// ── constants ─────────────────────────────────────────────
const CHART_COLOR = "#2563EB";
const GRID_COLOR = "#E5E7EB";
const AXIS_LABEL_COLOR = "#9CA3AF";
const Y_AXIS_WIDTH = 36;
const H_PADDING = 16;
const MAX_RENDERED_POINTS = 30;
const COMPACT_WIDTH_THRESHOLD = 300; // below this, drop Y-axis + shrink padding

// ── helpers ───────────────────────────────────────────────

function niceStep(rough: number) {
  if (rough <= 0) return 1;
  const exp = Math.floor(Math.log10(rough));
  const base = rough / Math.pow(10, exp);
  let niceBase = 1;
  if (base >= 5) niceBase = 5;
  else if (base >= 2) niceBase = 2;
  return niceBase * Math.pow(10, exp);
}

function cleanNumber(n: number) {
  return Math.round(n * 1000) / 1000;
}

function buildYAxis(maxAmount: number, minAmount: number, ticks = 4) {
  const safeMax = maxAmount > 0 ? maxAmount : 100;
  const step = niceStep(safeMax / ticks) || 1;
  const niceMax = Math.ceil(safeMax / step) * step;

  const values: number[] = [];
  const stepCount = Math.round(niceMax / step);
  for (let i = 0; i <= stepCount; i++) {
    values.push(cleanNumber(i * step));
  }

  return { values: values.reverse(), niceMax: cleanNumber(niceMax), niceMin: Math.min(0, minAmount) };
}

function formatAxisValue(n: number) {
  const rounded = cleanNumber(n);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

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

function buildSmoothPath(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  let path = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

function getVisibleLabelIndices(count: number) {
  const targetLabels = 4;
  if (count <= targetLabels) return new Set(Array.from({ length: count }, (_, i) => i));

  const step = Math.ceil((count - 1) / (targetLabels - 1));
  const indices = new Set<number>();
  for (let i = 0; i < count; i += step) indices.add(i);
  indices.add(count - 1);
  return indices;
}

export function RevenueAreaChart({
  data,
  height = 180,
  showYAxis = true,
  showGrid = true,
}: RevenueAreaChartProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const chartWidth = containerWidth;
  const isCompact = chartWidth > 0 && chartWidth < COMPACT_WIDTH_THRESHOLD;
  const effectiveShowYAxis = showYAxis && !isCompact;
  const effectiveHPadding = isCompact ? 8 : H_PADDING;

  const plottableWidth = chartWidth - (effectiveShowYAxis ? Y_AXIS_WIDTH : 0) - effectiveHPadding * 2;

  const paddingTop = 28;
  const paddingBottom = 24;
  const chartHeight = height - paddingTop - paddingBottom;

  const displayData = useMemo(
    () => downsample(data ?? [], MAX_RENDERED_POINTS),
    [data]
  );

  const { points, yAxis, areaPath, linePath } = useMemo(() => {
    if (!displayData?.length || chartWidth === 0) {
      return { points: [], yAxis: null, areaPath: "", linePath: "" };
    }

    const amounts = displayData.map((d) => d.amount);
    const maxAmount = Math.max(...amounts, 0);
    const minAmount = Math.min(...amounts, 0);

    const axis = buildYAxis(maxAmount, minAmount);
    const range = axis.niceMax - axis.niceMin || 1;

    const stepX = plottableWidth / (displayData.length - 1 || 1);
    const originX = effectiveShowYAxis ? Y_AXIS_WIDTH : 0;

    const pts = displayData.map((point, index) => {
      const x = originX + effectiveHPadding + index * stepX;
      const y =
        paddingTop +
        chartHeight -
        ((point.amount - axis.niceMin) / range) * chartHeight;

      return { x, y, amount: point.amount, label: point.label };
    });

    const line = buildSmoothPath(pts);
    const area = `${line}
      L ${pts[pts.length - 1]?.x ?? 0} ${paddingTop + chartHeight}
      L ${pts[0]?.x ?? 0} ${paddingTop + chartHeight}
      Z`;

    return { points: pts, yAxis: axis, areaPath: area, linePath: line };
  }, [displayData, plottableWidth, chartHeight, paddingTop, effectiveShowYAxis, effectiveHPadding, chartWidth]);

  const visibleLabelIndices = useMemo(
    () => getVisibleLabelIndices(displayData.length),
    [displayData.length]
  );

  const getLabelTop = useCallback(
    (index: number) => {
      const point = points[index];
      if (!point) return paddingTop;
      let top = Math.max(point.y - 22, 2);

      const prev = points[index - 1];
      if (prev && Math.abs(prev.y - point.y) < 18) {
        top = index % 2 === 0 ? top : top - 14;
      }
      return Math.max(top, 2);
    },
    [points, paddingTop]
  );

  if (!data || data.length === 0) {
    return (
      <View
        className="items-center justify-center py-10"
        style={{ height }}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Text className="font-khmer text-gray-400 text-base">
          មិនមានទិន្នន័យ
        </Text>
      </View>
    );
  }

  return (
    <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      {chartWidth > 0 && (
        <View style={{ width: chartWidth, height }}>
          <Svg width={chartWidth} height={height} viewBox={`0 0 ${chartWidth} ${height}`}>
            <Defs>
              <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={CHART_COLOR} stopOpacity={0.15} />
                <Stop offset="1" stopColor={CHART_COLOR} stopOpacity={0} />
              </LinearGradient>
            </Defs>

            {showGrid &&
              yAxis?.values.map((value) => {
                const y =
                  paddingTop +
                  chartHeight -
                  ((value - yAxis.niceMin) / (yAxis.niceMax - yAxis.niceMin || 1)) *
                    chartHeight;
                const lineStartX = effectiveShowYAxis ? Y_AXIS_WIDTH : 0;

                return (
                  <Line
                    key={`grid-${value}`}
                    x1={lineStartX}
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke={GRID_COLOR}
                    strokeWidth={1}
                  />
                );
              })}

            <Path d={areaPath} fill="url(#areaFill)" />
            <Path d={linePath} stroke={CHART_COLOR} strokeWidth={2} fill="none" />

            {points.map((point, index) => (
              <Circle
                key={`${point.label}-${index}`}
                cx={point.x}
                cy={point.y}
                r={4}
                fill={CHART_COLOR}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Svg>

          {effectiveShowYAxis && yAxis && (
            <View
              className="absolute left-0"
              style={{ top: paddingTop, height: chartHeight, width: Y_AXIS_WIDTH }}
            >
              {yAxis.values.map((value) => {
                const y =
                  ((yAxis.niceMax - value) / (yAxis.niceMax - yAxis.niceMin || 1)) *
                  chartHeight;
                return (
                  <Text
                    key={`ylabel-${value}`}
                    className="text-[11px]"
                    style={{ position: "absolute", top: y - 7, left: 0, color: AXIS_LABEL_COLOR }}
                  >
                    {formatAxisValue(value)}
                  </Text>
                );
              })}
            </View>
          )}

          <View
            className="absolute left-0 right-0"
            style={{ top: 0, height: paddingTop + chartHeight }}
          >
            {points.map((point, index) =>
              visibleLabelIndices.has(index) ? (
                <Text
                  key={`${point.label}-value-${index}`}
                  className="font-khmerBold text-blue-600 text-[12px]"
                  style={{
                    position: "absolute",
                    left: point.x,
                    top: getLabelTop(index),
                    transform: [{ translateX: -14 }],
                  }}
                >
                  ${Math.round(point.amount)}
                </Text>
              ) : null
            )}
          </View>

          <View
            className="absolute left-0 right-0"
            style={{ top: paddingTop + chartHeight + 4, height: 16 }}
          >
            {points.map((point, index) =>
              visibleLabelIndices.has(index) ? (
                <Text
                  key={`${point.label}-x-${index}`}
                  className="font-khmer text-[11px]"
                  style={{
                    position: "absolute",
                    left: point.x,
                    top: 0,
                    color: AXIS_LABEL_COLOR,
                    transform: [{ translateX: -20 }],
                  }}
                >
                  {point.label}
                </Text>
              ) : null
            )}
          </View>
        </View>
      )}
    </View>
  );
}