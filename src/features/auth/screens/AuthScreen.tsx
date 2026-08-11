import { useState } from "react";
import { LoginScreen } from "./LoginScreen";
import { RegisterScreen } from "./RegisterScreen";

type AuthScreenProps = {
  onAuthenticated: () => void;
};

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [view, setView] = useState<"login" | "register">("login");

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
        // TODO: wire up forgot-password flow
      }}
    />
  );
}