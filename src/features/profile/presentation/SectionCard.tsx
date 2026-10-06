import { MaterialIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppSizes, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppText } from '@/core/ui/AppText';
import { Card } from '@/core/ui/Card';

interface SectionCardProps {
  title: string;
  /** Nota curta abaixo do título (ex.: "visível só para você"). */
  note?: string;
  onEdit?: () => void;
  children: ReactNode;
  testID?: string;
}

/** Seção do perfil: título, botão "Editar" e o conteúdo num card. */
export function SectionCard({ title, note, onEdit, children, testID }: SectionCardProps) {
  const colors = useAppTheme();

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <AppText variant="bodyStrong" style={styles.title} accessibilityRole="header">
            {title}
          </AppText>
          {note ? (
            <AppText variant="label" color="onSurfaceVariant">
              {note}
            </AppText>
          ) : null}
        </View>
        {onEdit ? (
          <Pressable
            testID={testID ? `${testID}-edit` : undefined}
            accessibilityRole="button"
            accessibilityLabel={`Editar ${title}`}
            onPress={onEdit}
            style={({ pressed }) => [styles.editButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <MaterialIcons name="edit" size={16} color={colors.primary} />
            <AppText variant="caption" color="primary">
              Editar
            </AppText>
          </Pressable>
        ) : null}
      </View>
      <Card testID={testID}>{children}</Card>
    </View>
  );
}

/** Par rótulo/valor dentro de uma seção. */
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="label" color="onSurfaceVariant">
        {label}
      </AppText>
      <AppText>{value || '—'}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: AppSpacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: AppSizes.touchTarget,
    paddingHorizontal: AppSpacing.sm,
  },
  infoRow: {
    gap: 2,
    paddingVertical: AppSpacing.xs,
  },
});
