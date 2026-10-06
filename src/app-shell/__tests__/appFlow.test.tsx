import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Dimensions } from 'react-native';

/**
 * Fluxo de inicialização do app. A origem é controlada via
 * EXPO_PUBLIC_APP_ORIGIN (lida por resolveAppOrigin() em cada render), já
 * que app/_layout.tsx monta sua própria <AppProviders> sem aceitar override
 * externo.
 *
 * O layout raiz renderiza sempre o mesmo <Stack> (com Stack.Protected).
 * Antes ele trocava o navegador por <Redirect>/<SplashScreen>, o que
 * remontava app/_layout.tsx logo após o login: o app voltava à splash e
 * perdia a sessão em memória. O teste "login leva às abas" cobre isso.
 */
describe('inicialização do app', () => {
  const originalWindowDimensions = Dimensions.get('window');
  const originalScreenDimensions = Dimensions.get('screen');

  afterEach(async () => {
    delete process.env.EXPO_PUBLIC_APP_ORIGIN;
    await act(async () => {
      Dimensions.set({ window: originalWindowDimensions, screen: originalScreenDimensions });
    });
  });

  it('mobile: splash aparece e dá lugar ao login', async () => {
    process.env.EXPO_PUBLIC_APP_ORIGIN = 'mobile';

    await renderRouter('app', { initialUrl: '/' });

    expect(screen.queryByTestId('login-email')).toBeNull();

    // Cobre o tempo mínimo de splash (1200ms) e a restauração da sessão.
    await waitFor(
      () => {
        expect(screen.getByTestId('login-email')).toBeTruthy();
      },
      { timeout: 3000 },
    );
  });

  it('mobile: login leva ao feed sem reiniciar o app, e sair (no perfil) volta ao login', async () => {
    process.env.EXPO_PUBLIC_APP_ORIGIN = 'mobile';

    await renderRouter('app', { initialUrl: '/' });
    await waitFor(() => expect(screen.getByTestId('login-email')).toBeTruthy(), { timeout: 3000 });

    await fireEvent.changeText(screen.getByTestId('login-email'), 'ana@email.com');
    await fireEvent.changeText(screen.getByTestId('login-password'), '123456');
    await fireEvent.press(screen.getByTestId('login-submit'));

    // Chega ao feed (aba inicial) com a barra de abas — e não volta ao login.
    await waitFor(() => expect(screen.getByText('Vagas Abertas')).toBeTruthy(), { timeout: 4000 });
    expect(screen.queryByTestId('login-email')).toBeNull();

    // Sair fica no Perfil, com confirmação.
    await fireEvent.press(screen.getByText('Perfil'));
    await fireEvent.press(await screen.findByTestId('logout-button'));
    await fireEvent.press(await screen.findByTestId('confirm-dialog-confirm'));
    await waitFor(() => expect(screen.getByTestId('login-email')).toBeTruthy(), { timeout: 3000 });
  });

  it('web: login leva ao painel sem reiniciar o app', async () => {
    process.env.EXPO_PUBLIC_APP_ORIGIN = 'web';

    await renderRouter('app', { initialUrl: '/' });
    await waitFor(() => expect(screen.getByTestId('login-email')).toBeTruthy(), { timeout: 3000 });

    await fireEvent.changeText(screen.getByTestId('login-email'), 'admin@linker.com');
    await fireEvent.changeText(screen.getByTestId('login-password'), '123456');
    await fireEvent.press(screen.getByTestId('login-submit'));

    await waitFor(() => expect(screen.getByTestId('logout-button')).toBeTruthy(), { timeout: 4000 });
    expect(screen.queryByTestId('login-email')).toBeNull();
  });

  it('web: vai direto para o login, sem splash de marca', async () => {
    process.env.EXPO_PUBLIC_APP_ORIGIN = 'web';
    Dimensions.set({
      window: { width: 1400, height: 900, scale: 1, fontScale: 1 },
      screen: { width: 1400, height: 900, scale: 1, fontScale: 1 },
    });

    await renderRouter('app', { initialUrl: '/' });

    await waitFor(
      () => {
        expect(screen.getByText('Painel administrativo')).toBeTruthy();
      },
      { timeout: 3000 },
    );
  });
});
