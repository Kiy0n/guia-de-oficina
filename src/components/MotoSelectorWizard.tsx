import { useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleGauge,
  Clock,
  Eye,
  Search,
  Star,
  Undo2,
  Wrench,
  X,
} from 'lucide-react';

import { SpotlightCard } from '@/components/SpotlightCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMoto, type WizardStart } from '@/context/MotoContext';
import { usePreferencias } from '@/context/PreferenciasContext';
import { BRAND_THEME } from '@/lib/brands';
import { cn } from '@/lib/utils';
import { CILINDRADA_MAXIMA, MARCAS, type Geracao, type Marca, type Modelo } from '@/types/moto';
import {
  buscarModelos,
  cilindradaModelo,
  contarModelos,
  faixaAnosModelo,
  findModelo,
  getModelosPorMarca,
  resolverSelecao,
} from '@/utils/catalog';
import {
  getFamiliaMoto,
  MODELOS_OCULTOS_NO_GRID_DE_MODELOS,
  resolverContextoFamiliaInicial,
  resolverGeracoesVersaoFamilia,
  type FamiliaMotoConfig,
  type VersaoFamiliaMoto,
} from '@/utils/motoFamilias';
import { ALIMENTACAO_LABEL, CATEGORIA_LABEL, SISTEMA_FREIO_LABEL } from '@/utils/format';
import { getCandidatosImagemMoto } from '@/utils/imagensMoto';

type StepId = 'fabricante' | 'modelo' | 'versao' | 'geracao';
type Direction = 1 | -1;

interface StepDef {
  id: StepId;
  num: number;
  label: string;
}

function buildSteps(hasVersaoStep: boolean): StepDef[] {
  if (hasVersaoStep) {
    return [
      { id: 'fabricante', num: 1, label: 'Fabricante' },
      { id: 'modelo', num: 2, label: 'Modelo' },
      { id: 'versao', num: 3, label: 'Versão' },
      { id: 'geracao', num: 4, label: 'Ano / Geração' },
    ];
  }
  return [
    { id: 'fabricante', num: 1, label: 'Fabricante' },
    { id: 'modelo', num: 2, label: 'Modelo' },
    { id: 'geracao', num: 3, label: 'Ano / Geração' },
  ];
}

function stepOrder(step: StepId): number {
  switch (step) {
    case 'fabricante':
      return 1;
    case 'modelo':
      return 2;
    case 'versao':
      return 3;
    case 'geracao':
      return 4;
  }
}

// Curva cubic-bezier cinematográfica estilo Canva
const CANVA_EASE = [0.22, 1, 0.36, 1] as const;

const STEP_SLIDE_VARIANTS: Variants = {
  enter: (direction: Direction) => ({
    x: direction > 0 ? 56 : -56,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: CANVA_EASE,
    },
  },
  exit: (direction: Direction) => ({
    x: direction > 0 ? -56 : 56,
    opacity: 0,
    scale: 0.975,
    transition: {
      duration: 0.26,
      ease: CANVA_EASE,
    },
  }),
};

const STAGGER_GRID_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

// ---------------------------------------------------------------------------
// Stepper com indicador ativo animado via layoutId
// ---------------------------------------------------------------------------

function Stepper({
  steps,
  current,
  onGoTo,
}: {
  steps: readonly StepDef[];
  current: StepId;
  onGoTo: (step: StepId) => void;
}) {
  const currentOrd = stepOrder(current);

  return (
    <nav aria-label="Progresso da seleção" className="w-full">
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map(({ id, num, label }, i) => {
          const done = stepOrder(id) < currentOrd;
          const active = id === current;
          return (
            <li key={id} className="flex flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={!done}
                onClick={() => onGoTo(id)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'relative flex min-w-0 items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm transition-colors',
                  done && 'cursor-pointer text-foreground hover:bg-accent/70',
                  active && 'font-semibold text-foreground',
                  !done && !active && 'text-muted-foreground',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="wizard-stepper-active-pill"
                    className="pointer-events-none absolute inset-0 rounded-xl bg-primary/10 ring-1 ring-primary/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span
                  className={cn(
                    'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors',
                    done && 'border-primary bg-primary text-primary-foreground',
                    active && 'border-primary text-primary',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="wizard-stepper-active-ring"
                      className="pointer-events-none absolute -inset-1 rounded-full ring-4 ring-primary/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {done ? <Check className="size-4" /> : num}
                </span>
                <span className="relative z-10 truncate">{label}</span>
              </button>
              {i < steps.length - 1 && (
                <span className="relative h-px flex-1 overflow-hidden bg-border" aria-hidden>
                  <motion.span
                    initial={false}
                    animate={{ scaleX: done ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: CANVA_EASE }}
                    className="absolute inset-0 origin-left bg-primary/70"
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Campo de busca reutilizável
// ---------------------------------------------------------------------------

function SearchField({
  value,
  onChange,
  placeholder,
  autoFocus,
  onEnter,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  onEnter?: () => void;
  label: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEnter?.();
          if (e.key === 'Escape') onChange('');
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="h-11 pr-10 pl-9 text-base"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Limpar busca"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

function StepHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Passo 1 — Fabricante
// ---------------------------------------------------------------------------

function derivarPistaIdentificacao(modelo: Modelo, g: Geracao): string {
  const f = g.fichaTecnica;
  const pistas: string[] = [];

  if (f.alimentacao === 'carburador') {
    pistas.push('Tem torneirinha de gasolina no tanque (carburador)');
  } else if (modelo.id === 'honda-cg-125') {
    pistas.push('Sem torneirinha · Luz FI no painel · Emblema 125i');
  } else {
    pistas.push('Luz da injeção no painel (sem torneirinha de gasolina)');
  }

  if (f.motor.toLowerCase().includes('ohv') || f.motorDetalhes?.comando?.toLowerCase().includes('vareta')) {
    pistas.push('Motor vareta (OHV) + vela grossa M12');
  }

  if (f.freios.sistema === 'CBS') {
    pistas.push(
      f.freios.dianteiro === 'disco'
        ? 'Pinça dianteira com 2 mangueiras (freio CBS)'
        : 'Freio combinado CBS por cabos',
    );
  } else if (f.freios.sistema === 'ABS') {
    pistas.push('Anel dentado + sensor ABS na roda dianteira');
  } else if (f.freios.sistema === 'UBS') {
    pistas.push('Freio unificado UBS (pedal aciona dianteiro)');
  }

  if (f.eletrica?.lampadaFarol?.toLowerCase().includes('led')) {
    pistas.push('Farol 100% LED');
  }

  if (f.partida === 'pedal') {
    pistas.push('Apenas pedal de partida');
  } else if (f.partida === 'pedal-eletrica') {
    pistas.push('Pedal de partida + botão elétrico');
  }

  if (
    (modelo.marca === 'Yamaha' || modelo.marca === 'Suzuki') &&
    f.fluidos?.oleoMotor?.capacidadeTrocaComFiltroL
  ) {
    pistas.push('Tampinha redonda lateral com 3 parafusos do filtro de papel');
  }

  if (modelo.categoria === 'scooter' || f.cambio.tipo === 'cvt') {
    pistas.push('Transmissão automática CVT (sem marchas)');
  }

  return pistas.slice(0, 2).join(' · ');
}

function StepFabricante({
  onMarca,
  onModelo,
  onGeracao,
}: {
  onMarca: (marca: Marca) => void;
  onModelo: (modelo: Modelo) => void;
  onGeracao: (modelo: Modelo, geracao: Geracao) => void;
}) {
  const { recentes, favoritas, toggleFavorita, isFavorita } = usePreferencias();
  const [busca, setBusca] = useState('');
  const resultados = useMemo(() => buscarModelos(busca).slice(0, 8), [busca]);

  const atalhosRapidos = useMemo(() => {
    const combinados = [...favoritas, ...recentes];
    const vistos = new Set<string>();
    const resolvidos: { modelo: Modelo; geracao: Geracao; favorita: boolean }[] = [];

    for (const item of combinados) {
      const chave = `${item.modeloId}::${item.geracaoId}`;
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      const sel = resolverSelecao(item.modeloId, item.geracaoId);
      if (!sel) continue;
      resolvidos.push({
        modelo: sel.modelo,
        geracao: sel.geracao,
        favorita: isFavorita(item.modeloId, item.geracaoId),
      });
      if (resolvidos.length >= 4) break;
    }

    return resolvidos;
  }, [favoritas, recentes, isFavorita]);

  const handleEnter = () => {
    const [primeiro] = resultados;
    if (resultados.length !== 1 || !primeiro) return;
    const [unicaGeracao] = primeiro.geracoesNoAno;
    if (primeiro.geracoesNoAno.length === 1 && unicaGeracao) onGeracao(primeiro.modelo, unicaGeracao);
    else onModelo(primeiro.modelo);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Faixa "Suas Motos / Últimas na Bancada" em 1 clique */}
      {atalhosRapidos.length > 0 && (
        <section aria-label="Suas motos e recentes" className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
              <Clock className="size-3.5 text-primary" />
              Suas Motos · Últimas na Bancada (1 clique)
            </h3>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {atalhosRapidos.map(({ modelo, geracao, favorita }) => {
              const t = BRAND_THEME[modelo.marca];
              return (
                <div
                  key={`${modelo.id}-${geracao.id}`}
                  className="group relative flex items-center justify-between gap-2 rounded-xl border bg-card/85 p-3 transition-all hover:border-primary/50 hover:bg-accent/40"
                >
                  <button
                    type="button"
                    onClick={() => onGeracao(modelo, geracao)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-1.5">
                      <Badge variant={t.badge} className="px-1.5 py-0 text-[10px]">
                        {modelo.marca}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        {geracao.anosLabel}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-bold text-foreground group-hover:text-primary">
                      {modelo.nome}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {geracao.nomeGeracao}
                    </p>
                  </button>

                  <button
                    type="button"
                    data-compact="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorita(modelo.id, geracao.id);
                    }}
                    title={favorita ? 'Desafixar favorita' : 'Fixar em Minhas Motos'}
                    aria-label={favorita ? 'Desafixar favorita' : 'Fixar em Minhas Motos'}
                    className={cn(
                      'rounded-lg p-1.5 transition-colors hover:bg-accent',
                      favorita ? 'text-amber-400' : 'text-muted-foreground hover:text-amber-400',
                    )}
                  >
                    <Star className={cn('size-4', favorita && 'fill-current')} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <StepHeader
        title="Qual moto está na bancada?"
        subtitle={`Escolha a fabricante — modelos até ${CILINDRADA_MAXIMA}cc.`}
      />

      <motion.div
        variants={STAGGER_GRID_VARIANTS}
        initial="hidden"
        animate="visible"
        className="grid gap-5 md:grid-cols-3"
      >
        {MARCAS.map((marca) => {
          const theme = BRAND_THEME[marca];
          const total = contarModelos(marca);
          return (
            <SpotlightCard
              key={marca}
              marca={marca}
              intensity="featured"
              ariaLabel={`Selecionar fabricante ${marca} (${total} modelos)`}
              onClick={() => onMarca(marca)}
            >
              <div className="flex flex-col items-center gap-6 px-6 pt-10 pb-6">
                <theme.Logo />
                <div className="flex w-full items-center justify-between border-t border-border/60 pt-4">
                  <span className="text-lg font-semibold tracking-tight">{marca}</span>
                  <Badge variant={theme.badge}>
                    {total} {total === 1 ? 'modelo' : 'modelos'}
                  </Badge>
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </motion.div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <SearchField
          label="Busca rápida de modelo"
          value={busca}
          onChange={setBusca}
          onEnter={handleEnter}
          placeholder="Ou digite direto o modelo/ano, ex: CG 160, Intruder, Factor 2019..."
        />

        <AnimatePresence>
          {busca.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <Card className="gap-0 py-2">
                {resultados.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">Nenhum modelo encontrado para “{busca}”.</p>
                ) : (
                  <ul className="divide-y">
                    {resultados.map(({ modelo, geracoesNoAno }) => (
                      <li key={modelo.id} className="flex flex-col gap-2 px-2 py-1 sm:flex-row sm:items-center">
                        <button
                          type="button"
                          onClick={() => onModelo(modelo)}
                          className="flex flex-1 items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent"
                        >
                          <Badge variant={BRAND_THEME[modelo.marca].badge}>{modelo.marca}</Badge>
                          <span className="font-medium">{modelo.nome}</span>
                          <span className="text-sm text-muted-foreground">{faixaAnosModelo(modelo)}</span>
                          <ChevronRight className="ml-auto size-4 text-muted-foreground" />
                        </button>
                        {geracoesNoAno.length > 0 && (
                          <div className="flex flex-wrap gap-2 px-2 pb-2 sm:pb-0">
                            {geracoesNoAno.map((g) => (
                              <Button key={g.id} size="sm" variant="secondary" onClick={() => onGeracao(modelo, g)}>
                                {g.anosLabel}
                              </Button>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Passo 2 — Modelo
// ---------------------------------------------------------------------------

function StepModelo({
  marca,
  onVoltar,
  onModelo,
}: {
  marca: Marca;
  onVoltar: () => void;
  onModelo: (modelo: Modelo) => void;
}) {
  const [filtro, setFiltro] = useState('');
  const todos = useMemo(() => getModelosPorMarca(marca), [marca]);
  const todosVisiveis = useMemo(
    () => todos.filter((m) => !MODELOS_OCULTOS_NO_GRID_DE_MODELOS.has(m.id)),
    [todos],
  );
  const modelos = useMemo(
    () => (filtro.trim() ? buscarModelos(filtro, todos).map((r) => r.modelo) : todosVisiveis),
    [filtro, todos, todosVisiveis],
  );
  const theme = BRAND_THEME[marca];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={onVoltar}>
          <ArrowLeft /> Voltar para Fabricantes
        </Button>
        <Badge variant={theme.badge} className="px-3 py-1 text-sm">
          {marca}
        </Badge>
      </div>

      <StepHeader title="Escolha o modelo" subtitle={`${todosVisiveis.length} modelos ${marca} cadastrados.`}>
        <div className="w-full sm:w-80">
          <SearchField
            label={`Filtrar modelos ${marca}`}
            value={filtro}
            onChange={setFiltro}
            autoFocus
            onEnter={() => {
              const [unico] = modelos;
              if (modelos.length === 1 && unico) onModelo(unico);
            }}
            placeholder="Filtrar modelos..."
          />
        </div>
      </StepHeader>

      {modelos.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Nenhum modelo {marca} corresponde a “{filtro}”.</p>
      ) : (
        <motion.div
          key={filtro.trim() ? 'filtrado' : 'todos'}
          variants={STAGGER_GRID_VARIANTS}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {modelos.map((modelo) => {
            const familia = getFamiliaMoto(modelo.id);
            return (
              <SpotlightCard
                key={modelo.id}
                marca={marca}
                intensity="subtle"
                onClick={() => onModelo(modelo)}
                className="py-5"
              >
                <div className="flex flex-1 flex-col gap-4">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-xl transition-colors group-hover:text-foreground">
                      {modelo.nome}
                    </CardTitle>
                    <CardDescription>{faixaAnosModelo(modelo)}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      <CircleGauge /> {cilindradaModelo(modelo)}
                    </Badge>
                    <Badge variant="outline">{CATEGORIA_LABEL[modelo.categoria]}</Badge>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {familia
                        ? `${familia.versoes.length} versões`
                        : `${modelo.geracoes.length} ${modelo.geracoes.length === 1 ? 'geração' : 'gerações'}`}
                    </span>
                  </CardContent>
                </div>
              </SpotlightCard>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Passo Intermediário Condicional — Versão da Família (Honda CG / Yamaha)
// ---------------------------------------------------------------------------

function StepVersaoFamilia({
  familia,
  onMarca,
  onModelos,
  onVersao,
}: {
  familia: FamiliaMotoConfig;
  onMarca: () => void;
  onModelos: () => void;
  onVersao: (versao: VersaoFamiliaMoto) => void;
}) {
  const theme = BRAND_THEME[familia.marca];
  const gridCols =
    familia.versoes.length === 2
      ? 'sm:grid-cols-2'
      : familia.versoes.length === 3
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : 'sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Seleção atual" className="flex flex-wrap items-center gap-2 text-sm">
        <button type="button" onClick={onMarca} className="rounded-md hover:opacity-80">
          <Badge variant={theme.badge} className="px-3 py-1 text-sm">
            {familia.marca}
          </Badge>
        </button>
        <ChevronRight className="size-4 text-muted-foreground" />
        <button type="button" onClick={onModelos} className="font-medium hover:underline">
          Modelos {familia.marca}
        </button>
        <ChevronRight className="size-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{familia.nomeFamilia}</span>
        <ChevronRight className="size-4 text-muted-foreground" />
        <span className="text-muted-foreground">Versão</span>
      </nav>

      <StepHeader title={`${familia.nomeFamilia}: qual versão?`} subtitle={familia.subtitulo} />

      <motion.div
        variants={STAGGER_GRID_VARIANTS}
        initial="hidden"
        animate="visible"
        className={cn('grid gap-4', gridCols)}
      >
        {familia.versoes.map((versao) => {
          const qtdGeracoes = versao.geracaoIds.length;
          return (
            <SpotlightCard
              key={versao.slug}
              marca={familia.marca}
              intensity="subtle"
              onClick={() => onVersao(versao)}
              className="py-5"
            >
              <div className="flex flex-1 flex-col gap-3">
                <CardHeader className="pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-2xl tracking-tight">
                      {versao.tituloCompleto}
                    </CardTitle>
                  </div>
                  <CardDescription className="font-mono text-sm font-medium text-foreground/80">
                    {versao.anosLabel}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">{versao.resumo}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
                    <Badge variant="secondary" className="text-[11px]">
                      {versao.destaqueBadge}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {qtdGeracoes} {qtdGeracoes === 1 ? 'geração' : 'gerações'}
                    </span>
                  </div>
                </CardContent>
              </div>
            </SpotlightCard>
          );
        })}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Foto de Referência Silenciosa (public/motos/<slug>.webp)
// ---------------------------------------------------------------------------

function MotoFotoReferencia({
  geracaoId,
  versaoSlug,
  alt,
  legenda,
}: {
  geracaoId: string;
  versaoSlug?: string;
  alt: string;
  legenda?: string;
}) {
  const candidatos = useMemo(
    () => getCandidatosImagemMoto(geracaoId, versaoSlug),
    [geracaoId, versaoSlug],
  );
  const [indice, setIndice] = useState(0);
  const [carregada, setCarregada] = useState(false);

  const src = candidatos[indice];
  if (!src) {
    return null;
  }

  return (
    <div
      className={cn(
        'mx-6 overflow-hidden rounded-xl border border-border/60 bg-muted/40 dark:bg-zinc-900/60',
        !carregada && 'hidden',
      )}
    >
      <div className="relative aspect-[16/10] w-full">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setCarregada(true)}
          onError={() => {
            setCarregada(false);
            setIndice((prev) => prev + 1);
          }}
          className="h-full w-full object-contain p-2"
        />
      </div>
      {legenda && (
        <p className="border-t border-border/50 bg-background/60 px-2.5 py-1 text-center text-[11px] font-medium text-muted-foreground">
          {legenda}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Passo 3 — Ano / Geração
// ---------------------------------------------------------------------------

function StepGeracao({
  modelo,
  geracoesExibidas,
  familia,
  versaoFamilia,
  geracaoAtualId,
  onMarca,
  onModelos,
  onVersoes,
  onGeracao,
}: {
  modelo: Modelo;
  geracoesExibidas: readonly Geracao[];
  familia?: FamiliaMotoConfig;
  versaoFamilia?: VersaoFamiliaMoto;
  geracaoAtualId?: string;
  onMarca: () => void;
  onModelos: () => void;
  onVersoes?: () => void;
  onGeracao: (geracao: Geracao) => void;
}) {
  const theme = BRAND_THEME[modelo.marca];
  // Ordem cronológica: do ano mais antigo para o mais recente.
  const geracoes = [...geracoesExibidas].sort(
    (a, b) => a.anoInicio - b.anoInicio || a.anoFim - b.anoFim,
  );
  const tituloContexto = versaoFamilia ? versaoFamilia.tituloCompleto : modelo.nome;

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Seleção atual" className="flex flex-wrap items-center gap-2 text-sm">
        <button type="button" onClick={onMarca} className="rounded-md hover:opacity-80">
          <Badge variant={theme.badge} className="px-3 py-1 text-sm">
            {modelo.marca}
          </Badge>
        </button>
        <ChevronRight className="size-4 text-muted-foreground" />
        <button type="button" onClick={onModelos} className="font-medium hover:underline">
          {familia ? familia.nomeFamilia : modelo.nome}
        </button>
        {familia && versaoFamilia && onVersoes && (
          <>
            <ChevronRight className="size-4 text-muted-foreground" />
            <button type="button" onClick={onVersoes} className="font-medium hover:underline">
              {versaoFamilia.nome}
            </button>
          </>
        )}
        <ChevronRight className="size-4 text-muted-foreground" />
        <span className="text-muted-foreground">Ano / Geração</span>
      </nav>

      <StepHeader
        title={`${tituloContexto}: qual ano?`}
        subtitle="Cada geração tem diferenças mecânicas que mudam peças, torques e procedimentos."
      />

      <motion.div
        variants={STAGGER_GRID_VARIANTS}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {geracoes.map((g) => {
          const atual = g.id === geracaoAtualId;
          const ficha = g.fichaTecnica;
          return (
            <SpotlightCard
              key={g.id}
              marca={modelo.marca}
              intensity="subtle"
              active={atual}
              onClick={() => onGeracao(g)}
              className="py-5"
            >
              <div className="flex flex-1 flex-col gap-4">
                <MotoFotoReferencia
                  geracaoId={g.id}
                  versaoSlug={versaoFamilia?.slug}
                  alt={`${tituloContexto} ${g.anosLabel}`}
                  legenda={`${tituloContexto} · ${g.anosLabel}`}
                />
                <CardHeader className="pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="font-mono text-3xl tracking-tight">{g.anosLabel}</CardTitle>
                    {atual && <Badge>Atual</Badge>}
                  </div>
                  <CardDescription className="text-base font-medium text-foreground/90">
                    {g.nomeGeracao}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <ul className="flex flex-col gap-1.5 text-sm">
                    {g.destaques.map((d) => (
                      <li key={d} className="flex gap-2">
                        <Check className={cn('mt-0.5 size-4 shrink-0', theme.text)} />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-lg border border-primary/25 bg-primary/8 px-2.5 py-2 text-xs">
                    <span className="inline-flex items-center gap-1 font-bold text-primary">
                      <Eye className="size-3.5 shrink-0" />
                      Como reconhecer:
                    </span>{' '}
                    <span className="text-foreground/90">{derivarPistaIdentificacao(modelo, g)}</span>
                  </div>

                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary">{ALIMENTACAO_LABEL[ficha.alimentacao]}</Badge>
                      <Badge variant="secondary">Freio {SISTEMA_FREIO_LABEL[ficha.freios.sistema]}</Badge>
                    </div>
                    {g.versoes && g.versoes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {g.versoes.map((versao) => (
                          <Badge
                            key={versao}
                            variant="outline"
                            className="px-2 py-0.5 text-[11px] font-medium"
                          >
                            {versao}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            </SpotlightCard>
          );
        })}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wizard
// ---------------------------------------------------------------------------

export function MotoSelectorWizard({ start }: { start: WizardStart }) {
  const { moto, selecionarMoto, cancelarTroca } = useMoto();

  const startModelo = start.modeloId ? findModelo(start.modeloId) : undefined;
  const startFamilia = startModelo ? resolverContextoFamiliaInicial(startModelo.id) : null;

  const [marca, setMarca] = useState<Marca | null>(startModelo?.marca ?? start.marca ?? null);
  const [modeloId, setModeloId] = useState<string | null>(
    startFamilia ? startFamilia.familia.familiaModeloId : (startModelo?.id ?? null),
  );
  const [versaoSlug, setVersaoSlug] = useState<string | null>(startFamilia?.versao?.slug ?? null);
  const [stepState, setStepState] = useState<{ step: StepId; direction: Direction }>(() => {
    if (startModelo) {
      if (start.step === 1) return { step: 'fabricante', direction: 1 };
      if (start.step === 2) return { step: 'modelo', direction: 1 };
      if (startFamilia) {
        return { step: startFamilia.versao ? 'geracao' : 'versao', direction: 1 };
      }
      return { step: 'geracao', direction: 1 };
    }
    if (start.marca) {
      return { step: start.step === 1 ? 'fabricante' : 'modelo', direction: 1 };
    }
    return { step: 'fabricante', direction: 1 };
  });

  const { step, direction } = stepState;
  const familia = modeloId ? getFamiliaMoto(modeloId) : undefined;
  const versaoFamilia = familia?.versoes.find((v) => v.slug === versaoSlug);

  const modeloResolvido = useMemo(() => {
    if (versaoFamilia) {
      return resolverGeracoesVersaoFamilia(versaoFamilia);
    }
    const base = modeloId ? findModelo(modeloId) : undefined;
    if (!base) return null;
    return { modelo: base, geracoes: base.geracoes };
  }, [modeloId, versaoFamilia]);

  const stepsVisiveis = useMemo(
    () => buildSteps(Boolean(familia) && (step === 'versao' || step === 'geracao')),
    [familia, step],
  );

  const transitionToStep = (nextStep: StepId) => {
    setStepState((prev) => ({
      step: nextStep,
      direction: stepOrder(nextStep) >= stepOrder(prev.step) ? 1 : -1,
    }));
  };

  const irPara = (s: StepId) => {
    if (s === 'fabricante') {
      transitionToStep('fabricante');
    } else if (s === 'modelo' && marca) {
      transitionToStep('modelo');
    } else if (s === 'versao' && familia) {
      transitionToStep('versao');
    } else if (s === 'geracao' && modeloResolvido) {
      transitionToStep('geracao');
    }
  };

  const escolherMarca = (m: Marca) => {
    if (m !== marca) {
      setModeloId(null);
      setVersaoSlug(null);
    }
    setMarca(m);
    transitionToStep('modelo');
  };

  const escolherModelo = (m: Modelo) => {
    setMarca(m.marca);
    const ctxFamilia = resolverContextoFamiliaInicial(m.id);
    if (ctxFamilia) {
      setModeloId(ctxFamilia.familia.familiaModeloId);
      if (ctxFamilia.versao) {
        // Ex.: usuário buscou direto "CG 160 Start" -> vai direto para os anos da Start
        setVersaoSlug(ctxFamilia.versao.slug);
        transitionToStep('geracao');
      } else {
        setVersaoSlug(null);
        transitionToStep('versao');
      }
      return;
    }

    setModeloId(m.id);
    setVersaoSlug(null);
    transitionToStep('geracao');
  };

  const escolherVersaoFamilia = (versao: VersaoFamiliaMoto) => {
    setVersaoSlug(versao.slug);
    transitionToStep('geracao');
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/15 p-1.5 text-primary">
              <Wrench className="size-5" />
            </span>
            <span className="font-bold tracking-tight">Guia de Oficina</span>
          </div>
          {moto && (
            <Button variant="ghost" size="sm" className="ml-auto" onClick={cancelarTroca}>
              <Undo2 />
              <span className="hidden sm:inline">
                Voltar para {moto.modelo.nome} {moto.geracao.anosLabel}
              </span>
              <span className="sm:hidden">Voltar</span>
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10">
        <Stepper steps={stepsVisiveis} current={step} onGoTo={irPara} />

        <AnimatePresence mode="wait" custom={direction}>
          {step === 'fabricante' && (
            <motion.div
              key="step-fabricante"
              custom={direction}
              variants={STEP_SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <StepFabricante
                onMarca={escolherMarca}
                onModelo={escolherModelo}
                onGeracao={(m, g) => selecionarMoto(m.id, g.id)}
              />
            </motion.div>
          )}

          {step === 'modelo' && marca && (
            <motion.div
              key={`step-modelo-${marca}`}
              custom={direction}
              variants={STEP_SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <StepModelo
                marca={marca}
                onVoltar={() => transitionToStep('fabricante')}
                onModelo={escolherModelo}
              />
            </motion.div>
          )}

          {step === 'versao' && familia && (
            <motion.div
              key={`step-versao-${familia.familiaModeloId}`}
              custom={direction}
              variants={STEP_SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <StepVersaoFamilia
                familia={familia}
                onMarca={() => transitionToStep('fabricante')}
                onModelos={() => transitionToStep('modelo')}
                onVersao={escolherVersaoFamilia}
              />
            </motion.div>
          )}

          {step === 'geracao' && modeloResolvido && (
            <motion.div
              key={`step-geracao-${modeloResolvido.modelo.id}-${versaoFamilia?.slug ?? 'all'}`}
              custom={direction}
              variants={STEP_SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <StepGeracao
                modelo={modeloResolvido.modelo}
                geracoesExibidas={modeloResolvido.geracoes}
                familia={familia}
                versaoFamilia={versaoFamilia}
                geracaoAtualId={
                  moto?.modelo.id === modeloResolvido.modelo.id ? moto.geracao.id : undefined
                }
                onMarca={() => transitionToStep('fabricante')}
                onModelos={() => transitionToStep('modelo')}
                onVersoes={familia ? () => transitionToStep('versao') : undefined}
                onGeracao={(g) => selecionarMoto(modeloResolvido.modelo.id, g.id)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
