import { createStore, type StoreApi } from 'zustand/vanilla';

import type { AppOrigin } from '@/app-shell/origin';
import type { Result } from '@/core/error/result';

import type { AuthRepository } from '../domain/authRepository';
import type { Session } from '../domain/session';

export type SessionStatus = 'idle' | 'loading' | 'data' | 'error';

/**
 * Sessão atual do app. É a fonte de verdade da guarda de rotas — o guard do
 * `_layout.tsx` escuta esta store, ninguém navega na mão.
 */
export interface SessionState {
  status: SessionStatus;
  session: Session | null;
  error: unknown | null;
  restore: () => Promise<void>;
  /** Devolve o Result para o formulário conseguir mostrar o erro inline. */
  signIn: (params: { email: string; password: string }) => Promise<Result<Session>>;
  signOut: () => Promise<void>;
}

export function createSessionStore(
  authRepository: AuthRepository,
  origin: AppOrigin,
): StoreApi<SessionState> {
  return createStore<SessionState>((set) => ({
    status: 'idle',
    session: null,
    error: null,

    restore: async () => {
      set({ status: 'loading' });
      try {
        const session = await authRepository.restoreSession();
        set({ session, status: 'data', error: null });
      } catch (error) {
        set({ error, status: 'error' });
      }
    },

    signIn: async ({ email, password }) => {
      const result = await authRepository.signIn({ email, password, origin });
      if (result.kind === 'ok') {
        set({ session: result.value, status: 'data' });
      }
      return result;
    },

    signOut: async () => {
      await authRepository.signOut();
      set({ session: null, status: 'data' });
    },
  }));
}
