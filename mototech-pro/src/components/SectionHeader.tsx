import type { ReactNode } from 'react';
import { CalendarRange } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { useMoto, useMotoSelecionada } from '@/context/MotoContext';
import { BRAND_THEME } from '@/lib/brands';
import type { SectionDef } from '@/lib/sections';
import { cn } from '@/lib/utils';
import { CATEGORIA_LABEL } from '@/utils/format';

/** Cabeçalho comum às 7 seções do workspace: seção + Marca • Modelo • Seletor Rápido de Ano/Geração. */
export function SectionHeader({ section, children }: { section: SectionDef; children?: ReactNode }) {
  const { selecionarGeracao } = useMoto();
  const { marca, modelo, geracao } = useMotoSelecionada();
  const theme = BRAND_THEME[marca];
  const Icon = section.icon;

  // Ordena da mais recente para a mais antiga para acesso imediato na bancada
  const geracoesOrdenadas = [...modelo.geracoes].sort((a, b) => b.anoInicio - a.anoInicio);

  return (
    <div className="flex flex-col gap-4 border-b pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="rounded-xl bg-primary/15 p-3 text-primary">
            <Icon className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{section.titulo}</h1>
            <p className="mt-1 text-muted-foreground">{section.descricao}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={theme.badge}>{marca}</Badge>
              <Badge variant="secondary" className="text-xs font-semibold">
                {modelo.nome}
              </Badge>
              <Badge variant="secondary" className="font-mono">
                {geracao.anosLabel}
              </Badge>
              <Badge variant="outline">{geracao.nomeGeracao}</Badge>
              <Badge variant="outline">{CATEGORIA_LABEL[modelo.categoria]}</Badge>
            </div>
          </div>
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>

      {/* Seletor rápido de geração/ano com 1 clique */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card/60 px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <CalendarRange className="size-3.5 text-primary" />
          Ano / Geração ({modelo.nome}):
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {geracoesOrdenadas.map((g) => {
            const ativa = g.id === geracao.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => selecionarGeracao(g.id)}
                aria-pressed={ativa}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all',
                  ativa
                    ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'border-border bg-background/70 text-foreground/85 hover:border-primary/50 hover:bg-accent',
                )}
              >
                <span className="font-mono font-bold">{g.anosLabel}</span>
                <span className={cn('hidden md:inline', ativa ? 'text-primary-foreground/90' : 'text-muted-foreground')}>
                  · {g.nomeGeracao}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
