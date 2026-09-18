import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { type AppColorScheme, darkColors, lightColors } from './colors';

const ThemeContext = createContext<AppColorScheme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const colors = useMemo(() => (scheme === 'dark' ? darkColors : lightColors), [scheme]);

  return <ThemeContext.Provider value={colors}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): AppColorScheme {
  const colors = useContext(ThemeContext);
  if (!colors) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return colors;
}
