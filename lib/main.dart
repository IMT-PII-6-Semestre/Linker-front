import 'package:flutter/foundation.dart' show kIsWeb;

import 'app/bootstrap.dart';
import 'core/app_origin.dart';

/// Entrypoint padrão: escolhe a origem pela plataforma, para `flutter run`
/// funcionar sem `-t`. Para forçar uma origem, use `lib/main_web.dart` ou
/// `lib/main_mobile.dart`.
void main() => bootstrap(kIsWeb ? AppOrigin.web : AppOrigin.mobile);
