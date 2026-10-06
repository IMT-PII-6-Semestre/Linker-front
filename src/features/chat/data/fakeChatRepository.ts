import { NetworkFailure, UnexpectedFailure } from '@/core/error/failure';
import { err, ok, type Result } from '@/core/error/result';
import type { Session } from '@/features/auth/domain/session';
import type { FeedPost } from '@/features/feed/domain/feed';

import type { Conversation, Message, ReportReason } from '../domain/chat';
import type { ChatRepository } from '../domain/chatRepository';

interface Thread {
  conversation: Omit<Conversation, 'lastMessage' | 'unreadCount'>;
  messages: Message[];
  /** Respostas automáticas que "chegam" depois de um tempo. */
  pending: { message: Message; availableAt: number }[];
  lastReadAt: number;
}

/**
 * Chat em memória, enquanto a API não existe.
 *
 * - Cada usuário começa com duas conversas de exemplo.
 * - Um match no feed cria a conversa (ver `createFromMatch`), já com a
 *   mensagem de boas-vindas do outro lado.
 * - Ao enviar, o outro lado "responde" ~1,5s depois — a resposta aparece
 *   na próxima leitura (a tela consulta periodicamente, como faria sem
 *   websocket).
 * - Mensagem contendo "offline" simula falha de envio.
 */
export class FakeChatRepository implements ChatRepository {
  private readonly threads = new Map<string, Map<string, Thread>>();
  readonly reports: { userId: string; conversationId: string; reason: ReportReason; details: string }[] = [];
  readonly blocked = new Map<string, Set<string>>();
  private seq = 0;

  constructor(
    private readonly latencyMs: number = 400,
    private readonly replyDelayMs: number = 1500,
  ) {}

  /** Chamado pelo feed (fake) quando dá match. */
  createFromMatch({ session, post, matchId }: { session: Session; post: FeedPost; matchId: string }): void {
    const threads = this.threadsOf(session);
    if (threads.has(matchId)) return;
    const name = post.kind === 'vaga' ? post.empresaNome : post.nome;
    const greeting =
      post.kind === 'vaga'
        ? `Olá, ${firstName(session.name)}! Vimos que deu match com a nossa vaga de ${post.vaga.cargo}. Podemos conversar?`
        : `Olá! Que bom que deu match. Tenho interesse na vaga, quando podemos conversar?`;
    threads.set(matchId, {
      conversation: {
        id: matchId,
        participantName: name,
        participantFotoUri: post.kind === 'vaga' ? post.empresaFotoUri : post.fotoUri,
        subtitle: post.kind === 'vaga' ? post.vaga.cargo : post.cargoDesejado,
        post,
      },
      messages: [this.message(matchId, greeting, false, Date.now())],
      pending: [],
      lastReadAt: 0,
    });
  }

  async listConversations(session: Session): Promise<Result<Conversation[]>> {
    await delay(this.latencyMs);
    const threads = [...this.threadsOf(session).values()];
    threads.forEach((t) => this.deliverPending(t));
    return ok(
      threads
        .map((t) => this.toConversation(t))
        .sort((a, b) => (b.lastMessage?.sentAt ?? 0) - (a.lastMessage?.sentAt ?? 0)),
    );
  }

  async getConversation(session: Session, conversationId: string): Promise<Result<Conversation>> {
    await delay(this.latencyMs / 2);
    const thread = this.threadsOf(session).get(conversationId);
    if (!thread) return err(notFound());
    this.deliverPending(thread);
    return ok(this.toConversation(thread));
  }

  async getMessages(session: Session, conversationId: string): Promise<Result<Message[]>> {
    await delay(this.latencyMs / 2);
    const thread = this.threadsOf(session).get(conversationId);
    if (!thread) return err(notFound());
    this.deliverPending(thread);
    thread.lastReadAt = Date.now();
    return ok([...thread.messages]);
  }

  async sendMessage(session: Session, conversationId: string, text: string): Promise<Result<Message>> {
    await delay(this.latencyMs / 2);
    const thread = this.threadsOf(session).get(conversationId);
    if (!thread) return err(notFound());
    if (text.toLowerCase().includes('offline')) return err(NetworkFailure());

    const now = Date.now();
    const message = this.message(conversationId, text, true, now);
    thread.messages.push(message);
    thread.lastReadAt = now;
    thread.pending.push({
      message: this.message(conversationId, autoReply(thread.messages.length), false, now + this.replyDelayMs),
      availableAt: now + this.replyDelayMs,
    });
    return ok(message);
  }

  async unmatch(session: Session, conversationId: string): Promise<Result<void>> {
    await delay(this.latencyMs);
    if (!this.threadsOf(session).delete(conversationId)) return err(notFound());
    return ok(undefined);
  }

  async block(session: Session, conversationId: string): Promise<Result<void>> {
    await delay(this.latencyMs);
    const thread = this.threadsOf(session).get(conversationId);
    if (!thread) return err(notFound());
    const blocked = this.blocked.get(session.userId) ?? new Set<string>();
    blocked.add(thread.conversation.participantName);
    this.blocked.set(session.userId, blocked);
    this.threadsOf(session).delete(conversationId);
    return ok(undefined);
  }

  async report(
    session: Session,
    conversationId: string,
    reason: ReportReason,
    details: string,
  ): Promise<Result<void>> {
    await delay(this.latencyMs);
    if (!this.threadsOf(session).has(conversationId)) return err(notFound());
    this.reports.push({ userId: session.userId, conversationId, reason, details });
    return ok(undefined);
  }

  // -------------------------------------------------------------------------

  private threadsOf(session: Session): Map<string, Thread> {
    let threads = this.threads.get(session.userId);
    if (!threads) {
      threads = this.seed(session);
      this.threads.set(session.userId, threads);
    }
    return threads;
  }

  private deliverPending(thread: Thread): void {
    const now = Date.now();
    const ready = thread.pending.filter((p) => p.availableAt <= now);
    if (ready.length === 0) return;
    thread.pending = thread.pending.filter((p) => p.availableAt > now);
    thread.messages.push(...ready.map((p) => p.message));
  }

  private toConversation(thread: Thread): Conversation {
    const last = thread.messages[thread.messages.length - 1] ?? null;
    const unreadCount = thread.messages.filter((m) => !m.fromMe && m.sentAt > thread.lastReadAt).length;
    return { ...thread.conversation, lastMessage: last, unreadCount };
  }

  private message(conversationId: string, text: string, fromMe: boolean, sentAt: number): Message {
    this.seq += 1;
    return { id: `msg-${this.seq}`, conversationId, text, fromMe, sentAt, status: 'sent' };
  }

  private seed(session: Session): Map<string, Thread> {
    const hour = 3_600_000;
    const now = Date.now();
    const examples =
      session.role === 'empresa'
        ? [
            {
              id: `seed-${session.userId}-1`,
              name: 'Juliana Prado',
              subtitle: 'Assistente Administrativa',
              lines: [
                { text: 'Olá! Vi que deu match com a vaga. Ela ainda está aberta?', fromMe: false, ago: 26 * hour },
                { text: 'Está sim, Juliana! Pode me mandar seu melhor horário para conversarmos?', fromMe: true, ago: 25 * hour },
                { text: 'Amanhã às 10h fica ótimo para mim.', fromMe: false, ago: 2 * hour },
              ],
            },
            {
              id: `seed-${session.userId}-2`,
              name: 'Rafael Teixeira',
              subtitle: 'Desenvolvedor Mobile',
              lines: [{ text: 'Oi! Obrigado pelo match. Posso enviar meu portfólio por aqui?', fromMe: false, ago: 50 * hour }],
            },
          ]
        : [
            {
              id: `seed-${session.userId}-1`,
              name: 'Studio Pixel',
              subtitle: 'Designer Gráfico',
              lines: [
                { text: `Olá, ${firstName(session.name)}! Vimos que deu match. Como está sua disponibilidade para uma conversa amanhã às 14h?`, fromMe: false, ago: 3 * hour },
                { text: 'Olá! Muito obrigado. Amanhã às 14h é perfeito para mim.', fromMe: true, ago: 2 * hour },
                { text: 'Combinado! Te esperamos.', fromMe: false, ago: hour },
              ],
            },
            {
              id: `seed-${session.userId}-2`,
              name: 'Mercado Bom Preço',
              subtitle: 'Repositor',
              lines: [{ text: 'Podemos marcar a entrevista para sexta?', fromMe: false, ago: 30 * hour }],
            },
          ];

    const threads = new Map<string, Thread>();
    for (const ex of examples) {
      threads.set(ex.id, {
        conversation: {
          id: ex.id,
          participantName: ex.name,
          participantFotoUri: null,
          subtitle: ex.subtitle,
          post: null,
        },
        messages: ex.lines.map((l) => this.message(ex.id, l.text, l.fromMe, now - l.ago)),
        pending: [],
        // A primeira conversa chega com mensagem não lida.
        lastReadAt: ex === examples[0] ? now - 1.5 * hour : now,
      });
    }
    return threads;
  }
}

const REPLIES = [
  'Perfeito, obrigado pelo retorno!',
  'Ótimo! Vou verificar e já te respondo.',
  'Combinado. Qualquer dúvida, é só chamar por aqui.',
  'Entendi! Pode me contar um pouco mais?',
];

function autoReply(index: number): string {
  return REPLIES[index % REPLIES.length];
}

function firstName(name: string): string {
  return name.split(' ')[0] ?? name;
}

function notFound() {
  return UnexpectedFailure('Esta conversa não está mais disponível.');
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
