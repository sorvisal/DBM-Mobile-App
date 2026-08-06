export type ThemeMode = "light" | "dark";

export interface ThemeState {
  mode: ThemeMode;
}

export const initialThemeState: ThemeState = {
  mode: "light",
};
