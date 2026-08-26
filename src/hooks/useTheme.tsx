/**
 * useTheme — Theme context with system-preference dark mode support.
 * Defaults to system preference; can be toggled manually via setTheme().
 */
import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { PREMIUM_COLORS } from '../design/colors';
import { TYPOGRAPHY } from '../design/typography';
import { SPACING } from '../design/spacing';
import { SHADOWS } from '../design/shadows';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  colors: typeof PREMIUM_COLORS;
  typography: typeof TYPOGRAPHY;
  spacing: typeof SPACING;
  shadows: typeof SHADOWS;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  isDark: false,
  setTheme: () => { },
  colors: PREMIUM_COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  shadows: SHADOWS,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const isDark =
    mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');

  const activeColors = PREMIUM_COLORS; // Use premium colors directly for now

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark,
        setTheme: setMode,
        colors: activeColors,
        typography: TYPOGRAPHY,
        spacing: SPACING,
        shadows: SHADOWS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
