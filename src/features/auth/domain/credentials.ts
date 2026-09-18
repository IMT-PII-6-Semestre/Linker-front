/**
 * Validação de credenciais. Funções puras: testáveis sem componente, e as
 * mesmas regras valem para web e mobile.
 */
const EMAIL_PATTERN = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;

export const MIN_PASSWORD_LENGTH = 6;

/** Retorna a mensagem de erro, ou `null` se o e-mail for válido. */
export function validateEmail(value: string | null | undefined): string | null {
  const email = value?.trim() ?? '';
  if (email.length === 0) return 'Informe seu e-mail.';
  if (!EMAIL_PATTERN.test(email)) return 'E-mail inválido.';
  return null;
}

/** Retorna a mensagem de erro, ou `null` se a senha for válida. */
export function validatePassword(value: string | null | undefined): string | null {
  const password = value ?? '';
  if (password.length === 0) return 'Informe sua senha.';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha tem no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}
