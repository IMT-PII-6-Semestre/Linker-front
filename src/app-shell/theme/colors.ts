/**
 * Paletas de cor light/dark, inspiradas no algoritmo de esquema do Material 3
 * a partir da cor semente 0xFF2563EB — escolhidas à mão, já que RN não tem
 * um gerador de esquema Material embutido.
 */

export interface AppColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  surface: string;
  onSurface: string;
  onSurfaceVariant: string;
  surfaceContainerHighest: string;
  outline: string;
  outlineVariant: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
}

export const lightColors: AppColorScheme = {
  primary: '#2563EB',
  onPrimary: '#FFFFFF',
  primaryContainer: '#DBEAFE',
  onPrimaryContainer: '#1E3A8A',
  surface: '#FDFDFF',
  onSurface: '#1B1B1F',
  onSurfaceVariant: '#45464F',
  surfaceContainerHighest: '#E2E2E6',
  outline: '#767680',
  outlineVariant: '#C4C6D0',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
};

export const darkColors: AppColorScheme = {
  primary: '#A9C7FF',
  onPrimary: '#00315F',
  primaryContainer: '#00458F',
  onPrimaryContainer: '#D6E3FF',
  surface: '#121316',
  onSurface: '#E3E2E6',
  onSurfaceVariant: '#C5C6D0',
  surfaceContainerHighest: '#444746',
  outline: '#8E9099',
  outlineVariant: '#45464F',
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
};
