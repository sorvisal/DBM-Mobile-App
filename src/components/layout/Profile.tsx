import { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import type { User } from "@/types/api";

const DRAWER_RATIO = 0.85;

type ProfileProps = {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onLogout: () => void;
};

const ROLE_LABELS: Record<string, string> = {
  owner: "ម្ចាងហាង",
  admin: "អ្នកគ្រប់គ្រង",
  staff: "បុគ្គលិក",
  user: "អ្នកប្រើប្រាស",
};

export function Profile({ visible, user, onClose, onLogout }: ProfileProps) {
  const { width: screenWidth } = useWindowDimensions();
  const drawerWidth = screenWidth * DRAWER_RATIO;

  const translateX = useSharedValue(-drawerWidth);
  const prevVisible = useRef(visible);
  const prevDrawerWidth = useRef(drawerWidth);

  useEffect(() => {
    if (prevDrawerWidth.current !== drawerWidth) {
      prevDrawerWidth.current = drawerWidth;
      translateX.value = -drawerWidth;
    }
    if (prevVisible.current !== visible) {
      prevVisible.current = visible;
      translateX.value = withTiming(visible ? 0 : -drawerWidth, { duration: 250 });
    }
  }, [visible, drawerWidth]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
  }));

  const avatarSize = Math.min(screenWidth * 0.2, 80);
  const rowFontSize = screenWidth < 375 ? 13 : 20;

  return (
    <View
      pointerEvents={visible ? "auto" : "none"}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}
    >
      <Animated.View
        style={[
          overlayStyle,
          { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" },
        ]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: drawerWidth,
            backgroundColor: "white",
            paddingRight: 16,
          },
          drawerStyle,
        ]}
      >
        <View className="flex-1 px-4 pt-4">
          {/* Header row */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-khmerBold text-gray-900">ប្រវត្តិរូប</Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Avatar & name */}
          <View className="items-center mb-4">
            <View
              style={{
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
              }}
              className="bg-blue-600 items-center justify-center mb-2"
            >
              <Ionicons name="person" size={Math.round(avatarSize * 0.5)} color="white" />
            </View>
            <Text className="font-khmerBold text-xl text-gray-900">{user?.name ?? "—"}</Text>
            <Text className="font-khmer text-lg text-gray-400 mt-0.5">
              {ROLE_LABELS[user?.role ?? "user"] ?? "—"}
            </Text>
          </View>

          {/* Info cards */}
          <View className="bg-gray-50 rounded-2xl p-3 mb-3">
            <InfoRow icon="mail" label="អ៊ីមែល" value={user?.email ?? "—"} fontSize={rowFontSize} />
            <View className="h-px bg-gray-200 my-2" />
            <InfoRow icon="call" label="ទូរស័ព្ទ" value={user?.phone ?? "—"} fontSize={rowFontSize} />
            <View className="h-px bg-gray-200 my-2" />
            <InfoRow icon="business" label="ហាង" value={user?.storeName ?? "—"} fontSize={rowFontSize} />
            <View className="h-px bg-gray-200 my-2" />
            <InfoRow icon="id-card" label="Username" value={user?.username ?? "—"} fontSize={rowFontSize} />
          </View>

          <View className="flex-1" />

          {/* Logout */}
          <TouchableOpacity
            onPress={onLogout}
            className="flex-row items-center justify-center py-2.5 rounded-2xl bg-red-50 mb-6"
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text className="font-khmer text-xl text-red-600 ml-1.5">
              ចាកចេញ
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  fontSize,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  fontSize: number;
}) {
  return (
    <View className="flex-row items-center py-1.5">
      <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2.5">
        <Ionicons name={icon} size={16} color="#2563EB" />
      </View>
      <View className="flex-1">
        <Text className="font-khmer text-gray-500" style={{ fontSize: fontSize - 2 }}>
          {label}
        </Text>
        <Text className="font-khmerMedium text-gray-900 mt-0.5" style={{ fontSize }}>
          {value}
        </Text>
      </View>
    </View>
  );
}