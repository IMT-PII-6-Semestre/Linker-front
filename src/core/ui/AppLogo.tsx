import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

interface AppLogoProps {
  size?: number;
  showWordmark?: boolean;
}

/**
 * Marca provisória — quadrado colorido com ícone de link. Trocar por uma
 * imagem/SVG quando existir identidade visual real.
 */
export function AppLogo({ size = 72, showWordmark = true }: AppLogoProps) {
  const colors = useAppTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.mark,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: colors.primary,
          },
        ]}
      >
        <MaterialIcons name="link" size={size * 0.55} color={colors.onPrimary} />
      </View>
      {showWordmark ? (
        <Text style={[styles.wordmark, { color: colors.onSurface }]}>Linker</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontSize: 20,
    fontWeight: '700',
  },
});
