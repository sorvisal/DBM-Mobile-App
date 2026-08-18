import { View, Text, Image } from "react-native";

type CustomerAvatarProps = {
  initials: string;
  color: string;
  size?: number;
  source?: string | null;
};

export function CustomerAvatar({ initials, color, size = 50, source }: CustomerAvatarProps) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", backgroundColor: color }}
      className="items-center justify-center"
    >
      {source ? (
        <Image
          source={{ uri: source }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <Text className="font-khmerBold text-white" style={{ fontSize: size * 0.36 }}>
          {initials}
        </Text>
      )}
    </View>
  );
}
