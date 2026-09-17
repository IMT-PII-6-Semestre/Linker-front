import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/app_origin.dart';
import 'app_providers.dart';
import 'linker_app.dart';

/// Sobe o app para uma origem. É o único lugar que chama `runApp` — os
/// entrypoints só dizem qual origem estão subindo.
void bootstrap(AppOrigin origin) {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(
    ProviderScope(
      overrides: [appOriginProvider.overrideWithValue(origin)],
      child: const LinkerApp(),
    ),
  );
}
