import 'package:flutter/material.dart';

import '../../../../app/theme/app_tokens.dart';
import '../../../../core/ui/app_logo.dart';
import '../widgets/login_form.dart';

/// Login do painel web do contratador.
///
/// Acima de [AppBreakpoints.wide] usa duas colunas (marca + formulário);
/// abaixo, vira uma coluna só — o painel também abre em tablet e janela
/// estreita.
class LoginPageWeb extends StatelessWidget {
  const LoginPageWeb({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isWide = constraints.maxWidth >= AppBreakpoints.wide;
          if (!isWide) return const _FormPane(showLogo: true);

          return const Row(
            children: [
              Expanded(child: _BrandPane()),
              Expanded(child: _FormPane(showLogo: false)),
            ],
          );
        },
      ),
    );
  }
}

class _BrandPane extends StatelessWidget {
  const _BrandPane();

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [scheme.primary, scheme.primaryContainer],
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const AppLogo(size: 56, showWordmark: false),
            const SizedBox(height: AppSpacing.xl),
            Text(
              'Painel do contratador',
              style: Theme.of(context).textTheme.displaySmall?.copyWith(
                color: scheme.onPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              'Acompanhe suas contratações em um só lugar.',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: scheme.onPrimary.withValues(alpha: 0.85),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FormPane extends StatelessWidget {
  const _FormPane({required this.showLogo});

  final bool showLogo;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: AppSizes.formMaxWidth),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (showLogo) ...[
                const Center(child: AppLogo(size: 56)),
                const SizedBox(height: AppSpacing.xl),
              ],
              Text(
                'Entrar no painel',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                'Use o e-mail cadastrado na sua empresa.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              const LoginForm(submitLabel: 'Entrar no painel'),
            ],
          ),
        ),
      ),
    );
  }
}
