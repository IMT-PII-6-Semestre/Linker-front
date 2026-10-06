import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProviders, useSessionStore } from '@/app-shell/AppProviders';
import { ThemeProvider } from '@/app-shell/theme/ThemeProvider';
import { FakeAuthRepository } from '@/features/auth/data/fakeAuthRepository';

import { FakeAdminRepository } from '../../data/fakeAdminRepository';
import { AdminDashboardScreen } from '../AdminDashboardScreen';

const metrics = {
  frame: { x: 0, y: 0, width: 1280, height: 900 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function SignedIn({ email }: { email: string }) {
  const signIn = useSessionStore((s) => s.signIn);
  const session = useSessionStore((s) => s.session);
  useEffect(() => {
    void signIn({ email, password: '123456' });
  }, [signIn, email]);
  return session ? <AdminDashboardScreen /> : null;
}

async function renderDashboard(email = 'admin@linker.com') {
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <AppProviders
        origin="web"
        authRepository={new FakeAuthRepository(0)}
        adminRepository={new FakeAdminRepository(0)}
      >
        <ThemeProvider>
          <SignedIn email={email} />
        </ThemeProvider>
      </AppProviders>
    </SafeAreaProvider>,
  );
}

describe('AdminDashboardScreen', () => {
  it('mostra o total, os KPIs e a taxa de match', async () => {
    await renderDashboard();

    const hero = await screen.findByTestId('hero-total-usuarios');
    expect(within(hero).getByText('1.434')).toBeTruthy();
    expect(within(screen.getByTestId('kpi-empregados')).getByText('1.248')).toBeTruthy();
    expect(within(screen.getByTestId('kpi-empregadores')).getByText('186')).toBeTruthy();
    expect(within(screen.getByTestId('kpi-matches')).getByText('2.431')).toBeTruthy();
    expect(within(screen.getByTestId('panel-taxa')).getByText('24,6%')).toBeTruthy();
    expect(screen.getByText(/\+16,4%/)).toBeTruthy();
  });

  it('gráfico alterna para tabela (alternativa ao hover)', async () => {
    await renderDashboard();
    await screen.findByTestId('chart-semanas');

    // Rótulo direto só na semana mais recente.
    expect(within(screen.getByTestId('chart-semanas')).getByText('319')).toBeTruthy();
    expect(within(screen.getByTestId('chart-semanas')).queryByText('182')).toBeNull();

    await fireEvent.press(screen.getByTestId('panel-semanas-toggle-table'));

    const panel = screen.getByTestId('panel-semanas');
    expect(within(panel).getByText('Semana')).toBeTruthy();
    expect(within(panel).getByText('182')).toBeTruthy();
    expect(screen.queryByTestId('chart-semanas')).toBeNull();
  });

  it('foco/hover numa coluna mostra o valor no tooltip', async () => {
    await renderDashboard();
    await screen.findByTestId('chart-semanas');

    await fireEvent(screen.getByTestId('chart-semanas-col-0'), 'focus');

    expect(within(screen.getByTestId('chart-semanas')).getByText('182 matches')).toBeTruthy();
  });

  it('conta que não é admin vê "Acesso restrito"', async () => {
    await renderDashboard('rh@empresa.com');

    expect(await screen.findByTestId('admin-denied')).toBeTruthy();
    expect(screen.queryByTestId('hero-total-usuarios')).toBeNull();
    expect(screen.getByTestId('logout-button')).toBeTruthy();
  });
});
