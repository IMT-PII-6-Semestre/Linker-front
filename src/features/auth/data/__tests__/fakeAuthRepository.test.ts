import { FakeAuthRepository } from '../fakeAuthRepository';

describe('FakeAuthRepository', () => {
  let repository: FakeAuthRepository;

  beforeEach(() => {
    repository = new FakeAuthRepository(0);
  });

  it('autentica com a senha de demonstração e guarda a origem', async () => {
    const result = await repository.signIn({
      email: 'Maria.Souza@Empresa.com',
      password: '123456',
      origin: 'web',
    });

    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') throw new Error('expected ok');
    expect(result.value.email).toBe('maria.souza@empresa.com');
    expect(result.value.name).toBe('Maria Souza');
    expect(result.value.origin).toBe('web');
  });

  it('devolve credencial inválida quando a senha não confere', async () => {
    const result = await repository.signIn({ email: 'a@b.com', password: 'errada', origin: 'mobile' });

    expect(result.kind).toBe('err');
    if (result.kind !== 'err') throw new Error('expected err');
    expect(result.failure.type).toBe('invalidCredentials');
  });

  it('simula falha de rede no e-mail reservado', async () => {
    const result = await repository.signIn({
      email: 'offline@linker.com',
      password: '123456',
      origin: 'mobile',
    });

    expect(result.kind).toBe('err');
    if (result.kind !== 'err') throw new Error('expected err');
    expect(result.failure.type).toBe('network');
  });

  it('restoreSession devolve null antes do login e a sessão depois', async () => {
    expect(await repository.restoreSession()).toBeNull();

    await repository.signIn({ email: 'a@b.com', password: '123456', origin: 'mobile' });
    expect(await repository.restoreSession()).not.toBeNull();

    await repository.signOut();
    expect(await repository.restoreSession()).toBeNull();
  });
});
