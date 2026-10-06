import { Slot } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';
import { useEffect } from 'react';

import { AppProviders, useSessionStoreApi } from '@/app-shell/AppProviders';
import { ThemeProvider } from '@/app-shell/theme/ThemeProvider';
import { FakeAuthRepository } from '@/features/auth/data/fakeAuthRepository';
import { FakeProfileRepository } from '@/features/profile/data/fakeProfileRepository';

import AppTabsLayout from '../../../app/(app)/_layout';
import ChatLayout from '../../../app/(app)/chat/_layout';
import ChatListRoute from '../../../app/(app)/chat/index';
import FeedRoute from '../../../app/(app)/feed';
import PerfilRoute from '../../../app/(app)/perfil';

/**
 * Abas do app mobile montadas pelo router de verdade, com a sessão já
 * restaurada (o login via UI → <Redirect> remonta o _layout no
 * testing-library — ver appFlow.test.tsx).
 */
function RestoreSession() {
  const api = useSessionStoreApi();
  useEffect(() => {
    void api.getState().restore();
  }, [api]);
  return <Slot />;
}

async function renderTabsAs(email: string, initialUrl: string) {
  const auth = new FakeAuthRepository(0);
  await auth.signIn({ email, password: '123456', origin: 'mobile' });

  function RootLayout() {
    return (
      <AppProviders origin="mobile" authRepository={auth} profileRepository={new FakeProfileRepository(0)}>
        <ThemeProvider>
          <RestoreSession />
        </ThemeProvider>
      </AppProviders>
    );
  }

  return renderRouter(
    {
      _layout: RootLayout,
      '(app)/_layout': AppTabsLayout,
      '(app)/feed': FeedRoute,
      '(app)/perfil': PerfilRoute,
      '(app)/chat/_layout': ChatLayout,
      '(app)/chat/index': ChatListRoute,
    },
    { initialUrl },
  );
}

describe('abas do app', () => {
  it('candidato: /perfil abre o perfil com as seções', async () => {
    await renderTabsAs('ana@email.com', '/perfil');

    expect(await screen.findByTestId('section-habilidades', {}, { timeout: 3000 })).toBeTruthy();
    expect(screen.getByText('Meu Perfil')).toBeTruthy();
    expect(screen.getByText('Vagas')).toBeTruthy();
  });

  it('empresa: aba do feed se chama Talentos e o perfil lista vagas', async () => {
    await renderTabsAs('rh@empresa.com', '/perfil');

    expect(await screen.findByText('Vagas abertas (1)', {}, { timeout: 3000 })).toBeTruthy();
    expect(screen.getByText('Talentos')).toBeTruthy();
  });
});
