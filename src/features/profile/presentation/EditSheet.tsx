import { useState, type ReactNode } from 'react';
import { Keyboard } from 'react-native';

import type { Failure } from '@/core/error/failure';
import type { Result } from '@/core/error/result';
import { Button } from '@/core/ui/Button';
import { FailureBanner } from '@/core/ui/FailureBanner';
import { SheetModal } from '@/core/ui/SheetModal';

export interface EditFieldsArgs<D> {
  draft: D;
  errors: Record<string, string>;
  onChange: (patch: Partial<D>) => void;
  onSubmit: () => void;
}

interface EditSheetProps<D> {
  title: string;
  initialDraft: D;
  /** Mesmas regras do cadastro: devolve erros por campo. */
  validate: (draft: D) => Partial<Record<keyof D, string>>;
  onSave: (draft: D) => Promise<Result<unknown>>;
  onClose: () => void;
  renderFields: (args: EditFieldsArgs<D>) => ReactNode;
  testID?: string;
}

/**
 * Edição de uma seção do perfil numa bottom sheet. Montar só enquanto
 * estiver editando — o rascunho nasce do perfil atual a cada abertura.
 */
export function EditSheet<D>({
  title,
  initialDraft,
  validate,
  onSave,
  onClose,
  renderFields,
  testID,
}: EditSheetProps<D>) {
  const [draft, setDraft] = useState(initialDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  const onChange = (patch: Partial<D>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setFailure(null);
    setErrors((e) => {
      const keys = Object.keys(patch);
      if (!keys.some((k) => k in e)) return e;
      const next = { ...e };
      for (const k of keys) delete next[k];
      return next;
    });
  };

  const handleSave = async () => {
    if (saving) return;
    Keyboard.dismiss();
    const found = validate(draft) as Record<string, string>;
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setSaving(true);
    const result = await onSave(draft);
    if (result.kind === 'ok') {
      onClose();
      return;
    }
    setSaving(false);
    setFailure(result.failure);
  };

  return (
    <SheetModal
      visible
      title={title}
      onClose={saving ? () => undefined : onClose}
      testID={testID}
      footer={<Button testID="edit-sheet-save" label="Salvar" loading={saving} onPress={handleSave} />}
    >
      {failure ? <FailureBanner failure={failure} /> : null}
      {renderFields({ draft, errors, onChange, onSubmit: handleSave })}
    </SheetModal>
  );
}
