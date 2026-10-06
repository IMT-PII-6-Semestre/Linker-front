import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, useSegments } from 'expo-router';

import { useSessionStore } from '@/app-shell/AppProviders';
import { AppFonts, AppShadows } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

/**
 * Navegação inferior do app mobile (Perfil · Vagas/Talentos · Chat), como
 * no protótipo. O feed é a aba inicial.
 */
export default function AppTabsLayout() {
  const colors = useAppTheme();
  const role = useSessionStore((s) => s.session?.role);
  // Dentro de uma conversa a barra de abas some (estilo WhatsApp): o campo
  // de mensagem fica colado embaixo.
  const segments = useSegments() as string[];
  const inConversation = segments.includes('[id]');

  return (
    <Tabs
      initialRouteName="feed"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        // Sem `height` fixo: a lib soma a área da barra de gestos/navegação do
        // sistema. Com altura fixa, os ícones ficam espremidos atrás dela.
        tabBarStyle: {
          display: inConversation ? 'none' : 'flex',
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          paddingTop: 4,
          ...AppShadows.sm,
        },
        tabBarLabelStyle: { fontFamily: AppFonts.semibold, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: role === 'empresa' ? 'Talentos' : 'Vagas',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="local-fire-department" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="chat-bubble" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
