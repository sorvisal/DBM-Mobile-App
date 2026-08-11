import { useEffect } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

type TabKey = "dashboard" | "stock" | "orders" | "customers" | "income";

type MenuItem = {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const MENU_ITEMS: MenuItem[] = [
  { key: "dashboard", label: "ទំព័រដើម", icon: "home-outline" },
  { key: "stock", label: "ស្តុក", icon: "cube-outline" },
  { key: "orders", label: "ការបញ្ជាទិញ", icon: "cart-outline" },
  { key: "customers", label: "អតិថិជន", icon: "people-outline" },
  { key: "income", label: "ចំណូល", icon: "bar-chart-outline" },
];

const DRAWER_WIDTH = 288; // matches w-72
const SCREEN_WIDTH = Dimensions.get("window").width;

type SideMenuProps = {
  visible: boolean;
  activeTab: TabKey;
  username: string;
  onSelectTab: (tab: TabKey) => void;
  onClose: () => void;
  onOpen: () => void;
  onLogout: () => void;
};

export function SideMenu({
  visible,
  activeTab,
  username,
  onSelectTab,
  onClose,
  onOpen,
  onLogout,
}: SideMenuProps) {
  const translateX = useSharedValue(-DRAWER_WIDTH);

  useEffect(() => {
    translateX.value = withTiming(visible ? 0 : -DRAWER_WIDTH, { duration: 250 });
  }, [visible]);

  // Swipe on the drawer itself: drag left to close
  const drawerPan = Gesture.Pan()
    .onUpdate((e) => {
      const next = Math.min(0, Math.max(-DRAWER_WIDTH, e.translationX));
      translateX.value = next;
    })
    .onEnd((e) => {
      const shouldClose = e.translationX < -DRAWER_WIDTH / 3 || e.velocityX < -500;
      if (shouldClose) {
        translateX.value = withTiming(-DRAWER_WIDTH, { duration: 200 });
        runOnJS(onClose)();
      } else {
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  // Edge swipe on the invisible left-edge strip: drag right to open
  const edgePan = Gesture.Pan()
    .onStart(() => {
      runOnJS(onOpen)();
    })
    .onUpdate((e) => {
      const next = Math.min(0, Math.max(-DRAWER_WIDTH, -DRAWER_WIDTH + e.translationX));
      translateX.value = next;
    })
    .onEnd((e) => {
      const shouldOpen = e.translationX > DRAWER_WIDTH / 3 || e.velocityX > 500;
      if (shouldOpen) {
        translateX.value = withTiming(0, { duration: 200 });
      } else {
        translateX.value = withTiming(-DRAWER_WIDTH, { duration: 200 });
        runOnJS(onClose)();
      }
    });

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-DRAWER_WIDTH, 0], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View
      pointerEvents={visible ? "auto" : "box-none"}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "row" }}
    >
      {/* Drawer */}
      <GestureDetector gesture={drawerPan}>
        <Animated.View
          style={[
            { width: DRAWER_WIDTH, position: "absolute", top: 0, bottom: 0, left: 0 },
            drawerStyle,
          ]}
          className="bg-white"
        >
          {/* Profile section */}
          <View className="px-5 pt-14 pb-5 border-b border-gray-100 flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-blue-600 items-center justify-center">
              <Ionicons name="person" size={22} color="white" />
            </View>
            <View className="ml-3">
              <Text className="font-khmerBold text-gray-900 text-3xl">{username}</Text>
              {/* <Text className="font-khmer text-gray-400 text-xs mt-0.5">មើលប្រវត្តិរូប</Text> */}
            </View>
          </View>

          {/* Menu items */}
          <View className="pt-3 px-2">
            {MENU_ITEMS.map((item) => {
              const isActive = item.key === activeTab;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => {
                    onSelectTab(item.key);
                    onClose();
                  }}
                  className={`flex-row items-center px-3 py-3 rounded-xl mb-1 ${
                    isActive ? "bg-blue-50" : ""
                  }`}
                >
                  <Ionicons name={item.icon} size={20} color={isActive ? "#2563EB" : "#4B5563"} />
                  <Text
                    className={`font-khmer text-2xl ml-3 ${
                      isActive ? "text-blue-600 font-khmerBold" : "text-gray-700"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Logout */}
          <View className="px-2 mt-2 pt-2 border-t border-gray-100">
            <TouchableOpacity
              onPress={() => {
                onClose();
                onLogout();
              }}
              className="flex-row items-center px-3 py-3 rounded-xl"
            >
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
              <Text className="font-khmer text-red-500 text-2xl ml-3">ចាកចេញ</Text>
            </TouchableOpacity>
          </View>

          {/* Version */}
          <View className="flex-1 justify-end pb-6 items-center">
            <Text className="font-khmer text-gray-500 text-[16px]">កំណែ 1.0v</Text>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Backdrop — tap to close, also covers the rest of the screen */}
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        style={[
          { position: "absolute", top: 0, right: 0, bottom: 0, left: DRAWER_WIDTH },
          backdropStyle,
        ]}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      {/* Invisible edge-swipe zone on the left, only active when closed */}
      {!visible && (
        <GestureDetector gesture={edgePan}>
          <View
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: 24,
            }}
          />
        </GestureDetector>
      )}
    </View>
  );
}