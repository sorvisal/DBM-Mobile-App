import type React from "react";
import { View } from "react-native";

import { Header } from "../components/layout/Header";
import {
  Footer,
  TABS,
} from "../components/layout/Footer";

type TabKey =
  | "dashboard"
  | "stock"
  | "orders"
  | "customers"
  | "income"
  | "more";

type MainLayoutProps = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  onMenuPress: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
  hideChrome?: boolean;
  children: React.ReactNode;
};

export function MainLayout({
  activeTab,
  onTabPress,
  onMenuPress,
  onNotificationPress,
  notificationCount = 0,
  hideChrome = false,
  children,
}: MainLayoutProps) {
  const tabLabel =
    TABS.find((tab) => tab.key === activeTab)?.label ??
    "DBM App";

  return (
    <View
      className="flex-1"
      style={{
        minHeight: 0,
        minWidth: 0,
        backgroundColor: "#F8FAFC",
      }}
    >
      {/* Header */}
      {!hideChrome && (
        <Header
          title={tabLabel}
          onMenuPress={onMenuPress}
          onNotificationPress={onNotificationPress}
          notificationCount={notificationCount}
        />
      )}

      {/* Main content */}
      <View
        className="flex-1"
        style={{
          minHeight: 0,
          minWidth: 0,
        }}
      >
        {children}
      </View>

      {/* Footer */}
      {!hideChrome && (
        <Footer
          activeTab={activeTab}
          onTabPress={onTabPress}
        />
      )}
    </View>
  );
}