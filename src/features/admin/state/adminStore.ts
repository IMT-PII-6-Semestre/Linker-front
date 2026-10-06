import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Failure } from '@/core/error/failure';
import type { Session } from '@/features/auth/domain/session';

import type { AdminRepository } from '../domain/adminRepository';
import type { AdminMetrics } from '../domain/metrics';

export interface AdminState {
  status: 'idle' | 'loading' | 'data' | 'error';
  metrics: AdminMetrics | null;
  failure: Failure | null;
  /** Atualizando com dados já na tela (não troca o painel por um spinner). */
  refreshing: boolean;
  load: (session: Session) => Promise<void>;
}

export function createAdminStore(repository: AdminRepository): StoreApi<AdminState> {
  return createStore<AdminState>((set, get) => ({
    status: 'idle',
    metrics: null,
    failure: null,
    refreshing: false,

    load: async (session) => {
      const hasData = get().metrics != null;
      set(hasData ? { refreshing: true } : { status: 'loading', failure: null });
      const result = await repository.metrics(session);
      if (result.kind === 'ok') {
        set({ status: 'data', metrics: result.value, failure: null, refreshing: false });
      } else {
        set({
          status: 'error',
          failure: result.failure,
          refreshing: false,
          ...(hasData ? {} : { metrics: null }),
        });
      }
    },
  }));
}
