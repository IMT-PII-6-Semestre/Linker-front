import type { Result } from '@/core/error/result';
import type { Session } from '@/features/auth/domain/session';

import type { FeedFilters, FeedPost, SwipeDirection, SwipeResult } from './feed';

/** Contrato do feed. Trocar o fake pela API não toca na UI. */
export interface FeedRepository {
  /**
   * Posts ainda não avaliados por este usuário: vagas para candidato,
   * currículos para empresa. Já filtrados por palavra-chave e região.
   * Empresa: candidatos para `filters.vagaId` — quem foi avaliado para uma
   * vaga continua aparecendo para as outras.
   */
  list(params: { session: Session; filters: FeedFilters }): Promise<Result<FeedPost[]>>;

  /**
   * Registra match/passar. Match só acontece se o outro lado também curtiu.
   * `vagaId`: vaga em nome da qual a empresa avaliou o candidato (null para candidato).
   */
  swipe(params: {
    session: Session;
    post: FeedPost;
    direction: SwipeDirection;
    vagaId: string | null;
  }): Promise<Result<SwipeResult>>;
}
