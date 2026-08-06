import { View } from "react-native";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

type TabKey = "dashboard" | "stock" | "orders" | "customers" | "income";

type MainLayoutProps = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  children: React.ReactNode;
};

export function MainLayout({ activeTab, onTabPress, children }: MainLayoutProps) {
  return (
    <View className="flex-1" style={{ height: "100%" }}>
      <Header />

      <View className="flex-1" style={{ minHeight: 0 }}>
        {children}
      </View>

      <Footer activeTab={activeTab} onTabPress={onTabPress} />
    </View>
  );
}