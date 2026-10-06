import {
  CANDIDATO_STEPS,
  EMPRESA_STEPS,
  emptyCandidatoDraft,
  emptyEmpresaDraft,
  toEmpresaSignUp,
  validateBirthDate,
  validateCep,
  validateCnpj,
  validateCpf,
  validateFoundationDate,
  validateFullName,
  validateMobilePhone,
  validatePasswordConfirmation,
} from '../registration';

const today = new Date(2026, 9, 6);

describe('validadores de cadastro', () => {
  it('CPF: confere os dígitos verificadores', () => {
    expect(validateCpf('529.982.247-25')).toBeNull();
    expect(validateCpf('529.982.247-24')).toBe('CPF inválido.');
    expect(validateCpf('111.111.111-11')).toBe('CPF inválido.');
    expect(validateCpf('')).toBe('Informe seu CPF.');
  });

  it('CNPJ: confere os dígitos verificadores', () => {
    expect(validateCnpj('11.222.333/0001-81')).toBeNull();
    expect(validateCnpj('11.222.333/0001-80')).toBe('CNPJ inválido.');
    expect(validateCnpj('00.000.000/0000-00')).toBe('CNPJ inválido.');
  });

  it('nome completo exige sobrenome', () => {
    expect(validateFullName('Ana')).toBe('Informe nome e sobrenome.');
    expect(validateFullName('  Ana   Souza ')).toBeNull();
  });

  it('CEP e celular', () => {
    expect(validateCep('01310-100')).toBeNull();
    expect(validateCep('0131')).toBe('CEP deve ter 8 dígitos.');
    expect(validateMobilePhone('(11) 91234-5678')).toBeNull();
    expect(validateMobilePhone('(11) 3456-7890')).toMatch(/Celular inválido/);
  });

  it('data de nascimento: formato, data real e idade mínima', () => {
    expect(validateBirthDate('15/03/2000', today)).toBeNull();
    expect(validateBirthDate('31/02/2000', today)).toMatch(/Data inválida/);
    expect(validateBirthDate('01/01/2020', today)).toMatch(/pelo menos 14 anos/);
    // Faz 14 anos amanhã: ainda não pode.
    expect(validateBirthDate('07/10/2012', today)).toMatch(/pelo menos 14 anos/);
    expect(validateBirthDate('06/10/2012', today)).toBeNull();
  });

  it('data de fundação não pode estar no futuro', () => {
    expect(validateFoundationDate('01/01/2010', today)).toBeNull();
    expect(validateFoundationDate('01/01/2030', today)).toMatch(/futuro/);
  });

  it('confirmação de senha', () => {
    expect(validatePasswordConfirmation('123456', '123456')).toBeNull();
    expect(validatePasswordConfirmation('123456', '654321')).toBe('As senhas não conferem.');
  });
});

describe('etapas do wizard', () => {
  it('cada etapa valida só os próprios campos', () => {
    const errors = CANDIDATO_STEPS[0].validate(emptyCandidatoDraft);
    expect(Object.keys(errors).sort()).toEqual(
      ['celular', 'cpf', 'dataNascimento', 'email', 'nomeCompleto'].sort(),
    );
  });

  it('listas vazias e opções não escolhidas contam como erro', () => {
    const errors = CANDIDATO_STEPS[2].validate(emptyCandidatoDraft);
    expect(errors.tiposContrato).toBeDefined();
    expect(errors.modalidades).toBeDefined();
    expect(errors.faixaSalarial).toBeDefined();
  });

  it('toEmpresaSignUp monta a vaga e normaliza o e-mail', () => {
    const payload = toEmpresaSignUp({
      ...emptyEmpresaDraft,
      cnpj: '11.222.333/0001-81',
      nomeEmpresa: ' TechNova ',
      email: 'RH@TechNova.com ',
      cargo: 'Dev',
      escolaridade: 'Médio',
      tipoContrato: 'CLT',
      modalidade: 'Remoto',
      faixaSalarial: 'A combinar',
    });
    expect(payload.role).toBe('empresa');
    expect(payload.email).toBe('rh@technova.com');
    expect(payload.nomeEmpresa).toBe('TechNova');
    expect(payload.vaga.modalidade).toBe('Remoto');
    expect(EMPRESA_STEPS).toHaveLength(4);
  });
});
