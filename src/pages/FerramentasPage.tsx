import { useMemo, useState } from 'react';
import { Search, Wrench } from 'lucide-react';

import { SectionHeader } from '@/components/SectionHeader';
import { SpotlightCard } from '@/components/SpotlightCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

export function FerramentasPage() {
  const moto = useMotoSelecionada();
  const { setSection } = useMoto();

  const [nivelFiltro, setNivelFiltro] = useState<NivelFerramenta | 'todos'>('todos');
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaFerramenta | 'todas'>('todas');
  const [busca, setBusca] = useState<string>('');

  const def = SECTIONS.find((s) => s.id === 'ferramentas') ?? SECTIONS[0];

  // Mapa de quais procedimentos utilizam cada ferramenta
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

  const contagemPorNivel = useMemo(() => {
    const counts: Record<NivelFerramenta, number> = {
      essencial: 0,
      intermediario: 0,
      avancado: 0,
    };
    for (const item of CATALOGO_FERRAMENTAS) {
      counts[item.nivel] += 1;
    }
    return counts;
  }, []);

  const ferramentasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return CATALOGO_FERRAMENTAS.filter((item) => {
      if (nivelFiltro !== 'todos' && item.nivel !== nivelFiltro) return false;
      if (categoriaFiltro !== 'todas' && item.categoria !== categoriaFiltro) return false;
      if (!termo) return true;

      const procs = procedimentosPorFerramenta.get(item.id) ?? [];
      const texto = [item.nome, item.especificacao, item.paraQueServe, ...procs]
        .join(' ')
        .toLowerCase();

      return texto.includes(termo);
    });
  }, [nivelFiltro, categoriaFiltro, busca, procedimentosPorFerramenta]);

  if (!def) return null;

  const renderCardFerramenta = (item: ItemFerramenta) => {
    const infoNivel = NIVEL_FERRAMENTA_INFO[item.nivel];
    const procedimentos = procedimentosPorFerramenta.get(item.id) ?? [];

    return (
      <SpotlightCard
        key={item.id}
        marca={moto.marca}
        intensity="subtle"
        className="flex flex-col justify-between p-4 transition-all"
      >
        <div className="space-y-3">
          {/* Topo: Ícone + Nome + Medidas + Badge de Nível */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex min-w-0 items-start gap-2.5">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Wrench className="size-4" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold leading-snug text-foreground">{item.nome}</h3>
                <p className="mt-0.5 font-mono text-xs text-primary">{item.especificacao}</p>
              </div>
            </div>

            <Badge variant="outline" className={cn('shrink-0 text-[10px]', infoNivel.badgeClass)}>
              {infoNivel.curto}
            </Badge>
          </div>

          {/* Para que serve */}
          <p className="text-xs leading-relaxed text-muted-foreground">{item.paraQueServe}</p>

          {/* Em quais procedimentos é utilizada */}
          {procedimentos.length > 0 && (
            <div className="rounded-lg border border-border/60 bg-background/55 p-2.5">
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Usada em {procedimentos.length}{' '}
                {procedimentos.length === 1 ? 'procedimento' : 'procedimentos'}:
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {procedimentos.slice(0, 3).map((tituloProc) => (
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
                {procedimentos.length > 3 && (
                  <span className="px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
                    +{procedimentos.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Card: Categoria */}
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
          <Badge variant="secondary" className="text-[10px]">
            {CATEGORIA_FERRAMENTA_LABEL[item.categoria]}
          </Badge>
          <span className="text-[11px] text-muted-foreground">{infoNivel.titulo}</span>
        </div>
      </SpotlightCard>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section={def}>
        <Badge variant="outline" className="gap-1.5 px-2.5 py-1 font-mono text-xs">
          <Wrench className="size-3.5 text-primary" />
          {CATALOGO_FERRAMENTAS.length} ferramentas técnicas
        </Badge>
      </SectionHeader>

      {/* ------------------------------------------------------------------ */}
      {/* Barra de Filtros (Busca, Nível e Categoria)                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card/75 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder='Buscar por chave, medida ou serviço (ex.: "19 mm", "cálibre", "castelo", "lixa 160", "DOT 4")...'
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              variant={nivelFiltro === 'todos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNivelFiltro('todos')}
              className="h-8 text-xs"
            >
              Todas ({CATALOGO_FERRAMENTAS.length})
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
                {NIVEL_FERRAMENTA_INFO[n].curto} ({contagemPorNivel[n]})
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
