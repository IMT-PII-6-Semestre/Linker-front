import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { useEffect, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProviders, useSessionStore } from '@/app-shell/AppProviders';
import { ThemeProvider } from '@/app-shell/theme/ThemeProvider';
import { FakeAuthRepository } from '@/features/auth/data/fakeAuthRepository';

import { FakeChatRepository } from '../../data/fakeChatRepository';
import { ChatListScreen } from '../ChatListScreen';
import { ConversationScreen } from '../ConversationScreen';

jest.mock('expo-router', () => {
  const { useEffect: useMountEffect } = jest.requireActual('react');
  return {
    router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
    // Na lista, "ganhar foco" = montar.
    useFocusEffect: (effect: () => void) => useMountEffect(effect, [effect]),
  };
});
const mockRouter = jest.requireMock('expo-router').router as Record<string, jest.Mock>;

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function SignedIn({ children }: { children: ReactNode }) {
  const signIn = useSessionStore((s) => s.signIn);
  const session = useSessionStore((s) => s.session);
  useEffect(() => {
    void signIn({ email: 'ana@email.com', password: '123456' });
  }, [signIn]);
  return session ? <>{children}</> : null;
}

async function renderWithChat(ui: ReactNode, repo = new FakeChatRepository(0)) {
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <AppProviders origin="mobile" authRepository={new FakeAuthRepository(0)} chatRepository={repo}>
        <ThemeProvider>
          <SignedIn>{ui}</SignedIn>
        </ThemeProvider>
      </AppProviders>
    </SafeAreaProvider>,
  );
  return repo;
}

/** O id da conversa de exemplo depende do userId da sessão fake. */
async function firstConversationId(repo: FakeChatRepository) {
  const { FakeAuthRepository: Auth } = jest.requireActual('@/features/auth/data/fakeAuthRepository');
  const auth = new Auth(0);
  const signIn = await auth.signIn({ email: 'ana@email.com', password: '123456', origin: 'mobile' });
  const list = await repo.listConversations(signIn.value);
  if (list.kind !== 'ok') throw new Error('expected ok');
  return list.value.find((c: { participantName: string }) => c.participantName === 'Studio Pixel')!.id as string;
}

beforeEach(() => jest.clearAllMocks());

describe('ChatListScreen', () => {
  it('lista as conversas, busca por nome e abre a conversa', async () => {
    await renderWithChat(<ChatListScreen />);

    const row = await screen.findByText('Studio Pixel');
    expect(screen.getByText('Mercado Bom Preço')).toBeTruthy();
    expect(screen.getByText('Combinado! Te esperamos.')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('chat-search'), 'mercado');
    expect(screen.queryByText('Studio Pixel')).toBeNull();

    await fireEvent.changeText(screen.getByTestId('chat-search'), 'xyz');
    expect(screen.getByText('Nenhuma conversa encontrada')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('chat-search'), '');
    await fireEvent.press(await screen.findByText('Studio Pixel'));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringMatching(/^\/chat\/seed-/));
    expect(row).toBeTruthy();
  });
});

describe('ConversationScreen', () => {
  it('mostra o histórico e envia mensagem', async () => {
    const repo = new FakeChatRepository(0);
    const id = await firstConversationId(repo);
    await renderWithChat(<ConversationScreen conversationId={id} />, repo);

    expect(await screen.findByText('Combinado! Te esperamos.')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('chat-input'), 'Até amanhã!');
    await fireEvent.press(screen.getByTestId('chat-send'));

    const list = screen.getByTestId('message-list');
    await waitFor(() => expect(within(list).getByText('Até amanhã!')).toBeTruthy());
    expect(screen.getByTestId('chat-input').props.value).toBe('');
  });

  it('emoji digitado é removido com aviso', async () => {
    const repo = new FakeChatRepository(0);
    const id = await firstConversationId(repo);
    await renderWithChat(<ConversationScreen conversationId={id} />, repo);
    await screen.findByText('Combinado! Te esperamos.');

    await fireEvent.changeText(screen.getByTestId('chat-input'), 'Oi 😀');

    expect(screen.getByTestId('chat-input').props.value).toBe('Oi ');
    expect(screen.getByText('O chat do Linker aceita apenas texto.')).toBeTruthy();
  });

  it('desfazer match pede confirmação e volta para a lista', async () => {
    const repo = new FakeChatRepository(0);
    const id = await firstConversationId(repo);
    await renderWithChat(<ConversationScreen conversationId={id} />, repo);
    await screen.findByText('Combinado! Te esperamos.');

    await fireEvent.press(screen.getByTestId('conversation-menu-button'));
    await fireEvent.press(await screen.findByTestId('action-unmatch'));
    expect(await screen.findByText('Desfazer match?')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('confirm-dialog-confirm'));

    await waitFor(() => expect(mockRouter.back).toHaveBeenCalled());
  });

  it('denunciar exige motivo e mostra o aviso de enviada', async () => {
    const repo = new FakeChatRepository(0);
    const id = await firstConversationId(repo);
    await renderWithChat(<ConversationScreen conversationId={id} />, repo);
    await screen.findByText('Combinado! Te esperamos.');

    await fireEvent.press(screen.getByTestId('conversation-menu-button'));
    await fireEvent.press(await screen.findByTestId('action-report'));
    await fireEvent.press(await screen.findByTestId('report-submit'));
    expect(await screen.findByText('Escolha um motivo.')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Comportamento ofensivo'));
    await fireEvent.press(screen.getByTestId('report-submit'));

    expect(await screen.findByText(/Denúncia enviada/)).toBeTruthy();
    expect(repo.reports).toHaveLength(1);
    expect(repo.reports[0].reason).toBe('Comportamento ofensivo');
  });
});
