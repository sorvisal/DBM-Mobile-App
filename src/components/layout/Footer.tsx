import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabKey = "dashboard" | "stock" | "orders" | "customers" | "income" | "more";

type FooterProps = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
};

export const TABS: {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "dashboard", label: "ទំព័រដើម", icon: "home-outline", activeIcon: "home" },
  { key: "stock", label: "ស្តុក", icon: "cube-outline", activeIcon: "cube" },
  { key: "orders", label: "បញ្ជាទិញ", icon: "cart-outline", activeIcon: "cart" },
  { key: "customers", label: "អតិថិជន", icon: "people-outline", activeIcon: "people" },
  { key: "income", label: "ចំណូល", icon: "bar-chart-outline", activeIcon: "bar-chart" },
];

export function Footer({ activeTab, onTabPress }: FooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white border-t border-gray-200 flex-row items-center justify-around pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            className="items-center justify-center flex-1 py-1"
            accessibilityRole="button"
            accessibilityLabel={tab.label}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={26}
              color={isActive ? "#2563EB" : "#9CA3AF"}
            />
            <Text
              className={
                isActive
                  ? "font-khmerMedium text-[13px] text-blue-600 mt-2"
                  : "font-khmerMedium text-[13px] text-gray-400 mt-2"
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
