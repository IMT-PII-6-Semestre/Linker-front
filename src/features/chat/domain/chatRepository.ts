import type { Result } from '@/core/error/result';
import type { Session } from '@/features/auth/domain/session';

import type { Conversation, Message, ReportReason } from './chat';

/** Contrato do chat. Trocar o fake pela API (REST + websocket) não toca na UI. */
export interface ChatRepository {
  listConversations(session: Session): Promise<Result<Conversation[]>>;

  getConversation(session: Session, conversationId: string): Promise<Result<Conversation>>;

  /** Mensagens em ordem cronológica. Também marca a conversa como lida. */
  getMessages(session: Session, conversationId: string): Promise<Result<Message[]>>;

  sendMessage(session: Session, conversationId: string, text: string): Promise<Result<Message>>;

  /** Desfaz o match: a conversa some para os dois lados. */
  unmatch(session: Session, conversationId: string): Promise<Result<void>>;

  /** Bloqueia a pessoa/empresa: some a conversa e ela não aparece mais no feed. */
  block(session: Session, conversationId: string): Promise<Result<void>>;

  /** Denúncia para a moderação. A conversa continua (bloquear é separado). */
  report(session: Session, conversationId: string, reason: ReportReason, details: string): Promise<Result<void>>;
}
