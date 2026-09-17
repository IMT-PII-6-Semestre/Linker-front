import 'app/bootstrap.dart';
import 'core/app_origin.dart';

/// Entrypoint do painel web do contratador.
///
///     flutter run -d chrome -t lib/main_web.dart
void main() => bootstrap(AppOrigin.web);
