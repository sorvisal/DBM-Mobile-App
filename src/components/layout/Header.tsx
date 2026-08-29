import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

type HeaderProps = {
  title?: string;
  onMenuPress?: () => void;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
  rightAction?: React.ReactNode;
  variant?: "blue" | "white"; // Added variant prop
};

export function Header({
  title,
  onMenuPress,
  onBackPress,
  onNotificationPress,
  notificationCount = 0,
  rightAction,
  variant = "blue", // Default to blue so other screens aren't affected
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const showBack = !!onBackPress;
  const isWhite = variant === "white";

  return (
    <>
      <StatusBar style={isWhite ? "dark" : "light"} />
      <View 
        style={{ 
          backgroundColor: isWhite ? "#FFFFFF" : "#2563EB", 
          paddingTop: insets.top 
        }}
        className={isWhite ? "border-b border-gray-100" : ""}
      >
        <View className="px-3 py-3 flex-row items-center justify-between relative">
          {/* Left Button (Back or Menu) */}
          {showBack ? (
            <TouchableOpacity
              onPress={onBackPress}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons 
                name="arrow-back" 
                size={26} 
                color={isWhite ? "#1F2937" : "white"} 
              />
            </TouchableOpacity>
          ) : onMenuPress ? (
            <TouchableOpacity
              onPress={onMenuPress}
              accessibilityRole="button"
              accessibilityLabel="Menu"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons 
                name="menu-outline" 
                size={30} 
                color={isWhite ? "#1F2937" : "white"} 
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 30 }} />
          )}

          {/* Centered Title */}
          <View
            className="absolute left-0 right-0 flex-row justify-center px-12"
            pointerEvents="none"
          >
            <Text
              className={`font-khmerBold text-2xl ${
                isWhite ? "text-gray-900" : "text-white"
              }`}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
            >
              {title ?? "DBM App"}
            </Text>
          </View>

          {/* Right Action / Notification */}
          {rightAction ? (
            rightAction
          ) : (
            <TouchableOpacity
              onPress={onNotificationPress}
              disabled={!onNotificationPress}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              className={`w-11 h-11 rounded-full items-center justify-center ${
                onNotificationPress 
                  ? isWhite ? "bg-gray-100" : "bg-white/15" 
                  : isWhite ? "bg-gray-50" : "bg-white/5"
              }`}
            >
              <Ionicons
                name="notifications-outline"
                size={26}
                color={
                  onNotificationPress 
                    ? isWhite ? "#1F2937" : "white" 
                    : isWhite ? "rgba(31,41,55,0.4)" : "rgba(255,255,255,0.4)"
                }
              />
              {notificationCount > 0 && (
                <View className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}