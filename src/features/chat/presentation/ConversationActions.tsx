import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppSizes, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import type { Failure } from '@/core/error/failure';
import type { Result } from '@/core/error/result';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { ChipSelect } from '@/core/ui/ChipSelect';
import { ConfirmDialog } from '@/core/ui/ConfirmDialog';
import { FailureBanner } from '@/core/ui/FailureBanner';
import { SheetModal } from '@/core/ui/SheetModal';
import { TextField } from '@/core/ui/TextField';

import { REPORT_REASONS, type ReportReason } from '../domain/chat';

export type ConversationAction = 'unmatch' | 'block' | 'report';

interface ConversationActionsProps {
  participantName: string;
  /** Qual fluxo está aberto: o menu, uma confirmação ou a denúncia. */
  open: 'menu' | ConversationAction | null;
  onOpen: (open: 'menu' | ConversationAction | null) => void;
  onUnmatch: () => Promise<Result<void>>;
  onBlock: () => Promise<Result<void>>;
  onReport: (reason: ReportReason, details: string) => Promise<Result<void>>;
  /** Denúncia enviada — a tela mostra o aviso. */
  onReported: () => void;
}

/**
 * Menu ⋮ da conversa: desfazer match, bloquear e denunciar. As duas
 * primeiras pedem confirmação (não dá para desfazer); a denúncia pede o motivo.
 */
export function ConversationActions({
  participantName,
  open,
  onOpen,
  onUnmatch,
  onBlock,
  onReport,
  onReported,
}: ConversationActionsProps) {
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  const run = async (action: () => Promise<Result<void>>) => {
    setBusy(true);
    setFailure(null);
    const result = await action();
    setBusy(false);
    if (result.kind === 'err') setFailure(result.failure);
    // Sucesso: a tela sai da conversa (ela não existe mais).
  };

  const close = () => {
    if (busy) return;
    setFailure(null);
    onOpen(null);
  };

  return (
    <>
      <SheetModal
        visible={open === 'menu'}
        title="Opções da conversa"
        onClose={close}
        testID="conversation-menu"
      >
        <View style={styles.menu}>
          <MenuItem
            icon="link-off"
            label="Desfazer match"
            description="A conversa some para os dois lados."
            onPress={() => onOpen('unmatch')}
            testID="action-unmatch"
          />
          <MenuItem
            icon="block"
            label="Bloquear"
            description={`${participantName} não poderá mais falar com você.`}
            onPress={() => onOpen('block')}
            testID="action-block"
            destructive
          />
          <MenuItem
            icon="flag"
            label="Denunciar"
            description="Avise a equipe Linker sobre um problema."
            onPress={() => onOpen('report')}
            testID="action-report"
            destructive
          />
        </View>
      </SheetModal>

      <ConfirmDialog
        visible={open === 'unmatch'}
        title="Desfazer match?"
        message={
          failure?.message ?? `A conversa com ${participantName} será apagada para os dois lados.`
        }
        confirmLabel="Desfazer match"
        destructive
        loading={busy}
        onConfirm={() => void run(onUnmatch)}
        onCancel={close}
      />

      <ConfirmDialog
        visible={open === 'block'}
        title={`Bloquear ${participantName}?`}
        message={
          failure?.message ?? 'A conversa será apagada e vocês não aparecerão mais um para o outro.'
        }
        confirmLabel="Bloquear"
        destructive
        loading={busy}
        onConfirm={() => void run(onBlock)}
        onCancel={close}
      />

      {open === 'report' ? (
        <ReportSheet
          participantName={participantName}
          onClose={close}
          onSubmit={async (reason, details) => {
            const result = await onReport(reason, details);
            if (result.kind === 'ok') {
              onOpen(null);
              onReported();
            }
            return result;
          }}
        />
      ) : null}
    </>
  );
}

function MenuItem({
  icon,
  label,
  description,
  onPress,
  destructive = false,
  testID,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
  destructive?: boolean;
  testID?: string;
}) {
  const colors = useAppTheme();
  const color = destructive ? colors.error : colors.onSurface;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={description}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: pressed ? colors.surfaceVariant : colors.surface },
      ]}
    >
      <MaterialIcons name={icon} size={24} color={color} />
      <View style={styles.itemText}>
        <AppText variant="bodyStrong" style={{ color }}>
          {label}
        </AppText>
        <AppText variant="label" color="onSurfaceVariant">
          {description}
        </AppText>
      </View>
    </Pressable>
  );
}

function ReportSheet({
  participantName,
  onClose,
  onSubmit,
}: {
  participantName: string;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details: string) => Promise<Result<void>>;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  const submit = async () => {
    if (!reason) {
      setError('Escolha um motivo.');
      return;
    }
    if (reason === 'Outro motivo' && details.trim().length === 0) {
      setError('Conte o que aconteceu.');
      return;
    }
    setSending(true);
    setFailure(null);
    const result = await onSubmit(reason, details.trim());
    if (result.kind === 'err') {
      setSending(false);
      setFailure(result.failure);
    }
  };

  return (
    <SheetModal
      visible
      testID="report-sheet"
      title={`Denunciar ${participantName}`}
      onClose={sending ? () => undefined : onClose}
      footer={
        <Button
          testID="report-submit"
          label="Enviar denúncia"
          variant="danger"
          loading={sending}
          onPress={submit}
        />
      }
    >
      {failure ? <FailureBanner failure={failure} /> : null}
      <AppText color="onSurfaceVariant">
        A denúncia é anônima. Nossa equipe analisa e pode remover perfis que violem as regras.
      </AppText>
      <ChipSelect
        label="Motivo"
        options={REPORT_REASONS}
        value={reason}
        onChange={(r) => {
          setReason(r);
          setError(null);
        }}
        errorText={reason ? null : error}
      />
      <TextField
        label="Detalhes (opcional)"
        value={details}
        onChangeText={(v) => {
          setDetails(v);
          setError(null);
        }}
        placeholder="O que aconteceu?"
        autoCapitalize="sentences"
        multiline
        maxLength={500}
        errorText={reason ? error : null}
      />
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  menu: {
    gap: AppSpacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.md,
    minHeight: AppSizes.touchTarget + 16,
    paddingHorizontal: AppSpacing.md,
    borderRadius: 12,
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
});
