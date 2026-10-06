import { launchImageLibraryAsync } from 'expo-image-picker';

/**
 * Abre a galeria para escolher a foto de perfil (quadrada, comprimida).
 * O seletor do sistema não exige permissão no Android 13+ e no iOS 14+.
 * Devolve a URI escolhida, ou null se o usuário cancelar.
 */
export async function pickProfilePhoto(): Promise<string | null> {
  const result = await launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0].uri;
}
