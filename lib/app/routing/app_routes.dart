import '../../core/app_origin.dart';

/// Caminhos das rotas. String de rota nunca é escrita direto no widget —
/// no web ela aparece na barra de endereços e vira contrato.
abstract final class AppRoutes {
  static const String login = '/login';

  /// Destino pós-login do painel web.
  static const String painel = '/painel';

  /// Destino pós-login do app mobile.
  static const String inicio = '/inicio';

  static String homeFor(AppOrigin origin) => origin.isWeb ? painel : inicio;
}
