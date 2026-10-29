import { VAGAS_SEED } from '../../data/fakeFeedRepository';
import { matchesFilters, normalize } from '../feed';

const technova = VAGAS_SEED[0].post; // Desenvolvedor Front-End, TechNova, SP, Híbrido

describe('busca e filtro do feed', () => {
  it('normaliza acentos e caixa', () => {
    expect(normalize('  Híbrido ÁGIL ')).toBe('hibrido agil');
  });

  it('sem filtros, tudo passa', () => {
    expect(matchesFilters(technova, { query: '', uf: null, vagaId: null })).toBe(true);
  });

  it('palavra-chave casa em qualquer campo, sem acento', () => {
    expect(matchesFilters(technova, { query: 'front', uf: null, vagaId: null })).toBe(true);
    expect(matchesFilters(technova, { query: 'technova', uf: null, vagaId: null })).toBe(true);
    expect(matchesFilters(technova, { query: 'hibrido', uf: null, vagaId: null })).toBe(true);
    expect(matchesFilters(technova, { query: 'saude', uf: null, vagaId: null })).toBe(true);
    expect(matchesFilters(technova, { query: 'garçom', uf: null, vagaId: null })).toBe(false);
  });

  it('todas as palavras precisam aparecer', () => {
    expect(matchesFilters(technova, { query: 'front clt', uf: null, vagaId: null })).toBe(true);
    expect(matchesFilters(technova, { query: 'front estágio', uf: null, vagaId: null })).toBe(false);
  });

  it('filtra por região (UF)', () => {
    expect(matchesFilters(technova, { query: '', uf: 'SP', vagaId: null })).toBe(true);
    expect(matchesFilters(technova, { query: '', uf: 'RJ', vagaId: null })).toBe(false);
  });
});
