import { useState } from "react";
import { Alert } from "react-native";
import { LoginScreen } from "./LoginScreen";
import { RegisterScreen } from "./RegisterScreen";
import { api, setAccessToken, setTokens } from "@/services";

type AuthScreenProps = {
  onAuthenticated: () => void;
};

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [view, setView] = useState<"login" | "register">("login");

  const handleGoogleLogin = async (idToken: string) => {
    try {
      const res = await api.auth.googleSignIn({ idToken });
      setAccessToken(res.tokens.accessToken);
      await setTokens(res.tokens);
      onAuthenticated();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      Alert.alert("Error", message);
    }
  };

  if (view === "register") {
    return (
      <RegisterScreen
        onRegisterSuccess={onAuthenticated}
        onGoLogin={() => setView("login")}
      />
    );
  }

  return (
    <LoginScreen
      onLoginSuccess={onAuthenticated}
      onGoRegister={() => setView("register")}
      onForgotPassword={() => {
        Alert.alert("ភ្លេចពាក្យសម្ងាត់", "សូមទាក់ទងអ្នកគ្រប់គ្រង");
      }}
      onGoogleLogin={handleGoogleLogin}
    />
  );
}