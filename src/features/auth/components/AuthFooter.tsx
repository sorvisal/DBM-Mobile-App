import { View, Text } from "react-native";

type AuthFooterProps = {
  version?: string;
};

export function AuthFooter({
  version = "1.0.0",
}: AuthFooterProps) {
  return (
    <View className="items-center justify-center px-6 py-5">
      {/* <Text
        className="font-khmerMedium text-gray-400 text-sm"
        numberOfLines={1}
      >
        DB Management
      </Text>

      <View className="flex-row items-center mt-1">
        <Text className="font-khmer text-gray-300 text-xs">
          © 2026
        </Text>

        <View className="w-1 h-1 rounded-full bg-gray-300 mx-2" />

        <Text className="font-khmer text-gray-300 text-xs">
          v{version}
        </Text>
      </View> */}
    </View>
  );
}