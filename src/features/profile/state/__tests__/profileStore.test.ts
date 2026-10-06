import { FakeAuthRepository } from '@/features/auth/data/fakeAuthRepository';
import { emptyCandidatoDraft, toCandidatoSignUp } from '@/features/auth/domain/registration';
import type { Session } from '@/features/auth/domain/session';

import { FakeProfileRepository } from '../../data/fakeProfileRepository';
import { createProfileStore } from '../profileStore';

const session = (overrides: Partial<Session> = {}): Session => ({
  userId: 'u1',
  name: 'Ana Souza',
  email: 'ana@email.com',
  role: 'candidato',
  token: 't',
  origin: 'mobile',
  ...overrides,
});

describe('profileStore', () => {
  it('carrega um perfil de demonstração para contas de exemplo', async () => {
    const store = createProfileStore(new FakeProfileRepository(0));
    await store.getState().load(session());

    expect(store.getState().status).toBe('data');
    expect(store.getState().profile).toMatchObject({ role: 'candidato', nomeCompleto: 'Ana Souza' });
  });

  it('empresa ganha perfil com vagas; admin não tem perfil', async () => {
    const store = createProfileStore(new FakeProfileRepository(0));
    await store.getState().load(session({ userId: 'e1', role: 'empresa' }));
    expect(store.getState().profile?.role).toBe('empresa');

    await store.getState().load(session({ userId: 'a1', role: 'admin' }));
    expect(store.getState().status).toBe('error');
    expect(store.getState().profile).toBeNull();
  });

  it('não recarrega o mesmo usuário, mas troca ao mudar de conta', async () => {
    const repo = new FakeProfileRepository(0);
    const spy = jest.spyOn(repo, 'getProfile');
    const store = createProfileStore(repo);

    await store.getState().load(session());
    await store.getState().load(session());
    expect(spy).toHaveBeenCalledTimes(1);

    await store.getState().load(session({ userId: 'u2', name: 'Bruno Lima' }));
    expect(spy).toHaveBeenCalledTimes(2);
    expect(store.getState().profile).toMatchObject({ nomeCompleto: 'Bruno Lima' });
  });

  it('save atualiza o perfil exibido', async () => {
    const store = createProfileStore(new FakeProfileRepository(0));
    await store.getState().load(session());
    const profile = store.getState().profile!;

    const result = await store.getState().save({ ...profile, fotoUri: 'file://nova.jpg' });

    expect(result.kind).toBe('ok');
    expect(store.getState().profile?.fotoUri).toBe('file://nova.jpg');
  });

  it('o perfil de quem se cadastrou vem com os dados do cadastro', async () => {
    const profiles = new FakeProfileRepository(0);
    const auth = new FakeAuthRepository(0, (s, p) => profiles.seedFromSignUp(s, p));
    const signUp = await auth.signUp({
      origin: 'mobile',
      payload: toCandidatoSignUp({
        ...emptyCandidatoDraft,
        nomeCompleto: 'Carla Dias',
        email: 'carla@email.com',
        escolaridade: 'Médio',
        faixaSalarial: 'A combinar',
        cargoDesejado: 'Vendedora',
        hardSkills: ['Vendas'],
        senha: 'segredo1',
      }),
    });
    if (signUp.kind !== 'ok') throw new Error('expected ok');

    const store = createProfileStore(profiles);
    await store.getState().load(signUp.value);

    expect(store.getState().profile).toMatchObject({
      nomeCompleto: 'Carla Dias',
      cargoDesejado: 'Vendedora',
      hardSkills: ['Vendas'],
      fotoUri: null,
    });
    expect(store.getState().profile).not.toHaveProperty('senha');
  });
});
