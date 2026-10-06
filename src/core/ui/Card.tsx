import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppRadius, AppShadows, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Superfície branca com sombra suave (o `.card` do protótipo). */
export function Card({ children, style, testID }: CardProps) {
  const colors = useAppTheme();
  return (
    <View testID={testID} style={[styles.card, { backgroundColor: colors.surface }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: AppSpacing.md,
    borderRadius: AppRadius.card,
    ...AppShadows.md,
  },
});
