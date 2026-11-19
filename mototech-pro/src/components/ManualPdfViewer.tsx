import { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatarTamanhoBytes, type ManualPdfItem } from '@/hooks/useManuais';
import { cn } from '@/lib/utils';

export interface ManualPdfViewerProps {
  manuais: ManualPdfItem[];
  manualSelecionadoId?: string;
  onSelectManual?: (id: string) => void;
  onRecarregar?: () => void;
  carregando?: boolean;
  paginaInicial?: number;
  className?: string;
  alturaMinimaClass?: string;
}

export function ManualPdfViewer({
  manuais,
  manualSelecionadoId,
  onSelectManual,
  onRecarregar,
  carregando = false,
  paginaInicial = 1,
  className,
  alturaMinimaClass = 'min-h-[75vh]',
}: ManualPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [internoId, setInternoId] = useState<string | undefined>(manualSelecionadoId);
  const [inputPagina, setInputPagina] = useState<string>(String(paginaInicial));
  const [paginaAplicada, setPaginaAplicada] = useState<number>(paginaInicial);
  const [reloadTick, setReloadTick] = useState<number>(0);
  const [telaCheiaModal, setTelaCheiaModal] = useState<boolean>(false);
  const [isFullscreenNativo, setIsFullscreenNativo] = useState<boolean>(false);

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

  const selecionarManual = (id: string) => {
    setInternoId(id);
    onSelectManual?.(id);
    setPaginaAplicada(1);
    setInputPagina('1');
  };

  const aplicarPagina = (novaPagina: number) => {
    const p = Math.max(1, Math.floor(novaPagina));
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

  if (!ativo) {
    return null;
  }

  const emTelaCheia = isFullscreenNativo || telaCheiaModal;
  const pdfSrc = `${ativo.url}#page=${paginaAplicada}&view=FitH`;

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-border/80 bg-zinc-950 shadow-xl',
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
                  <span className="max-w-[240px] truncate">{item.nomeArquivo.replace(/\.pdf$/i, '')}</span>
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

        {/* Linha principal: Info do arquivo + Ir para página + Ações */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <FileText className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-foreground">{ativo.tituloAmigavel}</p>
                {ativo.anoOuFaixa && (
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {ativo.anoOuFaixa}
                  </Badge>
                )}
                <Badge variant="outline" className="font-mono text-[11px]">
                  {formatarTamanhoBytes(ativo.tamanhoBytes)}
                </Badge>
              </div>
              <p className="truncate font-mono text-xs text-muted-foreground">
                public/manuals/{ativo.id}
              </p>
            </div>
          </div>

          {/* Controles de página e ações */}
          <div className="flex flex-wrap items-center gap-2">
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
                  value={inputPagina}
                  onChange={(e) => setInputPagina(e.target.value)}
                  aria-label="Ir para página"
                  className="h-6 w-14 border-0 bg-transparent p-0 text-center font-mono text-xs focus-visible:ring-0"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm" className="h-8 px-2.5 text-xs">
                Ir
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
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
                href={`${ativo.url}#page=${paginaAplicada}`}
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
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Visualizador Embutido (<iframe /> com fallback elegante)           */}
      {/* ------------------------------------------------------------------ */}
      <div
        className={cn(
          'relative flex-1 bg-zinc-900',
          emTelaCheia ? 'h-full min-h-[80vh]' : alturaMinimaClass,
        )}
      >
        <iframe
          key={`${ativo.id}-p${paginaAplicada}-r${reloadTick}`}
          src={pdfSrc}
          title={ativo.tituloAmigavel}
          className="h-full min-h-[inherit] w-full border-0 bg-zinc-900"
        />
      </div>
    </div>
  );
}
