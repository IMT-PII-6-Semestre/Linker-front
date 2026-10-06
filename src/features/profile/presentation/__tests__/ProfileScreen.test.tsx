import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProviders, useSessionStore } from '@/app-shell/AppProviders';
import { ThemeProvider } from '@/app-shell/theme/ThemeProvider';
import { FakeAuthRepository } from '@/features/auth/data/fakeAuthRepository';

import { FakeProfileRepository } from '../../data/fakeProfileRepository';
import { ProfileScreen } from '../ProfileScreen';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

/** Faz login com uma conta de demonstração antes de mostrar o perfil. */
function SignedIn({ email }: { email: string }) {
  const signIn = useSessionStore((s) => s.signIn);
  const session = useSessionStore((s) => s.session);
  useEffect(() => {
    void signIn({ email, password: '123456' });
  }, [signIn, email]);
  return session ? <ProfileScreen /> : null;
}

function renderProfile(email: string) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <AppProviders
        origin="mobile"
        authRepository={new FakeAuthRepository(0)}
        profileRepository={new FakeProfileRepository(0)}
      >
        <ThemeProvider>
          <SignedIn email={email} />
        </ThemeProvider>
      </AppProviders>
    </SafeAreaProvider>,
  );
}

describe('ProfileScreen', () => {
  it('candidato: mostra o perfil e edita as habilidades', async () => {
    await renderProfile('ana.souza@email.com');

    await screen.findByTestId('section-habilidades');
    expect(within(screen.getByTestId('section-habilidades')).getByText('React')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('section-habilidades-edit'));
    const sheet = await screen.findByTestId('edit-sheet');
    await fireEvent.press(within(sheet).getByLabelText('Remover React'));
    await fireEvent.press(screen.getByTestId('edit-sheet-save'));

    await waitFor(() => expect(screen.queryByTestId('edit-sheet')).toBeNull());
    expect(within(screen.getByTestId('section-habilidades')).queryByText('React')).toBeNull();
  });

  it('candidato: não salva com erro de validação', async () => {
    await renderProfile('ana.souza@email.com');
    await screen.findByTestId('section-habilidades');

    await fireEvent.press(screen.getByTestId('section-dados-edit'));
    await screen.findByTestId('edit-sheet');
    await fireEvent.changeText(screen.getByTestId('signup-cpf'), '111.111.111-11');
    await fireEvent.press(screen.getByTestId('edit-sheet-save'));

    expect(await screen.findByText('CPF inválido.')).toBeTruthy();
    expect(screen.getByTestId('edit-sheet')).toBeTruthy();
  });

  it('empresa: remove uma vaga após confirmar', async () => {
    await renderProfile('rh@minhaempresa.com');
    await waitFor(() => expect(screen.getByText('Vagas abertas (1)')).toBeTruthy());

    await fireEvent.press(screen.getByLabelText('Remover'));
    await fireEvent.press(await screen.findByTestId('confirm-dialog-confirm'));

    await waitFor(() => expect(screen.getByText('Vagas abertas (0)')).toBeTruthy());
  });
});
