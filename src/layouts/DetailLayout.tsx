import { View } from "react-native";
import { Footer } from "../components/layout/Footer";

type TabKey = "dashboard" | "stock" | "orders" | "customers" | "income";

type DetailLayoutProps = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  children: React.ReactNode;
};

export function DetailLayout({ activeTab, onTabPress, children }: DetailLayoutProps) {
  return (
    <View className="flex-1" style={{ height: "100%" }}>
      <View className="flex-1" style={{ minHeight: 0 }}>
        {children}
      </View>

      <Footer activeTab={activeTab} onTabPress={onTabPress} />
    </View>
  );
}