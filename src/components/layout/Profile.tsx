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
import { moderateScale } from "@/utils/responsive";
import { typography } from "@/theme";

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

      translateX.value = withTiming(
        visible ? 0 : -drawerWidth,
        {
          duration: 280,
        }
      );
    }
  }, [visible, drawerWidth, translateX]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
    ],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(visible ? 1 : 0, {
      duration: 220,
    }),
  }));

  // ==========================================================
  // Responsive sizes
  // ==========================================================

  const avatarSize = Math.min(
    screenWidth * 0.20,
    82
  );

  const rowFontSize = moderateScale(20, 0.5);

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

  const username =
    user?.username?.trim() || "—";

  const phone =
    user?.phone?.trim() || "—";

  const storeName =
    user?.storeName?.trim() || "—";

  const role =
    user?.role?.trim() || "user";

  const isActive =
    user?.isActive ?? true;

  // api.ts already converts photoPath to avatarUrl
  const photoUrl =
    typeof user?.avatarUrl === "string" &&
    user.avatarUrl.trim().length > 0
      ? user.avatarUrl
      : undefined;

  const avatarInitial =
    fullName.charAt(0).toUpperCase() || "U";

  const roleLabel =
    ROLE_LABELS[role.toLowerCase()] ?? role;

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
      {/* ====================================================
          DARK OVERLAY
      ==================================================== */}

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

      {/* ====================================================
          DRAWER
      ==================================================== */}
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
            shadowOffset: {
              width: 8,
              height: 0,
            },
            elevation: 12,
          },
          drawerStyle,
        ]}
      >
        {/* ==================================================
            CONTENT
        ================================================== */}
        <View
          className="flex-1"
          style={{
            backgroundColor: "#FFFFFF",
            paddingBottom: bottomPadding + 3,
          }}
        >
          {/* ==================================================
              STATUS BAR
          ================================================== */}

          <StatusBar
            barStyle="light-content"
            backgroundColor="#2563EB"
            translucent={true}
          />

          {/* ==================================================
              BLUE PROFILE HEADER
          ================================================== */}
          <View
            style={{
              height: 290 + topPadding,
              backgroundColor: "#2563EB",
              overflow: "hidden",
            }}
          >
            {/* Top-right circle */}
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

            {/* Right circle */}
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

            {/* Bottom-left circle */}
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
            {/* ==================================================
                CLOSE BUTTON
            ================================================== */}
           <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
              style={{
                position: "absolute",
                top: topPadding + 12,
                right: 18,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",

                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 8,
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                elevation: 6,
                zIndex: 20,
              }}
            >
              <Ionicons
                name="close"
                size={25}
                color="#1F2937"
              />
            </TouchableOpacity>

            {/* ==================================================
                PROFILE IMAGE
            ================================================== */}
            <View
              style={{
                position: "absolute",
                top: topPadding + 58,
                left: 0,
                right: 0,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: avatarSize + 26,
                  height: avatarSize + 26,
                  borderRadius: (avatarSize + 22) / 2,
                  backgroundColor: "#FFFFFF",
                  padding: 5,
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 8,
                }}
              >
                {photoUrl ? (
                  <Image
                    source={{
                      uri: photoUrl,
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: (avatarSize + 10) / 2,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      flex: 1,
                      borderRadius: (avatarSize + 10) / 2,
                      backgroundColor: "#1D4ED8",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text className="font-khmerBold text-white text-3xl">
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
                  bottom: 6,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: isActive
                    ? "#22C55E"
                    : "#F97316",
                  borderWidth: 3,
                  borderColor: "#FFFFFF",
                }}
              />
            </View>

            {/* ==================================================
                NAME + USERNAME + STATUS
                All displayed on blue background
            ================================================== */}
            <View
              style={{
                position: "absolute",
                left: 20,
                right: 20,
                top: topPadding + 176,
                alignItems: "center",
              }}
            >
              {/* Full name */}
              <Text
                className="font-khmerBold text-white text-2xl text-center"
                numberOfLines={1}
                maxFontSizeMultiplier={
                  typography.maxFontSizeMultiplier
                }
              >
                {fullName}
              </Text>
              {/* Username */}
              <Text
                className="font-khmer text-blue-100 text-lg"
                numberOfLines={1}
              >
                @{username}
              </Text>
            {/* ==================================================
                ROLE BADGE
            ================================================== */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 5,
                paddingHorizontal: 16,
                paddingVertical: 6,

                borderRadius: 999,

                backgroundColor: "#DBEAFE",
              }}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color="#1D4ED8"
                style={{
                  marginRight: 7,
                }}
              />

              <Text
                className="font-khmerMedium text-blue-800 text-sm"
                numberOfLines={1}
              >
                {roleLabel}
              </Text>
            </View>
            </View>
          </View>

          {/* ==================================================
              ACCOUNT INFORMATION
          ================================================== */}

          <View
            className="flex-1 px-5"
            style={{
              paddingTop: 22,
            }}
          >
            {/* Section title */}
            <View className="flex-row items-center justify-between mb-3">
              <Text
                className="font-khmerMedium text-gray-700 text-lg"
                numberOfLines={1}
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
              {/* Username */}
              <ProfileInfoRow
                icon="person-outline"
                label="Username"
                value={username}
                fontSize={rowFontSize}
              />

              <View className="h-px bg-gray-200 my-2" />

              {/* Phone */}
              <ProfileInfoRow
                icon="call-outline"
                label="ទូរស័ព្ទ"
                value={phone}
                fontSize={rowFontSize}
              />

              <View className="h-px bg-gray-200 my-2" />

              {/* Store */}
              <ProfileInfoRow
                icon="business-outline"
                label="ហាង"
                value={storeName}
                fontSize={rowFontSize}
              />

              <View className="h-px bg-gray-200 my-2" />

              {/* Role */}
              <ProfileInfoRow
                icon="shield-checkmark-outline"
                label="តួនាទី"
                value={roleLabel}
                fontSize={rowFontSize}
              />

              <View className="h-px bg-gray-200 my-2" />

              {/* Status */}
              <ProfileInfoRow
                icon="checkmark-circle-outline"
                label="ស្ថានភាព"
                value={isActive ? "សកម្ម" : "មិនសកម្ម"}
                fontSize={rowFontSize}
                valueClassName={
                  isActive
                    ? "text-green-600"
                    : "text-orange-600"
                }
              />
            </View>

            {/* Push logout to bottom */}
            <View className="flex-1" />

            {/* ==================================================
                LOGOUT BUTTON
            ================================================== */}

            <TouchableOpacity
              onPress={onLogout}
              activeOpacity={0.8}
              style={{
                height: 52,
                borderRadius: 18,

                backgroundColor: "#FEF2F2",
                borderWidth: 1,
                borderColor: "#FECACA",

                alignItems: "center",
                justifyContent: "center",

                marginBottom: 4,
              }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="log-out-outline"
                  size={21}
                  color="#DC2626"
                />

                <Text className="font-khmerMedium text-red-600 text-lg ml-2">
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
  fontSize,
  valueClassName = "text-gray-900",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  fontSize: number;
  valueClassName?: string;
}) {
  return (
    <View className="flex-row items-center py-1">
      {/* Icon */}
      <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2.5">
        <Ionicons
          name={icon}
          size={15}
          color="#2563EB"
        />
      </View>

      {/* Text */}
      <View className="flex-1">
        <Text
          className="font-khmer text-gray-400"
          style={{
            fontSize: Math.max(11, fontSize - 5),
          }}
          numberOfLines={1}
          maxFontSizeMultiplier={
            typography.maxFontSizeMultiplier
          }
        >
          {label}
        </Text>

        <Text
          className={`font-khmerMedium ${valueClassName} mt-0.5`}
          style={{
            fontSize: Math.max(13, fontSize - 2),
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
          maxFontSizeMultiplier={
            typography.maxFontSizeMultiplier
          }
        >
          {value}
        </Text>
      </View>
    </View>
  );
}