import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_tokens.dart';
import '../../../../core/ui/failure_banner.dart';
import '../../domain/credentials.dart';
import '../controllers/login_form_controller.dart';

/// Formulário de login compartilhado pelas duas origens.
///
/// Web e mobile mudam a moldura da tela (ver `login_page_web.dart` e
/// `login_page_mobile.dart`), não a lógica: regra de validação, estados e
/// chamada de autenticação vivem aqui uma vez só.
class LoginForm extends ConsumerStatefulWidget {
  const LoginForm({this.submitLabel = 'Entrar', super.key});

  final String submitLabel;

  @override
  ConsumerState<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends ConsumerState<LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _passwordFocus = FocusNode();

  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!(_formKey.currentState?.validate() ?? false)) return;

    await ref
        .read(loginFormControllerProvider.notifier)
        .submit(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );
    // Sucesso não navega daqui: o router reage à mudança de sessão.
    // O erro já está no estado e é renderizado abaixo.
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(loginFormControllerProvider);

    return AutofillGroup(
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (state.failure != null) ...[
              FailureBanner(failure: state.failure!),
              const SizedBox(height: AppSpacing.md),
            ],
            TextFormField(
              key: const ValueKey('login-email'),
              controller: _emailController,
              enabled: !state.submitting,
              autofocus: true,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              autofillHints: const [
                AutofillHints.username,
                AutofillHints.email,
              ],
              autovalidateMode: AutovalidateMode.onUserInteraction,
              validator: Credentials.validateEmail,
              onChanged: (_) =>
                  ref.read(loginFormControllerProvider.notifier).clearFailure(),
              onFieldSubmitted: (_) => _passwordFocus.requestFocus(),
              decoration: const InputDecoration(
                labelText: 'E-mail',
                hintText: 'voce@empresa.com',
                prefixIcon: Icon(Icons.alternate_email_rounded),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            TextFormField(
              key: const ValueKey('login-password'),
              controller: _passwordController,
              focusNode: _passwordFocus,
              enabled: !state.submitting,
              obscureText: _obscurePassword,
              textInputAction: TextInputAction.done,
              autofillHints: const [AutofillHints.password],
              autovalidateMode: AutovalidateMode.onUserInteraction,
              validator: Credentials.validatePassword,
              onChanged: (_) =>
                  ref.read(loginFormControllerProvider.notifier).clearFailure(),
              onFieldSubmitted: (_) => _submit(),
              decoration: InputDecoration(
                labelText: 'Senha',
                prefixIcon: const Icon(Icons.lock_outline_rounded),
                suffixIcon: IconButton(
                  onPressed: () =>
                      setState(() => _obscurePassword = !_obscurePassword),
                  icon: Icon(
                    _obscurePassword
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,
                  ),
                  tooltip: _obscurePassword ? 'Mostrar senha' : 'Ocultar senha',
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            FilledButton(
              key: const ValueKey('login-submit'),
              onPressed: state.submitting ? null : _submit,
              child: state.submitting
                  ? const SizedBox.square(
                      dimension: 22,
                      child: CircularProgressIndicator(strokeWidth: 2.5),
                    )
                  : Text(widget.submitLabel),
            ),
          ],
        ),
      ),
    );
  }
}
