import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/app_origin.dart';

/// Origem em execução. Cada entrypoint sobrescreve este provider no
/// `ProviderScope` — é o que faz web e mobile divergirem sem `if` espalhado.
final appOriginProvider = Provider<AppOrigin>(
  (ref) => throw UnimplementedError(
    'Sobrescreva appOriginProvider no ProviderScope do entrypoint '
    '(veja lib/main_web.dart e lib/main_mobile.dart).',
  ),
);
