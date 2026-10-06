import { Text, type TextProps } from 'react-native';

import { AppType, type AppTypeVariant } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import type { AppColorScheme } from '@/app-shell/theme/colors';

interface AppTextProps extends TextProps {
  variant?: AppTypeVariant;
  /** Chave da paleta. Default: onSurface. */
  color?: keyof AppColorScheme;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

/** Texto com a escala tipográfica (Poppins) e as cores do tema. */
export function AppText({ variant = 'body', color = 'onSurface', align, style, ...rest }: AppTextProps) {
  const colors = useAppTheme();
  return (
    <Text
      {...rest}
      style={[AppType[variant], { color: colors[color] }, align ? { textAlign: align } : null, style]}
    />
  );
}
