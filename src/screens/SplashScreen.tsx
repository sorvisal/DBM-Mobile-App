import { useEffect } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type SplashScreenProps = {
  onFinish: () => void;
  duration?: number;
};

export function SplashScreen({ onFinish, duration = 1800 }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onFinish, duration);
    return () => clearTimeout(timer);
  }, [onFinish, duration]);

  return (
    <View className="flex-1 bg-blue-600 items-center justify-center">
      <View className="w-24 h-24 rounded-3xl bg-white/15 items-center justify-center mb-4">
        <Ionicons name="cube" size={60} color="white" />
      </View>
      <Text className="font-khmerBold text-white text-3xl">DBM App</Text>
      <Text className="font-khmer text-white/70 text-2xl mt-1">ប្រព័ន្ធគ្រប់គ្រងស្តុក</Text>
    </View>
  );
}