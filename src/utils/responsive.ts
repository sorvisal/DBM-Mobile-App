import { Dimensions } from "react-native";

export const DESIGN_WIDTH = 375;
export const DESIGN_HEIGHT = 812;

export function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Responsive size based on screen width.
 */
export function moderateScale(
  size: number,
  factor = 0.5
): number {
  const { width } = Dimensions.get("window");

  const ratio = width / DESIGN_WIDTH;

  return clamp(
    size + (ratio - 1) * size * factor,
    size * 0.85,
    size * 1.25
  );
}

/**
 * Responsive size based on screen height.
 */
export function moderateVerticalScale(
  size: number,
  factor = 0.5
): number {
  const { height } = Dimensions.get("window");

  const ratio = height / DESIGN_HEIGHT;

  return clamp(
    size + (ratio - 1) * size * factor,
    size * 0.85,
    size * 1.25
  );
}

/**
 * Responsive horizontal spacing.
 */
export function horizontalScale(
  size: number
): number {
  return moderateScale(size, 0.5);
}

/**
 * Responsive vertical spacing.
 */
export function verticalScale(
  size: number
): number {
  return moderateVerticalScale(size, 0.5);
}