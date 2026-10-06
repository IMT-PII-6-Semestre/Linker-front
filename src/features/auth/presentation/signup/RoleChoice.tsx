import { MaterialIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppRadius, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppText } from '@/core/ui/AppText';
import { PressableScale } from '@/core/ui/PressableScale';

import type { SignUpRole } from '../../state/signUpFormStore';

interface RoleChoiceProps {
  value: SignUpRole | null;
  onChange: (role: SignUpRole) => void;
}

const OPTIONS: {
  role: SignUpRole;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
}[] = [
  { role: 'candidato', icon: 'backpack', title: 'Um emprego', description: 'Quero encontrar uma vaga' },
  { role: 'empresa', icon: 'business', title: 'Um funcionário', description: 'Quero contratar talentos' },
];

/** "O que você está buscando?" — dois cards de escolha única (radio). */
export function RoleChoice({ value, onChange }: RoleChoiceProps) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="O que você está buscando?" style={styles.row}>
      {OPTIONS.map((option) => (
        <ChoiceCard
          key={option.role}
          {...option}
          selected={value === option.role}
          onPress={() => onChange(option.role)}
        />
      ))}
    </View>
  );
}

function ChoiceCard({
  role,
  icon,
  title,
  description,
  selected,
  onPress,
}: (typeof OPTIONS)[number] & { selected: boolean; onPress: () => void }) {
  const colors = useAppTheme();
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(selected ? 1 : 0, { duration: 200 }));
  }, [selected, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.get(), [0, 1], [colors.outlineVariant, colors.primary]),
    backgroundColor: interpolateColor(progress.get(), [0, 1], [colors.surface, colors.primaryContainer]),
  }));

  return (
    <PressableScale
      testID={`role-${role}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      pressedScale={0.96}
      style={styles.flex}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={[styles.iconCircle, { backgroundColor: selected ? colors.primary : colors.surfaceVariant }]}>
          <MaterialIcons name={icon} size={30} color={selected ? colors.onPrimary : colors.primary} />
        </View>
        <AppText variant="bodyStrong" align="center">
          {title}
        </AppText>
        <AppText variant="label" color="onSurfaceVariant" align="center">
          {description}
        </AppText>
        <View style={styles.check}>
          {selected ? <MaterialIcons name="check-circle" size={20} color={colors.primary} /> : null}
        </View>
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: AppSpacing.md,
  },
  flex: {
    flex: 1,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    gap: AppSpacing.sm,
    paddingVertical: AppSpacing.lg,
    paddingHorizontal: AppSpacing.md,
    borderWidth: 2,
    borderRadius: AppRadius.choice,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: AppSpacing.xs,
  },
  check: {
    height: 20,
  },
});
