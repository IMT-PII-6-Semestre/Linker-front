import { createContext, useContext, type ReactNode } from 'react';

import type { AppStartup } from './useAppStartup';

const StartupContext = createContext<AppStartup | null>(null);

/**
 * Expõe o estado de inicialização (calculado uma vez no layout raiz) para
 * a rota de splash (`app/index.tsx`), que mostra o carregamento ou o erro.
 */
export function StartupProvider({ value, children }: { value: AppStartup; children: ReactNode }) {
  return <StartupContext.Provider value={value}>{children}</StartupContext.Provider>;
}

export function useStartup(): AppStartup {
  const startup = useContext(StartupContext);
  if (!startup) throw new Error('useStartup must be used within <StartupProvider>');
  return startup;
}
