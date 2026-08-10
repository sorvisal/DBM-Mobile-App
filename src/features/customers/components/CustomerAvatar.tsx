import { View, Text } from "react-native";

type CustomerAvatarProps = {
  initials: string;
  color: string;
  size?: number;
};

export function CustomerAvatar({ initials, color, size = 50 }: CustomerAvatarProps) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }}
      className="items-center justify-center"
    >
      <Text className="font-khmerBold text-white" style={{ fontSize: size * 0.36 }}>
        {initials}
      </Text>
    </View>
  );
}