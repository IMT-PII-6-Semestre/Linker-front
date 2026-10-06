import { ScrollView, StyleSheet, Text } from 'react-native';

import { AppRadius, AppSpacing, AppType } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { PressableScale } from '@/core/ui/PressableScale';

import { REGIOES } from '../domain/feed';

interface RegionChipsProps {
  value: string | null;
  onChange: (uf: string | null) => void;
}

/** Filtro de região em uma linha rolável: "Todas" + UFs. */
export function RegionChips({ value, onChange }: RegionChipsProps) {
  const colors = useAppTheme();
  const options: { uf: string | null; label: string }[] = [{ uf: null, label: 'Todas as regiões' }, ...REGIOES];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="radiogroup"
      accessibilityLabel="Filtrar por região"
    >
      {options.map((option) => {
        const selected = option.uf === value;
        return (
          <PressableScale
            key={option.label}
            testID={`region-${option.uf ?? 'todas'}`}
            pressedScale={0.95}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.uf)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? colors.primary : colors.surface,
                borderColor: selected ? colors.primary : colors.outlineVariant,
              },
            ]}
          >
            <Text style={[styles.label, { color: selected ? colors.onPrimary : colors.onSurface }]}>
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: AppSpacing.sm,
    paddingHorizontal: AppSpacing.md,
  },
  chip: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: AppRadius.pill,
    borderWidth: 1,
  },
  label: {
    ...AppType.caption,
    fontSize: 12,
  },
});
