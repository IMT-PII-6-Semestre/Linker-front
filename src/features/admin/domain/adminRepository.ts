import type { Result } from '@/core/error/result';
import type { Session } from '@/features/auth/domain/session';

import type { AdminMetrics } from './metrics';

/** Contrato do painel. Só sessões `admin` têm acesso. */
export interface AdminRepository {
  metrics(session: Session): Promise<Result<AdminMetrics>>;
}
