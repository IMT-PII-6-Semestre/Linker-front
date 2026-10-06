import { ChipSelect } from '@/core/ui/ChipSelect';
import { TextField } from '@/core/ui/TextField';
import { maskCnpj, maskDate, maskPhone } from '@/core/format/masks';

import {
  ESCOLARIDADES,
  FAIXAS_SALARIAIS,
  MODALIDADES,
  TIPOS_CONTRATO,
  type EmpresaDraft,
} from '../../domain/registration';

import { PasswordFields } from './PasswordFields';
import { useFocusChain } from './useFocusChain';

interface EmpresaStepFieldsProps {
  step: number;
  draft: EmpresaDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<EmpresaDraft>) => void;
  onSubmit: () => void;
}

/** Campos de cada etapa do fluxo B (busco um funcionário). */
export function EmpresaStepFields({ step, draft, errors, onChange, onSubmit }: EmpresaStepFieldsProps) {
  const chain = useFocusChain();

  switch (step) {
    case 0:
      return (
        <>
          <TextField
            ref={chain.ref(0)}
            testID="signup-cnpj"
            label="CNPJ / MEI"
            placeholder="00.000.000/0000-00"
            value={draft.cnpj}
            onChangeText={(v) => onChange({ cnpj: v })}
            mask={maskCnpj}
            keyboardType="number-pad"
            errorText={errors.cnpj}
            returnKeyType="next"
            onSubmitEditing={chain.next(0)}
          />
          <TextField
            ref={chain.ref(1)}
            testID="signup-nome-empresa"
            label="Nome da empresa"
            placeholder="Nome fantasia ou razão social"
            value={draft.nomeEmpresa}
            onChangeText={(v) => onChange({ nomeEmpresa: v })}
            errorText={errors.nomeEmpresa}
            autoCapitalize="words"
            textContentType="organizationName"
            returnKeyType="next"
            onSubmitEditing={chain.next(1)}
          />
          <TextField
            ref={chain.ref(2)}
            label="Data de fundação"
            placeholder="dd/mm/aaaa"
            value={draft.dataFundacao}
            onChangeText={(v) => onChange({ dataFundacao: v })}
            mask={maskDate}
            keyboardType="number-pad"
            errorText={errors.dataFundacao}
            returnKeyType="next"
            onSubmitEditing={chain.next(2)}
          />
          <TextField
            ref={chain.ref(3)}
            label="Endereço"
            placeholder="Rua, número, bairro, cidade — UF"
            value={draft.endereco}
            onChangeText={(v) => onChange({ endereco: v })}
            errorText={errors.endereco}
            autoCapitalize="words"
            textContentType="fullStreetAddress"
            autoComplete="street-address"
            returnKeyType="next"
            onSubmitEditing={chain.next(3)}
          />
          <TextField
            ref={chain.ref(4)}
            label="Telefone"
            placeholder="(11) 3456-7890"
            value={draft.telefone}
            onChangeText={(v) => onChange({ telefone: v })}
            mask={maskPhone}
            keyboardType="phone-pad"
            errorText={errors.telefone}
            textContentType="telephoneNumber"
            autoComplete="tel"
            returnKeyType="next"
            onSubmitEditing={chain.next(4)}
          />
          <TextField
            ref={chain.ref(5)}
            label="E-mail"
            placeholder="rh@empresa.com"
            value={draft.email}
            onChangeText={(v) => onChange({ email: v })}
            keyboardType="email-address"
            errorText={errors.email}
            textContentType="emailAddress"
            autoComplete="email"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
        </>
      );

    case 1:
      return (
        <>
          <TextField
            label="Nome do cargo"
            placeholder="Ex.: Desenvolvedor Front-end"
            value={draft.cargo}
            onChangeText={(v) => onChange({ cargo: v })}
            errorText={errors.cargo}
            autoCapitalize="sentences"
          />
          <TextField
            label="Descrição da vaga"
            placeholder="O que a pessoa vai fazer no dia a dia? Seja direto — sem enrolação."
            value={draft.descricao}
            onChangeText={(v) => onChange({ descricao: v })}
            errorText={errors.descricao}
            autoCapitalize="sentences"
            multiline
            maxLength={1500}
          />
          <TextField
            label="Benefícios"
            placeholder="Ex.: VR, plano de saúde, auxílio home office"
            value={draft.beneficios}
            onChangeText={(v) => onChange({ beneficios: v })}
            errorText={errors.beneficios}
            autoCapitalize="sentences"
            multiline
            maxLength={500}
          />
          <TextField
            label="Horário"
            placeholder="Ex.: Seg a sex, 9h às 18h"
            value={draft.horario}
            onChangeText={(v) => onChange({ horario: v })}
            errorText={errors.horario}
            autoCapitalize="sentences"
          />
        </>
      );

    case 2:
      return (
        <>
          <ChipSelect
            label="Escolaridade desejada"
            options={ESCOLARIDADES}
            value={draft.escolaridade}
            onChange={(v) => onChange({ escolaridade: v })}
            errorText={errors.escolaridade}
          />
          <ChipSelect
            label="Tipo de contrato"
            options={TIPOS_CONTRATO}
            value={draft.tipoContrato}
            onChange={(v) => onChange({ tipoContrato: v })}
            errorText={errors.tipoContrato}
          />
          <ChipSelect
            label="Modalidade"
            options={MODALIDADES}
            value={draft.modalidade}
            onChange={(v) => onChange({ modalidade: v })}
            errorText={errors.modalidade}
          />
          <ChipSelect
            label="Faixa salarial"
            options={FAIXAS_SALARIAIS}
            value={draft.faixaSalarial}
            onChange={(v) => onChange({ faixaSalarial: v })}
            errorText={errors.faixaSalarial}
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
