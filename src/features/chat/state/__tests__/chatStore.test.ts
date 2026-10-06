import type { Session } from '@/features/auth/domain/session';
import { VAGAS_SEED } from '@/features/feed/data/fakeFeedRepository';

import { FakeChatRepository } from '../../data/fakeChatRepository';
import { CHAT_POLL_MS, createChatStore } from '../chatStore';

const session: Session = {
  userId: 'u1',
  name: 'Ana Souza',
  email: 'ana@email.com',
  role: 'candidato',
  token: 't',
  origin: 'mobile',
};

function setup(replyDelayMs = 1500) {
  const repo = new FakeChatRepository(0, replyDelayMs);
  return { repo, store: createChatStore(repo) };
}

describe('chatStore', () => {
  it('lista as conversas de exemplo, mais recente primeiro, com não lidas', async () => {
    const { store } = setup();
    await store.getState().loadConversations(session);

    const list = store.getState().conversations;
    expect(list.map((c) => c.participantName)).toEqual(['Studio Pixel', 'Mercado Bom Preço']);
    expect(list[0].unreadCount).toBe(1);
  });

  it('abrir a conversa marca como lida', async () => {
    const { store } = setup();
    await store.getState().loadConversations(session);
    const id = store.getState().conversations[0].id;

    await store.getState().openConversation(session, id);

    expect(store.getState().threads[id].messages).toHaveLength(3);
    expect(store.getState().conversations[0].unreadCount).toBe(0);
  });

  it('um match no feed cria a conversa com a mensagem da empresa', async () => {
    const { repo, store } = setup();
    repo.createFromMatch({ session, post: VAGAS_SEED[0].post, matchId: 'match-1' });

    await store.getState().openConversation(session, 'match-1');

    const thread = store.getState().threads['match-1'];
    expect(thread.conversation?.participantName).toBe('TechNova Solutions');
    expect(thread.messages[0].text).toMatch(/Olá, Ana! Vimos que deu match/);
  });

  it('envia (sem emojis) e recebe a resposta na próxima atualização', async () => {
    jest.useFakeTimers();
    try {
      const { store } = setup(1000);
      await store.getState().loadConversations(session);
      const id = store.getState().conversations[1].id;
      await store.getState().openConversation(session, id);

      await store.getState().sendMessage(session, id, '  Pode sim! 😀 ');
      const mine = store.getState().threads[id].messages.at(-1)!;
      expect(mine).toMatchObject({ text: 'Pode sim!', fromMe: true, status: 'sent' });
      expect(store.getState().conversations[0].id).toBe(id); // subiu para o topo

      const stop = store.getState().watchConversation(session, id);
      jest.advanceTimersByTime(CHAT_POLL_MS);
      await Promise.resolve();
      await jest.runOnlyPendingTimersAsync();
      stop();

      const last = store.getState().threads[id].messages.at(-1)!;
      expect(last.fromMe).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it('falha no envio marca a mensagem e "tentar de novo" reenvia', async () => {
    const { repo, store } = setup();
    await store.getState().loadConversations(session);
    const id = store.getState().conversations[0].id;
    await store.getState().openConversation(session, id);

    await store.getState().sendMessage(session, id, 'estou offline');
    const failed = store.getState().threads[id].messages.at(-1)!;
    expect(failed.status).toBe('failed');

    jest.spyOn(repo, 'sendMessage').mockImplementationOnce(async (_s, conversationId, text) => ({
      kind: 'ok',
      value: { id: 'srv-1', conversationId, text, sentAt: Date.now(), fromMe: true, status: 'sent' },
    }));
    await store.getState().retryMessage(session, id, failed.id);

    const messages = store.getState().threads[id].messages;
    expect(messages.at(-1)).toMatchObject({ id: 'srv-1', status: 'sent' });
    expect(messages.filter((m) => m.status === 'failed')).toHaveLength(0);
  });

  it('desfazer match e bloquear removem a conversa', async () => {
    const { repo, store } = setup();
    await store.getState().loadConversations(session);
    const [first, second] = store.getState().conversations;

    expect((await store.getState().unmatch(session, first.id)).kind).toBe('ok');
    expect((await store.getState().block(session, second.id)).kind).toBe('ok');

    expect(store.getState().conversations).toEqual([]);
    expect(repo.blocked.get('u1')?.has('Mercado Bom Preço')).toBe(true);
    await store.getState().loadConversations(session);
    expect(store.getState().conversations).toEqual([]);
  });

  it('denunciar registra o motivo e mantém a conversa', async () => {
    const { repo, store } = setup();
    await store.getState().loadConversations(session);
    const id = store.getState().conversations[0].id;

    const result = await store.getState().report(session, id, 'Spam ou propaganda', 'link estranho');

    expect(result.kind).toBe('ok');
    expect(repo.reports).toEqual([
      { userId: 'u1', conversationId: id, reason: 'Spam ou propaganda', details: 'link estranho' },
    ]);
    expect(store.getState().conversations.some((c) => c.id === id)).toBe(true);
  });
});
