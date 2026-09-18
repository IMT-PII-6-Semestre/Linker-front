import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSessionStore } from '@/app-shell/AppProviders';
import { AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { getFirstName } from '@/features/auth/domain/session';

interface HomeStubScreenProps {
  title: string;
}

/**
 * Destino pós-login das duas origens. É um STUB: existe só para o fluxo de
 * autenticação ser verificável ponta a ponta. Substituir pela home real
 * (painel do contratador / home do app) no próximo milestone.
 */
export function HomeStubScreen({ title }: HomeStubScreenProps) {
  const colors = useAppTheme();
  const session = useSessionStore((s) => s.session);
  const signOut = useSessionStore((s) => s.signOut);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>{title}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair"
          testID="logout-button"
          onPress={() => void signOut()}
          style={styles.logoutButton}
        >
          <MaterialIcons name="logout" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <MaterialIcons name="construction" size={48} color={colors.outline} />
        <Text style={[styles.greeting, { color: colors.onSurface }]}>
          {session ? `Olá, ${getFirstName(session)}.` : 'Sessão encerrada.'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Tela ainda não construída.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  logoutButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppSpacing.sm,
    padding: AppSpacing.lg,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
