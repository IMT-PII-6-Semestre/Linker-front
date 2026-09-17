import 'package:flutter/material.dart';

import '../../app/theme/app_tokens.dart';

/// Marca do produto. Placeholder desenhado em código até existir o asset final
/// — trocar por `SvgPicture`/`Image.asset` quando o design entregar.
class AppLogo extends StatelessWidget {
  const AppLogo({this.size = 64, this.showWordmark = true, super.key});

  final double size;
  final bool showWordmark;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Semantics(
      label: 'Linker',
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              color: scheme.primary,
              borderRadius: BorderRadius.circular(size * 0.28),
            ),
            child: Icon(
              Icons.link_rounded,
              size: size * 0.55,
              color: scheme.onPrimary,
            ),
          ),
          if (showWordmark) ...[
            const SizedBox(height: AppSpacing.md),
            Text(
              'Linker',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
                letterSpacing: -0.5,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
