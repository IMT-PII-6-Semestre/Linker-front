import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore, type StoreApi } from 'zustand';

import { FakeAuthRepository } from '@/features/auth/data/fakeAuthRepository';
import type { AuthRepository } from '@/features/auth/domain/authRepository';
import { createSessionStore, type SessionState } from '@/features/auth/state/sessionStore';

import { resolveAppOrigin, type AppOrigin } from './origin';

const OriginContext = createContext<AppOrigin | null>(null);
const SessionStoreContext = createContext<StoreApi<SessionState> | null>(null);

interface AppProvidersProps {
  /** Default: resolveAppOrigin(). Override usado pelos testes. */
  origin?: AppOrigin;
  /** Default: FakeAuthRepository. Override usado pelos testes. */
  authRepository?: AuthRepository;
  children: ReactNode;
}

/**
 * Raiz de injeção de dependências do app. A store é criada uma única vez
 * por instância (via inicializador lazy do useState, não em module scope)
 * para não perder estado em Fast Refresh e para permitir que cada teste
 * monte sua própria instância isolada.
 */
export function AppProviders({ origin, authRepository, children }: AppProvidersProps) {
  const resolvedOrigin = origin ?? resolveAppOrigin();

  const [store] = useState<StoreApi<SessionState>>(() =>
    createSessionStore(authRepository ?? new FakeAuthRepository(), resolvedOrigin),
  );

  return (
    <OriginContext.Provider value={resolvedOrigin}>
      <SessionStoreContext.Provider value={store}>{children}</SessionStoreContext.Provider>
    </OriginContext.Provider>
  );
}

export function useAppOrigin(): AppOrigin {
  const origin = useContext(OriginContext);
  if (origin === null) {
    throw new Error('useAppOrigin must be used within <AppProviders>');
  }
  return origin;
}

export function useSessionStore<T>(selector: (state: SessionState) => T): T {
  const store = useContext(SessionStoreContext);
  if (!store) {
    throw new Error('useSessionStore must be used within <AppProviders>');
  }
  return useStore(store, selector);
}

/** Acesso à store crua (não à leitura reativa) — usado por useAppStartup. */
export function useSessionStoreApi(): StoreApi<SessionState> {
  const store = useContext(SessionStoreContext);
  if (!store) {
    throw new Error('useSessionStoreApi must be used within <AppProviders>');
  }
  return store;
}
