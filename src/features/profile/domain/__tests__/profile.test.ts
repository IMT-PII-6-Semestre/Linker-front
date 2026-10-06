import { emptyEmpresaDraft } from '@/features/auth/domain/registration';

import {
  applyCandidatoDraft,
  applyEmpresaDraft,
  candidatoAge,
  candidatoToDraft,
  draftToVaga,
  empresaToDraft,
  removeVaga,
  upsertVaga,
  type CandidatoProfile,
  type EmpresaProfile,
  type Vaga,
} from '../profile';

const candidato: CandidatoProfile = {
  role: 'candidato',
  userId: 'u1',
  fotoUri: 'file://foto.jpg',
  nomeCompleto: 'Alexandre Silva',
  cpf: '529.982.247-25',
  dataNascimento: '15/03/2000',
  email: 'alexandre@email.com',
  celular: '(11) 91234-5678',
  escolaridade: 'Superior completo',
  cargoDesejado: 'Front-end',
  formacao: 'ADS',
  cep: '01310-100',
  tiposContrato: ['CLT'],
  experiencias: '3 anos',
  faixaSalarial: 'R$ 6 a 10 mil',
  hardSkills: ['React'],
  softSkills: ['Comunicação'],
  modalidades: ['Remoto'],
};

const vaga: Vaga = {
  id: 'v1',
  cargo: 'Dev',
  descricao: 'Front',
  beneficios: 'VR',
  horario: '9h-18h',
  escolaridade: 'Médio',
  tipoContrato: 'CLT',
  faixaSalarial: 'A combinar',
  modalidade: 'Remoto',
};

const empresa: EmpresaProfile = {
  role: 'empresa',
  userId: 'e1',
  fotoUri: null,
  cnpj: '11.222.333/0001-81',
  nomeEmpresa: 'TechNova',
  dataFundacao: '01/01/2010',
  endereco: 'Rua A, 1',
  telefone: '(11) 3456-7890',
  email: 'rh@technova.com',
  vagas: [vaga],
};

describe('perfil do candidato', () => {
  it('ida e volta pelo rascunho preserva id e foto', () => {
    const draft = { ...candidatoToDraft(candidato), hardSkills: ['React', 'TypeScript'] };
    const updated = applyCandidatoDraft(candidato, draft);

    expect(updated.userId).toBe('u1');
    expect(updated.fotoUri).toBe('file://foto.jpg');
    expect(updated.hardSkills).toEqual(['React', 'TypeScript']);
    expect(updated).not.toHaveProperty('senha');
    expect(updated).not.toHaveProperty('confirmacaoSenha');
  });

  it('calcula a idade', () => {
    expect(candidatoAge(candidato, new Date(2026, 9, 6))).toBe(26);
  });
});

describe('perfil da empresa', () => {
  it('editar dados fixos não mexe nas vagas', () => {
    const updated = applyEmpresaDraft(empresa, { ...empresaToDraft(empresa), nomeEmpresa: ' Nova ' });
    expect(updated.nomeEmpresa).toBe('Nova');
    expect(updated.vagas).toEqual([vaga]);
  });

  it('upsert substitui a vaga de mesmo id e adiciona as novas', () => {
    const edited = upsertVaga(empresa, { ...vaga, cargo: 'Dev Sênior' });
    expect(edited.vagas).toHaveLength(1);
    expect(edited.vagas[0].cargo).toBe('Dev Sênior');

    const added = upsertVaga(empresa, { ...vaga, id: 'v2' });
    expect(added.vagas.map((v) => v.id)).toEqual(['v1', 'v2']);
  });

  it('remove a vaga', () => {
    expect(removeVaga(empresa, 'v1').vagas).toEqual([]);
  });

  it('o rascunho da vaga reconstrói a mesma vaga', () => {
    expect(draftToVaga(empresaToDraft(empresa, vaga), 'v1')).toEqual(vaga);
    expect(() => draftToVaga(emptyEmpresaDraft, 'x')).toThrow();
  });
});
