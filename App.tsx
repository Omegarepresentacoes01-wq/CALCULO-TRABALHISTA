
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  FileText, 
  LogOut, 
  User as UserIcon,
  ChevronRight,
  Plus,
  ArrowLeft,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CalculationInput, CalculationResult } from './types';
import { calculateLaborRights } from './services/laborCalculator';

// --- Shared Components ---

const Button: React.FC<{
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ onClick, type = 'button', variant = 'primary', className = '', disabled, children }) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
    secondary: "bg-slate-800 text-white hover:bg-slate-900",
    outline: "border border-slate-200 text-slate-700 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    ghost: "text-slate-600 hover:bg-slate-100"
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

// Fix for error on line 607: Added onClick prop to allow Card component to be clickable
const Card: React.FC<{ children: React.ReactNode; title?: string; className?: string; onClick?: () => void }> = ({ children, title, className = '', onClick }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`} onClick={onClick}>
    {title && <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>}
    {children}
  </div>
);

const Input: React.FC<{
  label: string;
  type?: string;
  value: any;
  onChange: (val: any) => void;
  placeholder?: string;
  className?: string;
  prefix?: string;
}> = ({ label, type = 'text', value, onChange, placeholder, className = '', prefix }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 ${prefix ? 'pl-10' : ''} border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
      />
    </div>
  </div>
);

const Select: React.FC<{
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: any) => void;
  className?: string;
}> = ({ label, options, value, onChange, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const Switch: React.FC<{ label: string; checked: boolean; onChange: (val: boolean) => void }> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full transition-all relative ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-5.5' : 'left-0.5'}`} style={{ left: checked ? 'calc(100% - 18px)' : '2px' }} />
    </button>
  </div>
);

// --- Calculation Logic Helper ---

const DEFAULT_CALC: CalculationInput = {
  name: '',
  scenario: 'RECLAMANTE',
  base_calculo: 'SALARIO_BASE',
  data_admissao: '',
  data_demissao: '',
  salario_base: 0,
  divisor_horas: 220,
  dias_trabalhados_mes: 0,
  tipo_desligamento: 'SEM_JUSTA_CAUSA',
  aviso_indenizado: true,
  media_comissao: 0,
  media_premios: 0,
  media_outras: 0,
  ferias_vencidas_periodos: 0,
  avos_ferias: 0,
  avos_13: 0,
  fgts_modo: 'ESTIMADO',
  fgts_informado_total: 0,
  meses_contrato_estimado: 0,
  multa_40_fgts: true,
  he50_horas_mes: 0,
  he100_horas_mes: 0,
  usar_dsr: true,
  fator_dsr: 0.1667,
  reflexo_13_var: true,
  reflexo_ferias_var: true,
  reflexo_fgts_var: true,
  noturno_percentual: 0.20,
  noturno_horas_mes: 0,
  hora_reduzida: true,
  fator_hora_reduzida: 1.1428,
  insal_grau: 0,
  insal_base: 'SALARIO_MINIMO',
  salario_minimo: 1412,
  reflexo_13_insal: true,
  reflexo_ferias_insal: true,
  reflexo_fgts_insal: true,
  peric_percentual: 0.30,
  peric_base: 'SALARIO_BASE',
  reflexo_13_peric: true,
  reflexo_ferias_peric: true,
  reflexo_fgts_peric: true,
  multa_477: true,
  multa_477_valor: 0,
  multa_467: false,
  base_467_valor: 0,
  multa_467_percentual: 0.5
};

// --- App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [calculations, setCalculations] = useState<CalculationInput[]>([]);
  const [currentCalc, setCurrentCalc] = useState<CalculationInput | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState(1);
  const [viewingResult, setViewingResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('labor_calcs');
    if (saved) setCalculations(JSON.parse(saved));
  }, []);

  const saveToLocal = (updated: CalculationInput[]) => {
    setCalculations(updated);
    localStorage.setItem('labor_calcs', JSON.stringify(updated));
  };

  const startNew = () => {
    setCurrentCalc({ ...DEFAULT_CALC, id: Date.now().toString(), name: `Cálculo ${calculations.length + 1}` });
    setIsEditing(true);
    setStep(1);
    setActiveTab('calculations');
  };

  const handleSave = () => {
    if (!currentCalc) return;
    const exists = calculations.findIndex(c => c.id === currentCalc.id);
    let updated: CalculationInput[];
    if (exists >= 0) {
      updated = [...calculations];
      updated[exists] = currentCalc;
    } else {
      updated = [...calculations, currentCalc];
    }
    saveToLocal(updated);
    const result = calculateLaborRights(currentCalc);
    setViewingResult(result);
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    const updated = calculations.filter(c => c.id !== id);
    saveToLocal(updated);
  };

  const formatBRL = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calculator className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">LaborCalc</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => { setActiveTab('dashboard'); setIsEditing(false); setViewingResult(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('calculations'); setIsEditing(false); setViewingResult(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'calculations' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileText size={20} />
            Meus Cálculos
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-600">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <UserIcon size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Admin Silva</span>
              <span className="text-xs text-slate-400">Escritório Premium</span>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2">
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">
            {isEditing ? `Passo ${step} de 5 - Novo Cálculo` : viewingResult ? 'Relatório de Cálculo' : 'Bem-vindo'}
          </h1>
          {!isEditing && !viewingResult && (
            <Button onClick={startNew}>
              <Plus size={18} /> Novo Cálculo
            </Button>
          )}
          {viewingResult && (
            <Button variant="ghost" onClick={() => setViewingResult(null)}>
              <ArrowLeft size={18} /> Voltar para lista
            </Button>
          )}
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          {activeTab === 'dashboard' && !viewingResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex flex-col items-center justify-center p-8 border-l-4 border-l-blue-600">
                  <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total de Cálculos</span>
                  <span className="text-4xl font-bold text-slate-800 mt-2">{calculations.length}</span>
                </Card>
                <Card className="flex flex-col items-center justify-center p-8 border-l-4 border-l-green-600">
                  <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Cenário Reclamante</span>
                  <span className="text-4xl font-bold text-slate-800 mt-2">{calculations.filter(c => c.scenario === 'RECLAMANTE').length}</span>
                </Card>
                <Card className="flex flex-col items-center justify-center p-8 border-l-4 border-l-purple-600">
                  <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Cenário Reclamada</span>
                  <span className="text-4xl font-bold text-slate-800 mt-2">{calculations.filter(c => c.scenario === 'RECLAMADA').length}</span>
                </Card>
              </div>

              <Card title="Cálculos Recentes">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-4 font-semibold text-slate-700">Nome/Cliente</th>
                        <th className="pb-4 font-semibold text-slate-700">Cenário</th>
                        <th className="pb-4 font-semibold text-slate-700">Admissão</th>
                        <th className="pb-4 font-semibold text-slate-700">Demissão</th>
                        <th className="pb-4 font-semibold text-slate-700 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {calculations.slice(0, 5).map(calc => (
                        <tr key={calc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 font-medium">{calc.name}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${calc.scenario === 'RECLAMANTE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {calc.scenario}
                            </span>
                          </td>
                          <td className="py-4 text-slate-500">{calc.data_admissao || '-'}</td>
                          <td className="py-4 text-slate-500">{calc.data_demissao || '-'}</td>
                          <td className="py-4 text-right flex items-center justify-end gap-2">
                            <Button variant="ghost" onClick={() => { setCurrentCalc(calc); setViewingResult(calculateLaborRights(calc)); }}>
                              Visualizar
                            </Button>
                            <Button variant="danger" className="!p-2" onClick={() => handleDelete(calc.id!)}>
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {calculations.length === 0 && (
                    <div className="py-12 text-center text-slate-400">Nenhum cálculo cadastrado ainda.</div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'calculations' && isEditing && currentCalc && (
            <div className="max-w-3xl mx-auto space-y-8 pb-20">
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step === i ? 'border-blue-600 bg-blue-50 text-blue-600 font-bold' : step > i ? 'bg-green-500 border-green-500 text-white' : 'border-slate-200 text-slate-400'}`}>
                      {step > i ? <CheckCircle size={20} /> : i}
                    </div>
                    {i < 5 && <div className={`h-0.5 flex-1 mx-4 rounded-full ${step > i ? 'bg-green-500' : 'bg-slate-200'}`} />}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <Card title="Cenário e Base">
                  <div className="space-y-6">
                    <Input label="Identificação do Cálculo" value={currentCalc.name} onChange={v => setCurrentCalc({ ...currentCalc, name: v })} placeholder="Ex: João vs Empresa XYZ" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select 
                        label="Cenário do Sistema" 
                        value={currentCalc.scenario} 
                        onChange={v => setCurrentCalc({ ...currentCalc, scenario: v })}
                        options={[{ label: 'Reclamante', value: 'RECLAMANTE' }, { label: 'Reclamada (Defesa)', value: 'RECLAMADA' }]} 
                      />
                      <Select 
                        label="Base de Cálculo Principal" 
                        value={currentCalc.base_calculo} 
                        onChange={v => setCurrentCalc({ ...currentCalc, base_calculo: v })}
                        options={[{ label: 'Salário Base', value: 'SALARIO_BASE' }, { label: 'Remuneração Média', value: 'REMUNERACAO_MEDIA' }]} 
                      />
                    </div>
                  </div>
                </Card>
              )}

              {step === 2 && (
                <Card title="Dados do Contrato">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Data de Admissão" type="date" value={currentCalc.data_admissao} onChange={v => setCurrentCalc({ ...currentCalc, data_admissao: v })} />
                      <Input label="Data de Demissão" type="date" value={currentCalc.data_demissao} onChange={v => setCurrentCalc({ ...currentCalc, data_demissao: v })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input label="Salário Base" type="number" prefix="R$" value={currentCalc.salario_base} onChange={v => setCurrentCalc({ ...currentCalc, salario_base: v })} />
                      <Input label="Divisor de Horas" type="number" value={currentCalc.divisor_horas} onChange={v => setCurrentCalc({ ...currentCalc, divisor_horas: v })} />
                      <Input label="Dias Trab. Mês Rescisão" type="number" value={currentCalc.dias_trabalhados_mes} onChange={v => setCurrentCalc({ ...currentCalc, dias_trabalhados_mes: v })} />
                    </div>
                    <Select 
                      label="Tipo de Desligamento" 
                      value={currentCalc.tipo_desligamento} 
                      onChange={v => setCurrentCalc({ ...currentCalc, tipo_desligamento: v })}
                      options={[
                        { label: 'Sem Justa Causa', value: 'SEM_JUSTA_CAUSA' },
                        { label: 'Pedido de Demissão', value: 'PEDIDO_DEMISSAO' },
                        { label: 'Acordo entre Partes', value: 'ACORDO' },
                        { label: 'Rescisão Indireta', value: 'INDIRETA' }
                      ]} 
                    />
                    <Switch label="Aviso Prévio Indenizado?" checked={currentCalc.aviso_indenizado} onChange={v => setCurrentCalc({ ...currentCalc, aviso_indenizado: v })} />
                  </div>
                </Card>
              )}

              {step === 3 && (
                <Card title="Médias Variáveis e Rescisão">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input label="Média Comissões" type="number" prefix="R$" value={currentCalc.media_comissao} onChange={v => setCurrentCalc({ ...currentCalc, media_comissao: v })} />
                      <Input label="Média Prêmios" type="number" prefix="R$" value={currentCalc.media_premios} onChange={v => setCurrentCalc({ ...currentCalc, media_premios: v })} />
                      <Input label="Média Outros" type="number" prefix="R$" value={currentCalc.media_outras} onChange={v => setCurrentCalc({ ...currentCalc, media_outras: v })} />
                    </div>
                    <hr className="border-slate-100" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input label="Férias Vencidas (Períodos)" type="number" value={currentCalc.ferias_vencidas_periodos} onChange={v => setCurrentCalc({ ...currentCalc, ferias_vencidas_periodos: v })} />
                      <Input label="Avos Férias Prop." type="number" value={currentCalc.avos_ferias} onChange={v => setCurrentCalc({ ...currentCalc, avos_ferias: v })} />
                      <Input label="Avos 13º Prop." type="number" value={currentCalc.avos_13} onChange={v => setCurrentCalc({ ...currentCalc, avos_13: v })} />
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-4">
                      <h4 className="text-sm font-bold text-blue-800">Cálculo de FGTS</h4>
                      <Select label="Modo de Cálculo FGTS" value={currentCalc.fgts_modo} onChange={v => setCurrentCalc({ ...currentCalc, fgts_modo: v })} options={[{ label: 'Estimado p/ Mês', value: 'ESTIMADO' }, { label: 'Valor Total Informado', value: 'INFORMADO' }]} />
                      {currentCalc.fgts_modo === 'ESTIMADO' ? (
                        <Input label="Nº Meses Contrato" type="number" value={currentCalc.meses_contrato_estimado} onChange={v => setCurrentCalc({ ...currentCalc, meses_contrato_estimado: v })} />
                      ) : (
                        <Input label="Valor FGTS Total Acumulado" type="number" prefix="R$" value={currentCalc.fgts_informado_total} onChange={v => setCurrentCalc({ ...currentCalc, fgts_informado_total: v })} />
                      )}
                      <Switch label="Calcular Multa 40% FGTS?" checked={currentCalc.multa_40_fgts} onChange={v => setCurrentCalc({ ...currentCalc, multa_40_fgts: v })} />
                    </div>
                  </div>
                </Card>
              )}

              {step === 4 && (
                <Card title="Horas Extras e Adicional Noturno">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Média Horas Extras 50% (Mes)" type="number" value={currentCalc.he50_horas_mes} onChange={v => setCurrentCalc({ ...currentCalc, he50_horas_mes: v })} />
                      <Input label="Média Horas Extras 100% (Mes)" type="number" value={currentCalc.he100_horas_mes} onChange={v => setCurrentCalc({ ...currentCalc, he100_horas_mes: v })} />
                    </div>
                    <div className="flex gap-4">
                      <Switch label="Usar DSR?" checked={currentCalc.usar_dsr} onChange={v => setCurrentCalc({ ...currentCalc, usar_dsr: v })} />
                      {currentCalc.usar_dsr && <Input label="Fator DSR (Ex: 0.1667)" type="number" className="flex-1" value={currentCalc.fator_dsr} onChange={v => setCurrentCalc({ ...currentCalc, fator_dsr: v })} />}
                    </div>
                    <hr className="border-slate-100" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Média Horas Noturnas (Mes)" type="number" value={currentCalc.noturno_horas_mes} onChange={v => setCurrentCalc({ ...currentCalc, noturno_horas_mes: v })} />
                      <Input label="Percentual Noturno" type="number" value={currentCalc.noturno_percentual} onChange={v => setCurrentCalc({ ...currentCalc, noturno_percentual: v })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Switch label="Hora Reduzida Noturna?" checked={currentCalc.hora_reduzida} onChange={v => setCurrentCalc({ ...currentCalc, hora_reduzida: v })} />
                      {/* Fix for error on line 444: Corrected onChange to update multiple fields correctly within one state update */}
                      <Switch label="Refletir em 13º/Férias/FGTS?" checked={currentCalc.reflexo_13_var} onChange={v => setCurrentCalc({ ...currentCalc, reflexo_13_var: v, reflexo_ferias_var: v, reflexo_fgts_var: v })} />
                    </div>
                  </div>
                </Card>
              )}

              {step === 5 && (
                <Card title="Adicionais e Multas">
                  <div className="space-y-6">
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg space-y-4">
                      <h4 className="text-sm font-bold text-amber-800">Insalubridade</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label="Grau Insalubridade" value={currentCalc.insal_grau.toString()} onChange={v => setCurrentCalc({ ...currentCalc, insal_grau: parseFloat(v) })} options={[{ label: '0%', value: '0' }, { label: 'Mínimo (10%)', value: '0.1' }, { label: 'Médio (20%)', value: '0.2' }, { label: 'Máximo (40%)', value: '0.4' }]} />
                        <Select label="Base Insalubridade" value={currentCalc.insal_base} onChange={v => setCurrentCalc({ ...currentCalc, insal_base: v })} options={[{ label: 'Salário Mínimo', value: 'SALARIO_MINIMO' }, { label: 'Remuneração Média', value: 'REMUNERACAO_MEDIA' }, { label: 'Salário Base', value: 'SALARIO_BASE' }]} />
                      </div>
                      <Input label="Valor Salário Mínimo" type="number" prefix="R$" value={currentCalc.salario_minimo} onChange={v => setCurrentCalc({ ...currentCalc, salario_minimo: v })} />
                    </div>
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg space-y-4">
                      <h4 className="text-sm font-bold text-indigo-800">Periculosidade</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label="Percentual Peric." value={currentCalc.peric_percentual.toString()} onChange={v => setCurrentCalc({ ...currentCalc, peric_percentual: parseFloat(v) })} options={[{ label: '0%', value: '0' }, { label: '30%', value: '0.3' }]} />
                        <Select label="Base Peric." value={currentCalc.peric_base} onChange={v => setCurrentCalc({ ...currentCalc, peric_base: v })} options={[{ label: 'Salário Base', value: 'SALARIO_BASE' }, { label: 'Remuneração Média', value: 'REMUNERACAO_MEDIA' }]} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-800">Multas CLT</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Switch label="Multa Art. 477 (Atraso Homologação)?" checked={currentCalc.multa_477} onChange={v => setCurrentCalc({ ...currentCalc, multa_477: v })} />
                        <Switch label="Multa Art. 467 (Verbas Incontroversas)?" checked={currentCalc.multa_467} onChange={v => setCurrentCalc({ ...currentCalc, multa_467: v })} />
                      </div>
                      {currentCalc.multa_467 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input label="Base de Cálculo Art. 467" type="number" prefix="R$" value={currentCalc.base_467_valor} onChange={v => setCurrentCalc({ ...currentCalc, base_467_valor: v })} />
                          <Input label="Percentual Multa (%)" type="number" value={currentCalc.multa_467_percentual * 100} onChange={v => setCurrentCalc({ ...currentCalc, multa_467_percentual: v / 100 })} />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              <footer className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200 p-4 flex items-center justify-between z-20 shadow-lg">
                <Button variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>
                  <ArrowLeft size={18} /> Anterior
                </Button>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  {step < 5 ? (
                    <Button onClick={() => setStep(step + 1)}>
                      Próximo <ChevronRight size={18} />
                    </Button>
                  ) : (
                    <Button onClick={handleSave}>
                      Finalizar e Calcular
                    </Button>
                  )}
                </div>
              </footer>
            </div>
          )}

          {viewingResult && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">{currentCalc?.name}</h2>
                  <p className="text-slate-500">Cálculo gerado em {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                <Button variant="primary" onClick={() => window.print()} className="print:hidden">
                  Imprimir / PDF
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-600 !border-none !text-white col-span-1 md:col-span-2">
                  <span className="text-blue-100 text-sm font-medium uppercase tracking-wider">Total Geral</span>
                  <div className="text-4xl font-black mt-1">{formatBRL(viewingResult.totals.total_geral)}</div>
                  <div className="mt-4 flex gap-4 text-xs font-semibold">
                    <div className="bg-white/20 px-2 py-1 rounded">CENÁRIO: {currentCalc?.scenario}</div>
                    <div className="bg-white/20 px-2 py-1 rounded">REM. MÉDIA: {formatBRL(viewingResult.computed.remuneracao_media)}</div>
                  </div>
                </Card>
                <Card className="border-l-4 border-l-emerald-500">
                  <span className="text-slate-500 text-xs font-bold uppercase">Rescisão</span>
                  <div className="text-xl font-bold text-slate-800 mt-1">{formatBRL(viewingResult.totals.total_rescisao)}</div>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                  <span className="text-slate-500 text-xs font-bold uppercase">FGTS</span>
                  <div className="text-xl font-bold text-slate-800 mt-1">{formatBRL(viewingResult.totals.total_fgts)}</div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-purple-500">
                  <span className="text-slate-500 text-xs font-bold uppercase">Variáveis (HE/Noturno)</span>
                  <div className="text-xl font-bold text-slate-800 mt-1">{formatBRL(viewingResult.totals.total_variaveis)}</div>
                </Card>
                <Card className="border-l-4 border-l-cyan-500">
                  <span className="text-slate-500 text-xs font-bold uppercase">Adicionais e Multas</span>
                  <div className="text-xl font-bold text-slate-800 mt-1">{formatBRL(viewingResult.totals.total_adicionais + viewingResult.totals.total_multas)}</div>
                </Card>
              </div>

              <Card title="Detalhamento de Rubricas">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                        <th className="px-4 py-3 font-bold rounded-tl-lg">Cod</th>
                        <th className="px-4 py-3 font-bold">Rubrica</th>
                        <th className="px-4 py-3 font-bold">Fórmula de Cálculo</th>
                        <th className="px-4 py-3 font-bold text-right rounded-tr-lg">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewingResult.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-4 text-slate-400 font-mono text-xs">{item.code}</td>
                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-700">{item.label}</div>
                            <div className="text-xs text-slate-400 font-medium">{item.group}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-500 italic font-mono">{item.formula}</td>
                          <td className="px-4 py-4 text-right font-bold text-slate-900">{formatBRL(item.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-800 text-white">
                        <td colSpan={3} className="px-4 py-4 text-right font-bold rounded-bl-lg uppercase text-sm">Total Final do Cálculo</td>
                        <td className="px-4 py-4 text-right font-black text-xl rounded-br-lg">{formatBRL(viewingResult.totals.total_geral)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>

              <div className="bg-slate-100 p-8 rounded-xl border-2 border-dashed border-slate-200">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" /> Notas Explicativas
                </h3>
                <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-2">
                  <p>1. O presente cálculo tem caráter exclusivamente orientativo para fins de provisionamento ou liquidação prévia de pedidos.</p>
                  <p>2. Foi utilizada a base de cálculo: <strong>{currentCalc?.base_calculo === 'REMUNERACAO_MEDIA' ? 'Remuneração Média (Comissões/Variáveis inclusas)' : 'Salário Base'}</strong>.</p>
                  <p>3. As verbas rescisórias foram apuradas considerando a data de demissão em {currentCalc?.data_demissao} sob a modalidade {currentCalc?.tipo_desligamento}.</p>
                  <p>4. No cálculo de horas extras e adicional noturno, utilizou-se o divisor {currentCalc?.divisor_horas} com reflexo de DSR no fator {currentCalc?.fator_dsr}.</p>
                  <p className="font-bold text-slate-800 mt-4">Assinado eletronicamente por LaborCalc Platform</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calculations' && !isEditing && !viewingResult && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Cálculos Salvos</h2>
                <Button onClick={startNew}>
                  <Plus size={18} /> Novo Cálculo
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {calculations.map(calc => (
                  <Card key={calc.id} className="group hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer" onClick={() => { setCurrentCalc(calc); setViewingResult(calculateLaborRights(calc)); }}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FileText size={20} />
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${calc.scenario === 'RECLAMANTE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {calc.scenario}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 truncate">{calc.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">Ref: {calc.data_demissao || 'Sem data'}</p>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm font-bold text-slate-600">
                        {formatBRL(calc.salario_base)} <span className="text-[10px] font-normal">BASE</span>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                        <Button variant="danger" className="!p-1.5" onClick={() => handleDelete(calc.id!)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              {calculations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                  </div>
                  <p className="text-lg font-medium">Você ainda não criou nenhum cálculo.</p>
                  <Button variant="primary" className="mt-4" onClick={startNew}>Começar agora</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
