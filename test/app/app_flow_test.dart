import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:linker_front/app/app_providers.dart';
import 'package:linker_front/app/linker_app.dart';
import 'package:linker_front/core/app_origin.dart';
import 'package:linker_front/features/auth/data/fake_auth_repository.dart';
import 'package:linker_front/features/auth/presentation/controllers/session_controller.dart';
import 'package:linker_front/features/auth/presentation/pages/login_page_mobile.dart';
import 'package:linker_front/features/auth/presentation/pages/login_page_web.dart';
import 'package:linker_front/features/home/presentation/pages/home_stub_page.dart';
import 'package:linker_front/features/splash/presentation/pages/splash_page.dart';

Future<void> _pumpApp(WidgetTester tester, AppOrigin origin) {
  return tester.pumpWidget(
    ProviderScope(
      overrides: [
        appOriginProvider.overrideWithValue(origin),
        authRepositoryProvider.overrideWithValue(
          FakeAuthRepository(latency: Duration.zero),
        ),
      ],
      child: const LinkerApp(),
    ),
  );
}

void main() {
  testWidgets('mobile: splash aparece e dá lugar ao login', (tester) async {
    await _pumpApp(tester, AppOrigin.mobile);

    await tester.pump();
    expect(find.byType(SplashPage), findsOneWidget);
    expect(find.byType(LoginPageMobile), findsNothing);

    // Cobre o tempo mínimo de splash (1200ms) e a restauração da sessão.
    await tester.pump(const Duration(seconds: 2));
    await tester.pumpAndSettle();

    expect(find.byType(SplashPage), findsNothing);
    expect(find.byType(LoginPageMobile), findsOneWidget);
  });

  testWidgets('web: vai direto para o login, sem splash de marca', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(1400, 900));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await _pumpApp(tester, AppOrigin.web);
    await tester.pumpAndSettle();

    expect(find.byType(SplashPage), findsNothing);
    expect(find.byType(LoginPageWeb), findsOneWidget);
    expect(find.text('Painel do contratador'), findsOneWidget);
  });

  testWidgets('login bem-sucedido leva para a home da origem', (tester) async {
    await _pumpApp(tester, AppOrigin.mobile);
    await tester.pump(const Duration(seconds: 2));
    await tester.pumpAndSettle();

    await tester.enterText(
      find.byKey(const ValueKey('login-email')),
      'contratador@empresa.com',
    );
    await tester.enterText(
      find.byKey(const ValueKey('login-password')),
      '123456',
    );
    await tester.tap(find.byKey(const ValueKey('login-submit')));
    await tester.pumpAndSettle();

    expect(find.byType(HomeStubPage), findsOneWidget);
    expect(find.text('Olá, Contratador.'), findsOneWidget);

    // E o logout devolve para o login, pelo redirect do router.
    await tester.tap(find.byIcon(Icons.logout_rounded));
    await tester.pumpAndSettle();
    expect(find.byType(LoginPageMobile), findsOneWidget);
  });
}
