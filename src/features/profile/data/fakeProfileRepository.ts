import { UnauthorizedFailure } from '@/core/error/failure';
import { err, ok, type Result } from '@/core/error/result';
import type { SignUpPayload } from '@/features/auth/domain/registration';
import type { Session } from '@/features/auth/domain/session';

import type { Profile } from '../domain/profile';
import type { ProfileRepository } from '../domain/profileRepository';

/**
 * Perfis em memória, enquanto a API não existe.
 *
 * - Quem se cadastrou tem o perfil criado com os dados do cadastro
 *   (ver `seedFromSignUp`, chamado pelo FakeAuthRepository).
 * - Quem entrou com as contas de demonstração ganha um perfil de exemplo,
 *   inspirado no protótipo (mvp.html).
 * - Admin não tem perfil: ele só acessa o painel web.
 */
export class FakeProfileRepository implements ProfileRepository {
  private readonly profiles = new Map<string, Profile>();

  constructor(private readonly latencyMs: number = 500) {}

  seedFromSignUp(session: Session, payload: SignUpPayload): void {
    if (payload.role === 'candidato') {
      const { role: _role, senha: _senha, ...fields } = payload;
      this.profiles.set(session.userId, { ...fields, role: 'candidato', userId: session.userId, fotoUri: null });
    } else {
      const { role: _role, senha: _senha, vaga, ...fields } = payload;
      this.profiles.set(session.userId, {
        ...fields,
        role: 'empresa',
        userId: session.userId,
        fotoUri: null,
        vagas: [{ ...vaga, id: `vaga-${Date.now()}` }],
      });
    }
  }

  async getProfile(session: Session): Promise<Result<Profile>> {
    await delay(this.latencyMs);
    if (session.role === 'admin') {
      return err(UnauthorizedFailure('Administradores não têm perfil no app. Use o painel web.'));
    }
    let profile = this.profiles.get(session.userId);
    if (!profile) {
      profile = demoProfile(session);
      this.profiles.set(session.userId, profile);
    }
    return ok(profile);
  }

  async saveProfile(profile: Profile): Promise<Result<Profile>> {
    await delay(this.latencyMs);
    this.profiles.set(profile.userId, profile);
    return ok(profile);
  }
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function demoProfile(session: Session): Profile {
  if (session.role === 'empresa') {
    return {
      role: 'empresa',
      userId: session.userId,
      fotoUri: null,
      cnpj: '11.222.333/0001-81',
      nomeEmpresa: session.name,
      dataFundacao: '12/05/2015',
      endereco: 'Av. Paulista, 1000 — Bela Vista, São Paulo — SP',
      telefone: '(11) 3456-7890',
      email: session.email,
      vagas: [
        {
          id: 'vaga-demo-1',
          cargo: 'Desenvolvedor Front-End',
          descricao:
            'Buscamos um desenvolvedor pragmático para nosso time. Aqui não tem teste de personalidade bizarro: queremos ver seu código e bater um papo sincero.',
          beneficios: 'VR, plano de saúde, auxílio home office',
          horario: 'Seg a sex, 9h às 18h',
          escolaridade: 'Superior em andamento',
          tipoContrato: 'CLT',
          faixaSalarial: 'R$ 6 a 10 mil',
          modalidade: 'Híbrido',
        },
      ],
    };
  }
  return {
    role: 'candidato',
    userId: session.userId,
    fotoUri: null,
    nomeCompleto: session.name,
    cpf: '529.982.247-25',
    dataNascimento: '15/03/2002',
    email: session.email,
    celular: '(11) 91234-5678',
    escolaridade: 'Superior completo',
    cargoDesejado: 'Desenvolvedor Front-end',
    formacao: 'Análise e Desenvolvimento de Sistemas — Fatec',
    cep: '01310-100',
    tiposContrato: ['CLT', 'PJ'],
    experiencias:
      'Desenvolvedor Front-end com 3 anos de experiência. Focado em interfaces limpas e usabilidade. Cansado de processos seletivos de meses. Pragmatismo é a chave.',
    faixaSalarial: 'R$ 6 a 10 mil',
    hardSkills: ['React', 'JavaScript', 'UI/UX', 'Figma'],
    softSkills: ['Comunicação', 'Trabalho em equipe', 'Proatividade'],
    modalidades: ['Híbrido', 'Remoto'],
  };
}
