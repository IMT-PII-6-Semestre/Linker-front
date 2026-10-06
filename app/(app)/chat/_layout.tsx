import { Stack } from 'expo-router';

/**
 * Lista de conversas + conversa aberta (empilhada sobre a lista). A lista
 * fica sempre embaixo, mesmo abrindo a conversa direto pelo "It's a match".
 */
export const unstable_settings = {
  initialRouteName: 'index',
};

export default function ChatLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
