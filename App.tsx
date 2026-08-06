import "./global.css";
import { useEffect, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    "KantumruyPro-Regular": require("./src/assets/fonts/KantumruyPro-Regular.ttf"),
    "KantumruyPro-Medium": require("./src/assets/fonts/KantumruyPro-Medium.ttf"),
    "KantumruyPro-Bold": require("./src/assets/fonts/KantumruyPro-Bold.ttf"),
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
    <View
      className="flex-1 items-center justify-center bg-white"
      onLayout={onLayoutRootView}
    >
      <Text className="text-2xl font-khmerBold text-blue-500">
        DBM_App 🎉 NativeWind v4 ជាមួយពុម្ពអក្សរខ្មែរដំណើរការហើយ!
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}