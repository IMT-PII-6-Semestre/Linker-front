import '../../../core/app_origin.dart';
import '../../../core/error/result.dart';
import 'session.dart';

/// Contrato de autenticação. A camada de apresentação conhece só isto —
/// trocar o fake pela API real não toca em nenhuma tela.
abstract interface class AuthRepository {
  /// Autentica na origem informada. O backend valida se aquele usuário pode
  /// entrar por ali (contratador no painel, usuário do app no mobile).
  Future<Result<Session>> signIn({
    required String email,
    required String password,
    required AppOrigin origin,
  });

  /// Sessão persistida de execuções anteriores, ou `null` se não houver.
  Future<Session?> restoreSession();

  Future<void> signOut();
}
