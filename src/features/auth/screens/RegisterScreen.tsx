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
import { validateRegister } from "../hooks/useAuthValidation";
import { RegisterFormValues, FormErrors } from "../types";

type RegisterScreenProps = {
  onRegisterSuccess: () => void;
  onGoLogin: () => void;
};

const initialValues: RegisterFormValues = { username: "", email: "", mobile: "", password: "" };

export function RegisterScreen({ onRegisterSuccess, onGoLogin }: RegisterScreenProps) {
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<RegisterFormValues>>({});

  const emailRef = useRef<TextInput>(null);
  const mobileRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const update = (key: keyof RegisterFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleRegister = () => {
    const validationErrors = validateRegister(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onRegisterSuccess();
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
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          <AuthButton label="ចុះឈ្មោះ" onPress={handleRegister} />

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