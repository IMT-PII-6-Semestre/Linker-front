import {
  ageOn,
  emptyEmpresaDraft,
  parseBrDate,
  toCandidatoSignUp,
  type CandidatoDraft,
  type CandidatoSignUp,
  type EmpresaDraft,
  type EmpresaSignUp,
  type VagaInfo,
} from '@/features/auth/domain/registration';

/**
 * Perfil = tudo o que a pessoa informou no cadastro (menos a senha) + foto.
 * A empresa tem os dados fixos e uma lista de vagas, cada uma editável.
 */
export interface CandidatoProfile extends Omit<CandidatoSignUp, 'role' | 'senha'> {
  role: 'candidato';
  userId: string;
  /** URI local/remota da foto. Opcional — sem foto mostramos as iniciais. */
  fotoUri: string | null;
}

export interface Vaga extends VagaInfo {
  id: string;
}

export interface EmpresaProfile extends Omit<EmpresaSignUp, 'role' | 'senha' | 'vaga'> {
  role: 'empresa';
  userId: string;
  fotoUri: string | null;
  vagas: Vaga[];
}

export type Profile = CandidatoProfile | EmpresaProfile;

export function profileDisplayName(profile: Profile): string {
  return profile.role === 'candidato' ? profile.nomeCompleto : profile.nomeEmpresa;
}

/** Idade (candidato) a partir de "dd/mm/aaaa", ou null se a data for inválida. */
export function candidatoAge(profile: CandidatoProfile, today: Date = new Date()): number | null {
  const birth = parseBrDate(profile.dataNascimento);
  return birth ? ageOn(birth, today) : null;
}

// ---------------------------------------------------------------------------
// Edição: o perfil vira o mesmo rascunho do cadastro, então a edição usa
// exatamente os mesmos campos e validações das etapas do wizard.
// ---------------------------------------------------------------------------

export function candidatoToDraft(profile: CandidatoProfile): CandidatoDraft {
  const { role: _role, userId: _userId, fotoUri: _fotoUri, ...fields } = profile;
  return { ...fields, senha: '', confirmacaoSenha: '' };
}

/** Aplica um rascunho já validado ao perfil, preservando id e foto. */
export function applyCandidatoDraft(profile: CandidatoProfile, draft: CandidatoDraft): CandidatoProfile {
  const { role: _role, senha: _senha, ...fields } = toCandidatoSignUp(draft);
  return { ...profile, ...fields };
}

export function empresaToDraft(profile: EmpresaProfile, vaga?: Vaga): EmpresaDraft {
  return {
    ...emptyEmpresaDraft,
    cnpj: profile.cnpj,
    nomeEmpresa: profile.nomeEmpresa,
    dataFundacao: profile.dataFundacao,
    endereco: profile.endereco,
    telefone: profile.telefone,
    email: profile.email,
    ...(vaga
      ? {
          cargo: vaga.cargo,
          descricao: vaga.descricao,
          beneficios: vaga.beneficios,
          horario: vaga.horario,
          escolaridade: vaga.escolaridade,
          tipoContrato: vaga.tipoContrato,
          faixaSalarial: vaga.faixaSalarial,
          modalidade: vaga.modalidade,
        }
      : null),
  };
}

/** Atualiza só os dados fixos da empresa. */
export function applyEmpresaDraft(profile: EmpresaProfile, draft: EmpresaDraft): EmpresaProfile {
  return {
    ...profile,
    cnpj: draft.cnpj,
    nomeEmpresa: draft.nomeEmpresa.trim(),
    dataFundacao: draft.dataFundacao,
    endereco: draft.endereco.trim(),
    telefone: draft.telefone,
    email: draft.email.trim().toLowerCase(),
  };
}

/** Monta a vaga a partir de um rascunho validado (etapas "A vaga" + "Requisitos"). */
export function draftToVaga(draft: EmpresaDraft, id: string): Vaga {
  if (!draft.escolaridade || !draft.tipoContrato || !draft.faixaSalarial || !draft.modalidade) {
    throw new Error('draftToVaga: rascunho não validado');
  }
  return {
    id,
    cargo: draft.cargo.trim(),
    descricao: draft.descricao.trim(),
    beneficios: draft.beneficios.trim(),
    horario: draft.horario.trim(),
    escolaridade: draft.escolaridade,
    tipoContrato: draft.tipoContrato,
    faixaSalarial: draft.faixaSalarial,
    modalidade: draft.modalidade,
  };
}

/** Insere a vaga nova ou substitui a de mesmo id. */
export function upsertVaga(profile: EmpresaProfile, vaga: Vaga): EmpresaProfile {
  const exists = profile.vagas.some((v) => v.id === vaga.id);
  return {
    ...profile,
    vagas: exists ? profile.vagas.map((v) => (v.id === vaga.id ? vaga : v)) : [...profile.vagas, vaga],
  };
}

export function removeVaga(profile: EmpresaProfile, vagaId: string): EmpresaProfile {
  return { ...profile, vagas: profile.vagas.filter((v) => v.id !== vagaId) };
}
