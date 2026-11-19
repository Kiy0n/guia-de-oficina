import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clapperboard,
  Clock,
  ExternalLink,
  Filter,
  Lightbulb,
  Package,
  Play,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';

import { SectionHeader } from '@/components/SectionHeader';
import { SpotlightCard } from '@/components/SpotlightCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useFerramentas } from '@/context/FerramentasContext';
import { useMoto, useMotoSelecionada } from '@/context/MotoContext';
import {
  CATEGORIA_PROCEDIMENTO_LABEL,
  DIFICULDADE_BADGE_CLASS,
  PROCEDIMENTOS_OFICINA,
  verificarCompatibilidadeProcedimento,
  type CategoriaProcedimento,
  type ProcedimentoOficina,
} from '@/data/procedimentos';
import { SECTIONS } from '@/lib/sections';
import { cn } from '@/lib/utils';
import type { MotoSelecionada } from '@/types/moto';
import { formatFaixa, formatNumero, nmParaKgfm } from '@/utils/format';

interface DadoContextualMoto {
  rotulo: string;
  valor: string;
  detalhe?: string;
}

function extrairDadosContextuaisMoto(
  proc: ProcedimentoOficina,
  moto: MotoSelecionada,
): DadoContextualMoto[] {
  const f = moto.geracao.fichaTecnica;
  const torques = f.torques ?? [];
  const dados: DadoContextualMoto[] = [];

  const acharTorque = (termo: string) =>
    torques.find((t) => t.item.toLowerCase().includes(termo.toLowerCase()));

  if (proc.id === 'regulagem-valvulas') {
    dados.push(
      {
        rotulo: 'Válvula de Admissão (Frio)',
        valor: formatFaixa(f.folgas?.valvulaAdmissaoMm),
        detalhe: f.motorDetalhes?.comando ?? f.motor,
      },
      {
        rotulo: 'Válvula de Escape (Frio)',
        valor: formatFaixa(f.folgas?.valvulaEscapeMm),
        detalhe: 'Medir no PMS de compressão (marca T)',
      },
      {
        rotulo: 'Marcha Lenta Padrão',
        valor: formatFaixa(f.motorDetalhes?.marchaLentaRpm),
        detalhe: `Vela: ${f.eletrica?.vela?.modelo ?? '—'}`,
      },
    );
    const tValv = acharTorque('válvula') ?? acharTorque('cabeçote');
    if (tValv) {
      dados.push({
        rotulo: tValv.item,
        valor: `${tValv.torque.valor} N·m (${nmParaKgfm(tValv.torque.valor)} kgf·m)`,
        detalhe: tValv.observacao,
      });
    }
    return dados;
  }

  if (proc.id === 'limpeza-filtro-centrifugo-honda' || proc.id === 'troca-oleo-filtro-papel') {
    const oleo = f.fluidos?.oleoMotor;
    dados.push(
      {
        rotulo: 'Especificação do Óleo',
        valor: oleo?.especificacao ?? 'Consulte Ficha Técnica',
        detalhe: f.motorDetalhes?.filtroOleo,
      },
      {
        rotulo: 'Volume na Troca / Com Filtro / Total',
        valor: oleo
          ? [
              `${formatNumero(oleo.capacidadeTrocaL)} L (troca)`,
              oleo.capacidadeTrocaComFiltroL
                ? `${formatNumero(oleo.capacidadeTrocaComFiltroL)} L (c/ filtro)`
                : null,
              oleo.capacidadeTotalL ? `${formatNumero(oleo.capacidadeTotalL)} L (desmontagem)` : null,
            ]
              .filter(Boolean)
              .join(' · ')
          : '—',
        detalhe: oleo?.observacao,
      },
    );
    const tBujao = acharTorque('drenagem') ?? acharTorque('óleo') ?? acharTorque('tela');
    if (tBujao) {
      dados.push({
        rotulo: tBujao.item,
        valor: `${tBujao.torque.valor} N·m (${nmParaKgfm(tBujao.torque.valor)} kgf·m)`,
        detalhe: tBujao.observacao,
      });
    }
    const tCentrifugo = acharTorque('centrífugo');
    if (tCentrifugo) {
      dados.push({
        rotulo: tCentrifugo.item,
        valor: `${tCentrifugo.torque.valor} N·m (${nmParaKgfm(tCentrifugo.torque.valor)} kgf·m)`,
        detalhe: tCentrifugo.observacao,
      });
    }
    return dados;
  }

  if (proc.id === 'troca-retentor-fluido-bengala') {
    const bengala = f.fluidos?.fluidoBengala;
    dados.push(
      {
        rotulo: 'Volume por Canela (Bengala)',
        valor: bengala ? `${formatNumero(bengala.volumePorCanelaMl)} ml (cm³)` : '—',
        detalhe: bengala?.observacao,
      },
      {
        rotulo: 'Fluido Recomendado',
        valor: bengala?.especificacao ?? 'Fluido ATF / Fork Oil 10W',
        detalhe: bengala?.nivelMm ? `Nível da câmara de ar: ${bengala.nivelMm} mm` : undefined,
      },
    );
    const tEixoD = acharTorque('eixo dianteiro');
    if (tEixoD) {
      dados.push({
        rotulo: tEixoD.item,
        valor: `${tEixoD.torque.valor} N·m (${nmParaKgfm(tEixoD.torque.valor)} kgf·m)`,
        detalhe: tEixoD.observacao,
      });
    }
    return dados;
  }

  if (proc.id === 'troca-kit-relacao' || proc.id === 'troca-bucha-balanca') {
    const rel = f.transmissaoFinal;
    dados.push(
      {
        rotulo: 'Relação Original (Pinhão x Coroa)',
        valor:
          rel?.pinhaoDentes && rel?.coroaDentes
            ? `${rel.pinhaoDentes}Z x ${rel.coroaDentes}Z`
            : rel?.cvtDetalhe?.correiaCodigo ?? '—',
        detalhe: rel?.corrente ? `Corrente: ${rel.corrente}` : undefined,
      },
      {
        rotulo: 'Folga Livre da Corrente',
        valor: formatFaixa(f.folgas?.folgaCorrenteMm),
        detalhe: 'Medir no meio do vão inferior da balança',
      },
    );
    const tEixoT = acharTorque('eixo traseiro');
    if (tEixoT) {
      dados.push({
        rotulo: tEixoT.item,
        valor: `${tEixoT.torque.valor} N·m (${nmParaKgfm(tEixoT.torque.valor)} kgf·m)`,
        detalhe: tEixoT.observacao,
      });
    }
    const tCoroa = acharTorque('coroa');
    if (tCoroa) {
      dados.push({
        rotulo: tCoroa.item,
        valor: `${tCoroa.torque.valor} N·m (${nmParaKgfm(tCoroa.torque.valor)} kgf·m)`,
      });
    }
    return dados;
  }

  if (
    proc.id === 'troca-lona-freio-traseiro' ||
    proc.id === 'troca-pastilhas-freio-disco' ||
    proc.id === 'sangria-freio-hidraulico'
  ) {
    dados.push(
      {
        rotulo: 'Arquitetura de Freios desta Geração',
        valor: `Diant: ${f.freios.dianteiro.toUpperCase()} · Tras: ${f.freios.traseiro.toUpperCase()} (${f.freios.sistema})`,
        detalhe: `Fluido: ${f.fluidos?.fluidoFreio ?? 'DOT 4'}`,
      },
      {
        rotulo: 'Folga Livre do Pedal / Manete',
        valor: f.folgas?.folgaPedalFreioMm
          ? `Pedal: ${formatFaixa(f.folgas.folgaPedalFreioMm)}`
          : 'Hidráulico no manete',
      },
    );
    const tFreio = acharTorque('pinça') ?? acharTorque('freio') ?? acharTorque('eixo traseiro');
    if (tFreio) {
      dados.push({
        rotulo: tFreio.item,
        valor: `${tFreio.torque.valor} N·m (${nmParaKgfm(tFreio.torque.valor)} kgf·m)`,
        detalhe: tFreio.observacao,
      });
    }
    return dados;
  }

  if (proc.id === 'limpeza-bico-injetor-tbi') {
    dados.push(
      {
        rotulo: 'Sistema de Alimentação',
        valor: f.motorDetalhes?.alimentacaoDetalhe ?? f.alimentacao.toUpperCase(),
        detalhe: `Combustível: ${f.combustivel.toUpperCase()}`,
      },
      {
        rotulo: 'Marcha Lenta & Folga do Acelerador',
        valor: `${formatFaixa(f.motorDetalhes?.marchaLentaRpm)} · Cabo: ${formatFaixa(f.folgas?.folgaAceleradorMm)}`,
      },
    );
    return dados;
  }

  if (proc.id === 'troca-pneu-roda-traseira-scooter') {
    const pT = f.pneus?.traseiro;
    dados.push(
      {
        rotulo: 'Medida & Pressão do Pneu Traseiro',
        valor: `${pT?.medida ?? '—'} (${pT?.pressaoPsi ?? '—'} PSI solo / ${pT?.pressaoComGarupaPsi ?? '—'} PSI garupa)`,
        detalhe: pT?.tipo,
      },
      {
        rotulo: 'Óleo da Transmissão Final CVT',
        valor: f.fluidos?.oleoTransmissaoCvt
          ? `${formatNumero(f.fluidos.oleoTransmissaoCvt.capacidadeL)} L (${f.fluidos.oleoTransmissaoCvt.especificacao})`
          : '—',
      },
    );
    const tRoda = acharTorque('roda traseira') ?? acharTorque('eixo traseiro');
    if (tRoda) {
      dados.push({
        rotulo: tRoda.item,
        valor: `${tRoda.torque.valor} N·m (${nmParaKgfm(tRoda.torque.valor)} kgf·m)`,
        detalhe: tRoda.observacao,
      });
    }
    return dados;
  }

  // Default (ex.: Caixa de Direção)
  const tMesa = acharTorque('direção') ?? acharTorque('mesa');
  if (tMesa) {
    dados.push({
      rotulo: tMesa.item,
      valor: `${tMesa.torque.valor} N·m (${nmParaKgfm(tMesa.torque.valor)} kgf·m)`,
      detalhe: tMesa.observacao,
    });
  }
  const tEixoD = acharTorque('eixo dianteiro');
  if (tEixoD) {
    dados.push({
      rotulo: tEixoD.item,
      valor: `${tEixoD.torque.valor} N·m (${nmParaKgfm(tEixoD.torque.valor)} kgf·m)`,
    });
  }
  dados.push({
    rotulo: 'Pneu Dianteiro',
    valor: `${f.pneus?.dianteiro.medida ?? '—'} (${f.pneus?.dianteiro.pressaoPsi ?? '—'} PSI)`,
  });
  return dados;
}

export function ProcedimentosPage() {
  const moto = useMotoSelecionada();
  const { setSection } = useMoto();
  const { possuiFerramenta, toggleFerramenta, marcarFerramentaPossuida } = useFerramentas();

  const [apenasCompativeis, setApenasCompativeis] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaProcedimento | 'todas'>('todas');
  const [procedimentoAbertoId, setProcedimentoAbertoId] = useState<string | null>(null);
  const [videoAtivoIndex, setVideoAtivoIndex] = useState<number>(0);
  const [videoTocandoId, setVideoTocandoId] = useState<string | null>(null);
  const [passosConcluidos, setPassosConcluidos] = useState<Record<string, number[]>>({});

  const def = SECTIONS.find((s) => s.id === 'procedimentos') ?? SECTIONS[0];

  const procedimentosEnriquecidos = useMemo(() => {
    return PROCEDIMENTOS_OFICINA.map((proc) => {
      const compat = verificarCompatibilidadeProcedimento(proc, moto);
      const idsFerramentas = Array.from(
        new Set(
          proc.ferramentasExatas
            .map((f) => f.ferramentaId)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      const totalFerramentas = idsFerramentas.length;
      const possuidasCount = idsFerramentas.filter((id) => possuiFerramenta(id)).length;

      return {
        proc,
        compat,
        totalFerramentas,
        possuidasCount,
        prontoParaExecutar: totalFerramentas > 0 && possuidasCount === totalFerramentas,
      };
    });
  }, [moto, possuiFerramenta]);

  const totalCompativeisMoto = useMemo(
    () => procedimentosEnriquecidos.filter((p) => p.compat.compativel).length,
    [procedimentosEnriquecidos],
  );

  const procedimentosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return procedimentosEnriquecidos.filter(({ proc, compat }) => {
      if (apenasCompativeis && !compat.compativel) return false;
      if (categoriaAtiva !== 'todas' && proc.categoria !== categoriaAtiva) return false;
      if (!termo) return true;

      const textoBusca = [
        proc.titulo,
        proc.resumo,
        ...proc.ferramentasExatas.map((f) => `${f.nome} ${f.medidaOuDetalhe}`),
        ...proc.insumos,
      ]
        .join(' ')
        .toLowerCase();

      return textoBusca.includes(termo);
    });
  }, [procedimentosEnriquecidos, apenasCompativeis, categoriaAtiva, busca]);

  const itemDetalhe = useMemo(
    () =>
      procedimentoAbertoId
        ? procedimentosEnriquecidos.find((p) => p.proc.id === procedimentoAbertoId) ?? null
        : null,
    [procedimentosEnriquecidos, procedimentoAbertoId],
  );

  if (!def) return null;

  const abrirProcedimento = (id: string) => {
    setProcedimentoAbertoId(id);
    setVideoAtivoIndex(0);
    setVideoTocandoId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePasso = (procId: string, index: number) => {
    setPassosConcluidos((prev) => {
      const lista = prev[procId] ?? [];
      const jaMarcado = lista.includes(index);
      return {
        ...prev,
        [procId]: jaMarcado ? lista.filter((i) => i !== index) : [...lista, index],
      };
    });
  };

  const limparPassos = (procId: string) => {
    setPassosConcluidos((prev) => ({ ...prev, [procId]: [] }));
  };

  // =========================================================================
  // VISÃO DE DETALHE DO PROCEDIMENTO
  // =========================================================================
  if (itemDetalhe) {
    const { proc, compat, totalFerramentas, possuidasCount, prontoParaExecutar } = itemDetalhe;
    const dadosMoto = extrairDadosContextuaisMoto(proc, moto);
    const concluidos = passosConcluidos[proc.id] ?? [];
    const progressoPassos =
      proc.passoAPasso.length > 0
        ? Math.round((concluidos.length / proc.passoAPasso.length) * 100)
        : 0;
    const videoAtual = proc.videos[videoAtivoIndex] ?? proc.videos[0];
    const isAuditado = moto.geracao.auditoria.status === 'verificado_manual';

    return (
      <motion.div
        key={`detalhe-${proc.id}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Barra superior de retorno */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setProcedimentoAbertoId(null)}
            className="gap-1.5"
          >
            <ArrowLeft className="size-4" />
            Voltar para todos os procedimentos
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={DIFICULDADE_BADGE_CLASS[proc.dificuldade]}>
              Dificuldade: {proc.dificuldade}
            </Badge>
            <Badge variant="secondary" className="gap-1 font-mono">
              <Clock className="size-3.5" />
              {proc.tempoEstimado}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'gap-1.5',
                prontoParaExecutar
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-amber-500/40 bg-amber-500/15 text-amber-300',
              )}
            >
              <Wrench className="size-3.5" />
              Você tem {possuidasCount}/{totalFerramentas} ferramentas
            </Badge>
          </div>
        </div>

        {/* Título do procedimento */}
        <div className="rounded-2xl border bg-card/85 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{CATEGORIA_PROCEDIMENTO_LABEL[proc.categoria]}</Badge>
            <Badge
              variant="outline"
              className={cn(
                compat.compativel
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-300',
              )}
            >
              {compat.motivo}
            </Badge>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{proc.titulo}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{proc.resumo}</p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Banner Contextual da Moto Selecionada (Injeção da Ficha Técnica)   */}
        {/* ------------------------------------------------------------------ */}
        <Card className="border-primary/35 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" />
                Parâmetros Exatos para {moto.marca} {moto.modelo.nome} ({moto.geracao.anosLabel} ·{' '}
                {moto.geracao.nomeGeracao})
              </CardTitle>

              <Badge
                variant="outline"
                className={cn(
                  'gap-1.5 text-xs',
                  isAuditado
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : 'border-amber-500/40 bg-amber-500/15 text-amber-300',
                )}
              >
                {isAuditado ? (
                  <>
                    <ShieldCheck className="size-3.5" />
                    Auditado via Manual Oficial
                  </>
                ) : (
                  <>
                    <ShieldAlert className="size-3.5" />
                    Base Técnica de Fábrica
                  </>
                )}
              </Badge>
            </div>
            {moto.geracao.auditoria.fonte && (
              <CardDescription className="text-xs">
                Fonte: {moto.geracao.auditoria.fonte}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dadosMoto.map((dado, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border/70 bg-background/80 p-3.5"
              >
                <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  {dado.rotulo}
                </p>
                <p className="mt-1 font-mono text-base font-bold text-foreground">{dado.valor}</p>
                {dado.detalhe && (
                  <p className="mt-1 text-xs text-muted-foreground">{dado.detalhe}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ------------------------------------------------------------------ */}
        {/* Ferramentas Exatas + Insumos e Alternativas Práticas               */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Ferramentas Exatas Necessárias */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wrench className="size-4 text-primary" />
                  Ferramentas Exatas Necessárias
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSection('ferramentas')}
                  className="h-7 text-xs"
                >
                  Abrir Meu Kit ({possuidasCount}/{totalFerramentas})
                </Button>
              </div>
              <CardDescription>
                Conferência em tempo real com seu inventário salvo em{' '}
                <code className="font-mono text-xs">data/oficina.json</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {proc.ferramentasExatas.map((ferr, idx) => {
                const possui = ferr.ferramentaId ? possuiFerramenta(ferr.ferramentaId) : false;
                return (
                  <div
                    key={idx}
                    className={cn(
                      'flex flex-col justify-between gap-2.5 rounded-xl border p-3 sm:flex-row sm:items-center',
                      possui
                        ? 'border-emerald-500/30 bg-emerald-500/8'
                        : 'border-amber-500/30 bg-amber-500/6',
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      {possui ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-400" />
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-sm font-semibold text-foreground">{ferr.nome}</p>
                          {!ferr.obrigatoria && (
                            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                              Auxiliar / Opcional
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {ferr.medidaOuDetalhe}
                        </p>
                      </div>
                    </div>

                    {ferr.ferramentaId && (
                      <Button
                        type="button"
                        variant={possui ? 'ghost' : 'secondary'}
                        size="sm"
                        onClick={() =>
                          possui
                            ? toggleFerramenta(ferr.ferramentaId!)
                            : marcarFerramentaPossuida(ferr.ferramentaId!)
                        }
                        className="h-8 shrink-0 text-xs"
                      >
                        {possui ? 'Já tenho ✓' : 'Marcar que já tenho'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Insumos e Alternativas Práticas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="size-4 text-primary" />
                Insumos & Alternativas Práticas de Oficina
              </CardTitle>
              <CardDescription>
                Peças de reposição, consumíveis e soluções reais de bancada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {proc.insumos.map((insumo, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border bg-background/50 p-3 text-sm leading-relaxed"
                  >
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                    <span>{insumo}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Passo a Passo Interativo de Bancada                                */}
        {/* ------------------------------------------------------------------ */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg">
                  Passo a Passo de Bancada ({concluidos.length}/{proc.passoAPasso.length} concluídos)
                </CardTitle>
                <CardDescription>
                  Marque cada etapa conforme executa o serviço na moto.
                </CardDescription>
              </div>
              {concluidos.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => limparPassos(proc.id)}
                  className="h-8 gap-1.5 text-xs"
                >
                  <RotateCcw className="size-3.5" />
                  Reiniciar checklist
                </Button>
              )}
            </div>
            <Progress value={progressoPassos} className="mt-2 h-2" />
          </CardHeader>
          <CardContent className="space-y-2.5">
            {proc.passoAPasso.map((passo, idx) => {
              const marcado = concluidos.includes(idx);
              return (
                <label
                  key={idx}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all',
                    marcado
                      ? 'border-emerald-500/35 bg-emerald-500/10 text-muted-foreground'
                      : 'border-border/70 bg-background/50 hover:border-border hover:bg-accent/30',
                  )}
                >
                  <Checkbox
                    checked={marcado}
                    onCheckedChange={() => togglePasso(proc.id, idx)}
                    className="mt-0.5"
                  />
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary">
                    {idx + 1}
                  </span>
                  <span
                    className={cn(
                      'text-sm leading-relaxed',
                      marcado && 'line-through opacity-80',
                    )}
                  >
                    {passo}
                  </span>
                </label>
              );
            })}
          </CardContent>
        </Card>

        {/* ------------------------------------------------------------------ */}
        {/* Dicas de Ouro & Erros Comuns                                       */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-emerald-300">
                <Lightbulb className="size-4 text-emerald-400" />
                Dicas de Ouro de Mecânico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {proc.dicasDeOuro.map((dica, idx) => (
                <p key={idx} className="rounded-lg border border-emerald-500/20 bg-background/60 p-3 text-sm leading-relaxed">
                  {dica}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card className="border-rose-500/30 bg-rose-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-rose-300">
                <AlertTriangle className="size-4 text-rose-400" />
                Erros Comuns para Evitar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {proc.errosComuns.map((erro, idx) => (
                <p key={idx} className="rounded-lg border border-rose-500/20 bg-background/60 p-3 text-sm leading-relaxed">
                  {erro}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Player YouTube Embed 16:9 com Fachada Clicável                     */}
        {/* ------------------------------------------------------------------ */}
        {videoAtual && (
          <Card className="overflow-hidden border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clapperboard className="size-4 text-primary" />
                    Vídeo de Bancada ({proc.videos.length}{' '}
                    {proc.videos.length === 1 ? 'vídeo verificado' : 'vídeos verificados'})
                  </CardTitle>
                  <CardDescription>
                    {videoAtual.titulo} — <strong>{videoAtual.canal}</strong>
                  </CardDescription>
                </div>

                <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
                  <a href={videoAtual.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3.5" />
                    Abrir no YouTube
                  </a>
                </Button>
              </div>

              {/* Seletor rápido quando houver múltiplos vídeos */}
              {proc.videos.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {proc.videos.map((v, idx) => {
                    const ativo = idx === videoAtivoIndex;
                    return (
                      <button
                        key={v.youtubeId}
                        type="button"
                        onClick={() => {
                          setVideoAtivoIndex(idx);
                          setVideoTocandoId(null);
                        }}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                          ativo
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-border/70 bg-background/60 text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <Play className="size-3 fill-current" />
                        <span>
                          Aula {idx + 1}: {v.titulo}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardHeader>

            <CardContent>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-zinc-950">
                {videoTocandoId === videoAtual.youtubeId ? (
                  <iframe
                    key={videoAtual.youtubeId}
                    src={`https://www.youtube.com/embed/${videoAtual.youtubeId}?autoplay=1&rel=0`}
                    title={videoAtual.titulo}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setVideoTocandoId(videoAtual.youtubeId)}
                    className="group relative flex h-full w-full items-center justify-center overflow-hidden text-left"
                    aria-label={`Reproduzir vídeo: ${videoAtual.titulo}`}
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${videoAtual.youtubeId}/hqdefault.jpg`}
                      alt={videoAtual.titulo}
                      className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-95"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="relative z-10 flex flex-col items-center gap-3 px-4 text-center">
                      <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform duration-300 group-hover:scale-110">
                        <Play className="ml-1 size-7 fill-current" />
                      </span>
                      <div>
                        <p className="text-base font-bold text-white sm:text-lg">
                          {videoAtual.titulo}
                        </p>
                        <p className="text-xs text-zinc-300">
                          Canal: {videoAtual.canal} · Clique para reproduzir aqui na página
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    );
  }

  // =========================================================================
  // VISÃO EM GRID DOS PROCEDIMENTOS
  // =========================================================================
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section={def}>
        <Button
          type="button"
          variant={apenasCompativeis ? 'default' : 'outline'}
          size="sm"
          onClick={() => setApenasCompativeis((v) => !v)}
          className="gap-1.5"
        >
          <Filter className="size-4" />
          {apenasCompativeis
            ? `Apenas compatíveis com ${moto.modelo.nome} (${totalCompativeisMoto})`
            : `Vendo todos os procedimentos (${PROCEDIMENTOS_OFICINA.length})`}
        </Button>
      </SectionHeader>

      {/* Barra de busca e filtro por categoria */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card/75 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder='Buscar por serviço, peça ou medida de chave (ex.: "lona", "bucha", "22 mm", "bengala", "válvula")...'
              className="pl-9"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-xl border bg-background/60 px-3 py-2 text-xs font-medium">
            <Checkbox
              checked={apenasCompativeis}
              onCheckedChange={(checked) => setApenasCompativeis(Boolean(checked))}
            />
            <span>
              Apenas compatíveis com {moto.modelo.nome} ({moto.geracao.anosLabel})
            </span>
          </label>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            variant={categoriaAtiva === 'todas' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoriaAtiva('todas')}
            className="h-8 text-xs"
          >
            Todas ({apenasCompativeis ? totalCompativeisMoto : PROCEDIMENTOS_OFICINA.length})
          </Button>
          {(Object.keys(CATEGORIA_PROCEDIMENTO_LABEL) as CategoriaProcedimento[]).map((cat) => (
            <Button
              key={cat}
              type="button"
              variant={categoriaAtiva === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoriaAtiva(cat)}
              className="h-8 text-xs"
            >
              {CATEGORIA_PROCEDIMENTO_LABEL[cat]}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid de Cards */}
      <AnimatePresence mode="popLayout">
        {procedimentosFiltrados.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum procedimento encontrado para o filtro atual.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setBusca('');
                  setCategoriaAtiva('todas');
                  setApenasCompativeis(false);
                }}
              >
                Mostrar todos os 12 procedimentos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {procedimentosFiltrados.map(
              ({ proc, compat, totalFerramentas, possuidasCount, prontoParaExecutar }) => (
                <SpotlightCard
                  key={proc.id}
                  marca={moto.marca}
                  intensity="subtle"
                  onClick={() => abrirProcedimento(proc.id)}
                  className="flex cursor-pointer flex-col justify-between p-5"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <Badge variant="secondary" className="text-[11px]">
                        {CATEGORIA_PROCEDIMENTO_LABEL[proc.categoria]}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn('text-[11px]', DIFICULDADE_BADGE_CLASS[proc.dificuldade])}
                      >
                        {proc.dificuldade}
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold leading-snug text-foreground">
                      {proc.titulo}
                    </h3>

                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {proc.resumo}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3 border-t border-border/60 pt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Clock className="size-3.5" />
                        {proc.tempoEstimado}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clapperboard className="size-3.5 text-primary" />
                        {proc.videos.length}{' '}
                        {proc.videos.length === 1 ? 'vídeo' : 'vídeos'}
                      </span>
                    </div>

                    {/* Indicador de prontidão de ferramentas */}
                    <div
                      className={cn(
                        'flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs font-medium',
                        prontoParaExecutar
                          ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
                          : 'border-amber-500/35 bg-amber-500/10 text-amber-300',
                      )}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {prontoParaExecutar ? (
                          <CheckCircle2 className="size-3.5 text-emerald-400" />
                        ) : (
                          <Wrench className="size-3.5 text-amber-400" />
                        )}
                        Você tem {possuidasCount}/{totalFerramentas} ferramentas
                      </span>
                      <span className="font-mono text-[11px]">
                        {prontoParaExecutar ? 'Pronto!' : 'Ver lista'}
                      </span>
                    </div>

                    {!compat.compativel && (
                      <p className="text-[11px] text-amber-400/90">• {compat.motivo}</p>
                    )}
                  </div>
                </SpotlightCard>
              ),
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
