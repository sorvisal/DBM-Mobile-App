export const typography = {
  fontFamily: {
    regular: "KantumruyPro-Regular",
    medium: "KantumruyPro-Medium",
    bold: "KantumruyPro-Bold",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
  },
  /**
   * Cap applied to critical UI text (numbers, badges, tab labels, chart
   * labels) so a large OS font scale can't blow up the layout. Normal body
   * text is left to scale with the user's accessibility preferences.
   */
  maxFontSizeMultiplier: 1.3,
} as const;

/** Earliest breakpoint widths (pt) used to pick shortened variants of text. */
export const TYPOGRAPHY_BREAKPOINTS = {
  truncateAt: 360,
} as const;