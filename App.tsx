import { useEffect, useCallback, useState } from "react";
import { useFonts } from "expo-font";
import * as SplashScreenNative from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  ReducedMotionConfig,
  ReduceMotion,
} from "react-native-reanimated";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { RootLayout } from "./src/layouts/RootLayout";
import { AuthLayout } from "./src/layouts/AuthLayout";
import { SplashScreen } from "./src/screens/SplashScreen";
import { ApiLoadingOverlay } from "./src/components/ui/ApiLoadingOverlay";
import {
  onUnauthorized,
  restoreAccessToken,
  initCache,
  clearTokens,
  cacheClearAll,
} from "./src/services";
import { api } from "./src/services/api";
import { preloadAppAssets } from "./src/constants/appAssets";

SplashScreenNative.preventAutoHideAsync();

type AppStage = "splash" | "auth" | "main";

export default function App() {
  // ---------------------------------------------------------
  // Fonts
  // ---------------------------------------------------------
  const [fontsLoaded, fontError] = useFonts({
    "KantumruyPro-Regular": require(
      "./src/assets/fonts/KantumruyPro-Regular.ttf"
    ),
    "KantumruyPro-Medium": require(
      "./src/assets/fonts/KantumruyPro-Medium.ttf"
    ),
    "KantumruyPro-Bold": require(
      "./src/assets/fonts/KantumruyPro-Bold.ttf"
    ),
  });

  // ---------------------------------------------------------
  // App stage
  // ---------------------------------------------------------
  const [stage, setStage] = useState<AppStage>("splash");

  // ---------------------------------------------------------
  // App assets
  // ---------------------------------------------------------
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // ---------------------------------------------------------
  // Preload logo
  // ---------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    const loadAssets = async () => {
      try {
        if (__DEV__) {
          console.log("[APP] Preloading app assets...");
        }

        await preloadAppAssets();

        if (__DEV__) {
          console.log("[APP] App assets loaded");
        }

        if (mounted) {
          setAssetsLoaded(true);
        }
      } catch (error) {
        console.error("[APP] Failed to preload app assets:", error);

        // Continue even if preload fails.
        // The Image component can still try to load the asset normally.
        if (mounted) {
          setAssetsLoaded(true);
        }
      }
    };

    loadAssets();

    return () => {
      mounted = false;
    };
  }, []);

  // ---------------------------------------------------------
  // Hide native splash
  // Only hide when fonts + logo are ready
  // ---------------------------------------------------------
  const onLayoutRootView = useCallback(async () => {
    if (
      (fontsLoaded || fontError) &&
      assetsLoaded
    ) {
      await SplashScreenNative.hideAsync();
    }
  }, [fontsLoaded, fontError, assetsLoaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  // ---------------------------------------------------------
  // Unauthorized listener
  // ---------------------------------------------------------
  useEffect(() => {
    return onUnauthorized(() => setStage("auth"));
  }, []);

  // ---------------------------------------------------------
  // Splash finish
  // ---------------------------------------------------------
  const handleSplashFinish = async () => {
    await cacheClearAll();
    await initCache();

    if (__DEV__) {
      console.log("[APP] Restoring access token...");
    }

    const restored = await restoreAccessToken();

    if (!restored) {
      if (__DEV__) {
        console.log("[APP] No saved token → auth");
      }

      setStage("auth");
      return;
    }

    if (__DEV__) {
      console.log(
        "[APP] Token restored, verifying with /auth/me..."
      );
    }

    try {
      await api.auth.me();

      if (__DEV__) {
        console.log("[APP] /auth/me OK → main");
      }

      setStage("main");
    } catch (err) {
      if (__DEV__) {
        console.log(
          "[APP] /auth/me FAILED → auth",
          err
        );
      }

      await clearTokens();
      setStage("auth");
    }
  };

  // ---------------------------------------------------------
  // Wait for fonts + assets
  // ---------------------------------------------------------
  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!assetsLoaded) {
    return null;
  }

  // ---------------------------------------------------------
  // App UI
  // ---------------------------------------------------------
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ReducedMotionConfig mode={ReduceMotion.Never} />

        <SafeAreaProvider>
          {stage === "splash" && (
            <SplashScreen
              onFinish={handleSplashFinish}
              duration={1200}
            />
          )}

          {stage === "auth" && (
            <AuthLayout
              onAuthenticated={() => setStage("main")}
            />
          )}

          {stage === "main" && (
            <RootLayout
              onLogout={() => setStage("auth")}
            />
          )}

          <ApiLoadingOverlay />
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}