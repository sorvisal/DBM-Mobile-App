import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type HeaderProps = {
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
};

export function Header({
  onMenuPress,
  onNotificationPress,
  notificationCount = 0,
}: HeaderProps) {
  return (
    <View className="bg-white px-5 pt-8 pb-3 flex-row items-center justify-between relative">
      <TouchableOpacity
        onPress={onMenuPress}
        accessibilityRole="button"
        accessibilityLabel="Menu"
      >
        <Ionicons name="menu-outline" size={26} color="#1F2937" />
      </TouchableOpacity>

      <View className="absolute left-0 right-0 items-center justify-center pointer-events-none">
        <Text className="font-bold text-2xl text-blue-600">
          DBM
          <Text className="font-bold text-sm text-blue-600 p-1">App</Text>
        </Text>
       
      </View>

      <TouchableOpacity
        onPress={onNotificationPress}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
      >
        <Ionicons name="notifications-outline" size={20} color="#1F2937" />
        {notificationCount > 0 && (
          <View className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500" />
        )}
      </TouchableOpacity>
    </View>
  );
}