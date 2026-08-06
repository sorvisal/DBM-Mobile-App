import { useEffect, useCallback } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootLayout } from "./layouts/RootLayout";
import { DashboardScreen } from "./features/dashboard/screens/DashboardScreen";

SplashScreen.preventAutoHideAsync();


export default function App() {

  const [fontsLoaded, fontError] = useFonts({
    "KantumruyPro-Regular": require("./assets/fonts/KantumruyPro-Regular.ttf"),
    "KantumruyPro-Medium": require("./assets/fonts/KantumruyPro-Medium.ttf"),
    "KantumruyPro-Bold": require("./assets/fonts/KantumruyPro-Bold.ttf"),
  });


  const onLayoutRootView = useCallback(async () => {

    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }

  }, [fontsLoaded, fontError]);


  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);


  if (!fontsLoaded && !fontError) {
    return null;
  }


  return (
    <SafeAreaProvider>
      <RootLayout>

        <DashboardScreen />

      </RootLayout>
    </SafeAreaProvider>
  );
}