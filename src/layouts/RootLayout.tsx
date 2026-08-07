import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { MainLayout } from "./MainLayout";
import { DetailLayout } from "./DetailLayout";

import { DashboardScreen } from "../features/dashboard/screens/DashboardScreen";
import { StockScreen } from "../features/stock/screens/StockScreen";
import { OrdersScreen } from "../features/orders/screens/OrdersScreen";

type TabKey = "dashboard" | "stock" | "orders" | "customers" | "income";

export function RootLayout() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardScreen />;
      case "stock":
        return <StockScreen />;
      case "orders":
        return <OrdersScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const usesDetailLayout = activeTab === "stock" || activeTab === "orders" || activeTab === "customers" || activeTab === "income";
  const Layout = usesDetailLayout ? DetailLayout : MainLayout;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ height: "100%" }}>
      <Layout activeTab={activeTab} onTabPress={setActiveTab}>
        {renderContent()}
      </Layout>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}