import { NetworkFailure } from '@/core/error/failure';
import { err, ok, type Result } from '@/core/error/result';
import type { Session } from '@/features/auth/domain/session';

import {
  matchesFilters,
  type CandidatoPost,
  type FeedFilters,
  type FeedPost,
  type SwipeDirection,
  type SwipeResult,
  type VagaPost,
} from '../domain/feed';
import type { FeedRepository } from '../domain/feedRepository';

/** Post de exemplo + se o outro lado "já curtiu" (match garantido ao curtir). */
interface Seed<P extends FeedPost> {
  post: P;
  likesBack: boolean;
}

export type OnMatch = (params: { session: Session; post: FeedPost; matchId: string }) => void;

/**
 * Feed em memória, enquanto a API não existe.
 *
 * - Candidato vê VAGAS_SEED; empresa vê CANDIDATOS_SEED.
 * - Posts marcados com `likesBack` dão match ao curtir (overlay "It's a match").
 * - O que o usuário já avaliou não volta para o feed dele. Empresa: o
 *   "já avaliado" é por vaga.
 * - Empresa sem vaga escolhida recebe lista vazia.
 * - Busca com a palavra "offline" simula falha de rede.
 *
 * `onMatch` avisa o chat (fake) para abrir a conversa, como a API faria.
 */
export class FakeFeedRepository implements FeedRepository {
  /** "userId:vagaId" -> ids de posts já avaliados. */
  private readonly seen = new Map<string, Set<string>>();

  private seenKey(session: Session, vagaId: string | null): string {
    return `${session.userId}:${vagaId ?? ''}`;
  }

  constructor(
    private readonly latencyMs: number = 600,
    private readonly onMatch?: OnMatch,
    private readonly vagas: Seed<VagaPost>[] = VAGAS_SEED,
    private readonly candidatos: Seed<CandidatoPost>[] = CANDIDATOS_SEED,
  ) {}

  async list({ session, filters }: { session: Session; filters: FeedFilters }): Promise<Result<FeedPost[]>> {
    await delay(this.latencyMs);
    if (filters.query.trim().toLowerCase() === 'offline') return err(NetworkFailure());

    if (session.role === 'empresa' && !filters.vagaId) return ok([]);

    const seen = this.seen.get(this.seenKey(session, filters.vagaId)) ?? new Set<string>();
    const seeds: Seed<FeedPost>[] = session.role === 'empresa' ? this.candidatos : this.vagas;
    return ok(seeds.map((s) => s.post).filter((p) => !seen.has(p.id) && matchesFilters(p, filters)));
  }

  async swipe({
    session,
    post,
    direction,
    vagaId,
  }: {
    session: Session;
    post: FeedPost;
    direction: SwipeDirection;
    vagaId: string | null;
  }): Promise<Result<SwipeResult>> {
    await delay(Math.min(this.latencyMs, 300));

    const key = this.seenKey(session, vagaId);
    const seen = this.seen.get(key) ?? new Set<string>();
    seen.add(post.id);
    this.seen.set(key, seen);

    if (direction === 'pass') return ok({ matched: false, matchId: null });

    const seed = [...this.vagas, ...this.candidatos].find((s) => s.post.id === post.id);
    if (!seed?.likesBack) return ok({ matched: false, matchId: null });

    const matchId = `match-${session.userId}-${vagaId ? `${vagaId}-` : ''}${post.id}`;
    this.onMatch?.({ session, post, matchId });
    return ok({ matched: true, matchId });
  }
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Dados de exemplo
// ---------------------------------------------------------------------------

function vaga(
  id: string,
  empresaNome: string,
  local: string,
  vagaInfo: VagaPost['vaga'],
  likesBack: boolean,
): Seed<VagaPost> {
  return {
    likesBack,
    post: {
      kind: 'vaga',
      id,
      empresaId: `empresa-${id}`,
      empresaNome,
      empresaFotoUri: null,
      vaga: vagaInfo,
      local,
      uf: local.slice(-2),
    },
  };
}

export const VAGAS_SEED: Seed<VagaPost>[] = [
  vaga(
    'vaga-1',
    'TechNova Solutions',
    'São Paulo - SP',
    {
      cargo: 'Desenvolvedor Front-End',
      descricao:
        'Buscamos um desenvolvedor pragmático para nosso time. Aqui não tem teste de personalidade bizarro: queremos ver seu código e bater um papo sincero.',
      beneficios: 'VR, plano de saúde, auxílio home office',
      horario: 'Seg a sex, 9h às 18h',
      cep: '01310-100',
      skillsObrigatorias: ['React', 'TypeScript'],
      skillsDesejaveis: ['Figma', 'Testes'],
      experienciaMinima: 2,
      escolaridade: 'Superior em andamento',
      tipoContrato: 'CLT',
      faixaSalarial: 'R$ 6 a 10 mil',
      modalidade: 'Híbrido',
    },
    true,
  ),
  vaga(
    'vaga-2',
    'Agência Rocket',
    'Rio de Janeiro - RJ',
    {
      cargo: 'UX/UI Designer Sênior',
      descricao: 'Desenhe produtos usados por milhões. Portfólio vale mais que diploma.',
      beneficios: 'Gympass, day off no aniversário',
      horario: 'Flexível',
      cep: '04547-000',
      skillsObrigatorias: ['Figma', 'UX Research'],
      skillsDesejaveis: ['Prototipação'],
      experienciaMinima: 5,
      escolaridade: 'Superior completo',
      tipoContrato: 'PJ',
      faixaSalarial: 'Acima de R$ 10 mil',
      modalidade: 'Remoto',
    },
    true,
  ),
  vaga(
    'vaga-3',
    'Padaria Pão Quente',
    'Belo Horizonte - MG',
    {
      cargo: 'Atendente de Balcão',
      descricao: 'Atendimento ao cliente, organização da vitrine e caixa. Primeiro emprego é bem-vindo!',
      beneficios: 'VT, café da manhã, cesta básica',
      horario: 'Escala 6x1, 6h às 14h',
      cep: '09580-900',
      skillsObrigatorias: ['Atendimento'],
      skillsDesejaveis: ['Caixa'],
      experienciaMinima: 0,
      escolaridade: 'Médio',
      tipoContrato: 'CLT',
      faixaSalarial: 'Até R$ 2 mil',
      modalidade: 'Presencial',
    },
    false,
  ),
  vaga(
    'vaga-4',
    'Banco Horizonte',
    'São Paulo - SP',
    {
      cargo: 'Analista de Dados Júnior',
      descricao: 'SQL, Python e muita curiosidade. Você vai construir dashboards que guiam decisões reais.',
      beneficios: 'PLR, plano de saúde e odontológico, VR',
      horario: 'Seg a sex, 8h às 17h',
      cep: '30130-000',
      skillsObrigatorias: ['SQL', 'Excel'],
      skillsDesejaveis: ['Python', 'Power BI'],
      experienciaMinima: 1,
      escolaridade: 'Superior em andamento',
      tipoContrato: 'CLT',
      faixaSalarial: 'R$ 4 a 6 mil',
      modalidade: 'Híbrido',
    },
    false,
  ),
  vaga(
    'vaga-5',
    'Loja Estilo Sul',
    'Curitiba - PR',
    {
      cargo: 'Vendedor(a)',
      descricao: 'Vendas consultivas em loja de moda. Comissão agressiva para quem gosta de gente.',
      beneficios: 'Comissão, VT, desconto em produtos',
      horario: 'Escala 5x2',
      cep: '80010-000',
      skillsObrigatorias: ['Vendas'],
      skillsDesejaveis: ['Negociação', 'CRM'],
      experienciaMinima: 1,
      escolaridade: 'Médio',
      tipoContrato: 'CLT',
      faixaSalarial: 'R$ 2 a 4 mil',
      modalidade: 'Presencial',
    },
    true,
  ),
  vaga(
    'vaga-6',
    'Startup Verde',
    'Porto Alegre - RS',
    {
      cargo: 'Estágio em Marketing',
      descricao: 'Redes sociais, campanhas e métricas. Aprenda fazendo, com mentoria de verdade.',
      beneficios: 'Bolsa-auxílio, VT, horário de estudo',
      horario: '6h por dia',
      cep: '90010-000',
      skillsObrigatorias: ['Redes sociais'],
      skillsDesejaveis: ['Canva', 'Excel'],
      experienciaMinima: 0,
      escolaridade: 'Superior em andamento',
      tipoContrato: 'Estágio',
      faixaSalarial: 'Até R$ 2 mil',
      modalidade: 'Híbrido',
    },
    false,
  ),
  vaga(
    'vaga-7',
    'Clínica Bem Viver',
    'Recife - PE',
    {
      cargo: 'Recepcionista',
      descricao: 'Agendamento de consultas, recepção de pacientes e organização da agenda médica.',
      beneficios: 'Plano de saúde, VR',
      horario: 'Seg a sex, 8h às 17h',
      cep: '50030-000',
      skillsObrigatorias: ['Atendimento', 'Organização'],
      skillsDesejaveis: ['Inglês'],
      experienciaMinima: 0,
      escolaridade: 'Médio',
      tipoContrato: 'CLT',
      faixaSalarial: 'R$ 2 a 4 mil',
      modalidade: 'Presencial',
    },
    true,
  ),
  vaga(
    'vaga-8',
    'CodeFactory',
    'São Paulo - SP',
    {
      cargo: 'Desenvolvedor Back-end Node.js',
      descricao: 'APIs, filas e bancos de dados. Time pequeno, impacto grande, zero burocracia.',
      beneficios: 'Equipamento, auxílio home office, plano de saúde',
      horario: 'Flexível',
      cep: '20040-000',
      skillsObrigatorias: ['Node.js', 'SQL'],
      skillsDesejaveis: ['Docker', 'TypeScript'],
      experienciaMinima: 3,
      escolaridade: 'Superior completo',
      tipoContrato: 'PJ',
      faixaSalarial: 'R$ 6 a 10 mil',
      modalidade: 'Remoto',
    },
    false,
  ),
];

function candidato(
  id: string,
  local: string,
  fields: Omit<CandidatoPost, 'kind' | 'id' | 'candidatoId' | 'fotoUri' | 'local' | 'uf'>,
  likesBack: boolean,
): Seed<CandidatoPost> {
  return {
    likesBack,
    post: {
      kind: 'candidato',
      id,
      candidatoId: `candidato-${id}`,
      fotoUri: null,
      local,
      uf: local.slice(-2),
      ...fields,
    },
  };
}

export const CANDIDATOS_SEED: Seed<CandidatoPost>[] = [
  candidato(
    'cand-1',
    'São Paulo - SP',
    {
      nome: 'Alexandre Silva',
      idade: 24,
      cargoDesejado: 'Desenvolvedor Front-end',
      escolaridade: 'Superior completo',
      formacao: 'Análise e Desenvolvimento de Sistemas — Fatec',
      experiencias:
        'Desenvolvedor Front-end com 3 anos de experiência. Focado em interfaces limpas e usabilidade. Cansado de processos seletivos de meses.',
      anosExperiencia: 3,
      hardSkills: ['React', 'JavaScript', 'UI/UX', 'Figma'],
      softSkills: ['Comunicação', 'Trabalho em equipe', 'Proatividade'],
      modalidades: ['Híbrido', 'Remoto'],
      tiposContrato: ['CLT', 'PJ'],
      faixaSalarial: 'R$ 6 a 10 mil',
    },
    true,
  ),
  candidato(
    'cand-2',
    'Rio de Janeiro - RJ',
    {
      nome: 'Beatriz Costa',
      idade: 31,
      cargoDesejado: 'Analista de Marketing',
      escolaridade: 'Pós-graduação',
      formacao: 'Publicidade — UFRJ; MBA em Marketing Digital',
      experiencias: '6 anos em agências, liderando campanhas de performance para e-commerce.',
      anosExperiencia: 6,
      hardSkills: ['Google Ads', 'SEO', 'Excel'],
      softSkills: ['Liderança', 'Organização'],
      modalidades: ['Remoto'],
      tiposContrato: ['CLT'],
      faixaSalarial: 'R$ 6 a 10 mil',
    },
    false,
  ),
  candidato(
    'cand-3',
    'Belo Horizonte - MG',
    {
      nome: 'Carlos Mendes',
      idade: 19,
      cargoDesejado: 'Atendente',
      escolaridade: 'Médio',
      formacao: 'Ensino médio completo',
      experiencias: 'Primeiro emprego! Fiz trabalho voluntário em eventos da igreja e adoro lidar com pessoas.',
      anosExperiencia: 0,
      hardSkills: ['Atendimento', 'Caixa'],
      softSkills: ['Comunicação', 'Pontualidade'],
      modalidades: ['Presencial'],
      tiposContrato: ['CLT', 'Jovem Aprendiz'],
      faixaSalarial: 'Até R$ 2 mil',
    },
    true,
  ),
  candidato(
    'cand-4',
    'Curitiba - PR',
    {
      nome: 'Daniela Rocha',
      idade: 27,
      cargoDesejado: 'Analista de Dados',
      escolaridade: 'Superior completo',
      formacao: 'Estatística — UFPR',
      experiencias: '3 anos com BI no varejo: SQL, Power BI e modelos de previsão de demanda.',
      anosExperiencia: 3,
      hardSkills: ['SQL', 'Python', 'Power BI'],
      softSkills: ['Pensamento analítico', 'Organização'],
      modalidades: ['Híbrido', 'Remoto'],
      tiposContrato: ['CLT', 'PJ'],
      faixaSalarial: 'R$ 4 a 6 mil',
    },
    false,
  ),
  candidato(
    'cand-5',
    'São Paulo - SP',
    {
      nome: 'Eduardo Lima',
      idade: 35,
      cargoDesejado: 'Vendedor',
      escolaridade: 'Médio',
      formacao: 'Técnico em Administração — Etec',
      experiencias: '10 anos em vendas no varejo, batendo metas todo trimestre.',
      anosExperiencia: 10,
      hardSkills: ['Vendas', 'Negociação', 'CRM'],
      softSkills: ['Persuasão', 'Resiliência'],
      modalidades: ['Presencial'],
      tiposContrato: ['CLT'],
      faixaSalarial: 'R$ 2 a 4 mil',
    },
    true,
  ),
  candidato(
    'cand-6',
    'Recife - PE',
    {
      nome: 'Fernanda Alves',
      idade: 22,
      cargoDesejado: 'Estágio em Design',
      escolaridade: 'Superior em andamento',
      formacao: 'Design — UFPE (5º período)',
      experiencias: 'Freelas de identidade visual para pequenos negócios do bairro.',
      anosExperiencia: 0,
      hardSkills: ['Figma', 'Illustrator', 'Photoshop'],
      softSkills: ['Criatividade', 'Trabalho em equipe'],
      modalidades: ['Híbrido'],
      tiposContrato: ['Estágio', 'Freelancer'],
      faixaSalarial: 'Até R$ 2 mil',
    },
    false,
  ),
];
