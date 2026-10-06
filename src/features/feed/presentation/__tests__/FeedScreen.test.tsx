import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProviders, useSessionStore } from '@/app-shell/AppProviders';
import { ThemeProvider } from '@/app-shell/theme/ThemeProvider';
import { FakeAuthRepository } from '@/features/auth/data/fakeAuthRepository';

import { FakeFeedRepository } from '../../data/fakeFeedRepository';
import { FeedScreen } from '../FeedScreen';

jest.mock('expo-router', () => ({ router: { navigate: jest.fn() } }));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function SignedIn({ email }: { email: string }) {
  const signIn = useSessionStore((s) => s.signIn);
  const session = useSessionStore((s) => s.session);
  useEffect(() => {
    void signIn({ email, password: '123456' });
  }, [signIn, email]);
  return session ? <FeedScreen /> : null;
}

function renderFeed(email = 'ana@email.com') {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <AppProviders
        origin="mobile"
        authRepository={new FakeAuthRepository(0)}
        feedRepository={new FakeFeedRepository(0)}
      >
        <ThemeProvider>
          <SignedIn email={email} />
        </ThemeProvider>
      </AppProviders>
    </SafeAreaProvider>,
  );
}

const topCard = () => screen.getByTestId('feed-top-card');

describe('FeedScreen', () => {
  it('candidato: dar match pelo botão abre o overlay "It\'s a match"', async () => {
    await renderFeed();
    expect(within(await screen.findByTestId('feed-top-card')).getByText('Desenvolvedor Front-End')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('feed-like'));

    expect(await screen.findByTestId('match-overlay')).toBeTruthy();
    expect(screen.getByText(/TechNova Solutions também curtiu/)).toBeTruthy();

    await fireEvent.press(screen.getByTestId('match-keep-swiping'));
    await waitFor(() => expect(screen.queryByTestId('match-overlay')).toBeNull());
    expect(within(topCard()).getByText('UX/UI Designer Sênior')).toBeTruthy();
  });

  it('passar mostra o próximo card, sem overlay', async () => {
    await renderFeed();
    await screen.findByTestId('feed-top-card');

    await fireEvent.press(screen.getByTestId('feed-pass'));

    await waitFor(() => expect(within(topCard()).getByText('UX/UI Designer Sênior')).toBeTruthy());
    expect(screen.queryByTestId('match-overlay')).toBeNull();
  });

  it('ações de acessibilidade do card funcionam como o gesto', async () => {
    await renderFeed();
    await screen.findByTestId('feed-top-card');

    await fireEvent(topCard(), 'accessibilityAction', { nativeEvent: { actionName: 'pass' } });

    await waitFor(() => expect(within(topCard()).getByText('UX/UI Designer Sênior')).toBeTruthy());
  });

  it('empresa vê currículos e o título "Talentos"', async () => {
    await renderFeed('rh@empresa.com');

    expect(within(await screen.findByTestId('feed-top-card')).getByText('Alexandre Silva')).toBeTruthy();
    expect(screen.getByText('Talentos')).toBeTruthy();
  });

  it('busca por palavra-chave (com espera de digitação) e limpar filtros', async () => {
    jest.useFakeTimers();
    await renderFeed();
    await screen.findByTestId('feed-top-card');

    await fireEvent.changeText(screen.getByTestId('feed-search'), 'recepcionista');
    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    await waitFor(() => expect(within(topCard()).getByText('Recepcionista')).toBeTruthy());

    await fireEvent.changeText(screen.getByTestId('feed-search'), 'astronauta');
    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(await screen.findByText('Nada encontrado com esses filtros')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Limpar filtros'));
    await waitFor(() => expect(within(topCard()).getByText('Desenvolvedor Front-End')).toBeTruthy());
    jest.useRealTimers();
  });

  it('filtro de região', async () => {
    await renderFeed();
    await screen.findByTestId('feed-top-card');

    await fireEvent.press(screen.getByTestId('region-PE'));

    await waitFor(() => expect(within(topCard()).getByText('Recepcionista')).toBeTruthy());
    expect(screen.getByTestId('region-PE').props.accessibilityState).toEqual({ selected: true });
  });

  it('detalhes mostram o post completo e permitem dar match', async () => {
    await renderFeed();
    await screen.findByTestId('feed-top-card');

    await fireEvent.press(screen.getByTestId('feed-details'));
    const sheet = await screen.findByTestId('post-details');
    expect(within(sheet).getByText('VR, plano de saúde, auxílio home office')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('details-like'));
    expect(await screen.findByTestId('match-overlay')).toBeTruthy();
  });
});
