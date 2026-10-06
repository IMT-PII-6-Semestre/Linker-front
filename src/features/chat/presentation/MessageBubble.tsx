import { MaterialIcons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppText } from '@/core/ui/AppText';

import { formatTime, type Message } from '../domain/chat';

interface MessageBubbleProps {
  message: Message;
  onRetry: (messageId: string) => void;
}

/** Balão do protótipo: enviado em roxo à direita, recebido em branco à esquerda. */
export const MessageBubble = memo(function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const colors = useAppTheme();
  const { fromMe, status } = message;
  const failed = status === 'failed';
  const statusLabel = status === 'sending' ? 'Enviando' : failed ? 'Não enviada' : 'Enviada';
  const a11yLabel = `${fromMe ? 'Você' : 'Recebida'}, ${formatTime(message.sentAt)}: ${message.text}${
    fromMe ? `. ${statusLabel}` : ''
  }`;

  const bubble = (
    <View
      style={[
        styles.bubble,
        fromMe
          ? [styles.sent, { backgroundColor: failed ? colors.errorContainer : colors.primary }]
          : [styles.received, { backgroundColor: colors.surface }],
      ]}
    >
      <AppText
        style={{
          color: fromMe ? (failed ? colors.onErrorContainer : colors.onPrimary) : colors.onSurface,
        }}
      >
        {message.text}
      </AppText>
      <View style={styles.meta}>
        <AppText
          variant="label"
          style={[
            styles.time,
            { color: fromMe && !failed ? colors.onPrimary : colors.onSurfaceVariant },
          ]}
        >
          {formatTime(message.sentAt)}
        </AppText>
        {fromMe ? (
          <MaterialIcons
            name={status === 'sending' ? 'schedule' : failed ? 'error-outline' : 'done'}
            size={14}
            color={failed ? colors.error : colors.onPrimary}
          />
        ) : null}
      </View>
    </View>
  );

  return (
    <Animated.View
      entering={FadeInUp.duration(180)}
      style={[styles.row, fromMe ? styles.rowMine : styles.rowTheirs]}
      // Mensagem que falhou: o foco vai para o botão de reenviar (abaixo).
      accessible={!failed}
      accessibilityLabel={failed ? undefined : a11yLabel}
    >
      {failed ? (
        <Pressable
          testID={`retry-${message.id}`}
          accessibilityRole="button"
          accessibilityLabel={a11yLabel}
          accessibilityHint="Toque duas vezes para reenviar"
          onPress={() => onRetry(message.id)}
        >
          {bubble}
          <AppText variant="label" color="error" align="right">
            Não enviada. Toque para tentar de novo.
          </AppText>
        </Pressable>
      ) : (
        bubble
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: AppSpacing.md,
    paddingVertical: 3,
  },
  rowMine: {
    alignItems: 'flex-end',
  },
  rowTheirs: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    borderRadius: 20,
    gap: 2,
  },
  sent: {
    borderBottomRightRadius: 5,
  },
  received: {
    borderBottomLeftRadius: 5,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 3,
  },
  time: {
    fontSize: 10,
    opacity: 0.85,
  },
});
