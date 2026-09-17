import '../../../core/app_origin.dart';

/// Sessão autenticada. Sempre válida — se existe uma [Session], há login ativo.
class Session {
  const Session({
    required this.userId,
    required this.name,
    required this.email,
    required this.token,
    required this.origin,
  });

  final String userId;
  final String name;
  final String email;

  /// Token de acesso. Nunca logar, nunca persistir fora de storage seguro.
  final String token;

  /// Origem em que a sessão foi criada. Sessão do painel não vale no app.
  final AppOrigin origin;

  String get firstName => name.split(' ').first;
}
