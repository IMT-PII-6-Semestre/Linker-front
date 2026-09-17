import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/app_origin.dart';
import '../core/ui/startup_error_view.dart';
import '../features/splash/presentation/pages/splash_page.dart';
import '../features/splash/presentation/pages/web_loading_page.dart';
import 'app_providers.dart';
import 'app_startup.dart';
import 'routing/app_router.dart';
import 'theme/app_theme.dart';

/// Raiz das duas origens. Só monta o router depois que a inicialização
/// terminou — assim o `redirect` já enxerga a sessão e não há corrida entre
/// restaurar sessão e decidir a primeira rota.
class LinkerApp extends ConsumerWidget {
  const LinkerApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final origin = ref.watch(appOriginProvider);
    final startup = ref.watch(appStartupProvider);

    return switch (startup) {
      AsyncError() => _shell(
        origin: origin,
        home: StartupErrorView(
          onRetry: () => ref.invalidate(appStartupProvider),
        ),
      ),
      AsyncData() => MaterialApp.router(
        title: _titleFor(origin),
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        darkTheme: AppTheme.dark(),
        routerConfig: ref.watch(routerProvider),
      ),
      _ => _shell(
        origin: origin,
        home: origin.isMobile ? const SplashPage() : const WebLoadingPage(),
      ),
    };
  }

  Widget _shell({required AppOrigin origin, required Widget home}) {
    return MaterialApp(
      title: _titleFor(origin),
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      home: home,
    );
  }

  static String _titleFor(AppOrigin origin) =>
      origin.isWeb ? 'Linker — Painel do contratador' : 'Linker';
}
