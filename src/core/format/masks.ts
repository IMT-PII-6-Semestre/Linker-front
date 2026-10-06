/**
 * Máscaras de digitação. Funções puras: recebem o que o usuário digitou
 * (com ou sem pontuação) e devolvem o valor formatado. O dado guardado no
 * formulário é sempre o formatado; quem precisa dos números usa onlyDigits.
 */
export type Mask = (value: string) => string;

export function onlyDigits(value: string): string {
  return value.replace(/\D+/g, '');
}

/** Aplica um padrão onde `#` é um dígito. Corta o excesso. */
function applyPattern(value: string, pattern: string): string {
  const digits = onlyDigits(value);
  let out = '';
  let i = 0;
  for (const char of pattern) {
    if (i >= digits.length) break;
    if (char === '#') {
      out += digits[i];
      i++;
    } else {
      out += char;
    }
  }
  return out;
}

export const maskCpf: Mask = (v) => applyPattern(v, '###.###.###-##');
export const maskCnpj: Mask = (v) => applyPattern(v, '##.###.###/####-##');
export const maskCep: Mask = (v) => applyPattern(v, '#####-###');
export const maskDate: Mask = (v) => applyPattern(v, '##/##/####');

/** Fixo (10 dígitos) ou celular (11 dígitos). */
export const maskPhone: Mask = (v) =>
  onlyDigits(v).length > 10 ? applyPattern(v, '(##) #####-####') : applyPattern(v, '(##) ####-####');
