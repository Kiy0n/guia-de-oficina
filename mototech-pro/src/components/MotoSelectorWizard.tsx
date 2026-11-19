import { useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight, CircleGauge, Search, Undo2, Wrench, X } from 'lucide-react';

import { SpotlightCard } from '@/components/SpotlightCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMoto, type WizardStart } from '@/context/MotoContext';
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
} from '@/utils/catalog';
import { ALIMENTACAO_LABEL, CATEGORIA_LABEL, SISTEMA_FREIO_LABEL } from '@/utils/format';

type Step = 1 | 2 | 3;
type Direction = 1 | -1;

const STEPS: { step: Step; label: string }[] = [
  { step: 1, label: 'Fabricante' },
  { step: 2, label: 'Modelo' },
  { step: 3, label: 'Ano / Geração' },
];

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

function Stepper({ current, onGoTo }: { current: Step; onGoTo: (step: Step) => void }) {
  return (
    <nav aria-label="Progresso da seleção" className="w-full">
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map(({ step, label }, i) => {
          const done = step < current;
          const active = step === current;
          return (
            <li key={step} className="flex flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={!done}
                onClick={() => onGoTo(step)}
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
                  {done ? <Check className="size-4" /> : step}
                </span>
                <span className="relative z-10 truncate">
                  <span className="hidden sm:inline">{step}. </span>
                  {label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
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

function StepFabricante({
  onMarca,
  onModelo,
  onGeracao,
}: {
  onMarca: (marca: Marca) => void;
  onModelo: (modelo: Modelo) => void;
  onGeracao: (modelo: Modelo, geracao: Geracao) => void;
}) {
  const [busca, setBusca] = useState('');
  const resultados = useMemo(() => buscarModelos(busca).slice(0, 8), [busca]);

  const handleEnter = () => {
    const [primeiro] = resultados;
    if (resultados.length !== 1 || !primeiro) return;
    const [unicaGeracao] = primeiro.geracoesNoAno;
    if (primeiro.geracoesNoAno.length === 1 && unicaGeracao) onGeracao(primeiro.modelo, unicaGeracao);
    else onModelo(primeiro.modelo);
  };

  return (
    <div className="flex flex-col gap-8">
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
  const modelos = useMemo(
    () => (filtro.trim() ? buscarModelos(filtro, todos).map((r) => r.modelo) : todos),
    [filtro, todos],
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

      <StepHeader title="Escolha o modelo" subtitle={`${todos.length} modelos ${marca} cadastrados.`}>
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
          {modelos.map((modelo) => (
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
                    {modelo.geracoes.length} {modelo.geracoes.length === 1 ? 'geração' : 'gerações'}
                  </span>
                </CardContent>
              </div>
            </SpotlightCard>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Passo 3 — Ano / Geração
// ---------------------------------------------------------------------------

function StepGeracao({
  modelo,
  geracaoAtualId,
  onMarca,
  onModelos,
  onGeracao,
}: {
  modelo: Modelo;
  geracaoAtualId?: string;
  onMarca: () => void;
  onModelos: () => void;
  onGeracao: (geracao: Geracao) => void;
}) {
  const theme = BRAND_THEME[modelo.marca];
  // Mais recente primeiro: é o caso mais comum na bancada.
  const geracoes = [...modelo.geracoes].sort((a, b) => b.anoInicio - a.anoInicio);

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
          {modelo.nome}
        </button>
        <ChevronRight className="size-4 text-muted-foreground" />
        <span className="text-muted-foreground">Ano / Geração</span>
      </nav>

      <StepHeader
        title={`${modelo.nome}: qual ano?`}
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
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Badge variant="secondary">{ALIMENTACAO_LABEL[ficha.alimentacao]}</Badge>
                    <Badge variant="secondary">Freio {SISTEMA_FREIO_LABEL[ficha.freios.sistema]}</Badge>
                    {g.versoes && <Badge variant="outline">{g.versoes.join(' · ')}</Badge>}
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
  const [marca, setMarca] = useState<Marca | null>(startModelo?.marca ?? start.marca ?? null);
  const [modeloId, setModeloId] = useState<string | null>(startModelo?.id ?? null);
  const [stepState, setStepState] = useState<{ step: Step; direction: Direction }>(() => {
    if (startModelo) return { step: start.step, direction: 1 };
    if (start.marca) return { step: start.step === 1 ? 1 : 2, direction: 1 };
    return { step: 1, direction: 1 };
  });

  const { step, direction } = stepState;
  const modelo = modeloId ? findModelo(modeloId) : undefined;

  const transitionToStep = (nextStep: Step) => {
    setStepState((prev) => ({
      step: nextStep,
      direction: nextStep >= prev.step ? 1 : -1,
    }));
  };

  const irPara = (s: Step) => {
    if (s === 1) {
      transitionToStep(1);
    } else if (s === 2 && marca) {
      transitionToStep(2);
    } else if (s === 3 && modelo) {
      transitionToStep(3);
    }
  };

  const escolherMarca = (m: Marca) => {
    if (m !== marca) setModeloId(null);
    setMarca(m);
    transitionToStep(2);
  };

  const escolherModelo = (m: Modelo) => {
    setMarca(m.marca);
    setModeloId(m.id);
    transitionToStep(3);
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/15 p-1.5 text-primary">
              <Wrench className="size-5" />
            </span>
            <span className="font-bold tracking-tight">MotoTech Pro</span>
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
        <Stepper current={step} onGoTo={irPara} />

        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step-1"
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

          {step === 2 && marca && (
            <motion.div
              key={`step-2-${marca}`}
              custom={direction}
              variants={STEP_SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <StepModelo marca={marca} onVoltar={() => transitionToStep(1)} onModelo={escolherModelo} />
            </motion.div>
          )}

          {step === 3 && modelo && (
            <motion.div
              key={`step-3-${modelo.id}`}
              custom={direction}
              variants={STEP_SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <StepGeracao
                modelo={modelo}
                geracaoAtualId={moto?.modelo.id === modelo.id ? moto.geracao.id : undefined}
                onMarca={() => transitionToStep(1)}
                onModelos={() => transitionToStep(2)}
                onGeracao={(g) => selecionarMoto(modelo.id, g.id)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
