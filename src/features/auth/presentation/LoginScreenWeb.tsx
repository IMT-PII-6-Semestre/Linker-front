import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBreakpoints, AppSizes, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppLogo } from '@/core/ui/AppLogo';
import { AppText } from '@/core/ui/AppText';

import { LoginForm } from './LoginForm';

/**
 * Login do painel web (dashboard administrativo do Linker).
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
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.brandPane}
    >
      <AppLogo size={48} inverse />
      <AppText variant="display" style={[styles.brandHeadline, { color: colors.onPrimary }]}>
        Painel administrativo
      </AppText>
      <AppText style={[styles.brandSubtitle, { color: colors.onPrimary }]}>
        Usuários, matches e vagas do Linker em um só lugar.
      </AppText>
    </LinearGradient>
  );
}

function FormPane({ showLogo }: { showLogo: boolean }) {
  const colors = useAppTheme();

  return (
    <SafeAreaView style={[styles.formPaneContainer, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.formScrollContent}>
        <View style={[styles.formContent, { maxWidth: AppSizes.formMaxWidth }]}>
          {showLogo ? <AppLogo size={40} /> : null}
          <View style={styles.headlineGroup}>
            <AppText variant="title" accessibilityRole="header">
              Entrar no painel
            </AppText>
            <AppText color="onSurfaceVariant">Acesso restrito à equipe Linker.</AppText>
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
  },
  brandSubtitle: {
    marginTop: AppSpacing.md,
    fontSize: 16,
    opacity: 0.9,
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
  headlineGroup: {
    gap: AppSpacing.xs,
  },
});
