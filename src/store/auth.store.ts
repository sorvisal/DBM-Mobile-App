export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: { id: string; name: string } | null;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
};
