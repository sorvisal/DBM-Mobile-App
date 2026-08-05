import "./global.css";
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-blue-500">
        DBM_App 🎉 NativeWind v4 is working!
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
