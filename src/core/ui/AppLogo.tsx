import { StyleSheet, Text, View } from 'react-native';

import { AppFonts } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

import { safeFont } from './safeFont';

interface AppLogoProps {
  /** Tamanho da fonte do wordmark. */
  size?: number;
  /** Frase de apoio abaixo da marca. */
  tagline?: string;
  /** Branco, para fundos roxos (splash, painel de marca). */
  inverse?: boolean;
}

/**
 * Wordmark "Linker." do protótipo. Trocar por SVG quando houver identidade final.
 * Aparece na splash, antes das fontes carregarem — por isso o safeFont.
 */
export function AppLogo({ size = 32, tagline, inverse = false }: AppLogoProps) {
  const colors = useAppTheme();
  const color = inverse ? colors.onPrimary : colors.primary;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="header"
      accessibilityLabel="Linker"
    >
      <Text
        style={[
          styles.wordmark,
          safeFont(AppFonts.bold, '700'),
          { fontSize: size, lineHeight: size * 1.25, color },
        ]}
      >
        Linker
        <Text style={{ color: inverse ? colors.onPrimary : colors.secondary }}>.</Text>
      </Text>
      {tagline ? (
        <Text
          style={[
            styles.tagline,
            safeFont(AppFonts.regular, '400'),
            { color: inverse ? colors.onPrimary : colors.onSurfaceVariant },
          ]}
        >
          {tagline}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  wordmark: {
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
  },
});
