import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TabKey = "dashboard" | "stock" | "orders" | "customers" | "income";

type FooterProps = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
};

const TABS: {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "dashboard", label: "ទំព័រដើម", icon: "home-outline", activeIcon: "home" },
  { key: "stock", label: "ស្តុក", icon: "cube-outline", activeIcon: "cube" },
  { key: "orders", label: "ការបញ្ជាទិញ", icon: "cart-outline", activeIcon: "cart" },
  { key: "customers", label: "អតិថិជន", icon: "people-outline", activeIcon: "people" },
  { key: "income", label: "ចំណូល", icon: "bar-chart-outline", activeIcon: "bar-chart" },
];

export function Footer({ activeTab, onTabPress }: FooterProps) {
  return (
    <View
      className="
        h-20
        bg-white
        border-t
        border-gray-200
        flex-row
        items-center
        justify-around
        pb-2
      "
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            className="items-center justify-center flex-1"
            accessibilityRole="button"
            accessibilityLabel={tab.label}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={22}
              color={isActive ? "#2563EB" : "#9CA3AF"}
            />
            <Text
              className={
                isActive
                  ? "font-khmer text-[10px] text-blue-600 mt-1"
                  : "font-khmer text-[10px] text-gray-400 mt-1"
              }
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}