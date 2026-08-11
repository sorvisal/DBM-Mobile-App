import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function AuthHeader() {
  return (
    <View className="bg-blue-600 h-60 items-center justify-center overflow-hidden mt-0.5">
      {/* Decorative light-primary blobs */}
      <View
        className="absolute bg-blue-400/30 rounded-full"
        style={{ width: 160, height: 160, top: -60, left: -40 }}
      />
      <View
        className="absolute bg-blue-500/40 rounded-full"
        style={{ width: 120, height: 120, bottom: -50, right: -30 }}
      />

      {/* Logo mark */}
      <View className="w-16 h-16 rounded-2xl bg-white/15 items-center justify-center mb-3">
        <Ionicons name="cube" size={36} color="white" />
      </View>

      {/* App name + tagline */}
      <Text className="font-khmerBold text-white text-3xl">DBM App</Text>
      <Text className="font-khmer text-white/70 text-2xl mt-1">ប្រព័ន្ធគ្រប់គ្រងហាង</Text>
    </View>
  );
}