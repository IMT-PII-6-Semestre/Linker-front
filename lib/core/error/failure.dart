/// Erro de domínio. Nenhuma exceção de transporte (Dio, socket, parsing)
/// atravessa a camada `data` — ela vira uma destas antes de chegar na UI.
sealed class Failure {
  const Failure(this.message);

  /// Mensagem pronta para exibir ao usuário.
  final String message;
}

final class NetworkFailure extends Failure {
  const NetworkFailure([
    super.message = 'Sem conexão. Verifique sua internet.',
  ]);
}

final class InvalidCredentialsFailure extends Failure {
  const InvalidCredentialsFailure([
    super.message = 'E-mail ou senha incorretos.',
  ]);
}

final class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure([
    super.message = 'Sua sessão expirou. Entre novamente.',
  ]);
}

final class ServerFailure extends Failure {
  const ServerFailure(
    this.statusCode, [
    super.message = 'Erro no servidor. Tente de novo em instantes.',
  ]);

  final int statusCode;
}

final class UnexpectedFailure extends Failure {
  const UnexpectedFailure([
    super.message = 'Algo deu errado. Tente novamente.',
  ]);
}
