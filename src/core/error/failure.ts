/**
 * Erro de domínio. Nenhuma exceção de transporte atravessa a camada `data` —
 * ela vira uma destas antes de chegar na UI.
 */
export type Failure =
  | { type: 'network'; message: string }
  | { type: 'invalidCredentials'; message: string }
  | { type: 'unauthorized'; message: string }
  | { type: 'conflict'; message: string }
  | { type: 'server'; statusCode: number; message: string }
  | { type: 'unexpected'; message: string };

export function NetworkFailure(message = 'Sem conexão. Verifique sua internet.'): Failure {
  return { type: 'network', message };
}

export function InvalidCredentialsFailure(message = 'E-mail ou senha incorretos.'): Failure {
  return { type: 'invalidCredentials', message };
}

export function UnauthorizedFailure(message = 'Sua sessão expirou. Entre novamente.'): Failure {
  return { type: 'unauthorized', message };
}

/** O recurso já existe (ex.: e-mail já cadastrado). */
export function ConflictFailure(message = 'Este e-mail já está cadastrado.'): Failure {
  return { type: 'conflict', message };
}

export function ServerFailure(
  statusCode: number,
  message = 'Erro no servidor. Tente de novo em instantes.',
): Failure {
  return { type: 'server', statusCode, message };
}

export function UnexpectedFailure(message = 'Algo deu errado. Tente novamente.'): Failure {
  return { type: 'unexpected', message };
}
