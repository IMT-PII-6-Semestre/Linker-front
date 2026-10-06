import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Failure } from '@/core/error/failure';

import {
  CANDIDATO_STEPS,
  EMPRESA_STEPS,
  emptyCandidatoDraft,
  emptyEmpresaDraft,
  toCandidatoSignUp,
  toEmpresaSignUp,
  type CandidatoDraft,
  type EmpresaDraft,
  type FieldErrors,
} from '../domain/registration';
import type { SessionState } from './sessionStore';

export type SignUpRole = 'candidato' | 'empresa';

/**
 * Estado do wizard de cadastro. A pergunta inicial ("o que você busca?")
 * é `role === null`; depois cada etapa valida só os próprios campos antes
 * de avançar. Sucesso no envio não navega: o guard reage à nova sessão.
 */
export interface SignUpFormState {
  role: SignUpRole | null;
  step: number;
  candidato: CandidatoDraft;
  empresa: EmpresaDraft;
  /** Erros da etapa atual, por campo. */
  errors: Record<string, string>;
  submitting: boolean;
  failure: Failure | null;

  chooseRole: (role: SignUpRole) => void;
  updateCandidato: (patch: Partial<CandidatoDraft>) => void;
  updateEmpresa: (patch: Partial<EmpresaDraft>) => void;
  /** Valida a etapa; avança ou, na última, envia. Devolve `false` se havia erro. */
  next: () => Promise<boolean>;
  /** Volta uma etapa; da primeira, volta para a escolha de perfil. */
  back: () => void;
}

export function stepsFor(role: SignUpRole) {
  return role === 'candidato' ? CANDIDATO_STEPS : EMPRESA_STEPS;
}

/** Remove do mapa de erros os campos que o usuário acabou de editar. */
function clearErrors(errors: Record<string, string>, keys: string[]): Record<string, string> {
  if (!keys.some((k) => k in errors)) return errors;
  const next = { ...errors };
  for (const k of keys) delete next[k];
  return next;
}

export function createSignUpFormStore(signUp: SessionState['signUp']): StoreApi<SignUpFormState> {
  return createStore<SignUpFormState>((set, get) => ({
    role: null,
    step: 0,
    candidato: emptyCandidatoDraft,
    empresa: emptyEmpresaDraft,
    errors: {},
    submitting: false,
    failure: null,

    chooseRole: (role) => set({ role, step: 0, errors: {}, failure: null }),

    updateCandidato: (patch) =>
      set((s) => ({
        candidato: { ...s.candidato, ...patch },
        errors: clearErrors(s.errors, Object.keys(patch)),
        failure: null,
      })),

    updateEmpresa: (patch) =>
      set((s) => ({
        empresa: { ...s.empresa, ...patch },
        errors: clearErrors(s.errors, Object.keys(patch)),
        failure: null,
      })),

    next: async () => {
      const { role, step, candidato, empresa, submitting } = get();
      if (!role || submitting) return false;

      const steps = stepsFor(role);
      const errors: FieldErrors<CandidatoDraft> | FieldErrors<EmpresaDraft> =
        role === 'candidato' ? CANDIDATO_STEPS[step].validate(candidato) : EMPRESA_STEPS[step].validate(empresa);

      if (Object.keys(errors).length > 0) {
        set({ errors: errors as Record<string, string> });
        return false;
      }

      if (step < steps.length - 1) {
        set({ step: step + 1, errors: {} });
        return true;
      }

      set({ submitting: true, failure: null, errors: {} });
      const payload = role === 'candidato' ? toCandidatoSignUp(candidato) : toEmpresaSignUp(empresa);
      const result = await signUp(payload);
      if (result.kind === 'ok') return true;
      set({ submitting: false, failure: result.failure });
      return false;
    },

    back: () => {
      const { step, submitting } = get();
      if (submitting) return;
      if (step === 0) set({ role: null, errors: {}, failure: null });
      else set({ step: step - 1, errors: {}, failure: null });
    },
  }));
}
