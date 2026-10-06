import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useChatStore, useChatStoreApi, useSessionStore } from '@/app-shell/AppProviders';
import { conversaRoute } from '@/app-shell/routes';
import { AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppText } from '@/core/ui/AppText';
import { Avatar } from '@/core/ui/Avatar';
import { Button } from '@/core/ui/Button';
import { FailureBanner } from '@/core/ui/FailureBanner';
import { ScreenHeader } from '@/core/ui/ScreenHeader';
import { SearchBar } from '@/core/ui/SearchBar';
import { normalize } from '@/features/feed/domain/feed';

import { formatListTime, type Conversation } from '../domain/chat';

/** Página 5 — lista de conversas (uma por match). */
export function ChatListScreen() {
  const colors = useAppTheme();
  const session = useSessionStore((s) => s.session);
  const status = useChatStore((s) => s.listStatus);
  const conversations = useChatStore((s) => s.conversations);
  const failure = useChatStore((s) => s.listFailure);
  const { loadConversations } = useChatStoreApi().getState();

  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Recarrega sempre que a aba ganha foco (novos matches, respostas).
  useFocusEffect(
    useCallback(() => {
      if (session) void loadConversations(session);
    }, [session, loadConversations]),
  );

  if (!session) return null;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations(session);
    setRefreshing(false);
  };

  const q = normalize(query);
  const visible = q
    ? conversations.filter((c) => normalize(`${c.participantName} ${c.subtitle}`).includes(q))
    : conversations;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <ScreenHeader title="Mensagens" />
      <View style={styles.search}>
        <SearchBar
          testID="chat-search"
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar conversas..."
          label="Buscar conversas"
        />
      </View>

      {status === 'loading' && conversations.length === 0 ? (
        <ActivityIndicator
          style={styles.centered}
          size="large"
          color={colors.primary}
          accessibilityLabel="Carregando conversas"
        />
      ) : status === 'error' && failure && conversations.length === 0 ? (
        <View style={styles.centered}>
          <FailureBanner failure={failure} />
          <Button label="Tentar novamente" onPress={() => void loadConversations(session)} />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <ConversationRow
              conversation={item}
              onPress={() => router.push(conversaRoute(item.id))}
            />
          )}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: colors.surfaceContainerHighest }]} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={visible.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            <View style={styles.empty} testID="chat-empty">
              <MaterialIcons name={q ? 'search-off' : 'forum'} size={56} color={colors.secondary} />
              <AppText variant="heading" align="center">
                {q ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
              </AppText>
              <AppText color="onSurfaceVariant" align="center">
                {q ? 'Tente outro nome.' : 'Quando der match no feed, a conversa aparece aqui.'}
              </AppText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  const colors = useAppTheme();
  const { lastMessage, unreadCount } = conversation;
  const preview = lastMessage
    ? `${lastMessage.fromMe ? 'Você: ' : ''}${lastMessage.text}`
    : 'Diga olá!';
  const unread = unreadCount > 0;

  return (
    <Pressable
      testID={`conversation-${conversation.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Conversa com ${conversation.participantName}, ${conversation.subtitle}. ${
        unread ? `${unreadCount} mensagens não lidas. ` : ''
      }Última mensagem: ${preview}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.surfaceVariant : colors.surface },
      ]}
    >
      <Avatar name={conversation.participantName} uri={conversation.participantFotoUri} size={52} />
      <View style={styles.rowText}>
        <View style={styles.rowTop}>
          <AppText variant="bodyStrong" numberOfLines={1} style={styles.flex}>
            {conversation.participantName}
          </AppText>
          {lastMessage ? (
            <AppText variant="label" color={unread ? 'primary' : 'onSurfaceVariant'}>
              {formatListTime(lastMessage.sentAt)}
            </AppText>
          ) : null}
        </View>
        <AppText variant="label" color="primary" numberOfLines={1}>
          {conversation.subtitle}
        </AppText>
        <View style={styles.rowTop}>
          <AppText
            variant={unread ? 'bodyStrong' : 'body'}
            color={unread ? 'onSurface' : 'onSurfaceVariant'}
            numberOfLines={1}
            style={styles.flex}
          >
            {preview}
          </AppText>
          {unread ? (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <AppText variant="caption" style={{ color: colors.onPrimary }}>
                {unreadCount}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  search: {
    padding: AppSpacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    gap: AppSpacing.md,
    padding: AppSpacing.lg,
  },
  list: {
    paddingBottom: AppSpacing.lg,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppSpacing.md,
    padding: AppSpacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.md,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: 12,
  },
  rowText: {
    flex: 1,
    gap: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52 + AppSpacing.md * 2,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
