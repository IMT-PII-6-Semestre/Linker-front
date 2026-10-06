import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppShadows, AppSizes, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

import { AppText } from './AppText';

interface HeaderAction {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  testID?: string;
}

interface ScreenHeaderProps {
  title: string;
  left?: HeaderAction;
  right?: HeaderAction;
}

/** Barra de título das telas do app (o `.header` do protótipo). */
export function ScreenHeader({ title, left, right }: ScreenHeaderProps) {
  const colors = useAppTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.surface }]}>
      <HeaderButton action={left} />
      <AppText variant="heading" color="primary" accessibilityRole="header" style={styles.title}>
        {title}
      </AppText>
      <HeaderButton action={right} />
    </View>
  );
}

function HeaderButton({ action }: { action?: HeaderAction }) {
  const colors = useAppTheme();
  if (!action) return <View style={styles.button} />;
  return (
    <Pressable
      testID={action.testID}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      onPress={action.onPress}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}
    >
      <MaterialIcons name={action.icon} size={24} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: AppSpacing.sm,
    paddingVertical: AppSpacing.xs,
    zIndex: 10,
    ...AppShadows.sm,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  button: {
    width: AppSizes.touchTarget,
    height: AppSizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
