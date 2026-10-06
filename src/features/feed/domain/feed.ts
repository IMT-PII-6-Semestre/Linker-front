import type {
  Escolaridade,
  FaixaSalarial,
  Modalidade,
  TipoContrato,
  VagaInfo,
} from '@/features/auth/domain/registration';

/**
 * Post do feed. O candidato vê vagas; a empresa vê currículos. Cada post
 * é um card que pode receber "match" (curtir) ou "passar".
 */
export interface VagaPost {
  kind: 'vaga';
  id: string;
  empresaId: string;
  empresaNome: string;
  empresaFotoUri: string | null;
  vaga: VagaInfo;
  /** "Cidade - UF" — usado no filtro de região. */
  local: string;
  uf: string;
}

export interface CandidatoPost {
  kind: 'candidato';
  id: string;
  candidatoId: string;
  nome: string;
  idade: number;
  fotoUri: string | null;
  cargoDesejado: string;
  escolaridade: Escolaridade;
  formacao: string;
  experiencias: string;
  hardSkills: string[];
  softSkills: string[];
  modalidades: Modalidade[];
  tiposContrato: TipoContrato[];
  faixaSalarial: FaixaSalarial;
  local: string;
  uf: string;
}

export type FeedPost = VagaPost | CandidatoPost;

export type SwipeDirection = 'like' | 'pass';

export interface FeedFilters {
  /** Palavra-chave livre (cargo, empresa, skills, descrição). */
  query: string;
  /** UF, ou null para todas as regiões. */
  uf: string | null;
}

export const emptyFilters: FeedFilters = { query: '', uf: null };

/** Regiões oferecidas no filtro. */
export const REGIOES: { uf: string; label: string }[] = [
  { uf: 'SP', label: 'São Paulo' },
  { uf: 'RJ', label: 'Rio de Janeiro' },
  { uf: 'MG', label: 'Minas Gerais' },
  { uf: 'PR', label: 'Paraná' },
  { uf: 'RS', label: 'Rio Grande do Sul' },
  { uf: 'PE', label: 'Pernambuco' },
];

/** Resultado de curtir um post: deu match se o outro lado já tinha curtido. */
export interface SwipeResult {
  matched: boolean;
  /** Id da conversa criada no match (usado para abrir o chat). */
  matchId: string | null;
}

// ---------------------------------------------------------------------------
// Busca e filtro — funções puras, usadas pelo fake (e testáveis)
// ---------------------------------------------------------------------------

/** Minúsculas e sem acento: "Híbrido" casa com "hibrido". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function searchableText(post: FeedPost): string {
  if (post.kind === 'vaga') {
    const v = post.vaga;
    return [post.empresaNome, v.cargo, v.descricao, v.beneficios, v.modalidade, v.tipoContrato, post.local].join(' ');
  }
  return [
    post.nome,
    post.cargoDesejado,
    post.formacao,
    post.experiencias,
    ...post.hardSkills,
    ...post.softSkills,
    ...post.modalidades,
    post.local,
  ].join(' ');
}

/** Todas as palavras da busca precisam aparecer no post (em qualquer campo). */
export function matchesFilters(post: FeedPost, filters: FeedFilters): boolean {
  if (filters.uf && post.uf !== filters.uf) return false;
  const words = normalize(filters.query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalize(searchableText(post));
  return words.every((w) => haystack.includes(w));
}

export function postTitle(post: FeedPost): string {
  return post.kind === 'vaga' ? post.vaga.cargo : post.nome;
}

export function postSubtitle(post: FeedPost): string {
  return post.kind === 'vaga' ? post.empresaNome : post.cargoDesejado;
}
