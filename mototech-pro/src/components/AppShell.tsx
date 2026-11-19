import { useState } from 'react';
import { ArrowLeftRight, ChevronRight, Menu, Wrench } from 'lucide-react';

import { ApiStatusIndicator } from '@/components/ApiStatusIndicator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMoto, useMotoSelecionada } from '@/context/MotoContext';
import { BRAND_THEME } from '@/lib/brands';
import { SECTIONS, type SectionId } from '@/lib/sections';
import { cn } from '@/lib/utils';
import { FichaTecnicaPage } from '@/pages/FichaTecnicaPage';
import { SectionPlaceholderPage } from '@/pages/SectionPlaceholderPage';

function SectionContent({ id }: { id: SectionId }) {
  if (id === 'ficha-tecnica') return <FichaTecnicaPage />;
  const def = SECTIONS.find((s) => s.id === id);
  return def ? <SectionPlaceholderPage section={def} /> : null;
}

export function AppShell() {
  const { section, setSection, trocarMoto } = useMoto();
  const moto = useMotoSelecionada();
  const [menuAberto, setMenuAberto] = useState(false);
  const theme = BRAND_THEME[moto.marca];

  const navegar = (id: SectionId) => {
    setSection(id);
    setMenuAberto(false);
    window.scrollTo({ top: 0 });
  };

  const trocar = (inicio: 'fabricante' | 'ano') => {
    setMenuAberto(false);
    trocarMoto(inicio);
  };

  return (
    <div className="min-h-screen">
      {/* ------------------------------------------------------------------ */}
      {/* Header fixo                                                        */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:gap-3 sm:px-6">
          <Button variant="ghost" size="icon" onClick={() => setMenuAberto(true)} aria-label="Abrir menu">
            <Menu className="size-5" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/15 p-1.5 text-primary">
              <Wrench className="size-4" />
            </span>
            <span className="hidden font-bold tracking-tight md:inline">MotoTech Pro</span>
          </div>

          <Separator orientation="vertical" className="mx-1 hidden !h-6 sm:block" />

          <button
            type="button"
            onClick={() => trocar('ano')}
            title="Trocar ano / geração"
            className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-accent"
          >
            <Badge variant={theme.badge}>{moto.marca}</Badge>
            <span className="truncate font-medium">{moto.modelo.nome}</span>
            <span className="hidden font-mono text-muted-foreground sm:inline">• {moto.geracao.anosLabel}</span>
          </button>

          <Button variant="outline" size="sm" onClick={() => trocar('fabricante')} className="shrink-0">
            <ArrowLeftRight />
            <span className="hidden sm:inline">Trocar Moto</span>
          </Button>

          <ApiStatusIndicator className="ml-auto" />
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Menu lateral                                                       */}
      {/* ------------------------------------------------------------------ */}
      <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
        <SheetContent side="left" className="w-80 gap-0 p-0 sm:max-w-80">
          <SheetHeader className="pb-3">
            <SheetTitle className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/15 p-1.5 text-primary">
                <Wrench className="size-4" />
              </span>
              MotoTech Pro
            </SheetTitle>
            <SheetDescription>Navegação da bancada</SheetDescription>
          </SheetHeader>

          <div className="px-4 pb-4">
            <div className={cn('relative overflow-hidden rounded-xl border-2 bg-card p-4', theme.border)}>
              <div className="flex items-start gap-3">
                <theme.Logo emblemOnly className="w-12 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{moto.modelo.nome}</p>
                  <p className="font-mono text-sm text-muted-foreground">{moto.geracao.anosLabel}</p>
                  <p className="truncate text-xs text-muted-foreground">{moto.geracao.nomeGeracao}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => trocar('ano')}>
                <ArrowLeftRight /> Trocar Moto / Ano
              </Button>
            </div>
          </div>

          <Separator />

          <ScrollArea className="min-h-0 flex-1">
            <nav aria-label="Seções" className="flex flex-col gap-1 p-3">
              {SECTIONS.map(({ id, titulo, icon: Icon }, i) => {
                const ativo = id === section;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => navegar(id)}
                    aria-current={ativo ? 'page' : undefined}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                      ativo ? 'bg-primary/15 font-semibold text-primary' : 'text-foreground/85 hover:bg-accent',
                    )}
                  >
                    <span className="w-4 font-mono text-xs text-muted-foreground">{i + 1}</span>
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1">{titulo}</span>
                    <ChevronRight className={cn('size-4 opacity-0 transition-opacity group-hover:opacity-60', ativo && 'opacity-60')} />
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          <Separator />
          <div className="flex items-center justify-between p-4 text-xs text-muted-foreground">
            <span>Dados estáticos · sem login</span>
            <ApiStatusIndicator />
          </div>
        </SheetContent>
      </Sheet>

      {/* ------------------------------------------------------------------ */}
      {/* Conteúdo                                                           */}
      {/* ------------------------------------------------------------------ */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <SectionContent id={section} />
      </main>
    </div>
  );
}
