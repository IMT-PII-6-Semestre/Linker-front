import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AppProviders } from '@/app-shell/AppProviders';
import { ThemeProvider } from '@/app-shell/theme/ThemeProvider';
import { FakeAuthRepository } from '@/features/auth/data/fakeAuthRepository';

import { SignUpScreen } from '../signup/SignUpScreen';

function renderSignUp() {
  return render(
    <AppProviders origin="mobile" authRepository={new FakeAuthRepository(0)}>
      <ThemeProvider>
        <SignUpScreen />
      </ThemeProvider>
    </AppProviders>,
  );
}

describe('SignUpScreen', () => {
  it('só continua depois de escolher o perfil', async () => {
    await renderSignUp();

    await fireEvent.press(screen.getByTestId('signup-role-continue'));
    expect(screen.queryByText('Seus dados')).toBeNull();

    await fireEvent.press(screen.getByTestId('role-candidato'));
    await fireEvent.press(screen.getByTestId('signup-role-continue'));

    await waitFor(() => {
      expect(screen.getByText('Seus dados')).toBeTruthy();
    });
    expect(screen.getByLabelText('Etapa 1 de 5')).toBeTruthy();
  });

  it('mostra erro inline e só avança com a etapa válida', async () => {
    await renderSignUp();
    await fireEvent.press(screen.getByTestId('role-empresa'));
    await fireEvent.press(screen.getByTestId('signup-role-continue'));

    await fireEvent.press(screen.getByTestId('signup-next'));
    await waitFor(() => {
      expect(screen.getByText('Informe o CNPJ ou MEI.')).toBeTruthy();
    });

    await fireEvent.changeText(screen.getByTestId('signup-cnpj'), '11222333000181');
    // Máscara aplicada e erro do campo limpo ao editar.
    expect(screen.getByDisplayValue('11.222.333/0001-81')).toBeTruthy();
    expect(screen.queryByText('Informe o CNPJ ou MEI.')).toBeNull();
  });

  it('voltar na primeira etapa retorna à escolha de perfil', async () => {
    await renderSignUp();
    await fireEvent.press(screen.getByTestId('role-candidato'));
    await fireEvent.press(screen.getByTestId('signup-role-continue'));
    await waitFor(() => expect(screen.getByText('Seus dados')).toBeTruthy());

    await fireEvent.press(screen.getByTestId('signup-back'));

    await waitFor(() => {
      expect(screen.getByText('O que você está buscando?')).toBeTruthy();
    });
  });
});
