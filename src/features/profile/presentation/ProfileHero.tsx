import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppRadius, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppText } from '@/core/ui/AppText';
import { Avatar } from '@/core/ui/Avatar';

interface ProfileHeroProps {
  name: string;
  fotoUri: string | null;
  /** Linhas abaixo do nome (cargo, local, idade...). */
  details: { icon: keyof typeof MaterialIcons.glyphMap; text: string }[];
  photoBusy?: boolean;
  onChangePhoto: () => void;
  onRemovePhoto: () => void;
}

/** Topo roxo do perfil (`.profile-header` do protótipo) com foto editável. */
export function ProfileHero({
  name,
  fotoUri,
  details,
  photoBusy = false,
  onChangePhoto,
  onRemovePhoto,
}: ProfileHeroProps) {
  const colors = useAppTheme();

  return (
    <View style={[styles.hero, { backgroundColor: colors.primary }]}>
      <View>
        <Avatar name={name} uri={fotoUri} size={104} bordered />
        <Pressable
          testID="profile-change-photo"
          accessibilityRole="button"
          accessibilityLabel={fotoUri ? 'Trocar foto de perfil' : 'Adicionar foto de perfil'}
          accessibilityState={{ busy: photoBusy }}
          onPress={photoBusy ? undefined : onChangePhoto}
          hitSlop={8}
          style={({ pressed }) => [
            styles.cameraBadge,
            { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          {photoBusy ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MaterialIcons name="photo-camera" size={18} color={colors.primary} />
          )}
        </Pressable>
      </View>

      <AppText variant="title" align="center" style={{ color: colors.onPrimary }} accessibilityRole="header">
        {name}
      </AppText>

      <View style={styles.details}>
        {details.map((d) => (
          <View key={d.text} style={styles.detailRow}>
            <MaterialIcons name={d.icon} size={16} color={colors.onPrimary} />
            <AppText style={[styles.detailText, { color: colors.onPrimary }]}>{d.text}</AppText>
          </View>
        ))}
      </View>

      {fotoUri ? (
        <Pressable accessibilityRole="button" onPress={onRemovePhoto} hitSlop={8}>
          <AppText variant="caption" style={[styles.removePhoto, { color: colors.onPrimary }]}>
            Remover foto
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: AppSpacing.sm,
    paddingTop: AppSpacing.lg,
    paddingBottom: AppSpacing.lg,
    paddingHorizontal: AppSpacing.lg,
    borderBottomLeftRadius: AppRadius.sheet,
    borderBottomRightRadius: AppRadius.sheet,
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    alignItems: 'center',
    gap: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.xs,
  },
  detailText: {
    opacity: 0.92,
  },
  removePhoto: {
    textDecorationLine: 'underline',
    opacity: 0.9,
  },
});
