export function useAppState() {
  return { isActive: true, appState: "active" as const };
}
