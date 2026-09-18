import type { AppOrigin } from '@/app-shell/origin';

/** Sessão autenticada. Sempre válida — se existe uma Session, há login ativo. */
export interface Session {
  userId: string;
  name: string;
  email: string;
  /** Token de acesso. Nunca logar, nunca persistir fora de storage seguro. */
  token: string;
  /** Origem em que a sessão foi criada. Sessão do painel não vale no app. */
  origin: AppOrigin;
}

export function getFirstName(session: Session): string {
  return session.name.split(' ')[0];
}
