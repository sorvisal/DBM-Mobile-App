import { View, Text } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { ChartPoint } from "../types/income.types";

type RevenueAreaChartProps = {
  data: ChartPoint[];
  height?: number;
};

export function RevenueAreaChart({ data, height = 140 }: RevenueAreaChartProps) {
  const width = 320;
  const paddingTop = 28;
  const paddingBottom = 24;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);
  const minAmount = Math.min(...data.map((d) => d.amount), 0);
  const range = maxAmount - minAmount || 1;

  const stepX = width / (data.length - 1 || 1);

  const points = data.map((point, index) => {
    const x = index * stepX;
    const y = paddingTop + chartHeight - ((point.amount - minAmount) / range) * chartHeight;
    return { x, y, amount: point.amount, label: point.label };
  });

  // Build a smooth path using simple cubic bezier between points
  function buildSmoothPath(pts: { x: number; y: number }[]) {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const midX = (curr.x + next.x) / 2;
      path += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  }

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${paddingTop + chartHeight} L ${points[0]?.x ?? 0} ${paddingTop + chartHeight} Z`;

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2563EB" stopOpacity={0.25} />
            <Stop offset="1" stopColor="#2563EB" stopOpacity={0} />
          </LinearGradient>
        </Defs>

        <Path d={areaPath} fill="url(#areaFill)" />
        <Path d={linePath} stroke="#2563EB" strokeWidth={2.5} fill="none" />

        {points.map((point, index) => (
          <Circle key={index} cx={point.x} cy={point.y} r={4} fill="#2563EB" stroke="white" strokeWidth={2} />
        ))}
      </Svg>

      {/* Value labels above each point */}
      <View className="absolute left-0 right-0" style={{ top: 0, height: paddingTop }}>
        {points.map((point, index) => (
          <Text
            key={index}
            className="font-khmerBold text-blue-600 text-[14px]"
            style={{
              position: "absolute",
              left: `${(point.x / width) * 100}%`,
              top: Math.max(point.y - 22, 0),
              transform: [{ translateX: -14 }],
            }}
          >
            ${point.amount}
          </Text>
        ))}
      </View>

      {/* X-axis labels */}
      <View className="flex-row justify-between mt-1">
        {data.map((point) => (
          <Text key={point.label} className="font-khmer text-gray-400 text-[12px]">
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
}