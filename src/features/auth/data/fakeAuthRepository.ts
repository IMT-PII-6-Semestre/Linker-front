import type { AppOrigin } from '@/app-shell/origin';
import { ConflictFailure, InvalidCredentialsFailure, NetworkFailure } from '@/core/error/failure';
import { err, ok, type Result } from '@/core/error/result';

import type { AuthRepository } from '../domain/authRepository';
import type { SignUpPayload } from '../domain/registration';
import type { Session, UserRole } from '../domain/session';

/**
 * Implementação de mentira, enquanto a API não existe.
 *
 * Regras para testar os três estados da tela sem backend:
 * - senha `123456` -> sucesso;
 * - e-mail `offline@linker.com` -> NetworkFailure;
 * - qualquer outra senha -> InvalidCredentialsFailure.
 *
 * Papel do usuário (para navegar entre os fluxos sem backend):
 * - `admin@linker.com` -> admin;
 * - e-mail contendo "empresa" -> empresa;
 * - qualquer outro -> candidato.
 *
 * Contas criadas via signUp ficam em memória e entram com a senha cadastrada.
 *
 * Substituir por uma implementação real (fetch/axios) quando o contrato de
 * API fechar. A sessão fica só em memória: recarregar a página desloga.
 */
export class FakeAuthRepository implements AuthRepository {
  private session: Session | null = null;
  private readonly accounts = new Map<string, { password: string; name: string; role: UserRole }>();

  /**
   * @param onSignUp chamado após um cadastro bem-sucedido — o "backend"
   * fake usa para criar o perfil com os dados informados.
   */
  constructor(
    private readonly latencyMs: number = 900,
    private readonly onSignUp?: (session: Session, payload: SignUpPayload) => void,
  ) {}

  async signIn(params: { email: string; password: string; origin: AppOrigin }): Promise<Result<Session>> {
    await delay(this.latencyMs);

    const normalized = params.email.trim().toLowerCase();

    if (normalized === 'offline@linker.com') {
      return err(NetworkFailure());
    }

    const account = this.accounts.get(normalized);
    if (account) {
      if (params.password !== account.password) return err(InvalidCredentialsFailure());
      return ok(this.startSession(normalized, account.name, account.role, params.origin));
    }

    if (params.password !== '123456') {
      return err(InvalidCredentialsFailure());
    }

    return ok(this.startSession(normalized, nameFromEmail(normalized), roleFromEmail(normalized), params.origin));
  }

  async signUp(params: { payload: SignUpPayload; origin: AppOrigin }): Promise<Result<Session>> {
    await delay(this.latencyMs);

    const { payload } = params;
    const email = payload.email.trim().toLowerCase();

    if (email === 'offline@linker.com') {
      return err(NetworkFailure());
    }
    if (this.accounts.has(email)) {
      return err(ConflictFailure());
    }

    const name = payload.role === 'candidato' ? payload.nomeCompleto : payload.nomeEmpresa;
    this.accounts.set(email, { password: payload.senha, name, role: payload.role });
    const session = this.startSession(email, name, payload.role, params.origin);
    this.onSignUp?.(session, { ...payload, email });
    return ok(session);
  }

  async restoreSession(): Promise<Session | null> {
    await delay(200);
    return this.session;
  }

  async signOut(): Promise<void> {
    this.session = null;
  }

  private startSession(email: string, name: string, role: UserRole, origin: AppOrigin): Session {
    const session: Session = {
      userId: `fake-${hashCode(email)}`,
      name,
      email,
      role,
      token: 'fake-token',
      origin,
    };
    this.session = session;
    return session;
  }
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function roleFromEmail(email: string): UserRole {
  if (email === 'admin@linker.com') return 'admin';
  if (email.includes('empresa')) return 'empresa';
  return 'candidato';
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
