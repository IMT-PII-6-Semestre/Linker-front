import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppSpacing } from '@/app-shell/theme/tokens';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { SheetModal } from '@/core/ui/SheetModal';
import { Tag, TagList } from '@/core/ui/Tag';

import {
  postTitle,
  type CandidatoPost,
  type FeedPost,
  type SwipeDirection,
  type VagaPost,
} from '../domain/feed';

interface PostDetailsSheetProps {
  post: FeedPost;
  onClose: () => void;
  /** Sem `onDecide` (ex.: aberto pelo chat), a folha é só leitura. */
  onDecide?: (direction: SwipeDirection) => void;
}

/** "Ver detalhes": o post completo, com as mesmas ações do card. */
export function PostDetailsSheet({ post, onClose, onDecide }: PostDetailsSheetProps) {
  return (
    <SheetModal
      visible
      testID="post-details"
      title={postTitle(post)}
      onClose={onClose}
      footer={
        onDecide ? (
          <View style={styles.actions}>
            <Button
              label="Passar"
              variant="outline"
              icon="close"
              onPress={() => onDecide('pass')}
              style={styles.flex}
            />
            <Button
              testID="details-like"
              label="Dar match"
              icon="favorite"
              onPress={() => onDecide('like')}
              style={styles.flex}
            />
          </View>
        ) : undefined
      }
    >
      {post.kind === 'vaga' ? <VagaDetails post={post} /> : <CandidatoDetails post={post} />}
    </SheetModal>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="bodyStrong" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}

function VagaDetails({ post }: { post: VagaPost }) {
  const { vaga } = post;
  return (
    <>
      <AppText variant="bodyStrong" color="primary">
        {post.empresaNome} • {post.local}
      </AppText>
      <TagList>
        <Tag tone="neutral" icon="payments" label={vaga.faixaSalarial} />
        <Tag tone="neutral" icon="schedule" label={vaga.modalidade} />
        <Tag tone="neutral" icon="description" label={vaga.tipoContrato} />
        <Tag tone="neutral" icon="school" label={vaga.escolaridade} />
      </TagList>
      <Section title="Sobre a vaga">
        <AppText color="onSurfaceVariant">{vaga.descricao}</AppText>
      </Section>
      <Section title="Horário">
        <AppText color="onSurfaceVariant">{vaga.horario}</AppText>
      </Section>
      <Section title="Benefícios">
        <AppText color="onSurfaceVariant">{vaga.beneficios}</AppText>
      </Section>
    </>
  );
}

function CandidatoDetails({ post }: { post: CandidatoPost }) {
  return (
    <>
      <AppText variant="bodyStrong" color="primary">
        {post.cargoDesejado} • {post.local} • {post.idade} anos
      </AppText>
      <Section title="Experiências">
        <AppText color="onSurfaceVariant">{post.experiencias}</AppText>
      </Section>
      <Section title="Formação">
        <AppText color="onSurfaceVariant">
          {post.formacao} ({post.escolaridade})
        </AppText>
      </Section>
      <Section title="Hard skills">
        <TagList>
          {post.hardSkills.map((s) => (
            <Tag key={s} label={s} />
          ))}
        </TagList>
      </Section>
      <Section title="Soft skills">
        <TagList>
          {post.softSkills.map((s) => (
            <Tag key={s} label={s} />
          ))}
        </TagList>
      </Section>
      <Section title="O que procura">
        <TagList>
          <Tag tone="neutral" icon="payments" label={post.faixaSalarial} />
          {post.modalidades.map((m) => (
            <Tag key={m} tone="neutral" icon="schedule" label={m} />
          ))}
          {post.tiposContrato.map((t) => (
            <Tag key={t} tone="neutral" icon="description" label={t} />
          ))}
        </TagList>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: AppSpacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: AppSpacing.sm,
  },
  flex: {
    flex: 1,
  },
});
