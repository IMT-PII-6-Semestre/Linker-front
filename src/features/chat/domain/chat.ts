import type { FeedPost } from '@/features/feed/domain/feed';

/**
 * Chat estilo WhatsApp, só texto: sem arquivos, emojis ou ligação.
 * Cada conversa nasce de um match.
 */
export interface Message {
  id: string;
  conversationId: string;
  text: string;
  /** Epoch em ms. */
  sentAt: number;
  fromMe: boolean;
  /** Só mensagens minhas passam por "enviando"/"falhou". */
  status: 'sending' | 'sent' | 'failed';
}

export interface Conversation {
  /** Mesmo id do match. */
  id: string;
  participantName: string;
  participantFotoUri: string | null;
  /** Cargo da vaga (candidato vendo empresa) ou cargo desejado (empresa vendo candidato). */
  subtitle: string;
  /** Post que gerou o match — "Ver detalhes" no topo da conversa. */
  post: FeedPost | null;
  lastMessage: Message | null;
  unreadCount: number;
}

export const REPORT_REASONS = [
  'Spam ou propaganda',
  'Comportamento ofensivo',
  'Vaga ou perfil falso',
  'Pediu dinheiro ou dados bancários',
  'Outro motivo',
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const MAX_MESSAGE_LENGTH = 1000;

/**
 * Emojis e pictogramas (inclui modificadores de tom de pele, ZWJ e seletor
 * de variação). O chat é só texto — o teclado do celular ainda deixa
 * digitar emoji, então eles são removidos ao digitar.
 */
const EMOJI_PATTERN =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]/gu;

export function stripEmojis(text: string): string {
  return text.replace(EMOJI_PATTERN, '');
}

/** Texto pronto para enviar, ou null se não houver o que enviar. */
export function sanitizeMessage(text: string): string | null {
  const clean = stripEmojis(text).trim().slice(0, MAX_MESSAGE_LENGTH);
  return clean.length > 0 ? clean : null;
}

// ---------------------------------------------------------------------------
// Formatação de horário (sem depender de Intl)
// ---------------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, '0');

export function formatTime(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Hora se for hoje, "Ontem", ou dd/mm. */
export function formatListTime(ms: number, now: Date = new Date()): string {
  const diffDays = Math.round((startOfDay(now) - startOfDay(new Date(ms))) / 86_400_000);
  if (diffDays <= 0) return formatTime(ms);
  if (diffDays === 1) return 'Ontem';
  const d = new Date(ms);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}
