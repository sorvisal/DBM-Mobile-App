import { useState, useRef } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { api, setAccessToken, setTokens } from "@/services";
import { AuthButton } from "../components/AuthButton";
import { AuthHeader } from "../components/AuthHeader";
import { AuthInput } from "../components/AuthInput";
import { validateLogin } from "../hooks/useAuthValidation";
import { LoginFormValues, FormErrors } from "../types";

type LoginScreenProps = {
  onLoginSuccess: () => void;
  onGoRegister: () => void;
  onForgotPassword: () => void;
  onGoogleLogin?: (idToken: string) => void;
};

const initialValues: LoginFormValues = { username: "", password: "" };

export function LoginScreen({ onLoginSuccess, onGoRegister, onForgotPassword, onGoogleLogin }: LoginScreenProps) {
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<LoginFormValues>>({});
  const [isLoading, setIsLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const update = (key: keyof LoginFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleLogin = async () => {
    const validationErrors = validateLogin(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        const res = await api.auth.login({ usernameOrEmail: values.username, password: values.password });
        setAccessToken(res.tokens.accessToken);
        await setTokens(res.tokens);
        onLoginSuccess();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "ចូលប្រើប្រាស់បានបរាជ័យ";
        Alert.alert("ចូលប្រើប្រាស់", message);
        setErrors({ username: message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-blue-600" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="light" />
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

          <AuthButton label={isLoading ? "កំពុងចូល..." : "ចូលប្រើប្រាស់"} onPress={handleLogin} />

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
