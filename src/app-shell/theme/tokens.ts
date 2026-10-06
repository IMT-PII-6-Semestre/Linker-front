import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import type { TextStyle } from 'react-native';

export const AppSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const AppRadius = {
  input: 10,
  button: 12,
  card: 12,
  choice: 15,
  matchCard: 20,
  pill: 20,
  /** Cantos inferiores do header de perfil. */
  sheet: 30,
} as const;

export const AppBreakpoints = {
  /** Acima disso o painel web usa o layout de duas colunas. */
  wide: 900,
} as const;

export const AppSizes = {
  /** Altura mínima de alvo de toque (Material: 48dp). */
  touchTarget: 48,
  buttonHeight: 52,
  /** Largura máxima do formulário — texto muito largo fica ruim de ler. */
  formMaxWidth: 420,
} as const;

/** Sombras do protótipo. `boxShadow` funciona no iOS, Android (nova arquitetura) e web. */
export const AppShadows = {
  sm: { boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' },
  md: { boxShadow: '0 4px 10px rgba(0, 0, 0, 0.04)' },
  lg: { boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' },
} as const;

/**
 * Famílias carregadas no startup (ver useAppStartup). No Android cada peso
 * é uma família própria — nunca combinar `fontFamily` com `fontWeight`.
 */
export const AppFontFiles = {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
};

export const AppFonts = {
  light: 'Poppins_300Light',
  regular: 'Poppins_400Regular',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

/** Escala tipográfica. Use via <AppText variant>, ou espalhe no StyleSheet. */
export const AppType = {
  display: { fontFamily: AppFonts.bold, fontSize: 32, lineHeight: 40, letterSpacing: -1 },
  title: { fontFamily: AppFonts.bold, fontSize: 22, lineHeight: 30 },
  heading: { fontFamily: AppFonts.semibold, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: AppFonts.regular, fontSize: 14, lineHeight: 21 },
  bodyStrong: { fontFamily: AppFonts.semibold, fontSize: 14, lineHeight: 21 },
  button: { fontFamily: AppFonts.semibold, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: AppFonts.regular, fontSize: 12, lineHeight: 17 },
  caption: { fontFamily: AppFonts.semibold, fontSize: 11, lineHeight: 15 },
} satisfies Record<string, TextStyle>;

export type AppTypeVariant = keyof typeof AppType;
