import { maskCep, maskCnpj, maskCpf, maskDate, maskPhone, onlyDigits } from '../masks';

describe('masks', () => {
  it('formata enquanto digita e ignora o que não é dígito', () => {
    expect(maskCpf('5299822')).toBe('529.982.2');
    expect(maskCpf('52998224725')).toBe('529.982.247-25');
    expect(maskCpf('529.982.247-25999')).toBe('529.982.247-25');
    expect(maskCnpj('11222333000181')).toBe('11.222.333/0001-81');
    expect(maskCep('01310100')).toBe('01310-100');
    expect(maskDate('3112')).toBe('31/12');
  });

  it('telefone vira celular a partir de 11 dígitos', () => {
    expect(maskPhone('1134567890')).toBe('(11) 3456-7890');
    expect(maskPhone('11912345678')).toBe('(11) 91234-5678');
  });

  it('onlyDigits remove a pontuação', () => {
    expect(onlyDigits('(11) 91234-5678')).toBe('11912345678');
  });
});
