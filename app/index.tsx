import { useAppOrigin } from '@/app-shell/AppProviders';
import { isMobile } from '@/app-shell/origin';
import { useStartup } from '@/app-shell/StartupContext';
import { StartupErrorView } from '@/core/ui/StartupErrorView';
import { SplashScreen } from '@/features/splash/presentation/SplashScreen';
import { WebLoadingScreen } from '@/features/splash/presentation/WebLoadingScreen';

/**
 * Rota de inicialização: só fica acessível enquanto o app não terminou o
 * startup (ver o guard em app/_layout.tsx). Ao ficar pronto, o router sai
 * daqui sozinho para o login ou para a home.
 */
export default function StartupRoute() {
  const origin = useAppOrigin();
  const startup = useStartup();

  if (startup.status === 'error') {
    return <StartupErrorView onRetry={startup.retry} />;
  }
  return isMobile(origin) ? <SplashScreen /> : <WebLoadingScreen />;
}
