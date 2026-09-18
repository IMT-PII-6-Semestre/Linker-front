import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppLogo } from '@/core/ui/AppLogo';

import { LoginForm } from './LoginForm';

/**
 * Login do app mobile. Rola para o teclado não cobrir os campos e respeita
 * a safe area (notch e barra de gestos).
 */
export function LoginScreenMobile() {
  const colors = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <AppLogo size={72} />
            <View style={styles.headlineGroup}>
              <Text style={[styles.headline, { color: colors.onSurface }]}>Bem-vindo de volta</Text>
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                Entre para continuar.
              </Text>
            </View>
            <LoginForm />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: AppSpacing.lg,
  },
  content: {
    gap: AppSpacing.xl,
  },
  headlineGroup: {
    gap: AppSpacing.xs,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
