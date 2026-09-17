import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/app_origin.dart';
import '../../features/auth/domain/session.dart';
import '../../features/auth/presentation/controllers/session_controller.dart';
import '../../features/auth/presentation/pages/login_page_mobile.dart';
import '../../features/auth/presentation/pages/login_page_web.dart';
import '../../features/home/presentation/pages/home_stub_page.dart';
import '../app_providers.dart';
import 'app_routes.dart';
import 'not_found_page.dart';

/// Router de cada origem. A guarda de autenticação vive num único `redirect`
/// que escuta a sessão — nenhuma tela navega por conta própria no `initState`.
final routerProvider = Provider<GoRouter>((ref) {
  final origin = ref.watch(appOriginProvider);
  final home = AppRoutes.homeFor(origin);

  // Ponte entre o provider de sessão e o `refreshListenable` do go_router.
  final sessionListenable = ValueNotifier<Session?>(
    ref.read(sessionControllerProvider).value,
  );
  ref.listen<AsyncValue<Session?>>(
    sessionControllerProvider,
    (_, next) => sessionListenable.value = next.value,
  );
  ref.onDispose(sessionListenable.dispose);

  return GoRouter(
    initialLocation: AppRoutes.login,
    refreshListenable: sessionListenable,
    debugLogDiagnostics: kDebugMode,
    redirect: (context, state) {
      final isLoggedIn = sessionListenable.value != null;
      final location = state.matchedLocation;

      if (!isLoggedIn) {
        return location == AppRoutes.login ? null : AppRoutes.login;
      }
      if (location == AppRoutes.login || location == '/') return home;
      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => switch (origin) {
          AppOrigin.web => const LoginPageWeb(),
          AppOrigin.mobile => const LoginPageMobile(),
        },
      ),
      GoRoute(
        path: home,
        builder: (context, state) => HomeStubPage(
          title: origin.isWeb ? 'Painel do contratador' : 'Início',
        ),
      ),
    ],
    errorBuilder: (context, state) =>
        NotFoundPage(onGoHome: () => context.go(AppRoutes.login)),
  );
});
