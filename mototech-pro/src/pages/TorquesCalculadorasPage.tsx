import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Calculator,
  Cog,
  FileCheck2,
  Gauge,
  Info,
  Search,
  ShieldAlert,
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
import { SECTIONS } from '@/lib/sections';
import { cn } from '@/lib/utils';
import type { TransmissaoFinal } from '@/types/moto';
import { nmParaKgfm } from '@/utils/format';

export const FATOR_KGFM_PARA_NM = 9.80665;
export const FATOR_LBFFT_PARA_NM = 1.35582;

export function parseDecimalBr(val: string): number | null {
  const limpo = val.trim().replace(',', '.');
  if (limpo === '' || limpo === '-' || limpo === '.') return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}

export interface RelacaoOriginalResolvida {
  pinhao: number;
  coroa: number;
  razaoOriginal: number;
  origem: 'dentes_ficha' | 'fallback_razao' | 'fallback_padrao';
  avisoFallback: string | null;
}

export function extrairRelacaoOriginal(
  transmissaoFinal?: TransmissaoFinal,
): RelacaoOriginalResolvida {
  const p = transmissaoFinal?.pinhaoDentes;
  const c = transmissaoFinal?.coroaDentes;
  if (
    typeof p === 'number' &&
    typeof c === 'number' &&
    Number.isFinite(p) &&
    Number.isFinite(c) &&
    p >= 10 &&
    c >= 25
  ) {
    return {
      pinhao: p,
      coroa: c,
      razaoOriginal: c / p,
      origem: 'dentes_ficha',
      avisoFallback: null,
    };
  }

  const texto = transmissaoFinal?.corrente ?? '';

  // Tenta extrair formato explícito "14x43" ou "14×43"
  const matchDentes = texto.match(/\b(1[1-9]|20)\s*[x×]\s*([3-5]\d|60)\b/i);
  if (matchDentes?.[1] && matchDentes[2]) {
    const pinhao = Number(matchDentes[1]);
    const coroa = Number(matchDentes[2]);
    return {
      pinhao,
      coroa,
      razaoOriginal: coroa / pinhao,
      origem: 'dentes_ficha',
      avisoFallback: null,
    };
  }

  // Tenta extrair razão decimal (ex.: "3,142" ou "2,800")
  const matchRazao = texto.match(/\b([2-4][.,]\d{2,3})\b/);
  if (matchRazao?.[1]) {
    const razao = Number(matchRazao[1].replace(',', '.'));
    if (Number.isFinite(razao) && razao >= 1.5 && razao <= 5.0) {
      const pinhaoRef = 15;
      const coroaAprox = Math.max(30, Math.min(60, Math.round(pinhaoRef * razao)));
      return {
        pinhao: pinhaoRef,
        coroa: coroaAprox,
        razaoOriginal: razao,
        origem: 'fallback_razao',
        avisoFallback: `Manual informa apenas a razão decimal (${razao.toFixed(3)}): simulação inicial aproximada com ${pinhaoRef}Z × ${coroaAprox}Z.`,
      };
    }
  }

  return {
    pinhao: 15,
    coroa: 44,
    razaoOriginal: 44 / 15,
    origem: 'fallback_padrao',
    avisoFallback:
      'Número de dentes não informado na ficha: carregada referência padrão 15Z × 44Z para simulação.',
  };
}

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
    aplicacaoTipica:
      'Tampas laterais do motor (embreagem/estator), tampa de válvulas, tampa do pinhão e filtro de óleo',
  },
  {
    rosca: 'M6 x 1,0 (Flangeado)',
    chaveComum: '10 mm Flange',
    tipoParafuso: 'Parafuso flangeado cabeça 10 mm (aço)',
    torqueNm: 12,
    torqueKgfm: '1,2 kgf·m',
    aplicacaoTipica:
      'Trava do pinhão, tampa do filtro centrífugo, coletor e fixações estruturais M6',
  },
  {
    rosca: 'M8 x 1,25',
    chaveComum: '12 mm ou 13 mm / Allen 6 mm',
    tipoParafuso: 'Parafuso flangeado / Prisioneiro M8',
    torqueNm: 24,
    torqueKgfm: '2,4 kgf·m',
    aplicacaoTipica:
      'Cavalete do guidão, mesas da suspensão, suporte de escapamento, pedaleiras e pinça (30 N·m c/ trava)',
  },
  {
    rosca: 'M10 x 1,25',
    chaveComum: '14 mm ou 17 mm',
    tipoParafuso: 'Parafuso / Porca flangeada M10 passo fino',
    torqueNm: 38,
    torqueKgfm: '3,9 kgf·m',
    aplicacaoTipica:
      'Fixação dos amortecedores traseiros, suportes do motor no chassi e coroa traseira',
  },
  {
    rosca: 'M12 x 1,25 / 1,5',
    chaveComum: '17 mm ou 19 mm',
    tipoParafuso: 'Eixo / Fixação estrutural M12',
    torqueNm: 55,
    torqueKgfm: '5,6 kgf·m',
    aplicacaoTipica:
      'Suportes principais do motor, eixo da balança e eixo dianteiro (59–63 N·m)',
  },
];

export function sugerirFusivelEBitola(correnteAmperes: number): {
  fusivelComercial: string;
  bitolaFio: string;
  observacao: string;
} {
  if (!Number.isFinite(correnteAmperes) || correnteAmperes <= 0) {
    return {
      fusivelComercial: '—',
      bitolaFio: '—',
      observacao: 'Informe a potência (Watts) ou corrente (Amperes) do acessório.',
    };
  }

  // Margem de segurança de ~35% sobre a corrente nominal contínua
  const correnteComMargem = correnteAmperes * 1.35;
  const fusiveisPadrao = [5, 7.5, 10, 15, 20, 25, 30];
  const escolhido = fusiveisPadrao.find((f) => f >= correnteComMargem);

  let bitola = '0,75 mm²';
  if (correnteAmperes > 18) bitola = '4,0 mm²';
  else if (correnteAmperes > 12) bitola = '2,5 mm²';
  else if (correnteAmperes > 7) bitola = '1,5 mm²';
  else if (correnteAmperes > 3.5) bitola = '1,0 mm²';

  return {
    fusivelComercial: escolhido
      ? `${escolhido}A (Lâmina Mini/Padrão)`
      : '> 30A (Circuito de alta carga)',
    bitolaFio: `Cobre flexível ${bitola}`,
    observacao: !escolhido
      ? 'Corrente acima do limite padrão de 30A para acessórios de motocicleta: utilize circuito dedicado com cabo reforçado.'
      : correnteAmperes > 5
        ? 'Acima de 5A: obrigatório instalar Relé Auxiliar 4 pinos puxando positivo direto da bateria (não ligar direto no pós-chave!).'
        : 'Consumo baixo: pode ser alimentado via linha pós-chave protegida pelo fusível indicado.',
  };
}

export function TorquesCalculadorasPage() {
  const moto = useMotoSelecionada();
  const { setSection } = useMoto();
  const f = moto.geracao.fichaTecnica;

  const [abaAtiva, setAbaAtiva] = useState<string>('torques');

  // -------------------------------------------------------------------------
  // Estado da Sub-Aba 1: Torques
  // -------------------------------------------------------------------------
  const [buscaTorque, setBuscaTorque] = useState<string>('');

  // -------------------------------------------------------------------------
  // Estado da Sub-Aba 2: Calculadoras de Bancada
  // -------------------------------------------------------------------------
  // 2.1 Conversor de Torque (suporta vírgula e ponto, sem NaN/Infinity)
  const [convNm, setConvNm] = useState<string>('30');
  const [convKgfm, setConvKgfm] = useState<string>((30 / FATOR_KGFM_PARA_NM).toFixed(2));
  const [convLbfft, setConvLbfft] = useState<string>((30 / FATOR_LBFFT_PARA_NM).toFixed(2));

  const atualizarDeNm = (val: string) => {
    setConvNm(val);
    if (val.trim() === '') {
      setConvKgfm('');
      setConvLbfft('');
      return;
    }
    const n = parseDecimalBr(val);
    if (n !== null && n >= 0) {
      setConvKgfm((n / FATOR_KGFM_PARA_NM).toFixed(2));
      setConvLbfft((n / FATOR_LBFFT_PARA_NM).toFixed(2));
    }
  };

  const atualizarDeKgfm = (val: string) => {
    setConvKgfm(val);
    if (val.trim() === '') {
      setConvNm('');
      setConvLbfft('');
      return;
    }
    const k = parseDecimalBr(val);
    if (k !== null && k >= 0) {
      const nm = k * FATOR_KGFM_PARA_NM;
      setConvNm(nm.toFixed(1));
      setConvLbfft((nm / FATOR_LBFFT_PARA_NM).toFixed(2));
    }
  };

  const atualizarDeLbfft = (val: string) => {
    setConvLbfft(val);
    if (val.trim() === '') {
      setConvNm('');
      setConvKgfm('');
      return;
    }
    const lb = parseDecimalBr(val);
    if (lb !== null && lb >= 0) {
      const nm = lb * FATOR_LBFFT_PARA_NM;
      setConvNm(nm.toFixed(1));
      setConvKgfm((nm / FATOR_KGFM_PARA_NM).toFixed(2));
    }
  };

  // 2.2 Calculadora Elétrica 12V (Lei de Ohm + Fusível)
  const [tensaoV, setTensaoV] = useState<number>(13.8);
  const [potenciaW, setPotenciaW] = useState<string>('35');
  const [correnteA, setCorrenteA] = useState<string>((35 / 13.8).toFixed(2));

  const atualizarPotenciaW = (val: string, v = tensaoV) => {
    setPotenciaW(val);
    if (val.trim() === '') {
      setCorrenteA('');
      return;
    }
    const w = parseDecimalBr(val);
    if (w !== null && w >= 0 && v > 0) {
      setCorrenteA((w / v).toFixed(2));
    }
  };

  const atualizarCorrenteA = (val: string, v = tensaoV) => {
    setCorrenteA(val);
    if (val.trim() === '') {
      setPotenciaW('');
      return;
    }
    const a = parseDecimalBr(val);
    if (a !== null && a >= 0 && v > 0) {
      setPotenciaW((a * v).toFixed(1));
    }
  };

  const trocarTensaoReferencia = (novaTensao: number) => {
    setTensaoV(novaTensao);
    atualizarPotenciaW(potenciaW, novaTensao);
  };

  const correnteNumerica = useMemo(() => parseDecimalBr(correnteA) ?? 0, [correnteA]);

  const resistenciaOhms = useMemo(() => {
    if (correnteNumerica <= 0) return '—';
    return `${(tensaoV / correnteNumerica).toFixed(2)} Ω`;
  }, [tensaoV, correnteNumerica]);

  const recomendacaoEletrica = useMemo(
    () => sugerirFusivelEBitola(correnteNumerica),
    [correnteNumerica],
  );

  // 2.3 Calculadora de Relação (Pinhão x Coroa) com parser robusto
  const relacaoOriginal = useMemo(
    () => extrairRelacaoOriginal(f.transmissaoFinal),
    [f.transmissaoFinal],
  );
  const pinhaoOriginal = relacaoOriginal.pinhao;
  const coroaOriginal = relacaoOriginal.coroa;
  const [pinhaoSimulado, setPinhaoSimulado] = useState<number>(pinhaoOriginal);
  const [coroaSimulada, setCoroaSimulada] = useState<number>(coroaOriginal);

  useEffect(() => {
    setPinhaoSimulado(relacaoOriginal.pinhao);
    setCoroaSimulada(relacaoOriginal.coroa);
  }, [moto.geracao.id, relacaoOriginal.pinhao, relacaoOriginal.coroa]);

  const analiseRelacao = useMemo(() => {
    const pOrig = Math.max(1, pinhaoOriginal);
    const pSim = Math.max(1, pinhaoSimulado);
    const cSim = Math.max(1, coroaSimulada);
    const razaoOrig = coroaOriginal / pOrig;
    const razaoNova = cSim / pSim;
    // Variação de alongamento (velocidade final na mesma RPM): (razaoOrig / razaoNova - 1) * 100
    const variacaoFinalPct = (razaoOrig / razaoNova - 1) * 100;
    return {
      razaoOrig: razaoOrig.toFixed(3),
      razaoNova: razaoNova.toFixed(3),
      variacaoFinalPct: Number.isFinite(variacaoFinalPct) ? variacaoFinalPct : 0,
    };
  }, [pinhaoOriginal, coroaOriginal, pinhaoSimulado, coroaSimulada]);

  const def = SECTIONS.find((s) => s.id === 'torques-calculadoras') ?? SECTIONS[0];

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

  if (!def) return null;

  const isAuditado = moto.geracao.auditoria.status === 'verificado_manual';
  const isFonteWeb = moto.geracao.auditoria.status === 'fonte_web';

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section={def}>
        <Badge
          variant="outline"
          className="gap-1.5 border-primary/40 bg-primary/10 px-2.5 py-1 text-primary"
        >
          <Wrench className="size-3.5" />
          {(f.torques ?? []).length} torques específicos + tabela M5–M12
        </Badge>
      </SectionHeader>

      {/* ------------------------------------------------------------------ */}
      {/* 2 Sub-abas técnicas: Tabela de Torques | Calculadoras de Bancada   */}
      {/* ------------------------------------------------------------------ */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1.5 bg-card/80 p-1.5 sm:grid-cols-2">
          <TabsTrigger value="torques" className="gap-2 py-2.5 text-xs sm:text-sm">
            <Wrench className="size-4" />
            1. Tabela de Torques
          </TabsTrigger>
          <TabsTrigger value="calculadoras" className="gap-2 py-2.5 text-xs sm:text-sm">
            <Calculator className="size-4" />
            2. Calculadoras de Bancada
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
                      title={isFonteWeb ? `Fonte externa: ${moto.geracao.auditoria.origemExterna ?? moto.geracao.auditoria.fonte ?? 'Pesquisa Web'}` : undefined}
                      className={cn(
                        'gap-1 text-xs',
                        isAuditado
                          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : isFonteWeb
                            ? 'border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-300'
                            : 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300',
                      )}
                    >
                      {isAuditado ? (
                        <>
                          <FileCheck2 className="size-3.5" />
                          Auditado via Manual Oficial
                        </>
                      ) : isFonteWeb ? (
                        <>
                          <Info className="size-3.5" />
                          Obs: Fonte Web ({moto.geracao.auditoria.origemExterna ?? 'Internet'})
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
                        {nmParaKgfm(t.torque.valor)}
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
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="leading-relaxed text-amber-900 dark:text-amber-200/90">
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
                    type="text"
                    inputMode="decimal"
                    value={convNm}
                    onChange={(e) => atualizarDeNm(e.target.value)}
                    placeholder="Ex.: 30"
                    className="font-mono text-base font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Quilograma-força metro (<code className="text-primary">kgf·m</code>) — Manuais Antigos
                  </label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={convKgfm}
                    onChange={(e) => atualizarDeKgfm(e.target.value)}
                    placeholder="Ex.: 3,06"
                    className="font-mono text-base font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Libra-pé (<code className="text-primary">lbf·ft</code>) — Escala Imperial EUA
                  </label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={convLbfft}
                    onChange={(e) => atualizarDeLbfft(e.target.value)}
                    placeholder="Ex.: 22,13"
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
                      type="text"
                      inputMode="decimal"
                      value={potenciaW}
                      onChange={(e) => atualizarPotenciaW(e.target.value)}
                      placeholder="Ex.: 35"
                      className="font-mono text-base font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">Corrente (Amperes - A)</label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={correnteA}
                      onChange={(e) => atualizarCorrenteA(e.target.value)}
                      placeholder="Ex.: 2,54"
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
                    <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-300">
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
                {relacaoOriginal.avisoFallback && (
                  <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-2.5 py-2 text-[11px] leading-snug text-amber-800 dark:text-amber-200">
                    {relacaoOriginal.avisoFallback}
                  </div>
                )}
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
                            ? 'border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-300'
                            : 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300',
                      )}
                    >
                      {analiseRelacao.variacaoFinalPct > 0 ? '+' : ''}
                      {analiseRelacao.variacaoFinalPct.toFixed(1)}%
                    </Badge>
                  </div>

                  <p className="border-t border-border/60 pt-2 text-[11px] leading-relaxed">
                    {Math.abs(analiseRelacao.variacaoFinalPct) < 0.1 ? (
                      <span className="text-emerald-700 dark:text-emerald-300">
                        <strong>Comportamento Original de Fábrica:</strong> Equilíbrio padrão entre
                        torque de saída e rotação em rodovia.
                      </span>
                    ) : analiseRelacao.variacaoFinalPct > 0 ? (
                      <span className="text-sky-700 dark:text-sky-300">
                        <strong>Relação Mais Longa (+Velocidade Final / -RPM):</strong> O motor gira{' '}
                        {Math.abs(analiseRelacao.variacaoFinalPct).toFixed(1)}% mais folgado em
                        cruzeiro, porém perde força em subidas íngremes ou com garupa.
                      </span>
                    ) : (
                      <span className="text-amber-700 dark:text-amber-300">
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
      </Tabs>
    </div>
  );
}
