/**
 * Paletas de cor light/dark do Linker, extraídas do protótipo (mvp.html):
 * roxo #7B2CBF como primária, lilás #C77DFF como acento e fundo #F4F4F9.
 *
 * Todas as cores são hex de 6 dígitos — alguns componentes concatenam um
 * canal alfa (`cor + '66'`). Pares texto/fundo respeitam contraste AA:
 * por isso o lilás (`secondary`) é só acento, nunca fundo de texto branco.
 */

export interface AppColorScheme {
  primary: string;
  onPrimary: string;
  /** Roxo profundo — títulos de marca e texto sobre `primaryContainer`. */
  primaryDark: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  /** Acento lilás (bordas tracejadas, destaques, ícones). */
  secondary: string;
  /** Fundo das telas. */
  background: string;
  /** Cards, inputs, headers. */
  surface: string;
  /** Fundo de campos discretos (busca, input do chat, tags neutras). */
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  surfaceContainerHighest: string;
  outline: string;
  outlineVariant: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  success: string;
  /** Véu dos overlays (match, diálogos). */
  scrim: string;
  /**
   * Gráficos do painel. Par categórico validado (luminosidade, croma,
   * separação para daltonismo e contraste) contra a superfície de cada modo.
   * `dataSeries1` também é a cor única dos gráficos de magnitude.
   */
  dataSeries1: string;
  dataSeries2: string;
  /** Trilho do medidor: passo mais claro da mesma rampa da série 1. */
  dataTrack: string;
}

export const lightColors: AppColorScheme = {
  primary: '#7B2CBF',
  onPrimary: '#FFFFFF',
  primaryDark: '#3C096C',
  primaryContainer: '#F1E6FA',
  onPrimaryContainer: '#3C096C',
  secondary: '#C77DFF',
  background: '#F4F4F9',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F3F5',
  onSurface: '#212529',
  // #6C757D do protótipo fica abaixo de 4.5:1 sobre o fundo #F4F4F9.
  onSurfaceVariant: '#5C636A',
  surfaceContainerHighest: '#E9ECEF',
  outline: '#868E96',
  outlineVariant: '#DEE2E6',
  error: '#C92A2A',
  onError: '#FFFFFF',
  errorContainer: '#FFE3E3',
  onErrorContainer: '#7D1313',
  success: '#2B8A3E',
  scrim: '#240046',
  dataSeries1: '#7B2CBF',
  dataSeries2: '#EB6834',
  dataTrack: '#F1E6FA',
};

export const darkColors: AppColorScheme = {
  primary: '#C77DFF',
  onPrimary: '#240046',
  primaryDark: '#E0AAFF',
  primaryContainer: '#3C096C',
  onPrimaryContainer: '#F1E6FA',
  secondary: '#E0AAFF',
  background: '#121016',
  surface: '#1C1A22',
  surfaceVariant: '#26232D',
  onSurface: '#ECE9F1',
  onSurfaceVariant: '#B4AFBD',
  surfaceContainerHighest: '#2E2B36',
  outline: '#8A8494',
  outlineVariant: '#3A3642',
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  success: '#8CE99A',
  scrim: '#0B0014',
  dataSeries1: '#A855F7',
  dataSeries2: '#D95926',
  dataTrack: '#3C096C',
};
