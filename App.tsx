import "./global.css";
import { useEffect, useCallback, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreenNative from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ReducedMotionConfig, ReduceMotion } from "react-native-reanimated";

import { RootLayout } from "./src/layouts/RootLayout";
import { AuthLayout } from "./src/layouts/AuthLayout";
import { SplashScreen } from "./src/screens/SplashScreen";

SplashScreenNative.preventAutoHideAsync();

type AppStage = "splash" | "auth" | "main";

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    "KantumruyPro-Regular": require("./src/assets/fonts/KantumruyPro-Regular.ttf"),
    "KantumruyPro-Medium": require("./src/assets/fonts/KantumruyPro-Medium.ttf"),
    "KantumruyPro-Bold": require("./src/assets/fonts/KantumruyPro-Bold.ttf"),
  });

  const [stage, setStage] = useState<AppStage>("splash");

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreenNative.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReducedMotionConfig mode={ReduceMotion.Never} />
      <SafeAreaProvider>
        {stage === "splash" && <SplashScreen onFinish={() => setStage("auth")} />}
        {stage === "auth" && <AuthLayout onAuthenticated={() => setStage("main")} />}
        {stage === "main" && <RootLayout />}
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}