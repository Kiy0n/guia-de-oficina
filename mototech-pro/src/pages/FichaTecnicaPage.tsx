import { Cog, Disc3, Fuel, Gauge, Info, Power, Thermometer, type LucideIcon } from 'lucide-react';

import { SectionHeader } from '@/components/SectionHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMoto, useMotoSelecionada } from '@/context/MotoContext';
import { BRAND_THEME } from '@/lib/brands';
import { SECTIONS } from '@/lib/sections';
import { cn } from '@/lib/utils';
import {
  ALIMENTACAO_LABEL,
  ARREFECIMENTO_LABEL,
  COMBUSTIVEL_LABEL,
  FREIO_LABEL,
  PARTIDA_LABEL,
  SISTEMA_FREIO_LABEL,
  cambioLabel,
  cilindradaLabel,
} from '@/utils/format';

interface Spec {
  icon: LucideIcon;
  label: string;
  valor: string;
}

function SpecTile({ icon: Icon, label, valor }: Spec) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-background/40 p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="font-medium">{valor}</p>
      </div>
    </div>
  );
}

export function FichaTecnicaPage() {
  const { section } = useMoto();
  const { marca, modelo, geracao } = useMotoSelecionada();
  const def = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];
  const ficha = geracao.fichaTecnica;
  const theme = BRAND_THEME[marca];

  if (!def) return null;

  const specs: Spec[] = [
    { icon: Gauge, label: 'Cilindrada', valor: cilindradaLabel(ficha.cilindradaCc) },
    { icon: Cog, label: 'Motor', valor: ficha.motor },
    { icon: Fuel, label: 'Alimentação', valor: ALIMENTACAO_LABEL[ficha.alimentacao] },
    { icon: Fuel, label: 'Combustível', valor: COMBUSTIVEL_LABEL[ficha.combustivel] },
    { icon: Thermometer, label: 'Arrefecimento', valor: ARREFECIMENTO_LABEL[ficha.arrefecimento] },
    { icon: Power, label: 'Partida', valor: PARTIDA_LABEL[ficha.partida] },
    { icon: Cog, label: 'Câmbio', valor: cambioLabel(ficha.cambio) },
    {
      icon: Disc3,
      label: 'Freios (D / T)',
      valor: `${FREIO_LABEL[ficha.freios.dianteiro]} / ${FREIO_LABEL[ficha.freios.traseiro]} · ${SISTEMA_FREIO_LABEL[ficha.freios.sistema]}`,
    },
  ];

  const outrasGeracoes = modelo.geracoes.filter((g) => g.id !== geracao.id);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section={def}>
        {ficha.versaoReferencia && <Badge variant="outline">Versão de referência: {ficha.versaoReferencia}</Badge>}
      </SectionHeader>

      <Tabs defaultValue="basico">
        <TabsList>
          <TabsTrigger value="basico">Dados básicos</TabsTrigger>
          <TabsTrigger value="geracao">Geração</TabsTrigger>
          <TabsTrigger value="detalhado">Detalhado</TabsTrigger>
        </TabsList>

        <TabsContent value="basico" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {marca} {modelo.nome} <span className="font-mono text-muted-foreground">{geracao.anosLabel}</span>
              </CardTitle>
              <CardDescription>{geracao.nomeGeracao}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {specs.map((s) => (
                <SpecTile key={s.label} {...s} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geracao" className="mt-4 grid gap-4 md:grid-cols-2">
          <Card className={cn('border-2', theme.border)}>
            <CardHeader>
              <CardTitle>Destaques desta geração</CardTitle>
              <CardDescription>{geracao.anosLabel}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ul className="flex flex-col gap-1.5 text-sm">
                {geracao.destaques.map((d) => (
                  <li key={d}>• {d}</li>
                ))}
              </ul>
              {geracao.versoes && (
                <div className="flex flex-wrap gap-2">
                  {geracao.versoes.map((v) => (
                    <Badge key={v} variant="secondary">
                      {v}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Outras gerações do {modelo.nome}</CardTitle>
              <CardDescription>Atenção às diferenças ao comprar peças.</CardDescription>
            </CardHeader>
            <CardContent>
              {outrasGeracoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Modelo com geração única no catálogo.</p>
              ) : (
                <ul className="flex flex-col gap-2 text-sm">
                  {outrasGeracoes.map((g) => (
                    <li key={g.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
                      <span className="font-mono">{g.anosLabel}</span>
                      <span className="text-right text-muted-foreground">{g.nomeGeracao}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detalhado" className="mt-4">
          <Card>
            <CardContent className="flex items-start gap-3 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                Fluidos e capacidades, folgas, vela/bateria, pneus, relação e tabela de torques serão adicionados na{' '}
                <strong className="text-foreground">Fase 3</strong>. A estrutura já está tipada em{' '}
                <code className="font-mono">FichaTecnica</code>.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
