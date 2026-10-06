import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Failure } from '@/core/error/failure';
import type { Session } from '@/features/auth/domain/session';

import { emptyFilters, type FeedFilters, type FeedPost, type SwipeDirection } from '../domain/feed';
import type { FeedRepository } from '../domain/feedRepository';

export type FeedStatus = 'idle' | 'loading' | 'data' | 'error';

export interface FeedMatch {
  post: FeedPost;
  matchId: string;
}

/**
 * Pilha de posts do feed. `posts[0]` é o card do topo.
 *
 * O swipe é otimista: o card sai da pilha na hora (a animação não espera
 * a rede); se a chamada falhar, ele volta para o topo e a falha aparece.
 */
export interface FeedState {
  status: FeedStatus;
  posts: FeedPost[];
  filters: FeedFilters;
  /** Falha ao carregar a lista. */
  failure: Failure | null;
  /** Falha ao registrar um swipe (o card voltou para a pilha). */
  swipeFailure: Failure | null;
  /** Match recém-feito — abre o overlay "It's a match!". */
  match: FeedMatch | null;
  loadedFor: string | null;

  load: (session: Session, options?: { force?: boolean }) => Promise<void>;
  setFilters: (session: Session, patch: Partial<FeedFilters>) => Promise<void>;
  swipe: (session: Session, direction: SwipeDirection) => Promise<void>;
  dismissMatch: () => void;
  clearSwipeFailure: () => void;
}

export function createFeedStore(repository: FeedRepository): StoreApi<FeedState> {
  /** Só a resposta da última busca vale (o usuário digita rápido). */
  let requestId = 0;

  return createStore<FeedState>((set, get) => {
    const fetch = async (session: Session) => {
      const current = ++requestId;
      set({ status: 'loading', failure: null, loadedFor: session.userId });
      const result = await repository.list({ session, filters: get().filters });
      if (current !== requestId) return;
      if (result.kind === 'ok') set({ status: 'data', posts: result.value });
      else set({ status: 'error', failure: result.failure, posts: [] });
    };

    return {
      status: 'idle',
      posts: [],
      filters: emptyFilters,
      failure: null,
      swipeFailure: null,
      match: null,
      loadedFor: null,

      load: async (session, options) => {
        const sameUser = get().loadedFor === session.userId;
        if (sameUser && !options?.force && get().status !== 'error') return;
        if (!sameUser) set({ filters: emptyFilters, posts: [], match: null, swipeFailure: null });
        await fetch(session);
      },

      setFilters: async (session, patch) => {
        set({ filters: { ...get().filters, ...patch } });
        await fetch(session);
      },

      swipe: async (session, direction) => {
        const [post, ...rest] = get().posts;
        if (!post) return;
        set({ posts: rest, swipeFailure: null });

        const result = await repository.swipe({ session, post, direction });
        if (result.kind === 'err') {
          set({ posts: [post, ...get().posts], swipeFailure: result.failure });
          return;
        }
        if (result.value.matched && result.value.matchId) {
          set({ match: { post, matchId: result.value.matchId } });
        }
      },

      dismissMatch: () => set({ match: null }),
      clearSwipeFailure: () => set({ swipeFailure: null }),
    };
  });
}
