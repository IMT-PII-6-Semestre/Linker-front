import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppRadius, AppSpacing, AppType } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

import { Tag, TagList } from './Tag';
import { TextField } from './TextField';

interface TagInputProps {
  label: string;
  value: readonly string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  /** Sugestões tocáveis abaixo do campo. */
  suggestions?: readonly string[];
  errorText?: string | null;
  max?: number;
  testID?: string;
}

/** Lista de tags livres (hard/soft skills): digita, "Enter" adiciona, "x" remove. */
export function TagInput({
  label,
  value,
  onChange,
  placeholder = 'Digite e toque em "Adicionar"',
  suggestions = [],
  errorText,
  max = 15,
  testID,
}: TagInputProps) {
  const [draft, setDraft] = useState('');
  const isFull = value.length >= max;

  const add = (raw: string) => {
    const tag = raw.trim();
    if (!tag || isFull) return;
    const exists = value.some((v) => v.toLowerCase() === tag.toLowerCase());
    if (!exists) onChange([...value, tag]);
    setDraft('');
  };

  const remaining = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <TextField
        testID={testID}
        label={label}
        value={draft}
        onChangeText={setDraft}
        placeholder={isFull ? `Máximo de ${max} itens` : placeholder}
        editable={!isFull}
        autoCapitalize="sentences"
        returnKeyType="done"
        submitBehavior="submit"
        onSubmitEditing={() => add(draft)}
        rightIcon={draft.trim() ? 'add-circle' : undefined}
        rightIconLabel={`Adicionar ${draft.trim()}`}
        onRightIconPress={() => add(draft)}
        errorText={errorText}
        helperText={`${value.length}/${max}`}
      />
      {value.length > 0 ? (
        <TagList>
          {value.map((tag) => (
            <Tag key={tag} label={tag} onRemove={() => onChange(value.filter((v) => v !== tag))} />
          ))}
        </TagList>
      ) : null}
      {remaining.length > 0 && !isFull ? (
        <TagList>
          {remaining.slice(0, 6).map((s) => (
            <SuggestionChip key={s} label={s} onPress={() => add(s)} />
          ))}
        </TagList>
      ) : null}
    </View>
  );
}

function SuggestionChip({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Adicionar sugestão ${label}`}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.suggestion,
        { borderColor: colors.secondary, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Text style={[styles.suggestionLabel, { color: colors.primary }]}>+ {label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: AppSpacing.sm,
  },
  suggestion: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AppRadius.pill,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  suggestionLabel: {
    ...AppType.caption,
    fontSize: 12,
  },
});
