import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppText } from '@/core/ui/AppText';

interface WizardProgressProps {
  step: number;
  total: number;
}

/** Barra de progresso do cadastro, anunciada como "Etapa x de n". */
export function WizardProgress({ step, total }: WizardProgressProps) {
  const colors = useAppTheme();
  const ratio = (step + 1) / total;
  const width = useSharedValue(ratio);

  useEffect(() => {
    width.set(withTiming(ratio, { duration: 300 }));
  }, [ratio, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.get() * 100}%` }));

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Etapa ${step + 1} de ${total}`}
      accessibilityValue={{ min: 1, max: total, now: step + 1 }}
    >
      <AppText variant="caption" color="primary">
        ETAPA {step + 1} DE {total}
      </AppText>
      <View style={[styles.track, { backgroundColor: colors.surfaceContainerHighest }]}>
        <Animated.View style={[styles.fill, { backgroundColor: colors.primary }, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: AppSpacing.xs,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
