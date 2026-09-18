import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBreakpoints, AppSizes, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppLogo } from '@/core/ui/AppLogo';

import { LoginForm } from './LoginForm';

/**
 * Login do painel web do contratador.
 *
 * Acima de AppBreakpoints.wide usa duas colunas (marca + formulário);
 * abaixo, vira uma coluna só — o painel também abre em tablet e janela
 * estreita.
 */
export function LoginScreenWeb() {
  const { width } = useWindowDimensions();
  const isWide = width >= AppBreakpoints.wide;

  if (!isWide) {
    return <FormPane showLogo />;
  }

  return (
    <View style={styles.row}>
      <View style={styles.half}>
        <BrandPane />
      </View>
      <View style={styles.half}>
        <FormPane showLogo={false} />
      </View>
    </View>
  );
}

function BrandPane() {
  const colors = useAppTheme();

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryContainer]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.brandPane}
    >
      <AppLogo size={56} showWordmark={false} />
      <Text style={[styles.brandHeadline, { color: colors.onPrimary }]}>Painel do contratador</Text>
      <Text style={[styles.brandSubtitle, { color: colors.onPrimary }]}>
        Acompanhe suas contratações em um só lugar.
      </Text>
    </LinearGradient>
  );
}

function FormPane({ showLogo }: { showLogo: boolean }) {
  const colors = useAppTheme();

  return (
    <SafeAreaView style={[styles.formPaneContainer, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.formScrollContent}>
        <View style={[styles.formContent, { maxWidth: AppSizes.formMaxWidth }]}>
          {showLogo ? (
            <View style={styles.logoWrapper}>
              <AppLogo size={56} />
            </View>
          ) : null}
          <View style={styles.headlineGroup}>
            <Text style={[styles.headline, { color: colors.onSurface }]}>Entrar no painel</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              Use o e-mail cadastrado na sua empresa.
            </Text>
          </View>
          <LoginForm submitLabel="Entrar no painel" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  half: {
    flex: 1,
  },
  brandPane: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: AppSpacing.xxl,
  },
  brandHeadline: {
    marginTop: AppSpacing.xl,
    fontSize: 32,
    fontWeight: '700',
  },
  brandSubtitle: {
    marginTop: AppSpacing.md,
    fontSize: 16,
    opacity: 0.85,
  },
  formPaneContainer: {
    flex: 1,
  },
  formScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: AppSpacing.lg,
  },
  formContent: {
    width: '100%',
    gap: AppSpacing.xl,
  },
  logoWrapper: {
    alignItems: 'center',
  },
  headlineGroup: {
    gap: AppSpacing.xs,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
});
