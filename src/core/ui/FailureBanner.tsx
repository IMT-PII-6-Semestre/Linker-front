import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts, AppRadius, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import type { Failure } from '@/core/error/failure';

interface FailureBannerProps {
  failure: Failure;
}

/** Exibe uma Failure de forma legível. A UI nunca mostra o erro técnico cru. */
export function FailureBanner({ failure }: FailureBannerProps) {
  const colors = useAppTheme();

  return (
    <View
      testID="failure-banner"
      style={[styles.container, { backgroundColor: colors.errorContainer }]}
    >
      <MaterialIcons name="error-outline" size={20} color={colors.onErrorContainer} />
      <Text style={[styles.message, { color: colors.onErrorContainer }]}>{failure.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: AppSpacing.sm,
    padding: AppSpacing.md,
    borderRadius: AppRadius.input,
  },
  message: {
    flex: 1,
    fontFamily: AppFonts.regular,
    fontSize: 14,
  },
});
