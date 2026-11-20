import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CalendarClock,
  Check,
  CheckCheck,
  Clock,
  Copy,
  Filter,
  RotateCcw,
  ShieldAlert,
  Wrench,
} from 'lucide-react';

import {
  AlertaArmadilha,
  LegendaDificuldade,
  SeloDificuldade,
} from '@/components/DidaticaOficinaUi';
import { SectionHeader } from '@/components/SectionHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useMotoSelecionada } from '@/context/MotoContext';
import { useToast } from '@/context/ToastContext';
import {
  CATEGORIA_ACAO_META,
  gerarPlanoRevisoes,
  getCicloKmGeracao,
  getDescricaoCicloRevisao,
  getDiretrizesTempoUsoSevero,
  type MarcoRevisaoKm,
} from '@/data/revisoes';
import { SECTIONS } from '@/lib/sections';
import { cn } from '@/lib/utils';
import type { CategoriaAcaoRevisao, Geracao, Modelo } from '@/types/moto';
import { getArquiteturaMoto } from '@/utils/arquiteturaMoto';

const CATEGORIAS_FILTRO: readonly ('TODAS' | CategoriaAcaoRevisao)[] = [
  'TODAS',
  'TROCAR',
  'LIMPAR_LUBRIFICAR',
  'REGULAR',
  'CHECAR',
];

function getChecklistStorageKey(modeloId: string, geracaoId: string, km: number): string {
  return `guia-oficina:checklist:v1:${modeloId}:${geracaoId}:${km}`;
}

function lerChecklistSalvo(storageKey: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, boolean>;
    }
    return {};
  } catch {
    return {};
  }
}

function montarTextoWhatsApp(
  modelo: Modelo,
  geracao: Geracao,
  marco: MarcoRevisaoKm,
  marcados: Record<string, boolean>,
): string {
  const total = marco.itens.length;
  const concluidos = marco.itens.filter((i) => Boolean(marcados[i.id])).length;
  const pct = total > 0 ? Math.round((concluidos / total) * 100) : 0;

  const linhas = [
    `🛠️ *GUIA DE OFICINA — CHECKLIST DE REVISÃO*`,
    `*Moto:* ${modelo.marca} ${modelo.nome} (${geracao.anosLabel})`,
    `*Geração:* ${geracao.nomeGeracao}`,
    `*Revisão:* ${marco.labelKm} (${marco.subtitulo})`,
    `*Progresso:* ${concluidos}/${total} itens (${pct}%)`,
    `----------------------------------------`,
  ];

  for (const item of marco.itens) {
    const ok = Boolean(marcados[item.id]);
    const emoji = ok ? '✅' : '⬜';
    const cat = CATEGORIA_ACAO_META[item.categoria].label;
    linhas.push(`${emoji} *[${cat}]* ${item.titulo}`);
    linhas.push(`   ↳ _${item.detalheTecnico}_`);
  }

  linhas.push(`----------------------------------------`);
  linhas.push(`⏱️ Tempo estimado de bancada: ~${marco.tempoTotalMin} min`);
  return linhas.join('\n');
}

export function ManualRevisoesPage() {
  const { marca, modelo, geracao } = useMotoSelecionada();
  const { mostrarToast } = useToast();
  const def = SECTIONS.find((s) => s.id === 'manual-revisoes') ?? SECTIONS[1];

  const plano = useMemo(() => gerarPlanoRevisoes(modelo, geracao), [modelo, geracao]);
  const arq = useMemo(() => getArquiteturaMoto(modelo, geracao), [modelo, geracao]);
  const cicloKm = useMemo(
    () => getCicloKmGeracao(marca, geracao.id),
    [marca, geracao.id],
  );
  const descricaoCiclo = useMemo(
    () => getDescricaoCicloRevisao(modelo, geracao),
    [modelo, geracao],
  );
  const diretrizesSevero = useMemo(
    () => getDiretrizesTempoUsoSevero(modelo, geracao),
    [modelo, geracao],
  );

  const [kmSelecionado, setKmSelecionado] = useState<number>(() => plano[0]?.km ?? 1000);
  const [filtroCategoria, setFiltroCategoria] = useState<'TODAS' | CategoriaAcaoRevisao>('TODAS');
  const [copiado, setCopiado] = useState(false);

  // Caso o usuário troque de marca (ex: Honda 6.000 km -> Yamaha 5.000 km), garante um km válido
  const marcoAtivo = useMemo(
    () => plano.find((m) => m.km === kmSelecionado) ?? plano[0],
    [plano, kmSelecionado],
  );

  const kmEfetivo = marcoAtivo?.km ?? 1000;
  const storageKey = getChecklistStorageKey(modelo.id, geracao.id, kmEfetivo);

  const [marcados, setMarcados] = useState<Record<string, boolean>>(() => lerChecklistSalvo(storageKey));

  useEffect(() => {
    setMarcados(lerChecklistSalvo(storageKey));
  }, [storageKey]);

  const salvarMarcados = (novo: Record<string, boolean>) => {
    setMarcados(novo);
    try {
      localStorage.setItem(storageKey, JSON.stringify(novo));
    } catch {
      // Ignora erro de quota do localStorage
    }
  };

  if (!def || !marcoAtivo) return null;

  const totalItens = marcoAtivo.itens.length;
  const itensConcluidos = marcoAtivo.itens.filter((i) => Boolean(marcados[i.id])).length;
  const percentual = totalItens > 0 ? Math.round((itensConcluidos / totalItens) * 100) : 0;

  const itensVisiveis =
    filtroCategoria === 'TODAS'
      ? marcoAtivo.itens
      : marcoAtivo.itens.filter((i) => i.categoria === filtroCategoria);

  const alternarItem = (id: string) => {
    salvarMarcados({
      ...marcados,
      [id]: !marcados[id],
    });
  };

  const marcarTodos = () => {
    const todos: Record<string, boolean> = {};
    for (const item of marcoAtivo.itens) {
      todos[item.id] = true;
    }
    salvarMarcados(todos);
  };

  const limparMarcacoes = () => {
    const anterior = { ...marcados };
    const tinhaAlgum = Object.values(anterior).some(Boolean);
    salvarMarcados({});
    if (tinhaAlgum) {
      mostrarToast({
        dedupeKey: 'limpar-checklist-revisao',
        titulo: `Marcações da revisão ${marcoAtivo.labelKm} limpas`,
        variante: 'aviso',
        acaoDesfazer: () => {
          salvarMarcados(anterior);
        },
      });
    }
  };

  const copiarWhatsApp = async () => {
    const texto = montarTextoWhatsApp(modelo, geracao, marcoAtivo, marcados);
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      mostrarToast({
        dedupeKey: 'copiar-checklist-revisao',
        titulo: 'Checklist de revisão copiado para WhatsApp!',
        variante: 'sucesso',
        duracaoMs: 2200,
      });
      window.setTimeout(() => setCopiado(false), 2400);
    } catch {
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

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section={def}>
        <Button
          variant={copiado ? 'default' : 'secondary'}
          size="sm"
          onClick={copiarWhatsApp}
          className="gap-1.5"
        >
          {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copiado ? 'Checklist Copiado!' : 'Copiar Checklist (WhatsApp)'}
        </Button>
      </SectionHeader>

      {/* ------------------------------------------------------------------ */}
      {/* Seletor de Quilometragem da Revisão                                */}
      {/* ------------------------------------------------------------------ */}
      <LegendaDificuldade />

      <section aria-label="Intervalos de revisão por quilometragem" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Plano Oficial {marca} {modelo.nome} ({geracao.anosLabel}) · Escolha a Quilometragem
          </h2>
          <span className="text-xs text-muted-foreground">{descricaoCiclo}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {plano.map((marco) => {
            const ativo = marco.km === marcoAtivo.km;
            const salvosMarco =
              marco.km === marcoAtivo.km
                ? marcados
                : lerChecklistSalvo(getChecklistStorageKey(modelo.id, geracao.id, marco.km));
            const concluidosMarco = marco.itens.filter((i) => Boolean(salvosMarco[i.id])).length;
            const completo = concluidosMarco === marco.itens.length && marco.itens.length > 0;

            return (
              <button
                key={marco.km}
                type="button"
                onClick={() => setKmSelecionado(marco.km)}
                aria-pressed={ativo}
                className={cn(
                  'group relative flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all',
                  ativo
                    ? 'border-primary bg-primary/12 shadow-sm'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-accent/50',
                )}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="font-mono text-lg font-bold tracking-tight text-foreground">
                    {marco.labelKm}
                  </span>
                  {completo ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <Check className="size-3.5" />
                    </span>
                  ) : concluidosMarco > 0 ? (
                    <span className="font-mono text-[11px] font-semibold text-primary">
                      {concluidosMarco}/{marco.itens.length}
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  ou {marco.mesesReferencia} {marco.mesesReferencia === 1 ? 'mês' : 'meses'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Cabeçalho do Marco Ativo + Barra de Progresso + Ações Rápidas      */}
      {/* ------------------------------------------------------------------ */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="font-mono text-sm">{marcoAtivo.labelKm}</Badge>
                <Badge variant="outline">ou {marcoAtivo.mesesReferencia} meses</Badge>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="size-3" /> ~{marcoAtivo.tempoTotalMin} min de bancada
                </Badge>
              </div>
              <CardTitle className="mt-2 text-xl sm:text-2xl">{marcoAtivo.subtitulo}</CardTitle>
              <CardDescription className="mt-1">{marcoAtivo.destaqueOficina}</CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={marcarTodos}
                disabled={itensConcluidos === totalItens}
                className="gap-1.5"
              >
                <CheckCheck className="size-4" />
                Marcar Todos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={limparMarcacoes}
                disabled={itensConcluidos === 0}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-4" />
                Limpar Marcações
              </Button>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="mt-4 flex flex-col gap-2 rounded-xl border bg-background/60 p-3.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                Progresso da Revisão de {marcoAtivo.labelKm}
              </span>
              <span className="font-mono font-bold text-primary">
                {itensConcluidos} de {totalItens} itens concluídos — {percentual}%
              </span>
            </div>
            <Progress value={percentual} />
          </div>

          {/* Filtros Rápidos por Categoria Visual de Ação */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-1">
            <span className="mr-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Filter className="size-3.5" />
              Filtrar ação:
            </span>
            {CATEGORIAS_FILTRO.map((cat) => {
              const ativo = filtroCategoria === cat;
              const qtd =
                cat === 'TODAS'
                  ? marcoAtivo.itens.length
                  : marcoAtivo.itens.filter((i) => i.categoria === cat).length;

              if (cat === 'TODAS') {
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFiltroCategoria('TODAS')}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                      ativo
                        ? 'border-orange-600/40 bg-orange-500/15 font-semibold text-orange-800 dark:border-orange-500/45 dark:bg-orange-500/15 dark:text-orange-400'
                        : 'border-border bg-background/60 text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Todos ({qtd})
                  </button>
                );
              }

              const meta = CATEGORIA_ACAO_META[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFiltroCategoria(cat)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all',
                    ativo ? meta.badgeClass + ' ring-2 ring-primary/40' : 'border-border bg-background/60 text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span className={cn('size-2 rounded-full', meta.dotClass)} />
                  {meta.label} ({qtd})
                </button>
              );
            })}
          </div>
        </CardHeader>

        {/* Lista de Itens do Checklist */}
        <CardContent className="flex flex-col gap-2.5">
          {itensVisiveis.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum item nesta categoria para a revisão de {marcoAtivo.labelKm}.
            </p>
          ) : (
            itensVisiveis.map((item) => {
              const concluido = Boolean(marcados[item.id]);
              const meta = CATEGORIA_ACAO_META[item.categoria];

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => alternarItem(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      alternarItem(item.id);
                    }
                  }}
                  className={cn(
                    'group flex cursor-pointer items-start gap-3.5 rounded-xl border p-3.5 transition-all select-none',
                    concluido
                      ? 'border-emerald-500/30 bg-emerald-500/[0.06] opacity-80'
                      : 'border-border bg-background/50 hover:border-primary/40 hover:bg-accent/40',
                  )}
                >
                  <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={concluido}
                      onCheckedChange={() => alternarItem(item.id)}
                      aria-label={item.titulo}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-wide',
                          meta.badgeClass,
                        )}
                      >
                        <span className={cn('size-1.5 rounded-full', meta.dotClass)} />
                        {meta.label}
                      </span>

                      <h3
                        className={cn(
                          'text-sm font-semibold text-foreground sm:text-base',
                          concluido && 'line-through text-muted-foreground',
                        )}
                      >
                        {item.titulo}
                      </h3>

                      <SeloDificuldade nivel={item.dificuldade} compacto />

                      <div className="ml-auto flex items-center gap-2">
                        {item.criticidade === 'alta' && (
                          <Badge variant="outline" className="border-amber-500/40 text-[10px] text-amber-300">
                            Crítico
                          </Badge>
                        )}
                        <span className="font-mono text-xs text-muted-foreground">~{item.tempoEstimadoMin} min</span>
                      </div>
                    </div>

                    <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      <Wrench className="mt-0.5 size-3.5 shrink-0 text-primary/80" />
                      <span>{item.detalheTecnico}</span>
                    </p>

                    <AlertaArmadilha armadilha={item.armadilha} compacto className="mt-2.5" />
                  </div>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Seção "Manutenção por Tempo / Uso Severo"                          */}
      {/* ------------------------------------------------------------------ */}
      <Card className="border-amber-500/30 bg-card/80">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <CalendarClock className="size-5" />
            </span>
            <div>
              <CardTitle className="text-lg">Manutenção por Tempo & Regime de Uso Severo</CardTitle>
              <CardDescription>
                Prazos máximos por meses (mesmo sem atingir a quilometragem) e redução de intervalo para trabalho/entregas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3.5 md:grid-cols-2">
          {diretrizesSevero.map((d) => (
            <div key={d.id} className="flex flex-col gap-2 rounded-xl border bg-background/55 p-4">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-foreground">{d.titulo}</h4>
                <ShieldAlert className="size-4 shrink-0 text-amber-400" />
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <p className="text-emerald-300">
                  <strong className="font-semibold">Uso Normal:</strong> {d.prazoNormal}
                </p>
                <p className="text-amber-300">
                  <strong className="font-semibold">Uso Severo (Entregas / Poeira / Trânsito):</strong> {d.prazoSevero}
                </p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{d.explicacao}</p>
            </div>
          ))}

          <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/[0.06] p-4 md:col-span-2">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="text-xs leading-relaxed text-foreground/90 sm:text-sm">
              <strong>Lembrete de Bancada para {modelo.marca} {modelo.nome} ({geracao.anosLabel}):</strong>{' '}
              {marca === 'Honda' &&
                `Mesmo com o ciclo oficial de ${cicloKm.toLocaleString('pt-BR')} km após a 1ª revisão, em uso urbano severo ou entregas no Brasil recomenda-se realizar troca intermediária do óleo (${geracao.fichaTecnica.fluidos?.oleoMotor?.especificacao ?? 'especificação do manual'}) na metade do intervalo e manter a limpeza do filtro centrífugo e tela a cada 12.000 km.`}
              {marca === 'Yamaha' &&
                (arq.tipoFiltroOleo === 'papel_externo'
                  ? `No ciclo Yamaha de ${cicloKm.toLocaleString('pt-BR')} km, realize troca intermediária de óleo aos 2.500 km em trânsito urbano severo e substitua regularmente o elemento de papel do filtro de óleo.`
                  : `No ciclo Yamaha de ${cicloKm.toLocaleString('pt-BR')} km desta geração, faça trocas rigorosas de óleo dentro do prazo e mantenha a tela metálica interna limpa (este motor não utiliza elemento de papel).`)}
              {marca === 'Suzuki' &&
                'O motor Suzuki SOHC trabalha em rotação mais alta e o cárter comporta menos de 1 litro (0,85 a 0,95 L): respeitar rigorosamente o intervalo de 3.000 km, trocar o elemento de papel do filtro e conferir o nível pelo visor de vidro no cavalete central.'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
