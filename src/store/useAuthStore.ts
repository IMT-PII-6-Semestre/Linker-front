import { create } from 'zustand';

// Tipagem baseada nos fluxos A (Empregado) e B (Empregador)[cite: 1]
export type UserRole = 'empregado' | 'empregador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Simulação da Mock API
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    // Simula o tempo de latência de uma rede real
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Lógica FakeAuth baseada na regra de testes do projeto[cite: 1, 2]
    if (email === 'offline@linker.com' && password === '123456') {
      set({ isLoading: false, error: 'Erro de conexão com a rede.' });
      return;
    }

    if (password === '123456' && email.includes('@')) {
      // Sucesso na simulação (mock)
      const isEmployer = email.includes('empresa');
      set({
        user: {
          id: Math.random().toString(36).substring(7),
          name: isEmployer ? 'Empresa Mock' : 'Candidato Mock',
          email,
          role: isEmployer ? 'empregador' : 'empregado',
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ isLoading: false, error: 'Credenciais inválidas.' });
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));