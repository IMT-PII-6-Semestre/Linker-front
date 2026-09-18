import type { AppOrigin } from '@/app-shell/origin';
import type { Result } from '@/core/error/result';

import type { Session } from './session';

/**
 * Contrato de autenticação. A camada de apresentação conhece só isto —
 * trocar o fake pela API real não toca em nenhuma tela.
 */
export interface AuthRepository {
  /**
   * Autentica na origem informada. O backend valida se aquele usuário pode
   * entrar por ali (contratador no painel, usuário do app no mobile).
   */
  signIn(params: { email: string; password: string; origin: AppOrigin }): Promise<Result<Session>>;

  /** Sessão persistida de execuções anteriores, ou `null` se não houver. */
  restoreSession(): Promise<Session | null>;

  signOut(): Promise<void>;
}
