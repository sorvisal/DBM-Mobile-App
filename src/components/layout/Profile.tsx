import { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Image,
  StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { User } from "@/types/api";
import { useResponsive } from "@/hooks/useResponsive";

// ============================================================
// Constants
// ============================================================

const DRAWER_RATIO = 0.85;

const ROLE_LABELS: Record<string, string> = {
  owner: "ម្ចាស់ហាង",
  admin: "អ្នកគ្រប់គ្រង",
  staff: "បុគ្គលិក",
  user: "អ្នកប្រើប្រាស់",
};

// កំណត់ទំហំ Font ឱ្យសមស្របតាម Platform (iOS vs Android)
const FONT_SIZES = {
  fullName: Platform.OS === "android" ? 18 : 21,
  username: Platform.OS === "android" ? 13 : 15,
  roleBadge: Platform.OS === "android" ? 11 : 12.5,
  sectionTitle: Platform.OS === "android" ? 14 : 16,
  rowLabel: Platform.OS === "android" ? 11 : 12,
  rowValue: Platform.OS === "android" ? 13.5 : 15,
  logoutBtn: Platform.OS === "android" ? 14 : 16,
};

// ============================================================
// Types
// ============================================================

type ProfileUser = User & {
  fullName?: string | null;
  isActive?: boolean | null;
  photoPath?: string | null;
  description?: string | null;
};

type ProfileProps = {
  visible: boolean;
  user: ProfileUser | null;
  onClose: () => void;
  onLogout: () => void;
};

// ============================================================
// Profile
// ============================================================

export function Profile({
  visible,
  user,
  onClose,
  onLogout,
}: ProfileProps) {
  const { width: screenWidth } = useResponsive();
  const insets = useSafeAreaInsets();

  const drawerWidth = screenWidth * DRAWER_RATIO;

  // ==========================================================
  // Animation
  // ==========================================================

  const translateX = useSharedValue(-drawerWidth);

  const prevVisible = useRef(visible);
  const prevDrawerWidth = useRef(drawerWidth);

  useEffect(() => {
    if (prevDrawerWidth.current !== drawerWidth) {
      prevDrawerWidth.current = drawerWidth;
      translateX.value = visible ? 0 : -drawerWidth;
    }

    if (prevVisible.current !== visible) {
      prevVisible.current = visible;
      translateX.value = withTiming(visible ? 0 : -drawerWidth, {
        duration: 280,
      });
    }
  }, [visible, drawerWidth, translateX]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(visible ? 1 : 0, {
      duration: 220,
    }),
  }));

  // ==========================================================
  // Responsive sizes
  // ==========================================================

  const avatarSize = Math.min(screenWidth * 0.2, 82);

  const topPadding = Math.max(
    insets.top,
    Platform.OS === "android" ? 13 : 0
  );

  const bottomPadding = Math.max(
    insets.bottom,
    Platform.OS === "android" ? 13 : 0
  );

  // ==========================================================
  // API data
  // ==========================================================

  const fullName =
    user?.fullName?.trim() ||
    user?.name?.trim() ||
    "អ្នកប្រើប្រាស់";

  const username = user?.username?.trim() || "—";
  const phone = user?.phone?.trim() || "—";
  const storeName = user?.storeName?.trim() || "—";
  const role = user?.role?.trim() || "user";
  const isActive = user?.isActive ?? true;

  const photoUrl =
    typeof user?.avatarUrl === "string" &&
    user.avatarUrl.trim().length > 0
      ? user.avatarUrl
      : undefined;

  const avatarInitial = fullName.charAt(0).toUpperCase() || "U";
  const roleLabel = ROLE_LABELS[role.toLowerCase()] ?? role;

  // ==========================================================
  // Render
  // ==========================================================
  return (
    <View
      pointerEvents={visible ? "auto" : "none"}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      {/* DARK OVERLAY */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.42)",
          },
          overlayStyle,
        ]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* DRAWER */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: drawerWidth,
            backgroundColor: "#FFFFFF",
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOpacity: 0.14,
            shadowRadius: 20,
            shadowOffset: { width: 8, height: 0 },
            elevation: 12,
          },
          drawerStyle,
        ]}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            paddingBottom: bottomPadding + 3,
          }}
        >
          {/* STATUS BAR */}
          <StatusBar
            barStyle="light-content"
            backgroundColor="#2563EB"
            translucent={true}
          />

          {/* BLUE PROFILE HEADER */}
          <View
            style={{
              height: 275 + topPadding,
              backgroundColor: "#2563EB",
              overflow: "hidden",
            }}
          >
            {/* Background circles */}
            <View
              style={{
                position: "absolute",
                width: 250,
                height: 250,
                borderRadius: 135,
                backgroundColor: "#3B82F6",
                top: -145,
                right: -100,
              }}
            />
            <View
              style={{
                position: "absolute",
                width: 190,
                height: 190,
                borderRadius: 95,
                backgroundColor: "#60A5FA",
                top: 100,
                right: -95,
                opacity: 0.75,
              }}
            />
            <View
              style={{
                position: "absolute",
                width: 210,
                height: 210,
                borderRadius: 105,
                backgroundColor: "#60A5FA",
                bottom: -150,
                left: -95,
                opacity: 0.7,
              }}
            />

            {/* CLOSE BUTTON */}
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                position: "absolute",
                top: topPadding + 12,
                right: 18,
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 6,
                zIndex: 20,
              }}
            >
              <Ionicons name="close" size={22} color="#1F2937" />
            </TouchableOpacity>

            {/* PROFILE IMAGE */}
            <View
              style={{
                position: "absolute",
                top: topPadding + 48,
                left: 0,
                right: 0,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: avatarSize + 24,
                  height: avatarSize + 24,
                  borderRadius: (avatarSize + 24) / 2,
                  backgroundColor: "#FFFFFF",
                  padding: 4,
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 8,
                }}
              >
                {photoUrl ? (
                  <Image
                    source={{ uri: photoUrl }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: avatarSize / 2,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      flex: 1,
                      borderRadius: avatarSize / 2,
                      backgroundColor: "#1D4ED8",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      className="font-khmerBold text-white"
                      style={{ fontSize: FONT_SIZES.fullName }}
                      allowFontScaling={false}
                    >
                      {avatarInitial}
                    </Text>
                  </View>
                )}
              </View>

              {/* Online status dot */}
              <View
                style={{
                  position: "absolute",
                  right: "38%",
                  bottom: 4,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: isActive ? "#22C55E" : "#F97316",
                  borderWidth: 2.5,
                  borderColor: "#FFFFFF",
                }}
              />
            </View>

            {/* NAME + USERNAME + ROLE */}
            <View
              style={{
                position: "absolute",
                left: 20,
                right: 20,
                top: topPadding + 160,
                alignItems: "center",
              }}
            >
              {/* Full name */}
              <Text
                className="font-khmerBold text-white text-center"
                style={{ fontSize: FONT_SIZES.fullName }}
                numberOfLines={1}
                allowFontScaling={false}
              >
                {fullName}
              </Text>

              {/* Username */}
              <Text
                className="font-khmer text-blue-100"
                style={{ fontSize: FONT_SIZES.username, marginTop: 1 }}
                numberOfLines={1}
                allowFontScaling={false}
              >
                @{username}
              </Text>

              {/* ROLE BADGE */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: "#DBEAFE",
                }}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={13}
                  color="#1D4ED8"
                  style={{ marginRight: 5 }}
                />
                <Text
                  className="font-khmerMedium text-blue-800"
                  style={{ fontSize: FONT_SIZES.roleBadge }}
                  numberOfLines={1}
                  allowFontScaling={false}
                >
                  {roleLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* ACCOUNT INFORMATION */}
          <View
            className="flex-1 px-5"
            style={{ paddingTop: 16 }}
          >
            {/* Section title */}
            <View className="mb-2.5">
              <Text
                className="font-khmerMedium text-gray-700"
                style={{ fontSize: FONT_SIZES.sectionTitle }}
                numberOfLines={1}
                allowFontScaling={false}
              >
                ព័ត៌មានគណនី
              </Text>
            </View>

            {/* Account card */}
            <View
              className="bg-gray-50 rounded-2xl p-3"
              style={{
                borderWidth: 1,
                borderColor: "#F1F5F9",
              }}
            >
              <ProfileInfoRow
                icon="person-outline"
                label="Username"
                value={username}
              />
              <View className="h-px bg-gray-200 my-1.5" />

              <ProfileInfoRow
                icon="call-outline"
                label="ទូរស័ព្ទ"
                value={phone}
              />
              <View className="h-px bg-gray-200 my-1.5" />

              <ProfileInfoRow
                icon="business-outline"
                label="ហាង"
                value={storeName}
              />
              <View className="h-px bg-gray-200 my-1.5" />

              <ProfileInfoRow
                icon="shield-checkmark-outline"
                label="តួនាទី"
                value={roleLabel}
              />
              <View className="h-px bg-gray-200 my-1.5" />

              <ProfileInfoRow
                icon="checkmark-circle-outline"
                label="ស្ថានភាព"
                value={isActive ? "សកម្ម" : "មិនសកម្ម"}
                valueClassName={
                  isActive ? "text-green-600" : "text-orange-600"
                }
              />
            </View>

            <View className="flex-1" />

            {/* LOGOUT BUTTON */}
            <TouchableOpacity
              onPress={onLogout}
              activeOpacity={0.8}
              style={{
                height: 48,
                borderRadius: 16,
                backgroundColor: "#FEF2F2",
                borderWidth: 1,
                borderColor: "#FECACA",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 6,
              }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="log-out-outline"
                  size={19}
                  color="#DC2626"
                />
                <Text
                  className="font-khmerMedium text-red-600 ml-2"
                  style={{ fontSize: FONT_SIZES.logoutBtn }}
                  allowFontScaling={false}
                >
                  ចាកចេញពីគណនី
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ============================================================
// Profile Info Row
// ============================================================

function ProfileInfoRow({
  icon,
  label,
  value,
  valueClassName = "text-gray-900",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <View className="flex-row items-center py-1">
      {/* Icon */}
      <View className="w-7 h-7 rounded-full bg-blue-100 items-center justify-center mr-2.5">
        <Ionicons name={icon} size={14} color="#2563EB" />
      </View>

      {/* Text */}
      <View className="flex-1">
        <Text
          className="font-khmer text-gray-400"
          style={{ fontSize: FONT_SIZES.rowLabel }}
          numberOfLines={1}
          allowFontScaling={false}
        >
          {label}
        </Text>

        <Text
          className={`font-khmerMedium ${valueClassName} mt-0.5`}
          style={{ fontSize: FONT_SIZES.rowValue }}
          numberOfLines={1}
          ellipsizeMode="tail"
          allowFontScaling={false}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}