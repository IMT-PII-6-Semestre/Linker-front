import { isWeb, type AppOrigin } from './origin';

/**
 * Caminhos das rotas. String de rota nunca é escrita direto no componente —
 * no web ela aparece na barra de endereços e vira contrato.
 */
export const AppRoutes = {
  login: '/login',
  /** Destino pós-login do painel web. */
  painel: '/painel',
  /** Destino pós-login do app mobile. */
  inicio: '/inicio',
} as const;

export function homeFor(origin: AppOrigin): string {
  return isWeb(origin) ? AppRoutes.painel : AppRoutes.inicio;
}
