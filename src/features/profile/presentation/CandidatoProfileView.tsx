import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppSpacing } from '@/app-shell/theme/tokens';
import type { Result } from '@/core/error/result';
import { AppText } from '@/core/ui/AppText';
import { Tag, TagList } from '@/core/ui/Tag';
import { CANDIDATO_STEPS, type CandidatoDraft } from '@/features/auth/domain/registration';
import { CandidatoStepFields } from '@/features/auth/presentation/signup/CandidatoStepFields';

import {
  applyCandidatoDraft,
  candidatoAge,
  candidatoToDraft,
  type CandidatoProfile,
  type Profile,
} from '../domain/profile';

import { EditSheet } from './EditSheet';
import { InfoRow, SectionCard } from './SectionCard';

/** Índices de CANDIDATO_STEPS — cada seção edita uma etapa do cadastro. */
const SECTION = { dados: 0, perfil: 1, preferencias: 2, habilidades: 3 } as const;
type SectionStep = (typeof SECTION)[keyof typeof SECTION];

const SECTION_TITLES: Record<SectionStep, string> = {
  0: 'Dados pessoais',
  1: 'Perfil profissional',
  2: 'O que procuro',
  3: 'Habilidades',
};

interface CandidatoProfileViewProps {
  profile: CandidatoProfile;
  onSave: (profile: Profile) => Promise<Result<Profile>>;
}

/** Corpo do perfil do candidato: o que a empresa vê no feed + dados privados. */
export function CandidatoProfileView({ profile, onSave }: CandidatoProfileViewProps) {
  const [editing, setEditing] = useState<SectionStep | null>(null);
  const age = candidatoAge(profile);

  return (
    <View style={styles.body}>
      <SectionCard testID="section-perfil" title={SECTION_TITLES[1]} onEdit={() => setEditing(SECTION.perfil)}>
        <InfoRow label="Vaga que procuro" value={profile.cargoDesejado} />
        <InfoRow label="Formação" value={profile.formacao} />
        <InfoRow label="Escolaridade" value={profile.escolaridade} />
        <InfoRow label="CEP" value={profile.cep} />
        <View style={styles.block}>
          <AppText variant="label" color="onSurfaceVariant">
            Experiências
          </AppText>
          <AppText color="onSurfaceVariant">{profile.experiencias}</AppText>
        </View>
      </SectionCard>

      <SectionCard
        testID="section-habilidades"
        title={SECTION_TITLES[3]}
        onEdit={() => setEditing(SECTION.habilidades)}
      >
        <View style={styles.block}>
          <AppText variant="label" color="onSurfaceVariant">
            Hard skills
          </AppText>
          <TagList>
            {profile.hardSkills.map((s) => (
              <Tag key={s} label={s} />
            ))}
          </TagList>
        </View>
        <View style={styles.block}>
          <AppText variant="label" color="onSurfaceVariant">
            Soft skills
          </AppText>
          <TagList>
            {profile.softSkills.map((s) => (
              <Tag key={s} label={s} />
            ))}
          </TagList>
        </View>
      </SectionCard>

      <SectionCard
        testID="section-preferencias"
        title={SECTION_TITLES[2]}
        onEdit={() => setEditing(SECTION.preferencias)}
      >
        <TagList>
          <Tag tone="neutral" icon="payments" label={profile.faixaSalarial} />
          {profile.modalidades.map((m) => (
            <Tag key={m} tone="neutral" icon="place" label={m} />
          ))}
          {profile.tiposContrato.map((t) => (
            <Tag key={t} tone="neutral" icon="description" label={t} />
          ))}
        </TagList>
      </SectionCard>

      <SectionCard
        testID="section-dados"
        title={SECTION_TITLES[0]}
        note="Visíveis só para você e para empresas com quem deu match."
        onEdit={() => setEditing(SECTION.dados)}
      >
        <InfoRow label="Nome completo" value={profile.nomeCompleto} />
        <InfoRow label="CPF" value={profile.cpf} />
        <InfoRow
          label="Data de nascimento"
          value={age != null ? `${profile.dataNascimento} (${age} anos)` : profile.dataNascimento}
        />
        <InfoRow label="E-mail" value={profile.email} />
        <InfoRow label="Celular" value={profile.celular} />
      </SectionCard>

      {editing != null ? (
        <EditSheet<CandidatoDraft>
          testID="edit-sheet"
          title={`Editar ${SECTION_TITLES[editing].toLowerCase()}`}
          initialDraft={candidatoToDraft(profile)}
          validate={CANDIDATO_STEPS[editing].validate}
          onSave={(draft) => onSave(applyCandidatoDraft(profile, draft))}
          onClose={() => setEditing(null)}
          renderFields={(args) => <CandidatoStepFields step={editing} {...args} />}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: AppSpacing.lg,
  },
  block: {
    gap: AppSpacing.xs,
    paddingVertical: AppSpacing.xs,
  },
});
