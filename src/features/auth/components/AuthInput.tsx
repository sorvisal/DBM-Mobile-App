import {
  forwardRef,
  useState,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type AuthInputProps = TextInputProps & {
  label: string;
  error?: string;
  isPassword?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

export const AuthInput = forwardRef<TextInput, AuthInputProps>(
  (
    {
      label,
      error,
      isPassword,
      icon,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <View className="mb-4">
        {/* Label */}
        <Text
          className="font-khmerMedium text-gray-800 text-lg mb-2"
          numberOfLines={1}
        >
          {label}
        </Text>

        {/* Input */}
        <View
          className={`flex-row items-center h-12 rounded-2xl px-4 bg-white border ${
            error
              ? "border-red-400"
              : "border-gray-200"
          }`}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={19}
              color="#9CA3AF"
              style={{ marginRight: 10 }}
            />
          )}

          <TextInput
          ref={ref}
          {...props}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor="#B0B6C1"
          className="font-khmerMedium flex-1 text-xl text-gray-800"
          style={{
            height: "100%",
            paddingTop: 0,
            paddingBottom: 0,
            paddingHorizontal: 0,
            includeFontPadding: false,
            textAlignVertical: "center",
            outlineWidth: 0,
          }}
        />

          {isPassword && (
            <TouchableOpacity
              onPress={() =>
                setShowPassword((prev) => !prev)
              }
              hitSlop={10}
            >
              <Ionicons
                name={
                  showPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Error */}
        {error && (
          <Text
            className="font-khmer text-red-500 text-sm mt-1.5"
            numberOfLines={2}
          >
            {error}
          </Text>
        )}
      </View>
    );
  }
);

AuthInput.displayName = "AuthInput";