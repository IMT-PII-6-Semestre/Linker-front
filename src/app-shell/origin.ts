import { Platform } from 'react-native';

/**
 * As duas origens do produto. O mesmo código-base atende dois públicos com
 * telas diferentes: o painel web do contratador e o app mobile. Tudo que
 * depende da origem (rotas, layout de login, audiência do token) parte daqui.
 */
export type AppOrigin = 'web' | 'mobile';

/** Identificador enviado ao backend para validar a audiência da sessão. */
export const originAudience: Record<AppOrigin, string> = {
  web: 'contratador',
  mobile: 'app',
};

export const isWeb = (origin: AppOrigin): boolean => origin === 'web';
export const isMobile = (origin: AppOrigin): boolean => origin === 'mobile';

/**
 * Resolve a origem no boot. Por padrão segue a plataforma (web -> web,
 * nativo -> mobile); pode ser forçada via EXPO_PUBLIC_APP_ORIGIN (ver os
 * scripts start:web/start:mobile no package.json).
 */
export function resolveAppOrigin(): AppOrigin {
  const override = process.env.EXPO_PUBLIC_APP_ORIGIN;
  if (override === 'web' || override === 'mobile') return override;
  return Platform.OS === 'web' ? 'web' : 'mobile';
}
