import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppSizes, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppText } from '@/core/ui/AppText';
import { Avatar } from '@/core/ui/Avatar';
import { Tag, TagList } from '@/core/ui/Tag';

import type { CandidatoPost, FeedPost, VagaPost } from '../domain/feed';

interface PostCardContentProps {
  post: FeedPost;
  onOpenDetails: () => void;
}

/** Conteúdo do card do feed: topo roxo com avatar + resumo do post. */
export function PostCardContent({ post, onOpenDetails }: PostCardContentProps) {
  return (
    <View style={styles.container}>
      <CardHeader post={post} />
      <View style={styles.info}>
        {post.kind === 'vaga' ? <VagaSummary post={post} /> : <CandidatoSummary post={post} />}
      </View>
      <DetailsLink onPress={onOpenDetails} />
    </View>
  );
}

function CardHeader({ post }: { post: FeedPost }) {
  const colors = useAppTheme();
  const name = post.kind === 'vaga' ? post.empresaNome : post.nome;
  const fotoUri = post.kind === 'vaga' ? post.empresaFotoUri : post.fotoUri;

  return (
    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
      <Avatar name={name} uri={fotoUri} size={84} bordered />
      <View style={styles.location}>
        <MaterialIcons name="place" size={14} color={colors.onPrimary} />
        <AppText variant="caption" style={{ color: colors.onPrimary }}>
          {post.local}
          {post.kind === 'candidato' ? ` • ${post.idade} anos` : ''}
        </AppText>
      </View>
    </LinearGradient>
  );
}

function VagaSummary({ post }: { post: VagaPost }) {
  const { vaga } = post;
  return (
    <>
      <AppText variant="title" numberOfLines={2}>
        {vaga.cargo}
      </AppText>
      <AppText variant="bodyStrong" color="primary">
        {post.empresaNome}
      </AppText>
      <TagList>
        <Tag tone="neutral" icon="payments" label={vaga.faixaSalarial} />
        <Tag tone="neutral" icon="schedule" label={vaga.modalidade} />
        <Tag tone="neutral" icon="description" label={vaga.tipoContrato} />
      </TagList>
      <AppText color="onSurfaceVariant" numberOfLines={4} style={styles.description}>
        {vaga.descricao}
      </AppText>
      <AppText variant="label" color="onSurfaceVariant" numberOfLines={1}>
        Escolaridade: {vaga.escolaridade}
      </AppText>
    </>
  );
}

function CandidatoSummary({ post }: { post: CandidatoPost }) {
  return (
    <>
      <AppText variant="title" numberOfLines={1}>
        {post.nome}
      </AppText>
      <AppText variant="bodyStrong" color="primary">
        {post.cargoDesejado}
      </AppText>
      <TagList>
        {post.hardSkills.slice(0, 4).map((s) => (
          <Tag key={s} label={s} />
        ))}
      </TagList>
      <AppText color="onSurfaceVariant" numberOfLines={4} style={styles.description}>
        {post.experiencias}
      </AppText>
      <TagList>
        <Tag tone="neutral" icon="payments" label={post.faixaSalarial} />
        <Tag tone="neutral" icon="schedule" label={post.modalidades.join(' / ')} />
      </TagList>
    </>
  );
}

function DetailsLink({ onPress }: { onPress: () => void }) {
  const colors = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ver detalhes"
      onPress={onPress}
      style={({ pressed }) => [styles.detailsLink, { opacity: pressed ? 0.6 : 1 }]}
    >
      <AppText variant="bodyStrong" color="primary">
        Ver detalhes
      </AppText>
      <MaterialIcons name="expand-less" size={20} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppSpacing.sm,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  info: {
    flex: 1,
    padding: AppSpacing.lg,
    gap: AppSpacing.sm,
    overflow: 'hidden',
  },
  description: {
    marginTop: AppSpacing.xs,
  },
  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: AppSizes.touchTarget,
  },
});
