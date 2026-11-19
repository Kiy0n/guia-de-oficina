import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BatteryCharging,
  Check,
  CircleDot,
  Cog,
  Copy,
  Disc3,
  Droplets,
  Flame,
  Fuel,
  Gauge,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import { SectionHeader } from '@/components/SectionHeader';
import { SpotlightCard } from '@/components/SpotlightCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMotoSelecionada } from '@/context/MotoContext';
import { SECTIONS } from '@/lib/sections';
import { cn } from '@/lib/utils';
import type { Geracao, Modelo } from '@/types/moto';
import {
  ALIMENTACAO_LABEL,
  ARREFECIMENTO_LABEL,
  COMBUSTIVEL_LABEL,
  FREIO_LABEL,
  PARTIDA_LABEL,
  SISTEMA_FREIO_LABEL,
  cambioLabel,
  cilindradaLabel,
  formatFaixa,
  formatNumero,
  nmParaKgfm,
} from '@/utils/format';

const HERO_STAGGER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

interface SpecRowProps {
  icon?: LucideIcon;
  label: string;
  valor: string;
  detalhe?: string;
  mono?: boolean;
}

function SpecRow({ icon: Icon, label, valor, detalhe, mono = false }: SpecRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-background/45 p-3.5">
      {Icon && (
        <span className="mt-0.5 rounded-lg bg-primary/12 p-1.5 text-primary">
          <Icon className="size-4 shrink-0" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className={cn('mt-0.5 text-base font-semibold text-foreground', mono && 'font-mono')}>{valor}</p>
        {detalhe && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detalhe}</p>}
      </div>
    </div>
  );
}

function montarTextoResumo(modelo: Modelo, geracao: Geracao): string {
  const f = geracao.fichaTecnica;
  const oleo = f.fluidos?.oleoMotor;
  const adm = formatFaixa(f.folgas?.valvulaAdmissaoMm);
  const esc = formatFaixa(f.folgas?.valvulaEscapeMm);
  const vela = f.eletrica?.vela;
  const pD = f.pneus?.dianteiro;
  const pT = f.pneus?.traseiro;
  const rel = f.transmissaoFinal;
  const bengala = f.fluidos?.fluidoBengala;

  const linhas = [
    `🔧 MOTOTECH PRO — FICHA DE BANCADA`,
    `Moto: ${modelo.marca} ${modelo.nome} (${geracao.anosLabel} · ${geracao.nomeGeracao})`,
    `Motor: ${cilindradaLabel(f.cilindradaCc)} · ${f.motor} · ${ALIMENTACAO_LABEL[f.alimentacao]}`,
    `----------------------------------------`,
    `🛢️ Óleo do Motor: ${oleo ? `${formatNumero(oleo.capacidadeTrocaL)} L na troca${oleo.capacidadeTrocaComFiltroL ? ` (${formatNumero(oleo.capacidadeTrocaComFiltroL)} L c/ filtro)` : ''} — ${oleo.especificacao}` : '—'}`,
    `⚙️ Folga de Válvulas (Frio): Adm ${adm} | Esc ${esc}`,
    `⚡ Vela NGK: ${vela ? `${vela.modelo} (Folga ${formatFaixa(vela.folgaEletrodoMm)})` : '—'}`,
    `🛞 Pneus & Pressão: D ${pD?.medida ?? '—'} (${pD?.pressaoPsi ?? '—'} PSI) | T ${pT?.medida ?? '—'} (${pT?.pressaoPsi ?? '—'} PSI solo / ${pT?.pressaoComGarupaPsi ?? '—'} PSI garupa)`,
    rel?.tipo === 'correia'
      ? `⛓️ Transmissão CVT: ${rel.cvtDetalhe?.correiaCodigo ?? 'Correia V-Belt'} • ${rel.cvtDetalhe?.roletesMedidaPeso ?? ''}`
      : `⛓️ Relação: Pinhão ${rel?.pinhaoDentes ?? '—'}Z x Coroa ${rel?.coroaDentes ?? '—'}Z (${rel?.corrente ?? '—'}) • Folga: ${formatFaixa(f.folgas?.folgaCorrenteMm)}`,
    `🥢 Fluido de Bengala: ${bengala ? `${bengala.volumePorCanelaMl} ml por canela (${bengala.especificacao})` : '—'}`,
  ];

  if (geracao.alertasBancada && geracao.alertasBancada.length > 0) {
    linhas.push(`----------------------------------------`, `⚠️ ATENÇÃO NESTA GERAÇÃO:`);
    for (const alerta of geracao.alertasBancada) {
      linhas.push(`• ${alerta}`);
    }
  }

  return linhas.join('\n');
}

export function FichaTecnicaPage() {
  const { marca, modelo, geracao } = useMotoSelecionada();
  const [copiado, setCopiado] = useState(false);
  const [buscaTorque, setBuscaTorque] = useState('');
  const [unidadeTorque, setUnidadeTorque] = useState<'ambos' | 'nm' | 'kgfm'>('ambos');

  const def = SECTIONS.find((s) => s.id === 'ficha-tecnica') ?? SECTIONS[0];
  const ficha = geracao.fichaTecnica;

  const torquesFiltrados = useMemo(() => {
    const lista = ficha.torques ?? [];
    const termo = buscaTorque.trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter(
      (t) =>
        t.item.toLowerCase().includes(termo) ||
        (t.observacao ?? '').toLowerCase().includes(termo) ||
        (t.categoria ?? '').toLowerCase().includes(termo),
    );
  }, [ficha.torques, buscaTorque]);

  if (!def) return null;

  const handleCopiarFicha = async () => {
    const texto = montarTextoResumo(modelo, geracao);
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2400);
    } catch {
      // Fallback para contextos sem permissão de clipboard
      const area = document.createElement('textarea');
      area.value = texto;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2400);
    }
  };

  // Valores formatados para o Hero Grid de Leitura Rápida
  const oleo = ficha.fluidos?.oleoMotor;
  const oleoVolumePrincipal = oleo
    ? oleo.capacidadeTrocaComFiltroL
      ? `${formatNumero(oleo.capacidadeTrocaL)} L / ${formatNumero(oleo.capacidadeTrocaComFiltroL)} L`
      : `${formatNumero(oleo.capacidadeTrocaL)} L`
    : '—';

  const admLabel = formatFaixa(ficha.folgas?.valvulaAdmissaoMm);
  const escLabel = formatFaixa(ficha.folgas?.valvulaEscapeMm);

  const vela = ficha.eletrica?.vela;
  const pDiant = ficha.pneus?.dianteiro;
  const pTras = ficha.pneus?.traseiro;
  const relacao = ficha.transmissaoFinal;
  const bengala = ficha.fluidos?.fluidoBengala;
  const isCvt = ficha.cambio.tipo === 'cvt' || relacao?.tipo === 'correia';

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section={def}>
        {ficha.versaoReferencia && (
          <Badge variant="outline" className="px-2.5 py-1">
            Ref: {ficha.versaoReferencia}
          </Badge>
        )}
        <Button
          variant={copiado ? 'default' : 'secondary'}
          size="sm"
          onClick={handleCopiarFicha}
          className="gap-1.5"
        >
          {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copiado ? 'Copiado!' : 'Copiar Ficha Resumida'}
        </Button>
      </SectionHeader>

      {/* ------------------------------------------------------------------ */}
      {/* Hero Grid — 6 Cards de Leitura Rápida de Bancada (1 metro de dist) */}
      {/* ------------------------------------------------------------------ */}
      <section aria-label="Leitura rápida de bancada">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Leitura Rápida de Bancada · Especificações Críticas
          </h2>
          <span className="font-mono text-xs text-muted-foreground">Motor frio (&lt; 35 °C)</span>
        </div>

        <motion.div
          variants={HERO_STAGGER}
          initial="hidden"
          animate="visible"
          className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* 1. Óleo do Motor */}
          <SpotlightCard marca={marca} intensity="subtle" className="p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Óleo do Motor
              </span>
              <Droplets className="size-4 text-primary" />
            </div>
            <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {oleoVolumePrincipal}
            </p>
            <p className="mt-1 text-xs font-medium text-primary">
              {oleo?.especificacao ?? 'Consulte aba Motor & Fluidos'}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {oleo?.capacidadeTrocaComFiltroL
                ? `Sem filtro: ${formatNumero(oleo.capacidadeTrocaL)} L · Com filtro: ${formatNumero(oleo.capacidadeTrocaComFiltroL)} L`
                : `Desmontagem total: ${oleo?.capacidadeTotalL ? `${formatNumero(oleo.capacidadeTotalL)} L` : '—'}`}
            </p>
          </SpotlightCard>

          {/* 2. Folga de Válvulas */}
          <SpotlightCard marca={marca} intensity="subtle" className="p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Folga de Válvulas (Frio)
              </span>
              <SlidersHorizontal className="size-4 text-primary" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-lg border bg-background/50 px-2.5 py-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Admissão</span>
                <p className="font-mono text-lg font-bold text-foreground sm:text-xl">{admLabel}</p>
              </div>
              <div className="rounded-lg border bg-background/50 px-2.5 py-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Escape</span>
                <p className="font-mono text-lg font-bold text-foreground sm:text-xl">{escLabel}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {ficha.motorDetalhes?.comando ?? ficha.motor}
            </p>
          </SpotlightCard>

          {/* 3. Vela NGK */}
          <SpotlightCard marca={marca} intensity="subtle" className="p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Vela de Ignição (NGK)
              </span>
              <Flame className="size-4 text-primary" />
            </div>
            <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {vela?.modelo.replace(/^NGK\s+/i, '') ?? '—'}
            </p>
            <p className="mt-1 text-xs font-medium text-primary">
              Folga do eletrodo: <span className="font-mono">{formatFaixa(vela?.folgaEletrodoMm)}</span>
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {vela?.iridiumAlternativa
                ? `Opção Iridium: ${vela.iridiumAlternativa}`
                : vela?.alternativas?.length
                  ? `Equivalente: ${vela.alternativas.join(', ')}`
                  : 'Conferir rosca e grau térmico'}
            </p>
          </SpotlightCard>

          {/* 4. Calibragem de Pneus */}
          <SpotlightCard marca={marca} intensity="subtle" className="p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Calibragem Pneus (PSI)
              </span>
              <CircleDot className="size-4 text-primary" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-lg border bg-background/50 px-2.5 py-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">1 Pessoa ( D / T )</span>
                <p className="font-mono text-lg font-bold text-foreground sm:text-xl">
                  {pDiant?.pressaoPsi ?? '—'} / {pTras?.pressaoPsi ?? '—'} <span className="text-xs font-normal">PSI</span>
                </p>
              </div>
              <div className="rounded-lg border bg-background/50 px-2.5 py-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">C/ Garupa ( D / T )</span>
                <p className="font-mono text-lg font-bold text-foreground sm:text-xl">
                  {pDiant?.pressaoComGarupaPsi ?? pDiant?.pressaoPsi ?? '—'} /{' '}
                  {pTras?.pressaoComGarupaPsi ?? pTras?.pressaoPsi ?? '—'}{' '}
                  <span className="text-xs font-normal">PSI</span>
                </p>
              </div>
            </div>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              D: {pDiant?.medida ?? '—'} · T: {pTras?.medida ?? '—'}
            </p>
          </SpotlightCard>

          {/* 5. Relação / CVT */}
          <SpotlightCard marca={marca} intensity="subtle" className="p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {isCvt ? 'Transmissão CVT' : 'Kit Relação & Corrente'}
              </span>
              <Cog className="size-4 text-primary" />
            </div>
            {isCvt ? (
              <>
                <p className="mt-2 font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Correia V-Belt
                </p>
                <p className="mt-1 text-xs font-medium text-primary">
                  {relacao?.cvtDetalhe?.roletesMedidaPeso ?? 'Variador + Roletes centrífugos'}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Óleo redutor final:{' '}
                  {ficha.fluidos?.oleoTransmissaoCvt
                    ? `${formatNumero(ficha.fluidos.oleoTransmissaoCvt.capacidadeL * 1000)} ml (${ficha.fluidos.oleoTransmissaoCvt.especificacao})`
                    : '—'}
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {relacao?.pinhaoDentes ?? '—'}Z × {relacao?.coroaDentes ?? '—'}Z
                </p>
                <p className="mt-1 text-xs font-medium text-primary">
                  Folga da corrente: <span className="font-mono">{formatFaixa(ficha.folgas?.folgaCorrenteMm)}</span>
                </p>
                <p className="mt-1.5 font-mono text-xs text-muted-foreground">{relacao?.corrente ?? 'Passo 428'}</p>
              </>
            )}
          </SpotlightCard>

          {/* 6. Fluido de Bengala */}
          <SpotlightCard marca={marca} intensity="subtle" className="p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Fluido de Bengala
              </span>
              <Wrench className="size-4 text-primary" />
            </div>
            <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {bengala ? `${bengala.volumePorCanelaMl} ml` : '—'}{' '}
              <span className="text-sm font-sans font-normal text-muted-foreground">/ canela</span>
            </p>
            <p className="mt-1 text-xs font-medium text-primary">
              {bengala?.especificacao ?? 'Fork Oil 10W / ATF'}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {bengala?.observacao
                ? bengala.observacao
                : bengala?.nivelMm
                  ? `Nível da câmara de ar: ${bengala.nivelMm} mm`
                  : 'Medir com mola removida e tubo comprimido'}
            </p>
          </SpotlightCard>
        </motion.div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Banner "Atenção neste Ano / Geração" (Dicas de Ouro de Bancada)    */}
      {/* ------------------------------------------------------------------ */}
      {geracao.alertasBancada && geracao.alertasBancada.length > 0 && (
        <section
          aria-label="Atenção neste ano e geração"
          className="relative overflow-hidden rounded-2xl border-2 border-amber-500/45 bg-amber-500/[0.08] p-4 sm:p-5"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle className="size-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-amber-300 sm:text-lg">
                  Atenção neste Ano / Geração ({modelo.nome} {geracao.anosLabel})
                </h3>
                <p className="text-xs text-amber-200/80">
                  Dicas práticas de oficina e particularidades mecânicas de {geracao.nomeGeracao}
                </p>
              </div>
              {geracao.versoes && (
                <div className="ml-auto flex flex-wrap gap-1.5">
                  {geracao.versoes.map((v) => (
                    <Badge key={v} variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-200">
                      {v}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <ul className="grid gap-2.5 pt-1 md:grid-cols-2">
              {geracao.alertasBancada.map((alerta) => (
                <li
                  key={alerta}
                  className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-background/55 p-3 text-sm leading-relaxed text-foreground/95"
                >
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-400" />
                  <span>{alerta}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4 Abas Técnicas Organizadas                                        */}
      {/* ------------------------------------------------------------------ */}
      <Tabs defaultValue="motor-fluidos" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/80 p-1.5">
          <TabsTrigger value="motor-fluidos" className="flex-1 py-2 sm:flex-initial">
            <Droplets className="size-4" />
            Motor & Fluidos
          </TabsTrigger>
          <TabsTrigger value="chassi-freios" className="flex-1 py-2 sm:flex-initial">
            <Disc3 className="size-4" />
            Chassi, Freios & Transmissão
          </TabsTrigger>
          <TabsTrigger value="ignicao-eletrica" className="flex-1 py-2 sm:flex-initial">
            <Zap className="size-4" />
            Ignição & Elétrica
          </TabsTrigger>
          <TabsTrigger value="torques" className="flex-1 py-2 sm:flex-initial">
            <Wrench className="size-4" />
            Torques Rápidos ({ficha.torques?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: MOTOR & FLUIDOS */}
        <TabsContent value="motor-fluidos" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Cog className="size-5 text-primary" />
                  Motor, Comando & Alimentação
                </CardTitle>
                <CardDescription>
                  Arquitetura mecânica, folgas de válvulas a frio e sistema de combustível
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <SpecRow
                  icon={Gauge}
                  label="Cilindrada & Diâmetro × Curso"
                  valor={cilindradaLabel(ficha.cilindradaCc)}
                  detalhe={
                    ficha.motorDetalhes?.diametroCursoMm
                      ? `${formatNumero(ficha.motorDetalhes.diametroCursoMm.diametro)} × ${formatNumero(
                          ficha.motorDetalhes.diametroCursoMm.curso,
                        )} mm · Taxa ${ficha.motorDetalhes.taxaCompressao ?? '—'}`
                      : undefined
                  }
                  mono
                />
                <SpecRow
                  icon={Settings2}
                  label="Arquitetura / Comando"
                  valor={ficha.motorDetalhes?.comando ?? ficha.motor}
                  detalhe={`Arrefecimento a ${ARREFECIMENTO_LABEL[ficha.arrefecimento].toLowerCase()}`}
                />
                <SpecRow
                  icon={SlidersHorizontal}
                  label="Válvula de Admissão (Frio)"
                  valor={admLabel}
                  detalhe="Medir com motor abaixo de 35 °C no PMS"
                  mono
                />
                <SpecRow
                  icon={SlidersHorizontal}
                  label="Válvula de Escape (Frio)"
                  valor={escLabel}
                  detalhe="Medir com motor abaixo de 35 °C no PMS"
                  mono
                />
                <SpecRow
                  icon={Fuel}
                  label={`Alimentação (${ALIMENTACAO_LABEL[ficha.alimentacao]})`}
                  valor={COMBUSTIVEL_LABEL[ficha.combustivel]}
                  detalhe={ficha.motorDetalhes?.alimentacaoDetalhe}
                />
                <SpecRow
                  icon={Gauge}
                  label="Marcha Lenta & Potência"
                  valor={formatFaixa(ficha.motorDetalhes?.marchaLentaRpm)}
                  detalhe={`${ficha.motorDetalhes?.potencia ?? ''} ${
                    ficha.motorDetalhes?.torque ? `· ${ficha.motorDetalhes.torque}` : ''
                  }`}
                  mono
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Droplets className="size-5 text-primary" />
                  Fluidos, Capacidades & Filtragem
                </CardTitle>
                <CardDescription>Volumes exatos de abastecimento na troca e desmontagem</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <SpecRow
                  icon={Droplets}
                  label="Óleo do Motor (Especificação)"
                  valor={oleo?.especificacao ?? '—'}
                  detalhe={oleo?.observacao}
                />
                <SpecRow
                  icon={Droplets}
                  label="Volume de Óleo (Troca / Total)"
                  valor={
                    oleo
                      ? `${formatNumero(oleo.capacidadeTrocaL)} L troca${
                          oleo.capacidadeTrocaComFiltroL
                            ? ` · ${formatNumero(oleo.capacidadeTrocaComFiltroL)} L c/ filtro`
                            : ''
                        }`
                      : '—'
                  }
                  detalhe={
                    oleo?.capacidadeTotalL
                      ? `Motor seco / desmontagem: ${formatNumero(oleo.capacidadeTotalL)} L`
                      : undefined
                  }
                  mono
                />
                <SpecRow
                  icon={Settings2}
                  label="Sistema de Filtro de Óleo"
                  valor={ficha.motorDetalhes?.filtroOleo ?? '—'}
                />
                <SpecRow
                  icon={Fuel}
                  label="Tanque de Combustível"
                  valor={ficha.fluidos?.tanqueL ? `${formatNumero(ficha.fluidos.tanqueL)} Litros` : '—'}
                  detalhe={
                    ficha.fluidos?.reservaL ? `Reserva: ${formatNumero(ficha.fluidos.reservaL)} L` : undefined
                  }
                  mono
                />
                {ficha.fluidos?.oleoTransmissaoCvt && (
                  <SpecRow
                    icon={Cog}
                    label="Óleo Transmissão Final (CVT)"
                    valor={`${formatNumero(ficha.fluidos.oleoTransmissaoCvt.capacidadeL * 1000)} ml (${formatNumero(
                      ficha.fluidos.oleoTransmissaoCvt.capacidadeL,
                    )} L)`}
                    detalhe={ficha.fluidos.oleoTransmissaoCvt.especificacao}
                    mono
                  />
                )}
                {ficha.fluidos?.liquidoArrefecimento && (
                  <SpecRow
                    icon={Droplets}
                    label="Líquido de Arrefecimento"
                    valor={`${formatNumero(ficha.fluidos.liquidoArrefecimento.capacidadeL)} L`}
                    detalhe={ficha.fluidos.liquidoArrefecimento.especificacao}
                    mono
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA 2: CHASSI, FREIOS & TRANSMISSÃO */}
        <TabsContent value="chassi-freios" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Cog className="size-5 text-primary" />
                  Câmbio, Transmissão Final & Folgas de Cabos
                </CardTitle>
                <CardDescription>Relação coroa/pinhão ou correia CVT e ajustes de manetes/pedais</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <SpecRow label="Câmbio" valor={cambioLabel(ficha.cambio)} />
                {isCvt ? (
                  <>
                    <SpecRow
                      label="Correia CVT"
                      valor={relacao?.cvtDetalhe?.correiaCodigo ?? 'V-Belt'}
                      detalhe={
                        relacao?.cvtDetalhe?.larguraLimiteMm
                          ? `Limite de desgaste (largura): ${formatNumero(relacao.cvtDetalhe.larguraLimiteMm)} mm`
                          : undefined
                      }
                      mono
                    />
                    <SpecRow
                      label="Roletes do Variador"
                      valor={relacao?.cvtDetalhe?.roletesMedidaPeso ?? '6 roletes centrífugos'}
                      detalhe="Substituir se apresentarem faces planas (calos)"
                    />
                  </>
                ) : (
                  <>
                    <SpecRow
                      label="Relação (Pinhão × Coroa)"
                      valor={`${relacao?.pinhaoDentes ?? '—'} dentes × ${relacao?.coroaDentes ?? '—'} dentes`}
                      detalhe={`Corrente: ${relacao?.corrente ?? '—'}`}
                      mono
                    />
                    <SpecRow
                      label="Folga Livre da Corrente"
                      valor={formatFaixa(ficha.folgas?.folgaCorrenteMm)}
                      detalhe="Medir no ponto central inferior da balança"
                      mono
                    />
                    <SpecRow
                      label="Folga do Manete de Embreagem"
                      valor={formatFaixa(ficha.folgas?.folgaManeteEmbreagemMm)}
                      detalhe={
                        ficha.cambio.tipo === 'semiautomatico'
                          ? 'Câmbio semiautomático: ajuste no parafuso lateral da tampa direita'
                          : 'Medir na extremidade da manopla/manete'
                      }
                      mono
                    />
                  </>
                )}
                <SpecRow
                  label="Folga Livre do Acelerador"
                  valor={formatFaixa(ficha.folgas?.folgaAceleradorMm)}
                  detalhe="Conferir com guidão esterçado de batente a batente"
                  mono
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Disc3 className="size-5 text-primary" />
                  Suspensão, Freios & Pneus
                </CardTitle>
                <CardDescription>Bengalas, fluido hidráulico e medidas/calibragem dos pneus</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <SpecRow
                  icon={Wrench}
                  label="Fluido da Bengala (Por Canela)"
                  valor={bengala ? `${bengala.volumePorCanelaMl} ml por canela` : '—'}
                  detalhe={`${bengala?.especificacao ?? ''}${
                    bengala?.nivelMm ? ` · Nível: ${bengala.nivelMm} mm` : ''
                  }${bengala?.observacao ? ` · ${bengala.observacao}` : ''}`}
                  mono
                />
                <SpecRow
                  icon={Disc3}
                  label="Sistema de Freios (D / T)"
                  valor={`${FREIO_LABEL[ficha.freios.dianteiro]} / ${FREIO_LABEL[ficha.freios.traseiro]} (${
                    SISTEMA_FREIO_LABEL[ficha.freios.sistema]
                  })`}
                  detalhe={`Fluido recomendado: ${ficha.fluidos?.fluidoFreio ?? '—'}`}
                />
                <SpecRow
                  icon={CircleDot}
                  label="Pneu Dianteiro"
                  valor={pDiant?.medida ?? '—'}
                  detalhe={`Pressão a frio: ${pDiant?.pressaoPsi ?? '—'} PSI (solo) / ${
                    pDiant?.pressaoComGarupaPsi ?? pDiant?.pressaoPsi ?? '—'
                  } PSI (c/ garupa)${pDiant?.tipo ? ` · ${pDiant.tipo}` : ''}`}
                  mono
                />
                <SpecRow
                  icon={CircleDot}
                  label="Pneu Traseiro"
                  valor={pTras?.medida ?? '—'}
                  detalhe={`Pressão a frio: ${pTras?.pressaoPsi ?? '—'} PSI (solo) / ${
                    pTras?.pressaoComGarupaPsi ?? '—'
                  } PSI (c/ garupa)${pTras?.tipo ? ` · ${pTras.tipo}` : ''}`}
                  mono
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA 3: IGNIÇÃO & ELÉTRICA */}
        <TabsContent value="ignicao-eletrica" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="size-5 text-primary" />
                Ignição, Bateria, Carga & Iluminação
              </CardTitle>
              <CardDescription>Parâmetros para diagnóstico com multímetro e reposição elétrica</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SpecRow
                icon={Flame}
                label="Vela de Ignição Padrão"
                valor={vela?.modelo ?? '—'}
                detalhe={
                  vela?.iridiumAlternativa
                    ? `Alternativa Iridium: ${vela.iridiumAlternativa}`
                    : vela?.alternativas?.length
                      ? `Alternativas: ${vela.alternativas.join(', ')}`
                      : undefined
                }
                mono
              />
              <SpecRow
                icon={SlidersHorizontal}
                label="Folga do Eletrodo da Vela"
                valor={formatFaixa(vela?.folgaEletrodoMm)}
                detalhe="Conferir com cálibre de lâminas antes de instalar"
                mono
              />
              <SpecRow
                icon={BatteryCharging}
                label="Bateria (Código / Capacidade)"
                valor={
                  ficha.eletrica?.bateria
                    ? `${ficha.eletrica.bateria.modelo} (${ficha.eletrica.bateria.tensaoV}V ${ficha.eletrica.bateria.capacidadeAh}Ah)`
                    : '—'
                }
                detalhe={`Partida: ${PARTIDA_LABEL[ficha.partida]}`}
                mono
              />
              <SpecRow
                icon={Zap}
                label="Tensão de Carga (Retificador / Estator)"
                valor={ficha.eletrica?.bateria?.tensaoCargaV ?? '13,5V – 14,8V @ 5.000 rpm'}
                detalhe="Medir nos bornes da bateria com farol aceso a 5.000 rpm"
                mono
              />
              <SpecRow
                icon={Zap}
                label="Fusível Principal & Secundários"
                valor={ficha.eletrica?.fusivelPrincipalA ? `Principal: ${ficha.eletrica.fusivelPrincipalA}A` : '—'}
                detalhe={
                  ficha.eletrica?.fusiveisSecundarios
                    ? `Secundários: ${ficha.eletrica.fusiveisSecundarios}`
                    : 'Sempre substituir por fusível da mesma amperagem'
                }
                mono
              />
              <SpecRow
                icon={Sparkles}
                label="Farol Dianteiro"
                valor={ficha.eletrica?.lampadaFarol ?? '—'}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 4: TORQUES RÁPIDOS */}
        <TabsContent value="torques" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="size-5 text-primary" />
                  Tabela de Torques Críticos — {modelo.nome} ({geracao.anosLabel})
                </CardTitle>
                <CardDescription>
                  Valores de aperto do manual de serviço em N·m e kgf·m (roscas limpas e secas, salvo observação)
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border bg-background p-0.5 text-xs">
                  {(
                    [
                      { id: 'ambos', label: 'N·m + kgf·m' },
                      { id: 'nm', label: 'Apenas N·m' },
                      { id: 'kgfm', label: 'Apenas kgf·m' },
                    ] as const
                  ).map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setUnidadeTorque(op.id)}
                      className={cn(
                        'rounded-md px-2.5 py-1 font-medium transition-colors',
                        unidadeTorque === op.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={buscaTorque}
                  onChange={(e) => setBuscaTorque(e.target.value)}
                  placeholder="Filtrar por fixador (ex: bujão, vela, eixo, pinça, coroa)..."
                  className="pl-9"
                />
              </div>

              {torquesFiltrados.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum torque encontrado para “{buscaTorque}”.
                </p>
              ) : (
                <div className="grid gap-2.5 md:grid-cols-2">
                  {torquesFiltrados.map((t) => {
                    const nm = t.torque.valor;
                    const kgfm = nmParaKgfm(nm);
                    return (
                      <div
                        key={t.item}
                        className="flex items-center justify-between gap-3 rounded-xl border bg-background/45 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{t.item}</p>
                            {t.categoria && (
                              <Badge variant="outline" className="text-[10px] uppercase">
                                {t.categoria}
                              </Badge>
                            )}
                          </div>
                          {t.observacao && <p className="mt-0.5 text-xs text-muted-foreground">{t.observacao}</p>}
                        </div>

                        <div className="shrink-0 text-right font-mono">
                          {(unidadeTorque === 'ambos' || unidadeTorque === 'nm') && (
                            <p className="text-lg font-bold text-primary">{nm} N·m</p>
                          )}
                          {(unidadeTorque === 'ambos' || unidadeTorque === 'kgfm') && (
                            <p
                              className={cn(
                                unidadeTorque === 'kgfm'
                                  ? 'text-lg font-bold text-primary'
                                  : 'text-xs text-muted-foreground',
                              )}
                            >
                              {kgfm}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
