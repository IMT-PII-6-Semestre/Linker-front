import { MaterialIcons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
  type TextInputProps,
} from 'react-native';

import { AppFonts, AppRadius, AppSpacing, AppType } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import type { Mask } from '@/core/format/masks';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  errorText?: string | null;
  /** Texto de apoio abaixo do campo (some quando há erro). */
  helperText?: string;
  editable?: boolean;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  onBlur?: () => void;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  rightIconLabel?: string;
  textContentType?: TextInputProps['textContentType'];
  autoComplete?: TextInputProps['autoComplete'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  /** Formata enquanto digita (CPF, CEP, telefone...). */
  mask?: Mask;
  maxLength?: number;
  /** Campo de várias linhas (descrição, experiências). */
  multiline?: boolean;
  /** Mantém o foco no campo ao enviar (ex.: TagInput). */
  submitBehavior?: TextInputProps['submitBehavior'];
  testID?: string;
}

/** Campo de texto com rótulo, ícones e erro inline, no visual do protótipo. */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    value,
    onChangeText,
    placeholder,
    errorText,
    helperText,
    editable = true,
    autoFocus,
    secureTextEntry,
    keyboardType,
    returnKeyType,
    onSubmitEditing,
    onBlur,
    leftIcon,
    rightIcon,
    onRightIconPress,
    rightIconLabel,
    textContentType,
    autoComplete,
    autoCapitalize = 'none',
    mask,
    maxLength,
    multiline = false,
    submitBehavior,
    testID,
  },
  ref,
) {
  const colors = useAppTheme();
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorText);

  const borderColor = hasError ? colors.error : focused ? colors.primary : colors.outlineVariant;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>{label}</Text>
      <View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          { backgroundColor: colors.surface, borderColor, opacity: editable ? 1 : 0.6 },
        ]}
      >
        {leftIcon ? (
          <MaterialIcons name={leftIcon} size={20} color={focused ? colors.primary : colors.onSurfaceVariant} />
        ) : null}
        <TextInput
          ref={ref}
          testID={testID}
          accessibilityLabel={label}
          accessibilityHint={hasError ? (errorText ?? undefined) : helperText}
          value={value}
          onChangeText={(text) => onChangeText(mask ? mask(text) : text)}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          editable={editable}
          autoFocus={autoFocus}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          submitBehavior={submitBehavior}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          textContentType={textContentType}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          maxLength={maxLength}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[styles.input, multiline && styles.inputMultiline, { color: colors.onSurface }]}
        />
        {rightIcon ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rightIconLabel}
            onPress={onRightIconPress}
            hitSlop={12}
          >
            <MaterialIcons name={rightIcon} size={20} color={colors.onSurfaceVariant} />
          </Pressable>
        ) : null}
      </View>
      {hasError ? (
        <Text accessibilityLiveRegion="polite" style={[styles.helper, { color: colors.error }]}>
          {errorText}
        </Text>
      ) : helperText ? (
        <Text style={[styles.helper, { color: colors.onSurfaceVariant }]}>{helperText}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: AppSpacing.xs,
  },
  label: {
    ...AppType.label,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: AppRadius.input,
    paddingHorizontal: AppSpacing.md,
    minHeight: 50,
    gap: AppSpacing.sm,
  },
  fieldMultiline: {
    alignItems: 'flex-start',
    paddingVertical: AppSpacing.sm,
  },
  input: {
    flex: 1,
    // Sem lineHeight: no iOS ele desalinha o texto dentro do TextInput.
    fontFamily: AppFonts.regular,
    fontSize: 15,
    paddingVertical: AppSpacing.sm,
  },
  inputMultiline: {
    minHeight: 96,
  },
  helper: {
    ...AppType.label,
  },
});
