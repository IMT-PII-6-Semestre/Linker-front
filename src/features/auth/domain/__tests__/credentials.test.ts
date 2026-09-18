import { validateEmail, validatePassword } from '../credentials';

describe('validateEmail', () => {
  it('aceita e-mail bem formado', () => {
    expect(validateEmail('contratador@empresa.com.br')).toBeNull();
  });

  it('ignora espaços nas bordas', () => {
    expect(validateEmail('  a@b.com  ')).toBeNull();
  });

  it('rejeita vazio', () => {
    expect(validateEmail('')).toBe('Informe seu e-mail.');
    expect(validateEmail(null)).toBe('Informe seu e-mail.');
  });

  it('rejeita formato inválido', () => {
    for (const invalid of ['a@b', 'sem-arroba.com', '@b.com', 'a b@c.com']) {
      expect(validateEmail(invalid)).toBe('E-mail inválido.');
    }
  });
});

describe('validatePassword', () => {
  it('aceita senha no tamanho mínimo', () => {
    expect(validatePassword('123456')).toBeNull();
  });

  it('rejeita senha curta', () => {
    expect(validatePassword('12345')).toBe('A senha tem no mínimo 6 caracteres.');
  });

  it('rejeita vazio', () => {
    expect(validatePassword('')).toBe('Informe sua senha.');
  });
});
