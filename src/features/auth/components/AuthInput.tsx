import { forwardRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type AuthInputProps = TextInputProps & {
  label: string;
  error?: string;
  isPassword?: boolean;
};

export const AuthInput = forwardRef<TextInput, AuthInputProps>(
  ({ label, error, isPassword, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <View className="mb-4">
        <Text className="font-khmerMedium text-blue-600 text-xl mb-1.5">{label}</Text>
        <View
          className={`flex-row items-center border rounded-xl px-3 h-12 ${
            error ? "border-red-400" : "border-gray-200"
          }`}
        >
          <TextInput
            ref={ref}
            {...props}
            secureTextEntry={isPassword && !showPassword}
            placeholderTextColor="#D1D5DB"
            className="font-khmer flex-1 text-xl text-gray-800"
            style={{ outlineWidth: 0, borderWidth: 0, backgroundColor: "transparent" }}
          />
          {isPassword && (
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={19} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        {error && <Text className="font-khmer text-red-500 text-[14px] mt-1">{error}</Text>}
      </View>
    );
  }
);

AuthInput.displayName = "AuthInput";