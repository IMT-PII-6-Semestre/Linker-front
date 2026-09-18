import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

/**
 * Equivalente da splash no painel web: um loader discreto enquanto a sessão
 * é restaurada. Painel não ganha animação de marca — ninguém quer esperar
 * branding para abrir o trabalho.
 */
export function WebLoadingScreen() {
  const colors = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
