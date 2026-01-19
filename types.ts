
export type Scenario = 'RECLAMANTE' | 'RECLAMADA';
export type BaseCalculo = 'SALARIO_BASE' | 'REMUNERACAO_MEDIA';
export type FGTSModo = 'INFORMADO' | 'ESTIMADO';

export interface CalculationInput {
  id?: string;
  name: string;
  scenario: Scenario;
  base_calculo: BaseCalculo;
  data_admissao: string;
  data_demissao: string;
  salario_base: number;
  divisor_horas: number;
  dias_trabalhados_mes: number;
  tipo_desligamento: string;
  aviso_indenizado: boolean;
  media_comissao: number;
  media_premios: number;
  media_outras: number;
  ferias_vencidas_periodos: number;
  avos_ferias: number;
  avos_13: number;
  fgts_modo: FGTSModo;
  fgts_informado_total: number;
  meses_contrato_estimado: number;
  multa_40_fgts: boolean;
  he50_horas_mes: number;
  he100_horas_mes: number;
  usar_dsr: boolean;
  fator_dsr: number;
  reflexo_13_var: boolean;
  reflexo_ferias_var: boolean;
  reflexo_fgts_var: boolean;
  noturno_percentual: number;
  noturno_horas_mes: number;
  hora_reduzida: boolean;
  fator_hora_reduzida: number;
  insal_grau: number;
  insal_base: 'SALARIO_MINIMO' | 'REMUNERACAO_MEDIA' | 'SALARIO_BASE';
  salario_minimo: number;
  reflexo_13_insal: boolean;
  reflexo_ferias_insal: boolean;
  reflexo_fgts_insal: boolean;
  peric_percentual: number;
  peric_base: 'REMUNERACAO_MEDIA' | 'SALARIO_BASE';
  reflexo_13_peric: boolean;
  reflexo_ferias_peric: boolean;
  reflexo_fgts_peric: boolean;
  multa_477: boolean;
  multa_477_valor: number;
  multa_467: boolean;
  base_467_valor: number;
  multa_467_percentual: number;
}

export interface CalculationResult {
  totals: {
    total_rescisao: number;
    total_variaveis: number;
    total_adicionais: number;
    total_fgts: number;
    total_multas: number;
    total_geral: number;
  };
  computed: {
    remuneracao_media: number;
    valor_hora: number;
  };
  items: Array<{
    code: string;
    group: string;
    label: string;
    formula: string;
    value: number;
  }>;
}
