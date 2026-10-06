import { Image, StyleSheet, Text, View } from 'react-native';

import { AppFonts } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
  /** Borda branca, para destacar sobre fundo roxo. */
  bordered?: boolean;
}

/** Foto redonda; sem foto, as iniciais do nome. */
export function Avatar({ name, uri, size = 48, bordered = false }: AvatarProps) {
  const colors = useAppTheme();
  const frame = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: bordered ? 3 : 0,
    borderColor: colors.onPrimary,
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[frame, styles.image]}
        accessibilityRole="image"
        accessibilityLabel={`Foto de ${name}`}
      />
    );
  }

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Iniciais de ${name}`}
      style={[frame, styles.initials, { backgroundColor: colors.primaryDark }]}
    >
      <Text style={[styles.initialsText, { color: colors.onPrimary, fontSize: size * 0.36 }]}>
        {initials(name)}
      </Text>
    </View>
  );
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  initials: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: AppFonts.semibold,
  },
});
