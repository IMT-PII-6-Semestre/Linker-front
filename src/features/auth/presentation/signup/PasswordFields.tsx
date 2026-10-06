import { useRef, useState } from 'react';
import type { TextInput } from 'react-native';

import { TextField } from '@/core/ui/TextField';

import { MIN_PASSWORD_LENGTH } from '../../domain/credentials';

interface PasswordFieldsProps {
  senha: string;
  confirmacaoSenha: string;
  errors: Record<string, string>;
  onChange: (patch: { senha?: string; confirmacaoSenha?: string }) => void;
  onSubmit: () => void;
}

/** Última etapa dos dois fluxos: senha + confirmação, com "mostrar senha". */
export function PasswordFields({ senha, confirmacaoSenha, errors, onChange, onSubmit }: PasswordFieldsProps) {
  const [hidden, setHidden] = useState(true);
  const confirmRef = useRef<TextInput>(null);

  return (
    <>
      <TextField
        testID="signup-senha"
        label="Senha"
        value={senha}
        onChangeText={(v) => onChange({ senha: v })}
        secureTextEntry={hidden}
        helperText={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres.`}
        errorText={errors.senha}
        leftIcon="lock-outline"
        rightIcon={hidden ? 'visibility' : 'visibility-off'}
        rightIconLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
        onRightIconPress={() => setHidden((h) => !h)}
        textContentType="newPassword"
        autoComplete="new-password"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />
      <TextField
        ref={confirmRef}
        testID="signup-confirmacao"
        label="Confirme a senha"
        value={confirmacaoSenha}
        onChangeText={(v) => onChange({ confirmacaoSenha: v })}
        secureTextEntry={hidden}
        errorText={errors.confirmacaoSenha}
        leftIcon="lock-outline"
        textContentType="newPassword"
        autoComplete="new-password"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
    </>
  );
}
