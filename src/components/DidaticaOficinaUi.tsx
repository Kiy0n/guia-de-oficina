import { AlertTriangle, ShieldAlert, Wrench } from 'lucide-react';

import {
  DIFICULDADE_META,
  NIVEIS_DIFICULDADE,
  type ArmadilhaOficina,
  type CategoriaFerramentaBancada,
  type FerramentaBancada,
  type NivelDificuldade,
} from '@/data/didaticaOficina';
import { cn } from '@/lib/utils';

interface SeloDificuldadeProps {
  nivel: NivelDificuldade;
  compacto?: boolean;
  className?: string;
}

/**
 * Selo translúcido discreto de dificuldade (FVM vs. Oficina) com tooltip explicativo.
 * Compatível com Tema Escuro, Tema Claro (.theme-sol) e impressão/PDF.
 */
export function SeloDificuldade({
  nivel,
  compacto = false,
  className,
}: SeloDificuldadeProps) {
  const meta = DIFICULDADE_META[nivel];

  return (
    <span
      title={meta.tooltip}
      aria-label={`Dificuldade ${meta.label}: ${meta.tooltip}`}
      className={cn(
        'selo-dificuldade inline-flex shrink-0 items-center gap-1.5 rounded-md border font-semibold whitespace-nowrap transition-colors',
        compacto ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]',
        meta.badgeClass,
        className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dotClass)} aria-hidden="true" />
      <span>{compacto ? meta.labelCurto : meta.label}</span>
    </span>
  );
}

interface LegendaDificuldadeProps {
  className?: string;
}

/**
 * Legenda compacta dos 3 níveis de dificuldade (Básico FVM, Intermediário, Profissional Oficina).
 */
export function LegendaDificuldade({ className }: LegendaDificuldadeProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border/70 bg-card/75 px-3.5 py-2.5 text-xs',
        className,
      )}
    >
      <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
        Nível FVM vs. Oficina:
      </span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {NIVEIS_DIFICULDADE.map((nivel) => {
          const meta = DIFICULDADE_META[nivel];
          return (
            <div key={nivel} className="inline-flex items-center gap-1.5">
              <SeloDificuldade nivel={nivel} compacto />
              <span className="text-[11px] text-muted-foreground">{meta.tooltip}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface AlertaArmadilhaProps {
  armadilha?: ArmadilhaOficina | null;
  compacto?: boolean;
  className?: string;
}

/**
 * Card compacto de aviso para "Erros Clássicos" (Armadilhas de Oficina).
 */
export function AlertaArmadilha({
  armadilha,
  compacto = false,
  className,
}: AlertaArmadilhaProps) {
  if (!armadilha) return null;

  const isCritico = armadilha.severidade === 'critico';

  return (
    <div
      role="note"
      className={cn(
        'flex items-start gap-2.5 rounded-xl border',
        compacto ? 'p-2.5 text-xs' : 'p-3.5 text-xs sm:text-sm',
        isCritico
          ? 'border-rose-500/35 bg-rose-500/10'
          : 'border-amber-500/35 bg-amber-500/10',
        className,
      )}
    >
      {isCritico ? (
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" />
      ) : (
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
      )}
      <div className="min-w-0 leading-relaxed">
        <p
          className={cn(
            'font-bold',
            isCritico
              ? 'text-rose-700 dark:text-rose-300'
              : 'text-amber-700 dark:text-amber-300',
          )}
        >
          {armadilha.titulo}
        </p>
        <p className="mt-0.5 text-foreground/90">{armadilha.mensagem}</p>
      </div>
    </div>
  );
}

const FERRAMENTA_CATEGORIA_META: Record<
  CategoriaFerramentaBancada,
  { chipClass: string; tag?: string }
> = {
  basica: {
    chipClass: 'border-border/80 bg-background/70 text-foreground/90',
  },
  medicao: {
    chipClass: 'border-sky-500/40 bg-sky-500/12 text-sky-700 dark:text-sky-300',
    tag: 'Medição',
  },
  especial: {
    chipClass: 'border-rose-500/40 bg-rose-500/12 text-rose-700 dark:text-rose-300',
    tag: 'Oficina',
  },
  apoio: {
    chipClass: 'border-border/60 bg-muted/45 text-muted-foreground',
  },
};

interface ListaFerramentasTarefaProps {
  ferramentas: readonly FerramentaBancada[];
  titulo?: string;
  subtitulo?: string;
  compacto?: boolean;
  className?: string;
}

/**
 * Lista somente leitura de ferramentas recomendadas na bancada para uma tarefa ou revisão.
 * Compatível com Tema Escuro, Tema Claro (.theme-sol) e impressão/PDF.
 */
export function ListaFerramentasTarefa({
  ferramentas,
  titulo = 'Ferramentas para esta tarefa',
  subtitulo,
  compacto = false,
  className,
}: ListaFerramentasTarefaProps) {
  if (ferramentas.length === 0) return null;

  return (
    <div
      className={cn(
        'lista-ferramentas-tarefa rounded-xl border border-border/75 bg-card/75',
        compacto ? 'p-3' : 'p-4',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wrench className="size-3.5 shrink-0 text-primary" />
          <p className="text-xs font-bold text-foreground">{titulo}</p>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {ferramentas.length} {ferramentas.length === 1 ? 'item' : 'itens'} · somente referência
        </span>
      </div>

      {subtitulo && <p className="mt-1 text-[11px] text-muted-foreground">{subtitulo}</p>}

      <div className={cn('flex flex-wrap gap-1.5', compacto ? 'mt-2' : 'mt-3')}>
        {ferramentas.map((ferr) => {
          const meta = FERRAMENTA_CATEGORIA_META[ferr.categoria];
          return (
            <span
              key={ferr.id}
              className={cn(
                'ferramenta-chip inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-medium',
                compacto ? 'text-[11px]' : 'text-xs',
                meta.chipClass,
              )}
            >
              <span>{ferr.nome}</span>
              {meta.tag && (
                <span className="rounded bg-background/55 px-1 py-0 text-[9px] font-bold tracking-wide uppercase opacity-90">
                  {meta.tag}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
