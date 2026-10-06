import { NetworkFailure } from '@/core/error/failure';
import { err } from '@/core/error/result';
import type { Session } from '@/features/auth/domain/session';

import { FakeAdminRepository } from '../../data/fakeAdminRepository';
import { createAdminStore } from '../adminStore';

const admin: Session = {
  userId: 'a1',
  name: 'Admin',
  email: 'admin@linker.com',
  role: 'admin',
  token: 't',
  origin: 'web',
};

describe('adminStore', () => {
  it('admin carrega as métricas da base de exemplo', async () => {
    const store = createAdminStore(new FakeAdminRepository(0));
    await store.getState().load(admin);

    const m = store.getState().metrics!;
    expect(store.getState().status).toBe('data');
    expect(m.totalUsuarios).toBe(1248 + 186);
    expect(m.taxaMatch).toBeCloseTo(2431 / 9870);
    expect(m.matchesPorSemana).toHaveLength(8);
  });

  it('quem não é admin recebe acesso negado', async () => {
    const store = createAdminStore(new FakeAdminRepository(0));
    await store.getState().load({ ...admin, role: 'empresa' });

    expect(store.getState().status).toBe('error');
    expect(store.getState().failure?.type).toBe('unauthorized');
  });

  it('falha ao atualizar mantém os números anteriores na tela', async () => {
    const repo = new FakeAdminRepository(0);
    const store = createAdminStore(repo);
    await store.getState().load(admin);
    const before = store.getState().metrics;

    jest.spyOn(repo, 'metrics').mockResolvedValueOnce(err(NetworkFailure()));
    await store.getState().load(admin);

    expect(store.getState().metrics).toBe(before);
    expect(store.getState().failure?.type).toBe('network');
    expect(store.getState().refreshing).toBe(false);
  });
});
