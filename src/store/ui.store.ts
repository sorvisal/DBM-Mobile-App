export interface UIState {
  isLoading: boolean;
  toasts: string[];
}

export const initialUIState: UIState = {
  isLoading: false,
  toasts: [],
};
