import { createContext, useContext } from 'react';
import { useStore, type StoreApi } from 'zustand';

/**
 * Contexto + hooks para uma store vanilla do Zustand injetada pelo
 * AppProviders (mesmo padrão da sessionStore): uma instância por árvore,
 * fácil de isolar nos testes.
 */
export function createStoreContext<S>(name: string) {
  const Context = createContext<StoreApi<S> | null>(null);

  function useStoreApi(): StoreApi<S> {
    const store = useContext(Context);
    if (!store) throw new Error(`${name} must be used within <AppProviders>`);
    return store;
  }

  function useSelector<T>(selector: (state: S) => T): T {
    return useStore(useStoreApi(), selector);
  }

  return { Provider: Context.Provider, useStoreApi, useSelector };
}
