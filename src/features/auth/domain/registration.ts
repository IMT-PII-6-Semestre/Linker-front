/**
 * Cadastro: o que cada perfil informa e as regras de validação. Funções
 * puras, sem UI — testáveis isoladas e reaproveitáveis na edição de perfil.
 */
import { onlyDigits } from '@/core/format/masks';

import { validateEmail, validatePassword } from './credentials';

// ---------------------------------------------------------------------------
// Opções fixas (chips)
// ---------------------------------------------------------------------------

export const ESCOLARIDADES = [
  'Fundamental',
  'Médio',
  'Técnico',
  'Superior em andamento',
  'Superior completo',
  'Pós-graduação',
] as const;
export type Escolaridade = (typeof ESCOLARIDADES)[number];

export const TIPOS_CONTRATO = ['CLT', 'PJ', 'Estágio', 'Temporário', 'Freelancer', 'Jovem Aprendiz'] as const;
export type TipoContrato = (typeof TIPOS_CONTRATO)[number];

export const MODALIDADES = ['Presencial', 'Híbrido', 'Remoto'] as const;
export type Modalidade = (typeof MODALIDADES)[number];

export const FAIXAS_SALARIAIS = [
  'Até R$ 2 mil',
  'R$ 2 a 4 mil',
  'R$ 4 a 6 mil',
  'R$ 6 a 10 mil',
  'Acima de R$ 10 mil',
  'A combinar',
] as const;
export type FaixaSalarial = (typeof FAIXAS_SALARIAIS)[number];

export const HARD_SKILL_SUGESTOES = ['Excel', 'React', 'Atendimento', 'Vendas', 'Inglês', 'Figma', 'SQL'];
export const SOFT_SKILL_SUGESTOES = ['Comunicação', 'Trabalho em equipe', 'Proatividade', 'Organização', 'Liderança'];

// ---------------------------------------------------------------------------
// Payloads enviados ao repositório
// ---------------------------------------------------------------------------

export interface CandidatoSignUp {
  role: 'candidato';
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  celular: string;
  escolaridade: Escolaridade;
  cargoDesejado: string;
  formacao: string;
  cep: string;
  tiposContrato: TipoContrato[];
  experiencias: string;
  faixaSalarial: FaixaSalarial;
  hardSkills: string[];
  softSkills: string[];
  modalidades: Modalidade[];
  senha: string;
}

export interface VagaInfo {
  cargo: string;
  descricao: string;
  beneficios: string;
  horario: string;
  escolaridade: Escolaridade;
  tipoContrato: TipoContrato;
  faixaSalarial: FaixaSalarial;
  modalidade: Modalidade;
}

export interface EmpresaSignUp {
  role: 'empresa';
  /** CNPJ (MEI também tem CNPJ). */
  cnpj: string;
  nomeEmpresa: string;
  dataFundacao: string;
  endereco: string;
  telefone: string;
  email: string;
  vaga: VagaInfo;
  senha: string;
}

export type SignUpPayload = CandidatoSignUp | EmpresaSignUp;

// ---------------------------------------------------------------------------
// Rascunhos do formulário (o que a UI edita, antes de validar)
// ---------------------------------------------------------------------------

export interface CandidatoDraft {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  celular: string;
  escolaridade: Escolaridade | null;
  cargoDesejado: string;
  formacao: string;
  cep: string;
  tiposContrato: TipoContrato[];
  experiencias: string;
  faixaSalarial: FaixaSalarial | null;
  hardSkills: string[];
  softSkills: string[];
  modalidades: Modalidade[];
  senha: string;
  confirmacaoSenha: string;
}

export interface EmpresaDraft {
  cnpj: string;
  nomeEmpresa: string;
  dataFundacao: string;
  endereco: string;
  telefone: string;
  email: string;
  cargo: string;
  descricao: string;
  beneficios: string;
  horario: string;
  escolaridade: Escolaridade | null;
  tipoContrato: TipoContrato | null;
  faixaSalarial: FaixaSalarial | null;
  modalidade: Modalidade | null;
  senha: string;
  confirmacaoSenha: string;
}

export const emptyCandidatoDraft: CandidatoDraft = {
  nomeCompleto: '',
  cpf: '',
  dataNascimento: '',
  email: '',
  celular: '',
  escolaridade: null,
  cargoDesejado: '',
  formacao: '',
  cep: '',
  tiposContrato: [],
  experiencias: '',
  faixaSalarial: null,
  hardSkills: [],
  softSkills: [],
  modalidades: [],
  senha: '',
  confirmacaoSenha: '',
};

export const emptyEmpresaDraft: EmpresaDraft = {
  cnpj: '',
  nomeEmpresa: '',
  dataFundacao: '',
  endereco: '',
  telefone: '',
  email: '',
  cargo: '',
  descricao: '',
  beneficios: '',
  horario: '',
  escolaridade: null,
  tipoContrato: null,
  faixaSalarial: null,
  modalidade: null,
  senha: '',
  confirmacaoSenha: '',
};

// ---------------------------------------------------------------------------
// Validadores de campo — devolvem a mensagem de erro, ou null
// ---------------------------------------------------------------------------

type Validator = (value: string) => string | null;

const required =
  (message: string): Validator =>
  (value) =>
    value.trim().length === 0 ? message : null;

export function validateFullName(value: string): string | null {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Informe seu nome completo.';
  if (parts.length < 2) return 'Informe nome e sobrenome.';
  return null;
}

export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

export function validateCpf(value: string): string | null {
  if (onlyDigits(value).length === 0) return 'Informe seu CPF.';
  return isValidCpf(value) ? null : 'CPF inválido.';
}

export function isValidCnpj(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const digit = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + Number(cnpj[i]) * w, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return digit(12) === Number(cnpj[12]) && digit(13) === Number(cnpj[13]);
}

export function validateCnpj(value: string): string | null {
  if (onlyDigits(value).length === 0) return 'Informe o CNPJ ou MEI.';
  return isValidCnpj(value) ? null : 'CNPJ inválido.';
}

export function validateCep(value: string): string | null {
  const digits = onlyDigits(value);
  if (digits.length === 0) return 'Informe o CEP.';
  return digits.length === 8 ? null : 'CEP deve ter 8 dígitos.';
}

export function validateMobilePhone(value: string): string | null {
  const digits = onlyDigits(value);
  if (digits.length === 0) return 'Informe seu celular.';
  if (digits.length !== 11 || digits[2] !== '9') return 'Celular inválido. Use DDD + 9 dígitos.';
  return null;
}

export function validatePhone(value: string): string | null {
  const digits = onlyDigits(value);
  if (digits.length === 0) return 'Informe o telefone.';
  return digits.length === 10 || digits.length === 11 ? null : 'Telefone inválido. Inclua o DDD.';
}

/** Converte "dd/mm/aaaa" em Date, ou null se a data não existir. */
export function parseBrDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, dd, mm, yyyy] = match.map(Number);
  const date = new Date(yyyy, mm - 1, dd);
  const exists = date.getFullYear() === yyyy && date.getMonth() === mm - 1 && date.getDate() === dd;
  return exists ? date : null;
}

export function ageOn(birth: Date, today: Date): number {
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age--;
  return age;
}

/** Idade mínima para trabalhar no Brasil (aprendiz). */
export const MIN_WORK_AGE = 14;

export function validateBirthDate(value: string, today: Date = new Date()): string | null {
  if (value.trim().length === 0) return 'Informe sua data de nascimento.';
  const date = parseBrDate(value);
  if (!date) return 'Data inválida. Use dd/mm/aaaa.';
  const age = ageOn(date, today);
  if (age < MIN_WORK_AGE) return `É preciso ter pelo menos ${MIN_WORK_AGE} anos.`;
  if (age > 100) return 'Confira o ano de nascimento.';
  return null;
}

export function validateFoundationDate(value: string, today: Date = new Date()): string | null {
  if (value.trim().length === 0) return 'Informe a data de fundação.';
  const date = parseBrDate(value);
  if (!date) return 'Data inválida. Use dd/mm/aaaa.';
  if (date > today) return 'A data de fundação não pode estar no futuro.';
  return null;
}

export function validatePasswordConfirmation(password: string, confirmation: string): string | null {
  if (confirmation.length === 0) return 'Confirme sua senha.';
  return password === confirmation ? null : 'As senhas não conferem.';
}

// ---------------------------------------------------------------------------
// Etapas do wizard
// ---------------------------------------------------------------------------

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface WizardStep<T> {
  title: string;
  subtitle: string;
  validate: (draft: T) => FieldErrors<T>;
}

function collect<T>(entries: [keyof T, string | null][]): FieldErrors<T> {
  const errors: FieldErrors<T> = {};
  for (const [key, message] of entries) {
    if (message) errors[key] = message;
  }
  return errors;
}

const pick = (message: string) => (value: unknown) =>
  value == null || (Array.isArray(value) && value.length === 0) ? message : null;

export const CANDIDATO_STEPS: WizardStep<CandidatoDraft>[] = [
  {
    title: 'Seus dados',
    subtitle: 'Informações fixas — usadas só para identificar você.',
    validate: (d) =>
      collect([
        ['nomeCompleto', validateFullName(d.nomeCompleto)],
        ['cpf', validateCpf(d.cpf)],
        ['dataNascimento', validateBirthDate(d.dataNascimento)],
        ['email', validateEmail(d.email)],
        ['celular', validateMobilePhone(d.celular)],
      ]),
  },
  {
    title: 'Seu perfil',
    subtitle: 'É isso que as empresas vão ver no feed.',
    validate: (d) =>
      collect([
        ['cargoDesejado', required('Qual vaga você procura?')(d.cargoDesejado)],
        ['escolaridade', pick('Escolha sua escolaridade.')(d.escolaridade)],
        ['formacao', required('Conte sua formação (curso e instituição).')(d.formacao)],
        ['cep', validateCep(d.cep)],
        ['experiencias', required('Descreva suas experiências (ou "primeiro emprego").')(d.experiencias)],
      ]),
  },
  {
    title: 'O que você procura',
    subtitle: 'Usamos isso para filtrar as vagas do seu feed.',
    validate: (d) =>
      collect([
        ['tiposContrato', pick('Escolha ao menos um tipo de contrato.')(d.tiposContrato)],
        ['modalidades', pick('Escolha ao menos uma modalidade.')(d.modalidades)],
        ['faixaSalarial', pick('Escolha uma faixa salarial.')(d.faixaSalarial)],
      ]),
  },
  {
    title: 'Suas habilidades',
    subtitle: 'Hard skills são técnicas; soft skills, comportamentais.',
    validate: (d) =>
      collect([
        ['hardSkills', pick('Adicione ao menos uma hard skill.')(d.hardSkills)],
        ['softSkills', pick('Adicione ao menos uma soft skill.')(d.softSkills)],
      ]),
  },
  {
    title: 'Crie sua senha',
    subtitle: 'Último passo!',
    validate: (d) =>
      collect([
        ['senha', validatePassword(d.senha)],
        ['confirmacaoSenha', validatePasswordConfirmation(d.senha, d.confirmacaoSenha)],
      ]),
  },
];

export const EMPRESA_STEPS: WizardStep<EmpresaDraft>[] = [
  {
    title: 'Sua empresa',
    subtitle: 'Informações fixas da empresa.',
    validate: (d) =>
      collect([
        ['cnpj', validateCnpj(d.cnpj)],
        ['nomeEmpresa', required('Informe o nome da empresa.')(d.nomeEmpresa)],
        ['dataFundacao', validateFoundationDate(d.dataFundacao)],
        ['endereco', required('Informe o endereço.')(d.endereco)],
        ['telefone', validatePhone(d.telefone)],
        ['email', validateEmail(d.email)],
      ]),
  },
  {
    title: 'A vaga',
    subtitle: 'Você poderá cadastrar outras vagas depois, no perfil.',
    validate: (d) =>
      collect([
        ['cargo', required('Informe o nome do cargo.')(d.cargo)],
        ['descricao', required('Descreva a vaga.')(d.descricao)],
        ['beneficios', required('Liste os benefícios (ou "a combinar").')(d.beneficios)],
        ['horario', required('Informe o horário de trabalho.')(d.horario)],
      ]),
  },
  {
    title: 'Requisitos e condições',
    subtitle: 'Usamos isso para mostrar os talentos certos no seu feed.',
    validate: (d) =>
      collect([
        ['escolaridade', pick('Escolha a escolaridade desejada.')(d.escolaridade)],
        ['tipoContrato', pick('Escolha o tipo de contrato.')(d.tipoContrato)],
        ['modalidade', pick('Escolha a modalidade.')(d.modalidade)],
        ['faixaSalarial', pick('Escolha a faixa salarial.')(d.faixaSalarial)],
      ]),
  },
  {
    title: 'Crie sua senha',
    subtitle: 'Último passo!',
    validate: (d) =>
      collect([
        ['senha', validatePassword(d.senha)],
        ['confirmacaoSenha', validatePasswordConfirmation(d.senha, d.confirmacaoSenha)],
      ]),
  },
];

// ---------------------------------------------------------------------------
// Rascunho -> payload (só chamar depois de todas as etapas validadas)
// ---------------------------------------------------------------------------

export function toCandidatoSignUp(d: CandidatoDraft): CandidatoSignUp {
  if (!d.escolaridade || !d.faixaSalarial) {
    throw new Error('toCandidatoSignUp: rascunho não validado');
  }
  const { confirmacaoSenha: _ignored, ...rest } = d;
  return {
    ...rest,
    role: 'candidato',
    nomeCompleto: d.nomeCompleto.trim(),
    email: d.email.trim().toLowerCase(),
    escolaridade: d.escolaridade,
    faixaSalarial: d.faixaSalarial,
  };
}

export function toEmpresaSignUp(d: EmpresaDraft): EmpresaSignUp {
  if (!d.escolaridade || !d.tipoContrato || !d.faixaSalarial || !d.modalidade) {
    throw new Error('toEmpresaSignUp: rascunho não validado');
  }
  return {
    role: 'empresa',
    cnpj: d.cnpj,
    nomeEmpresa: d.nomeEmpresa.trim(),
    dataFundacao: d.dataFundacao,
    endereco: d.endereco.trim(),
    telefone: d.telefone,
    email: d.email.trim().toLowerCase(),
    senha: d.senha,
    vaga: {
      cargo: d.cargo.trim(),
      descricao: d.descricao.trim(),
      beneficios: d.beneficios.trim(),
      horario: d.horario.trim(),
      escolaridade: d.escolaridade,
      tipoContrato: d.tipoContrato,
      faixaSalarial: d.faixaSalarial,
      modalidade: d.modalidade,
    },
  };
}
