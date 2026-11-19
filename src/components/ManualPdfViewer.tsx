import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  BookOpenText,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  ExternalLink,
  FileSearch,
  FileText,
  Loader2,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  buscarTextoManual,
  consultarIndiceManual,
  formatarTamanhoBytes,
  lerPaginaTextoManual,
  type IndiceManualApi,
  type ManualPdfItem,
  type PaginaTextoManualApi,
  type RespostaBuscaManualApi,
} from '@/hooks/useManuais';
import { prefixApiUrl, useApiBaseUrl } from '@/lib/apiBase';
import { cn } from '@/lib/utils';

const ATALHOS_BANCADA = [
  'Óleo',
  'Válvulas',
  'Torque',
  'Vela',
  'Corrente',
  'Freio',
  'Bengala',
  'Bateria',
  'Elétrica',
  'Carburador',
  'Injeção',
] as const;

export interface ManualPdfViewerProps {
  manuais: ManualPdfItem[];
  manualSelecionadoId?: string;
  onSelectManual?: (id: string) => void;
  onRecarregar?: () => void;
  carregando?: boolean;
  paginaInicial?: number;
  termoBuscaInicial?: string;
  className?: string;
  alturaMinimaClass?: string;
}

function normalizarParaDestaque(valor: string): string {
  return valor
    .normalize('NFC')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function destacarTermosTexto(textoBruto: string, queryBruta: string): ReactNode {
  const texto = textoBruto.normalize('NFC');
  const queryLimpa = queryBruta.trim();
  if (!texto || queryLimpa.length < 2) {
    return texto;
  }

  const termos = Array.from(
    new Set(
      normalizarParaDestaque(queryLimpa)
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2),
    ),
  );

  if (termos.length === 0) {
    return texto;
  }

  const textoNorm = normalizarParaDestaque(texto);
  const intervalos: Array<{ start: number; end: number }> = [];

  for (const termo of termos) {
    let cursor = 0;
    while (cursor < textoNorm.length) {
      const idx = textoNorm.indexOf(termo, cursor);
      if (idx === -1) break;
      intervalos.push({ start: idx, end: idx + termo.length });
      cursor = idx + termo.length;
    }
  }

  if (intervalos.length === 0) {
    return texto;
  }

  intervalos.sort((a, b) => a.start - b.start || b.end - a.end);

  const mesclados: Array<{ start: number; end: number }> = [];
  for (const atual of intervalos) {
    const ultimo = mesclados[mesclados.length - 1];
    if (!ultimo || atual.start > ultimo.end) {
      mesclados.push({ ...atual });
    } else if (atual.end > ultimo.end) {
      ultimo.end = atual.end;
    }
  }

  const partes: ReactNode[] = [];
  let cursor = 0;

  for (let i = 0; i < mesclados.length; i++) {
    const intervalo = mesclados[i];
    if (!intervalo) continue;

    if (intervalo.start > cursor) {
      partes.push(texto.slice(cursor, intervalo.start));
    }

    partes.push(
      <mark
        key={`hl-${i}-${intervalo.start}`}
        className="rounded bg-amber-300 px-1 py-0.5 font-semibold text-zinc-950 shadow-2xs dark:bg-amber-400/90 dark:text-zinc-950"
      >
        {texto.slice(intervalo.start, intervalo.end)}
      </mark>,
    );

    cursor = intervalo.end;
  }

  if (cursor < texto.length) {
    partes.push(texto.slice(cursor));
  }

  return partes;
}

export function ManualPdfViewer({
  manuais,
  manualSelecionadoId,
  onSelectManual,
  onRecarregar,
  carregando = false,
  paginaInicial = 1,
  termoBuscaInicial = '',
  className,
  alturaMinimaClass = 'min-h-[75vh]',
}: ManualPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputBuscaRef = useRef<HTMLInputElement | null>(null);
  const apiBaseUrl = useApiBaseUrl();

  const [internoId, setInternoId] = useState<string | undefined>(manualSelecionadoId);
  const [inputPagina, setInputPagina] = useState<string>(String(paginaInicial));
  const [paginaAplicada, setPaginaAplicada] = useState<number>(paginaInicial);
  const [reloadTick, setReloadTick] = useState<number>(0);
  const [telaCheiaModal, setTelaCheiaModal] = useState<boolean>(false);
  const [isFullscreenNativo, setIsFullscreenNativo] = useState<boolean>(false);

  // Modo de visualização: PDF original (<iframe />) ou Modo Leitura (Texto extraído)
  const [modoVisualizacao, setModoVisualizacao] = useState<'pdf' | 'texto'>('pdf');

  // Estados de indexação, busca e leitura de página
  const [indiceManual, setIndiceManual] = useState<IndiceManualApi | null>(null);
  const [indexando, setIndexando] = useState<boolean>(false);
  const [erroIndice, setErroIndice] = useState<string | null>(null);

  const [termoBusca, setTermoBusca] = useState<string>(termoBuscaInicial);
  const [termoDebounced, setTermoDebounced] = useState<string>(termoBuscaInicial.trim());
  const [buscando, setBuscando] = useState<boolean>(false);
  const [resultadoBusca, setResultadoBusca] = useState<RespostaBuscaManualApi | null>(null);
  const [painelResultadosAberto, setPainelResultadosAberto] = useState<boolean>(true);

  const [paginaTexto, setPaginaTexto] = useState<PaginaTextoManualApi | null>(null);
  const [carregandoPaginaTexto, setCarregandoPaginaTexto] = useState<boolean>(false);
  const [erroPaginaTexto, setErroPaginaTexto] = useState<string | null>(null);
  const [textoCopiadoToast, setTextoCopiadoToast] = useState<boolean>(false);

  useEffect(() => {
    if (manualSelecionadoId) {
      setInternoId(manualSelecionadoId);
    }
  }, [manualSelecionadoId]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreenNativo(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const ativo =
    manuais.find((m) => m.id === (manualSelecionadoId ?? internoId)) ?? manuais[0];

  // Debounce de ~250ms para a barra de busca
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTermoDebounced(termoBusca.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [termoBusca]);

  // Indexação automática ao abrir ou trocar de manual PDF
  useEffect(() => {
    if (!ativo) return;

    const controller = new AbortController();
    setIndexando(true);
    setErroIndice(null);
    setIndiceManual(null);

    consultarIndiceManual(ativo.id, controller.signal)
      .then((dados) => {
        setIndiceManual(dados);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setErroIndice(
          err instanceof Error ? err.message : 'Não foi possível indexar o manual PDF.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIndexando(false);
        }
      });

    return () => controller.abort();
  }, [ativo?.id]);

  // Executa busca quando termoDebounced >= 2 caracteres
  useEffect(() => {
    if (!ativo) return;

    if (termoDebounced.length < 2) {
      setResultadoBusca(null);
      setBuscando(false);
      return;
    }

    if (indiceManual && !indiceManual.temTextoPesquisavel) {
      setResultadoBusca({
        manualId: ativo.id,
        query: termoDebounced,
        temTextoPesquisavel: false,
        totalPaginas: indiceManual.totalPaginas,
        totalOcorrencias: 0,
        resultados: [],
      });
      setBuscando(false);
      return;
    }

    const controller = new AbortController();
    setBuscando(true);

    buscarTextoManual(ativo.id, termoDebounced, controller.signal)
      .then((res) => {
        setResultadoBusca(res);
        setPainelResultadosAberto(true);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.warn('[ManualPdfViewer] falha ao buscar termo:', err);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setBuscando(false);
        }
      });

    return () => controller.abort();
  }, [ativo?.id, termoDebounced, indiceManual]);

  // Carrega texto da página atual quando estiver em Modo Leitura (Texto)
  useEffect(() => {
    if (!ativo || modoVisualizacao !== 'texto') return;

    const controller = new AbortController();
    setCarregandoPaginaTexto(true);
    setErroPaginaTexto(null);

    lerPaginaTextoManual(ativo.id, paginaAplicada, controller.signal)
      .then((dados) => {
        setPaginaTexto(dados);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setErroPaginaTexto(
          err instanceof Error ? err.message : 'Falha ao carregar texto desta página.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCarregandoPaginaTexto(false);
        }
      });

    return () => controller.abort();
  }, [ativo?.id, paginaAplicada, modoVisualizacao]);

  const totalPaginas = indiceManual?.totalPaginas ?? paginaTexto?.totalPaginas ?? 0;
  const isPdfEscaneado = indiceManual !== null && !indiceManual.temTextoPesquisavel;
  const temBuscaAtiva = termoDebounced.length >= 2 && !isPdfEscaneado;

  const selecionarManual = (id: string) => {
    setInternoId(id);
    onSelectManual?.(id);
    setPaginaAplicada(1);
    setInputPagina('1');
    setReloadTick((t) => t + 1);
  };

  const aplicarPagina = (novaPagina: number) => {
    const limiteMaximo = totalPaginas > 0 ? totalPaginas : Number.MAX_SAFE_INTEGER;
    const p = Math.min(limiteMaximo, Math.max(1, Math.floor(novaPagina)));
    setPaginaAplicada(p);
    setInputPagina(String(p));
    setReloadTick((t) => t + 1);
  };

  const handleSubmitPagina = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(inputPagina);
    if (!Number.isNaN(num) && num >= 1) {
      aplicarPagina(num);
    }
  };

  const acionarAtalhoChip = (atalho: string) => {
    if (normalizarParaDestaque(termoBusca.trim()) === normalizarParaDestaque(atalho)) {
      setTermoBusca('');
      setTermoDebounced('');
      setResultadoBusca(null);
      return;
    }
    setTermoBusca(atalho);
    setTermoDebounced(atalho);
    setPainelResultadosAberto(true);
  };

  const limparBusca = () => {
    setTermoBusca('');
    setTermoDebounced('');
    setResultadoBusca(null);
    inputBuscaRef.current?.focus();
  };

  const handleCopiarTextoPagina = async () => {
    const texto = paginaTexto?.texto?.trim();
    if (!texto || !ativo) return;

    const cabecalho = `📄 ${ativo.tituloAmigavel} — Página ${paginaAplicada}${totalPaginas ? ` de ${totalPaginas}` : ''}\n----------------------------------------\n`;
    const conteudoCompleto = `${cabecalho}${texto}`;

    try {
      await navigator.clipboard.writeText(conteudoCompleto);
      setTextoCopiadoToast(true);
      window.setTimeout(() => setTextoCopiadoToast(false), 2600);
    } catch {
      const area = document.createElement('textarea');
      area.value = conteudoCompleto;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      setTextoCopiadoToast(true);
      window.setTimeout(() => setTextoCopiadoToast(false), 2600);
    }
  };

  const alternarTelaCheia = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }
    if (telaCheiaModal) {
      setTelaCheiaModal(false);
      return;
    }
    const el = containerRef.current;
    if (el && typeof el.requestFullscreen === 'function') {
      try {
        await el.requestFullscreen();
        return;
      } catch {
        // Fallback para modal expandido 95vw x 92vh
      }
    }
    setTelaCheiaModal(true);
  };

  const paragrafosModoLeitura = useMemo(() => {
    const bruto = paginaTexto?.texto?.trim() ?? '';
    if (!bruto) return [];
    return bruto.split(/\n{2,}/).map((bloco) => bloco.trim()).filter(Boolean);
  }, [paginaTexto?.texto]);

  if (!ativo) {
    return null;
  }

  const emTelaCheia = isFullscreenNativo || telaCheiaModal;
  const resolvedPdfUrl = prefixApiUrl(apiBaseUrl, ativo.url);
  const pdfSrc = `${resolvedPdfUrl}?p=${paginaAplicada}#page=${paginaAplicada}&view=FitH`;
  const iframeKey = `${resolvedPdfUrl}#page=${paginaAplicada}-r${reloadTick}`;

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-xl',
        telaCheiaModal &&
          'fixed inset-0 z-50 m-auto h-[92vh] w-[95vw] max-w-none rounded-2xl border-2 border-primary/40 shadow-2xl',
        className,
      )}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Barra superior de controles de bancada                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-3 border-b border-border/70 bg-card/95 p-3 backdrop-blur">
        {/* Seletor rápido quando houver mais de 1 PDF */}
        {manuais.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-muted-foreground">
              Documentos ({manuais.length}):
            </span>
            {manuais.map((item) => {
              const selecionado = item.id === ativo.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selecionarManual(item.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all',
                    selecionado
                      ? 'border-primary/60 bg-primary/15 text-primary shadow-sm'
                      : 'border-border/60 bg-background/60 text-muted-foreground hover:border-border hover:text-foreground',
                  )}
                >
                  <FileText className="size-3.5 shrink-0" />
                  <span className="max-w-[240px] truncate">
                    {item.nomeArquivo.replace(/\.pdf$/i, '')}
                  </span>
                  {item.anoOuFaixa && (
                    <Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px]">
                      {item.anoOuFaixa}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Linha principal: Info do arquivo + Alternador de Modo + Ir para página + Ações */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <FileText className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-foreground">
                  {ativo.tituloAmigavel}
                </p>
                {ativo.anoOuFaixa && (
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {ativo.anoOuFaixa}
                  </Badge>
                )}
                <Badge variant="outline" className="font-mono text-[11px]">
                  {formatarTamanhoBytes(ativo.tamanhoBytes)}
                </Badge>
                {totalPaginas > 0 && (
                  <Badge
                    variant="outline"
                    className="border-primary/35 bg-primary/10 font-mono text-[11px] text-primary"
                  >
                    {totalPaginas} págs
                  </Badge>
                )}
              </div>
              <p className="truncate font-mono text-xs text-muted-foreground">
                public/manuals/{ativo.id}
              </p>
            </div>
          </div>

          {/* Controles: Alternador PDF/Texto + Paginação + Tela Cheia */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Alternador PDF Original <-> Modo Leitura (Texto) */}
            <div
              role="group"
              aria-label="Modo de visualização do manual"
              className="inline-flex items-center rounded-lg border border-border/80 bg-muted/60 p-0.5"
            >
              <button
                type="button"
                data-compact="true"
                onClick={() => setModoVisualizacao('pdf')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                  modoVisualizacao === 'pdf'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <FileText className="size-3.5" />
                <span>PDF Original</span>
              </button>
              <button
                type="button"
                data-compact="true"
                onClick={() => setModoVisualizacao('texto')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                  modoVisualizacao === 'texto'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <BookOpenText className="size-3.5" />
                <span>Modo Leitura (Texto)</span>
              </button>
            </div>

            {/* Navegação de página */}
            <form onSubmit={handleSubmitPagina} className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                disabled={paginaAplicada <= 1}
                onClick={() => aplicarPagina(paginaAplicada - 1)}
                title="Página anterior"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="flex items-center gap-1 rounded-md border bg-background px-2 py-0.5">
                <span className="text-xs text-muted-foreground">Pág.</span>
                <Input
                  type="number"
                  min={1}
                  max={totalPaginas > 0 ? totalPaginas : undefined}
                  value={inputPagina}
                  onChange={(e) => setInputPagina(e.target.value)}
                  aria-label="Ir para página"
                  className="h-6 w-14 border-0 bg-transparent p-0 text-center font-mono text-xs focus-visible:ring-0"
                />
                {totalPaginas > 0 && (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    / {totalPaginas}
                  </span>
                )}
              </div>
              <Button type="submit" variant="secondary" size="sm" className="h-8 px-2.5 text-xs">
                Ir
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                disabled={totalPaginas > 0 && paginaAplicada >= totalPaginas}
                onClick={() => aplicarPagina(paginaAplicada + 1)}
                title="Próxima página"
              >
                <ChevronRight className="size-4" />
              </Button>
            </form>

            {onRecarregar && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={onRecarregar}
                disabled={carregando}
                title="Recarregar lista de PDFs da pasta public/manuals"
              >
                <RefreshCw className={cn('size-3.5', carregando && 'animate-spin')} />
                <span className="hidden sm:inline">Recarregar PDFs</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              asChild
            >
              <a
                href={`${resolvedPdfUrl}#page=${paginaAplicada}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir PDF em nova aba do navegador"
              >
                <ExternalLink className="size-3.5" />
                <span className="hidden sm:inline">Abrir em nova aba</span>
              </a>
            </Button>

            <Button
              type="button"
              variant={emTelaCheia ? 'default' : 'outline'}
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => void alternarTelaCheia()}
              title={emTelaCheia ? 'Sair da tela cheia' : 'Expandir em tela cheia'}
            >
              {emTelaCheia ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              <span>{emTelaCheia ? 'Sair Tela Cheia' : 'Tela Cheia'}</span>
            </Button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Barra de Busca Integrada + Atalhos Rápidos de 1 Toque            */}
        {/* ---------------------------------------------------------------- */}
        <div className="space-y-2 rounded-xl border border-border/70 bg-background/60 p-2.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputBuscaRef}
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                disabled={isPdfEscaneado}
                placeholder={
                  isPdfEscaneado
                    ? 'Busca indisponível (PDF escaneado sem camada de texto)'
                    : 'Pesquisar no manual (ex.: 20W-50, torque bujao, folga valvula, vela)...'
                }
                aria-label="Pesquisar palavra-chave dentro do manual PDF"
                className="h-9 pr-20 pl-9 text-xs sm:text-sm"
              />
              <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
                {(indexando || buscando) && (
                  <span
                    className="inline-flex items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 text-[11px] font-medium text-primary"
                    title={indexando ? 'Indexando páginas do PDF...' : 'Buscando...'}
                  >
                    <Loader2 className="size-3.5 animate-spin" />
                    <span className="hidden sm:inline">
                      {indexando ? 'Indexando...' : 'Buscando...'}
                    </span>
                  </span>
                )}
                {termoBusca.length > 0 && (
                  <button
                    type="button"
                    data-compact="true"
                    onClick={limparBusca}
                    title="Limpar busca"
                    className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Resumo rápido de ocorrências + Botão de recolher/expandir painel */}
            {temBuscaAtiva && resultadoBusca && (
              <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
                <Badge
                  variant={resultadoBusca.totalOcorrencias > 0 ? 'default' : 'secondary'}
                  className="font-mono text-xs"
                >
                  {resultadoBusca.totalOcorrencias}{' '}
                  {resultadoBusca.totalOcorrencias === 1 ? 'ocorrência' : 'ocorrências'} em{' '}
                  {resultadoBusca.resultados.length}{' '}
                  {resultadoBusca.resultados.length === 1 ? 'página' : 'páginas'}
                </Badge>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPainelResultadosAberto((v) => !v)}
                  className="h-8 gap-1.5 text-xs"
                >
                  {painelResultadosAberto ? (
                    <>
                      <PanelLeftClose className="hidden size-3.5 lg:inline" />
                      <ChevronUp className="size-3.5 lg:hidden" />
                      <span>Ocultar resultados</span>
                    </>
                  ) : (
                    <>
                      <PanelLeftOpen className="hidden size-3.5 lg:inline" />
                      <ChevronDown className="size-3.5 lg:hidden" />
                      <span>Ver resultados ({resultadoBusca.resultados.length})</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Chips clicáveis de 1 toque para bancada */}
          {!isPdfEscaneado && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <Sparkles className="size-3 text-primary" />
                Atalhos:
              </span>
              {ATALHOS_BANCADA.map((atalho) => {
                const selecionado =
                  termoBusca.trim().length > 0 &&
                  normalizarParaDestaque(termoBusca.trim()) === normalizarParaDestaque(atalho);

                return (
                  <button
                    key={atalho}
                    type="button"
                    data-compact="true"
                    onClick={() => acionarAtalhoChip(atalho)}
                    className={cn(
                      'inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
                      selecionado
                        ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                        : 'border-border/70 bg-card/80 text-foreground/90 hover:border-primary/50 hover:bg-primary/10 hover:text-primary',
                    )}
                  >
                    {atalho}
                  </button>
                );
              })}
            </div>
          )}

          {/* Aviso honesto para PDFs escaneados (somente imagem) */}
          {isPdfEscaneado && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-400" />
              <div>
                <p className="font-semibold">
                  PDF escaneado detectado (somente imagem, sem camada de texto pesquisável).
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  A pesquisa por palavra-chave e o Modo Leitura em texto não estão disponíveis para este arquivo, mas o visualizador do PDF original segue 100% operacional com todos os diagramas e tabelas.
                </p>
              </div>
            </div>
          )}

          {erroIndice && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{erroIndice}</span>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Corpo Principal: Painel Lateral de Resultados + Visualizador       */}
      {/* ------------------------------------------------------------------ */}
      <div
        className={cn(
          'flex flex-1 flex-col',
          temBuscaAtiva &&
            painelResultadosAberto &&
            'lg:grid lg:grid-cols-[350px_minmax(0,1fr)] xl:grid-cols-[390px_minmax(0,1fr)]',
          emTelaCheia ? 'h-full min-h-[78vh]' : alturaMinimaClass,
        )}
      >
        {/* Painel de Resultados da Busca */}
        {temBuscaAtiva && painelResultadosAberto && (
          <aside className="flex flex-col border-b border-border/70 bg-card/90 lg:border-r lg:border-b-0">
            <div className="flex items-center justify-between border-b border-border/60 px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <FileSearch className="size-4 text-primary" />
                <span className="text-xs font-semibold tracking-wide uppercase">
                  Resultados para &ldquo;{termoDebounced}&rdquo;
                </span>
              </div>
              {resultadoBusca && (
                <span className="font-mono text-xs text-muted-foreground">
                  {resultadoBusca.totalOcorrencias} ocorr. / {resultadoBusca.resultados.length} págs
                </span>
              )}
            </div>

            <ScrollArea className="h-64 lg:h-[75vh]">
              <div className="space-y-2 p-3">
                {buscando && !resultadoBusca ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Pesquisando em todas as páginas...</span>
                  </div>
                ) : resultadoBusca && resultadoBusca.resultados.length > 0 ? (
                  resultadoBusca.resultados.map((item) => {
                    const isPaginaAtual = item.pagina === paginaAplicada;
                    return (
                      <button
                        key={`res-p-${item.pagina}`}
                        type="button"
                        onClick={() => aplicarPagina(item.pagina)}
                        className={cn(
                          'group flex w-full flex-col gap-2 rounded-xl border p-3 text-left transition-all',
                          isPaginaAtual
                            ? 'border-primary bg-primary/12 shadow-sm'
                            : 'border-border/70 bg-background/60 hover:border-primary/50 hover:bg-accent/50',
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Badge
                            variant={isPaginaAtual ? 'default' : 'secondary'}
                            className="font-mono text-xs"
                          >
                            Pág. {item.pagina}
                          </Badge>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {item.ocorrencias}{' '}
                            {item.ocorrencias === 1 ? 'ocorrência' : 'ocorrências'}
                          </span>
                        </div>

                        {item.snippets.length > 0 && (
                          <div className="space-y-1.5">
                            {item.snippets.map((snippet, idx) => (
                              <p
                                key={`snip-${item.pagina}-${idx}`}
                                className="rounded-lg border border-border/50 bg-card/80 px-2.5 py-1.5 text-xs leading-relaxed text-foreground/95"
                              >
                                {destacarTermosTexto(snippet, termoDebounced)}
                              </p>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-border/70 bg-background/40 p-6 text-center">
                    <p className="text-sm font-medium text-foreground">
                      Nenhuma ocorrência encontrada para &ldquo;{termoDebounced}&rdquo;
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tente termos mais curtos ou use os atalhos de 1 toque acima (ex.: Óleo, Torque, Válvulas, Vela).
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Área do Visualizador: PDF Original (<iframe />) OU Modo Leitura (Texto) */}
        {modoVisualizacao === 'pdf' ? (
          <div className="relative flex-1 bg-zinc-900">
            <iframe
              key={iframeKey}
              src={pdfSrc}
              title={ativo.tituloAmigavel}
              className="h-full min-h-[72vh] w-full border-0 bg-zinc-900"
            />
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-between gap-4 bg-background/50 p-4 sm:p-6">
            {/* Cabeçalho do Cartão de Modo Leitura */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <BookOpenText className="size-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground sm:text-base">
                      Modo Leitura de Bancada — Página {paginaAplicada}
                      {totalPaginas > 0 ? ` de ${totalPaginas}` : ''}
                    </h3>
                    {termoDebounced.length >= 2 && (
                      <Badge variant="outline" className="border-amber-500/50 bg-amber-500/15 text-xs">
                        Destacando: &ldquo;{termoDebounced}&rdquo;
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Texto extraído em alto contraste. Para ver diagramas elétricos e vistas explodidas desta página, alterne para &ldquo;PDF Original&rdquo;.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant={textoCopiadoToast ? 'default' : 'secondary'}
                  size="sm"
                  disabled={!paginaTexto?.texto}
                  onClick={() => void handleCopiarTextoPagina()}
                  className="gap-1.5"
                >
                  {textoCopiadoToast ? (
                    <>
                      <Check className="size-4" />
                      <span>Texto da página copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" />
                      <span>Copiar texto da página</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModoVisualizacao('pdf')}
                  className="gap-1.5"
                >
                  <FileText className="size-4" />
                  <span>Ver Diagramas no PDF Original</span>
                </Button>
              </div>
            </div>

            {/* Corpo do Texto da Página Atual */}
            <div className="flex-1 rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-7">
              {carregandoPaginaTexto ? (
                <div className="flex min-h-[42vh] flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="size-7 animate-spin text-primary" />
                  <p className="text-sm font-medium">
                    Carregando texto da página {paginaAplicada}...
                  </p>
                </div>
              ) : erroPaginaTexto ? (
                <div className="flex min-h-[42vh] flex-col items-center justify-center gap-3 text-center">
                  <AlertCircle className="size-8 text-destructive" />
                  <p className="text-sm font-semibold text-destructive">{erroPaginaTexto}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => aplicarPagina(paginaAplicada)}
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : isPdfEscaneado ? (
                <div className="flex min-h-[42vh] flex-col items-center justify-center gap-3 text-center">
                  <AlertCircle className="size-9 text-amber-400" />
                  <h4 className="text-base font-bold text-foreground">
                    Este arquivo é um PDF escaneado (somente imagem)
                  </h4>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Não há camada de texto embutida para exibir no Modo Leitura. Utilize o modo &ldquo;PDF Original&rdquo; para consultar as páginas ilustradas.
                  </p>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setModoVisualizacao('pdf')}
                    className="mt-1 gap-1.5"
                  >
                    <FileText className="size-4" />
                    Voltar ao PDF Original
                  </Button>
                </div>
              ) : paragrafosModoLeitura.length > 0 ? (
                <div className="space-y-4 font-sans text-base leading-relaxed text-card-foreground sm:text-lg">
                  {paragrafosModoLeitura.map((paragrafo, idx) => (
                    <p
                      key={`par-${paginaAplicada}-${idx}`}
                      className="whitespace-pre-line rounded-xl border border-border/40 bg-background/40 p-3.5 leading-relaxed"
                    >
                      {destacarTermosTexto(paragrafo, termoDebounced)}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[42vh] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <FileText className="size-8 opacity-60" />
                  <p className="text-sm font-medium text-foreground">
                    Esta página ({paginaAplicada}) contém apenas ilustrações ou diagramas sem texto extraível.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setModoVisualizacao('pdf')}
                    className="mt-2 gap-1.5"
                  >
                    <FileText className="size-4" />
                    Visualizar página no PDF Original
                  </Button>
                </div>
              )}
            </div>

            {/* Rodapé do Modo Leitura com Botões Grandes Página Anterior / Próxima */}
            <div className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-border/80 bg-card p-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={paginaAplicada <= 1}
                onClick={() => aplicarPagina(paginaAplicada - 1)}
                className="h-11 gap-2 px-5 text-sm font-semibold"
              >
                <ChevronLeft className="size-5" />
                <span>Página Anterior ({Math.max(1, paginaAplicada - 1)})</span>
              </Button>

              <div className="text-center font-mono text-sm font-semibold text-muted-foreground">
                Página <span className="text-foreground">{paginaAplicada}</span>
                {totalPaginas > 0 ? ` de ${totalPaginas}` : ''}
              </div>

              <Button
                type="button"
                variant="default"
                size="lg"
                disabled={totalPaginas > 0 && paginaAplicada >= totalPaginas}
                onClick={() => aplicarPagina(paginaAplicada + 1)}
                className="h-11 gap-2 px-5 text-sm font-semibold"
              >
                <span>Próxima Página ({paginaAplicada + 1})</span>
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
