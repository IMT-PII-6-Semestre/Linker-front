import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { AppRadius, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

import { AppText } from './AppText';
import { Button } from './Button';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Ação destrutiva: botão de confirmar em vermelho. */
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmação antes de ações que não dá para desfazer (remover vaga,
 * desfazer match, bloquear). Diferente do Alert nativo, funciona igual no
 * web e segue o visual do app.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const colors = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
          onPress={onCancel}
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim + 'AA' }]}
        />
        <Animated.View
          entering={ZoomIn.duration(180)}
          accessibilityViewIsModal
          accessibilityRole="alert"
          style={[styles.dialog, { backgroundColor: colors.surface }]}
        >
          <AppText variant="heading" accessibilityRole="header">
            {title}
          </AppText>
          <AppText color="onSurfaceVariant">{message}</AppText>
          <View style={styles.actions}>
            <Button label={cancelLabel} variant="outline" onPress={onCancel} style={styles.action} />
            <Button
              testID="confirm-dialog-confirm"
              label={confirmLabel}
              variant={destructive ? 'danger' : 'filled'}
              loading={loading}
              onPress={onConfirm}
              style={styles.action}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: AppSpacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: AppRadius.matchCard,
    padding: AppSpacing.lg,
    gap: AppSpacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: AppSpacing.sm,
    marginTop: AppSpacing.sm,
  },
  action: {
    flex: 1,
  },
});
