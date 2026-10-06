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

describe('FakeAuthRepository — papéis e cadastro', () => {
  it('deduz o papel pelo e-mail', async () => {
    const repository = new FakeAuthRepository(0);
    const roleOf = async (email: string) => {
      const result = await repository.signIn({ email, password: '123456', origin: 'mobile' });
      if (result.kind !== 'ok') throw new Error('expected ok');
      return result.value.role;
    };
    expect(await roleOf('admin@linker.com')).toBe('admin');
    expect(await roleOf('rh@minhaempresa.com')).toBe('empresa');
    expect(await roleOf('ana@gmail.com')).toBe('candidato');
  });

  it('conta cadastrada entra com a senha dela, não com a de demonstração', async () => {
    const repository = new FakeAuthRepository(0);
    const signUp = await repository.signUp({
      origin: 'mobile',
      payload: {
        role: 'empresa',
        cnpj: '11.222.333/0001-81',
        nomeEmpresa: 'TechNova',
        dataFundacao: '01/01/2010',
        endereco: 'Rua A, 1',
        telefone: '(11) 3456-7890',
        email: 'rh@technova.com',
        senha: 'minhasenha',
        vaga: {
          cargo: 'Dev',
          descricao: 'Front-end',
          beneficios: 'VR',
          horario: '9h às 18h',
          escolaridade: 'Médio',
          tipoContrato: 'CLT',
          modalidade: 'Remoto',
          faixaSalarial: 'A combinar',
        },
      },
    });
    expect(signUp.kind).toBe('ok');
    if (signUp.kind === 'ok') {
      expect(signUp.value).toMatchObject({ name: 'TechNova', role: 'empresa' });
    }

    const demo = await repository.signIn({ email: 'rh@technova.com', password: '123456', origin: 'mobile' });
    expect(demo.kind).toBe('err');
    const real = await repository.signIn({
      email: 'rh@technova.com',
      password: 'minhasenha',
      origin: 'mobile',
    });
    expect(real.kind).toBe('ok');
  });
});
