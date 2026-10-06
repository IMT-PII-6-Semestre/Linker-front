import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProviders, useAppOrigin, useSessionStore } from '@/app-shell/AppProviders';
import { isMobile } from '@/app-shell/origin';
import { StartupProvider } from '@/app-shell/StartupContext';
import { ThemeProvider } from '@/app-shell/theme/ThemeProvider';
import { useAppStartup } from '@/app-shell/useAppStartup';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppProviders>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </AppProviders>
    </GestureHandlerRootView>
  );
}

/**
 * Único ponto de decisão de rota, reativo ao startup e à sessão. Ninguém
 * navega na mão para entrar/sair: a UI só muda a sessão.
 *
 * O layout raiz renderiza SEMPRE o mesmo navegador. Trocar o navegador por
 * <SplashScreen>/<Redirect> (como era antes) desmonta a árvore do Expo
 * Router ao navegar — o app reiniciava e perdia a sessão logo após o login.
 *
 * Cada `Stack.Protected` libera um conjunto de rotas; quando a condição
 * muda, o router leva automaticamente para a primeira rota permitida, na
 * ordem declarada abaixo.
 */
function RootNavigator() {
  const origin = useAppOrigin();
  const startup = useAppStartup(origin);
  const session = useSessionStore((s) => s.session);

  const ready = startup.status === 'ready';
  const loggedIn = session != null;
  const mobile = isMobile(origin);
  // Admin só usa o painel web: no app ele não vê feed/chat/perfil.
  const admin = session?.role === 'admin';

  return (
    <StartupProvider value={startup}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        {/* Splash / erro de startup (app/index.tsx). */}
        <Stack.Protected guard={!ready}>
          <Stack.Screen name="index" />
        </Stack.Protected>

        <Stack.Protected guard={ready && !loggedIn}>
          <Stack.Screen name="login" />
        </Stack.Protected>
        {/* O painel web (admin) não tem cadastro aberto. */}
        <Stack.Protected guard={ready && !loggedIn && mobile}>
          <Stack.Screen name="cadastro" options={{ animation: 'slide_from_right' }} />
        </Stack.Protected>

        <Stack.Protected guard={ready && loggedIn && mobile && !admin}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={ready && loggedIn && mobile && admin}>
          <Stack.Screen name="somente-web" />
        </Stack.Protected>
        <Stack.Protected guard={ready && loggedIn && !mobile}>
          <Stack.Screen name="painel" />
        </Stack.Protected>
      </Stack>
    </StartupProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
