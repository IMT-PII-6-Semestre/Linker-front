import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

import { Button } from './Button';

interface StartupErrorViewProps {
  onRetry: () => void;
}

/**
 * Falha na inicialização do app (restaurar sessão, ler storage). Sem retry o
 * usuário fica preso numa tela morta.
 */
export function StartupErrorView({ onRetry }: StartupErrorViewProps) {
  const colors = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <MaterialIcons name="cloud-off" size={48} color={colors.outline} />
        <Text style={[styles.title, { color: colors.onSurface }]}>
          Não foi possível iniciar o Linker.
        </Text>
        <Button label="Tentar novamente" onPress={onRetry} testID="startup-retry" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: AppSpacing.md,
    padding: AppSpacing.lg,
    maxWidth: 360,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
