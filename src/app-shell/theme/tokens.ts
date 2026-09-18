export const AppSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const AppRadius = {
  card: 16,
  input: 12,
  button: 12,
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
