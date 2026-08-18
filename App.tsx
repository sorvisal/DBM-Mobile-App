import { useEffect, useCallback, useState } from "react";
import { useFonts } from "expo-font";
import * as SplashScreenNative from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ReducedMotionConfig, ReduceMotion } from "react-native-reanimated";

import { RootLayout } from "./src/layouts/RootLayout";
import { AuthLayout } from "./src/layouts/AuthLayout";
import { SplashScreen } from "./src/screens/SplashScreen";
import { ApiLoadingOverlay } from "./src/components/ui/ApiLoadingOverlay";
import { onUnauthorized, restoreAccessToken, initCache, clearTokens, cacheClearAll } from "./src/services";
import { api } from "./src/services/api";

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

  useEffect(() => {
    return onUnauthorized(() => setStage("auth"));
  }, []);

  const handleSplashFinish = async () => {
    await cacheClearAll(); // clear stale cached data first — before any hooks read from it
    await initCache();
    const restored = await restoreAccessToken();
    if (!restored) {
      setStage("auth");
      return;
    }
    try {
      await api.auth.me();
      setStage("main");
    } catch {
      await clearTokens();
      setStage("auth");
    }
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReducedMotionConfig mode={ReduceMotion.Never} />
      <SafeAreaProvider>
        {stage === "splash" && <SplashScreen onFinish={handleSplashFinish} />}
        {stage === "auth" && <AuthLayout onAuthenticated={() => setStage("main")} />}
        {stage === "main" && <RootLayout onLogout={() => setStage("auth")} />}
        <ApiLoadingOverlay />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
