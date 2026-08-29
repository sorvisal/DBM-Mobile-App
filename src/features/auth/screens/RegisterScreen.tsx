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

const initialValues: RegisterFormValues = {
  username: "",
  fullName: "",
  email: "",
  mobile: "",
  storeName: "",
  password: "",
  confirmPassword: "",
};

export function RegisterScreen({ onRegisterSuccess, onGoLogin }: RegisterScreenProps) {
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<RegisterFormValues>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fullNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const mobileRef = useRef<TextInput>(null);
  const storeNameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const update = (key: keyof RegisterFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleRegister = useCallback(async () => {
    const validationErrors = validateRegister(values);

    if (values.password && values.confirmPassword && values.password !== values.confirmPassword) {
      validationErrors.confirmPassword = "ពាក្យសម្ងាត់មិនត្រូវគ្នា";
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    try {
      const res = await api.auth.register({
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        email: values.email,
        phone: values.mobile,
        storeName: values.storeName,
      });
      setAccessToken(res.tokens.accessToken);
      await setTokens(res.tokens);
      onRegisterSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "ចុះឈ្មោះបរាជ័យ";
      Alert.alert("ចុះឈ្មោះ", message);
      setErrors({ username: message });
    } finally {
      setIsLoading(false);
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
            placeholder=""
            value={values.username}
            onChangeText={(v) => update("username", v)}
            error={errors.username}
            autoCapitalize="none"
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => fullNameRef.current?.focus()}
          />

          <AuthInput
            ref={fullNameRef}
            label="ឈ្មោះពេញ"
            placeholder=""
            value={values.fullName}
            onChangeText={(v) => update("fullName", v)}
            error={errors.fullName}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />

          <AuthInput
            ref={emailRef}
            label="អ៊ីមែល"
            placeholder=""
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
            placeholder=""
            value={values.mobile}
            onChangeText={(v) => update("mobile", v)}
            error={errors.mobile}
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => storeNameRef.current?.focus()}
          />

          <AuthInput
            ref={storeNameRef}
            label="ឈ្មោះហាង"
            placeholder=""
            value={values.storeName}
            onChangeText={(v) => update("storeName", v)}
            error={errors.storeName}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <AuthInput
            ref={passwordRef}
            label="ពាក្យសម្ងាត់"
            placeholder=""
            value={values.password}
            onChangeText={(v) => update("password", v)}
            error={errors.password}
            isPassword
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />

          <AuthInput
            ref={confirmPasswordRef}
            label="បញ្ជាក់ពាក្យសម្ងាត់"
            placeholder=""
            value={values.confirmPassword}
            onChangeText={(v) => update("confirmPassword", v)}
            error={errors.confirmPassword}
            isPassword
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          <AuthButton label={isLoading ? "កំពុងចុះឈ្មោះ..." : "ចុះឈ្មោះ"} onPress={handleRegister} />

          <View className="flex-row items-center justify-center mt-6 mb-8 flex-wrap">
            <Text className="font-khmer text-gray-500 text-xl" numberOfLines={1} maxFontSizeMultiplier={1.3}>មានគណនីរួចហើយ? </Text>
            <TouchableOpacity onPress={onGoLogin}>
              <Text className="font-khmerBold text-blue-600 text-xl" numberOfLines={1} maxFontSizeMultiplier={1.3}>ចូលប្រើប្រាស់</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}