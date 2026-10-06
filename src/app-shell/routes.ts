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
  /** Abas do app mobile. O feed é o destino pós-login. */
  feed: '/feed',
  perfil: '/perfil',
  chat: '/chat',
} as const;

export function homeFor(origin: AppOrigin): string {
  return isWeb(origin) ? AppRoutes.painel : AppRoutes.feed;
}
