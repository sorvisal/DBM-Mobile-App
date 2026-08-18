import { AuthScreen } from "../features/auth/screens/AuthScreen";

type AuthLayoutProps = {
  onAuthenticated: () => void;
};

export function AuthLayout({ onAuthenticated }: AuthLayoutProps) {
  return <AuthScreen onAuthenticated={onAuthenticated} />;
}
