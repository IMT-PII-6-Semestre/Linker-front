/// Validação de credenciais. Funções puras: testáveis sem widget, e as mesmas
/// regras valem para web e mobile.
abstract final class Credentials {
  static final RegExp _email = RegExp(r'^[\w.+-]+@[\w-]+\.[\w.-]+$');

  static const int minPasswordLength = 6;

  /// Retorna a mensagem de erro, ou `null` se o e-mail for válido.
  static String? validateEmail(String? value) {
    final email = value?.trim() ?? '';
    if (email.isEmpty) return 'Informe seu e-mail.';
    if (!_email.hasMatch(email)) return 'E-mail inválido.';
    return null;
  }

  /// Retorna a mensagem de erro, ou `null` se a senha for válida.
  static String? validatePassword(String? value) {
    final password = value ?? '';
    if (password.isEmpty) return 'Informe sua senha.';
    if (password.length < minPasswordLength) {
      return 'A senha tem no mínimo $minPasswordLength caracteres.';
    }
    return null;
  }
}
