import { isLoaded } from 'expo-font';
import type { TextStyle } from 'react-native';

/**
 * Para telas que podem aparecer antes do carregamento da Poppins (splash,
 * erro de startup): usa a família se já estiver pronta, senão a fonte do
 * sistema com o peso equivalente.
 */
export function safeFont(family: string, fallbackWeight: TextStyle['fontWeight']): TextStyle {
  return isLoaded(family) ? { fontFamily: family } : { fontWeight: fallbackWeight };
}
