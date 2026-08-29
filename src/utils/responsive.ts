import { Dimensions } from "react-native";

export const DESIGN_WIDTH = 375;
export const DESIGN_HEIGHT = 812;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Moderate layout size based on screen width so larger phones get slightly
 * larger spacing/typography and smaller phones get slightly smaller, clamped
 * to sane bounds. Non-reactive, so call it inside render styles (it reads the
 * latest window size on every call).
 */
export function moderateScale(size: number, factor = 0.5): number {
  const { width } = Dimensions.get("window");
  const ratio = width / DESIGN_WIDTH;
  return clamp(size + (ratio - 1) * size * factor, size * 0.85, size * 1.25);
}

/** Same as moderateScale but driven by screen height (vertical rhythm). */
export function moderateVerticalScale(size: number, factor = 0.5): number {
  const { height } = Dimensions.get("window");
  const ratio = height / DESIGN_HEIGHT;
  return clamp(size + (ratio - 1) * size * factor, size * 0.85, size * 1.25);
}