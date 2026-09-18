import { MaterialIcons } from '@expo/vector-icons';
import { forwardRef } from 'react';
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

import { AppRadius, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  errorText?: string | null;
  editable?: boolean;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  rightIconLabel?: string;
  textContentType?: TextInputProps['textContentType'];
  autoComplete?: TextInputProps['autoComplete'];
  testID?: string;
}

/** Campo de texto com rótulo, ícones e erro inline, estilizado pelos tokens de tema. */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    value,
    onChangeText,
    placeholder,
    errorText,
    editable = true,
    autoFocus,
    secureTextEntry,
    keyboardType,
    returnKeyType,
    onSubmitEditing,
    leftIcon,
    rightIcon,
    onRightIconPress,
    rightIconLabel,
    textContentType,
    autoComplete,
    testID,
  },
  ref,
) {
  const colors = useAppTheme();
  const hasError = Boolean(errorText);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.onSurface }]}>{label}</Text>
      <View
        style={[
          styles.field,
          {
            backgroundColor: colors.surfaceContainerHighest + '66',
            borderColor: hasError ? colors.error : colors.outlineVariant,
          },
        ]}
      >
        {leftIcon ? (
          <MaterialIcons name={leftIcon} size={20} color={colors.onSurfaceVariant} style={styles.icon} />
        ) : null}
        <TextInput
          ref={ref}
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceVariant}
          editable={editable}
          autoFocus={autoFocus}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          textContentType={textContentType}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, { color: colors.onSurface }]}
        />
        {rightIcon ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rightIconLabel}
            onPress={onRightIconPress}
            hitSlop={8}
          >
            <MaterialIcons name={rightIcon} size={20} color={colors.onSurfaceVariant} />
          </Pressable>
        ) : null}
      </View>
      {hasError ? <Text style={[styles.error, { color: colors.error }]}>{errorText}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: AppRadius.input,
    paddingHorizontal: AppSpacing.md,
    minHeight: 52,
    gap: AppSpacing.sm,
  },
  icon: {
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: AppSpacing.sm,
  },
  error: {
    fontSize: 12,
  },
});
