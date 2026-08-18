import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services";
import type { StockMovement } from "@/types/api";
import { DateField } from "./DateField";

const PERIODS = ["ទាំងអស់", "ចូល", "ចេញ"] as const;
type Period = (typeof PERIODS)[number];
type PeriodColors = Record<Period, string>;
const PERIOD_COLORS: PeriodColors = {
  "ទាំងអស់": "bg-blue-600",
  "ចូល": "bg-green-600",
  "ចេញ": "bg-red-600",
};

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function StockFilterTabs() {
  const [activePeriod, setActivePeriod] = useState<Period>("ទាំងអស់");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    api.stock
      .movements({ page: 1, pageSize: 500 })
      .then((res) => {
        if (cancelled) return;
        const unique = (res.items ?? []).filter(
          (m: StockMovement, idx: number, arr: StockMovement[]) => arr.findIndex((x) => x.id === m.id) === idx
        );
        setMovements(unique);
      })
      .catch(() => {
        if (cancelled) return;
        setError("បរាជ័យក្នុងការទាញយកទិន្នន័យ");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = movements.filter((m) => {
    const date = new Date(m.createdAt);
    const selected = new Date(selectedDate);
    if (date.toDateString() !== selected.toDateString()) return false;
    if (activePeriod === "ចូល") return m.type === "in";
    if (activePeriod === "ចេញ") return m.type === "out";
    return true;
  });

  const grouped = filtered.reduce<Record<string, StockMovement[]>>((acc, m) => {
    const key = formatDate(new Date(m.createdAt));
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Period tabs */}
      <View className="flex-row items-center gap-2 px-5 py-3 bg-white">
        {PERIODS.map((period) => {
          const isActive = period === activePeriod;
          return (
            <TouchableOpacity
              key={period}
              onPress={() => setActivePeriod(period)}
              className={`px-4 py-2 rounded-full ${isActive ? PERIOD_COLORS[period] : "bg-gray-100"}`}
            >
              <Text className={`font-khmer text-xl ${isActive ? "text-white" : "text-gray-600"}`}>
                {period}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={() => {}}
          className="flex-1 flex-row items-center justify-end gap-1.5"
        >
                 <DateField
          placeholder="ជ្រើសរើសកាលបរិច្ឆេទ"
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
        />
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 px-5 pt-1" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="items-center py-16">
            <Text className="font-khmer text-gray-400 text-xl">កំពុងទាញយក...</Text>
          </View>
        ) : error ? (
          <View className="items-center py-16">
            <Ionicons name="alert-circle-outline" size={36} color="#DC2626" />
            <Text className="font-khmer text-gray-400 text-xl mt-2">{error}</Text>
          </View>
        ) : Object.keys(grouped).length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="time-outline" size={36} color="#D1D5DB" />
            <Text className="font-khmer text-gray-400 text-xl mt-2">មិនមានប្រវត្តិ</Text>
          </View>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <View key={date}>
              <Text className="font-khmer text-gray-500 text-lg mb-2">{date}</Text>
              {items.map((m, i) => (
                <MovementCard key={m.id ?? i} movement={m} />
              ))}
            </View>
          ))
        )}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}

function MovementCard({ movement }: { movement: StockMovement }) {
  const isIncoming = movement.type === "in";
  const quantityChange = isIncoming ? movement.quantity : -movement.quantity;

  return (
    <View className="flex-row items-center bg-white rounded-2xl p-3 mb-3">
      <View
        className={`w-9 h-9 rounded-full items-center justify-center ${
          isIncoming ? "bg-green-50" : "bg-red-50"
        }`}
      >
        <Ionicons
          name={isIncoming ? "arrow-down-outline" : "arrow-up-outline"}
          size={20}
          color={isIncoming ? "#16A34A" : "#DC2626"}
        />
      </View>

      <View className="flex-1 ml-3">
        <Text className="font-khmerMedium text-gray-900 text-xl" numberOfLines={1}>
          {movement.productName ?? movement.productId}
        </Text>
        <Text className="font-khmer text-gray-400 text-[16px] mt-0.5" numberOfLines={1}>
          {movement.note ?? (isIncoming ? "ចូលស្តុក" : "លក់ចេញ")}
        </Text>
      </View>

      <View className="items-end">
        <Text className={`font-khmerBold text-xl ${isIncoming ? "text-green-600" : "text-red-600"}`}>
          {isIncoming ? "+" : ""}
          {quantityChange} កេស
        </Text>
        <Text className="font-khmer text-gray-400 text-[16px] mt-0.5">
          {new Date(movement.createdAt).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );
}
