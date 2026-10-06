import { Slot } from 'expo-router';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { useEffect } from 'react';

import { AppProviders, useSessionStoreApi } from '@/app-shell/AppProviders';
import { ThemeProvider } from '@/app-shell/theme/ThemeProvider';
import { FakeAuthRepository } from '@/features/auth/data/fakeAuthRepository';
import { FakeProfileRepository } from '@/features/profile/data/fakeProfileRepository';

import AppTabsLayout from '../../../app/(app)/_layout';
import ConversationRoute from '../../../app/(app)/chat/[id]';
import * as ChatLayoutModule from '../../../app/(app)/chat/_layout';
import ChatListRoute from '../../../app/(app)/chat/index';
import FeedRoute from '../../../app/(app)/feed';
import PerfilRoute from '../../../app/(app)/perfil';

/**
 * Abas do app mobile montadas pelo router de verdade, começando já logado
 * (o fluxo de login em si é coberto por appFlow.test.tsx).
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
      // Módulo inteiro: inclui o unstable_settings (lista sempre embaixo da conversa).
      '(app)/chat/_layout': ChatLayoutModule,
      '(app)/chat/index': ChatListRoute,
      '(app)/chat/[id]': ConversationRoute,
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

  it('match no feed → "Mandar mensagem" abre a conversa; voltar mostra a lista', async () => {
    await renderTabsAs('ana@email.com', '/feed');

    await fireEvent.press(await screen.findByTestId('feed-like', {}, { timeout: 3000 }));
    await fireEvent.press(await screen.findByTestId('match-send-message', {}, { timeout: 3000 }));

    expect(
      await screen.findByText(/Vimos que deu match com a nossa vaga de Desenvolvedor Front-End/, {}, { timeout: 3000 }),
    ).toBeTruthy();
    expect(screen.getByText('TechNova Solutions')).toBeTruthy();
    // Dentro da conversa a barra de abas some.
    expect(screen.queryByText('Perfil')).toBeNull();

    await fireEvent.press(screen.getByTestId('conversation-back'));
    expect(await screen.findByText('Mensagens', {}, { timeout: 3000 })).toBeTruthy();
    await waitFor(() => expect(screen.getByTestId(/^conversation-match-/)).toBeTruthy(), { timeout: 3000 });
  });
});
