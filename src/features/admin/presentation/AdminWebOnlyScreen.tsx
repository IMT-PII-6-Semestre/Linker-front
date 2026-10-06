import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSessionStore } from '@/app-shell/AppProviders';
import { AppSizes, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppLogo } from '@/core/ui/AppLogo';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';

/**
 * Admin entrou pelo app mobile. O app é para candidatos e empresas — o
 * admin não tem feed, chat nem perfil aqui; ele usa o painel web.
 */
export function AdminWebOnlyScreen() {
  const colors = useAppTheme();
  const session = useSessionStore((s) => s.session);
  const signOut = useSessionStore((s) => s.signOut);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <Animated.View
        entering={FadeInDown.duration(300)}
        style={styles.content}
        testID="admin-web-only"
      >
        <AppLogo size={36} />
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer }]}>
          <MaterialIcons name="desktop-windows" size={40} color={colors.onPrimaryContainer} />
        </View>
        <AppText variant="title" align="center" accessibilityRole="header">
          Use o painel web
        </AppText>
        <AppText color="onSurfaceVariant" align="center">
          {session ? `${session.email} é uma conta de administrador. ` : ''}O app é para candidatos
          e empresas. As métricas da plataforma ficam no painel administrativo, acessado pelo
          navegador do computador.
        </AppText>
        <Button
          testID="logout-button"
          label="Sair e entrar com outra conta"
          icon="logout"
          onPress={() => void signOut()}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: AppSizes.formMaxWidth,
    alignSelf: 'center',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: AppSpacing.lg,
    padding: AppSpacing.lg,
  },
  iconCircle: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
