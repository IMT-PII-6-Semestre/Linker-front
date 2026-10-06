import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppRadius, AppSizes, AppSpacing, AppType } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

import { PressableScale } from './PressableScale';

interface BaseProps<T extends string> {
  label: string;
  options: readonly T[];
  errorText?: string | null;
  testID?: string;
}

/**
 * Escolha única entre opções fixas (escolaridade, faixa salarial...) como
 * chips — mais rápido que um dropdown no celular e todas as opções ficam
 * visíveis. Semântica de radio para leitores de tela.
 */
export function ChipSelect<T extends string>({
  value,
  onChange,
  ...base
}: BaseProps<T> & { value: T | null; onChange: (value: T) => void }) {
  return (
    <ChipGroup
      {...base}
      multiple={false}
      isSelected={(option) => option === value}
      onToggle={(option) => onChange(option)}
    />
  );
}

/** Escolha múltipla (tipos de contrato, modalidades). Semântica de checkbox. */
export function ChipMultiSelect<T extends string>({
  value,
  onChange,
  ...base
}: BaseProps<T> & { value: readonly T[]; onChange: (value: T[]) => void }) {
  return (
    <ChipGroup
      {...base}
      multiple
      isSelected={(option) => value.includes(option)}
      onToggle={(option) =>
        onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option])
      }
    />
  );
}

function ChipGroup<T extends string>({
  label,
  options,
  errorText,
  testID,
  multiple,
  isSelected,
  onToggle,
}: BaseProps<T> & {
  multiple: boolean;
  isSelected: (option: T) => boolean;
  onToggle: (option: T) => void;
}) {
  const colors = useAppTheme();

  return (
    <View style={styles.container} testID={testID}>
      <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
        {label}
        {multiple ? ' (escolha uma ou mais)' : ''}
      </Text>
      <View
        accessibilityRole={multiple ? undefined : 'radiogroup'}
        accessibilityLabel={label}
        style={styles.options}
      >
        {options.map((option) => {
          const selected = isSelected(option);
          return (
            <PressableScale
              key={option}
              pressedScale={0.95}
              accessibilityRole={multiple ? 'checkbox' : 'radio'}
              accessibilityState={multiple ? { checked: selected } : { selected }}
              accessibilityLabel={option}
              onPress={() => onToggle(option)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.primaryContainer : colors.surface,
                  borderColor: selected ? colors.primary : colors.outlineVariant,
                },
              ]}
            >
              {selected ? <MaterialIcons name="check" size={16} color={colors.primary} /> : null}
              <Text
                style={[
                  styles.chipLabel,
                  { color: selected ? colors.onPrimaryContainer : colors.onSurface },
                ]}
              >
                {option}
              </Text>
            </PressableScale>
          );
        })}
      </View>
      {errorText ? (
        <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.error }]}>
          {errorText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: AppSpacing.sm,
  },
  label: {
    ...AppType.label,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.sm,
  },
  chip: {
    minHeight: AppSizes.touchTarget - 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.xs,
    paddingHorizontal: 14,
    borderRadius: AppRadius.pill,
    borderWidth: 1.5,
  },
  chipLabel: {
    ...AppType.bodyStrong,
    fontSize: 13,
  },
  error: {
    ...AppType.label,
  },
});
