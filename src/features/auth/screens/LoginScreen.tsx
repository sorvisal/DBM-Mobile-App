import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { AuthHeader } from "../components/AuthHeader";
import { AuthInput } from "../components/AuthInput";
import { AuthButton } from "../components/AuthButton";
import { validateLogin } from "../hooks/useAuthValidation";
import { LoginFormValues, FormErrors } from "../types";

type LoginScreenProps = {
  onLoginSuccess: () => void;
  onGoRegister: () => void;
  onForgotPassword: () => void;
};

const initialValues: LoginFormValues = { username: "", password: "" };

export function LoginScreen({ onLoginSuccess, onGoRegister, onForgotPassword }: LoginScreenProps) {
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<LoginFormValues>>({});
  const passwordRef = useRef<TextInput>(null);

  const update = (key: keyof LoginFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleLogin = () => {
    const validationErrors = validateLogin(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onLoginSuccess();
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-blue-600" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader />

        <View className="flex-1 bg-white rounded-t-3xl px-6 pt-8" style={{ marginTop: -28 }}>
          <Text className="font-khmerBold text-gray-900 text-2xl mb-6">ចូលប្រើប្រាស់</Text>

          <AuthInput
            label="ឈ្មោះអ្នកប្រើប្រាស់"
            placeholder="ឈ្មោះអ្នកប្រើប្រាស់"
            value={values.username}
            onChangeText={(v) => update("username", v)}
            error={errors.username}
            autoCapitalize="none"
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <AuthInput
            ref={passwordRef}
            label="ពាក្យសម្ងាត់"
            placeholder="ពាក្យសម្ងាត់"
            value={values.password}
            onChangeText={(v) => update("password", v)}
            error={errors.password}
            isPassword
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity onPress={onForgotPassword} className="self-end mb-4">
            <Text className="font-khmer text-blue-600 text-xl">ភ្លេចពាក្យសម្ងាត់?</Text>
          </TouchableOpacity>

          <AuthButton label="ចូលប្រើប្រាស់" onPress={handleLogin} />

          <View className="flex-row items-center justify-center mt-6 mb-8">
            <Text className="font-khmer text-gray-500 text-xl">មិនទាន់មានគណនី? </Text>
            <TouchableOpacity onPress={onGoRegister}>
              <Text className="font-khmerBold text-blue-600 text-xl">ចុះឈ្មោះ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}