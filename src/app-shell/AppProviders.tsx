import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore, type StoreApi } from 'zustand';

import { FakeAuthRepository } from '@/features/auth/data/fakeAuthRepository';
import type { AuthRepository } from '@/features/auth/domain/authRepository';
import { createSessionStore, type SessionState } from '@/features/auth/state/sessionStore';
import { FakeAdminRepository } from '@/features/admin/data/fakeAdminRepository';
import type { AdminRepository } from '@/features/admin/domain/adminRepository';
import { createAdminStore, type AdminState } from '@/features/admin/state/adminStore';
import { FakeChatRepository } from '@/features/chat/data/fakeChatRepository';
import type { ChatRepository } from '@/features/chat/domain/chatRepository';
import { createChatStore, type ChatState } from '@/features/chat/state/chatStore';
import { FakeFeedRepository } from '@/features/feed/data/fakeFeedRepository';
import type { FeedRepository } from '@/features/feed/domain/feedRepository';
import { createFeedStore, type FeedState } from '@/features/feed/state/feedStore';
import { FakeProfileRepository } from '@/features/profile/data/fakeProfileRepository';
import type { ProfileRepository } from '@/features/profile/domain/profileRepository';
import { createProfileStore, type ProfileState } from '@/features/profile/state/profileStore';

import { createStoreContext } from './createStoreContext';

import { resolveAppOrigin, type AppOrigin } from './origin';

const OriginContext = createContext<AppOrigin | null>(null);
const SessionStoreContext = createContext<StoreApi<SessionState> | null>(null);
const ProfileStore = createStoreContext<ProfileState>('useProfileStore');
const FeedStore = createStoreContext<FeedState>('useFeedStore');
const ChatStore = createStoreContext<ChatState>('useChatStore');
const AdminStore = createStoreContext<AdminState>('useAdminStore');

interface AppProvidersProps {
  /** Default: resolveAppOrigin(). Override usado pelos testes. */
  origin?: AppOrigin;
  /** Default: FakeAuthRepository. Override usado pelos testes. */
  authRepository?: AuthRepository;
  /** Default: FakeProfileRepository. Override usado pelos testes. */
  profileRepository?: ProfileRepository;
  /** Default: FakeFeedRepository. Override usado pelos testes. */
  feedRepository?: FeedRepository;
  /** Default: FakeChatRepository. Override usado pelos testes. */
  chatRepository?: ChatRepository;
  /** Default: FakeAdminRepository. Override usado pelos testes. */
  adminRepository?: AdminRepository;
  children: ReactNode;
}

/**
 * Raiz de injeção de dependências do app. A store é criada uma única vez
 * por instância (via inicializador lazy do useState, não em module scope)
 * para não perder estado em Fast Refresh e para permitir que cada teste
 * monte sua própria instância isolada.
 */
export function AppProviders({
  origin,
  authRepository,
  profileRepository,
  feedRepository,
  chatRepository,
  adminRepository,
  children,
}: AppProvidersProps) {
  const resolvedOrigin = origin ?? resolveAppOrigin();

  const [stores] = useState(() => {
    // Sem backend: o fake de auth avisa o fake de perfil sobre novos
    // cadastros, como a API real faria ao criar a conta.
    // Idem: um match no feed abre a conversa no chat.
    const fakeProfiles = new FakeProfileRepository();
    const fakeChat = new FakeChatRepository();
    const auth =
      authRepository ??
      new FakeAuthRepository(undefined, (session, payload) => fakeProfiles.seedFromSignUp(session, payload));
    return {
      session: createSessionStore(auth, resolvedOrigin),
      profile: createProfileStore(profileRepository ?? fakeProfiles),
      feed: createFeedStore(
        feedRepository ?? new FakeFeedRepository(undefined, (match) => fakeChat.createFromMatch(match)),
      ),
      chat: createChatStore(chatRepository ?? fakeChat),
      admin: createAdminStore(adminRepository ?? new FakeAdminRepository()),
    };
  });

  return (
    <OriginContext.Provider value={resolvedOrigin}>
      <SessionStoreContext.Provider value={stores.session}>
        <ProfileStore.Provider value={stores.profile}>
          <FeedStore.Provider value={stores.feed}>
            <ChatStore.Provider value={stores.chat}>
              <AdminStore.Provider value={stores.admin}>{children}</AdminStore.Provider>
            </ChatStore.Provider>
          </FeedStore.Provider>
        </ProfileStore.Provider>
      </SessionStoreContext.Provider>
    </OriginContext.Provider>
  );
}

export function useAppOrigin(): AppOrigin {
  const origin = useContext(OriginContext);
  if (origin === null) {
    throw new Error('useAppOrigin must be used within <AppProviders>');
  }
  return origin;
}

export function useSessionStore<T>(selector: (state: SessionState) => T): T {
  const store = useContext(SessionStoreContext);
  if (!store) {
    throw new Error('useSessionStore must be used within <AppProviders>');
  }
  return useStore(store, selector);
}

/** Acesso à store crua (não à leitura reativa) — usado por useAppStartup. */
export function useSessionStoreApi(): StoreApi<SessionState> {
  const store = useContext(SessionStoreContext);
  if (!store) {
    throw new Error('useSessionStoreApi must be used within <AppProviders>');
  }
  return store;
}

export const useProfileStore = ProfileStore.useSelector;
export const useProfileStoreApi = ProfileStore.useStoreApi;
export const useFeedStore = FeedStore.useSelector;
export const useFeedStoreApi = FeedStore.useStoreApi;
export const useChatStore = ChatStore.useSelector;
export const useChatStoreApi = ChatStore.useStoreApi;
export const useAdminStore = AdminStore.useSelector;
export const useAdminStoreApi = AdminStore.useStoreApi;
