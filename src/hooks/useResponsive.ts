import { Platform, useWindowDimensions } from "react-native";

export const SCREEN_BREAKPOINTS = {
  smallPhone: 376,
  largePhone: 400,
  desktop: 768,
} as const;

/**
 * Reactive, useWindowDimensions-based responsive helper.
 *
 * Provides the window size, derived phone-size buckets, and spacing/scale
 * helpers derived from the current window. Use the boolean buckets to branch
 * layout (e.g. stack buttons on small phones) and `displayScale` to scale
 * hard-coded inline dimensions.
 */
export function useResponsive() {
  const { width, height, fontScale, scale: pixelRatio } = useWindowDimensions();

  const isSmallPhone = width < SCREEN_BREAKPOINTS.smallPhone;
  const isLargePhone = width >= SCREEN_BREAKPOINTS.largePhone;
  const isMediumPhone = !isSmallPhone && !isLargePhone;
  const isDesktop = width >= SCREEN_BREAKPOINTS.desktop && Platform.OS === "web";

  const horizontalPadding = isSmallPhone ? 16 : 20;
  const contentWidth = width - horizontalPadding * 2;

  // Scale factor relative to a 375pt design width (0.85 ... 1.15 hard bounds).
  const displayScale = Math.min(Math.max(width / 375, 0.85), 1.15);

  return {
    width,
    height,
    fontScale,
    pixelRatio,
    // Backwards-compatible aliases
    isMobile: !isDesktop,
    isDesktop,
    windowWidth: width,
    // Phone size buckets
    isSmallPhone,
    isMediumPhone,
    isLargePhone,
    // Derived layout helpers
    horizontalPadding,
    contentWidth,
    displayScale,
  };
}