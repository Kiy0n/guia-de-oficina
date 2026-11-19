import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Calculator,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Cog,
  Copy,
  Database,
  Edit3,
  FileCheck2,
  Gauge,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  Wrench,
  Zap,
} from 'lucide-react';

import { SectionHeader } from '@/components/SectionHeader';
import { SpotlightCard } from '@/components/SpotlightCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMoto, useMotoSelecionada } from '@/context/MotoContext';
import { gerarPlanoRevisoes } from '@/data/revisoes';
import { SECTIONS } from '@/lib/sections';
import { cn } from '@/lib/utils';
import type { OrdemServico, OrdemServicoPayload, PecaOrdemServico, TipoOrdemServico } from '@/types/oficina';
import { nmParaKgfm } from '@/utils/format';

// ---------------------------------------------------------------------------
// Tabela de Torques Padrão por Rosca/Parafuso (Referência Universal de Oficina)
// ---------------------------------------------------------------------------
interface TorquePadraoRosca {
  rosca: string;
  chaveComum: string;
  tipoParafuso: string;
  torqueNm: number;
  torqueKgfm: string;
  aplicacaoTipica: string;
}

const TORQUES_PADRAO_ROSCA: readonly TorquePadraoRosca[] = [
  {
    rosca: 'M5 x 0,8',
    chaveComum: '8 mm / Phillips / Allen 4 mm',
    tipoParafuso: 'Parafuso sextavado / Carenagem',
    torqueNm: 5,
    torqueKgfm: '0,5 kgf·m',
    aplicacaoTipica: 'Carenagens, tampas plásticas, abraçadeiras e suportes leves',
  },
  {
    rosca: 'M6 x 1,0 (Sextavado)',
    chaveComum: '8 mm ou 10 mm / Allen 5 mm',
    tipoParafuso: 'Parafuso M6 comum em carcaça de alumínio',
    torqueNm: 10,
    torqueKgfm: '1,0 kgf·m',
    aplicacaoTipica: 'Tampas laterais do motor (embreagem/estator), tampa de válvulas, tampa do pinhão e filtro de óleo',
  },
  {
    rosca: 'M6 x 1,0 (Flangeado)',
    chaveComum: '10 mm Flange',
    tipoParafuso: 'Parafuso flangeado cabeça 10 mm (aço)',
    torqueNm: 12,
    torqueKgfm: '1,2 kgf·m',
    aplicacaoTipica: 'Trava do pinhão, tampa do filtro centrífugo, coletor e fixações estruturais M6',
  },
  {
    rosca: 'M8 x 1,25',
    chaveComum: '12 mm ou 13 mm / Allen 6 mm',
    tipoParafuso: 'Parafuso flangeado / Prisioneiro M8',
    torqueNm: 24,
    torqueKgfm: '2,4 kgf·m',
    aplicacaoTipica: 'Cavalete do guidão, mesas da suspensão, suporte de escapamento, pedaleiras e pinça (30 N·m c/ trava)',
  },
  {
    rosca: 'M10 x 1,25',
    chaveComum: '14 mm ou 17 mm',
    tipoParafuso: 'Parafuso / Porca flangeada M10 passo fino',
    torqueNm: 38,
    torqueKgfm: '3,9 kgf·m',
    aplicacaoTipica: 'Fixação dos amortecedores traseiros, suportes do motor no chassi e coroa traseira',
  },
  {
    rosca: 'M12 x 1,25 / 1,5',
    chaveComum: '17 mm ou 19 mm',
    tipoParafuso: 'Eixo / Fixação estrutural M12',
    torqueNm: 55,
    torqueKgfm: '5,6 kgf·m',
    aplicacaoTipica: 'Suportes principais do motor, eixo da balança e eixo dianteiro (59–63 N·m)',
  },
];

// ---------------------------------------------------------------------------
// Helpers de Formatação Monetária e WhatsApp da OS
// ---------------------------------------------------------------------------
function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function calcularTotalOS(pecas: PecaOrdemServico[], maoDeObra = 0): {
  totalPecas: number;
  maoDeObra: number;
  totalGeral: number;
} {
  const totalPecas = pecas.reduce(
    (acc, item) => acc + (Number(item.quantidade) || 0) * (Number(item.valorUnitario) || 0),
    0,
  );
  const mdo = Number(maoDeObra) || 0;
  return {
    totalPecas,
    maoDeObra: mdo,
    totalGeral: totalPecas + mdo,
  };
}

function montarTextoWhatsAppOS(os: OrdemServicoPayload & { id?: string }): string {
  const { totalPecas, maoDeObra, totalGeral } = calcularTotalOS(os.pecas, os.maoDeObra);
  const tipoLabel =
    os.tipo === 'preventiva'
      ? 'Manutenção Preventiva'
      : os.tipo === 'corretiva'
        ? 'Manutenção Corretiva'
        : 'Revisão Periódica';

  const linhas: string[] = [
    `🛠️ *MOTOTECH PRO — ORDEM DE SERVIÇO*`,
    `📅 *Data:* ${os.dataServico.split('-').reverse().join('/')}`,
    `🏍️ *Moto:* ${os.marca} ${os.modeloNome} (${os.anosLabel})`,
  ];

  if (os.apelidoOuPlaca) {
    linhas.push(`🔖 *Identificação / Placa:* ${os.apelidoOuPlaca}`);
  }

  linhas.push(
    `📍 *KM Atual:* ${os.kmAtual.toLocaleString('pt-BR')} km`,
    `🔧 *Tipo:* ${tipoLabel}`,
  );

  if (os.proximaTrocaOleoKm) {
    linhas.push(`🛢️ *Próxima Troca de Óleo:* ${os.proximaTrocaOleoKm.toLocaleString('pt-BR')} km`);
  }

  linhas.push(`----------------------------------------`, `✅ *SERVIÇOS REALIZADOS:*`);
  if (os.servicosRealizados.length === 0) {
    linhas.push(`• Revisão geral de bancada`);
  } else {
    for (const s of os.servicosRealizados) {
      linhas.push(`• ${s}`);
    }
  }

  if (os.pecas.length > 0) {
    linhas.push(`----------------------------------------`, `📦 *PEÇAS & INSUMOS:*`);
    for (const p of os.pecas) {
      const sub = p.quantidade * p.valorUnitario;
      linhas.push(`• ${p.quantidade}x ${p.nome} — ${formatarMoeda(sub)}`);
    }
  }

  if (totalGeral > 0) {
    linhas.push(`----------------------------------------`);
    if (totalPecas > 0) linhas.push(`💵 *Total Peças:* ${formatarMoeda(totalPecas)}`);
    if (maoDeObra > 0) linhas.push(`👨‍🔧 *Mão de Obra:* ${formatarMoeda(maoDeObra)}`);
    linhas.push(`💰 *TOTAL GERAL:* *${formatarMoeda(totalGeral)}*`);
  }

  if (os.observacoes) {
    linhas.push(`----------------------------------------`, `📝 *Observações Técnicas:*`, os.observacoes);
  }

  return linhas.join('\n');
}

function sugerirFusivelEBitola(correnteAmperes: number): {
  fusivelComercial: string;
  bitolaFio: string;
  observacao: string;
} {
  if (correnteAmperes <= 0) {
    return {
      fusivelComercial: '—',
      bitolaFio: '—',
      observacao: 'Informe a potência (Watts) ou corrente (Amperes) do acessório.',
    };
  }

  // Margem de segurança de ~35% sobre a corrente nominal contínua
  const correnteComMargem = correnteAmperes * 1.35;
  const fusiveisPadrao = [5, 7.5, 10, 15, 20, 25, 30];
  const escolhido = fusiveisPadrao.find((f) => f >= correnteComMargem) ?? 30;

  let bitola = '0,75 mm²';
  if (correnteAmperes > 18) bitola = '4,0 mm²';
  else if (correnteAmperes > 12) bitola = '2,5 mm²';
  else if (correnteAmperes > 7) bitola = '1,5 mm²';
  else if (correnteAmperes > 3.5) bitola = '1,0 mm²';

  return {
    fusivelComercial: `${escolhido}A (Lâmina Mini/Padrão)`,
    bitolaFio: `Cobre flexível ${bitola}`,
    observacao:
      correnteAmperes > 5
        ? 'Acima de 5A: obrigatório instalar Relé Auxiliar 4 pinos puxando positivo direto da bateria (não ligar direto no pós-chave!).'
        : 'Consumo baixo: pode ser alimentado via linha pós-chave protegida pelo fusível indicado.',
  };
}

export function TorquesCalculadorasOSPage() {
  const moto = useMotoSelecionada();
  const { rascunhoOS, limparRascunhoOS, setSection } = useMoto();
  const f = moto.geracao.fichaTecnica;

  const [abaAtiva, setAbaAtiva] = useState<string>('torques');

  // -------------------------------------------------------------------------
  // Estado da Sub-Aba 1: Torques
  // -------------------------------------------------------------------------
  const [buscaTorque, setBuscaTorque] = useState<string>('');

  // -------------------------------------------------------------------------
  // Estado da Sub-Aba 2: Calculadoras de Bancada
  // -------------------------------------------------------------------------
  // 2.1 Conversor de Torque
  const [convNm, setConvNm] = useState<string>('30');
  const [convKgfm, setConvKgfm] = useState<string>('3.06');
  const [convLbfft, setConvLbfft] = useState<string>('22.13');

  const atualizarDeNm = (val: string) => {
    setConvNm(val);
    const n = Number(val);
    if (!Number.isNaN(n) && val.trim() !== '') {
      setConvKgfm((n / 9.80665).toFixed(2));
      setConvLbfft((n * 0.737562).toFixed(2));
    }
  };

  const atualizarDeKgfm = (val: string) => {
    setConvKgfm(val);
    const k = Number(val);
    if (!Number.isNaN(k) && val.trim() !== '') {
      const nm = k * 9.80665;
      setConvNm(nm.toFixed(1));
      setConvLbfft((nm * 0.737562).toFixed(2));
    }
  };

  const atualizarDeLbfft = (val: string) => {
    setConvLbfft(val);
    const lb = Number(val);
    if (!Number.isNaN(lb) && val.trim() !== '') {
      const nm = lb / 0.737562;
      setConvNm(nm.toFixed(1));
      setConvKgfm((nm / 9.80665).toFixed(2));
    }
  };

  // 2.2 Calculadora Elétrica 12V (Lei de Ohm + Fusível)
  const [tensaoV, setTensaoV] = useState<number>(13.8);
  const [potenciaW, setPotenciaW] = useState<string>('35');
  const [correnteA, setCorrenteA] = useState<string>((35 / 13.8).toFixed(2));

  const atualizarPotenciaW = (val: string, v = tensaoV) => {
    setPotenciaW(val);
    const w = Number(val);
    if (!Number.isNaN(w) && w >= 0 && v > 0) {
      setCorrenteA((w / v).toFixed(2));
    }
  };

  const atualizarCorrenteA = (val: string, v = tensaoV) => {
    setCorrenteA(val);
    const a = Number(val);
    if (!Number.isNaN(a) && a >= 0 && v > 0) {
      setPotenciaW((a * v).toFixed(1));
    }
  };

  const trocarTensaoReferencia = (novaTensao: number) => {
    setTensaoV(novaTensao);
    atualizarPotenciaW(potenciaW, novaTensao);
  };

  const resistenciaOhms = useMemo(() => {
    const a = Number(correnteA);
    if (Number.isNaN(a) || a <= 0) return '—';
    return `${(tensaoV / a).toFixed(2)} Ω`;
  }, [tensaoV, correnteA]);

  const recomendacaoEletrica = useMemo(
    () => sugerirFusivelEBitola(Number(correnteA) || 0),
    [correnteA],
  );

  // 2.3 Calculadora de Relação (Pinhão x Coroa)
  const pinhaoOriginal = f.transmissaoFinal?.pinhaoDentes ?? 15;
  const coroaOriginal = f.transmissaoFinal?.coroaDentes ?? 44;
  const [pinhaoSimulado, setPinhaoSimulado] = useState<number>(pinhaoOriginal);
  const [coroaSimulada, setCoroaSimulada] = useState<number>(coroaOriginal);

  useEffect(() => {
    setPinhaoSimulado(f.transmissaoFinal?.pinhaoDentes ?? 15);
    setCoroaSimulada(f.transmissaoFinal?.coroaDentes ?? 44);
  }, [moto.geracao.id, f.transmissaoFinal?.pinhaoDentes, f.transmissaoFinal?.coroaDentes]);

  const analiseRelacao = useMemo(() => {
    const razaoOrig = coroaOriginal / Math.max(1, pinhaoOriginal);
    const razaoNova = coroaSimulada / Math.max(1, pinhaoSimulado);
    // Variação de alongamento (velocidade final na mesma RPM): (razaoOrig / razaoNova - 1) * 100
    const variacaoFinalPct = ((razaoOrig / razaoNova - 1) * 100);
    return {
      razaoOrig: razaoOrig.toFixed(3),
      razaoNova: razaoNova.toFixed(3),
      variacaoFinalPct,
    };
  }, [pinhaoOriginal, coroaOriginal, pinhaoSimulado, coroaSimulada]);

  // -------------------------------------------------------------------------
  // Estado da Sub-Aba 3: Ordem de Serviço (OS) & Histórico
  // -------------------------------------------------------------------------
  const hojeIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [editandoOsId, setEditandoOsId] = useState<string | null>(null);
  const [dataServico, setDataServico] = useState<string>(hojeIso);
  const [kmAtual, setKmAtual] = useState<string>('12000');
  const [proximaTrocaOleoKm, setProximaTrocaOleoKm] = useState<string>('15000');
  const [tipoOs, setTipoOs] = useState<TipoOrdemServico>('preventiva');
  const [apelidoOuPlaca, setApelidoOuPlaca] = useState<string>('');
  const [servicosRealizados, setServicosRealizados] = useState<string[]>([
    `Troca de óleo do motor (${f.fluidos?.oleoMotor?.capacidadeTrocaL ?? 1} L — ${f.fluidos?.oleoMotor?.especificacao ?? '10W-30'})`,
  ]);
  const [novoServicoInput, setNovoServicoInput] = useState<string>('');
  const [pecas, setPecas] = useState<PecaOrdemServico[]>([
    {
      nome: `Óleo ${f.fluidos?.oleoMotor?.especificacao.split('(')[0]?.trim() ?? '10W-30 Semissintético'}`,
      quantidade: 1,
      valorUnitario: 42,
    },
  ]);
  const [maoDeObra, setMaoDeObra] = useState<string>('60');
  const [observacoes, setObservacoes] = useState<string>('');

  const [ordensSalvas, setOrdensSalvas] = useState<OrdemServico[]>([]);
  const [carregandoOs, setCarregandoOs] = useState<boolean>(true);
  const [salvandoOs, setSalvandoOs] = useState<boolean>(false);
  const [apenasMotoAtualHistorico, setApenasMotoAtualHistorico] = useState<boolean>(false);
  const [feedbackMensagem, setFeedbackMensagem] = useState<string | null>(null);
  const [copiadoOsForm, setCopiadoOsForm] = useState<boolean>(false);
  const [copiadoOsHistoricoId, setCopiadoOsHistoricoId] = useState<string | null>(null);

  const carregarOrdens = useCallback(async () => {
    setCarregandoOs(true);
    try {
      const res = await fetch('/api/os', { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { ordensServico?: OrdemServico[] } | OrdemServico[];
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data.ordensServico)
          ? data.ordensServico
          : [];
      setOrdensSalvas(lista);
    } catch {
      // ignore network error
    } finally {
      setCarregandoOs(false);
    }
  }, []);

  useEffect(() => {
    void carregarOrdens();
  }, [carregarOrdens]);

  // Recebe rascunho vindo do Diagnóstico Corretivo
  useEffect(() => {
    if (!rascunhoOS) return;
    setAbaAtiva('os');
    if (rascunhoOS.tipo) setTipoOs(rascunhoOS.tipo);
    if (rascunhoOS.servicosRealizados && rascunhoOS.servicosRealizados.length > 0) {
      setServicosRealizados((prev) =>
        Array.from(new Set([...prev, ...rascunhoOS.servicosRealizados!])),
      );
    }
    if (rascunhoOS.observacoes) {
      setObservacoes((prev) =>
        prev ? `${prev}\n${rascunhoOS.observacoes}` : rascunhoOS.observacoes!,
      );
    }
    setFeedbackMensagem('Resumo do Diagnóstico Corretivo importado para a Ordem de Serviço!');
    limparRascunhoOS();
  }, [rascunhoOS, limparRascunhoOS]);

  const def = SECTIONS.find((s) => s.id === 'torques-os') ?? SECTIONS[0];

  const torquesFiltrados = useMemo(() => {
    const lista = f.torques ?? [];
    const termo = buscaTorque.trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter(
      (t) =>
        t.item.toLowerCase().includes(termo) ||
        (t.observacao ?? '').toLowerCase().includes(termo) ||
        (t.categoria ?? '').toLowerCase().includes(termo),
    );
  }, [f.torques, buscaTorque]);

  const { totalPecas, maoDeObra: mdoNum, totalGeral } = useMemo(
    () => calcularTotalOS(pecas, Number(maoDeObra) || 0),
    [pecas, maoDeObra],
  );

  const ordensHistoricoFiltradas = useMemo(() => {
    if (!apenasMotoAtualHistorico) return ordensSalvas;
    return ordensSalvas.filter((o) => o.modeloId === moto.modelo.id);
  }, [ordensSalvas, apenasMotoAtualHistorico, moto.modelo.id]);

  if (!def) return null;

  // -------------------------------------------------------------------------
  // Funções do Formulário de OS
  // -------------------------------------------------------------------------
  const aplicarAtalhoProximaTroca = (deltaKm: number) => {
    const atual = Number(kmAtual) || 0;
    setProximaTrocaOleoKm(String(atual + deltaKm));
  };

  const adicionarServico = (e?: React.FormEvent) => {
    e?.preventDefault();
    const texto = novoServicoInput.trim();
    if (!texto) return;
    if (!servicosRealizados.includes(texto)) {
      setServicosRealizados((prev) => [...prev, texto]);
    }
    setNovoServicoInput('');
  };

  const removerServico = (idx: number) => {
    setServicosRealizados((prev) => prev.filter((_, i) => i !== idx));
  };

  const importarDoManualRevisoes = () => {
    const plano = gerarPlanoRevisoes(moto.modelo, moto.geracao);
    const importados: string[] = [];

    // 1. Procura todos os itens marcados como concluídos no localStorage desta moto/geração
    for (const marco of plano) {
      const key = `mototech-pro:checklist:v1:${moto.modelo.id}:${moto.geracao.id}:${marco.km}`;
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        const marcados = JSON.parse(raw) as Record<string, boolean>;
        for (const item of marco.itens) {
          if (marcados[item.id]) {
            importados.push(`[${marco.labelKm}] ${item.titulo}`);
          }
        }
      } catch {
        // ignore
      }
    }

    // 2. Se o usuário ainda não tiver marcado checkboxes no Manual de Revisões,
    // importa os itens de TROCAR / REGULAR da revisão mais próxima do KM atual informado
    if (importados.length === 0 && plano.length > 0) {
      const kmRef = Number(kmAtual) || 1000;
      const marcoMaisProximo =
        plano.reduce((prev, curr) =>
          Math.abs(curr.km - kmRef) < Math.abs(prev.km - kmRef) ? curr : prev,
        ) ?? plano[0];

      if (marcoMaisProximo) {
        for (const item of marcoMaisProximo.itens) {
          if (item.categoria === 'TROCAR' || item.categoria === 'REGULAR' || item.categoria === 'LIMPAR_LUBRIFICAR') {
            importados.push(`[Revisão ${marcoMaisProximo.labelKm}] ${item.titulo}`);
          }
        }
        setFeedbackMensagem(
          `Importados ${importados.length} serviços da Revisão de ${marcoMaisProximo.labelKm} (mais próxima do KM atual).`,
        );
      }
    } else {
      setFeedbackMensagem(
        `Importados ${importados.length} itens marcados como concluídos no Manual de Revisões!`,
      );
    }

    if (importados.length > 0) {
      setServicosRealizados((prev) => Array.from(new Set([...prev, ...importados])));
    }
  };

  const adicionarPeca = () => {
    setPecas((prev) => [...prev, { nome: '', quantidade: 1, valorUnitario: 0 }]);
  };

  const atualizarPeca = (idx: number, campo: keyof PecaOrdemServico, valor: string | number) => {
    setPecas((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [campo]: valor } : item)),
    );
  };

  const removerPeca = (idx: number) => {
    setPecas((prev) => prev.filter((_, i) => i !== idx));
  };

  const limparFormularioOS = () => {
    setEditandoOsId(null);
    setDataServico(hojeIso);
    setKmAtual('12000');
    setProximaTrocaOleoKm('15000');
    setTipoOs('preventiva');
    setApelidoOuPlaca('');
    setServicosRealizados([]);
    setPecas([]);
    setMaoDeObra('0');
    setObservacoes('');
    setFeedbackMensagem(null);
  };

  const construirPayloadAtual = (): OrdemServicoPayload => ({
    dataServico,
    marca: moto.marca,
    modeloId: moto.modelo.id,
    modeloNome: moto.modelo.nome,
    geracaoId: moto.geracao.id,
    anosLabel: moto.geracao.anosLabel,
    ...(apelidoOuPlaca.trim() ? { apelidoOuPlaca: apelidoOuPlaca.trim() } : {}),
    kmAtual: Math.max(0, Math.round(Number(kmAtual) || 0)),
    ...(Number(proximaTrocaOleoKm) > 0
      ? { proximaTrocaOleoKm: Math.round(Number(proximaTrocaOleoKm)) }
      : {}),
    tipo: tipoOs,
    servicosRealizados,
    pecas: pecas.filter((p) => p.nome.trim().length > 0),
    maoDeObra: Math.max(0, Number(maoDeObra) || 0),
    observacoes: observacoes.trim(),
  });

  const salvarOrdemServico = async () => {
    setSalvandoOs(true);
    setFeedbackMensagem(null);

    try {
      const payload = construirPayloadAtual();
      const url = editandoOsId ? `/api/os/${editandoOsId}` : '/api/os';
      const method = editandoOsId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errObj = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errObj.error ?? `Falha ao salvar OS (HTTP ${res.status})`);
      }

      await carregarOrdens();
      setFeedbackMensagem(
        editandoOsId
          ? 'Ordem de Serviço atualizada com sucesso em data/oficina.json!'
          : 'Nova Ordem de Serviço salva com sucesso em data/oficina.json!',
      );
      setEditandoOsId(null);
    } catch (err) {
      setFeedbackMensagem(
        err instanceof Error ? err.message : 'Erro ao salvar Ordem de Serviço.',
      );
    } finally {
      setSalvandoOs(false);
    }
  };

  const editarOrdemExistente = (os: OrdemServico) => {
    setEditandoOsId(os.id);
    setDataServico(os.dataServico);
    setKmAtual(String(os.kmAtual));
    setProximaTrocaOleoKm(os.proximaTrocaOleoKm ? String(os.proximaTrocaOleoKm) : '');
    setTipoOs(os.tipo);
    setApelidoOuPlaca(os.apelidoOuPlaca ?? '');
    setServicosRealizados([...os.servicosRealizados]);
    setPecas(os.pecas.map((p) => ({ ...p })));
    setMaoDeObra(String(os.maoDeObra ?? 0));
    setObservacoes(os.observacoes);
    setFeedbackMensagem(`Editando OS de ${os.dataServico.split('-').reverse().join('/')} (${os.modeloNome})`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const excluirOrdemExistente = async (id: string) => {
    try {
      const res = await fetch(`/api/os/${id}`, { method: 'DELETE' });
      if (!res.ok) return;
      setOrdensSalvas((prev) => prev.filter((o) => o.id !== id));
      if (editandoOsId === id) {
        limparFormularioOS();
      }
    } catch {
      // ignore
    }
  };

  const copiarOsWhatsapp = async (os: OrdemServicoPayload & { id?: string }, isHistorico = false) => {
    const texto = montarTextoWhatsAppOS(os);
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const area = document.createElement('textarea');
      area.value = texto;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }

    if (isHistorico && os.id) {
      setCopiadoOsHistoricoId(os.id);
      window.setTimeout(() => setCopiadoOsHistoricoId(null), 2200);
    } else {
      setCopiadoOsForm(true);
      window.setTimeout(() => setCopiadoOsForm(false), 2200);
    }
  };

  const isAuditado = moto.geracao.auditoria.status === 'verificado_manual';

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section={def}>
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-emerald-300"
        >
          <Database className="size-3.5" />
          Histórico: {ordensSalvas.length} {ordensSalvas.length === 1 ? 'OS salva' : 'OS salvas'}
        </Badge>
      </SectionHeader>

      {/* ------------------------------------------------------------------ */}
      {/* 3 Sub-abas: Torques | Calculadoras de Bancada | Ordem de Serviço   */}
      {/* ------------------------------------------------------------------ */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1.5 bg-card/80 p-1.5 sm:grid-cols-3">
          <TabsTrigger value="torques" className="gap-2 py-2.5 text-xs sm:text-sm">
            <Wrench className="size-4" />
            1. Tabela de Torques
          </TabsTrigger>
          <TabsTrigger value="calculadoras" className="gap-2 py-2.5 text-xs sm:text-sm">
            <Calculator className="size-4" />
            2. Calculadoras de Bancada
          </TabsTrigger>
          <TabsTrigger value="os" className="gap-2 py-2.5 text-xs sm:text-sm">
            <ClipboardList className="size-4" />
            3. Ordem de Serviço (OS) & Histórico
          </TabsTrigger>
        </TabsList>

        {/* ================================================================ */}
        {/* SUB-ABA 1: TORQUES ESPECÍFICOS + TABELA PADRÃO POR ROSCA         */}
        {/* ================================================================ */}
        <TabsContent value="torques" className="space-y-6">
          {/* Card de Torques Específicos da Moto Selecionada */}
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">
                      Torques Específicos — {moto.marca} {moto.modelo.nome} ({moto.geracao.anosLabel})
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={cn(
                        'gap-1 text-xs',
                        isAuditado
                          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                          : 'border-amber-500/40 bg-amber-500/15 text-amber-300',
                      )}
                    >
                      {isAuditado ? (
                        <>
                          <FileCheck2 className="size-3.5" />
                          Auditado via Manual Oficial
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="size-3.5" />
                          Padrão de Serviço da Montadora
                        </>
                      )}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1 text-xs">
                    {moto.geracao.auditoria.fonte ??
                      'Valores em Newton-metro (N·m) e Quilograma-força metro (kgf·m).'}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
                    <Input
                      value={buscaTorque}
                      onChange={(e) => setBuscaTorque(e.target.value)}
                      placeholder='Filtrar (ex.: "bujão", "eixo", "vela")...'
                      className="h-9 pl-9 text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSection('manuais-pdf')}
                    className="h-9 shrink-0 gap-1.5 text-xs"
                  >
                    <BookOpen className="size-3.5 text-primary" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {torquesFiltrados.map((t, idx) => (
                  <SpotlightCard
                    key={idx}
                    marca={moto.marca}
                    intensity="subtle"
                    className="flex flex-col justify-between p-3.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {t.categoria ?? 'geral'}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm font-bold text-foreground">{t.item}</p>
                      {t.observacao && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {t.observacao}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-baseline justify-between border-t border-border/60 pt-2.5 font-mono">
                      <span className="text-xl font-extrabold text-primary">
                        {t.torque.valor} N·m
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {nmParaKgfm(t.torque.valor)} kgf·m
                      </span>
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabela Universal de Torques Padrão por Medida de Rosca (M5 a M12) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Tabela de Torques Padrão por Rosca / Parafuso (M5 a M12)
              </CardTitle>
              <CardDescription className="text-xs">
                Referência oficial de oficina para parafusos e porcas gerais que não possuem valor
                individual listado na tabela específica acima.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[680px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="p-3 font-bold">Rosca</th>
                      <th className="p-3 font-bold">Chave Comum</th>
                      <th className="p-3 font-bold">Torque (N·m)</th>
                      <th className="p-3 font-bold">Torque (kgf·m)</th>
                      <th className="p-3 font-bold">Onde é encontrado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {TORQUES_PADRAO_ROSCA.map((item) => (
                      <tr key={item.rosca} className="hover:bg-accent/25">
                        <td className="p-3 font-mono font-bold text-foreground">{item.rosca}</td>
                        <td className="p-3 font-mono text-muted-foreground">{item.chaveComum}</td>
                        <td className="p-3 font-mono text-sm font-extrabold text-primary">
                          {item.torqueNm} N·m
                        </td>
                        <td className="p-3 font-mono font-semibold text-foreground">
                          {item.torqueKgfm}
                        </td>
                        <td className="p-3 text-muted-foreground">{item.aplicacaoTipica}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/35 bg-amber-500/8 p-3.5 text-xs">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
                <p className="leading-relaxed text-amber-200/90">
                  <strong>Regra de Ouro para Roscas em Alumínio (Cabeçote e Carcaças):</strong> Os
                  valores de torque de manual são sempre para <strong>roscas limpas e secas</strong>{' '}
                  (exceto quando o manual pede óleo ou trava-rosca). Nunca dê aperto final de vela
                  ou tampa de válvulas com o motor fervendo, pois a dilatação do alumínio faz a
                  rosca espanar ao esfriar!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* SUB-ABA 2: CALCULADORAS DE BANCADA                               */}
        {/* ================================================================ */}
        <TabsContent value="calculadoras" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* 1. Conversor de Torque */}
            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gauge className="size-4 text-primary" />
                  1. Conversor de Torque Instantâneo
                </CardTitle>
                <CardDescription className="text-xs">
                  Digite em qualquer unidade para converter as outras duas na hora.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Newton-metro (<code className="text-primary">N·m</code>) — Padrão Manuais Novos
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    value={convNm}
                    onChange={(e) => atualizarDeNm(e.target.value)}
                    className="font-mono text-base font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Quilograma-força metro (<code className="text-primary">kgf·m</code>) — Manuais Antigos
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={convKgfm}
                    onChange={(e) => atualizarDeKgfm(e.target.value)}
                    className="font-mono text-base font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Libra-pé (<code className="text-primary">lbf·ft</code>) — Escala Imperial EUA
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    value={convLbfft}
                    onChange={(e) => atualizarDeLbfft(e.target.value)}
                    className="font-mono text-base font-bold"
                  />
                </div>

                <div className="rounded-xl border border-primary/25 bg-primary/8 p-3 leading-relaxed">
                  <p className="font-bold text-primary">Dica de uso do Torquímetro de Estalo:</p>
                  <p className="mt-1 text-muted-foreground">
                    Regra prática de cabeça: divida <strong>N·m por 10</strong> para ter{' '}
                    <strong>kgf·m</strong> aproximado (ex.: 30 N·m ≈ 3,06 kgf·m). Após usar o
                    torquímetro de estalo, sempre retorne a escala para o valor mínimo para não
                    cansar a mola interna!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 2. Calculadora Elétrica 12V (Lei de Ohm + Fusível) */}
            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="size-4 text-primary" />
                  2. Calculadora Elétrica 12V & Fusível
                </CardTitle>
                <CardDescription className="text-xs">
                  Dimensione fusível e bitola de fio para farol auxiliar, USB, alarme ou buzina.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                {/* Seletor de tensão + Presets rápidos */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">Tensão da Moto:</span>
                  <div className="flex gap-1">
                    {[
                      { v: 12.0, label: '12,0V (Parada)' },
                      { v: 13.8, label: '13,8V (Ligada)' },
                    ].map((op) => (
                      <Button
                        key={op.v}
                        type="button"
                        variant={tensaoV === op.v ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => trocarTensaoReferencia(op.v)}
                        className="h-7 px-2 font-mono text-[11px]"
                      >
                        {op.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {[
                    { nome: 'USB (18W)', w: '18' },
                    { nome: 'Farol LED (20W)', w: '20' },
                    { nome: 'Farol H4 (35W)', w: '35' },
                    { nome: 'Par Milha (60W)', w: '60' },
                  ].map((p) => (
                    <button
                      key={p.nome}
                      type="button"
                      onClick={() => atualizarPotenciaW(p.w)}
                      className="rounded-md border bg-background/60 px-2 py-1 text-[11px] hover:border-primary/50 hover:text-primary"
                    >
                      {p.nome}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-semibold">Potência (Watts - W)</label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={potenciaW}
                      onChange={(e) => atualizarPotenciaW(e.target.value)}
                      className="font-mono text-base font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">Corrente (Amperes - A)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={correnteA}
                      onChange={(e) => atualizarCorrenteA(e.target.value)}
                      className="font-mono text-base font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-500/8 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Resistência equivalente:</span>
                    <span className="font-mono font-bold text-foreground">{resistenciaOhms}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fusível comercial ideal:</span>
                    <span className="font-mono font-extrabold text-emerald-300">
                      {recomendacaoEletrica.fusivelComercial}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Bitola mínima do fio:</span>
                    <span className="font-mono font-bold text-primary">
                      {recomendacaoEletrica.bitolaFio}
                    </span>
                  </div>
                  <p className="border-t border-border/60 pt-2 text-[11px] leading-snug text-muted-foreground">
                    {recomendacaoEletrica.observacao}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 3. Calculadora de Relação (Pinhão x Coroa) */}
            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Cog className="size-4 text-primary" />
                  3. Simulador de Relação (Pinhão × Coroa)
                </CardTitle>
                <CardDescription className="text-xs">
                  Original {moto.modelo.nome}:{' '}
                  <strong>
                    {pinhaoOriginal}Z × {coroaOriginal}Z
                  </strong>{' '}
                  (Razão {analiseRelacao.razaoOrig})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-semibold">Pinhão (Dentes Z)</label>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 px-2.5 font-mono"
                        onClick={() => setPinhaoSimulado((p) => Math.max(11, p - 1))}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min={11}
                        max={20}
                        value={pinhaoSimulado}
                        onChange={(e) => setPinhaoSimulado(Math.max(11, Number(e.target.value) || 14))}
                        className="text-center font-mono text-base font-bold"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 px-2.5 font-mono"
                        onClick={() => setPinhaoSimulado((p) => Math.min(20, p + 1))}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold">Coroa (Dentes Z)</label>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 px-2.5 font-mono"
                        onClick={() => setCoroaSimulada((c) => Math.max(30, c - 1))}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min={30}
                        max={60}
                        value={coroaSimulada}
                        onChange={(e) => setCoroaSimulada(Math.max(30, Number(e.target.value) || 43))}
                        className="text-center font-mono text-base font-bold"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 px-2.5 font-mono"
                        onClick={() => setCoroaSimulada((c) => Math.min(60, c + 1))}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setPinhaoSimulado(pinhaoOriginal);
                      setCoroaSimulada(coroaOriginal);
                    }}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Restaurar original ({pinhaoOriginal} × {coroaOriginal})
                  </button>
                </div>

                <div className="space-y-2 rounded-xl border bg-background/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Razão Original vs Nova:</span>
                    <span className="font-mono font-bold">
                      {analiseRelacao.razaoOrig} →{' '}
                      <strong className="text-primary">{analiseRelacao.razaoNova}</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Variação de Transmissão:</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-mono text-xs',
                        Math.abs(analiseRelacao.variacaoFinalPct) < 0.1
                          ? 'border-border'
                          : analiseRelacao.variacaoFinalPct > 0
                            ? 'border-sky-500/40 bg-sky-500/15 text-sky-300'
                            : 'border-amber-500/40 bg-amber-500/15 text-amber-300',
                      )}
                    >
                      {analiseRelacao.variacaoFinalPct > 0 ? '+' : ''}
                      {analiseRelacao.variacaoFinalPct.toFixed(1)}%
                    </Badge>
                  </div>

                  <p className="border-t border-border/60 pt-2 text-[11px] leading-relaxed">
                    {Math.abs(analiseRelacao.variacaoFinalPct) < 0.1 ? (
                      <span className="text-emerald-300">
                        <strong>Comportamento Original de Fábrica:</strong> Equilíbrio padrão entre
                        torque de saída e rotação em rodovia.
                      </span>
                    ) : analiseRelacao.variacaoFinalPct > 0 ? (
                      <span className="text-sky-300">
                        <strong>Relação Mais Longa (+Velocidade Final / -RPM):</strong> O motor gira{' '}
                        {Math.abs(analiseRelacao.variacaoFinalPct).toFixed(1)}% mais folgado em
                        cruzeiro, porém perde força em subidas íngremes ou com garupa.
                      </span>
                    ) : (
                      <span className="text-amber-300">
                        <strong>Relação Mais Curta (+Arrancada / +Força em Subida):</strong> Ganha{' '}
                        {Math.abs(analiseRelacao.variacaoFinalPct).toFixed(1)}% de torque na roda
                        para entregas/subidas, porém o motor trabalha em RPM mais alta na estrada.
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* SUB-ABA 3: ORDEM DE SERVIÇO (OS) & HISTÓRICO SALVO               */}
        {/* ================================================================ */}
        <TabsContent value="os" className="space-y-6">
          {feedbackMensagem && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                {feedbackMensagem}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFeedbackMensagem(null)}
                className="h-6 px-2 text-xs"
              >
                Fechar
              </Button>
            </div>
          )}

          {/* Formulário de Nova OS ou Edição */}
          <Card className="border-primary/35">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardCheck className="size-5 text-primary" />
                    {editandoOsId
                      ? 'Editando Ordem de Serviço'
                      : `Nova Ordem de Serviço — ${moto.marca} ${moto.modelo.nome} (${moto.geracao.anosLabel})`}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Gere o orçamento/comprovante para WhatsApp e salve o histórico local em{' '}
                    <code className="font-mono">data/oficina.json</code>.
                  </CardDescription>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={importarDoManualRevisoes}
                  className="gap-1.5 text-xs"
                >
                  <Sparkles className="size-3.5 text-primary" />
                  Importar itens concluídos do Manual de Revisões
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Linha 1: Data, Tipo, Placa/Apelido, KM Atual e Próxima Troca de Óleo */}
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Data do Serviço</label>
                  <Input
                    type="date"
                    value={dataServico}
                    onChange={(e) => setDataServico(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Tipo de Manutenção</label>
                  <div className="grid grid-cols-3 gap-1 rounded-lg border bg-background/60 p-1">
                    {(
                      [
                        { id: 'preventiva', label: 'Preventiva' },
                        { id: 'revisao', label: 'Revisão' },
                        { id: 'corretiva', label: 'Corretiva' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTipoOs(t.id)}
                        className={cn(
                          'rounded-md py-1.5 text-[11px] font-medium transition-colors',
                          tipoOs === t.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Placa / Cliente (Opcional)</label>
                  <Input
                    value={apelidoOuPlaca}
                    onChange={(e) => setApelidoOuPlaca(e.target.value)}
                    placeholder="Ex.: ABC-1D23 · Cliente João"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">KM Atual</label>
                  <Input
                    type="number"
                    min={0}
                    value={kmAtual}
                    onChange={(e) => setKmAtual(e.target.value)}
                    className="font-mono text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold">Próx. Troca Óleo (KM)</label>
                    <div className="flex gap-1">
                      {[1000, 3000, 4000].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => aplicarAtalhoProximaTroca(d)}
                          className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] text-primary hover:bg-primary/10"
                          title={`Somar +${d} km ao KM atual`}
                        >
                          +{d / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    value={proximaTrocaOleoKm}
                    onChange={(e) => setProximaTrocaOleoKm(e.target.value)}
                    placeholder="Opcional"
                    className="font-mono text-xs font-bold"
                  />
                </div>
              </div>

              {/* Linha 2: Serviços Realizados + Peças e Valores */}
              <div className="grid gap-5 lg:grid-cols-2">
                {/* Coluna Esquerda: Lista de Serviços Realizados */}
                <div className="space-y-3 rounded-xl border bg-background/50 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold tracking-wider uppercase">
                      Serviços Executados ({servicosRealizados.length})
                    </h4>
                  </div>

                  <form onSubmit={adicionarServico} className="flex gap-2">
                    <Input
                      value={novoServicoInput}
                      onChange={(e) => setNovoServicoInput(e.target.value)}
                      placeholder="Adicionar serviço (ex.: Regulagem de válvulas 0,08 / 0,24 mm)..."
                      className="h-9 text-xs"
                    />
                    <Button type="submit" variant="secondary" size="sm" className="h-9 shrink-0 gap-1">
                      <Plus className="size-3.5" />
                      Adicionar
                    </Button>
                  </form>

                  <div className="space-y-1.5">
                    {servicosRealizados.length === 0 ? (
                      <p className="py-3 text-center text-xs text-muted-foreground">
                        Nenhum serviço listado ainda. Adicione acima ou importe do Manual de Revisões.
                      </p>
                    ) : (
                      servicosRealizados.map((srv, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-xs"
                        >
                          <span className="flex items-center gap-2">
                            <Check className="size-3.5 shrink-0 text-emerald-400" />
                            <span>{srv}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => removerServico(idx)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Remover serviço"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Coluna Direita: Peças / Insumos + Mão de Obra */}
                <div className="space-y-3 rounded-xl border bg-background/50 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold tracking-wider uppercase">
                      Peças & Insumos ({pecas.length})
                    </h4>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={adicionarPeca}
                      className="h-7 gap-1 text-xs"
                    >
                      <Plus className="size-3.5" />
                      Adicionar Peça
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {pecas.map((p, idx) => (
                      <div key={idx} className="grid grid-cols-12 items-center gap-1.5">
                        <Input
                          value={p.nome}
                          onChange={(e) => atualizarPeca(idx, 'nome', e.target.value)}
                          placeholder="Nome da peça / óleo..."
                          className="col-span-6 h-8 text-xs"
                        />
                        <Input
                          type="number"
                          min={1}
                          value={p.quantidade}
                          onChange={(e) =>
                            atualizarPeca(idx, 'quantidade', Math.max(1, Number(e.target.value) || 1))
                          }
                          placeholder="Qtd"
                          title="Quantidade"
                          className="col-span-2 h-8 text-center font-mono text-xs"
                        />
                        <Input
                          type="number"
                          min={0}
                          step="1"
                          value={p.valorUnitario}
                          onChange={(e) =>
                            atualizarPeca(idx, 'valorUnitario', Math.max(0, Number(e.target.value) || 0))
                          }
                          placeholder="R$ Unit"
                          title="Valor unitário (R$)"
                          className="col-span-3 h-8 font-mono text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => removerPeca(idx)}
                          className="col-span-1 flex justify-center text-muted-foreground hover:text-destructive"
                          title="Remover peça"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 items-center gap-3 border-t border-border/60 pt-3">
                    <div>
                      <label className="text-xs font-semibold">Mão de Obra (R$)</label>
                      <Input
                        type="number"
                        min={0}
                        step="5"
                        value={maoDeObra}
                        onChange={(e) => setMaoDeObra(e.target.value)}
                        className="mt-1 h-9 font-mono text-xs font-bold"
                      />
                    </div>

                    <div className="rounded-xl border border-primary/35 bg-primary/10 p-2.5 text-right">
                      <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Total Geral (Peças {formatarMoeda(totalPecas)} + M.O. {formatarMoeda(mdoNum)})
                      </p>
                      <p className="font-mono text-xl font-extrabold text-primary">
                        {formatarMoeda(totalGeral)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observações Técnicas */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Observações Técnicas / Recomendações</label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex.: Pastilha traseira meia-vida (trocar na próxima revisão); folga de corrente ajustada em 25 mm..."
                  className="w-full rounded-xl border border-input bg-background/60 p-3 text-xs focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </div>

              {/* Barra de Ações da OS */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={limparFormularioOS}
                  className="gap-1.5 text-xs"
                >
                  <RotateCcw className="size-3.5" />
                  {editandoOsId ? 'Cancelar Edição / Limpar' : 'Limpar Formulário'}
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => void copiarOsWhatsapp(construirPayloadAtual(), false)}
                    className="gap-1.5"
                  >
                    {copiadoOsForm ? (
                      <Check className="size-4 text-emerald-400" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    {copiadoOsForm ? 'Copiado para WhatsApp!' : 'Copiar OS (WhatsApp)'}
                  </Button>

                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={salvandoOs}
                    onClick={() => void salvarOrdemServico()}
                    className="gap-1.5"
                  >
                    <Save className="size-4" />
                    {salvandoOs
                      ? 'Salvando...'
                      : editandoOsId
                        ? 'Atualizar OS no Histórico'
                        : 'Salvar OS no Histórico'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ---------------------------------------------------------------- */}
          {/* Histórico Salvo em data/oficina.json                             */}
          {/* ---------------------------------------------------------------- */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Database className="size-4 text-primary" />
                    Histórico de Ordens de Serviço ({ordensHistoricoFiltradas.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Persistido localmente em <code className="font-mono">/app/data/oficina.json</code>.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant={apenasMotoAtualHistorico ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setApenasMotoAtualHistorico((v) => !v)}
                    className="h-8 text-xs"
                  >
                    {apenasMotoAtualHistorico
                      ? `Filtrando: ${moto.modelo.nome}`
                      : 'Vendo todas as motos'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void carregarOrdens()}
                    disabled={carregandoOs}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <RefreshCw className={cn('size-3.5', carregandoOs && 'animate-spin')} />
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {ordensHistoricoFiltradas.length === 0 ? (
                <div className="rounded-xl border border-dashed py-8 text-center text-xs text-muted-foreground">
                  Nenhuma Ordem de Serviço salva ainda. Preencha o formulário acima e clique em
                  &ldquo;Salvar OS no Histórico&rdquo;.
                </div>
              ) : (
                ordensHistoricoFiltradas.map((os) => {
                  const totais = calcularTotalOS(os.pecas, os.maoDeObra);
                  const copiadoEste = copiadoOsHistoricoId === os.id;

                  return (
                    <div
                      key={os.id}
                      className="rounded-2xl border border-border/80 bg-background/60 p-4 transition-colors hover:border-border"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="default" className="font-mono text-xs">
                              {os.dataServico.split('-').reverse().join('/')}
                            </Badge>
                            <span className="text-sm font-bold text-foreground">
                              {os.marca} {os.modeloNome} ({os.anosLabel})
                            </span>
                            {os.apelidoOuPlaca && (
                              <Badge variant="secondary" className="text-xs">
                                {os.apelidoOuPlaca}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[11px] uppercase">
                              {os.tipo}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
                            <span>KM: {os.kmAtual.toLocaleString('pt-BR')} km</span>
                            {os.proximaTrocaOleoKm && (
                              <span className="text-emerald-400">
                                • Próx. Óleo: {os.proximaTrocaOleoKm.toLocaleString('pt-BR')} km
                              </span>
                            )}
                            <span className="font-bold text-primary">
                              • Total: {formatarMoeda(totais.totalGeral)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => void copiarOsWhatsapp(os, true)}
                            className="h-8 gap-1.5 text-xs"
                          >
                            {copiadoEste ? (
                              <Check className="size-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                            {copiadoEste ? 'Copiado!' : 'Copiar WhatsApp'}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => editarOrdemExistente(os)}
                            className="h-8 gap-1 text-xs"
                          >
                            <Edit3 className="size-3.5" />
                            Editar
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => void excluirOrdemExistente(os.id)}
                            className="h-8 gap-1 text-xs text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                            Excluir
                          </Button>
                        </div>
                      </div>

                      {os.servicosRealizados.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/50 pt-2.5">
                          {os.servicosRealizados.map((s, i) => (
                            <Badge key={i} variant="outline" className="text-[11px] font-normal">
                              ✓ {s}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {os.observacoes && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          <strong>Obs.:</strong> {os.observacoes}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
