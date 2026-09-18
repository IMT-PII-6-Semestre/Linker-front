import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AppProviders } from '@/app-shell/AppProviders';
import { ThemeProvider } from '@/app-shell/theme/ThemeProvider';
import { FakeAuthRepository } from '@/features/auth/data/fakeAuthRepository';

import { LoginScreenMobile } from '../LoginScreenMobile';

function renderLogin() {
  return render(
    <AppProviders origin="mobile" authRepository={new FakeAuthRepository(0)}>
      <ThemeProvider>
        <LoginScreenMobile />
      </ThemeProvider>
    </AppProviders>,
  );
}

describe('LoginForm', () => {
  it('não envia com e-mail inválido e mostra o erro do campo', async () => {
    await renderLogin();

    await fireEvent.changeText(screen.getByTestId('login-email'), 'sem-arroba');
    await fireEvent.changeText(screen.getByTestId('login-password'), '123456');
    await fireEvent.press(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(screen.getByText('E-mail inválido.')).toBeTruthy();
    });
    expect(screen.queryByTestId('failure-banner')).toBeNull();
  });

  it('mostra a falha do servidor quando a senha está errada', async () => {
    await renderLogin();

    await fireEvent.changeText(screen.getByTestId('login-email'), 'contratador@empresa.com');
    await fireEvent.changeText(screen.getByTestId('login-password'), 'senha-errada');
    await fireEvent.press(screen.getByTestId('login-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('failure-banner')).toBeTruthy();
    });
    expect(screen.getByText('E-mail ou senha incorretos.')).toBeTruthy();
  });

  it('limpa a falha ao editar o formulário de novo', async () => {
    await renderLogin();

    await fireEvent.changeText(screen.getByTestId('login-email'), 'contratador@empresa.com');
    await fireEvent.changeText(screen.getByTestId('login-password'), 'senha-errada');
    await fireEvent.press(screen.getByTestId('login-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('failure-banner')).toBeTruthy();
    });

    await fireEvent.changeText(screen.getByTestId('login-password'), '123456');

    await waitFor(() => {
      expect(screen.queryByTestId('failure-banner')).toBeNull();
    });
  });
});
