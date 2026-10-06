import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Failure } from '@/core/error/failure';
import type { Result } from '@/core/error/result';
import type { Session } from '@/features/auth/domain/session';

import { sanitizeMessage, type Conversation, type Message, type ReportReason } from '../domain/chat';
import type { ChatRepository } from '../domain/chatRepository';

export type LoadStatus = 'idle' | 'loading' | 'data' | 'error';

export interface ThreadState {
  status: LoadStatus;
  conversation: Conversation | null;
  /** Ordem cronológica (mais antiga primeiro). */
  messages: Message[];
  failure: Failure | null;
}

const emptyThread: ThreadState = { status: 'idle', conversation: null, messages: [], failure: null };

/** Intervalo de atualização da conversa aberta (sem websocket por enquanto). */
export const CHAT_POLL_MS = 2500;

/**
 * Conversas e mensagens. Envio otimista: a mensagem aparece na hora como
 * "enviando"; se falhar, fica marcada para tentar de novo.
 */
export interface ChatState {
  listStatus: LoadStatus;
  conversations: Conversation[];
  listFailure: Failure | null;
  threads: Record<string, ThreadState>;
  loadedFor: string | null;

  loadConversations: (session: Session) => Promise<void>;
  openConversation: (session: Session, conversationId: string) => Promise<void>;
  /** Busca mensagens novas da conversa aberta (silencioso, sem loading). */
  refreshConversation: (session: Session, conversationId: string) => Promise<void>;
  /** Começa a atualizar a conversa periodicamente. Devolve a função de parar. */
  watchConversation: (session: Session, conversationId: string) => () => void;
  sendMessage: (session: Session, conversationId: string, text: string) => Promise<void>;
  retryMessage: (session: Session, conversationId: string, messageId: string) => Promise<void>;
  unmatch: (session: Session, conversationId: string) => Promise<Result<void>>;
  block: (session: Session, conversationId: string) => Promise<Result<void>>;
  report: (
    session: Session,
    conversationId: string,
    reason: ReportReason,
    details: string,
  ) => Promise<Result<void>>;
}

export function createChatStore(repository: ChatRepository): StoreApi<ChatState> {
  let tempSeq = 0;

  return createStore<ChatState>((set, get) => {
    const thread = (id: string) => get().threads[id] ?? emptyThread;
    const patchThread = (id: string, patch: Partial<ThreadState>) =>
      set((s) => ({ threads: { ...s.threads, [id]: { ...(s.threads[id] ?? emptyThread), ...patch } } }));

    /** Mantém as mensagens locais ainda não confirmadas (enviando/falhou). */
    const mergeServerMessages = (id: string, server: Message[]) => {
      const local = thread(id).messages.filter((m) => m.status !== 'sent');
      patchThread(id, { messages: [...server, ...local], status: 'data', failure: null });
    };

    /** Mantém a prévia da lista em dia sem recarregar tudo. */
    const touchList = (id: string, lastMessage: Message) =>
      set((s) => ({
        conversations: s.conversations
          .map((c) => (c.id === id ? { ...c, lastMessage, unreadCount: 0 } : c))
          .sort((a, b) => (b.lastMessage?.sentAt ?? 0) - (a.lastMessage?.sentAt ?? 0)),
      }));

    const removeConversation = (id: string) =>
      set((s) => {
        const { [id]: _removed, ...threads } = s.threads;
        return { conversations: s.conversations.filter((c) => c.id !== id), threads };
      });

    const deliver = async (session: Session, id: string, messageId: string, text: string) => {
      const result = await repository.sendMessage(session, id, text);
      const messages = thread(id).messages;
      if (result.kind === 'ok') {
        // A atualização periódica pode já ter trazido a versão do servidor.
        const withoutDuplicate = messages.filter((m) => m.id !== result.value.id);
        patchThread(id, { messages: withoutDuplicate.map((m) => (m.id === messageId ? result.value : m)) });
        touchList(id, result.value);
      } else {
        patchThread(id, {
          messages: messages.map((m) => (m.id === messageId ? { ...m, status: 'failed' as const } : m)),
        });
      }
    };

    return {
      listStatus: 'idle',
      conversations: [],
      listFailure: null,
      threads: {},
      loadedFor: null,

      loadConversations: async (session) => {
        if (get().loadedFor !== session.userId) {
          set({ conversations: [], threads: {}, loadedFor: session.userId });
        }
        // Recarrega em silêncio se já tem lista (volta para a aba, pull-to-refresh).
        if (get().conversations.length === 0) set({ listStatus: 'loading', listFailure: null });
        const result = await repository.listConversations(session);
        if (get().loadedFor !== session.userId) return;
        if (result.kind === 'ok') set({ listStatus: 'data', conversations: result.value, listFailure: null });
        else set({ listStatus: 'error', listFailure: result.failure });
      },

      openConversation: async (session, id) => {
        if (thread(id).messages.length === 0) patchThread(id, { status: 'loading', failure: null });
        const [conversation, messages] = await Promise.all([
          repository.getConversation(session, id),
          repository.getMessages(session, id),
        ]);
        if (conversation.kind === 'err') {
          patchThread(id, { status: 'error', failure: conversation.failure });
          return;
        }
        if (messages.kind === 'err') {
          patchThread(id, { status: 'error', failure: messages.failure });
          return;
        }
        patchThread(id, { conversation: { ...conversation.value, unreadCount: 0 } });
        mergeServerMessages(id, messages.value);
        set((s) => ({ conversations: s.conversations.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)) }));
      },

      refreshConversation: async (session, id) => {
        const result = await repository.getMessages(session, id);
        if (result.kind !== 'ok' || !get().threads[id]) return;
        const before = thread(id).messages.filter((m) => m.status === 'sent').length;
        mergeServerMessages(id, result.value);
        const last = result.value[result.value.length - 1];
        if (last && result.value.length !== before) touchList(id, last);
      },

      watchConversation: (session, id) => {
        const timer = setInterval(() => void get().refreshConversation(session, id), CHAT_POLL_MS);
        return () => clearInterval(timer);
      },

      sendMessage: async (session, id, raw) => {
        const text = sanitizeMessage(raw);
        if (!text) return;
        tempSeq += 1;
        const optimistic: Message = {
          id: `local-${tempSeq}`,
          conversationId: id,
          text,
          sentAt: Date.now(),
          fromMe: true,
          status: 'sending',
        };
        patchThread(id, { messages: [...thread(id).messages, optimistic] });
        await deliver(session, id, optimistic.id, text);
      },

      retryMessage: async (session, id, messageId) => {
        const message = thread(id).messages.find((m) => m.id === messageId);
        if (!message || message.status !== 'failed') return;
        patchThread(id, {
          messages: thread(id).messages.map((m) => (m.id === messageId ? { ...m, status: 'sending' as const } : m)),
        });
        await deliver(session, id, messageId, message.text);
      },

      unmatch: async (session, id) => {
        const result = await repository.unmatch(session, id);
        if (result.kind === 'ok') removeConversation(id);
        return result;
      },

      block: async (session, id) => {
        const result = await repository.block(session, id);
        if (result.kind === 'ok') removeConversation(id);
        return result;
      },

      report: (session, id, reason, details) => repository.report(session, id, reason, details),
    };
  });
}
