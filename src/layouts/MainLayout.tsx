import { View } from "react-native";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { TABS } from "../components/layout/Footer";

type TabKey = "dashboard" | "stock" | "orders" | "customers" | "income" | "more";

type MainLayoutProps = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  onMenuPress: () => void;
  hideChrome?: boolean;
  children: React.ReactNode;
};

export function MainLayout({ activeTab, onTabPress, onMenuPress, hideChrome, children }: MainLayoutProps) {
  const tabLabel = TABS.find((t) => t.key === activeTab)?.label ?? "DBM App";

  return (
    <View className="flex-1" style={{ height: "100%" }}>
      {!hideChrome && <Header title={tabLabel} onMenuPress={onMenuPress} />}

      <View className="flex-1" style={{ minHeight: 0 }}>
        {children}
      </View>

      {!hideChrome && <Footer activeTab={activeTab} onTabPress={onTabPress} />}
    </View>
  );
}