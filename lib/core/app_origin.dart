/// As duas origens do produto.
///
/// O mesmo código-base atende dois públicos com telas diferentes:
/// o painel web do contratador e o app mobile. Tudo que depende da origem
/// (rotas, layout de login, audiência do token) parte daqui.
enum AppOrigin {
  /// Painel web usado pelo contratador.
  web('contratador'),

  /// Aplicativo mobile.
  mobile('app');

  const AppOrigin(this.audience);

  /// Identificador enviado ao backend para validar a audiência da sessão.
  final String audience;

  bool get isWeb => this == AppOrigin.web;
  bool get isMobile => this == AppOrigin.mobile;
}
