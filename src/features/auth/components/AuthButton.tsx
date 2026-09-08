import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from "react-native";

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
};

export function AuthButton({
  label,
  onPress,
  loading = false,
}: AuthButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
      className="bg-blue-700 rounded-xl h-14 items-center justify-center mt-2"
      style={{
        shadowColor: "#2563EB",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        elevation: 4,
      }}
    >
      {loading ? (
        <View className="flex-row items-center">
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />

          <Text className="font-khmerBold text-white text-base ml-2">
            កំពុងចូល...
          </Text>
        </View>
      ) : (
        <Text className="font-khmerBold text-white text-xl">
          ចូលប្រើប្រាស់
        </Text>
      )}
    </TouchableOpacity>
  );
}