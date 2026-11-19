import { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  CloudOff,
  Copy,
  Database,
  Loader2,
  Search,
  ShoppingCart,
  Wrench,
} from 'lucide-react';

import { SectionHeader } from '@/components/SectionHeader';
import { SpotlightCard } from '@/components/SpotlightCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useFerramentas } from '@/context/FerramentasContext';
import { useMoto, useMotoSelecionada } from '@/context/MotoContext';
import {
  CATALOGO_FERRAMENTAS,
  CATEGORIA_FERRAMENTA_LABEL,
  NIVEL_FERRAMENTA_INFO,
  type CategoriaFerramenta,
  type ItemFerramenta,
  type NivelFerramenta,
} from '@/data/ferramentas';
import { PROCEDIMENTOS_OFICINA } from '@/data/procedimentos';
import { SECTIONS } from '@/lib/sections';
import { cn } from '@/lib/utils';

type FiltroPosse = 'todas' | 'tenho' | 'faltam';

export function KitFerramentasPage() {
  const moto = useMotoSelecionada();
  const { setSection } = useMoto();
  const {
    possuiFerramenta,
    toggleFerramenta,
    definirListaFerramentas,
    statusSincronizacao,
  } = useFerramentas();

  const [nivelFiltro, setNivelFiltro] = useState<NivelFerramenta | 'todos'>('todos');
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaFerramenta | 'todas'>('todas');
  const [posseFiltro, setPosseFiltro] = useState<FiltroPosse>('todas');
  const [busca, setBusca] = useState<string>('');
  const [copiadoLista, setCopiadoLista] = useState<boolean>(false);

  const def = SECTIONS.find((s) => s.id === 'ferramentas') ?? SECTIONS[0];

  // Mapa de quais procedimentos cada ferramenta desbloqueia
  const procedimentosPorFerramenta = useMemo(() => {
    const mapa = new Map<string, string[]>();
    for (const proc of PROCEDIMENTOS_OFICINA) {
      for (const f of proc.ferramentasExatas) {
        if (!f.ferramentaId) continue;
        const atual = mapa.get(f.ferramentaId) ?? [];
        if (!atual.includes(proc.titulo)) {
          atual.push(proc.titulo);
          mapa.set(f.ferramentaId, atual);
        }
      }
    }
    return mapa;
  }, []);

  // Estatísticas de progresso geral e por nível
  const estatisticas = useMemo(() => {
    const total = CATALOGO_FERRAMENTAS.length;
    const possuidasTotal = CATALOGO_FERRAMENTAS.filter((f) => possuiFerramenta(f.id)).length;
    const pctGeral = total > 0 ? Math.round((possuidasTotal / total) * 100) : 0;

    const porNivel = (['essencial', 'intermediario', 'avancado'] as const).map((nivel) => {
      const itens = CATALOGO_FERRAMENTAS.filter((f) => f.nivel === nivel);
      const t = itens.length;
      const p = itens.filter((f) => possuiFerramenta(f.id)).length;
      return {
        nivel,
        total: t,
        possuidas: p,
        pct: t > 0 ? Math.round((p / t) * 100) : 0,
      };
    });

    return {
      total,
      possuidasTotal,
      pctGeral,
      porNivel,
    };
  }, [possuiFerramenta]);

  const ferramentasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return CATALOGO_FERRAMENTAS.filter((item) => {
      if (nivelFiltro !== 'todos' && item.nivel !== nivelFiltro) return false;
      if (categoriaFiltro !== 'todas' && item.categoria !== categoriaFiltro) return false;

      const tem = possuiFerramenta(item.id);
      if (posseFiltro === 'tenho' && !tem) return false;
      if (posseFiltro === 'faltam' && tem) return false;

      if (!termo) return true;

      const procs = procedimentosPorFerramenta.get(item.id) ?? [];
      const texto = [
        item.nome,
        item.especificacao,
        item.paraQueServe,
        ...procs,
      ]
        .join(' ')
        .toLowerCase();

      return texto.includes(termo);
    });
  }, [
    nivelFiltro,
    categoriaFiltro,
    posseFiltro,
    busca,
    possuiFerramenta,
    procedimentosPorFerramenta,
  ]);

  if (!def) return null;

  const copiarListaComprasWhatsApp = async () => {
    const faltantes = CATALOGO_FERRAMENTAS.filter((item) => {
      if (nivelFiltro !== 'todos' && item.nivel !== nivelFiltro) return false;
      return !possuiFerramenta(item.id);
    });

    const tituloNivel =
      nivelFiltro === 'todos'
        ? 'Completa (Níveis 1, 2 e 3)'
        : NIVEL_FERRAMENTA_INFO[nivelFiltro].titulo;

    const linhas: string[] = [
      `🧰 *MOTOTECH PRO — LISTA DE COMPRAS DE FERRAMENTAS*`,
      `Filtro: ${tituloNivel}`,
      `Foco: ${moto.marca} ${moto.modelo.nome} (${moto.geracao.anosLabel})`,
      `----------------------------------------`,
    ];

    if (faltantes.length === 0) {
      linhas.push(`✅ Você já possui todas as ferramentas deste nível!`);
    } else {
      faltantes.forEach((item, idx) => {
        linhas.push(
          `${idx + 1}. *${item.nome}*`,
          `   • Medida: ${item.especificacao}`,
          `   • Faixa estimada: ${item.faixaPrecoEstimada}`,
        );
      });
    }

    const texto = linhas.join('\n');
    try {
      await navigator.clipboard.writeText(texto);
      setCopiadoLista(true);
      window.setTimeout(() => setCopiadoLista(false), 2500);
    } catch {
      const area = document.createElement('textarea');
      area.value = texto;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      setCopiadoLista(true);
      window.setTimeout(() => setCopiadoLista(false), 2500);
    }
  };

  const marcarNivelCompleto = (nivel: NivelFerramenta) => {
    const idsNivel = CATALOGO_FERRAMENTAS.filter((f) => f.nivel === nivel).map((f) => f.id);
    const atuais = CATALOGO_FERRAMENTAS.filter((f) => possuiFerramenta(f.id)).map((f) => f.id);
    const todosJaMarcados = idsNivel.every((id) => atuais.includes(id));

    if (todosJaMarcados) {
      definirListaFerramentas(atuais.filter((id) => !idsNivel.includes(id)));
    } else {
      definirListaFerramentas([...atuais, ...idsNivel]);
    }
  };

  const renderCardFerramenta = (item: ItemFerramenta) => {
    const tem = possuiFerramenta(item.id);
    const infoNivel = NIVEL_FERRAMENTA_INFO[item.nivel];
    const desbloqueia = procedimentosPorFerramenta.get(item.id) ?? [];

    return (
      <SpotlightCard
        key={item.id}
        marca={moto.marca}
        intensity="subtle"
        className={cn(
          'flex flex-col justify-between p-4 transition-all',
          tem && 'border-emerald-500/40 bg-emerald-500/5',
        )}
      >
        <div className="space-y-3">
          {/* Topo: Checkbox + Nome + Badge de Nível */}
          <div className="flex items-start justify-between gap-2.5">
            <label className="flex cursor-pointer items-start gap-2.5">
              <Checkbox
                checked={tem}
                onCheckedChange={() => toggleFerramenta(item.id)}
                className="mt-1"
              />
              <div>
                <p
                  className={cn(
                    'text-sm font-bold leading-snug',
                    tem ? 'text-emerald-300' : 'text-foreground',
                  )}
                >
                  {item.nome}
                </p>
                <p className="mt-0.5 font-mono text-xs text-primary">{item.especificacao}</p>
              </div>
            </label>

            <Badge variant="outline" className={cn('shrink-0 text-[10px]', infoNivel.badgeClass)}>
              {item.nivel === 'essencial'
                ? 'Essencial'
                : item.nivel === 'intermediario'
                  ? 'Intermediário'
                  : 'Avançado'}
            </Badge>
          </div>

          {/* Para que serve */}
          <p className="text-xs leading-relaxed text-muted-foreground">{item.paraQueServe}</p>

          {/* Quais procedimentos ela desbloqueia */}
          {desbloqueia.length > 0 && (
            <div className="rounded-lg border border-border/60 bg-background/55 p-2.5">
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Usada em {desbloqueia.length}{' '}
                {desbloqueia.length === 1 ? 'procedimento' : 'procedimentos'}:
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {desbloqueia.slice(0, 3).map((tituloProc) => (
                  <button
                    key={tituloProc}
                    type="button"
                    onClick={() => setSection('procedimentos')}
                    className="max-w-full truncate rounded-md border border-border/70 bg-card px-2 py-0.5 text-[11px] text-foreground/85 transition-colors hover:border-primary/50 hover:text-primary"
                    title={`Ir para Procedimentos: ${tituloProc}`}
                  >
                    {tituloProc}
                  </button>
                ))}
                {desbloqueia.length > 3 && (
                  <span className="px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
                    +{desbloqueia.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Card: Categoria + Preço estimado + Status */}
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {CATEGORIA_FERRAMENTA_LABEL[item.categoria]}
            </Badge>
            <span className="font-mono text-muted-foreground">{item.faixaPrecoEstimada}</span>
          </div>

          <button
            type="button"
            onClick={() => toggleFerramenta(item.id)}
            className={cn(
              'inline-flex items-center gap-1 font-medium transition-colors',
              tem
                ? 'text-emerald-400 hover:text-emerald-300'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tem ? (
              <>
                <CheckCircle2 className="size-3.5" />
                Já tenho
              </>
            ) : (
              <>
                <ShoppingCart className="size-3.5" />
                Falta comprar
              </>
            )}
          </button>
        </div>
      </SpotlightCard>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section={def}>
        {/* Badge de sincronização com data/oficina.json */}
        <Badge
          variant="outline"
          className={cn(
            'gap-1.5 px-2.5 py-1 text-xs',
            statusSincronizacao === 'sincronizado' &&
              'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
            statusSincronizacao === 'salvando' &&
              'border-sky-500/40 bg-sky-500/10 text-sky-300',
            statusSincronizacao === 'offline' &&
              'border-amber-500/40 bg-amber-500/10 text-amber-300',
          )}
        >
          {statusSincronizacao === 'sincronizado' && (
            <>
              <Database className="size-3.5" />
              Salvo em data/oficina.json
            </>
          )}
          {statusSincronizacao === 'salvando' && (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Sincronizando...
            </>
          )}
          {statusSincronizacao === 'offline' && (
            <>
              <CloudOff className="size-3.5" />
              Espelho local (offline)
            </>
          )}
        </Badge>

        <Button
          type="button"
          variant={copiadoLista ? 'default' : 'secondary'}
          size="sm"
          onClick={() => void copiarListaComprasWhatsApp()}
          className="gap-1.5"
        >
          {copiadoLista ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copiadoLista ? 'Lista Copiada!' : 'Copiar Lista de Compras (WhatsApp)'}
        </Button>
      </SectionHeader>

      {/* ------------------------------------------------------------------ */}
      {/* Painel Resumo do Inventário Pessoal                                */}
      {/* ------------------------------------------------------------------ */}
      <Card className="border-primary/25 bg-card/85">
        <CardHeader className="pb-3">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="size-5 text-primary" />
                Progresso da Sua Bancada: {estatisticas.possuidasTotal} de {estatisticas.total}{' '}
                ferramentas ({estatisticas.pctGeral}%)
              </CardTitle>
              <CardDescription>
                Marque as ferramentas que você já possui — elas destravam automaticamente os
                procedimentos compatíveis.
              </CardDescription>
            </div>
          </div>
          <Progress value={estatisticas.pctGeral} className="mt-2 h-2.5" />
        </CardHeader>

        <CardContent className="grid gap-3 sm:grid-cols-3">
          {estatisticas.porNivel.map(({ nivel, total, possuidas, pct }) => {
            const info = NIVEL_FERRAMENTA_INFO[nivel];
            return (
              <div
                key={nivel}
                className="flex flex-col justify-between rounded-xl border bg-background/55 p-3.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground">{info.titulo}</span>
                    <span className="font-mono text-xs font-semibold text-primary">
                      {possuidas}/{total} ({pct}%)
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                    {info.subtitulo}
                  </p>
                </div>
                <div className="mt-3 space-y-2">
                  <Progress value={pct} className="h-1.5" />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => marcarNivelCompleto(nivel)}
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      {possuidas === total ? 'Desmarcar nível' : 'Marcar nível completo'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Barra de Filtros (Busca, Posse, Nível e Categoria)                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card/75 p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder='Buscar por chave, medida ou serviço (ex.: "19 mm", "cálibre", "castelo", "lixa 160", "DOT 4")...'
              className="pl-9"
            />
          </div>

          {/* Filtro de posse */}
          <div className="flex items-center gap-1 rounded-xl border bg-background/60 p-1">
            {(
              [
                { id: 'todas', label: `Todas (${estatisticas.total})` },
                { id: 'tenho', label: `Já tenho (${estatisticas.possuidasTotal})` },
                {
                  id: 'faltam',
                  label: `Faltam comprar (${estatisticas.total - estatisticas.possuidasTotal})`,
                },
              ] as const
            ).map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setPosseFiltro(op.id)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                  posseFiltro === op.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro de Nível + Categoria */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              variant={nivelFiltro === 'todos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNivelFiltro('todos')}
              className="h-8 text-xs"
            >
              Todos os Níveis
            </Button>
            {(['essencial', 'intermediario', 'avancado'] as const).map((n) => (
              <Button
                key={n}
                type="button"
                variant={nivelFiltro === n ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNivelFiltro(n)}
                className="h-8 text-xs"
              >
                {NIVEL_FERRAMENTA_INFO[n].titulo}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              variant={categoriaFiltro === 'todas' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCategoriaFiltro('todas')}
              className="h-7 text-xs"
            >
              Todas Categorias
            </Button>
            {(Object.keys(CATEGORIA_FERRAMENTA_LABEL) as CategoriaFerramenta[]).map((cat) => (
              <Button
                key={cat}
                type="button"
                variant={categoriaFiltro === cat ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setCategoriaFiltro(cat)}
                className="h-7 text-xs"
              >
                {CATEGORIA_FERRAMENTA_LABEL[cat]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Listagem de Ferramentas                                            */}
      {/* ------------------------------------------------------------------ */}
      {ferramentasFiltradas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma ferramenta encontrada com os filtros selecionados.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setNivelFiltro('todos');
                setCategoriaFiltro('todas');
                setPosseFiltro('todas');
                setBusca('');
              }}
            >
              Limpar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ferramentasFiltradas.map(renderCardFerramenta)}
        </div>
      )}
    </div>
  );
}
