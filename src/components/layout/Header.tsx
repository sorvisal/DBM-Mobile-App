import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

type HeaderProps = {
  title?: string;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
};

export function Header({
  title,
  onMenuPress,
  onNotificationPress,
  notificationCount = 0,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* Light icons/text since header background is blue */}
    
      <View
        style={{
          backgroundColor: "#2563EB",
          
        }}
      >
        <View className="px-3 py-3 flex-row items-center justify-between relative" >
          {onMenuPress ? (
            <TouchableOpacity
              onPress={onMenuPress}
              accessibilityRole="button"
              accessibilityLabel="Menu"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="menu-outline" size={30} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 30 }} />
          )}

          <View
            className="absolute left-0 right-0 items-center justify-center"
            pointerEvents="none"
          >
            <Text
              className="font-khmerBold text-white text-2xl"
              numberOfLines={1}
            >
              {title ?? "DBM App"}
            </Text>
          </View>

          {onNotificationPress ? (
            <TouchableOpacity
              onPress={onNotificationPress}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              className="w-12 h12 rounded-full bg-white/15 items-center justify-center"
            >
              <Ionicons name="notifications-outline" size={18} color="white" />
              {notificationCount > 0 && (
                <View className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500" />
              )}
            </TouchableOpacity>
          ) : (
            <View className="w-9 h-9" />
          )}
        </View>
      </View>
    </>
  );
}