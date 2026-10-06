import { Stack } from 'expo-router';

/** Lista de conversas + conversa aberta (empilhada sobre a lista). */
export default function ChatLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
