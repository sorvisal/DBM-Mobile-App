import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Alert, View } from "react-native";
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
import { NotificationScreen } from "../features/notifications/screens/NotificationScreen";
import {
  useNotifications,
  startNotificationService,
  stopNotificationService,
  markAsRead,
} from "../features/notifications/hooks/useNotifications";
import { resolveNotificationTarget } from "../features/notifications/types/notification.types";
import type { Notification } from "../features/notifications/types/notification.types";
import type { StockTabKey } from "../features/stock/screens/StockScreen";
type TabKey =
  | "dashboard"
  | "stock"
  | "orders"
  | "customers"
  | "income"
  | "more";

const TAB_ORDER: TabKey[] = [
  "dashboard",
  "stock",
  "orders",
  "customers",
  "income",
  "more",
];

type RootLayoutProps = {
  onLogout: () => void;
};

type TabHostProps = {
  tab: TabKey;
  activeTab: TabKey;
  enterFrom: number;
  children: React.ReactNode;
};

function TabHost({
  tab,
  activeTab,
  enterFrom,
  children,
}: TabHostProps) {
  const isActive = activeTab === tab;
  const progress = useSharedValue(0);
  const direction = useSharedValue(1);

  useLayoutEffect(() => {
    if (isActive) {
      direction.value = enterFrom;
      progress.value = 0;

      progress.value = withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [isActive, enterFrom, direction, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateX:
          (1 - progress.value) * 40 * direction.value,
      },
    ],
  }));

  return (
    <View
      style={
        isActive
          ? { flex: 1 }
          : { display: "none" }
      }
    >
      <Animated.View
        style={[
          animatedStyle,
          { flex: 1 },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const INITIAL_CHROME_HIDDEN: Record<
  TabKey,
  boolean
> = {
  dashboard: false,
  stock: false,
  orders: false,
  customers: false,
  income: false,
  more: false,
};

export function RootLayout({
  onLogout,
}: RootLayoutProps) {
  const [activeTab, setActiveTab] =
    useState<TabKey>("dashboard");

  const [prevTab, setPrevTab] =
    useState<TabKey>("dashboard");

  const [profileVisible, setProfileVisible] =
    useState(false);

  const [notificationsVisible, setNotificationsVisible] =
    useState(false);

  const [pendingNotificationNav, setPendingNotificationNav] =
    useState<{
      tab: TabKey;
      kind: "order" | "customer" | "debt" | "product";
      id: string;
    } | null>(null);

  const [mountedTabs, setMountedTabs] =
    useState<Record<TabKey, boolean>>({
      dashboard: true,
      stock: false,
      orders: false,
      customers: false,
      income: false,
      more: false,
    });

  const [chromeHiddenByTab, setChromeHiddenByTab] =
    useState<Record<TabKey, boolean>>(
      INITIAL_CHROME_HIDDEN
    );

  const { user } = useAuth();

  const { unreadCount } = useNotifications();

  // Start the notification service (SignalR + initial fetch) when the main
  // layout mounts, and stop it cleanly when it unmounts (logout / teardown).
  useEffect(() => {
    startNotificationService().catch(() => {});

    return () => {
      stopNotificationService().catch(() => {});
    };
  }, []);

const handleTabPress = useCallback(
  (tab: TabKey) => {
    if (tab !== activeTab) {
      setPrevTab(activeTab);
      setActiveTab(tab);

      setMountedTabs((prev) =>
        prev[tab]
          ? prev
          : {
              ...prev,
              [tab]: true,
            }
      );
    }
  },
  [activeTab]
);
const handleStockNavigation = useCallback(
  (tab: StockTabKey) => {
    setStockInitialTab(tab);
    handleTabPress("stock");
  },
  [handleTabPress]
);

  const handleClearPendingNotificationNav = useCallback(() => {
    setPendingNotificationNav(null);
  }, []);

  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      setNotificationsVisible(false);

      // Mark as read optimistically; never block navigation on the request.
      if (!notification.read) {
        markAsRead(notification.id).catch(() => {});
      }

      const target = resolveNotificationTarget(notification);
      if (!target) {
        Alert.alert(
          "ការជូនដំណឹង",
          "មិនអាចបើកព័ត៌មានលម្អិតបានទេ"
        );
        return;
      }

      setPendingNotificationNav({
        tab: target.tab,
        kind: target.kind,
        id: target.id,
      });
      handleTabPress(target.tab);
    },
    [handleTabPress]
  );
  const handleCustomersChromeChange =
    useCallback((hidden: boolean) => {
      setChromeHiddenByTab((prev) =>
        prev.customers === hidden
          ? prev
          : {
              ...prev,
              customers: hidden,
            }
      );
    }, []);

  const handleOrdersChromeChange =
    useCallback((hidden: boolean) => {
      setChromeHiddenByTab((prev) =>
        prev.orders === hidden
          ? prev
          : {
              ...prev,
              orders: hidden,
            }
      );
    }, []);

  const handleIncomeChromeChange =
    useCallback((hidden: boolean) => {
      setChromeHiddenByTab((prev) =>
        prev.income === hidden
          ? prev
          : {
              ...prev,
              income: hidden,
            }
      );
    }, []);

  const activeIdx =
    TAB_ORDER.indexOf(activeTab);

  const prevIdx =
    TAB_ORDER.indexOf(prevTab);

  const enterFrom =
    activeIdx > prevIdx ? 1 : -1;

    const [stockInitialTab, setStockInitialTab] =
  useState<StockTabKey>("products");
return (
  <View
    className="flex-1 bg-gray-50"
    style={{
      minHeight: 0,
    }}
  >
    <MainLayout
      activeTab={activeTab}
      onTabPress={handleTabPress}
      onMenuPress={() =>
        setProfileVisible(true)
      }
      onNotificationPress={() =>
        setNotificationsVisible(true)
      }
      notificationCount={unreadCount}
      hideChrome={
        chromeHiddenByTab[activeTab]
      }
    >
    <View
      className="flex-1"
      style={{
        minHeight: 0,
        minWidth: 0,
      }}
    >
          {mountedTabs.dashboard && (
            <TabHost
              tab="dashboard"
              activeTab={activeTab}
              enterFrom={enterFrom}
            >
            <DashboardScreen
              onNavigateTab={handleTabPress}
              onNavigateStockTab={handleStockNavigation}
            />
            </TabHost>
          )}

          {mountedTabs.stock && (
            <TabHost
              tab="stock"
              activeTab={activeTab}
              enterFrom={enterFrom}
            >
              <StockScreen
                initialTab={stockInitialTab}
                openProductId={
                  pendingNotificationNav?.kind === "product"
                    ? pendingNotificationNav.id
                    : null
                }
                onOpenProductHandled={handleClearPendingNotificationNav}
              />
            </TabHost>
          )}

          {mountedTabs.orders && (
            <TabHost
              tab="orders"
              activeTab={activeTab}
              enterFrom={enterFrom}
            >
              <OrdersScreen
                onChromeChange={
                  handleOrdersChromeChange
                }
                isActive={
                  activeTab === "orders"
                }
                openOrderId={
                  pendingNotificationNav?.kind === "order"
                    ? pendingNotificationNav.id
                    : null
                }
                onOpenOrderHandled={handleClearPendingNotificationNav}
              />
            </TabHost>
          )}

          {mountedTabs.customers && (
            <TabHost
              tab="customers"
              activeTab={activeTab}
              enterFrom={enterFrom}
            >
              <CustomersScreen
                onChromeChange={
                  handleCustomersChromeChange
                }
                openCustomerId={
                  pendingNotificationNav?.kind === "customer"
                    ? pendingNotificationNav.id
                    : null
                }
                onOpenCustomerHandled={handleClearPendingNotificationNav}
              />
            </TabHost>
          )}

          {mountedTabs.income && (
            <TabHost
              tab="income"
              activeTab={activeTab}
              enterFrom={enterFrom}
            >
              <IncomeScreen
                onChromeChange={
                  handleIncomeChromeChange
                }
                isActive={
                  activeTab === "income"
                }
                openDebtorId={
                  pendingNotificationNav?.kind === "debt"
                    ? pendingNotificationNav.id
                    : null
                }
                onOpenDebtorHandled={handleClearPendingNotificationNav}
              />
            </TabHost>
          )}

          {mountedTabs.more && (
            <TabHost
              tab="more"
              activeTab={activeTab}
              enterFrom={enterFrom}
            >
              <MoreScreen />
            </TabHost>
          )}
        </View>
      </MainLayout>

      <Profile
        visible={profileVisible}
        user={user}
        onClose={() =>
          setProfileVisible(false)
        }
        onLogout={onLogout}
      />

      {notificationsVisible && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 90,
            backgroundColor: "#F8FAFC",
          }}
        >
          <NotificationScreen
            onClose={() =>
              setNotificationsVisible(false)
            }
            onOpenNotification={handleNotificationPress}
          />
        </View>
      )}
    </View>
  );
}