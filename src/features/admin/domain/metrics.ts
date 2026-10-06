/**
 * Métricas do painel administrativo. Calculadas por uma função pura a
 * partir de um retrato da base — cada fórmula fica explícita e testável.
 */

/** Retrato bruto da base (o que a API devolveria agregado). */
export interface PlatformSnapshot {
  /** Idade de cada candidato (empregado). */
  candidatoAges: number[];
  /** Quantidade de vagas abertas por empresa (empregador). */
  vagasPorEmpresa: number[];
  /** Total de "matches" dados (curtidas/indicações), dos dois lados. */
  curtidas: number;
  /** Curtidas correspondidas = matches. */
  matches: number;
  /** Cadastros nos últimos 30 dias e nos 30 anteriores. */
  novosUltimos30d: number;
  novos30dAnteriores: number;
  /** Matches por semana, da mais antiga para a mais recente. */
  matchesPorSemana: { inicio: number; matches: number }[];
  geradoEm: number;
}

export interface AgeBucket {
  faixa: string;
  candidatos: number;
}

export interface AdminMetrics {
  totalUsuarios: number;
  candidatos: number;
  empresas: number;
  matches: number;
  curtidas: number;
  /** Curtidas que viraram match, 0–1 (null sem curtidas). */
  taxaMatch: number | null;
  /** null sem empresas. */
  mediaVagasPorEmpresa: number | null;
  /** null sem candidatos. */
  mediaIdade: number | null;
  /** Variação de cadastros: últimos 30 dias vs 30 anteriores, em fração (null sem base). */
  variacaoNovos: number | null;
  novosUltimos30d: number;
  matchesPorSemana: { semana: string; matches: number }[];
  faixasEtarias: AgeBucket[];
  geradoEm: number;
}

export const AGE_BUCKETS: { faixa: string; min: number; max: number }[] = [
  { faixa: '14–17', min: 14, max: 17 },
  { faixa: '18–24', min: 18, max: 24 },
  { faixa: '25–34', min: 25, max: 34 },
  { faixa: '35–44', min: 35, max: 44 },
  { faixa: '45–59', min: 45, max: 59 },
  { faixa: '60+', min: 60, max: Infinity },
];

const average = (values: number[]): number | null =>
  values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length;

const pad = (n: number) => String(n).padStart(2, '0');

/** "dd/mm" do início da semana. */
export function weekLabel(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

export function computeMetrics(snapshot: PlatformSnapshot): AdminMetrics {
  const candidatos = snapshot.candidatoAges.length;
  const empresas = snapshot.vagasPorEmpresa.length;
  return {
    totalUsuarios: candidatos + empresas,
    candidatos,
    empresas,
    matches: snapshot.matches,
    curtidas: snapshot.curtidas,
    taxaMatch: snapshot.curtidas > 0 ? snapshot.matches / snapshot.curtidas : null,
    mediaVagasPorEmpresa: average(snapshot.vagasPorEmpresa),
    mediaIdade: average(snapshot.candidatoAges),
    variacaoNovos:
      snapshot.novos30dAnteriores > 0
        ? (snapshot.novosUltimos30d - snapshot.novos30dAnteriores) / snapshot.novos30dAnteriores
        : null,
    novosUltimos30d: snapshot.novosUltimos30d,
    matchesPorSemana: snapshot.matchesPorSemana.map((w) => ({
      semana: weekLabel(w.inicio),
      matches: w.matches,
    })),
    faixasEtarias: AGE_BUCKETS.map((b) => ({
      faixa: b.faixa,
      candidatos: snapshot.candidatoAges.filter((age) => age >= b.min && age <= b.max).length,
    })),
    geradoEm: snapshot.geradoEm,
  };
}

// ---------------------------------------------------------------------------
// Formatação pt-BR (sem depender de Intl)
// ---------------------------------------------------------------------------

/** 1.284 · 12,9 mil · 4,2 mi */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${formatDecimal(n / 1_000_000, 1)} mi`;
  if (n >= 10_000) return `${formatDecimal(n / 1_000, 1)} mil`;
  return formatInteger(n);
}

export function formatInteger(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Decimal com vírgula; remove ",0" final. */
export function formatDecimal(n: number, digits = 1): string {
  const fixed = n.toFixed(digits);
  const [int, dec] = fixed.split('.');
  const intPart = formatInteger(Number(int));
  return dec && Number(dec) !== 0 ? `${intPart},${dec}` : intPart;
}

export function formatPercent(fraction: number, digits = 1): string {
  return `${formatDecimal(fraction * 100, digits)}%`;
}

/** "+12,5%" / "−3%" — sinal sempre explícito (o − é o sinal de menos tipográfico). */
export function formatSignedPercent(fraction: number): string {
  const value = formatPercent(Math.abs(fraction));
  if (fraction > 0) return `+${value}`;
  if (fraction < 0) return `−${value}`;
  return value;
}
