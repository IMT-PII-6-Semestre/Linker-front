import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppSpacing } from '@/app-shell/theme/tokens';
import type { Result } from '@/core/error/result';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { ConfirmDialog } from '@/core/ui/ConfirmDialog';
import { Tag, TagList } from '@/core/ui/Tag';
import { EMPRESA_STEPS, type EmpresaDraft } from '@/features/auth/domain/registration';
import { EmpresaStepFields } from '@/features/auth/presentation/signup/EmpresaStepFields';

import {
  applyEmpresaDraft,
  draftToVaga,
  empresaToDraft,
  removeVaga,
  upsertVaga,
  type EmpresaProfile,
  type Profile,
  type Vaga,
} from '../domain/profile';

import { EditSheet } from './EditSheet';
import { InfoRow, SectionCard } from './SectionCard';

type Editing = { kind: 'dados' } | { kind: 'vaga'; vaga: Vaga | null };

interface EmpresaProfileViewProps {
  profile: EmpresaProfile;
  onSave: (profile: Profile) => Promise<Result<Profile>>;
}

/** Vaga = etapas "A vaga" + "Requisitos" do cadastro, validadas juntas. */
const validateVaga = (draft: EmpresaDraft) => ({
  ...EMPRESA_STEPS[1].validate(draft),
  ...EMPRESA_STEPS[2].validate(draft),
});

/** Corpo do perfil da empresa: dados fixos + vagas (cada uma editável). */
export function EmpresaProfileView({ profile, onSave }: EmpresaProfileViewProps) {
  const [editing, setEditing] = useState<Editing | null>(null);
  const [removing, setRemoving] = useState<Vaga | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);

  const confirmRemove = async () => {
    if (!removing) return;
    setRemoveBusy(true);
    await onSave(removeVaga(profile, removing.id));
    setRemoveBusy(false);
    setRemoving(null);
  };

  return (
    <View style={styles.body}>
      <View style={styles.vagasHeader}>
        <AppText variant="bodyStrong" style={styles.vagasTitle} accessibilityRole="header">
          Vagas abertas ({profile.vagas.length})
        </AppText>
        <Button
          testID="profile-add-vaga"
          label="Nova vaga"
          icon="add"
          variant="ghost"
          onPress={() => setEditing({ kind: 'vaga', vaga: null })}
        />
      </View>

      {profile.vagas.length === 0 ? (
        <Card>
          <AppText color="onSurfaceVariant" align="center">
            Nenhuma vaga aberta. Cadastre uma para aparecer no feed dos talentos.
          </AppText>
        </Card>
      ) : (
        profile.vagas.map((vaga) => (
          <VagaCard
            key={vaga.id}
            vaga={vaga}
            onEdit={() => setEditing({ kind: 'vaga', vaga })}
            onRemove={() => setRemoving(vaga)}
          />
        ))
      )}

      <SectionCard testID="section-empresa" title="Dados da empresa" onEdit={() => setEditing({ kind: 'dados' })}>
        <InfoRow label="Nome" value={profile.nomeEmpresa} />
        <InfoRow label="CNPJ / MEI" value={profile.cnpj} />
        <InfoRow label="Fundação" value={profile.dataFundacao} />
        <InfoRow label="Endereço" value={profile.endereco} />
        <InfoRow label="Telefone" value={profile.telefone} />
        <InfoRow label="E-mail" value={profile.email} />
      </SectionCard>

      {editing?.kind === 'dados' ? (
        <EditSheet<EmpresaDraft>
          testID="edit-sheet"
          title="Editar dados da empresa"
          initialDraft={empresaToDraft(profile)}
          validate={EMPRESA_STEPS[0].validate}
          onSave={(draft) => onSave(applyEmpresaDraft(profile, draft))}
          onClose={() => setEditing(null)}
          renderFields={(args) => <EmpresaStepFields step={0} {...args} />}
        />
      ) : null}

      {editing?.kind === 'vaga' ? (
        <EditSheet<EmpresaDraft>
          testID="edit-sheet"
          title={editing.vaga ? 'Editar vaga' : 'Nova vaga'}
          initialDraft={empresaToDraft(profile, editing.vaga ?? undefined)}
          validate={validateVaga}
          onSave={(draft) =>
            onSave(upsertVaga(profile, draftToVaga(draft, editing.vaga?.id ?? `vaga-${Date.now()}`)))
          }
          onClose={() => setEditing(null)}
          renderFields={(args) => (
            <>
              <EmpresaStepFields step={1} {...args} />
              <EmpresaStepFields step={2} {...args} />
            </>
          )}
        />
      ) : null}

      <ConfirmDialog
        visible={removing != null}
        title="Remover vaga?"
        message={`"${removing?.cargo ?? ''}" sai do feed dos talentos. Conversas já iniciadas continuam no chat.`}
        confirmLabel="Remover"
        destructive
        loading={removeBusy}
        onConfirm={confirmRemove}
        onCancel={() => setRemoving(null)}
      />
    </View>
  );
}

function VagaCard({ vaga, onEdit, onRemove }: { vaga: Vaga; onEdit: () => void; onRemove: () => void }) {
  return (
    <Card testID={`vaga-${vaga.id}`} style={styles.vagaCard}>
      <AppText variant="heading">{vaga.cargo}</AppText>
      <TagList>
        <Tag tone="neutral" icon="payments" label={vaga.faixaSalarial} />
        <Tag tone="neutral" icon="place" label={vaga.modalidade} />
        <Tag tone="neutral" icon="description" label={vaga.tipoContrato} />
        <Tag tone="neutral" icon="school" label={vaga.escolaridade} />
      </TagList>
      <AppText color="onSurfaceVariant" numberOfLines={3}>
        {vaga.descricao}
      </AppText>
      <InfoRow label="Horário" value={vaga.horario} />
      <InfoRow label="Benefícios" value={vaga.beneficios} />
      <View style={styles.vagaActions}>
        <Button label="Remover" variant="ghost" icon="delete-outline" onPress={onRemove} style={styles.flex} />
        <Button label="Editar" variant="outline" icon="edit" onPress={onEdit} style={styles.flex} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: AppSpacing.lg,
  },
  vagasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -AppSpacing.sm,
  },
  vagasTitle: {
    fontSize: 16,
  },
  vagaCard: {
    gap: AppSpacing.sm,
  },
  vagaActions: {
    flexDirection: 'row',
    gap: AppSpacing.sm,
    marginTop: AppSpacing.xs,
  },
  flex: {
    flex: 1,
  },
});
