import { Redirect, Slot, useSegments } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProviders, useAppOrigin, useSessionStore } from '@/app-shell/AppProviders';
import { AppRoutes, homeFor } from '@/app-shell/routes';
import { ThemeProvider } from '@/app-shell/theme/ThemeProvider';
import { useAppStartup } from '@/app-shell/useAppStartup';
import { StartupErrorView } from '@/core/ui/StartupErrorView';
import { SplashScreen } from '@/features/splash/presentation/SplashScreen';
import { WebLoadingScreen } from '@/features/splash/presentation/WebLoadingScreen';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppProviders>
        <ThemeProvider>
          <RootLayoutGate />
        </ThemeProvider>
      </AppProviders>
    </GestureHandlerRootView>
  );
}

/**
 * Gate de startup + guarda de autenticação — um único ponto de decisão de
 * rota, reativo à sessão. Ninguém navega na mão fora daqui: a UI só reage
 * à sessão.
 */
function RootLayoutGate() {
  const origin = useAppOrigin();
  const startup = useAppStartup(origin);
  const session = useSessionStore((s) => s.session);
  const segments = useSegments();

  if (startup.status === 'error') {
    return <StartupErrorView onRetry={startup.retry} />;
  }
  if (startup.status === 'loading') {
    return origin === 'mobile' ? <SplashScreen /> : <WebLoadingScreen />;
  }

  const path = `/${segments.join('/')}`;
  const home = homeFor(origin);
  const isLoggedIn = session != null;

  if (!isLoggedIn && path !== AppRoutes.login) {
    return <Redirect href={AppRoutes.login} />;
  }
  if (isLoggedIn && (path === AppRoutes.login || path === '/')) {
    return <Redirect href={home} />;
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
