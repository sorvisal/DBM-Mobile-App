// Android pads TextInputs vertically by default, which clips text inside
// fixed-height fields. These style props normalize it on both platforms.
export const androidInputStyle = {
  paddingVertical: 0,
  includeFontPadding: false,
  textAlignVertical: "center" as const,
};
