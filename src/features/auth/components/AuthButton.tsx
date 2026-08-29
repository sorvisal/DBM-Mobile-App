import { Text, TouchableOpacity } from "react-native";

type AuthButtonProps = {
  label: string;
  onPress: () => void;
};

export function AuthButton({ label, onPress }: AuthButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-blue-600 rounded-xl h-12 items-center justify-center mt-2"
    >
      <Text className="font-khmerBold text-white text-xl text-center" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} maxFontSizeMultiplier={1.3} style={{ width: "100%" }}>{label}</Text>
    </TouchableOpacity>
  );
}