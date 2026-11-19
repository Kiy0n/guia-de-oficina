import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowLeft, Check, ChevronRight, CircleGauge, Search, Undo2, Wrench, X } from 'lucide-react';

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

const STEPS: { step: Step; label: string }[] = [
  { step: 1, label: 'Fabricante' },
  { step: 2, label: 'Modelo' },
  { step: 3, label: 'Ano / Geração' },
];

/** Torna um elemento não-botão acionável por teclado (Enter / Espaço). */
function onActivateKey(action: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };
}

// ---------------------------------------------------------------------------
// Stepper
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
                  'flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors',
                  done && 'cursor-pointer text-foreground hover:bg-accent',
                  active && 'font-semibold text-foreground',
                  !done && !active && 'text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                    done && 'border-primary bg-primary text-primary-foreground',
                    active && 'border-primary text-primary ring-4 ring-primary/20',
                  )}
                >
                  {done ? <Check className="size-4" /> : step}
                </span>
                <span className="truncate">
                  <span className="hidden sm:inline">{step}. </span>
                  {label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span className={cn('h-px flex-1 bg-border', done && 'bg-primary/60')} aria-hidden />
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
      <StepHeader title="Qual moto está na bancada?" subtitle={`Escolha a fabricante — modelos até ${CILINDRADA_MAXIMA}cc.`} />

      <div className="grid gap-4 md:grid-cols-3">
        {MARCAS.map((marca) => {
          const theme = BRAND_THEME[marca];
          const total = contarModelos(marca);
          return (
            <button
              key={marca}
              type="button"
              onClick={() => onMarca(marca)}
              className={cn(
                'group relative flex flex-col items-center gap-5 overflow-hidden rounded-2xl border-2 border-border bg-card px-6 pt-10 pb-6 text-card-foreground transition-all duration-200 outline-none',
                'hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:translate-y-0',
                theme.hoverCard,
              )}
            >
              <span className={cn('absolute inset-x-0 top-0 h-1 opacity-60 transition-opacity group-hover:opacity-100', theme.accent)} />
              <theme.Logo className="w-28 transition-transform duration-200 group-hover:scale-105 sm:w-32" />
              <div className="flex w-full items-center justify-between">
                <span className="text-lg font-semibold">{marca}</span>
                <Badge variant={theme.badge}>
                  {total} {total === 1 ? 'modelo' : 'modelos'}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <SearchField
          label="Busca rápida de modelo"
          value={busca}
          onChange={setBusca}
          onEnter={handleEnter}
          placeholder="Ou digite direto o modelo/ano, ex: CG 160, Intruder, Factor 2019..."
        />

        {busca.trim() && (
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
                      className="flex flex-1 items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-accent"
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
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Passo 2 — Modelo
// ---------------------------------------------------------------------------

function StepModelo({ marca, onVoltar, onModelo }: { marca: Marca; onVoltar: () => void; onModelo: (modelo: Modelo) => void }) {
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modelos.map((modelo) => (
            <Card
              key={modelo.id}
              role="button"
              tabIndex={0}
              onClick={() => onModelo(modelo)}
              onKeyDown={onActivateKey(() => onModelo(modelo))}
              className={cn(
                'cursor-pointer gap-4 border-2 transition-all duration-200 outline-none hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/50',
                theme.hoverCard,
              )}
            >
              <CardHeader>
                <CardTitle className="text-xl">{modelo.nome}</CardTitle>
                <CardDescription>{faixaAnosModelo(modelo)}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  <CircleGauge /> {cilindradaModelo(modelo)}
                </Badge>
                <Badge variant="outline">{CATEGORIA_LABEL[modelo.categoria]}</Badge>
                <span className="ml-auto text-xs text-muted-foreground">
                  {modelo.geracoes.length} {modelo.geracoes.length === 1 ? 'geração' : 'gerações'}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {geracoes.map((g) => {
          const atual = g.id === geracaoAtualId;
          const ficha = g.fichaTecnica;
          return (
            <Card
              key={g.id}
              role="button"
              tabIndex={0}
              onClick={() => onGeracao(g)}
              onKeyDown={onActivateKey(() => onGeracao(g))}
              className={cn(
                'cursor-pointer gap-4 border-2 transition-all duration-200 outline-none hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/50',
                theme.hoverCard,
                atual && theme.border,
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-mono text-3xl tracking-tight">{g.anosLabel}</CardTitle>
                  {atual && <Badge>Atual</Badge>}
                </div>
                <CardDescription className="text-base font-medium text-foreground/90">{g.nomeGeracao}</CardDescription>
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
            </Card>
          );
        })}
      </div>
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
  const [step, setStep] = useState<Step>(() => {
    if (startModelo) return start.step;
    if (start.marca) return start.step === 1 ? 1 : 2;
    return 1;
  });

  const modelo = modeloId ? findModelo(modeloId) : undefined;

  const irPara = (s: Step) => {
    if (s === 1) {
      setStep(1);
    } else if (s === 2 && marca) {
      setStep(2);
    } else if (s === 3 && modelo) {
      setStep(3);
    }
  };

  const escolherMarca = (m: Marca) => {
    if (m !== marca) setModeloId(null);
    setMarca(m);
    setStep(2);
  };

  const escolherModelo = (m: Modelo) => {
    setMarca(m.marca);
    setModeloId(m.id);
    setStep(3);
  };

  return (
    <div className="min-h-screen">
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

        {step === 1 && (
          <StepFabricante
            onMarca={escolherMarca}
            onModelo={escolherModelo}
            onGeracao={(m, g) => selecionarMoto(m.id, g.id)}
          />
        )}

        {step === 2 && marca && <StepModelo marca={marca} onVoltar={() => setStep(1)} onModelo={escolherModelo} />}

        {step === 3 && modelo && (
          <StepGeracao
            modelo={modelo}
            geracaoAtualId={moto?.modelo.id === modelo.id ? moto.geracao.id : undefined}
            onMarca={() => setStep(1)}
            onModelos={() => setStep(2)}
            onGeracao={(g) => selecionarMoto(modelo.id, g.id)}
          />
        )}
      </main>
    </div>
  );
}
