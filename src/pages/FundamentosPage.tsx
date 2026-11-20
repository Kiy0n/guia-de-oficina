import { useMemo, useState } from 'react';
import {
  BookOpen,
  Calculator,
  Eye,
  Gauge,
  GraduationCap,
  Lightbulb,
  Pause,
  Play,
  Search,
  Sparkles,
  Wrench,
} from 'lucide-react';

import { CadernetaManutencao } from '@/components/fundamentos/CadernetaManutencao';
import { ConversorBancada } from '@/components/fundamentos/ConversorBancada';
import {
  CalibreLaminasSvg,
  FolgaCorrenteSvg,
  MultimetroInterativoSvg,
  TorquimetroEstaloSvg,
} from '@/components/fundamentos/InstrumentosSvg';
import {
  CoroaDesgasteSvg,
  PneuTwiFreiosSvg,
  VelaEstadoSvg,
} from '@/components/fundamentos/OlhoClinicoSvg';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMoto } from '@/context/MotoContext';
import {
  CATEGORIAS_GLOSSARIO,
  ESTADOS_VELA_CLINICO,
  GLOSSARIO_TECNICO,
  type CategoriaGlossario,
} from '@/data/fundamentos';
import { cn } from '@/lib/utils';

const CATEGORIA_GLOSSARIO_BADGE: Record<CategoriaGlossario, string> = {
  Motor: 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300',
  'Injeção/Elétrica': 'border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-300',
  'Chassi/Freios': 'border-purple-500/40 bg-purple-500/15 text-purple-700 dark:text-purple-300',
  Fluidos: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
};

const STATUS_VELA_BADGE = {
  OK: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  Atenção: 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300',
  Crítico: 'border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300',
} as const;

export function FundamentosPage() {
  const { moto, trocarMoto } = useMoto();

  const [abaAtiva, setAbaAtiva] = useState<string>('instrumentos');
  const [animacoesPausadas, setAnimacoesPausadas] = useState<boolean>(false);
  const [buscaGlossario, setBuscaGlossario] = useState<string>('');
  const [categoriaGlossario, setCategoriaGlossario] = useState<CategoriaGlossario | 'Todas'>('Todas');

  const termosFiltrados = useMemo(() => {
    const termo = buscaGlossario.trim().toLowerCase();
    return GLOSSARIO_TECNICO.filter((item) => {
      if (categoriaGlossario !== 'Todas' && item.categoria !== categoriaGlossario) {
        return false;
      }
      if (!termo) return true;
      const texto = `${item.sigla} ${item.termo} ${item.descricao} ${item.exemploPratico ?? ''}`.toLowerCase();
      return texto.includes(termo);
    });
  }, [buscaGlossario, categoriaGlossario]);

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho independente (funciona com ou sem moto selecionada) */}
      <div className="no-print flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="rounded-xl bg-primary/15 p-3 text-primary">
            <GraduationCap className="size-6" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Fundamentos</h1>
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/15 text-xs text-emerald-700 dark:text-emerald-300"
              >
                <Sparkles className="mr-1 size-3" />
                Universal · FVM & Iniciantes
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Guias visuais de instrumentos, glossário rápido de termos e olho clínico de desgaste —
              válido para qualquer motocicleta.
            </p>
          </div>
        </div>

        {!moto && (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => trocarMoto('fabricante')}
            className="shrink-0 gap-1.5"
          >
            <Wrench className="size-4" />
            Selecionar Minha Moto
          </Button>
        )}
      </div>

      {/* 4 Sub-abas internas limpas */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-5">
        <TabsList className="no-print grid h-auto w-full grid-cols-1 gap-1.5 bg-card/80 p-1.5 sm:grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="instrumentos" className="gap-2 py-2.5 text-xs sm:text-sm">
            <Gauge className="size-4" />
            1. Guias de Instrumentos
          </TabsTrigger>
          <TabsTrigger value="glossario" className="gap-2 py-2.5 text-xs sm:text-sm">
            <BookOpen className="size-4" />
            2. Glossário ({GLOSSARIO_TECNICO.length})
          </TabsTrigger>
          <TabsTrigger value="olho-clinico" className="gap-2 py-2.5 text-xs sm:text-sm">
            <Eye className="size-4" />
            3. Olho Clínico
          </TabsTrigger>
          <TabsTrigger value="utilitarios" className="gap-2 py-2.5 text-xs sm:text-sm">
            <Calculator className="size-4" />
            4. Utilitários de Bancada
          </TabsTrigger>
        </TabsList>

        {/* ================================================================ */}
        {/* SUB-ABA 1: GUIAS DE INSTRUMENTOS                                 */}
        {/* ================================================================ */}
        <TabsContent value="instrumentos" className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/75 bg-card/75 px-4 py-3 text-xs">
            <p className="text-muted-foreground">
              Diagramas interativos e animações didáticas para dominar os 4 instrumentos essenciais da
              bancada.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-compact="true"
              onClick={() => setAnimacoesPausadas((p) => !p)}
              className="h-8 shrink-0 gap-1.5 text-xs"
            >
              {animacoesPausadas ? (
                <>
                  <Play className="size-3.5" />
                  Reproduzir animações
                </>
              ) : (
                <>
                  <Pause className="size-3.5" />
                  Pausar animações
                </>
              )}
            </Button>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* 1. Calibre de Lâminas */}
            <Card className="border-border/80 bg-card/90">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="border-amber-500/40 bg-amber-500/15 text-[11px] text-amber-700 dark:text-amber-300"
                  >
                    Motor & Válvulas
                  </Badge>
                  <span className="font-mono text-[11px] text-muted-foreground">0,05 – 0,30 mm</span>
                </div>
                <CardTitle className="mt-1.5 text-lg">
                  1. Calibre de Lâminas (Folga de Válvulas)
                </CardTitle>
                <CardDescription className="text-xs">
                  Como sentir o ponto exato de "arrasto leve" sem deixar a válvula presa nem batendo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <CalibreLaminasSvg pausado={animacoesPausadas} />

                <ol className="space-y-1.5 leading-relaxed text-foreground/90">
                  {[
                    'Aguarde o motor ficar 100% frio (abaixo de 35 °C) antes de medir.',
                    'Alinhe o PMS na fase de compressão (marca "T" com ambos os balancins livres).',
                    'Escolha a lâmina exata da Ficha Técnica (admissão e escape costumam ter medidas diferentes).',
                    'Passe a lâmina entre o parafuso regulador e a haste: sinta um arrasto firme e suave, sem dobrar a lâmina.',
                    'Segure firme o parafuso regulador ao apertar a contraporca para a folga não fechar.',
                    'Passe a lâmina novamente após o aperto final para confirmar a medida.',
                  ].map((passo, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[11px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      <span>{passo}</span>
                    </li>
                  ))}
                </ol>

                <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p className="leading-relaxed text-foreground/90">
                    <strong className="text-emerald-700 dark:text-emerald-300">Dica de ouro:</strong>{' '}
                    Teste também uma lâmina 0,02 mm acima da medida do manual — ela não deve entrar
                    facilmente. Se entrar solta, a folga ainda está grande.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 2. Multímetro Digital */}
            <Card className="border-border/80 bg-card/90">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="border-sky-500/40 bg-sky-500/15 text-[11px] text-sky-700 dark:text-sky-300"
                  >
                    Elétrica · Interativo
                  </Badge>
                  <span className="font-mono text-[11px] text-muted-foreground">DCV · Ω · Bip</span>
                </div>
                <CardTitle className="mt-1.5 text-lg">
                  2. Multímetro Digital (Bateria, Carga e Continuidade)
                </CardTitle>
                <CardDescription className="text-xs">
                  Clique nos 3 modos abaixo para girar o seletor e ver os valores reais de referência.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <MultimetroInterativoSvg />

                <ol className="space-y-1.5 leading-relaxed text-foreground/90">
                  {[
                    'Encaixe a ponta PRETA no borne COM e a VERMELHA no borne VΩmA (nunca em 10A para medições comuns).',
                    'Para bateria e carga, use DCV 20V: repouso ideal 12,6 V e carregando a 5.000 rpm entre 13,8 V e 14,5 V.',
                    'Para bobinas (estator, pulso, ignição), use Ω com a peça desconectada do chicote e fria.',
                    'Para fusíveis e fios partidos, use o modo Bip (continuidade) com a chave da moto desligada.',
                  ].map((passo, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[11px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      <span>{passo}</span>
                    </li>
                  ))}
                </ol>

                <div className="flex items-start gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 p-3">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="leading-relaxed text-foreground/90">
                    <strong className="text-amber-700 dark:text-amber-300">
                      Cuidado com o fusível interno:
                    </strong>{' '}
                    Nunca meça tensão da bateria com o seletor em Ω, Bip ou com a ponta vermelha no
                    borne 10A — isso fecha curto e queima o fusível interno do aparelho.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 3. Torquímetro de Estalo */}
            <Card className="border-border/80 bg-card/90">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="border-emerald-500/40 bg-emerald-500/15 text-[11px] text-emerald-700 dark:text-emerald-300"
                  >
                    Precisão & Segurança
                  </Badge>
                  <span className="font-mono text-[11px] text-muted-foreground">N·m ↔ kgf·m</span>
                </div>
                <CardTitle className="mt-1.5 text-lg">
                  3. Torquímetro de Estalo (N·m vs kgf·m)
                </CardTitle>
                <CardDescription className="text-xs">
                  Como dar o aperto exato sem espanar roscas de alumínio nem deixar eixos frouxos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <TorquimetroEstaloSvg pausado={animacoesPausadas} />

                <ol className="space-y-1.5 leading-relaxed text-foreground/90">
                  {[
                    'Sempre rosqueie o parafuso primeiro com a mão até encostar (nunca comece no torquímetro).',
                    'Ajuste o valor do manual na escala (ex.: 24 N·m ≈ 2,4 kgf·m) e trave o anel inferior do cabo.',
                    'Puxe o cabo com movimento contínuo e suave: ao ouvir e sentir o "CLIQUE", pare imediatamente.',
                    'Ao terminar o serviço, solte a trava e volte a escala para o mínimo (zero) antes de guardar.',
                  ].map((passo, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[11px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      <span>{passo}</span>
                    </li>
                  ))}
                </ol>

                <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p className="leading-relaxed text-foreground/90">
                    <strong className="text-emerald-700 dark:text-emerald-300">Regra de ouro:</strong>{' '}
                    Nunca use o torquímetro para soltar parafusos travados e sempre zere a mola ao
                    guardar — deixá-lo tensionado descalibra a ferramenta.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 4. Folga da Corrente de Transmissão */}
            <Card className="border-border/80 bg-card/90">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="border-purple-500/40 bg-purple-500/15 text-[11px] text-purple-700 dark:text-purple-300"
                  >
                    Transmissão Final
                  </Badge>
                  <span className="font-mono text-[11px] text-muted-foreground">15 – 25 mm*</span>
                </div>
                <CardTitle className="mt-1.5 text-lg">
                  4. Folga da Corrente de Transmissão
                </CardTitle>
                <CardDescription className="text-xs">
                  Medição correta no meio do vão inferior para proteger o câmbio e evitar rompimento.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <FolgaCorrenteSvg pausado={animacoesPausadas} />

                <ol className="space-y-1.5 leading-relaxed text-foreground/90">
                  {[
                    'Coloque a moto em ponto morto e gire a roda traseira devagar procurando o ponto mais tenso da corrente.',
                    'Nesse ponto mais tenso, meça o deslocamento vertical total (para cima e para baixo) no meio do vão inferior.',
                    'Compare com a Ficha Técnica da moto (street costuma ser 15–25 mm ou 20–30 mm; trails usam folga maior, 30–40 mm).',
                    'Ajuste os esticadores igualmente nos dois lados da balança conferindo as marcas de alinhamento antes de apertar o eixo.',
                  ].map((passo, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[11px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      <span>{passo}</span>
                    </li>
                  ))}
                </ol>

                <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p className="leading-relaxed text-foreground/90">
                    <strong className="text-emerald-700 dark:text-emerald-300">Dica de ouro:</strong>{' '}
                    Se um lado da volta fica esticado feito corda de violão e o outro fica frouxo, a
                    corrente ovalizou — é hora de trocar o kit relação completo.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* SUB-ABA 2: GLOSSÁRIO TÉCNICO                                     */}
        {/* ================================================================ */}
        <TabsContent value="glossario" className="space-y-5">
          <div className="flex flex-col gap-3 rounded-2xl border bg-card/80 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                value={buscaGlossario}
                onChange={(e) => setBuscaGlossario(e.target.value)}
                placeholder='Buscar sigla ou termo (ex.: "PMS", "JASO MA", "DOT 4", "TWI", "estator", "torque")...'
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                type="button"
                variant={categoriaGlossario === 'Todas' ? 'default' : 'outline'}
                size="sm"
                data-compact="true"
                onClick={() => setCategoriaGlossario('Todas')}
                className="h-8 text-xs"
              >
                Todas ({GLOSSARIO_TECNICO.length})
              </Button>
              {CATEGORIAS_GLOSSARIO.map((cat) => {
                const qtd = GLOSSARIO_TECNICO.filter((t) => t.categoria === cat).length;
                return (
                  <Button
                    key={cat}
                    type="button"
                    variant={categoriaGlossario === cat ? 'default' : 'outline'}
                    size="sm"
                    data-compact="true"
                    onClick={() => setCategoriaGlossario(cat)}
                    className="h-8 text-xs"
                  >
                    {cat} ({qtd})
                  </Button>
                );
              })}
            </div>
          </div>

          {termosFiltrados.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Nenhum termo encontrado para &ldquo;{buscaGlossario}&rdquo;.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
              {termosFiltrados.map((item) => (
                <Card key={item.id} className="flex flex-col justify-between border-border/80 bg-card/90">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-base font-extrabold text-primary">
                        {item.sigla}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn('shrink-0 text-[10px]', CATEGORIA_GLOSSARIO_BADGE[item.categoria])}
                      >
                        {item.categoria}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold text-foreground">
                      {item.termo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                    <p>{item.descricao}</p>
                    {item.exemploPratico && (
                      <p className="rounded-lg border border-border/60 bg-background/60 px-2.5 py-1.5 text-[11px] text-foreground/85">
                        <strong className="text-primary">Na bancada:</strong> {item.exemploPratico}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ================================================================ */}
        {/* SUB-ABA 3: OLHO CLÍNICO (DESGASTE VISUAL)                        */}
        {/* ================================================================ */}
        <TabsContent value="olho-clinico" className="space-y-6">
          {/* 1. Leitura da Ponta da Vela (4 estados lado a lado) */}
          <Card className="border-border/80 bg-card/90">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                1. Leitura da Ponta da Vela de Ignição (4 Estados)
              </CardTitle>
              <CardDescription className="text-xs">
                A cor da ponta cerâmica da vela conta imediatamente como o motor está queimando
                combustível e se há passagem de óleo.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {ESTADOS_VELA_CLINICO.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-border/75 bg-background/55 p-3.5"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-foreground">{item.titulo}</h3>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px]', STATUS_VELA_BADGE[item.status])}
                      >
                        {item.status}
                      </Badge>
                    </div>

                    <VelaEstadoSvg estado={item.id} />

                    <p className="text-[11px] font-semibold text-primary">{item.corAparente}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.diagnostico}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-card/80 p-2.5 text-[11px] leading-relaxed text-foreground/90">
                    <strong>O que fazer:</strong> {item.oQueFazer}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 2. Desgaste de Coroa / Pinhão */}
          <Card className="border-border/80 bg-card/90">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                2. Desgaste de Coroa e Pinhão (Kit Relação)
              </CardTitle>
              <CardDescription className="text-xs">
                Compare visualmente o formato dos dentes antes de decidir apenas esticar a corrente
                ou substituir o kit completo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CoroaDesgasteSvg />
            </CardContent>
          </Card>

          {/* 3. Pneus (TWI) e Pastilhas / Lonas de Freio */}
          <Card className="border-border/80 bg-card/90">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                3. Pneus (Indicador TWI) e Pastilhas / Lonas de Freio
              </CardTitle>
              <CardDescription className="text-xs">
                Os três pontos visuais de segurança que você pode conferir em menos de 1 minuto sem
                desmontar a moto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PneuTwiFreiosSvg />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* SUB-ABA 4: UTILITÁRIOS RÁPIDOS DE BANCADA                        */}
        {/* ================================================================ */}
        <TabsContent value="utilitarios" className="space-y-8">
          <ConversorBancada />
          <CadernetaManutencao />
        </TabsContent>
      </Tabs>
    </div>
  );
}
