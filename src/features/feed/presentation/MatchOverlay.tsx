import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { AppFonts, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppModal } from '@/core/ui/AppModal';
import { AppText } from '@/core/ui/AppText';
import { Avatar } from '@/core/ui/Avatar';
import { Button } from '@/core/ui/Button';

import type { FeedPost } from '../domain/feed';

interface MatchOverlayProps {
  post: FeedPost;
  myName: string;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

/** "IT'S A MATCH!" — tela roxa do protótipo, com os dois avatares. */
export function MatchOverlay({ post, myName, onSendMessage, onKeepSwiping }: MatchOverlayProps) {
  const colors = useAppTheme();
  const otherName = post.kind === 'vaga' ? post.empresaNome : post.nome;
  const otherFoto = post.kind === 'vaga' ? post.empresaFotoUri : post.fotoUri;
  const message =
    post.kind === 'vaga'
      ? `A ${post.empresaNome} também curtiu seu perfil para ${post.vaga.cargo}!`
      : `${post.nome} também curtiu a sua vaga!`;

  return (
    <AppModal visible onRequestClose={onKeepSwiping}>
      <View
        testID="match-overlay"
        accessibilityViewIsModal
        style={[styles.root, { backgroundColor: colors.primary + 'F2' }]}
      >
        <Animated.Text
          entering={ZoomIn.springify().damping(12)}
          accessibilityRole="header"
          style={[styles.title, { color: colors.onPrimary }]}
        >
          IT&apos;S A MATCH!
        </Animated.Text>

        <Animated.View entering={FadeIn.delay(150)} style={styles.avatars}>
          <Avatar name={myName} size={96} bordered />
          <View style={[styles.heart, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="favorite" size={22} color={colors.primary} />
          </View>
          <Avatar name={otherName} uri={otherFoto} size={96} bordered />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(250)} style={styles.bottom}>
          <AppText align="center" style={[styles.message, { color: colors.onPrimary }]} accessibilityLiveRegion="assertive">
            {message}
          </AppText>
          <Button testID="match-send-message" label="Mandar mensagem" icon="chat" variant="inverse" onPress={onSendMessage} />
          <Button testID="match-keep-swiping" label="Continuar deslizando" variant="outlineInverse" onPress={onKeepSwiping} />
        </Animated.View>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: AppSpacing.lg,
    gap: AppSpacing.xl,
  },
  title: {
    fontFamily: AppFonts.bold,
    fontStyle: 'italic',
    fontSize: 44,
    textAlign: 'center',
  },
  avatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heart: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -12,
    zIndex: 1,
  },
  bottom: {
    width: '100%',
    maxWidth: 360,
    gap: AppSpacing.md,
  },
  message: {
    fontSize: 16,
    marginBottom: AppSpacing.sm,
  },
});
