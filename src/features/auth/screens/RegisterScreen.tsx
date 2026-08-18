import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthHeader } from "../components/AuthHeader";
import { AuthInput } from "../components/AuthInput";
import { AuthButton } from "../components/AuthButton";
import { validateRegister } from "../hooks/useAuthValidation";
import { RegisterFormValues, FormErrors } from "../types";
import { api, setAccessToken, setTokens } from "@/services";

type RegisterScreenProps = {
  onRegisterSuccess: () => void;
  onGoLogin: () => void;
};

const initialValues: RegisterFormValues = { username: "", email: "", mobile: "", password: "", confirmPassword: "" };

export function RegisterScreen({ onRegisterSuccess, onGoLogin }: RegisterScreenProps) {
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<RegisterFormValues>>({});
  const [isLoading, setIsLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const mobileRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const update = (key: keyof RegisterFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleRegister = useCallback(async () => {
    const validationErrors = validateRegister(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      if (values.password !== values.confirmPassword) {
        setErrors({ password: "ពាក្យសម្ងាត់មិនត្រឹមត្រូវ" });
        return;
      }
      setIsLoading(true);
      try {
        const res = await api.auth.register({
          fullName: values.username,
          usernameOrEmail: values.email,
          password: values.password,
          storeName: values.username,
          phone: values.mobile,
        });
        setAccessToken(res.tokens.accessToken);
        await setTokens(res.tokens);
        onRegisterSuccess();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "ចុះឈ្មោះបរាជ័យ";
        Alert.alert("ចុះឈ្មោះ", message);
        setErrors({ email: message });
      } finally {
        setIsLoading(false);
      }
    }
  }, [values]);

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
          <Text className="font-khmerBold text-gray-900 text-2xl mb-6">ចុះឈ្មោះ</Text>

          <AuthInput
            label="ឈ្មោះអ្នកប្រើប្រាស់"
            placeholder="ឈ្មោះអ្នកប្រើប្រាស់"
            value={values.username}
            onChangeText={(v) => update("username", v)}
            error={errors.username}
            autoCapitalize="none"
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />

          <AuthInput
            ref={emailRef}
            label="បញ្ចូលអ៊ីមែល"
            placeholder="បញ្ចូលអ៊ីមែល"
            value={values.email}
            onChangeText={(v) => update("email", v)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => mobileRef.current?.focus()}
          />

          <AuthInput
            ref={mobileRef}
            label="លេខទូរស័ព្ទ"
            placeholder="លេខទូរស័ព្ទ"
            value={values.mobile}
            onChangeText={(v) => update("mobile", v)}
            error={errors.mobile}
            keyboardType="phone-pad"
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
            returnKeyType="next"
            onSubmitEditing={() => {}}
          />

          <AuthInput
            label="បញ្ជាក់ពាក្យសម្ងាត់"
            placeholder="បញ្ជាក់ពាក្យសម្ងាត់"
            value={values.confirmPassword}
            onChangeText={(v) => update("confirmPassword", v)}
            error={errors.confirmPassword}
            isPassword
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          <AuthButton label={isLoading ? "កំពុងចុះឈ្មោះ..." : "ចុះឈ្មោះ"} onPress={handleRegister} />

          <View className="flex-row items-center justify-center mt-6 mb-8">
            <Text className="font-khmer text-gray-500 text-xl">មានគណនីរួចហើយ? </Text>
            <TouchableOpacity onPress={onGoLogin}>
              <Text className="font-khmerBold text-blue-600 text-xl">ចូលប្រើប្រាស់</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}