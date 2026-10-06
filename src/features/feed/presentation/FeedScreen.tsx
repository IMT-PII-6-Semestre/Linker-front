import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFeedStore, useFeedStoreApi, useSessionStore } from '@/app-shell/AppProviders';
import { AppRoutes } from '@/app-shell/routes';
import { AppShadows, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { FailureBanner } from '@/core/ui/FailureBanner';
import { PressableScale } from '@/core/ui/PressableScale';
import { ScreenHeader } from '@/core/ui/ScreenHeader';
import { SearchBar } from '@/core/ui/SearchBar';

import { postSubtitle, postTitle, type FeedPost, type SwipeDirection } from '../domain/feed';

import { MatchOverlay } from './MatchOverlay';
import { PostCardContent } from './PostCardContent';
import { PostDetailsSheet } from './PostDetailsSheet';
import { RegionChips } from './RegionChips';
import { SwipeCard, type SwipeCardHandle } from './SwipeCard';

const SEARCH_DEBOUNCE_MS = 350;

/**
 * Página 4 — Feed, o núcleo do app. Candidato vê vagas; empresa vê
 * currículos. Swipe (ou botões) para dar match/passar, busca por
 * palavra-chave, filtro de região e detalhes do post.
 */
export function FeedScreen() {
  const colors = useAppTheme();
  const session = useSessionStore((s) => s.session);
  const status = useFeedStore((s) => s.status);
  const posts = useFeedStore((s) => s.posts);
  const filters = useFeedStore((s) => s.filters);
  const failure = useFeedStore((s) => s.failure);
  const swipeFailure = useFeedStore((s) => s.swipeFailure);
  const match = useFeedStore((s) => s.match);
  const { load, setFilters, swipe, dismissMatch } = useFeedStoreApi().getState();

  const [query, setQuery] = useState(filters.query);
  const [details, setDetails] = useState<FeedPost | null>(null);
  const topCard = useRef<SwipeCardHandle>(null);

  const isEmpresa = session?.role === 'empresa';

  useEffect(() => {
    if (session) void load(session);
  }, [session, load]);

  // Busca só depois que a pessoa para de digitar.
  useEffect(() => {
    if (!session || query === filters.query) return;
    const timer = setTimeout(() => void setFilters(session, { query }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, filters.query, session, setFilters]);

  if (!session) return null;

  const handleSwiped = (direction: SwipeDirection) => void swipe(session, direction);
  const decide = (direction: SwipeDirection) => topCard.current?.swipe(direction);

  const hasFilters = filters.query.trim() !== '' || filters.uf !== null;
  // Card do topo + o de trás. Renderizados de trás para frente (o topo por cima).
  const visible = posts.slice(0, 2);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <ScreenHeader title={isEmpresa ? 'Talentos' : 'Vagas Abertas'} />

      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={styles.filters}>
          <View style={styles.searchRow}>
            <SearchBar
              testID="feed-search"
              value={query}
              onChangeText={setQuery}
              label={isEmpresa ? 'Buscar talentos por palavra-chave' : 'Buscar vagas por palavra-chave'}
              placeholder={isEmpresa ? 'Cargo, skill, formação...' : 'Cargo, empresa, benefício...'}
            />
          </View>
          <RegionChips value={filters.uf} onChange={(uf) => void setFilters(session, { uf })} />
        </View>

        {swipeFailure ? (
          <View style={styles.banner}>
            <FailureBanner failure={swipeFailure} />
          </View>
        ) : null}

        <View style={styles.deck}>
          {status === 'loading' && posts.length === 0 ? (
            <ActivityIndicator
              style={styles.centered}
              size="large"
              color={colors.primary}
              accessibilityLabel={isEmpresa ? 'Carregando talentos' : 'Carregando vagas'}
            />
          ) : status === 'error' && failure ? (
            <View style={styles.centered}>
              <FailureBanner failure={failure} />
              <Button label="Tentar novamente" onPress={() => void load(session, { force: true })} />
            </View>
          ) : visible.length === 0 ? (
            <EmptyState
              hasFilters={hasFilters}
              isEmpresa={isEmpresa}
              onClearFilters={() => {
                setQuery('');
                void setFilters(session, { query: '', uf: null });
              }}
            />
          ) : (
            [...visible].reverse().map((post) => {
              const isTop = post.id === visible[0].id;
              return (
                <SwipeCard
                  key={post.id}
                  ref={isTop ? topCard : undefined}
                  testID={isTop ? 'feed-top-card' : undefined}
                  isTop={isTop}
                  onSwiped={handleSwiped}
                  onOpenDetails={() => setDetails(post)}
                  accessibilityLabel={`${postTitle(post)}, ${postSubtitle(post)}, ${post.local}`}
                >
                  <PostCardContent post={post} onOpenDetails={() => setDetails(post)} />
                </SwipeCard>
              );
            })
          )}
        </View>

        {visible.length > 0 ? (
          <Animated.View entering={FadeIn} style={styles.actions}>
            <ActionButton
              testID="feed-pass"
              icon="close"
              label="Passar"
              background={colors.surface}
              color={colors.error}
              onPress={() => decide('pass')}
            />
            <ActionButton
              testID="feed-details"
              icon="info-outline"
              label="Ver detalhes"
              small
              background={colors.surface}
              color={colors.primary}
              onPress={() => setDetails(visible[0])}
            />
            <ActionButton
              testID="feed-like"
              icon="favorite"
              label="Dar match"
              background={colors.primary}
              color={colors.onPrimary}
              onPress={() => decide('like')}
            />
          </Animated.View>
        ) : null}
      </View>

      {details ? (
        <PostDetailsSheet
          post={details}
          onClose={() => setDetails(null)}
          onDecide={(direction) => {
            setDetails(null);
            // Só o card do topo pode ser decidido; os detalhes são sempre dele.
            if (details.id === posts[0]?.id) decide(direction);
          }}
        />
      ) : null}

      {match ? (
        <MatchOverlay
          post={match.post}
          myName={session.name}
          onKeepSwiping={dismissMatch}
          onSendMessage={() => {
            dismissMatch();
            router.navigate(AppRoutes.chat);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

interface ActionButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  background: string;
  color: string;
  small?: boolean;
  onPress: () => void;
  testID?: string;
}

/** Botões redondos de ação (❌ / ✔️ do protótipo), alternativa ao gesto. */
function ActionButton({ icon, label, background, color, small = false, onPress, testID }: ActionButtonProps) {
  const size = small ? 48 : 64;
  return (
    <PressableScale
      testID={testID}
      pressedScale={0.9}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.actionButton, { width: size, height: size, borderRadius: size / 2, backgroundColor: background }]}
    >
      <MaterialIcons name={icon} size={small ? 22 : 30} color={color} />
    </PressableScale>
  );
}

function EmptyState({
  hasFilters,
  isEmpresa,
  onClearFilters,
}: {
  hasFilters: boolean;
  isEmpresa: boolean;
  onClearFilters: () => void;
}) {
  const colors = useAppTheme();
  return (
    <Animated.View entering={FadeIn} style={styles.centered} testID="feed-empty">
      <MaterialIcons name={hasFilters ? 'search-off' : 'celebration'} size={56} color={colors.secondary} />
      <AppText variant="heading" align="center">
        {hasFilters ? 'Nada encontrado com esses filtros' : 'Por hoje é só!'}
      </AppText>
      <AppText color="onSurfaceVariant" align="center">
        {hasFilters
          ? 'Tente outra palavra-chave ou outra região.'
          : isEmpresa
            ? 'Você avaliou todos os talentos disponíveis. Volte mais tarde.'
            : 'Você avaliou todas as vagas disponíveis. Volte mais tarde.'}
      </AppText>
      {hasFilters ? <Button label="Limpar filtros" variant="outline" onPress={onClearFilters} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  filters: {
    gap: AppSpacing.sm,
    paddingTop: AppSpacing.md,
  },
  searchRow: {
    paddingHorizontal: AppSpacing.md,
  },
  banner: {
    paddingHorizontal: AppSpacing.md,
    paddingTop: AppSpacing.sm,
  },
  deck: {
    flex: 1,
    marginHorizontal: AppSpacing.md,
    marginTop: AppSpacing.md,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppSpacing.md,
    paddingHorizontal: AppSpacing.lg,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppSpacing.xl,
    paddingVertical: AppSpacing.md,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    ...AppShadows.lg,
  },
});
