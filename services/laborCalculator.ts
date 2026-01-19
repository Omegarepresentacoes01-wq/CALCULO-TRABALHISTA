
import { CalculationInput, CalculationResult } from '../types';

export const calculateLaborRights = (input: CalculationInput): CalculationResult => {
  const {
    salario_base, media_comissao, media_premios, media_outras, base_calculo,
    divisor_horas, dias_trabalhados_mes, avos_13, ferias_vencidas_periodos,
    avos_ferias, aviso_indenizado, fgts_modo, fgts_informado_total,
    meses_contrato_estimado, multa_40_fgts, he50_horas_mes, he100_horas_mes,
    usar_dsr, fator_dsr, reflexo_13_var, reflexo_ferias_var, reflexo_fgts_var,
    noturno_horas_mes, hora_reduzida, fator_hora_reduzida, noturno_percentual,
    insal_base, insal_grau, salario_minimo, reflexo_13_insal, reflexo_ferias_insal,
    reflexo_fgts_insal, peric_base, peric_percentual, reflexo_13_peric,
    reflexo_ferias_peric, reflexo_fgts_peric, multa_477, multa_477_valor,
    multa_467, base_467_valor, multa_467_percentual
  } = input;

  const items: CalculationResult['items'] = [];

  // Core Variables
  const remuneracao_media = salario_base + media_comissao + media_premios + media_outras;
  const base_rescisao = base_calculo === 'REMUNERACAO_MEDIA' ? remuneracao_media : salario_base;
  const valor_hora = base_rescisao / (divisor_horas || 220);
  const salario_dia = base_rescisao / 30;

  // Rescisão
  const saldo_salario = salario_dia * dias_trabalhados_mes;
  const decimo_terceiro_prop = base_rescisao * (avos_13 / 12);
  const ferias_vencidas = ferias_vencidas_periodos * (base_rescisao + base_rescisao / 3);
  const ferias_prop = (base_rescisao * (avos_ferias / 12)) * (1 + 1 / 3);
  const aviso_prev = aviso_indenizado ? base_rescisao : 0;

  const total_rescisao = saldo_salario + decimo_terceiro_prop + ferias_vencidas + ferias_prop + aviso_prev;

  items.push(
    { code: '001', group: 'RESCISÃO', label: 'Saldo de Salário', formula: `${dias_trabalhados_mes} dias * R$ ${salario_dia.toFixed(2)}`, value: saldo_salario },
    { code: '002', group: 'RESCISÃO', label: '13º Salário Prop.', formula: `${avos_13}/12 * R$ ${base_rescisao.toFixed(2)}`, value: decimo_terceiro_prop },
    { code: '003', group: 'RESCISÃO', label: 'Férias Vencidas + 1/3', formula: `${ferias_vencidas_periodos} per. * (R$ ${base_rescisao.toFixed(2)} + 33%)`, value: ferias_vencidas },
    { code: '004', group: 'RESCISÃO', label: 'Férias Proporcionais + 1/3', formula: `(${avos_ferias}/12 * R$ ${base_rescisao.toFixed(2)}) + 33%`, value: ferias_prop },
    { code: '005', group: 'RESCISÃO', label: 'Aviso Prévio Indenizado', formula: aviso_indenizado ? `Base R$ ${base_rescisao.toFixed(2)}` : 'N/A', value: aviso_prev }
  );

  // FGTS
  const fgts_estimado = base_rescisao * 0.08 * meses_contrato_estimado;
  const fgts_total = fgts_modo === 'INFORMADO' ? fgts_informado_total : fgts_estimado;
  const fgts_multa_40 = multa_40_fgts ? fgts_total * 0.40 : 0;
  const total_fgts = fgts_total + fgts_multa_40;

  items.push(
    { code: '010', group: 'FGTS', label: 'FGTS (Saldo)', formula: fgts_modo === 'INFORMADO' ? 'Valor Informado' : `8% * R$ ${base_rescisao.toFixed(2)} * ${meses_contrato_estimado} meses`, value: fgts_total },
    { code: '011', group: 'FGTS', label: 'Multa FGTS (40%)', formula: multa_40_fgts ? `40% * R$ ${fgts_total.toFixed(2)}` : 'Não Optante/Calculada', value: fgts_multa_40 }
  );

  // Horas Extras
  const he50_val = he50_horas_mes * valor_hora * 1.5;
  const he100_val = he100_horas_mes * valor_hora * 2.0;
  const he_total = he50_val + he100_val;
  const dsr_he = usar_dsr ? he_total * fator_dsr : 0;
  const var_base = he_total + dsr_he;

  const var_13 = reflexo_13_var ? var_base / 12 : 0;
  const var_ferias = reflexo_ferias_var ? (var_base / 12) * (1 + 1 / 3) : 0;
  const var_fgts = reflexo_fgts_var ? var_base * 0.08 : 0;
  const var_fgts_40 = multa_40_fgts ? var_fgts * 0.40 : 0;

  const total_he_set = he_total + dsr_he + var_13 + var_ferias + var_fgts + var_fgts_40;

  items.push(
    { code: '020', group: 'HORAS EXTRAS', label: 'Horas Extras 50%', formula: `${he50_horas_mes}h * R$ ${valor_hora.toFixed(2)} * 1.5`, value: he50_val },
    { code: '021', group: 'HORAS EXTRAS', label: 'Horas Extras 100%', formula: `${he100_horas_mes}h * R$ ${valor_hora.toFixed(2)} * 2.0`, value: he100_val },
    { code: '022', group: 'HORAS EXTRAS', label: 'DSR s/ Horas Extras', formula: usar_dsr ? `HE * ${fator_dsr}` : 'Inativo', value: dsr_he },
    { code: '023', group: 'REFLEXOS HE', label: 'Reflexo HE em 13º', formula: reflexo_13_var ? 'Média anual' : 'Inativo', value: var_13 },
    { code: '024', group: 'REFLEXOS HE', label: 'Reflexo HE em Férias + 1/3', formula: reflexo_ferias_var ? 'Média anual + 1/3' : 'Inativo', value: var_ferias }
  );

  // Noturno
  const not_horas = hora_reduzida ? noturno_horas_mes * (fator_hora_reduzida || 1.1428) : noturno_horas_mes;
  const not_val = not_horas * valor_hora * (noturno_percentual || 0.2);
  const dsr_not = usar_dsr ? not_val * fator_dsr : 0;
  const not_base = not_val + dsr_not;
  const not_13 = reflexo_13_var ? not_base / 12 : 0;
  const not_ferias = reflexo_ferias_var ? (not_base / 12) * (1 + 1 / 3) : 0;
  const not_fgts = reflexo_fgts_var ? not_base * 0.08 : 0;
  const not_fgts_40 = multa_40_fgts ? not_fgts * 0.40 : 0;

  const total_noturno_set = not_val + dsr_not + not_13 + not_ferias + not_fgts + not_fgts_40;

  items.push(
    { code: '030', group: 'NOTURNO', label: 'Adicional Noturno', formula: `${not_horas.toFixed(2)}h * R$ ${valor_hora.toFixed(2)} * ${(noturno_percentual * 100).toFixed(0)}%`, value: not_val },
    { code: '031', group: 'NOTURNO', label: 'DSR s/ Adic. Noturno', formula: usar_dsr ? `Noturno * ${fator_dsr}` : 'Inativo', value: dsr_not }
  );

  // Insalubridade
  const base_insal = insal_base === 'SALARIO_MINIMO' ? salario_minimo : (insal_base === 'REMUNERACAO_MEDIA' ? remuneracao_media : salario_base);
  const insal_val = base_insal * (insal_grau || 0);
  const insal_13 = reflexo_13_insal ? insal_val / 12 : 0;
  const insal_ferias = reflexo_ferias_insal ? (insal_val / 12) * (1 + 1 / 3) : 0;
  const insal_fgts = reflexo_fgts_insal ? insal_val * 0.08 : 0;
  const insal_fgts_40 = multa_40_fgts ? insal_fgts * 0.40 : 0;

  const total_insal_set = insal_val + insal_13 + insal_ferias + insal_fgts + insal_fgts_40;

  if (insal_val > 0) {
    items.push(
      { code: '040', group: 'ADICIONAIS', label: 'Insalubridade', formula: `${(insal_grau * 100).toFixed(0)}% * R$ ${base_insal.toFixed(2)}`, value: insal_val },
      { code: '041', group: 'ADICIONAIS', label: 'Reflexo Insal. em 13º/Férias/FGTS', formula: 'Calculados por rubrica', value: insal_13 + insal_ferias + insal_fgts + insal_fgts_40 }
    );
  }

  // Periculosidade
  const base_peric = peric_base === 'REMUNERACAO_MEDIA' ? remuneracao_media : salario_base;
  const peric_val = base_peric * (peric_percentual || 0);
  const peric_13 = reflexo_13_peric ? peric_val / 12 : 0;
  const peric_ferias = reflexo_ferias_peric ? (peric_val / 12) * (1 + 1 / 3) : 0;
  const peric_fgts = reflexo_fgts_peric ? peric_val * 0.08 : 0;
  const peric_fgts_40 = multa_40_fgts ? peric_fgts * 0.40 : 0;

  const total_peric_set = peric_val + peric_13 + peric_ferias + peric_fgts + peric_fgts_40;

  if (peric_val > 0) {
    items.push(
      { code: '050', group: 'ADICIONAIS', label: 'Periculosidade', formula: `${(peric_percentual * 100).toFixed(0)}% * R$ ${base_peric.toFixed(2)}`, value: peric_val },
      { code: '051', group: 'ADICIONAIS', label: 'Reflexo Peric. em 13º/Férias/FGTS', formula: 'Calculados por rubrica', value: peric_13 + peric_ferias + peric_fgts + peric_fgts_40 }
    );
  }

  // Multas
  const m477 = multa_477 ? (multa_477_valor > 0 ? multa_477_valor : base_rescisao) : 0;
  const m467 = multa_467 ? base_467_valor * (multa_467_percentual || 0.5) : 0;
  const total_multas = m477 + m467;

  items.push(
    { code: '060', group: 'MULTAS', label: 'Multa Art. 477 CLT', formula: multa_477 ? '1 Salário Base' : 'N/A', value: m477 },
    { code: '061', group: 'MULTAS', label: 'Multa Art. 467 CLT', formula: multa_467 ? `50% s/ R$ ${base_467_valor.toFixed(2)}` : 'N/A', value: m467 }
  );

  const total_variaveis = total_he_set + total_noturno_set;
  const total_adicionais = total_insal_set + total_peric_set;
  const total_geral = total_rescisao + total_variaveis + total_adicionais + total_fgts + total_multas;

  return {
    totals: {
      total_rescisao,
      total_variaveis,
      total_adicionais,
      total_fgts,
      total_multas,
      total_geral
    },
    computed: {
      remuneracao_media,
      valor_hora
    },
    items: items.filter(item => item.value !== 0)
  };
};
