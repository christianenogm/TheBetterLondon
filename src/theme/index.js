/**
 * Theme System - TheBetterLondon
 * Main theme export
 */

import colors from './colors';
import typography, { fontWeight } from './typography';
import { spacing, borderRadius, iconSize } from './spacing';
import shadows from './shadows';
import icons from './icons';

const theme = {
  colors,
  typography,
  fontWeight,
  spacing,
  borderRadius,
  iconSize,
  shadows,
  icons,

  // Common component styles
  components: {
    button: {
      primary: {
        backgroundColor: colors.primary[500],
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[6],
        borderRadius: borderRadius.base,
        minHeight: 48,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary[500],
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[6],
        borderRadius: borderRadius.base,
        minHeight: 48,
      },
    },
    card: {
      backgroundColor: colors.neutral[0],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      ...shadows.md,
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: colors.neutral[300],
      borderRadius: borderRadius.base,
      paddingHorizontal: spacing[4],
      fontSize: typography.body1.fontSize,
      backgroundColor: colors.neutral[0],
    },
  },
};

export default theme;
