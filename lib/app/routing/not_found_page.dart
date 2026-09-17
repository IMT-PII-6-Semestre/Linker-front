import 'package:flutter/material.dart';

import '../theme/app_tokens.dart';

/// 404. No painel web o usuário digita URL na mão — sem isto, ele vê a tela
/// de erro crua do go_router.
class NotFoundPage extends StatelessWidget {
  const NotFoundPage({required this.onGoHome, super.key});

  final VoidCallback onGoHome;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('404', style: Theme.of(context).textTheme.displaySmall),
              const SizedBox(height: AppSpacing.sm),
              const Text('Esta página não existe.'),
              const SizedBox(height: AppSpacing.lg),
              FilledButton(onPressed: onGoHome, child: const Text('Voltar')),
            ],
          ),
        ),
      ),
    );
  }
}
