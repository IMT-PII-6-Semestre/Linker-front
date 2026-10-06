import { isWeb, type AppOrigin } from './origin';

/**
 * Caminhos das rotas. String de rota nunca é escrita direto no componente —
 * no web ela aparece na barra de endereços e vira contrato.
 */
export const AppRoutes = {
  login: '/login',
  /** Cadastro de candidato/empresa — só no app mobile. */
  cadastro: '/cadastro',
  /** Destino pós-login do painel web (dashboard admin). */
  painel: '/painel',
  /** Destino pós-login do app mobile. */
  inicio: '/inicio',
} as const;

export function homeFor(origin: AppOrigin): string {
  return isWeb(origin) ? AppRoutes.painel : AppRoutes.inicio;
}

/** Rotas acessíveis sem sessão. O painel web não tem cadastro aberto. */
export function publicRoutesFor(origin: AppOrigin): readonly string[] {
  return isWeb(origin) ? [AppRoutes.login] : [AppRoutes.login, AppRoutes.cadastro];
}

/**
 * Caminho visível a partir dos segmentos do Expo Router, sem os grupos
 * — `(app)/feed` vira `/feed`.
 */
export function pathFromSegments(segments: readonly string[]): string {
  return `/${segments.filter((s) => !(s.startsWith('(') && s.endsWith(')'))).join('/')}`;
}
