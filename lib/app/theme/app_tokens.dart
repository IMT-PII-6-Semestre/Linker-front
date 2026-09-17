import 'package:flutter/material.dart';

/// Tokens de layout. Padding e raio saem daqui, não de número mágico no widget.
abstract final class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;
}

abstract final class AppRadius {
  static const Radius card = Radius.circular(16);
  static const BorderRadius input = BorderRadius.all(Radius.circular(12));
  static const BorderRadius button = BorderRadius.all(Radius.circular(12));
}

abstract final class AppBreakpoints {
  /// Acima disso o painel web usa o layout de duas colunas.
  static const double wide = 900;
}

abstract final class AppSizes {
  /// Altura mínima de alvo de toque (Material: 48dp).
  static const double touchTarget = 48;
  static const double buttonHeight = 52;

  /// Largura máxima do formulário — texto muito largo fica ruim de ler.
  static const double formMaxWidth = 420;
}
