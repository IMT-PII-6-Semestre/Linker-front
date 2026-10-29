import { ScrollView, StyleSheet, Text } from "react-native";

import { AppRadius, AppSpacing, AppType } from "@/app-shell/theme/tokens";
import { useAppTheme } from "@/app-shell/theme/ThemeProvider";
import { PressableScale } from "@/core/ui/PressableScale";

import { REGIOES } from "../domain/feed";

interface RegionChipsProps {
  value: string | null;
  onChange: (uf: string | null) => void;
}

/** Filtro de região em uma linha rolável: "Todas" + UFs. */
export function RegionChips({ value, onChange }: RegionChipsProps) {
  const options = [
    { value: null, label: "Todas as regiões" },
    ...REGIOES.map((r) => ({ value: r.uf, label: r.label })),
  ];
  return (
    <ChoiceChips
      options={options}
      value={value}
      onChange={onChange}
      accessibilityLabel="Filtrar por região"
      testIDFor={(uf) => `region-${uf ?? "todas"}`}
    />
  );
}

interface ChoiceChipsProps<T> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  testIDFor: (value: T) => string;
}

/** Escolha única em uma linha rolável de chips (região, vaga avaliada...). */
export function ChoiceChips<T>({
  options,
  value,
  onChange,
  accessibilityLabel,
  testIDFor,
}: ChoiceChipsProps<T>) {
  const colors = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.label + testIDFor(option.value)}
            testID={testIDFor(option.value)}
            pressedScale={0.95}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? colors.primary : colors.surface,
                borderColor: selected ? colors.primary : colors.outlineVariant,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? colors.onPrimary : colors.onSurface },
              ]}
            >
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
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: AppRadius.pill,
    borderWidth: 1,
  },
  label: {
    ...AppType.caption,
    fontSize: 12,
  },
});
