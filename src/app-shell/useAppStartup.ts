import { useEffect, useState } from 'react';

import { useSessionStoreApi } from './AppProviders';
import { isMobile, type AppOrigin } from './origin';

/** Tempo mínimo de splash no mobile. Sem isso, em conexão rápida a marca pisca e some. */
const MIN_SPLASH_DURATION_MS = 1200;

export type StartupStatus = 'loading' | 'ready' | 'error';

export interface AppStartup {
  status: StartupStatus;
  error: unknown | null;
  retry: () => void;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Inicialização do app: tudo que precisa estar pronto antes da primeira
 * rota. Hoje é só restaurar a sessão; aqui entram depois storage, remote
 * config, crash reporting. Roda uma única vez por `origin`/`nonce` — nunca
 * redispara por mudança de sessão, senão cada login relançaria a splash.
 */
export function useAppStartup(origin: AppOrigin): AppStartup {
  const sessionStore = useSessionStoreApi();
  const [status, setStatus] = useState<StartupStatus>('loading');
  const [error, setError] = useState<unknown | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const restore = sessionStore.getState().restore();
    const minSplash = isMobile(origin) ? delay(MIN_SPLASH_DURATION_MS) : Promise.resolve();

    Promise.all([restore, minSplash])
      .then(() => {
        if (cancelled) return;
        // restore() trata seus próprios erros e nunca rejeita — o resultado
        // vive em sessionStore.status, então checamos ali em vez de no catch.
        const sessionState = sessionStore.getState();
        if (sessionState.status === 'error') {
          setError(sessionState.error);
          setStatus('error');
        } else {
          setStatus('ready');
        }
      })
      .catch((caughtError: unknown) => {
        if (!cancelled) {
          setError(caughtError);
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, nonce]);

  const retry = () => {
    // `loading` é setado aqui (num handler), não sincronamente dentro do
    // efeito, para disparar o novo ciclo assim que o nonce mudar.
    setStatus('loading');
    setError(null);
    setNonce((n) => n + 1);
  };

  return { status, error, retry };
}
