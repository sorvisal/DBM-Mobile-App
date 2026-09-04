import { View, TouchableOpacity, Text } from "react-native";

export type IncomeTabKey = "overview" | "daily" | "monthly" | "yearly" | "debt";

const TABS: { key: IncomeTabKey; label: string }[] = [
  { key: "overview", label: "សរុប" },
  { key: "daily", label: "ប្រចាំថ្ងៃ" },
  { key: "monthly", label: "ប្រចាំខែ" },
  { key: "yearly", label: "ប្រចាំឆ្នាំ" },
  { key: "debt", label: "បំណុល" },
];

type IncomeTimeTabsProps = {
  active: IncomeTabKey;
  onChange: (key: IncomeTabKey) => void;
};

export function IncomeTimeTabs({ active, onChange }: IncomeTimeTabsProps) {
  return (
    <View className="flex-row px-3 pb-3 mt-3 justify-between">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className={`flex-1 items-center justify-center py-2.5 px-2 mx-0.5 rounded-full ${
              isActive ? "bg-blue-600" : "bg-gray-100"
            }`}
            style={{ minHeight: 40 }}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              allowFontScaling={false}
              className={`font-khmerMedium text-lg ${isActive ? "text-white" : "text-gray-600"}`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}