import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppRoutes } from '@/app-shell/routes';
import { AppSizes, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppLogo } from '@/core/ui/AppLogo';
import { AppText } from '@/core/ui/AppText';

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
          <Animated.View entering={FadeInDown.duration(400)} style={styles.content}>
            <AppLogo size={44} tagline="Para pessoas e empresas reais." />
            <View style={styles.headlineGroup}>
              <AppText variant="title" align="center" accessibilityRole="header">
                Bem-vindo de volta
              </AppText>
              <AppText color="onSurfaceVariant" align="center">
                Entre para ver suas vagas e conversas.
              </AppText>
            </View>
            <LoginForm />
            <View style={styles.signUpRow}>
              <AppText color="onSurfaceVariant">Ainda não tem conta? </AppText>
              <Pressable
                testID="login-go-signup"
                accessibilityRole="link"
                onPress={() => router.push(AppRoutes.cadastro)}
                hitSlop={12}
              >
                <AppText variant="bodyStrong" color="primary">
                  Cadastre-se
                </AppText>
              </Pressable>
            </View>
          </Animated.View>
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
    alignItems: 'center',
    padding: AppSpacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: AppSizes.formMaxWidth,
    gap: AppSpacing.xl,
  },
  headlineGroup: {
    gap: AppSpacing.xs,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
