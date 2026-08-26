import { PREMIUM_COLORS } from './design/colors';
import { TYPOGRAPHY } from './design/typography';
import { SPACING as NEW_SPACING } from './design/spacing';
import { SHADOWS as NEW_SHADOWS } from './design/shadows';

export const colors = {
  // Existing Material You style keys mapped to Premium palette where applicable
  "surface-container-high": "#e6e9e7",
  "on-surface": PREMIUM_COLORS.textPrimary,
  "primary-fixed": PREMIUM_COLORS.primaryLight,
  "secondary-container": PREMIUM_COLORS.primaryLight,
  "inverse-on-surface": "#eff1ef",
  "on-tertiary": "#ffffff",
  "on-primary-fixed": "#002204",
  "tertiary-fixed": "#ffd9e2",
  "on-secondary": "#ffffff",
  "outline-variant": PREMIUM_COLORS.border,
  "on-primary-container": PREMIUM_COLORS.primaryLight,
  "error-container": "#ffdad6",
  "surface-container-low": "#f2f4f2",
  "on-tertiary-fixed": "#3f001c",
  "on-secondary-container": PREMIUM_COLORS.primaryDark,
  "on-tertiary-container": "#ffedf0",
  "on-error": "#ffffff",
  "tertiary": "#923357",
  "secondary-fixed-dim": "#83da85",
  "primary-fixed-dim": "#88d982",
  "on-primary-fixed-variant": "#005312",
  "tertiary-fixed-dim": "#ffb1c7",
  "inverse-primary": "#88d982",
  "surface-variant": "#e1e3e1",
  "surface-bright": "#f8faf8",
  "error": PREMIUM_COLORS.danger,
  "on-surface-variant": PREMIUM_COLORS.textSecondary,
  "on-error-container": "#93000a",
  "secondary-fixed": "#9ff79f",
  "surface-container-highest": "#e1e3e1",
  "surface-container": "#eceeec",
  "on-secondary-fixed-variant": "#005318",
  "on-primary": "#ffffff",
  "tertiary-container": "#b14b6f",
  "on-secondary-fixed": "#002105",
  "outline": PREMIUM_COLORS.divider,
  "on-background": PREMIUM_COLORS.textPrimary,
  "primary-container": PREMIUM_COLORS.primary,
  "surface-tint": PREMIUM_COLORS.primary,
  "inverse-surface": "#2e3130",
  "secondary": PREMIUM_COLORS.accent,
  "on-tertiary-fixed-variant": "#7f2448",
  "surface-container-lowest": "#ffffff",
  "surface-dim": "#d8dad9",

  // Adding the new premium colors here
  ...PREMIUM_COLORS
};

export const typography = {
  // Existing keys
  headlineLg: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  headlineLgMobile: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
  headlineMd: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
  headlineSm: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  bodyLg: { fontSize: 18, lineHeight: 28, fontWeight: '400' as const },
  bodyMd: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  labelLg: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  labelMd: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },

  // Premium typography
  ...TYPOGRAPHY
};

export const spacing = {
  // Existing keys
  stackLg: 24,
  stackMd: 16,
  stackSm: 8,
  marginMobile: 20,
  marginDesktop: 40,
  gutter: 16,
  touchTargetMin: 48,

  // Premium spacing
  ...NEW_SPACING
};

export const shadows = {
  ...NEW_SHADOWS
};
