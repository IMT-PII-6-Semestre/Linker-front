import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProviders, useAppOrigin, useSessionStore } from '@/app-shell/AppProviders';
import { isMobile } from '@/app-shell/origin';
import { AppRoutes, homeFor } from '@/app-shell/routes';
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
  // Destino ao sair de uma rota pré-login já logado. Sem isso, o Expo Router 58
  // redireciona para a primeira rota liberada, o grupo "(app)", que vira a URL
  // "/(app)" e cai no 404. Deslogado, fica o padrão (vai para o login).
  const home = !loggedIn
    ? undefined
    : mobile && admin
      ? AppRoutes.somenteWeb
      : homeFor(origin);

  return (
    <StartupProvider value={startup}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        {/* Splash / erro de startup (app/index.tsx). */}
        <Stack.Protected guard={!ready} redirectTo={home}>
          <Stack.Screen name="index" />
        </Stack.Protected>

        <Stack.Protected guard={ready && !loggedIn} redirectTo={home}>
          <Stack.Screen name="login" />
        </Stack.Protected>
        {/* O painel web (admin) não tem cadastro aberto. */}
        <Stack.Protected guard={ready && !loggedIn && mobile} redirectTo={home}>
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
