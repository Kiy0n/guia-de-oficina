import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { useMotoSelecionada } from '@/context/MotoContext';
import { BRAND_THEME } from '@/lib/brands';
import type { SectionDef } from '@/lib/sections';
import { CATEGORIA_LABEL } from '@/utils/format';

/** Cabeçalho comum às 7 seções do workspace: seção + Marca • Modelo • Ano/Geração. */
export function SectionHeader({ section, children }: { section: SectionDef; children?: ReactNode }) {
  const { marca, modelo, geracao } = useMotoSelecionada();
  const theme = BRAND_THEME[marca];
  const Icon = section.icon;

  return (
    <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="rounded-xl bg-primary/15 p-3 text-primary">
          <Icon className="size-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{section.titulo}</h1>
          <p className="mt-1 text-muted-foreground">{section.descricao}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={theme.badge}>{marca}</Badge>
            <Badge variant="secondary">{modelo.nome}</Badge>
            <Badge variant="secondary" className="font-mono">
              {geracao.anosLabel}
            </Badge>
            <Badge variant="outline">{geracao.nomeGeracao}</Badge>
            <Badge variant="outline">{CATEGORIA_LABEL[modelo.categoria]}</Badge>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
