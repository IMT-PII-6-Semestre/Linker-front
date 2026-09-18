import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Failure } from '@/core/error/failure';

import type { SessionState } from './sessionStore';

/**
 * Estado do formulário de login. Validação de campo fica no componente
 * (Credentials.validate*); aqui mora só o que o form não sabe: se o envio
 * está em andamento e qual erro o servidor devolveu.
 */
export interface LoginFormState {
  submitting: boolean;
  failure: Failure | null;
  /** `true` quando autenticou. A navegação é responsabilidade do router. */
  submit: (params: { email: string; password: string }) => Promise<boolean>;
  clearFailure: () => void;
}

export function createLoginFormStore(signIn: SessionState['signIn']): StoreApi<LoginFormState> {
  return createStore<LoginFormState>((set, get) => ({
    submitting: false,
    failure: null,

    submit: async ({ email, password }) => {
      if (get().submitting) return false;
      set({ submitting: true, failure: null });

      const result = await signIn({ email, password });

      if (result.kind === 'ok') {
        return true;
      }
      set({ submitting: false, failure: result.failure });
      return false;
    },

    clearFailure: () => {
      if (get().failure) set({ failure: null });
    },
  }));
}
