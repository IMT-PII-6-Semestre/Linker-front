import { ChipMultiSelect, ChipSelect } from '@/core/ui/ChipSelect';
import { TagInput } from '@/core/ui/TagInput';
import { TextField } from '@/core/ui/TextField';
import { maskCep, maskCpf, maskDate, maskPhone } from '@/core/format/masks';

import {
  ESCOLARIDADES,
  FAIXAS_SALARIAIS,
  HARD_SKILL_SUGESTOES,
  MODALIDADES,
  SOFT_SKILL_SUGESTOES,
  TIPOS_CONTRATO,
  type CandidatoDraft,
} from '../../domain/registration';

import { PasswordFields } from './PasswordFields';
import { useFocusChain } from './useFocusChain';

interface CandidatoStepFieldsProps {
  step: number;
  draft: CandidatoDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<CandidatoDraft>) => void;
  onSubmit: () => void;
}

/** Campos de cada etapa do fluxo A (busco um emprego). */
export function CandidatoStepFields({ step, draft, errors, onChange, onSubmit }: CandidatoStepFieldsProps) {
  const chain = useFocusChain();

  switch (step) {
    case 0:
      return (
        <>
          <TextField
            ref={chain.ref(0)}
            testID="signup-nome"
            label="Nome completo"
            placeholder="Como está no seu documento"
            value={draft.nomeCompleto}
            onChangeText={(v) => onChange({ nomeCompleto: v })}
            errorText={errors.nomeCompleto}
            autoCapitalize="words"
            textContentType="name"
            autoComplete="name"
            returnKeyType="next"
            onSubmitEditing={chain.next(0)}
          />
          <TextField
            ref={chain.ref(1)}
            testID="signup-cpf"
            label="CPF"
            placeholder="000.000.000-00"
            value={draft.cpf}
            onChangeText={(v) => onChange({ cpf: v })}
            mask={maskCpf}
            keyboardType="number-pad"
            errorText={errors.cpf}
            returnKeyType="next"
            onSubmitEditing={chain.next(1)}
          />
          <TextField
            ref={chain.ref(2)}
            testID="signup-nascimento"
            label="Data de nascimento"
            placeholder="dd/mm/aaaa"
            value={draft.dataNascimento}
            onChangeText={(v) => onChange({ dataNascimento: v })}
            mask={maskDate}
            keyboardType="number-pad"
            errorText={errors.dataNascimento}
            autoComplete="birthdate-full"
            returnKeyType="next"
            onSubmitEditing={chain.next(2)}
          />
          <TextField
            ref={chain.ref(3)}
            testID="signup-email"
            label="E-mail"
            placeholder="voce@email.com"
            value={draft.email}
            onChangeText={(v) => onChange({ email: v })}
            keyboardType="email-address"
            errorText={errors.email}
            textContentType="emailAddress"
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={chain.next(3)}
          />
          <TextField
            ref={chain.ref(4)}
            testID="signup-celular"
            label="Celular"
            placeholder="(11) 91234-5678"
            value={draft.celular}
            onChangeText={(v) => onChange({ celular: v })}
            mask={maskPhone}
            keyboardType="phone-pad"
            errorText={errors.celular}
            textContentType="telephoneNumber"
            autoComplete="tel"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
        </>
      );

    case 1:
      return (
        <>
          <TextField
            ref={chain.ref(0)}
            label="Qual vaga você procura?"
            placeholder="Ex.: Desenvolvedor Front-end, Vendedor..."
            value={draft.cargoDesejado}
            onChangeText={(v) => onChange({ cargoDesejado: v })}
            errorText={errors.cargoDesejado}
            autoCapitalize="sentences"
            returnKeyType="next"
            onSubmitEditing={chain.next(0)}
          />
          <TextField
            ref={chain.ref(1)}
            label="Formação"
            placeholder="Ex.: Análise de Sistemas — Fatec"
            value={draft.formacao}
            onChangeText={(v) => onChange({ formacao: v })}
            errorText={errors.formacao}
            autoCapitalize="sentences"
            returnKeyType="next"
            onSubmitEditing={chain.next(1)}
          />
          <TextField
            ref={chain.ref(2)}
            label="CEP"
            placeholder="00000-000"
            helperText="Usado só para mostrar vagas perto de você."
            value={draft.cep}
            onChangeText={(v) => onChange({ cep: v })}
            mask={maskCep}
            keyboardType="number-pad"
            errorText={errors.cep}
            autoComplete="postal-code"
          />
          <ChipSelect
            label="Grau de escolaridade"
            options={ESCOLARIDADES}
            value={draft.escolaridade}
            onChange={(v) => onChange({ escolaridade: v })}
            errorText={errors.escolaridade}
          />
          <TextField
            label="Experiências"
            placeholder="Onde trabalhou, por quanto tempo e o que fazia. Primeiro emprego? Conte isso!"
            value={draft.experiencias}
            onChangeText={(v) => onChange({ experiencias: v })}
            errorText={errors.experiencias}
            autoCapitalize="sentences"
            multiline
            maxLength={1000}
          />
        </>
      );

    case 2:
      return (
        <>
          <ChipMultiSelect
            label="Tipo de contrato"
            options={TIPOS_CONTRATO}
            value={draft.tiposContrato}
            onChange={(v) => onChange({ tiposContrato: v })}
            errorText={errors.tiposContrato}
          />
          <ChipMultiSelect
            label="Modalidade de trabalho"
            options={MODALIDADES}
            value={draft.modalidades}
            onChange={(v) => onChange({ modalidades: v })}
            errorText={errors.modalidades}
          />
          <ChipSelect
            label="Faixa salarial pretendida"
            options={FAIXAS_SALARIAIS}
            value={draft.faixaSalarial}
            onChange={(v) => onChange({ faixaSalarial: v })}
            errorText={errors.faixaSalarial}
          />
        </>
      );

    case 3:
      return (
        <>
          <TagInput
            label="Hard skills"
            placeholder="Ex.: Excel, React, Vendas..."
            value={draft.hardSkills}
            onChange={(v) => onChange({ hardSkills: v })}
            suggestions={HARD_SKILL_SUGESTOES}
            errorText={errors.hardSkills}
          />
          <TagInput
            label="Soft skills"
            placeholder="Ex.: Comunicação, Liderança..."
            value={draft.softSkills}
            onChange={(v) => onChange({ softSkills: v })}
            suggestions={SOFT_SKILL_SUGESTOES}
            errorText={errors.softSkills}
          />
        </>
      );

    default:
      return (
        <PasswordFields
          senha={draft.senha}
          confirmacaoSenha={draft.confirmacaoSenha}
          errors={errors}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      );
  }
}
