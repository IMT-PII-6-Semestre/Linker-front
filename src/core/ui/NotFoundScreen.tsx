import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppFonts, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

import { Button } from './Button';

interface NotFoundScreenProps {
  onGoHome: () => void;
}

/**
 * 404. No painel web o usuário digita URL na mão — sem isto, ele vê a tela
 * de erro crua do Expo Router.
 */
export function NotFoundScreen({ onGoHome }: NotFoundScreenProps) {
  const colors = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <Text style={[styles.code, { color: colors.onSurface }]}>404</Text>
        <Text style={{ color: colors.onSurface }}>Esta página não existe.</Text>
        <Button label="Voltar" onPress={onGoHome} testID="not-found-go-home" />
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
    gap: AppSpacing.sm,
    padding: AppSpacing.lg,
  },
  code: {
    fontFamily: AppFonts.bold,
    fontSize: 36,
  },
});
