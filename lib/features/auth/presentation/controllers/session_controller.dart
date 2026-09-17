import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/app_providers.dart';
import '../../../../core/error/result.dart';
import '../../data/fake_auth_repository.dart';
import '../../domain/auth_repository.dart';
import '../../domain/session.dart';

/// Ponto único de troca da implementação: hoje fake, amanhã a API real.
/// Nos testes, sobrescreva com `authRepositoryProvider.overrideWithValue(...)`.
final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => FakeAuthRepository(),
);

/// Sessão atual do app. É a fonte de verdade da guarda de rotas — o
/// `redirect` do go_router escuta este provider, ninguém navega na mão.
final sessionControllerProvider =
    AsyncNotifierProvider<SessionController, Session?>(SessionController.new);

class SessionController extends AsyncNotifier<Session?> {
  @override
  Future<Session?> build() =>
      ref.watch(authRepositoryProvider).restoreSession();

  /// Devolve o [Result] para o formulário conseguir mostrar o erro inline.
  /// Em caso de sucesso o estado muda e o router redireciona sozinho.
  Future<Result<Session>> signIn({
    required String email,
    required String password,
  }) async {
    final result = await ref
        .read(authRepositoryProvider)
        .signIn(
          email: email,
          password: password,
          origin: ref.read(appOriginProvider),
        );

    if (result case Ok(:final value)) {
      state = AsyncData(value);
    }
    return result;
  }

  Future<void> signOut() async {
    await ref.read(authRepositoryProvider).signOut();
    state = const AsyncData(null);
  }
}
