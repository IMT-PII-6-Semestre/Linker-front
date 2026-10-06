import { MaterialIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppRadius, AppSizes, AppSpacing, AppType } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

import { PressableScale } from './PressableScale';

export type ButtonVariant = 'filled' | 'outline' | 'ghost' | 'inverse' | 'danger';

interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  icon?: keyof typeof MaterialIcons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Botão do app. `filled` é a ação principal; `outline` a secundária;
 * `ghost` ação de texto; `inverse` botão branco sobre fundo roxo (overlay);
 * `danger` ação destrutiva (remover, bloquear).
 */
export function Button({
  label,
  onPress,
  variant = 'filled',
  icon,
  loading = false,
  disabled = false,
  accessibilityHint,
  style,
  testID,
}: ButtonProps) {
  const colors = useAppTheme();
  const isDisabled = disabled || loading;

  const palette = {
    filled: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    outline: { bg: 'transparent', fg: colors.primary, border: colors.primary },
    ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
    inverse: { bg: colors.surface, fg: colors.primary, border: colors.surface },
    danger: { bg: colors.error, fg: colors.onError, border: colors.error },
  }[variant];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      onPress={isDisabled ? undefined : onPress}
      style={[
        styles.button,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: isDisabled && !loading ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} size="small" />
      ) : (
        <>
          {icon ? <MaterialIcons name={icon} size={20} color={palette.fg} /> : null}
          <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
        </>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: AppSizes.buttonHeight,
    borderRadius: AppRadius.button,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppSpacing.sm,
    paddingHorizontal: AppSpacing.md,
  },
  label: {
    ...AppType.button,
  },
});
