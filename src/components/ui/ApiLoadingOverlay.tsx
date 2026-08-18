import { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { isGlobalLoading, subscribeLoading } from "@/services/loading";

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
      {/* <Ionicons name="hourglass-outline" size={size} color={color} /> */}
    </Animated.View>
  );
}

const SHOW_DELAY_MS = 200;

export function ApiLoadingOverlay() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeLoading(() => {
      if (isGlobalLoading()) {
        // Delay before showing to avoid flash on fast requests
        if (!timerRef.current) {
          timerRef.current = setTimeout(() => {
            timerRef.current = null;
            if (isGlobalLoading()) {
              setVisible(true);
            }
          }, SHOW_DELAY_MS);
        }
      } else {
        // All tracked requests finished – cancel pending timer, hide immediately
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setVisible(false);
      }
    });

    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(120)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // backgroundColor: "rgba(255,255,255,0.85)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        elevation: 9999,
      }}
      pointerEvents="auto"
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner size={40} color="#2563EB" />
        <Text
          style={{
            marginTop: 14,
            color: "#6B7280",
            fontSize: 15,
            fontWeight: "500",
          }}
        >
          {/* កំពុងផ្ទុក... */}
        </Text>
      </View>
    </Animated.View>
  );
}
