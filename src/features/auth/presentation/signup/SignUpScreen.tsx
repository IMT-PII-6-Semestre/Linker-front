import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from 'zustand';

import { useSessionStore } from '@/app-shell/AppProviders';
import { AppRoutes } from '@/app-shell/routes';
import { AppSizes, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppLogo } from '@/core/ui/AppLogo';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { FailureBanner } from '@/core/ui/FailureBanner';

import { createSignUpFormStore, stepsFor, type SignUpRole } from '../../state/signUpFormStore';

import { CandidatoStepFields } from './CandidatoStepFields';
import { EmpresaStepFields } from './EmpresaStepFields';
import { RoleChoice } from './RoleChoice';
import { WizardProgress } from './WizardProgress';

/**
 * Página 1 — Cadastro. Primeiro a pergunta "o que você está buscando?";
 * depois um wizard por etapas (fluxo A candidato / fluxo B empresa).
 * Ao concluir, o signUp cria a sessão e o guard do _layout redireciona.
 */
export function SignUpScreen() {
  const colors = useAppTheme();
  const signUp = useSessionStore((s) => s.signUp);
  const [store] = useState(() => createSignUpFormStore(signUp));

  const role = useStore(store, (s) => s.role);
  const step = useStore(store, (s) => s.step);
  const candidato = useStore(store, (s) => s.candidato);
  const empresa = useStore(store, (s) => s.empresa);
  const errors = useStore(store, (s) => s.errors);
  const submitting = useStore(store, (s) => s.submitting);
  const failure = useStore(store, (s) => s.failure);
  const { chooseRole, updateCandidato, updateEmpresa, next, back } = store.getState();

  const [selectedRole, setSelectedRole] = useState<SignUpRole | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const steps = role ? stepsFor(role) : null;
  const isLastStep = steps != null && step === steps.length - 1;

  // Nova etapa começa do topo.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [role, step]);

  // Botão "voltar" do Android volta uma etapa em vez de sair do cadastro.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (store.getState().role === null) return false;
      store.getState().back();
      return true;
    });
    return () => sub.remove();
  }, [store]);

  const goToLogin = () => router.replace(AppRoutes.login);

  const handleBack = () => (role === null ? goToLogin() : back());

  const handleNext = async () => {
    Keyboard.dismiss();
    const advanced = await next();
    // Erro de campo: rola para o topo, onde está o primeiro campo inválido.
    if (!advanced) scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={role === null ? 'Voltar para o login' : 'Voltar para a etapa anterior'}
          onPress={handleBack}
          hitSlop={8}
          style={styles.backButton}
          testID="signup-back"
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        {steps ? <WizardProgress step={step} total={steps.length} /> : null}
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {role === null || steps === null ? (
              <Animated.View key="role" entering={FadeInRight.duration(250)} style={styles.section}>
                <AppLogo size={36} tagline="Para pessoas e empresas reais." />
                <AppText variant="heading" align="center" accessibilityRole="header">
                  O que você está buscando?
                </AppText>
                <RoleChoice value={selectedRole} onChange={setSelectedRole} />
                <Button
                  testID="signup-role-continue"
                  label="Continuar"
                  disabled={selectedRole === null}
                  accessibilityHint={selectedRole === null ? 'Escolha uma opção acima' : undefined}
                  onPress={() => selectedRole && chooseRole(selectedRole)}
                />
                <View style={styles.loginRow}>
                  <AppText color="onSurfaceVariant">Já tem conta? </AppText>
                  <Pressable accessibilityRole="link" onPress={goToLogin} hitSlop={12}>
                    <AppText variant="bodyStrong" color="primary">
                      Entrar
                    </AppText>
                  </Pressable>
                </View>
              </Animated.View>
            ) : (
              <Animated.View
                key={`${role}-${step}`}
                entering={FadeInRight.duration(250)}
                style={styles.section}
              >
                <View style={styles.headline}>
                  <AppText variant="title" accessibilityRole="header">
                    {steps[step].title}
                  </AppText>
                  <AppText color="onSurfaceVariant">{steps[step].subtitle}</AppText>
                </View>

                {failure ? <FailureBanner failure={failure} /> : null}

                {role === 'candidato' ? (
                  <CandidatoStepFields
                    step={step}
                    draft={candidato}
                    errors={errors}
                    onChange={updateCandidato}
                    onSubmit={handleNext}
                  />
                ) : (
                  <EmpresaStepFields
                    step={step}
                    draft={empresa}
                    errors={errors}
                    onChange={updateEmpresa}
                    onSubmit={handleNext}
                  />
                )}

                <Button
                  testID="signup-next"
                  label={isLastStep ? 'Criar conta e entrar' : 'Continuar'}
                  icon={isLastStep ? undefined : 'arrow-forward'}
                  loading={submitting}
                  onPress={handleNext}
                  style={styles.nextButton}
                />
              </Animated.View>
            )}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.md,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
  },
  backButton: {
    width: AppSizes.touchTarget,
    height: AppSizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: AppSpacing.lg,
    paddingBottom: AppSpacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: AppSizes.formMaxWidth,
  },
  section: {
    gap: AppSpacing.lg,
  },
  headline: {
    gap: AppSpacing.xs,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    marginTop: AppSpacing.sm,
  },
});
