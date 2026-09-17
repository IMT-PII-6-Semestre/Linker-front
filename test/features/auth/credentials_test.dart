import 'package:flutter_test/flutter_test.dart';
import 'package:linker_front/features/auth/domain/credentials.dart';

void main() {
  group('Credentials.validateEmail', () {
    test('aceita e-mail bem formado', () {
      expect(Credentials.validateEmail('contratador@empresa.com.br'), isNull);
    });

    test('ignora espaços nas bordas', () {
      expect(Credentials.validateEmail('  a@b.com  '), isNull);
    });

    test('rejeita vazio', () {
      expect(Credentials.validateEmail(''), 'Informe seu e-mail.');
      expect(Credentials.validateEmail(null), 'Informe seu e-mail.');
    });

    test('rejeita formato inválido', () {
      for (final invalid in ['a@b', 'sem-arroba.com', '@b.com', 'a b@c.com']) {
        expect(
          Credentials.validateEmail(invalid),
          'E-mail inválido.',
          reason: 'deveria rejeitar "$invalid"',
        );
      }
    });
  });

  group('Credentials.validatePassword', () {
    test('aceita senha no tamanho mínimo', () {
      expect(Credentials.validatePassword('123456'), isNull);
    });

    test('rejeita senha curta', () {
      expect(
        Credentials.validatePassword('12345'),
        'A senha tem no mínimo 6 caracteres.',
      );
    });

    test('rejeita vazio', () {
      expect(Credentials.validatePassword(''), 'Informe sua senha.');
    });
  });
}
