import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useChatStore, useChatStoreApi, useSessionStore } from '@/app-shell/AppProviders';
import { AppRoutes } from '@/app-shell/routes';
import { AppShadows, AppSizes, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import type { Result } from '@/core/error/result';
import { AppText } from '@/core/ui/AppText';
import { Avatar } from '@/core/ui/Avatar';
import { Button } from '@/core/ui/Button';
import { FailureBanner } from '@/core/ui/FailureBanner';
import { PostDetailsSheet } from '@/features/feed/presentation/PostDetailsSheet';

import { Composer } from './Composer';
import { ConversationActions, type ConversationAction } from './ConversationActions';
import { MessageBubble } from './MessageBubble';

interface ConversationScreenProps {
  conversationId: string;
}

/** Página 5 — conversa aberta, estilo WhatsApp (só texto). */
export function ConversationScreen({ conversationId }: ConversationScreenProps) {
  const colors = useAppTheme();
  const session = useSessionStore((s) => s.session);
  const thread = useChatStore((s) => s.threads[conversationId]);
  const { openConversation, watchConversation, sendMessage, retryMessage, unmatch, block, report } =
    useChatStoreApi().getState();

  const [actions, setActions] = useState<'menu' | ConversationAction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    if (!session) return;
    void openConversation(session, conversationId);
    return watchConversation(session, conversationId);
  }, [session, conversationId, openConversation, watchConversation]);

  // FlatList invertida: a mensagem mais nova fica embaixo, perto do teclado.
  const inverted = useMemo(() => [...(thread?.messages ?? [])].reverse(), [thread?.messages]);

  if (!session) return null;

  const goBack = () => (router.canGoBack() ? router.back() : router.replace(AppRoutes.chat));
  const conversation = thread?.conversation ?? null;

  // Desfez o match ou bloqueou: a conversa deixa de existir, volta para a lista.
  const leaveAfter = async (action: () => Promise<Result<void>>): Promise<Result<void>> => {
    const result = await action();
    if (result.kind === 'ok') {
      setActions(null);
      goBack();
    }
    return result;
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Pressable
          testID="conversation-back"
          accessibilityRole="button"
          accessibilityLabel="Voltar para as conversas"
          onPress={goBack}
          style={styles.iconButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        {conversation ? (
          <>
            <Avatar
              name={conversation.participantName}
              uri={conversation.participantFotoUri}
              size={40}
            />
            <View style={styles.headerText}>
              <AppText variant="bodyStrong" numberOfLines={1} accessibilityRole="header">
                {conversation.participantName}
              </AppText>
              {conversation.post ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setShowDetails(true)}
                  hitSlop={8}
                >
                  <AppText variant="label" color="primary" numberOfLines={1} style={styles.link}>
                    {conversation.post.kind === 'vaga' ? 'Ver detalhes da vaga' : 'Ver currículo'}
                  </AppText>
                </Pressable>
              ) : (
                <AppText variant="label" color="onSurfaceVariant" numberOfLines={1}>
                  {conversation.subtitle}
                </AppText>
              )}
            </View>
            <Pressable
              testID="conversation-menu-button"
              accessibilityRole="button"
              accessibilityLabel="Opções da conversa"
              onPress={() => setActions('menu')}
              style={styles.iconButton}
            >
              <MaterialIcons name="more-vert" size={24} color={colors.onSurface} />
            </Pressable>
          </>
        ) : (
          <View style={styles.headerText} />
        )}
      </View>

      <KeyboardAvoidingView
        behavior="padding"
        style={[styles.flex, { backgroundColor: colors.background }]}
      >
        {reported ? (
          <View
            style={[styles.notice, { backgroundColor: colors.primaryContainer }]}
            accessibilityLiveRegion="polite"
          >
            <AppText color="onPrimaryContainer" style={styles.flex}>
              Denúncia enviada. Obrigado — nossa equipe vai analisar.
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar aviso"
              onPress={() => setReported(false)}
              hitSlop={8}
            >
              <MaterialIcons name="close" size={20} color={colors.onPrimaryContainer} />
            </Pressable>
          </View>
        ) : null}

        {!thread || (thread.status === 'loading' && thread.messages.length === 0) ? (
          <ActivityIndicator
            style={styles.flex}
            size="large"
            color={colors.primary}
            accessibilityLabel="Carregando conversa"
          />
        ) : thread.status === 'error' && thread.failure ? (
          <View style={styles.centered}>
            <FailureBanner failure={thread.failure} />
            <Button label="Voltar para as conversas" variant="outline" onPress={goBack} />
          </View>
        ) : (
          <FlatList
            testID="message-list"
            data={inverted}
            inverted
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                onRetry={(id) => void retryMessage(session, conversationId, id)}
              />
            )}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          />
        )}

        {conversation ? (
          <Composer onSend={(text) => void sendMessage(session, conversationId, text)} />
        ) : null}
      </KeyboardAvoidingView>

      {conversation ? (
        <ConversationActions
          participantName={conversation.participantName}
          open={actions}
          onOpen={setActions}
          onUnmatch={() => leaveAfter(() => unmatch(session, conversationId))}
          onBlock={() => leaveAfter(() => block(session, conversationId))}
          onReport={(reason, details) => report(session, conversationId, reason, details)}
          onReported={() => setReported(true)}
        />
      ) : null}

      {showDetails && conversation?.post ? (
        <PostDetailsSheet post={conversation.post} onClose={() => setShowDetails(false)} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
    paddingHorizontal: AppSpacing.xs,
    paddingVertical: AppSpacing.xs,
    zIndex: 10,
    ...AppShadows.sm,
  },
  headerText: {
    flex: 1,
  },
  link: {
    textDecorationLine: 'underline',
  },
  iconButton: {
    width: AppSizes.touchTarget,
    height: AppSizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
    margin: AppSpacing.md,
    padding: AppSpacing.md,
    borderRadius: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    gap: AppSpacing.md,
    padding: AppSpacing.lg,
  },
  messages: {
    paddingVertical: AppSpacing.md,
  },
});
