import { useCallback, useLayoutEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useAuth } from "../hooks/useAuth";
import { MainLayout } from "./MainLayout";
import { Profile } from "../components/layout/Profile";

import { DashboardScreen } from "../features/dashboard/screens/DashboardScreen";
import { StockScreen } from "../features/stock/screens/StockScreen";
import { OrdersScreen } from "../features/orders/screens/OrdersScreen";
import { CustomersScreen } from "../features/customers/screens/CustomersScreen";
import { IncomeScreen } from "../features/income/screens/IncomeScreen";

import { MoreScreen } from "../features/more/screens/MoreScreen";

type TabKey = "dashboard" | "stock" | "orders" | "customers" | "income" | "more";

const TAB_ORDER: TabKey[] = ["dashboard", "stock", "orders", "customers", "income", "more"];

type RootLayoutProps = {
  onLogout: () => void;
};

type TabHostProps = {
  tab: TabKey;
  activeTab: TabKey;
  enterFrom: number;
  children: React.ReactNode;
};

// Each tab stays mounted after its first visit so its state/data survive
// tab switching. Inactive tabs are hidden with `display: none` instead of
// being unmounted (which would re-run every mount-based API fetch).
function TabHost({ tab, activeTab, enterFrom, children }: TabHostProps) {
  const isActive = activeTab === tab;
  const progress = useSharedValue(0);
  const direction = useSharedValue(1);

  useLayoutEffect(() => {
    if (isActive) {
      direction.value = enterFrom;
      progress.value = 0;
      progress.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
    }
  }, [isActive, enterFrom, direction, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: (1 - progress.value) * 40 * direction.value }],
  }));

  return (
    <View style={isActive ? { flex: 1 } : { display: "none" }}>
      <Animated.View style={[animatedStyle, { flex: 1 }]}>{children}</Animated.View>
    </View>
  );
}

export function RootLayout({ onLogout }: RootLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [prevTab, setPrevTab] = useState<TabKey>("dashboard");
  const [profileVisible, setProfileVisible] = useState(false);
  const [mountedTabs, setMountedTabs] = useState<Record<TabKey, boolean>>({
    dashboard: true,
    stock: false,
    orders: false,
    customers: false,
    income: false,
    more: false,
  });
  const { user } = useAuth();

  const handleTabPress = useCallback(
    (tab: TabKey) => {
      if (tab !== activeTab) {
        setPrevTab(activeTab);
        setActiveTab(tab);
        setMountedTabs((prev) => (prev[tab] ? prev : { ...prev, [tab]: true }));
      }
    },
    [activeTab]
  );

  const activeIdx = TAB_ORDER.indexOf(activeTab);
  const prevIdx = TAB_ORDER.indexOf(prevTab);
  const enterFrom = activeIdx > prevIdx ? 1 : -1;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ height: "100%" }}>
      <StatusBar style="dark" />
      <MainLayout activeTab={activeTab} onTabPress={handleTabPress} onMenuPress={() => setProfileVisible(true)}>
        <View className="flex-1" style={{ minHeight: 0 }}>
          {mountedTabs.dashboard && (
            <TabHost tab="dashboard" activeTab={activeTab} enterFrom={enterFrom}>
              <DashboardScreen onNavigateTab={handleTabPress} />
            </TabHost>
          )}
          {mountedTabs.stock && (
            <TabHost tab="stock" activeTab={activeTab} enterFrom={enterFrom}>
              <StockScreen />
            </TabHost>
          )}
          {mountedTabs.orders && (
            <TabHost tab="orders" activeTab={activeTab} enterFrom={enterFrom}>
              <OrdersScreen />
            </TabHost>
          )}
          {mountedTabs.customers && (
            <TabHost tab="customers" activeTab={activeTab} enterFrom={enterFrom}>
              <CustomersScreen />
            </TabHost>
          )}
          {mountedTabs.income && (
            <TabHost tab="income" activeTab={activeTab} enterFrom={enterFrom}>
              <IncomeScreen />
            </TabHost>
          )}
          {mountedTabs.more && (
            <TabHost tab="more" activeTab={activeTab} enterFrom={enterFrom}>
              <MoreScreen />
            </TabHost>
          )}
        </View>
      </MainLayout>

      <Profile
        visible={profileVisible}
        user={user}
        onClose={() => setProfileVisible(false)}
        onLogout={onLogout}
      />
    </SafeAreaView>
  );
}
