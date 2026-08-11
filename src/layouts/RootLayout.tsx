import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { MainLayout } from "./MainLayout";
import { DetailLayout } from "./DetailLayout";
import { SideMenu } from "../components/layout/SideMenu";

import { DashboardScreen } from "../features/dashboard/screens/DashboardScreen";
import { StockScreen } from "../features/stock/screens/StockScreen";
import { OrdersScreen } from "../features/orders/screens/OrdersScreen";
import { CustomersScreen } from "../features/customers/screens/CustomersScreen";
import { IncomeScreen } from "../features/income/screens/IncomeScreen";

type TabKey = "dashboard" | "stock" | "orders" | "customers" | "income";

type RootLayoutProps = {
  onLogout: () => void;
};

export function RootLayout({ onLogout }: RootLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [menuVisible, setMenuVisible] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardScreen onNavigateTab={setActiveTab} />;
      case "stock":
        return <StockScreen />;
      case "orders":
        return <OrdersScreen />;
      case "customers":
        return <CustomersScreen />;
      case "income":
        return <IncomeScreen />;
      default:
        return <DashboardScreen onNavigateTab={setActiveTab} />;
    }
  };

  const usesDetailLayout = activeTab !== "dashboard";
  const Layout = usesDetailLayout ? DetailLayout : MainLayout;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ height: "100%" }}>
      <Layout activeTab={activeTab} onTabPress={setActiveTab} onOpenMenu={() => setMenuVisible(true)}>
        {renderContent()}
      </Layout>

      <SideMenu
        visible={menuVisible}
        activeTab={activeTab}
        username="Visal"
        onSelectTab={setActiveTab}
        onOpen={() => setMenuVisible(true)}
        onClose={() => setMenuVisible(false)}
        onLogout={onLogout}
      />

      <StatusBar style="light" />
    </SafeAreaView>
  );
}