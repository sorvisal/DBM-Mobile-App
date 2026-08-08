import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TabKey = "add" | "history" | "products" | "expiry";

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: "add", label: "បញ្ចូលស្តុកថ្មី", icon: "add-circle-outline", color: "#2563EB" },
  { key: "history", label: "ស្តុកចេញចូល", icon: "sync-outline", color: "#2563EB" },
  { key: "products", label: "ស្តុកសរុប", icon: "cube-outline", color: "#2563EB" },
  { key: "expiry", label: "ស្តុកផុតកំណត់", icon: "calendar-outline", color: "#2563EB" },
];

type StockTabBarProps = {
  active: TabKey;
  onChange: (key: TabKey) => void;
};

export function StockTabBar({ active, onChange }: StockTabBarProps) {
  return (
    <View className="flex-row bg-gray-50 px-2 py-3 border-b border-gray-100">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity key={tab.key} onPress={() => onChange(tab.key)} className="flex-1 items-center">
            <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: isActive ? tab.color : `${tab.color}1A` }}>
              <Ionicons name={tab.icon} size={24} color={isActive ? "white" : tab.color} />
            </View>
            <Text className={`font-khmerMedium text-[18px] mt-1 text-center ${ isActive ? "text-gray-900" : "text-gray-400" }`} numberOfLines={1}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}