import '../../../core/app_origin.dart';
import '../../../core/error/failure.dart';
import '../../../core/error/result.dart';
import '../domain/auth_repository.dart';
import '../domain/session.dart';

/// Implementação de mentira, enquanto a API não existe.
///
/// Regras para testar os três estados da tela sem backend:
/// - senha `123456` → sucesso;
/// - e-mail `offline@linker.com` → [NetworkFailure];
/// - qualquer outra senha → [InvalidCredentialsFailure].
///
/// Substituir por `AuthRepositoryImpl` (Dio) quando o contrato de API fechar.
/// A sessão fica só em memória: recarregar a página desloga.
class FakeAuthRepository implements AuthRepository {
  FakeAuthRepository({this.latency = const Duration(milliseconds: 900)});

  final Duration latency;

  Session? _session;

  @override
  Future<Result<Session>> signIn({
    required String email,
    required String password,
    required AppOrigin origin,
  }) async {
    await Future<void>.delayed(latency);

    final normalized = email.trim().toLowerCase();

    if (normalized == 'offline@linker.com') {
      return const Err(NetworkFailure());
    }
    if (password != '123456') {
      return const Err(InvalidCredentialsFailure());
    }

    final session = Session(
      userId: 'fake-${normalized.hashCode.abs()}',
      name: _nameFromEmail(normalized),
      email: normalized,
      token: 'fake-token',
      origin: origin,
    );
    _session = session;
    return Ok(session);
  }

  @override
  Future<Session?> restoreSession() async {
    await Future<void>.delayed(const Duration(milliseconds: 200));
    return _session;
  }

  @override
  Future<void> signOut() async {
    _session = null;
  }

  static String _nameFromEmail(String email) {
    final handle = email.split('@').first.replaceAll(RegExp(r'[._-]+'), ' ');
    return handle
        .split(' ')
        .where((part) => part.isNotEmpty)
        .map((part) => part[0].toUpperCase() + part.substring(1))
        .join(' ');
  }
}
