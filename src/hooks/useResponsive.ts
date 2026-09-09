import {
  Platform,
  useWindowDimensions,
} from "react-native";

export const SCREEN_BREAKPOINTS = {
  smallPhone: 360,
  mediumPhone: 400,
  desktop: 768,
} as const;

export function useResponsive() {
  const {
    width,
    height,
    fontScale,
    scale: pixelRatio,
  } = useWindowDimensions();

  const isSmallPhone =
    width < SCREEN_BREAKPOINTS.smallPhone;

  const isMediumPhone =
    width >= SCREEN_BREAKPOINTS.smallPhone &&
    width < SCREEN_BREAKPOINTS.mediumPhone;

  const isLargePhone =
    width >= SCREEN_BREAKPOINTS.mediumPhone;

  const isDesktop =
    width >= SCREEN_BREAKPOINTS.desktop &&
    Platform.OS === "web";

  const horizontalPadding = isSmallPhone
    ? 14
    : isMediumPhone
      ? 18
      : 20;

  const contentWidth =
    Math.max(width - horizontalPadding * 2, 0);

  const displayScale = Math.min(
    Math.max(width / 375, 0.85),
    1.15
  );

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

    // Layout helpers
    horizontalPadding,
    contentWidth,
    displayScale,
  };
}