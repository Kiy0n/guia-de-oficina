import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Clapperboard,
  ClipboardCheck,
  Clock,
  Copy,
  ExternalLink,
  FileCheck2,
  PauseCircle,
  Play,
  PlayCircle,
  Printer,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trash2,
  Wrench,
} from 'lucide-react';

import { BotaoDitadoVoz } from '@/components/BotaoDitadoVoz';
import { MotoBlueprintVisual } from '@/components/MotoBlueprintVisual';
import { SectionHeader } from '@/components/SectionHeader';
import { SpotlightCard } from '@/components/SpotlightCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useMotoSelecionada } from '@/context/MotoContext';
import { useToast } from '@/context/ToastContext';
import { PROCEDIMENTOS_OFICINA } from '@/data/procedimentos';
import {
  ACAO_SUGERIDA_LABEL,
  FEEDBACK_STATUS_META,
  gerarRoteiroRevisao,
  getPerfisRevisao,
  getZonaVisualInfo,
  type PassoRevisao,
  type RegistroFeedbackPasso,
  type StatusFeedbackPasso,
  type TipoRevisaoGuiada,
  type ZonaVisualMoto,
} from '@/data/roteiroRevisao';
import { SECTIONS } from '@/lib/sections';
import { cn } from '@/lib/utils';
import { getArquiteturaMoto } from '@/utils/arquiteturaMoto';

type EtapaTelaRevisao = 'preparar' | 'executar' | 'relatorio';

interface RascunhoRevisaoSalvo {
  tipoRevisao: TipoRevisaoGuiada;
  kmAtual: string;
  apelidoOuPlaca: string;
  passoIndex: number;
  registros: Record<string, RegistroFeedbackPasso>;
  comentarioGeral: string;
  atualizadaEm: string;
}

const TRANSICAO_TELA = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1] as const,
};

function getDraftKey(modeloId: string, geracaoId: string): string {
  return `guia-oficina:revisao-ativa:v1:${modeloId}:${geracaoId}`;
}

function lerRascunhoSalvo(key: string): RascunhoRevisaoSalvo | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RascunhoRevisaoSalvo>;
    if (
      !parsed ||
      (parsed.tipoRevisao !== 'basica' &&
        parsed.tipoRevisao !== 'completa' &&
        parsed.tipoRevisao !== 'pre_viagem')
    ) {
      return null;
    }
    return {
      tipoRevisao: parsed.tipoRevisao,
      kmAtual: typeof parsed.kmAtual === 'string' ? parsed.kmAtual : '',
      apelidoOuPlaca: typeof parsed.apelidoOuPlaca === 'string' ? parsed.apelidoOuPlaca : '',
      passoIndex: typeof parsed.passoIndex === 'number' ? Math.max(0, parsed.passoIndex) : 0,
      registros:
        parsed.registros && typeof parsed.registros === 'object' ? parsed.registros : {},
      comentarioGeral: typeof parsed.comentarioGeral === 'string' ? parsed.comentarioGeral : '',
      atualizadaEm:
        typeof parsed.atualizadaEm === 'string' ? parsed.atualizadaEm : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

const ORDEM_STATUS_BOTOES: readonly StatusFeedbackPasso[] = [
  'checado_ok',
  'limpo_lubrificado',
  'regulado',
  'substituido',
  'trocar_em_breve',
  'nao_aplica',
];

export function IniciarRevisaoPage() {
  const moto = useMotoSelecionada();
  const { mostrarToast } = useToast();

  const draftKey = getDraftKey(moto.modelo.id, moto.geracao.id);
  const [rascunhoDetectado, setRascunhoDetectado] = useState<RascunhoRevisaoSalvo | null>(() =>
    lerRascunhoSalvo(draftKey),
  );

  const [etapaTela, setEtapaTela] = useState<EtapaTelaRevisao>('preparar');
  const [tipoRevisao, setTipoRevisao] = useState<TipoRevisaoGuiada>('completa');
  const [kmAtual, setKmAtual] = useState<string>('12000');
  const [apelidoOuPlaca, setApelidoOuPlaca] = useState<string>('');
  const [passoIndex, setPassoIndex] = useState<number>(0);
  const [registros, setRegistros] = useState<Record<string, RegistroFeedbackPasso>>({});
  const registrosRef = useRef<Record<string, RegistroFeedbackPasso>>(registros);
  registrosRef.current = registros;
  const [comentarioGeral, setComentarioGeral] = useState<string>('');
  const [copiadoRelatorio, setCopiadoRelatorio] = useState<boolean>(false);

  // Modal/Sheet de Procedimento & Vídeo dentro do passo
  const [sheetProcAberto, setSheetProcAberto] = useState<boolean>(false);
  const [videoAtivoIdx, setVideoAtivoIdx] = useState<number>(0);
  const [videoTocandoId, setVideoTocandoId] = useState<string | null>(null);

  // Se o usuário trocar de moto/geração, recarrega o rascunho correspondente
  useEffect(() => {
    const salvo = lerRascunhoSalvo(draftKey);
    setRascunhoDetectado(salvo);
    setEtapaTela('preparar');
    setPassoIndex(0);
    setRegistros({});
    setComentarioGeral('');
  }, [draftKey]);

  const arq = useMemo(
    () => getArquiteturaMoto(moto.modelo, moto.geracao),
    [moto.modelo, moto.geracao],
  );
  const perfisRevisao = useMemo(
    () => getPerfisRevisao(moto.modelo, moto.geracao),
    [moto.modelo, moto.geracao],
  );
  const passos = useMemo(
    () => gerarRoteiroRevisao(moto.modelo, moto.geracao, tipoRevisao),
    [moto.modelo, moto.geracao, tipoRevisao],
  );

  const passoAtual: PassoRevisao | undefined = passos[passoIndex] ?? passos[0];
  const isScooter = arq.isCvt;
  const isAuditado = moto.geracao.auditoria.status === 'verificado_manual';
  const def = SECTIONS.find((s) => s.id === 'iniciar-revisao') ?? SECTIONS[0];

  const procedimentoRelacionado = useMemo(() => {
    if (!passoAtual?.procedimentoIdRelacionado) return null;
    return (
      PROCEDIMENTOS_OFICINA.find((p) => p.id === passoAtual.procedimentoIdRelacionado) ?? null
    );
  }, [passoAtual?.procedimentoIdRelacionado]);

  // Salva rascunho automaticamente em localStorage enquanto estiver executando ou no relatório
  const persistirRascunho = (
    override?: Partial<RascunhoRevisaoSalvo>,
  ) => {
    const payload: RascunhoRevisaoSalvo = {
      tipoRevisao: override?.tipoRevisao ?? tipoRevisao,
      kmAtual: override?.kmAtual ?? kmAtual,
      apelidoOuPlaca: override?.apelidoOuPlaca ?? apelidoOuPlaca,
      passoIndex: override?.passoIndex ?? passoIndex,
      registros: override?.registros ?? registros,
      comentarioGeral: override?.comentarioGeral ?? comentarioGeral,
      atualizadaEm: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(draftKey, JSON.stringify(payload));
      setRascunhoDetectado(payload);
    } catch {
      // ignore quota error
    }
  };

  const descartarRascunho = (comToastDesfazer = false) => {
    const anterior = rascunhoDetectado;
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }
    setRascunhoDetectado(null);

    if (comToastDesfazer && anterior) {
      mostrarToast({
        dedupeKey: 'descartar-rascunho-revisao',
        titulo: 'Rascunho de revisão descartado',
        descricao: 'Você pode recuperar o progresso pausado clicando em Desfazer.',
        variante: 'aviso',
        acaoDesfazer: () => {
          try {
            window.localStorage.setItem(draftKey, JSON.stringify(anterior));
          } catch {
            // ignore
          }
          setRascunhoDetectado(anterior);
        },
      });
    }
  };

  const iniciarNovaRevisao = () => {
    setPassoIndex(0);
    setRegistros({});
    setComentarioGeral('');
    setEtapaTela('executar');
    persistirRascunho({
      passoIndex: 0,
      registros: {},
      comentarioGeral: '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const retomarRascunho = () => {
    if (!rascunhoDetectado) return;
    setTipoRevisao(rascunhoDetectado.tipoRevisao);
    setKmAtual(rascunhoDetectado.kmAtual);
    setApelidoOuPlaca(rascunhoDetectado.apelidoOuPlaca);
    setPassoIndex(rascunhoDetectado.passoIndex);
    setRegistros(rascunhoDetectado.registros);
    setComentarioGeral(rascunhoDetectado.comentarioGeral);
    setEtapaTela('executar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pausarESalvar = () => {
    persistirRascunho();
    setEtapaTela('preparar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const atualizarRegistroPasso = (
    passoId: string,
    parcial: Partial<RegistroFeedbackPasso>,
  ) => {
    const prev = registrosRef.current;
    const atual = prev[passoId] ?? { status: 'checado_ok' as StatusFeedbackPasso };
    const atualizado: RegistroFeedbackPasso = { ...atual, ...parcial };
    const proximo = { ...prev, [passoId]: atualizado };
    registrosRef.current = proximo;
    setRegistros(proximo);
    persistirRascunho({ registros: proximo });
  };

  const irParaPasso = (novoIdx: number) => {
    const limitado = Math.max(0, Math.min(passos.length - 1, novoIdx));
    setPassoIndex(limitado);
    setVideoAtivoIdx(0);
    setVideoTocandoId(null);
    persistirRascunho({ passoIndex: limitado });
  };

  const navegarParaZonaBlueprint = (zona: ZonaVisualMoto) => {
    const idx = passos.findIndex((p) => p.zonaVisual === zona);
    if (idx !== -1) {
      irParaPasso(idx);
    }
  };

  // Atalhos de teclado no modo Execução (Tela 2) quando foco não estiver em campos de texto
  useEffect(() => {
    if (etapaTela !== 'executar' || !passoAtual) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        irParaPasso(passoIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        irParaPasso(passoIndex + 1);
      } else if (e.key >= '1' && e.key <= '6') {
        const idxStatus = Number(e.key) - 1;
        const st = ORDEM_STATUS_BOTOES[idxStatus];
        if (st) {
          e.preventDefault();
          atualizarRegistroPasso(passoAtual.id, { status: st });
        }
      } else if ((e.key === 'v' || e.key === 'V') && procedimentoRelacionado) {
        e.preventDefault();
        setSheetProcAberto((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Agrupamentos para o Relatório Final
  const resumoRelatorio = useMemo(() => {
    const grupos: Record<StatusFeedbackPasso, { passo: PassoRevisao; reg: RegistroFeedbackPasso }[]> = {
      substituido: [],
      limpo_lubrificado: [],
      regulado: [],
      checado_ok: [],
      trocar_em_breve: [],
      nao_aplica: [],
    };

    for (const p of passos) {
      const reg = registros[p.id];
      if (!reg) continue;
      grupos[reg.status].push({ passo: p, reg });
    }

    return grupos;
  }, [passos, registros]);

  const totalRespondidos = useMemo(
    () => passos.filter((p) => Boolean(registros[p.id])).length,
    [passos, registros],
  );
  const progressoPct =
    passos.length > 0 ? Math.round(((passoIndex + 1) / passos.length) * 100) : 0;

  const montarTextoWhatsAppRelatorio = (): string => {
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    const perfilMeta = perfisRevisao.find((p) => p.id === tipoRevisao);
    const linhas: string[] = [
      `🛠️ *GUIA DE OFICINA — RELATÓRIO DE REVISÃO*`,
      `🏍️ *Moto:* ${moto.marca} ${moto.modelo.nome} (${moto.geracao.anosLabel} · ${moto.geracao.nomeGeracao})`,
      `📋 *Perfil:* ${perfilMeta?.titulo ?? tipoRevisao}`,
      `📅 *Data:* ${dataHoje} | 📍 *KM:* ${(Number(kmAtual) || 0).toLocaleString('pt-BR')} km`,
    ];

    if (apelidoOuPlaca.trim()) {
      linhas.push(`🔖 *Identificação:* ${apelidoOuPlaca.trim()}`);
    }

    const blocos: { status: StatusFeedbackPasso; titulo: string }[] = [
      { status: 'substituido', titulo: '🔄 SUBSTITUÍDO' },
      { status: 'limpo_lubrificado', titulo: '🧽 LIMPEZA / LUBRIFICAÇÃO' },
      { status: 'regulado', titulo: '🔧 REGULAGEM / CALIBRAÇÃO' },
      { status: 'checado_ok', titulo: '✅ CHECADO OK' },
      { status: 'trocar_em_breve', titulo: '⚠️ ATENÇÃO / PRÓXIMA TROCA' },
    ];

    for (const bloco of blocos) {
      const lista = resumoRelatorio[bloco.status];
      if (lista.length === 0) continue;
      linhas.push(`----------------------------------------`, `*${bloco.titulo} (${lista.length}):*`);
      for (const { passo, reg } of lista) {
        const pecaTxt = reg.pecaUsada?.trim() ? ` [Peça: ${reg.pecaUsada.trim()}]` : '';
        linhas.push(`• ${passo.titulo}${pecaTxt}`);
        if (reg.observacao?.trim()) {
          linhas.push(`   ↳ _${reg.observacao.trim()}_`);
        }
      }
    }

    if (comentarioGeral.trim()) {
      linhas.push(`----------------------------------------`, `📝 *Parecer Geral do Mecânico:*`, comentarioGeral.trim());
    }

    return linhas.join('\n');
  };

  const copiarRelatorioWhatsApp = async () => {
    const texto = montarTextoWhatsAppRelatorio();
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
    setCopiadoRelatorio(true);
    mostrarToast({
      dedupeKey: 'copiar-relatorio-revisao',
      titulo: 'Relatório copiado para WhatsApp!',
      variante: 'sucesso',
      duracaoMs: 2400,
    });
    window.setTimeout(() => setCopiadoRelatorio(false), 2400);
  };

  if (!def) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="no-print">
        <SectionHeader section={def}>
          <Badge
            variant="outline"
            className={cn(
              'gap-1.5 px-2.5 py-1 text-xs',
              isAuditado
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300',
            )}
          >
            {isAuditado ? (
              <>
                <FileCheck2 className="size-3.5" />
                Dados Auditados via Manual Oficial
              </>
            ) : (
              <>
                <ShieldAlert className="size-3.5" />
                Base Técnica de Fábrica
              </>
            )}
          </Badge>
        </SectionHeader>
      </div>

      <AnimatePresence mode="wait">
        {/* ================================================================ */}
        {/* TELA 1 — PREPARAR REVISÃO                                        */}
        {/* ================================================================ */}
        {etapaTela === 'preparar' && (
          <motion.div
            key="tela-preparar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={TRANSICAO_TELA}
            className="space-y-6"
          >
            {/* Card de Revisão Pausada em Andamento */}
            {rascunhoDetectado && (
              <Card className="border-primary/50 bg-primary/10">
                <CardContent className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <PlayCircle className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Continuar Revisão em Andamento (Passo {rascunhoDetectado.passoIndex + 1} de{' '}
                        {gerarRoteiroRevisao(
                          moto.modelo,
                          moto.geracao,
                          rascunhoDetectado.tipoRevisao,
                        ).length}
                        )
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Perfil:{' '}
                        <strong>
                          {perfisRevisao.find((p) => p.id === rascunhoDetectado.tipoRevisao)?.titulo}
                        </strong>{' '}
                        · {Object.keys(rascunhoDetectado.registros).length} itens já registrados
                        {rascunhoDetectado.apelidoOuPlaca
                          ? ` · ${rascunhoDetectado.apelidoOuPlaca}`
                          : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={retomarRascunho}
                      className="gap-1.5"
                    >
                      <Play className="size-4 fill-current" />
                      Continuar de onde parei
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => descartarRascunho(true)}
                      className="gap-1 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                      Descartar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Escolha do Perfil de Revisão (3 Cards Clicáveis) */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                1. Escolha o Perfil da Revisão para {moto.marca} {moto.modelo.nome} (
                {moto.geracao.anosLabel})
              </h2>

              <div className="grid gap-4 md:grid-cols-3">
                {perfisRevisao.map((perfil) => {
                  const selecionado = perfil.id === tipoRevisao;
                  const qtdExata = gerarRoteiroRevisao(
                    moto.modelo,
                    moto.geracao,
                    perfil.id,
                  ).length;

                  return (
                    <SpotlightCard
                      key={perfil.id}
                      marca={moto.marca}
                      intensity="subtle"
                      onClick={() => setTipoRevisao(perfil.id)}
                      className={cn(
                        'flex cursor-pointer flex-col justify-between p-5 transition-all',
                        selecionado
                          ? 'border-2 border-primary bg-primary/10 shadow-lg'
                          : 'hover:border-border',
                      )}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant={selecionado ? 'default' : 'secondary'} className="font-mono text-xs">
                            {qtdExata} passos
                          </Badge>
                          <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                            <Clock className="size-3.5" />
                            {perfil.tempoEstimado}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-foreground">{perfil.titulo}</h3>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {perfil.subtitulo}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs font-semibold">
                        <span className={selecionado ? 'text-primary' : 'text-muted-foreground'}>
                          {selecionado ? 'Perfil selecionado ✓' : 'Clique para selecionar'}
                        </span>
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            </div>

            {/* Dados Rápidos da Bancada + Botão Grande de Início */}
            <Card className="border-border/80 bg-card/85">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  2. Dados Rápidos da Moto na Bancada
                </CardTitle>
                <CardDescription className="text-xs">
                  O roteiro já está adaptado automaticamente para{' '}
                  <strong>{arq.descricaoAlimentacao}</strong>,{' '}
                  <strong>{isScooter ? 'Transmissão CVT' : 'Transmissão por Corrente'}</strong> e{' '}
                  <strong>
                    Freios {moto.geracao.fichaTecnica.freios.dianteiro}/
                    {moto.geracao.fichaTecnica.freios.traseiro} ({moto.geracao.fichaTecnica.freios.sistema})
                  </strong>
                  .
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold">KM Atual do Painel</label>
                  <Input
                    type="number"
                    min={0}
                    value={kmAtual}
                    onChange={(e) => setKmAtual(e.target.value)}
                    placeholder="Ex.: 12000"
                    className="h-11 font-mono text-base font-bold"
                  />
                </div>

                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold">Apelido ou Placa (Opcional)</label>
                  <Input
                    value={apelidoOuPlaca}
                    onChange={(e) => setApelidoOuPlaca(e.target.value)}
                    placeholder={`Ex.: Minha ${moto.modelo.nome} · ABC-1D23`}
                    className="h-11 text-sm"
                  />
                </div>

                <Button
                  type="button"
                  size="lg"
                  onClick={iniciarNovaRevisao}
                  className="h-11 shrink-0 gap-2 px-6 text-sm font-bold shadow-lg"
                >
                  <PlayCircle className="size-5" />
                  Iniciar Passo a Passo ({passos.length} etapas)
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* TELA 2 — EXECUÇÃO PASSO A PASSO (FOCO TOTAL NA BANCADA)          */}
        {/* ================================================================ */}
        {etapaTela === 'executar' && passoAtual && (
          <motion.div
            key="tela-executar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={TRANSICAO_TELA}
            className="space-y-5"
          >
            {/* Barra Superior de Progresso + Mini-Navegador Horizontal */}
            <Card className="border-border/80 bg-card/90">
              <CardContent className="space-y-3 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Badge variant="default" className="font-mono text-xs">
                      Passo {passoIndex + 1} de {passos.length}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground">
                      {totalRespondidos}/{passos.length} registrados ({progressoPct}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={pausarESalvar}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <PauseCircle className="size-3.5" />
                      Pausar / Salvar Rascunho
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        persistirRascunho();
                        setEtapaTela('relatorio');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <ClipboardCheck className="size-3.5" />
                      Ver Relatório
                    </Button>
                  </div>
                </div>

                <Progress value={progressoPct} className="h-2" />

                {/* Mini-navegador horizontal de passos (bolinhas/pills clicáveis) */}
                <div className="-mx-2 flex items-center gap-2 overflow-x-auto px-2 py-2">
                  {passos.map((p, idx) => {
                    const ativo = idx === passoIndex;
                    const reg = registros[p.id];
                    const statusMeta = reg ? FEEDBACK_STATUS_META[reg.status] : null;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => irParaPasso(idx)}
                        title={`Passo ${idx + 1}: ${p.titulo}${statusMeta ? ` (${statusMeta.label})` : ''}`}
                        className={cn(
                          'flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full border px-2 font-mono text-[11px] font-bold transition-all',
                          ativo && 'scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background',
                          statusMeta
                            ? statusMeta.pillClass
                            : ativo
                              ? 'border-primary bg-primary/20 text-primary'
                              : 'border-border bg-background/60 text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Layout 2 Colunas no Desktop (Blueprint + Critério | Ação + Feedback) */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Coluna Esquerda: Blueprint Interativo + Critério Visual */}
              <div className="lg:col-span-5">
                <MotoBlueprintVisual
                  marca={moto.marca}
                  isScooter={isScooter}
                  arquitetura={arq}
                  zonaAtiva={passoAtual.zonaVisual}
                  passoAtual={passoAtual}
                  passos={passos}
                  registros={registros}
                  onSelectZona={navegarParaZonaBlueprint}
                />
              </div>

              {/* Coluna Direita: Especificação do Passo + Feedback de Bancada */}
              <div className="lg:col-span-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={passoAtual.id}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-border/85 bg-card/90">
                      <CardHeader className="space-y-2 pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline" className="font-mono text-xs">
                              {getZonaVisualInfo(passoAtual.zonaVisual, arq).tituloCurto}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                ACAO_SUGERIDA_LABEL[passoAtual.acaoSugerida].badgeClass,
                              )}
                            >
                              Sugestão: {ACAO_SUGERIDA_LABEL[passoAtual.acaoSugerida].label}
                            </Badge>
                          </div>

                          {procedimentoRelacionado && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setVideoAtivoIdx(0);
                                setVideoTocandoId(null);
                                setSheetProcAberto(true);
                              }}
                              className="h-8 gap-1.5 text-xs"
                            >
                              <Clapperboard className="size-3.5 text-primary" />
                              Ver Ferramentas & Vídeo deste item
                            </Button>
                          )}
                        </div>

                        <CardTitle className="text-xl leading-snug sm:text-2xl">
                          {passoAtual.ordem}. {passoAtual.titulo}
                        </CardTitle>

                        {/* Valor dinâmico puxado da Ficha Técnica */}
                        <div className="rounded-xl border border-primary/35 bg-primary/10 p-3">
                          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-primary uppercase">
                            <Sparkles className="size-3.5" />
                            Especificação da Ficha Técnica ({moto.modelo.nome} ·{' '}
                            {moto.geracao.anosLabel})
                          </p>
                          <p className="mt-1 font-mono text-sm font-bold text-foreground">
                            {passoAtual.valorFicha}
                          </p>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-5">
                        {/* Como inspecionar fisicamente */}
                        <div className="rounded-xl border bg-background/55 p-3.5">
                          <p className="text-xs font-bold text-foreground">
                            Como inspecionar na bancada:
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                            {passoAtual.comoInspecionar}
                          </p>
                        </div>

                        {/* Painel de Feedback do Mecânico (Botões Grandes) */}
                        <div className="space-y-2.5">
                          <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Qual foi o resultado / ação executada neste item?
                          </p>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {ORDEM_STATUS_BOTOES.map((st) => {
                              const meta = FEEDBACK_STATUS_META[st];
                              const selecionado = registros[passoAtual.id]?.status === st;
                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() =>
                                    atualizarRegistroPasso(passoAtual.id, { status: st })
                                  }
                                  className={cn(
                                    'flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition-all active:scale-[0.98]',
                                    selecionado
                                      ? meta.activeClass
                                      : 'border-border/80 bg-background/60 text-foreground/85 hover:border-border hover:bg-accent/50',
                                  )}
                                >
                                  <span>{meta.emoji}</span>
                                  <span>{meta.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Campo condicional: Peça / Marca usada quando marcado como Substituído */}
                        {registros[passoAtual.id]?.status === 'substituido' && (
                          <div className="space-y-1.5 rounded-xl border border-purple-500/40 bg-purple-500/10 p-3.5">
                            <label className="text-xs font-bold text-purple-300">
                              Peça / Marca utilizada (vai direto para o Relatório Final):
                            </label>
                            <Input
                              value={registros[passoAtual.id]?.pecaUsada ?? ''}
                              onChange={(e) =>
                                atualizarRegistroPasso(passoAtual.id, {
                                  pecaUsada: e.target.value,
                                })
                              }
                              placeholder="Ex.: Lona Cobreq / Vela NGK CPR8EA-9 / Óleo Mobil 10W-30..."
                              className="h-9 bg-background/80 text-xs"
                            />
                          </div>
                        )}

                        {/* Campo rápido de observação do mecânico + Ditado por Voz */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-xs font-semibold text-muted-foreground">
                              Observação rápida deste item (opcional):
                            </label>
                            <BotaoDitadoVoz
                              compacto
                              onTranscricao={(texto) => {
                                const atual = registros[passoAtual.id]?.observacao?.trim() ?? '';
                                atualizarRegistroPasso(passoAtual.id, {
                                  observacao: atual ? `${atual} ${texto}` : texto,
                                });
                              }}
                            />
                          </div>
                          <Input
                            value={registros[passoAtual.id]?.observacao ?? ''}
                            onChange={(e) =>
                              atualizarRegistroPasso(passoAtual.id, {
                                observacao: e.target.value,
                              })
                            }
                            placeholder='Ex.: "Lona traseira com 30% de vida", "Troquei por 10W-30 semissintético"...'
                            className="h-10 text-xs"
                          />
                        </div>

                        {/* Navegação Anterior / Próximo / Finalizar */}
                        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={passoIndex === 0}
                            onClick={() => irParaPasso(passoIndex - 1)}
                            className="gap-1.5"
                          >
                            <ArrowLeft className="size-4" />
                            Anterior
                          </Button>

                          {passoIndex < passos.length - 1 ? (
                            <Button
                              type="button"
                              variant="default"
                              onClick={() => irParaPasso(passoIndex + 1)}
                              className="gap-1.5 px-6"
                            >
                              Próximo Passo
                              <ArrowRight className="size-4" />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => {
                                persistirRascunho();
                                setEtapaTela('relatorio');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="gap-1.5 bg-emerald-600 px-6 text-white hover:bg-emerald-500"
                            >
                              <ClipboardCheck className="size-4" />
                              Finalizar e Gerar Relatório
                            </Button>
                          )}
                        </div>

                        {/* Dica discreta de atalhos de teclado (apenas desktop) */}
                        <div className="hidden items-center justify-between gap-2 rounded-lg border border-border/50 bg-background/40 px-3 py-1.5 font-mono text-[11px] text-muted-foreground lg:flex">
                          <span>Atalhos: ← / → navegar passos</span>
                          <span>1–6 marcar status</span>
                          <span>V vídeo/ferramentas</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* TELA 3 — RELATÓRIO FINAL DA REVISÃO                              */}
        {/* ================================================================ */}
        {etapaTela === 'relatorio' && (
          <motion.div
            key="tela-relatorio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={TRANSICAO_TELA}
            className="space-y-6"
          >
            <Card className="print-report border-primary/35 bg-card/90">
              <CardHeader className="border-b border-border/60 pb-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="default">Relatório Final de Revisão</Badge>
                      <Badge variant="outline" className="font-mono">
                        {new Date().toLocaleDateString('pt-BR')}
                      </Badge>
                      <Badge variant="secondary" className="font-mono">
                        {(Number(kmAtual) || 0).toLocaleString('pt-BR')} km
                      </Badge>
                      {apelidoOuPlaca.trim() && (
                        <Badge variant="outline">{apelidoOuPlaca.trim()}</Badge>
                      )}
                    </div>
                    <CardTitle className="mt-2 text-2xl">
                      {moto.marca} {moto.modelo.nome} ({moto.geracao.anosLabel})
                    </CardTitle>
                    <CardDescription>
                      {moto.geracao.nomeGeracao} ·{' '}
                      {perfisRevisao.find((p) => p.id === tipoRevisao)?.titulo}
                    </CardDescription>
                  </div>
                </div>

                {/* 5 Contadores Visuais */}
                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  {(
                    [
                      {
                        key: 'substituido',
                        label: 'Substituídos',
                        classe: 'border-purple-500/35 bg-purple-500/10 text-purple-300',
                      },
                      {
                        key: 'limpo_lubrificado',
                        label: 'Limpos / Lubrif.',
                        classe: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-300',
                      },
                      {
                        key: 'regulado',
                        label: 'Regulados',
                        classe: 'border-amber-500/35 bg-amber-500/10 text-amber-300',
                      },
                      {
                        key: 'checado_ok',
                        label: 'Checados OK',
                        classe: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300',
                      },
                      {
                        key: 'trocar_em_breve',
                        label: 'Trocar em Breve',
                        classe: 'border-rose-500/40 bg-rose-500/12 text-rose-300',
                      },
                    ] as const
                  ).map((c) => (
                    <div key={c.key} className={cn('rounded-xl border p-3 text-center', c.classe)}>
                      <p className="font-mono text-2xl font-extrabold">
                        {resumoRelatorio[c.key].length}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold">{c.label}</p>
                    </div>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-5">
                {/* Destaque prioritário: Atenção — Trocar em Breve */}
                {resumoRelatorio.trocar_em_breve.length > 0 && (
                  <div className="rounded-2xl border-2 border-rose-500/45 bg-rose-500/10 p-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-rose-300 uppercase">
                      <AlertTriangle className="size-4 text-rose-400" />
                      Atenção — Pendências / Trocar em Breve ({resumoRelatorio.trocar_em_breve.length})
                    </h3>
                    <ul className="mt-2.5 space-y-2 text-xs">
                      {resumoRelatorio.trocar_em_breve.map(({ passo, reg }) => (
                        <li
                          key={passo.id}
                          className="rounded-xl border border-rose-500/25 bg-background/70 p-3"
                        >
                          <p className="font-bold text-foreground">{passo.titulo}</p>
                          {reg.observacao && (
                            <p className="mt-1 text-muted-foreground">Obs.: {reg.observacao}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Listas Agrupadas por Resultado (apenas categorias com itens) */}
                {(
                  [
                    { status: 'substituido', titulo: '🔄 Itens Substituídos' },
                    { status: 'limpo_lubrificado', titulo: '🧽 Limpeza & Lubrificação' },
                    { status: 'regulado', titulo: '🔧 Regulagens & Calibrações' },
                    { status: 'checado_ok', titulo: '✅ Itens Checados e Aprovados (OK)' },
                  ] as const
                ).map(({ status, titulo }) => {
                  const lista = resumoRelatorio[status];
                  if (lista.length === 0) return null;

                  return (
                    <div key={status} className="space-y-2">
                      <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        {titulo} ({lista.length})
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {lista.map(({ passo, reg }) => (
                          <div
                            key={passo.id}
                            className="rounded-xl border bg-background/55 p-3 text-xs"
                          >
                            <p className="font-bold text-foreground">{passo.titulo}</p>
                            {reg.pecaUsada && (
                              <p className="mt-1 font-mono text-purple-300">
                                Peça usada: {reg.pecaUsada}
                              </p>
                            )}
                            {reg.observacao && (
                              <p className="mt-1 text-muted-foreground">Obs.: {reg.observacao}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {totalRespondidos === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Nenhum item foi marcado durante o passo a passo. Volte para registrar os itens
                    inspecionados.
                  </p>
                )}

                {/* Comentário Geral da Revisão + Ditado por Voz */}
                <div className="space-y-1.5 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold">
                      Comentário Geral do Mecânico sobre o Estado da Moto (Opcional)
                    </label>
                    <BotaoDitadoVoz
                      compacto
                      className="no-print"
                      onTranscricao={(texto) => {
                        const atualizado = comentarioGeral.trim()
                          ? `${comentarioGeral.trim()} ${texto}`
                          : texto;
                        setComentarioGeral(atualizado);
                        persistirRascunho({ comentarioGeral: atualizado });
                      }}
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={comentarioGeral}
                    onChange={(e) => {
                      setComentarioGeral(e.target.value);
                      persistirRascunho({ comentarioGeral: e.target.value });
                    }}
                    placeholder="Ex.: Moto em excelente estado geral, motor redondo, recomenda-se trocar a lona traseira nos próximos 2.000 km..."
                    className="w-full rounded-xl border border-input bg-background/60 p-3 text-xs focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Barra de Ações Finais (Oculta na impressão) */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/85 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEtapaTela('executar')}
                  className="gap-1.5"
                >
                  <ArrowLeft className="size-4" />
                  Voltar para Editar Passos
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    descartarRascunho();
                    setEtapaTela('preparar');
                  }}
                  className="gap-1.5 text-xs"
                >
                  <RotateCcw className="size-3.5" />
                  Iniciar Nova Revisão
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5"
                >
                  <Printer className="size-4" />
                  Imprimir / Salvar PDF
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => void copiarRelatorioWhatsApp()}
                  className="gap-1.5 shadow-md"
                >
                  {copiadoRelatorio ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copiadoRelatorio ? 'Relatório Copiado!' : 'Copiar Relatório (WhatsApp)'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================== */}
      {/* SHEET / MODAL DE APOIO: FERRAMENTAS & VÍDEO SEM SAIR DA REVISÃO    */}
      {/* ================================================================== */}
      <Sheet open={sheetProcAberto} onOpenChange={setSheetProcAberto}>
        <SheetContent
          side="right"
          className="flex w-[96vw] flex-col gap-4 overflow-y-auto p-5 sm:max-w-2xl"
        >
          {procedimentoRelacionado && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <Clapperboard className="size-5 text-primary" />
                  {procedimentoRelacionado.titulo}
                </SheetTitle>
                <SheetDescription>{procedimentoRelacionado.resumo}</SheetDescription>
              </SheetHeader>

              {/* Ferramentas Exatas Necessárias */}
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                  <Wrench className="size-3.5 text-primary" />
                  Ferramentas Exatas Necessárias
                </p>
                {procedimentoRelacionado.ferramentasExatas.map((ferr, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-background/55 p-2.5 text-xs"
                  >
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
                      <Wrench className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-bold text-foreground">{ferr.nome}</p>
                        {!ferr.obrigatoria && (
                          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                            Opcional
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 font-mono text-muted-foreground">
                        {ferr.medidaOuDetalhe}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Player YouTube Embed 16:9 */}
              {procedimentoRelacionado.videos[videoAtivoIdx] && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold tracking-wider uppercase">
                      Vídeo de Bancada ({procedimentoRelacionado.videos[videoAtivoIdx]!.canal})
                    </p>
                    <Button variant="outline" size="sm" asChild className="h-7 gap-1 text-[11px]">
                      <a
                        href={procedimentoRelacionado.videos[videoAtivoIdx]!.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-3" />
                        YouTube
                      </a>
                    </Button>
                  </div>

                  {procedimentoRelacionado.videos.length > 1 && (
                    <div className="flex flex-wrap gap-1.5">
                      {procedimentoRelacionado.videos.map((v, idx) => (
                        <button
                          key={v.youtubeId}
                          type="button"
                          onClick={() => {
                            setVideoAtivoIdx(idx);
                            setVideoTocandoId(null);
                          }}
                          className={cn(
                            'rounded-md border px-2 py-1 text-[11px] font-medium',
                            idx === videoAtivoIdx
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-border bg-background text-muted-foreground',
                          )}
                        >
                          Aula {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-zinc-950">
                    {videoTocandoId === procedimentoRelacionado.videos[videoAtivoIdx]!.youtubeId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${procedimentoRelacionado.videos[videoAtivoIdx]!.youtubeId}?autoplay=1&rel=0`}
                        title={procedimentoRelacionado.videos[videoAtivoIdx]!.titulo}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full border-0"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setVideoTocandoId(
                            procedimentoRelacionado.videos[videoAtivoIdx]!.youtubeId,
                          )
                        }
                        className="group relative flex h-full w-full items-center justify-center"
                      >
                        <img
                          src={`https://i.ytimg.com/vi/${procedimentoRelacionado.videos[videoAtivoIdx]!.youtubeId}/hqdefault.jpg`}
                          alt={procedimentoRelacionado.videos[videoAtivoIdx]!.titulo}
                          className="h-full w-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/45" />
                        <span className="relative z-10 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
                          <Play className="ml-0.5 size-6 fill-current" />
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Dicas de Ouro resumidas */}
              <div className="space-y-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/8 p-3.5 text-xs">
                <p className="font-bold text-emerald-300">Dicas de Ouro:</p>
                {procedimentoRelacionado.dicasDeOuro.map((d, i) => (
                  <p key={i} className="leading-relaxed text-foreground/90">
                    • {d}
                  </p>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
