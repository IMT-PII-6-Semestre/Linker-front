import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppFonts, AppRadius, AppSizes, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** Nome lido pelo leitor de tela. */
  label?: string;
  testID?: string;
}

/** Campo de busca em pílula (o "🔍 Buscar..." do protótipo), com botão de limpar. */
export function SearchBar({ value, onChangeText, placeholder = 'Buscar...', label = 'Buscar', testID }: SearchBarProps) {
  const colors = useAppTheme();

  return (
    <View style={[styles.bar, { backgroundColor: colors.surfaceVariant }]}>
      <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} />
      <TextInput
        testID={testID}
        accessibilityRole="search"
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        style={[styles.input, { color: colors.onSurface }]}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          onPress={() => onChangeText('')}
          hitSlop={12}
        >
          <MaterialIcons name="cancel" size={18} color={colors.onSurfaceVariant} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
    minHeight: AppSizes.touchTarget - 4,
    paddingHorizontal: AppSpacing.md,
    borderRadius: AppRadius.pill,
  },
  input: {
    flex: 1,
    fontFamily: AppFonts.regular,
    fontSize: 14,
    paddingVertical: AppSpacing.sm,
  },
});
