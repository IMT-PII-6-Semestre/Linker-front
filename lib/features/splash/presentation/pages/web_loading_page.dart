import 'package:flutter/material.dart';

/// Equivalente da splash no painel web: um loader discreto enquanto a sessão
/// é restaurada. Painel não ganha animação de marca — ninguém quer esperar
/// branding para abrir o trabalho.
class WebLoadingPage extends StatelessWidget {
  const WebLoadingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: SizedBox.square(
          dimension: 28,
          child: CircularProgressIndicator(strokeWidth: 3),
        ),
      ),
    );
  }
}
