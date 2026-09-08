import {
  useState,
  useRef,
  useEffect,
} from "react";
import { AuthFooter } from "../components/AuthFooter";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  api,
  setAccessToken,
  setTokens,
} from "@/services";

import { AuthButton } from "../components/AuthButton";
import { AuthHeader } from "../components/AuthHeader";
import { AuthInput } from "../components/AuthInput";

import { validateLogin } from "../hooks/useAuthValidation";
import {
  LoginFormValues,
  FormErrors,
} from "../types";

type LoginScreenProps = {
  onLoginSuccess: () => void;
  onGoRegister: () => void;
  onForgotPassword: () => void;
  onGoogleLogin?: (idToken: string) => void;
};

const initialValues: LoginFormValues = {
  username: "",
  password: "",
};

export function LoginScreen({
  onLoginSuccess,
  onGoRegister,
  onForgotPassword,
  onGoogleLogin,
}: LoginScreenProps) {
  const [values, setValues] =
    useState<LoginFormValues>(initialValues);

  const [errors, setErrors] =
    useState<FormErrors<LoginFormValues>>({});

  const [isLoading, setIsLoading] =
    useState(false);

  const passwordRef =
    useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  // ---------------------------------------------------------
  // Animations
  // ---------------------------------------------------------

  const logoOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const logoScale = useRef(
    new Animated.Value(0.85)
  ).current;

  const cardOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const cardTranslateY = useRef(
    new Animated.Value(35)
  ).current;

  const footerOpacity = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(
            Easing.cubic
          ),
          useNativeDriver: true,
        }),

        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(
            Easing.cubic
          ),
          useNativeDriver: true,
        }),

        Animated.timing(cardTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(
            Easing.cubic
          ),
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    logoOpacity,
    logoScale,
    cardOpacity,
    cardTranslateY,
    footerOpacity,
  ]);

  // ---------------------------------------------------------
  // Update field
  // ---------------------------------------------------------

  const update = (
    key: keyof LoginFormValues,
    value: string
  ) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: undefined,
      }));
    }
  };

  // ---------------------------------------------------------
  // Login
  // ---------------------------------------------------------

  const handleLogin = async () => {
    const validationErrors =
      validateLogin(values);

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length !== 0
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.auth.login({
        usernameOrEmail:
          values.username.trim(),
        password: values.password,
      });

      setAccessToken(
        res.tokens.accessToken
      );

      await setTokens(res.tokens);

      onLoginSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "ចូលប្រើប្រាស់បានបរាជ័យ";

      Alert.alert(
        "ចូលប្រើប្រាស់",
        message
      );

      setErrors({
        username: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

return (
  <KeyboardAvoidingView
    className="flex-1 bg-white"
    behavior={
      Platform.OS === "ios"
        ? "padding"
        : undefined
    }
  >
    <StatusBar style="dark" />

    <View className="flex-1 overflow-hidden">

      {/* =====================================================
          ONE AUTH BACKGROUND
          Header + Footer use SAME background
      ===================================================== */}

      {/* Top-right blue decoration */}
      <View
        className="absolute bg-blue-600 rounded-full"
        style={{
          width: 180,
          height: 180,
          top: -110,
          right: -75,
        }}
      />

      {/* Top-right light blue */}
      <View
        className="absolute bg-blue-100 rounded-full"
        style={{
          width: 90,
          height: 90,
          top: 70,
          right: -45,
        }}
      />

      {/* Bottom-left blue decoration */}
      <View
        className="absolute bg-blue-600 rounded-full"
        style={{
          width: 165,
          height: 165,
          bottom: -115,
          left: -75,
        }}
      />

      {/* Bottom-left light blue */}
      <View
        className="absolute bg-blue-100 rounded-full"
        style={{
          width: 80,
          height: 80,
          bottom: -35,
          left: 65,
        }}
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 25,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === "ios"
            ? "interactive"
            : "on-drag"
        }
        showsVerticalScrollIndicator={false}
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [
              {
                scale: logoScale,
              },
            ],
          }}
        >
          <AuthHeader />
        </Animated.View>

        {/* ===================================================
            LOGIN CARD
        =================================================== */}

        <Animated.View
          style={{
            opacity: cardOpacity,
            transform: [
              {
                translateY: cardTranslateY,
              },
            ],
          }}
          className="mx-5 -mt-2"
        >
          <View
            className="bg-white rounded-3xl px-5 pt-6 pb-7"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 18,
              shadowOffset: {
                width: 0,
                height: 8,
              },
              elevation: 5,
            }}
          >
            {/* Title */}
            <Text className="font-khmerBold text-gray-900 text-2xl">
              ចូលប្រើប្រាស់
            </Text>

            <Text className="font-khmer text-gray-400 text-base mt-1 mb-6">
              សូមបញ្ចូលព័ត៌មានរបស់អ្នក
            </Text>

            {/* Username */}
            <AuthInput
              label="ឈ្មោះអ្នកប្រើប្រាស់"
              placeholder="ឈ្មោះអ្នកប្រើប្រាស់"
              value={values.username}
              onChangeText={(v) =>
                update("username", v)
              }
              error={errors.username}
              icon="person-outline"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() =>
                passwordRef.current?.focus()
              }
            />

            {/* Password */}
            <AuthInput
              ref={passwordRef}
              label="ពាក្យសម្ងាត់"
              placeholder="ពាក្យសម្ងាត់"
              value={values.password}
              onChangeText={(v) =>
                update("password", v)
              }
              error={errors.password}
              icon="lock-closed-outline"
              isPassword
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            {/* Login */}
            <AuthButton
              label="ចូលប្រើប្រាស់"
              onPress={handleLogin}
              loading={isLoading}
            />

          </View>
        </Animated.View>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <Animated.View
          style={{
            opacity: footerOpacity,
          }}
        >
          <AuthFooter version="1.0.0" />
        </Animated.View>

      </ScrollView>
    </View>
  </KeyboardAvoidingView>
);
}