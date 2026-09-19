import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type SnackbarData = {
  title: string;
  message: string;
};

export function useSnackbar(duration = 2600) {
  const [data, setData] = useState<SnackbarData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSnackbar = useCallback(
    (next: SnackbarData) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setData(next);
      timerRef.current = setTimeout(() => {
        setData(null);
      }, duration);
    },
    [duration]
  );

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    []
  );

  return { snackbar: data, showSnackbar };
}

export function Snackbar({
  data,
}: {
  data: SnackbarData | null;
}) {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (data) {
      progress.value = withTiming(1, {
        duration: 220,
      });
    } else {
      progress.value = withTiming(0, {
        duration: 180,
      });
    }
  }, [data, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: 14 * (1 - progress.value),
      },
    ],
  }));

  if (!data) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        animatedStyle,
        {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: insets.bottom + 20,
          zIndex: 60,
        },
      ]}
    >
      <View className="bg-gray-900/95 rounded-xl px-4 py-3 flex-row items-center">
        <Ionicons
          name="warning-outline"
          size={22}
          color="#FBBF24"
        />

        <View className="flex-1 ml-3">
          <Text
            className="font-khmerBold text-white text-lg"
            maxFontSizeMultiplier={1.3}
          >
            {data.title}
          </Text>

          <Text
            className="font-khmer text-white/90 text-base mt-0.5 leading-5"
            maxFontSizeMultiplier={1.3}
          >
            {data.message}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}