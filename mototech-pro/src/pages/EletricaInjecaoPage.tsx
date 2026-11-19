import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BatteryCharging,
  BookOpen,
  Cable,
  CheckCircle2,
  Cpu,
  Flame,
  Gauge,
  Info,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';

import { SectionHeader } from '@/components/SectionHeader';
import { SpotlightCard } from '@/components/SpotlightCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMoto, useMotoSelecionada } from '@/context/MotoContext';
import {
  CODIGOS_FALHA_FI,
  GUIAS_LEITURA_FI,
  GUIA_CORES_FIOS,
  TESTES_MULTIMETRO_BANCADA,
  type CorFioFabricante,
} from '@/data/eletrica';
import { useManuais } from '@/hooks/useManuais';
import { SECTIONS } from '@/lib/sections';
import { cn } from '@/lib/utils';
import { MARCAS, type Marca } from '@/types/moto';
import { formatFaixa } from '@/utils/format';

function SwatchFio({ cor }: { cor: CorFioFabricante }) {
  const style = cor.hexListra
    ? {
        background: `repeating-linear-gradient(135deg, ${cor.hexPrimaria} 0px, ${cor.hexPrimaria} 9px, ${cor.hexListra} 9px, ${cor.hexListra} 15px)`,
      }
    : { backgroundColor: cor.hexPrimaria };

  return (
    <div className="flex items-start gap-2.5">
      <span
        style={style}
        className="mt-0.5 h-5 w-9 shrink-0 rounded-md border border-white/25 shadow-inner"
        title={cor.nomeCor}
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-foreground">{cor.nomeCor}</span>
          <Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px]">
            {cor.codigoSigla}
          </Badge>
        </div>
        {cor.detalhe && (
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{cor.detalhe}</p>
        )}
      </div>
    </div>
  );
}

export function EletricaInjecaoPage() {
  const moto = useMotoSelecionada();
  const { setSection } = useMoto();

  const [marcaFi, setMarcaFi] = useState<Marca>(moto.marca);
  const [buscaCodigo, setBuscaCodigo] = useState<string>('');
  const [buscaFio, setBuscaFio] = useState<string>('');

  // Sincroniza a marca do decodificador sempre que o usuário trocar de moto
  useEffect(() => {
    setMarcaFi(moto.marca);
  }, [moto.marca]);

  const filtroManuais = useMemo(
    () => ({
      marca: moto.marca.toLowerCase(),
      modelo: moto.modelo.id,
      anoInicio: moto.geracao.anoInicio,
      anoFim: moto.geracao.anoFim,
    }),
    [moto.marca, moto.modelo.id, moto.geracao.anoInicio, moto.geracao.anoFim],
  );

  const { manuais: manuaisGeracao } = useManuais(filtroManuais);

  const def = SECTIONS.find((s) => s.id === 'eletrica') ?? SECTIONS[0];
  const ficha = moto.geracao.fichaTecnica;
  const isCarburada = ficha.alimentacao === 'carburador';
  const guiaMarca = GUIAS_LEITURA_FI[marcaFi];

  const codigosFiltrados = useMemo(() => {
    const termo = buscaCodigo.trim().toLowerCase();
    return CODIGOS_FALHA_FI.filter((c) => {
      if (c.marca !== marcaFi) return false;
      if (!termo) return true;
      const texto = [
        c.codigo,
        c.piscadasLabel,
        c.componente,
        c.sintomaTipico,
        c.oQueTestarPrimeiro,
        c.testeMultimetro,
      ]
        .join(' ')
        .toLowerCase();
      return texto.includes(termo);
    });
  }, [marcaFi, buscaCodigo]);

  const fiosFiltrados = useMemo(() => {
    const termo = buscaFio.trim().toLowerCase();
    if (!termo) return GUIA_CORES_FIOS;
    return GUIA_CORES_FIOS.filter((linha) => {
      const texto = [
        linha.funcaoCircuito,
        linha.ondeEncontrar,
        linha.Honda.nomeCor,
        linha.Yamaha.nomeCor,
        linha.Suzuki.nomeCor,
      ]
        .join(' ')
        .toLowerCase();
      return texto.includes(termo);
    });
  }, [buscaFio]);

  if (!def) return null;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section={def}>
        <Badge
          variant="outline"
          className={cn(
            'gap-1.5 px-2.5 py-1',
            isCarburada
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
          )}
        >
          <Zap className="size-3.5" />
          {isCarburada ? 'Ignição CDI/TCI · Carburada' : 'Injeção Eletrônica · PGM-FI / FI'}
        </Badge>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSection('manuais-pdf')}
          className="gap-1.5"
        >
          <BookOpen className="size-4 text-primary" />
          <span>Diagrama no Manual PDF</span>
          {manuaisGeracao.length > 0 && (
            <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 font-mono text-[11px]">
              {manuaisGeracao.length}
            </Badge>
          )}
        </Button>
      </SectionHeader>

      {/* ------------------------------------------------------------------ */}
      {/* Resumo Elétrico Rápido da Moto Selecionada                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SpotlightCard marca={moto.marca} intensity="subtle" className="p-3.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase">Bateria & Carga</span>
            <BatteryCharging className="size-4 text-primary" />
          </div>
          <p className="mt-1.5 font-mono text-base font-bold text-foreground">
            {ficha.eletrica?.bateria?.modelo ?? '12V Selada'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {ficha.eletrica?.bateria?.tensaoV ?? 12}V · {ficha.eletrica?.bateria?.capacidadeAh ?? 5} Ah ·{' '}
            {ficha.eletrica?.bateria?.tensaoCargaV ?? '13,5–14,8V @ 5.000 rpm'}
          </p>
        </SpotlightCard>

        <SpotlightCard marca={moto.marca} intensity="subtle" className="p-3.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase">Vela & Gap</span>
            <Flame className="size-4 text-primary" />
          </div>
          <p className="mt-1.5 font-mono text-base font-bold text-foreground">
            {ficha.eletrica?.vela?.modelo ?? 'Consulte Ficha'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Folga: {formatFaixa(ficha.eletrica?.vela?.folgaEletrodoMm)}
          </p>
        </SpotlightCard>

        <SpotlightCard marca={moto.marca} intensity="subtle" className="p-3.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase">Fusíveis & Farol</span>
            <Zap className="size-4 text-primary" />
          </div>
          <p className="mt-1.5 font-mono text-base font-bold text-foreground">
            Principal: {ficha.eletrica?.fusivelPrincipalA ?? 15}A
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            Aux: {ficha.eletrica?.fusiveisSecundarios ?? '10A'} · Farol:{' '}
            {ficha.eletrica?.lampadaFarol ?? '35/35W'}
          </p>
        </SpotlightCard>

        <SpotlightCard marca={moto.marca} intensity="subtle" className="p-3.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase">Alimentação / Linha</span>
            <Gauge className="size-4 text-primary" />
          </div>
          <p className="mt-1.5 truncate font-mono text-sm font-bold text-foreground">
            {isCarburada ? 'Carburador (Gravidade/Vácuo)' : 'Bomba Elétrica Injetada'}
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {ficha.motorDetalhes?.alimentacaoDetalhe ?? 'Consulte parâmetros'}
          </p>
        </SpotlightCard>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3 Sub-abas: Códigos FI | Testes no Multímetro | Cores de Fios      */}
      {/* ------------------------------------------------------------------ */}
      <Tabs defaultValue="codigos-fi" className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1.5 bg-card/80 p-1.5 sm:grid-cols-3">
          <TabsTrigger value="codigos-fi" className="gap-2 py-2.5 text-xs sm:text-sm">
            <Cpu className="size-4" />
            1. Códigos de Falha (FI / MIL)
          </TabsTrigger>
          <TabsTrigger value="multimetro" className="gap-2 py-2.5 text-xs sm:text-sm">
            <Wrench className="size-4" />
            2. Testes no Multímetro
          </TabsTrigger>
          <TabsTrigger value="cores-fios" className="gap-2 py-2.5 text-xs sm:text-sm">
            <Cable className="size-4" />
            3. Guia de Cores de Fios
          </TabsTrigger>
        </TabsList>

        {/* ================================================================ */}
        {/* ABA 1: DECODIFICADOR DE CÓDIGOS DE FALHA (FI / MIL)              */}
        {/* ================================================================ */}
        <TabsContent value="codigos-fi" className="space-y-5">
          {/* Banner informativo caso a geração selecionada seja carburada */}
          {isCarburada && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
              <Info className="mt-0.5 size-5 shrink-0 text-amber-400" />
              <div className="space-y-1 text-xs leading-relaxed">
                <p className="font-bold text-amber-300">
                  Atenção: A {moto.marca} {moto.modelo.nome} ({moto.geracao.anosLabel} ·{' '}
                  {moto.geracao.nomeGeracao}) utiliza CARBURADOR.
                </p>
                <p className="text-foreground/85">
                  Esta geração possui sistema de ignição por CDI/TCI e não utiliza central de injeção
                  eletrônica com luz de falha FI/MIL. O decodificador abaixo permanece liberado para
                  você consultar qualquer geração injetada na bancada.
                </p>
              </div>
            </div>
          )}

          {/* Seletor de Marca + Busca de código/sintoma */}
          <div className="flex flex-col gap-3 rounded-2xl border bg-card/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-semibold text-muted-foreground">
                Sistema de Injeção:
              </span>
              {MARCAS.map((m) => {
                const ativo = m === marcaFi;
                const count = CODIGOS_FALHA_FI.filter((c) => c.marca === m).length;
                return (
                  <Button
                    key={m}
                    type="button"
                    variant={ativo ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMarcaFi(m)}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <span>
                      {m === 'Honda'
                        ? 'Honda PGM-FI'
                        : m === 'Yamaha'
                          ? 'Yamaha FI'
                          : 'Suzuki DCP-FI'}
                    </span>
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 font-mono text-[10px]"
                    >
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                value={buscaCodigo}
                onChange={(e) => setBuscaCodigo(e.target.value)}
                placeholder='Filtrar código ou sintoma (ex.: "8", "12", "C21", "TPS", "bico")...'
                className="h-9 pl-9 text-xs"
              />
            </div>
          </div>

          {/* Guia prático de leitura de piscadas e reset no conector DLC */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="size-4 text-primary" />
                  Como Ler Piscadas e Resetar — {guiaMarca.sistemaNome}
                </CardTitle>
                <Badge variant="outline" className="font-mono text-xs">
                  {guiaMarca.regraPiscadas}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2 rounded-xl border bg-background/70 p-3.5">
                <p className="text-xs font-bold tracking-wider text-primary uppercase">
                  Leitura de Códigos no Painel / Conector
                </p>
                <ul className="space-y-1.5 text-xs leading-relaxed text-foreground/90">
                  {guiaMarca.comoLer.map((passo, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{passo}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 rounded-xl border bg-background/70 p-3.5">
                <p className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-400 uppercase">
                  <RotateCcw className="size-3.5" />
                  Procedimento de Reset (Apagar Memória & TPS)
                </p>
                <ul className="space-y-1.5 text-xs leading-relaxed text-foreground/90">
                  {guiaMarca.comoResetar.map((passo, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <span>{passo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Cards de Códigos de Falha */}
          <div className="grid gap-4 md:grid-cols-2">
            {codigosFiltrados.map((item) => (
              <Card key={`${item.marca}-${item.codigo}`} className="border-border/80 bg-card/90">
                <CardHeader className="pb-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-10 min-w-12 items-center justify-center rounded-xl border border-primary/40 bg-primary/15 px-2.5 font-mono text-lg font-extrabold text-primary">
                        {item.codigo}
                      </span>
                      <div>
                        <CardTitle className="text-sm leading-snug">{item.componente}</CardTitle>
                        <CardDescription className="mt-0.5 font-mono text-xs text-amber-400">
                          {item.piscadasLabel}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {item.marca}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  <div className="rounded-lg border bg-background/55 p-2.5">
                    <p className="font-semibold text-rose-300">Sintoma típico na moto:</p>
                    <p className="mt-0.5 leading-relaxed text-muted-foreground">
                      {item.sintomaTipico}
                    </p>
                  </div>

                  <div className="rounded-lg border bg-background/55 p-2.5">
                    <p className="font-semibold text-amber-300">O que testar primeiro:</p>
                    <p className="mt-0.5 leading-relaxed text-muted-foreground">
                      {item.oQueTestarPrimeiro}
                    </p>
                  </div>

                  <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/8 p-2.5">
                    <p className="font-semibold text-emerald-300">
                      Valor / Checagem no Multímetro:
                    </p>
                    <p className="mt-0.5 font-mono leading-relaxed text-foreground/90">
                      {item.testeMultimetro}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* ABA 2: TESTES DE BANCADA NO MULTÍMETRO                           */}
        {/* ================================================================ */}
        <TabsContent value="multimetro" className="space-y-5">
          {/* Aviso de segurança e conferência no Manual PDF */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-emerald-500/35 bg-emerald-500/8 p-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-400" />
              <div className="space-y-0.5 text-xs leading-relaxed">
                <p className="font-bold text-emerald-300">
                  Referência de Segurança para Medições em Ohms (Ω) e Tensão (V)
                </p>
                <p className="text-foreground/85">
                  Realize testes de resistência de bobinas (estator, pulso e ignição) com a peça a{' '}
                  <strong>20 °C (fria)</strong> e desconectada do chicote. Confirme sempre as faixas
                  específicas no <strong>Manual de Serviço PDF</strong> da geração selecionada.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSection('manuais-pdf')}
              className="shrink-0 gap-1.5 text-xs"
            >
              <BookOpen className="size-4 text-emerald-400" />
              Abrir Manuais PDF ({manuaisGeracao.length})
            </Button>
          </div>

          {/* Grid dos 6 Testes de Multímetro */}
          <div className="grid gap-5 lg:grid-cols-2">
            {TESTES_MULTIMETRO_BANCADA.map((teste) => (
              <Card key={teste.id} className="flex flex-col justify-between border-border/80">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="default" className="font-mono text-xs">
                      Escala: {teste.escalaMultimetro}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2 text-base">{teste.titulo}</CardTitle>
                  <CardDescription className="text-xs">{teste.subtitulo}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  {/* Faixa normal vs defeito */}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                      <p className="flex items-center gap-1.5 font-bold text-emerald-300">
                        <CheckCircle2 className="size-3.5" />
                        Faixa Normal (Aprovado)
                      </p>
                      <p className="mt-1 font-mono leading-relaxed text-foreground/95">
                        {teste.valorNormal}
                      </p>
                    </div>

                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                      <p className="flex items-center gap-1.5 font-bold text-rose-300">
                        <AlertCircle className="size-3.5" />
                        Sinal de Defeito (Reprovado)
                      </p>
                      <p className="mt-1 font-mono leading-relaxed text-foreground/95">
                        {teste.valorDefeito}
                      </p>
                    </div>
                  </div>

                  {/* Posição das pontas de prova */}
                  <div className="rounded-lg border bg-background/60 p-2.5">
                    <span className="font-semibold text-primary">Onde colocar as pontas: </span>
                    <span className="text-muted-foreground">{teste.pontasDeProva}</span>
                  </div>

                  {/* Passo a passo */}
                  <div className="space-y-1.5">
                    <p className="font-semibold text-foreground">Procedimento passo a passo:</p>
                    <ol className="space-y-1.5">
                      {teste.passoAPasso.map((p, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 rounded-lg border border-border/50 bg-background/40 p-2 leading-relaxed"
                        >
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[11px] font-bold text-primary">
                            {idx + 1}
                          </span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Dica de bancada */}
                  <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/8 p-2.5">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
                    <p className="leading-relaxed text-amber-200/90">
                      <strong>Macete de bancada:</strong> {teste.dicaBancada}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* ABA 3: GUIA VISUAL DE CORES DE FIOS (HONDA / YAMAHA / SUZUKI)    */}
        {/* ================================================================ */}
        <TabsContent value="cores-fios" className="space-y-4">
          <div className="flex flex-col justify-between gap-3 rounded-2xl border bg-card/80 p-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-bold">
                Padrão de Cores de Chicote — Honda vs Yamaha vs Suzuki
              </h3>
              <p className="text-xs text-muted-foreground">
                A coluna da marca atual (<strong className="text-primary">{moto.marca}</strong>) está
                destacada para consulta rápida ao testar continuidade no chicote.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                value={buscaFio}
                onChange={(e) => setBuscaFio(e.target.value)}
                placeholder='Buscar circuito ou cor (ex.: "terra", "pós-chave", "seta", "freio")...'
                className="h-9 pl-9 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border bg-card/85">
            <table className="w-full min-w-[780px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="p-3.5 font-bold text-foreground">Função / Circuito</th>
                  {MARCAS.map((m) => (
                    <th
                      key={m}
                      className={cn(
                        'p-3.5 font-bold',
                        m === moto.marca ? 'bg-primary/12 text-primary' : 'text-foreground',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span>Padrão {m}</span>
                        {m === moto.marca && (
                          <Badge variant="default" className="px-1.5 py-0 text-[10px]">
                            Moto Atual
                          </Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {fiosFiltrados.map((linha) => (
                  <tr key={linha.id} className="transition-colors hover:bg-accent/25">
                    <td className="p-3.5 align-top">
                      <p className="font-bold text-foreground">{linha.funcaoCircuito}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {linha.ondeEncontrar}
                      </p>
                    </td>
                    {MARCAS.map((m) => (
                      <td
                        key={m}
                        className={cn(
                          'p-3.5 align-top',
                          m === moto.marca && 'bg-primary/6',
                        )}
                      >
                        <SwatchFio cor={linha[m]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
