import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfileStore, useProfileStoreApi, useSessionStore } from '@/app-shell/AppProviders';
import { AppSizes, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import type { Failure } from '@/core/error/failure';
import { Button } from '@/core/ui/Button';
import { ConfirmDialog } from '@/core/ui/ConfirmDialog';
import { FailureBanner } from '@/core/ui/FailureBanner';
import { ScreenHeader } from '@/core/ui/ScreenHeader';

import { candidatoAge, profileDisplayName, type Profile } from '../domain/profile';

import { CandidatoProfileView } from './CandidatoProfileView';
import { EmpresaProfileView } from './EmpresaProfileView';
import { pickProfilePhoto } from './photoPicker';
import { ProfileHero } from './ProfileHero';

/**
 * Página 3 — Perfil. Mostra tudo o que a pessoa informou no cadastro, com
 * cada seção editável (empresa: dados + vagas). Foto opcional.
 */
export function ProfileScreen() {
  const colors = useAppTheme();
  const session = useSessionStore((s) => s.session);
  const signOut = useSessionStore((s) => s.signOut);
  const status = useProfileStore((s) => s.status);
  const profile = useProfileStore((s) => s.profile);
  const loadFailure = useProfileStore((s) => s.failure);
  const { load, save } = useProfileStoreApi().getState();

  const [photoBusy, setPhotoBusy] = useState(false);
  const [actionFailure, setActionFailure] = useState<Failure | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    if (session) void load(session);
  }, [session, load]);

  const updatePhoto = async (current: Profile, fotoUri: string | null) => {
    setPhotoBusy(true);
    setActionFailure(null);
    const result = await save({ ...current, fotoUri });
    if (result.kind === 'err') setActionFailure(result.failure);
    setPhotoBusy(false);
  };

  const handleChangePhoto = async () => {
    if (!profile) return;
    const uri = await pickProfilePhoto();
    if (uri) await updatePhoto(profile, uri);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <ScreenHeader
        title="Meu Perfil"
        right={{ icon: 'logout', label: 'Sair da conta', onPress: () => setConfirmLogout(true), testID: 'logout-button' }}
      />

      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        {status === 'error' && loadFailure ? (
          <View style={styles.centered}>
            <FailureBanner failure={loadFailure} />
            {session?.role !== 'admin' ? (
              <Button label="Tentar novamente" onPress={() => session && load(session, { force: true })} />
            ) : null}
          </View>
        ) : !profile ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Carregando perfil" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animated.View entering={FadeIn.duration(250)}>
              <ProfileHero
                name={profileDisplayName(profile)}
                fotoUri={profile.fotoUri}
                details={heroDetails(profile)}
                photoBusy={photoBusy}
                onChangePhoto={handleChangePhoto}
                onRemovePhoto={() => updatePhoto(profile, null)}
              />
              <View style={styles.body}>
                {actionFailure ? <FailureBanner failure={actionFailure} /> : null}
                {profile.role === 'candidato' ? (
                  <CandidatoProfileView profile={profile} onSave={save} />
                ) : (
                  <EmpresaProfileView profile={profile} onSave={save} />
                )}
              </View>
            </Animated.View>
          </ScrollView>
        )}
      </View>

      <ConfirmDialog
        visible={confirmLogout}
        title="Sair da conta?"
        message="Você vai precisar entrar de novo com e-mail e senha."
        confirmLabel="Sair"
        onConfirm={() => {
          setConfirmLogout(false);
          void signOut();
        }}
        onCancel={() => setConfirmLogout(false)}
      />
    </SafeAreaView>
  );
}

function heroDetails(profile: Profile) {
  if (profile.role === 'candidato') {
    const age = candidatoAge(profile);
    return [
      { icon: 'work-outline' as const, text: profile.cargoDesejado },
      { icon: 'place' as const, text: `CEP ${profile.cep}${age != null ? ` • ${age} anos` : ''}` },
    ];
  }
  return [
    { icon: 'business' as const, text: `CNPJ ${profile.cnpj}` },
    { icon: 'place' as const, text: profile.endereco },
  ];
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    gap: AppSpacing.md,
    padding: AppSpacing.lg,
  },
  scrollContent: {
    paddingBottom: AppSpacing.xxl,
  },
  body: {
    width: '100%',
    maxWidth: AppSizes.formMaxWidth + 120,
    alignSelf: 'center',
    padding: AppSpacing.lg,
    gap: AppSpacing.lg,
  },
});
