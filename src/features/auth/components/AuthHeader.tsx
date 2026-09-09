import { View, Text, Image } from "react-native";
import { APP_LOGO } from "../../../constants/appAssets";

export function AuthHeader() {
  return (
    <View className="items-center pt-10 pb-8 mt-8">
      {/* Logo */}
      <View
        className="w-24 h-24 bg-white rounded-3xl items-center justify-center overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: {
            width: 0,
            height: 5,
          },
          elevation: 3,
        }}
      >
        <Image
          source={APP_LOGO}
          style={{
            width: 500,
            height: 70,
          }}
          resizeMode="contain"
        />
      </View>

      {/* App Name */}
      <Text
        className="font-khmerBold text-gray-900 text-3xl mt-2"
        numberOfLines={1}
      >
        DB Management
      </Text>

      {/* Description */}
      <Text
        className="font-khmerMedium text-gray-400 text-lg mt-1 text-center px-6"
        numberOfLines={2}
      >
        ប្រព័ន្ធគ្រប់គ្រងអាជីវកម្មបែបឌីជីថល
      </Text>
    </View>
  );
}