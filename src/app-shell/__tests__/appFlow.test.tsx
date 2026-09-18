import { act, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Dimensions } from 'react-native';

/**
 * Fluxo de inicialização do app. A origem é controlada via
 * EXPO_PUBLIC_APP_ORIGIN (lida por resolveAppOrigin() em cada render), já
 * que app/_layout.tsx monta sua própria <AppProviders> sem aceitar override
 * externo.
 *
 * O cenário "login bem-sucedido → home → logout" não está coberto aqui:
 * rastreado com logs, confirmamos que a navegação disparada pelo <Redirect>
 * pós-login remonta app/_layout.tsx sob expo-router/testing-library + o
 * test-renderer atual (React 19), reiniciando useAppStartup e descartando a
 * sessão em memória — uma limitação da combinação de bibliotecas de teste
 * (ainda muito recentes para React 19), não do código da app. Esse fluxo de
 * login já é coberto em outro nível por LoginForm.test.tsx
 * (submit/validação/erro) e sessionStore.test.ts (transições de estado); só
 * a integração completa com o router fica sem teste automatizado por ora.
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

  it('web: vai direto para o login, sem splash de marca', async () => {
    process.env.EXPO_PUBLIC_APP_ORIGIN = 'web';
    Dimensions.set({
      window: { width: 1400, height: 900, scale: 1, fontScale: 1 },
      screen: { width: 1400, height: 900, scale: 1, fontScale: 1 },
    });

    await renderRouter('app', { initialUrl: '/' });

    await waitFor(() => {
      expect(screen.getByText('Painel do contratador')).toBeTruthy();
    });
  });
});
