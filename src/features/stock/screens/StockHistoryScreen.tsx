import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StockTabBar } from "../components/StockTabBar";
import { StockFilterTabs } from "../components/StockFilterTabs";
import { StockHistoryItem } from "../components/StockHistoryItem";
import { DatePickerModal } from "../components/DatePickerModal";
import type { StockTabKey } from "./StockScreen";

const HISTORY_BY_DATE = [
  {
    date: "25/05/2025",
    items: [
      { id: "1", productName: "Coca-Cola 330ml (កំប៉ុង)", note: "ចូលពីស្តុក", time: "10:30 AM", quantityChange: -100 },
      { id: "2", productName: "កញ្ចប់អំណោយ Pepsi (កំប៉ុង)", note: "លក់ចេញទីតាំង ABC", time: "02:15 PM", quantityChange: -20 },
      { id: "3", productName: "Fanta Orange (កំប៉ុង)", note: "ចូលពីស្តុក", time: "04:45 PM", quantityChange: 50 },
      { id: "4", productName: "IDOL 330ml (កំប៉ុង)", note: "ចូលពីស្តុក", time: "10:30 AM", quantityChange: 100 },
      { id: "5", productName: "Sting (កំប៉ុង)", note: "ចូលពីស្តុក", time: "02:15 PM", quantityChange: -20 },
      { id: "6", productName: "Crud (កំប៉ុង)", note: "ចូលពីស្តុក", time: "04:45 PM", quantityChange: 50 },
    ],
  },
  {
    date: "24/05/2025",
    items: [
      { id: "4", productName: "ទឹកសុទ្ធ 1.5L (ដប)", note: "លក់ចេញទីតាំង XYZ", time: "11:20 AM", quantityChange: -30 },
      { id: "5", productName: "Sprite 330ml (កំប៉ុង)", note: "ចូលពីស្តុក", time: "03:10 PM", quantityChange: 80 },
    ],
  },
] as const;

type StockHistoryScreenProps = {
  onNavigate: (tab: StockTabKey) => void;
};

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function StockHistoryScreen({ onNavigate }: StockHistoryScreenProps) {
  const [activePeriod, setActivePeriod] = useState<"ទាំងអស់" | "ចូល" | "ចេញ">("ទាំងអស់");
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 4, 25));
  const [pickerVisible, setPickerVisible] = useState(false);

  const filteredHistory = HISTORY_BY_DATE.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (activePeriod === "ចូល") return item.quantityChange > 0;
      if (activePeriod === "ចេញ") return item.quantityChange < 0;
      return true;
    }),
  })).filter((group) => group.items.length > 0);

  return (
    <View className="flex-1 bg-gray-50" style={{ minHeight: 0 }}>
      {/* Top navbar */}
      <View className="bg-white  px-5 pt-3 pb-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => onNavigate("products")}>
          <Ionicons name="menu-outline" size={36} color="#1F2937" />
        </TouchableOpacity>
        <Text className="font-khmerBold text-gray-900 text-3xl">ស្តុក</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Sub navbar */}
      <StockTabBar active="history" onChange={onNavigate} />
      <StockFilterTabs
        activePeriod={activePeriod}
        onSelectPeriod={setActivePeriod}
        selectedDate={formatDate(selectedDate)}
        onPressDate={() => setPickerVisible(true)}
      />
      <DatePickerModal
        visible={pickerVisible}
        initialDate={selectedDate}
        onCancel={() => setPickerVisible(false)}
        onConfirm={(date) => {
          setSelectedDate(date);
          setPickerVisible(false);
        }}
      />
      <ScrollView className="flex-1 px-5 pt-1" showsVerticalScrollIndicator={false}>
        {filteredHistory.map((group) => (
          <View key={group.date} className="mb-1">
            <Text className="font-khmer text-gray-400 text-xl mb-2 mt-2">{group.date}</Text>
            {group.items.map((item) => (
              <StockHistoryItem
                key={item.id}
                productName={item.productName}
                note={item.note}
                time={item.time}
                quantityChange={item.quantityChange}
              />
            ))}
          </View>
        ))}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}