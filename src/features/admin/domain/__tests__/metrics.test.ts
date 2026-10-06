import {
  computeMetrics,
  formatCompact,
  formatDecimal,
  formatInteger,
  formatPercent,
  formatSignedPercent,
  type PlatformSnapshot,
} from '../metrics';

const snapshot: PlatformSnapshot = {
  candidatoAges: [16, 20, 24, 30, 45, 61],
  vagasPorEmpresa: [1, 2, 6],
  curtidas: 200,
  matches: 50,
  novosUltimos30d: 30,
  novos30dAnteriores: 24,
  matchesPorSemana: [{ inicio: new Date(2026, 8, 28).getTime(), matches: 12 }],
  geradoEm: 0,
};

describe('computeMetrics', () => {
  const m = computeMetrics(snapshot);

  it('conta usuários, empregados e empregadores', () => {
    expect(m.totalUsuarios).toBe(9);
    expect(m.candidatos).toBe(6);
    expect(m.empresas).toBe(3);
  });

  it('% de indicações que viraram match = matches / curtidas', () => {
    expect(m.taxaMatch).toBe(0.25);
  });

  it('médias de vagas por empresa e de idade', () => {
    expect(m.mediaVagasPorEmpresa).toBe(3);
    expect(m.mediaIdade).toBe(196 / 6);
  });

  it('variação de cadastros vs período anterior', () => {
    expect(m.variacaoNovos).toBeCloseTo(0.25);
  });

  it('distribui idades nas faixas (bordas inclusivas)', () => {
    expect(m.faixasEtarias).toEqual([
      { faixa: '14–17', candidatos: 1 },
      { faixa: '18–24', candidatos: 2 },
      { faixa: '25–34', candidatos: 1 },
      { faixa: '35–44', candidatos: 0 },
      { faixa: '45–59', candidatos: 1 },
      { faixa: '60+', candidatos: 1 },
    ]);
  });

  it('semana rotulada pelo início (dd/mm)', () => {
    expect(m.matchesPorSemana).toEqual([{ semana: '28/09', matches: 12 }]);
  });

  it('base vazia não divide por zero', () => {
    const empty = computeMetrics({
      ...snapshot,
      candidatoAges: [],
      vagasPorEmpresa: [],
      curtidas: 0,
      matches: 0,
      novos30dAnteriores: 0,
    });
    expect(empty.taxaMatch).toBeNull();
    expect(empty.mediaIdade).toBeNull();
    expect(empty.mediaVagasPorEmpresa).toBeNull();
    expect(empty.variacaoNovos).toBeNull();
  });
});

describe('formatação pt-BR', () => {
  it('inteiros com ponto de milhar', () => {
    expect(formatInteger(1248)).toBe('1.248');
    expect(formatInteger(1234567)).toBe('1.234.567');
  });

  it('decimais com vírgula, sem ",0"', () => {
    expect(formatDecimal(28.46)).toBe('28,5');
    expect(formatDecimal(3)).toBe('3');
  });

  it('compacto e percentuais', () => {
    expect(formatCompact(1284)).toBe('1.284');
    expect(formatCompact(12900)).toBe('12,9 mil');
    expect(formatCompact(4_200_000)).toBe('4,2 mi');
    expect(formatPercent(0.2463)).toBe('24,6%');
    expect(formatSignedPercent(0.164)).toBe('+16,4%');
    expect(formatSignedPercent(-0.03)).toBe('−3%');
  });
});
