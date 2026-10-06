import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppText } from '@/core/ui/AppText';
import { PressableScale } from '@/core/ui/PressableScale';

import { MAX_MESSAGE_LENGTH, sanitizeMessage, stripEmojis } from '../domain/chat';

interface ComposerProps {
  onSend: (text: string) => void;
}

/**
 * Campo de mensagem. Só texto: sem anexo, sem botão de emoji, e emojis
 * digitados pelo teclado do celular são removidos (com um aviso).
 */
export function Composer({ onSend }: ComposerProps) {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [emojiNotice, setEmojiNotice] = useState(false);

  useEffect(() => {
    if (!emojiNotice) return;
    const timer = setTimeout(() => setEmojiNotice(false), 3000);
    return () => clearTimeout(timer);
  }, [emojiNotice]);

  const handleChange = (value: string) => {
    const clean = stripEmojis(value);
    if (clean !== value) setEmojiNotice(true);
    setText(clean);
  };

  const canSend = sanitizeMessage(text) !== null;
  const send = () => {
    if (!canSend) return;
    onSend(text);
    setText('');
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, paddingBottom: insets.bottom + AppSpacing.sm },
      ]}
    >
      {emojiNotice ? (
        <AppText
          variant="label"
          color="onSurfaceVariant"
          accessibilityLiveRegion="polite"
          style={styles.notice}
        >
          O chat do Linker aceita apenas texto.
        </AppText>
      ) : null}
      <View style={styles.row}>
        <TextInput
          testID="chat-input"
          accessibilityLabel="Mensagem"
          value={text}
          onChangeText={handleChange}
          placeholder="Digite uma mensagem..."
          placeholderTextColor={colors.outline}
          multiline
          maxLength={MAX_MESSAGE_LENGTH}
          style={[
            styles.input,
            { backgroundColor: colors.surfaceVariant, color: colors.onSurface },
          ]}
        />
        <PressableScale
          testID="chat-send"
          pressedScale={0.9}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensagem"
          accessibilityState={{ disabled: !canSend }}
          onPress={canSend ? send : undefined}
          style={[styles.send, { backgroundColor: colors.primary, opacity: canSend ? 1 : 0.4 }]}
        >
          <MaterialIcons name="send" size={20} color={colors.onPrimary} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: AppSpacing.md,
    paddingTop: AppSpacing.sm,
    gap: AppSpacing.xs,
  },
  notice: {
    paddingHorizontal: AppSpacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: AppSpacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderRadius: 23,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: AppFonts.regular,
    fontSize: 15,
  },
  send: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
