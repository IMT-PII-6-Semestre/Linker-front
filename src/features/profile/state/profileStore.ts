import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Failure } from '@/core/error/failure';
import type { Result } from '@/core/error/result';
import type { Session } from '@/features/auth/domain/session';

import type { Profile } from '../domain/profile';
import type { ProfileRepository } from '../domain/profileRepository';

export type ProfileStatus = 'idle' | 'loading' | 'data' | 'error';

/**
 * Perfil do usuário logado. `load` é idempotente por usuário: a tela chama
 * sempre que a sessão muda, e trocar de conta descarta o perfil anterior.
 */
export interface ProfileState {
  status: ProfileStatus;
  profile: Profile | null;
  failure: Failure | null;
  /** userId do perfil carregado (ou em carregamento). */
  loadedFor: string | null;
  load: (session: Session, options?: { force?: boolean }) => Promise<void>;
  /** Devolve o Result para a tela de edição mostrar o erro inline. */
  save: (profile: Profile) => Promise<Result<Profile>>;
}

export function createProfileStore(repository: ProfileRepository): StoreApi<ProfileState> {
  return createStore<ProfileState>((set, get) => ({
    status: 'idle',
    profile: null,
    failure: null,
    loadedFor: null,

    load: async (session, options) => {
      if (!options?.force && get().loadedFor === session.userId && get().status !== 'error') return;

      set({ status: 'loading', loadedFor: session.userId, failure: null, profile: null });
      const result = await repository.getProfile(session);
      // A sessão pode ter mudado enquanto carregava.
      if (get().loadedFor !== session.userId) return;

      if (result.kind === 'ok') set({ status: 'data', profile: result.value });
      else set({ status: 'error', failure: result.failure });
    },

    save: async (profile) => {
      const result = await repository.saveProfile(profile);
      if (result.kind === 'ok' && get().loadedFor === profile.userId) {
        set({ profile: result.value });
      }
      return result;
    },
  }));
}
