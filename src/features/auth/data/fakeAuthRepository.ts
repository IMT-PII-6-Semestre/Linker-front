import type { AppOrigin } from '@/app-shell/origin';
import { InvalidCredentialsFailure, NetworkFailure } from '@/core/error/failure';
import { err, ok, type Result } from '@/core/error/result';

import type { AuthRepository } from '../domain/authRepository';
import type { Session } from '../domain/session';

/**
 * Implementação de mentira, enquanto a API não existe.
 *
 * Regras para testar os três estados da tela sem backend:
 * - senha `123456` -> sucesso;
 * - e-mail `offline@linker.com` -> NetworkFailure;
 * - qualquer outra senha -> InvalidCredentialsFailure.
 *
 * Substituir por uma implementação real (fetch/axios) quando o contrato de
 * API fechar. A sessão fica só em memória: recarregar a página desloga.
 */
export class FakeAuthRepository implements AuthRepository {
  private session: Session | null = null;

  constructor(private readonly latencyMs: number = 900) {}

  async signIn(params: { email: string; password: string; origin: AppOrigin }): Promise<Result<Session>> {
    await delay(this.latencyMs);

    const normalized = params.email.trim().toLowerCase();

    if (normalized === 'offline@linker.com') {
      return err(NetworkFailure());
    }
    if (params.password !== '123456') {
      return err(InvalidCredentialsFailure());
    }

    const session: Session = {
      userId: `fake-${hashCode(normalized)}`,
      name: nameFromEmail(normalized),
      email: normalized,
      token: 'fake-token',
      origin: params.origin,
    };
    this.session = session;
    return ok(session);
  }

  async restoreSession(): Promise<Session | null> {
    await delay(200);
    return this.session;
  }

  async signOut(): Promise<void> {
    this.session = null;
  }
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nameFromEmail(email: string): string {
  const handle = email.split('@')[0].replace(/[._-]+/g, ' ');
  return handle
    .split(' ')
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
