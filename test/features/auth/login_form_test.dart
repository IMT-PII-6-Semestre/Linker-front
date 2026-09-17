import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:linker_front/app/app_providers.dart';
import 'package:linker_front/app/theme/app_theme.dart';
import 'package:linker_front/core/app_origin.dart';
import 'package:linker_front/features/auth/data/fake_auth_repository.dart';
import 'package:linker_front/features/auth/presentation/controllers/session_controller.dart';
import 'package:linker_front/features/auth/presentation/pages/login_page_mobile.dart';

Future<void> _pumpLogin(WidgetTester tester) {
  return tester.pumpWidget(
    ProviderScope(
      overrides: [
        appOriginProvider.overrideWithValue(AppOrigin.mobile),
        authRepositoryProvider.overrideWithValue(
          FakeAuthRepository(latency: Duration.zero),
        ),
      ],
      child: MaterialApp(
        theme: AppTheme.light(),
        home: const LoginPageMobile(),
      ),
    ),
  );
}

void main() {
  const emailField = ValueKey('login-email');
  const passwordField = ValueKey('login-password');
  const submitButton = ValueKey('login-submit');

  testWidgets('não envia com e-mail inválido e mostra o erro do campo', (
    tester,
  ) async {
    await _pumpLogin(tester);

    await tester.enterText(find.byKey(emailField), 'sem-arroba');
    await tester.enterText(find.byKey(passwordField), '123456');
    await tester.tap(find.byKey(submitButton));
    await tester.pumpAndSettle();

    expect(find.text('E-mail inválido.'), findsOneWidget);
    expect(find.byKey(const ValueKey('failure-banner')), findsNothing);
  });

  testWidgets('mostra a falha do servidor quando a senha está errada', (
    tester,
  ) async {
    await _pumpLogin(tester);

    await tester.enterText(find.byKey(emailField), 'contratador@empresa.com');
    await tester.enterText(find.byKey(passwordField), 'senha-errada');
    await tester.tap(find.byKey(submitButton));
    await tester.pumpAndSettle();

    expect(find.byKey(const ValueKey('failure-banner')), findsOneWidget);
    expect(find.text('E-mail ou senha incorretos.'), findsOneWidget);
  });

  testWidgets('limpa a falha ao editar o formulário de novo', (tester) async {
    await _pumpLogin(tester);

    await tester.enterText(find.byKey(emailField), 'contratador@empresa.com');
    await tester.enterText(find.byKey(passwordField), 'senha-errada');
    await tester.tap(find.byKey(submitButton));
    await tester.pumpAndSettle();
    expect(find.byKey(const ValueKey('failure-banner')), findsOneWidget);

    await tester.enterText(find.byKey(passwordField), '123456');
    await tester.pump();

    expect(find.byKey(const ValueKey('failure-banner')), findsNothing);
  });
}
