import { NetworkFailure } from '@/core/error/failure';
import { err } from '@/core/error/result';
import type { Session } from '@/features/auth/domain/session';

import { CANDIDATOS_SEED, FakeFeedRepository, VAGAS_SEED } from '../../data/fakeFeedRepository';
import { createFeedStore } from '../feedStore';

const candidato: Session = {
  userId: 'u1',
  name: 'Ana Souza',
  email: 'ana@email.com',
  role: 'candidato',
  token: 't',
  origin: 'mobile',
};
const empresa: Session = { ...candidato, userId: 'e1', name: 'TechNova', role: 'empresa' };

describe('feedStore', () => {
  it('candidato vê vagas; empresa vê currículos', async () => {
    const repo = new FakeFeedRepository(0);
    const forCandidato = createFeedStore(repo);
    await forCandidato.getState().load(candidato);
    expect(forCandidato.getState().posts).toHaveLength(VAGAS_SEED.length);
    expect(forCandidato.getState().posts.every((p) => p.kind === 'vaga')).toBe(true);

    const forEmpresa = createFeedStore(repo);
    await forEmpresa.getState().load(empresa);
    expect(forEmpresa.getState().posts).toHaveLength(CANDIDATOS_SEED.length);
    expect(forEmpresa.getState().posts.every((p) => p.kind === 'candidato')).toBe(true);
  });

  it('curtir quem já curtiu você dá match e avisa o chat', async () => {
    const onMatch = jest.fn();
    const store = createFeedStore(new FakeFeedRepository(0, onMatch));
    await store.getState().load(candidato);
    const top = store.getState().posts[0]; // vaga-1: likesBack

    await store.getState().swipe(candidato, 'like');

    expect(store.getState().match?.post.id).toBe(top.id);
    expect(onMatch).toHaveBeenCalledWith(expect.objectContaining({ post: top, matchId: expect.any(String) }));
    expect(store.getState().posts[0].id).not.toBe(top.id);
  });

  it('passar não dá match e o post não volta ao recarregar', async () => {
    const repo = new FakeFeedRepository(0);
    const store = createFeedStore(repo);
    await store.getState().load(candidato);
    const top = store.getState().posts[0];

    await store.getState().swipe(candidato, 'pass');
    expect(store.getState().match).toBeNull();

    await store.getState().load(candidato, { force: true });
    expect(store.getState().posts.some((p) => p.id === top.id)).toBe(false);
  });

  it('falha no swipe devolve o card ao topo', async () => {
    const repo = new FakeFeedRepository(0);
    jest.spyOn(repo, 'swipe').mockResolvedValueOnce(err(NetworkFailure()));
    const store = createFeedStore(repo);
    await store.getState().load(candidato);
    const top = store.getState().posts[0];

    await store.getState().swipe(candidato, 'like');

    expect(store.getState().posts[0].id).toBe(top.id);
    expect(store.getState().swipeFailure?.type).toBe('network');
  });

  it('filtros recarregam a lista; erro de rede vira estado de erro', async () => {
    const store = createFeedStore(new FakeFeedRepository(0));
    await store.getState().load(candidato);

    await store.getState().setFilters(candidato, { uf: 'RJ' });
    expect(store.getState().posts.map((p) => p.uf)).toEqual(['RJ']);

    await store.getState().setFilters(candidato, { uf: null, query: 'offline' });
    expect(store.getState().status).toBe('error');
    expect(store.getState().failure?.type).toBe('network');
  });

  it('trocar de usuário zera filtros e match', async () => {
    const store = createFeedStore(new FakeFeedRepository(0));
    await store.getState().load(candidato);
    await store.getState().setFilters(candidato, { uf: 'SP' });

    await store.getState().load(empresa);

    expect(store.getState().filters).toEqual({ query: '', uf: null });
    expect(store.getState().posts[0].kind).toBe('candidato');
  });
});
