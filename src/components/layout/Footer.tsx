import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ============================================================
// Types
// ============================================================

export type TabKey =
  | "dashboard"
  | "stock"
  | "orders"
  | "customers"
  | "income"
  | "more";

type FooterProps = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
};

// ============================================================
// Tabs
// ============================================================

export const TABS: {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    key: "dashboard",
    label: "ទំព័រដើម",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    key: "stock",
    label: "ស្តុក",
    icon: "cube-outline",
    activeIcon: "cube",
  },
  {
    key: "orders",
    label: "បញ្ជាទិញ",
    icon: "cart-outline",
    activeIcon: "cart",
  },
  {
    key: "customers",
    label: "អតិថិជន",
    icon: "people-outline",
    activeIcon: "people",
  },
  {
    key: "income",
    label: "ចំណូល",
    icon: "bar-chart-outline",
    activeIcon: "bar-chart",
  },
];

// ============================================================
// Footer
// ============================================================

export function Footer({
  activeTab,
  onTabPress,
}: FooterProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isIOS = Platform.OS === "ios";
  const isSmallPhone = width < 360;

  // ==========================================================
  // Responsive sizes
  // ==========================================================
// ==========================================================
// Font sizes
// ==========================================================

// Android
const androidIconSize = isSmallPhone ? 20 : 22;
const androidLabelSize = isSmallPhone ? 9 : 10;

// iOS
const iosIconSize = isSmallPhone ? 22 : 24;
const iosLabelSize = isSmallPhone ? 12 : 13;

// Use platform-specific sizes
const iconSize = isIOS
  ? iosIconSize
  : androidIconSize;

const labelSize = isIOS
  ? iosLabelSize
  : androidLabelSize;

  // ==========================================================
  // Platform-specific layout
  //
  // Android:
  // - No top padding
  // - No bottom padding
  // - Fixed compact height
  //
  // iOS:
  // - Keep original spacing
  // - Keep Home Indicator safe area
  // ==========================================================

  const androidFooterHeight = 52;

  const bottomInset = isIOS
    ? Math.max(insets.bottom, 8)
    : 0;

  const footerPaddingTop = isIOS ? 8 : 0;

  const footerPaddingBottom = isIOS
    ? bottomInset
    : 0;

  const footerHeight = isIOS
    ? undefined
    : androidFooterHeight;

  const itemHeight = isIOS ? 48 : 42;

  const iconContainerWidth = isIOS ? 40 : 36;
  const iconContainerHeight = isIOS ? 27 : 21;

  const labelMarginTop = isIOS ? 2 : 0;

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",

        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        // Android = 0
        // iOS = original spacing
        paddingTop: footerPaddingTop,
        paddingBottom: footerPaddingBottom,
        paddingHorizontal: 2,
        // Android fixed height
        // iOS keeps natural height
        ...(isIOS
          ? {}
          : {
              height: footerHeight,
            }),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",

        // Prevent Android from growing
        flexGrow: 0,
        flexShrink: 0,
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{
              selected: isActive,
            }}
            android_ripple={{
              color: "#DBEAFE",
              borderless: true,
            }}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              // Android = 42
              // iOS = 48
              height: itemHeight,
              paddingVertical: 0,
              borderRadius: 12,
            }}
          >
            <View
              style={{
                width: iconContainerWidth,
                height: iconContainerHeight,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isActive
                  ? "#EFF6FF"
                  : "transparent",
              }}
            >
              <Ionicons
                name={
                  isActive
                    ? tab.activeIcon
                    : tab.icon
                }
                size={iconSize}
                color={
                  isActive
                    ? "#2563EB"
                    : "#9CA3AF"
                }
              />
            </View>
            <Text
              style={{
                marginTop: labelMarginTop,

                fontFamily: isActive
                  ? "KantumruyPro-Medium"
                  : "KantumruyPro-Regular",

                fontSize: labelSize,
                color: isActive
                  ? "#2563EB"
                  : "#9CA3AF",
                textAlign: "center",
                includeFontPadding: false,
                maxWidth: width / 5 - 4,
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              allowFontScaling={false}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}