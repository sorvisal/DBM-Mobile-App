import { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";

function Spinner({ size, color }: { size: number; color: string }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name="hourglass-outline" size={size} color={color} />
    </Animated.View>
  );
}

type LoadingStateProps = {
  text?: string;
  compact?: boolean;
};

export function LoadingState({
  text = "កំពុងផ្ទុកទិន្នន័យ...",
  compact = false,
}: LoadingStateProps) {
  if (compact) {
    return (
      <View className="items-center py-16">
        <Spinner size={34} color="#2563EB" />
        <Text className="font-khmer text-gray-400 text-lg mt-3 text-center">{text}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Spinner size={44} color="#2563EB" />
      <Text className="font-khmer text-gray-500 text-xl mt-4 text-center">{text}</Text>
    </View>
  );
}

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  text?: string;
  compact?: boolean;
};

export function EmptyState({
  icon = "file-tray-outline",
  text = "មិនមានទិន្នន័យ",
  compact = false,
}: EmptyStateProps) {
  return (
    <View className={`${compact ? "items-center py-16" : "flex-1 items-center justify-center px-8"}`}>
      <Ionicons name={icon} size={36} color="#D1D5DB" />
      <Text className="font-khmer text-gray-400 text-xl mt-3 text-center">{text}</Text>
    </View>
  );
}

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
};

export function ErrorState({
  message = "មិនអាចទាញយកទិន្នន័យបាន",
  onRetry,
  compact = false,
}: ErrorStateProps) {
  return (
    <View className={`${compact ? "items-center py-16 px-8" : "flex-1 items-center justify-center px-8"}`}>
      <Ionicons name="cloud-offline-outline" size={36} color="#EF4444" />
      <Text className="font-khmer text-red-500 text-lg mt-3 text-center">{message}</Text>
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          className="mt-4 flex-row items-center bg-blue-600 rounded-xl px-5 h-11"
        >
          <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
          <Text className="font-khmerBold text-white text-lg ml-2">ព្យាយាមម្តងទៀត</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
