import { Construction, ListChecks } from 'lucide-react';

import { SectionHeader } from '@/components/SectionHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMotoSelecionada } from '@/context/MotoContext';
import type { SectionDef } from '@/lib/sections';

/** Tela-base das seções ainda não implementadas (Fase 3+). */
export function SectionPlaceholderPage({ section }: { section: SectionDef }) {
  const { marca, modelo, geracao } = useMotoSelecionada();

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section={section}>
        <Badge variant="outline" className="gap-1.5 border-warning/50 text-warning">
          <Construction /> Em construção
        </Badge>
      </SectionHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="size-5 text-primary" /> Conteúdo previsto
            </CardTitle>
            <CardDescription>
              Específico para {marca} {modelo.nome} {geracao.anosLabel}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm">
              {section.previsto.map((item) => (
                <li key={item} className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geração selecionada</CardTitle>
            <CardDescription>{geracao.nomeGeracao}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <ul className="flex flex-col gap-1.5">
              {geracao.destaques.map((d) => (
                <li key={d}>• {d}</li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              ID técnico: <code className="font-mono">{geracao.id}</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
