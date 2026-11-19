import { useMemo, useState } from 'react';
import { BookMarked, HelpCircle, Search, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { GLOSSARIO_SIGLAS, buscarSiglaGlossario } from '@/data/glossario';
import { cn } from '@/lib/utils';

export interface SiglaTooltipProps {
  sigla: string;
  className?: string;
}

/**
 * Componente clicável/tocável (desktop e celular) que mostra explicação rápida
 * de siglas técnicas de oficina (PMS, TBI, CBS, JASO MA, CKP, etc.).
 */
export function SiglaTooltip({ sigla, className }: SiglaTooltipProps) {
  const [aberto, setAberto] = useState(false);
  const termo = buscarSiglaGlossario(sigla);

  if (!termo) {
    return <span className={className}>{sigla}</span>;
  }

  return (
    <span className={cn('relative inline-block', className)}>
      <button
        type="button"
        data-compact="true"
        onClick={(e) => {
          e.stopPropagation();
          setAberto((v) => !v);
        }}
        className="inline-flex items-center gap-1 rounded-md border border-primary/35 bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-primary transition-colors hover:bg-primary/20"
        title={`O que significa ${termo.sigla}? Clique para ver`}
      >
        <span>{termo.sigla}</span>
        <HelpCircle className="size-3 opacity-80" />
      </button>

      {aberto && (
        <span
          role="dialog"
          className="absolute bottom-full left-0 z-50 mb-2 block w-64 rounded-xl border border-primary/40 bg-popover p-3 text-left text-xs text-popover-foreground shadow-xl"
        >
          <span className="flex items-start justify-between gap-2">
            <span className="font-bold text-primary">
              {termo.sigla} — {termo.nomeCompleto}
            </span>
            <button
              type="button"
              data-compact="true"
              onClick={(e) => {
                e.stopPropagation();
                setAberto(false);
              }}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </span>
          <span className="mt-1 block leading-relaxed text-muted-foreground">
            {termo.explicacao}
          </span>
        </span>
      )}
    </span>
  );
}

export function GlossarioSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [busca, setBusca] = useState('');

  const termosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return GLOSSARIO_SIGLAS;
    return GLOSSARIO_SIGLAS.filter(
      (t) =>
        t.sigla.toLowerCase().includes(q) ||
        t.nomeCompleto.toLowerCase().includes(q) ||
        t.explicacao.toLowerCase().includes(q) ||
        t.ondeAparece.toLowerCase().includes(q),
    );
  }, [busca]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-[94vw] flex-col gap-4 overflow-y-auto p-5 sm:max-w-md">
        <SheetHeader className="pb-1">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <BookMarked className="size-5 text-primary" />
            Glossário Rápido de Siglas
          </SheetTitle>
          <SheetDescription className="text-xs">
            Explicação direta de oficina para as siglas que aparecem nos manuais e na bancada.
          </SheetDescription>
        </SheetHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder='Buscar sigla (ex.: "PMS", "TBI", "CBS", "JASO")...'
            className="h-9 pl-9 text-xs"
          />
        </div>

        <div className="space-y-2.5">
          {termosFiltrados.map((t) => (
            <div key={t.sigla} className="rounded-xl border bg-card/85 p-3 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="font-mono text-xs font-extrabold">
                  {t.sigla}
                </Badge>
                <span className="font-bold text-foreground">{t.nomeCompleto}</span>
              </div>
              <p className="mt-1.5 leading-relaxed text-muted-foreground">{t.explicacao}</p>
              <p className="mt-1 text-[11px] text-primary/90">Onde aparece: {t.ondeAparece}</p>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
