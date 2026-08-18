import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type MoreAction = {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
};

const MORE_ACTIONS: MoreAction[] = [
  { key: "stock", title: "ស្តុក", subtitle: "គ្របគ្រងស្តុក", icon: "cube-outline", iconBg: "bg-blue-50", iconColor: "#2563EB" },
  { key: "orders", title: "កំរង", subtitle: "គ្របគ្រងកំរង", icon: "cart-outline", iconBg: "bg-green-50", iconColor: "#16A34A" },
  { key: "customers", title: "អតិថិជន", subtitle: "គ្របគ្រងអតិថិជន", icon: "people-outline", iconBg: "bg-purple-50", iconColor: "#9333EA" },
  { key: "income", title: "ចំណូល", subtitle: "របាយការណ៍ចំណូល", icon: "bar-chart-outline", iconBg: "bg-orange-50", iconColor: "#EA580C" },
  { key: "reports", title: "របាយការណ៍", subtitle: "របាយការណ៍ទូទៅ", icon: "document-outline", iconBg: "bg-cyan-50", iconColor: "#0891B2" },
  { key: "settings", title: "កំរង", subtitle: "ការកំរងមូលដ្ឋាន", icon: "settings-outline", iconBg: "bg-gray-50", iconColor: "#4B5563" },
];

type MoreScreenProps = {
  onNavigateTab?: (tab: string) => void;
};

export function MoreScreen({ onNavigateTab }: MoreScreenProps) {
  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-4 pb-6">
        <Text className="font-khmerBold text-3xl text-gray-900">ផ្សេងៗ</Text>
        <Text className="font-khmer text-gray-400 text-lg mt-1">ជ្រើសរើសមុខងារ</Text>
      </View>

      <View className="px-5 pb-6">
        <View className="bg-white rounded-2xl p-4 gap-2">
          {MORE_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.key}
              onPress={() => onNavigateTab?.(action.key)}
              className="flex-row items-center py-3"
            >
              <View className={`w-11 h-11 rounded-xl ${action.iconBg} items-center justify-center mr-4`}>
                <Ionicons name={action.icon} size={22} color={action.iconColor} />
              </View>
              <View className="flex-1">
                <Text className="font-khmerBold text-gray-900 text-xl">{action.title}</Text>
                <Text className="font-khmer text-gray-400 text-lg mt-0.5">{action.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
