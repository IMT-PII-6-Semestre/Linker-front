import { MaterialIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppRadius, AppSpacing, AppType } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

interface TagProps {
  label: string;
  /** `primary`: skills (roxo claro). `neutral`: metadados (salário, modalidade). */
  tone?: 'primary' | 'neutral';
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** Mostra um "x" para remover (usado no TagInput). */
  onRemove?: () => void;
}

/** Pílula de informação: skills, salário, modalidade. */
export function Tag({ label, tone = 'primary', icon, onRemove }: TagProps) {
  const colors = useAppTheme();
  const bg = tone === 'primary' ? colors.primaryContainer : colors.surfaceVariant;
  const fg = tone === 'primary' ? colors.onPrimaryContainer : colors.onSurface;

  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      {icon ? <MaterialIcons name={icon} size={14} color={fg} /> : null}
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remover ${label}`}
          onPress={onRemove}
          hitSlop={12}
        >
          <MaterialIcons name="close" size={14} color={fg} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function TagList({ children }: { children: ReactNode }) {
  return <View style={styles.list}>{children}</View>;
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.xs,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AppRadius.pill,
  },
  label: {
    ...AppType.caption,
    fontSize: 12,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.sm,
  },
});
