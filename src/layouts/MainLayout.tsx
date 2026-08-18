import { View } from "react-native";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { TABS } from "../components/layout/Footer";

type TabKey = "dashboard" | "stock" | "orders" | "customers" | "income" | "more";

type MainLayoutProps = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  onMenuPress: () => void;
  children: React.ReactNode;
};

export function MainLayout({ activeTab, onTabPress, onMenuPress, children }: MainLayoutProps) {
  const tabLabel = TABS.find((t) => t.key === activeTab)?.label ?? "DBM App";

  return (
    <View className="flex-1" style={{ height: "100%" }}>
      <Header title={tabLabel} onMenuPress={onMenuPress} />

      <View className="flex-1" style={{ minHeight: 0 }}>
        {children}
      </View>

      <Footer activeTab={activeTab} onTabPress={onTabPress} />
    </View>
  );
}