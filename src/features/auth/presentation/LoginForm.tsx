import { useRef, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';
import { useStore } from 'zustand';

import { useSessionStore } from '@/app-shell/AppProviders';
import { AppSpacing } from '@/app-shell/theme/tokens';
import { Button } from '@/core/ui/Button';
import { FailureBanner } from '@/core/ui/FailureBanner';
import { TextField } from '@/core/ui/TextField';

import { validateEmail, validatePassword } from '../domain/credentials';
import { createLoginFormStore } from '../state/loginFormStore';

interface LoginFormProps {
  submitLabel?: string;
}

/**
 * Formulário de login compartilhado pelas duas origens.
 *
 * Web e mobile mudam a moldura da tela (ver LoginScreenWeb/LoginScreenMobile),
 * não a lógica: regra de validação, estados e chamada de autenticação vivem
 * aqui uma vez só.
 */
export function LoginForm({ submitLabel = 'Entrar' }: LoginFormProps) {
  const signIn = useSessionStore((s) => s.signIn);
  const [formStore] = useState(() => createLoginFormStore(signIn));
  const submitting = useStore(formStore, (s) => s.submitting);
  const failure = useStore(formStore, (s) => s.failure);
  const submit = useStore(formStore, (s) => s.submit);
  const clearFailure = useStore(formStore, (s) => s.clearFailure);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [obscurePassword, setObscurePassword] = useState(true);
  const [touched, setTouched] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);

  const emailError = touched ? validateEmail(email) : null;
  const passwordError = touched ? validatePassword(password) : null;

  const handleChangeEmail = (value: string) => {
    setEmail(value);
    clearFailure();
  };

  const handleChangePassword = (value: string) => {
    setPassword(value);
    clearFailure();
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    setTouched(true);
    if (validateEmail(email) || validatePassword(password)) return;

    // Sucesso não navega daqui: o guard de rotas reage à mudança de sessão.
    // O erro já fica no estado da store e é renderizado pelo FailureBanner.
    void submit({ email: email.trim(), password });
  };

  return (
    <View style={styles.container}>
      {failure ? <FailureBanner failure={failure} /> : null}
      <TextField
        testID="login-email"
        label="E-mail"
        placeholder="voce@empresa.com"
        value={email}
        onChangeText={handleChangeEmail}
        editable={!submitting}
        autoFocus
        keyboardType="email-address"
        returnKeyType="next"
        onSubmitEditing={() => passwordInputRef.current?.focus()}
        errorText={emailError}
        leftIcon="alternate-email"
        textContentType="username"
        autoComplete="email"
      />
      <TextField
        ref={passwordInputRef}
        testID="login-password"
        label="Senha"
        value={password}
        onChangeText={handleChangePassword}
        editable={!submitting}
        secureTextEntry={obscurePassword}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        errorText={passwordError}
        leftIcon="lock-outline"
        rightIcon={obscurePassword ? 'visibility' : 'visibility-off'}
        rightIconLabel={obscurePassword ? 'Mostrar senha' : 'Ocultar senha'}
        onRightIconPress={() => setObscurePassword((v) => !v)}
        textContentType="password"
        autoComplete="current-password"
      />
      <Button
        testID="login-submit"
        label={submitLabel}
        loading={submitting}
        disabled={submitting}
        onPress={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: AppSpacing.md,
  },
});
