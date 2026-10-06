import type { Result } from '@/core/error/result';
import type { Session } from '@/features/auth/domain/session';

import type { Profile } from './profile';

/** Contrato do perfil. A tela conhece só isto — trocar o fake pela API não toca na UI. */
export interface ProfileRepository {
  /** Perfil do usuário logado. */
  getProfile(session: Session): Promise<Result<Profile>>;

  /** Grava o perfil inteiro (dados, foto e vagas) e devolve a versão salva. */
  saveProfile(profile: Profile): Promise<Result<Profile>>;
}
