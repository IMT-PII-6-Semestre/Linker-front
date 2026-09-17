import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/error/result.dart';
import 'session_controller.dart';

/// Estado do formulário de login. Validação de campo fica no `Form`
/// (`TextFormField.validator`); aqui mora só o que o `Form` não sabe:
/// se o envio está em andamento e qual erro o servidor devolveu.
class LoginFormState {
  const LoginFormState({this.submitting = false, this.failure});

  final bool submitting;
  final Failure? failure;

  bool get hasFailure => failure != null;
}

final loginFormControllerProvider =
    NotifierProvider.autoDispose<LoginFormController, LoginFormState>(
      LoginFormController.new,
    );

class LoginFormController extends Notifier<LoginFormState> {
  @override
  LoginFormState build() => const LoginFormState();

  /// `true` quando autenticou. A navegação é responsabilidade do router.
  Future<bool> submit({required String email, required String password}) async {
    if (state.submitting) return false;
    state = const LoginFormState(submitting: true);

    final result = await ref
        .read(sessionControllerProvider.notifier)
        .signIn(email: email, password: password);

    // A tela pode ter sido descartada durante a chamada: mexer no estado de um
    // notifier morto estoura em runtime.
    if (!ref.mounted) return false;

    switch (result) {
      case Ok():
        return true;
      case Err(:final failure):
        state = LoginFormState(failure: failure);
        return false;
    }
  }

  void clearFailure() {
    if (state.hasFailure) state = const LoginFormState();
  }
}
