import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../features/auth/presentation/controllers/session_controller.dart';
import 'app_providers.dart';

/// Tempo mínimo de splash no mobile. Sem isso, em conexão rápida a marca
/// pisca e some — fica com cara de bug.
const Duration _minSplashDuration = Duration(milliseconds: 1200);

/// Inicialização do app: tudo que precisa estar pronto antes da primeira rota.
/// Hoje é só restaurar a sessão; aqui entram depois storage, remote config,
/// crash reporting.
///
/// Usa `ref.read` na sessão de propósito: com `watch`, cada login relançaria a
/// splash.
final appStartupProvider = FutureProvider<void>((ref) async {
  final origin = ref.watch(appOriginProvider);

  await Future.wait<void>([
    ref.read(sessionControllerProvider.future).then((_) {}),
    if (origin.isMobile) Future<void>.delayed(_minSplashDuration),
  ]);
});
