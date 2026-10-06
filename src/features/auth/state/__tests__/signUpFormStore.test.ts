import { FakeAuthRepository } from '../../data/fakeAuthRepository';
import { toCandidatoSignUp, emptyCandidatoDraft, type CandidatoDraft } from '../../domain/registration';
import { createSessionStore } from '../sessionStore';
import { createSignUpFormStore } from '../signUpFormStore';

const validCandidato: CandidatoDraft = {
  ...emptyCandidatoDraft,
  nomeCompleto: 'Alexandre Silva',
  cpf: '529.982.247-25',
  dataNascimento: '15/03/2000',
  email: 'alexandre@email.com',
  celular: '(11) 91234-5678',
  cargoDesejado: 'Desenvolvedor Front-end',
  escolaridade: 'Superior completo',
  formacao: 'ADS — Fatec',
  cep: '01310-100',
  experiencias: '3 anos com React',
  tiposContrato: ['CLT'],
  modalidades: ['Híbrido'],
  faixaSalarial: 'R$ 6 a 10 mil',
  hardSkills: ['React'],
  softSkills: ['Comunicação'],
  senha: 'segredo1',
  confirmacaoSenha: 'segredo1',
};

function setup(repository = new FakeAuthRepository(0)) {
  const session = createSessionStore(repository, 'mobile');
  const form = createSignUpFormStore(session.getState().signUp);
  return { session, form };
}

describe('signUpFormStore', () => {
  it('não avança com erros e limpa o erro do campo editado', async () => {
    const { form } = setup();
    form.getState().chooseRole('candidato');

    expect(await form.getState().next()).toBe(false);
    expect(form.getState().step).toBe(0);
    expect(form.getState().errors.cpf).toBe('Informe seu CPF.');

    form.getState().updateCandidato({ cpf: '529.982.247-25' });
    expect(form.getState().errors.cpf).toBeUndefined();
    expect(form.getState().errors.email).toBeDefined();
  });

  it('back() na primeira etapa volta para a escolha de perfil', () => {
    const { form } = setup();
    form.getState().chooseRole('empresa');
    form.getState().back();
    expect(form.getState().role).toBeNull();
  });

  it('percorre todas as etapas e cria a sessão de candidato', async () => {
    const { form, session } = setup();
    form.getState().chooseRole('candidato');
    form.getState().updateCandidato(validCandidato);

    for (let i = 0; i < 4; i++) {
      expect(await form.getState().next()).toBe(true);
    }
    expect(form.getState().step).toBe(4);

    expect(await form.getState().next()).toBe(true);
    expect(session.getState().session).toMatchObject({
      name: 'Alexandre Silva',
      email: 'alexandre@email.com',
      role: 'candidato',
    });
  });

  it('e-mail já cadastrado vira failure de conflito', async () => {
    const repository = new FakeAuthRepository(0);
    await repository.signUp({ origin: 'mobile', payload: toCandidatoSignUp(validCandidato) });

    const { form } = setup(repository);
    form.getState().chooseRole('candidato');
    form.getState().updateCandidato(validCandidato);
    for (let i = 0; i < 5; i++) await form.getState().next();

    expect(form.getState().failure?.type).toBe('conflict');
    expect(form.getState().submitting).toBe(false);
  });
});
