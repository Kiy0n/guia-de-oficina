import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftRight,
  BookMarked,
  ChevronRight,
  Clapperboard,
  ClipboardList,
  Gauge,
  Lightbulb,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PlayCircle,
  Star,
  Sun,
  Wrench,
} from 'lucide-react';

import { ApiStatusIndicator } from '@/components/ApiStatusIndicator';
import { ColaRapidaSheet } from '@/components/ColaRapidaSheet';
import { GlossarioSheet } from '@/components/SiglaTooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMoto, useMotoSelecionada } from '@/context/MotoContext';
import { usePreferencias } from '@/context/PreferenciasContext';
import { BRAND_THEME } from '@/lib/brands';
import { SECTIONS, type SectionId } from '@/lib/sections';
import { cn } from '@/lib/utils';
import { DiagnosticoCorretivoPage } from '@/pages/DiagnosticoCorretivoPage';
import { EletricaInjecaoPage } from '@/pages/EletricaInjecaoPage';
import { FerramentasPage } from '@/pages/FerramentasPage';
import { FichaTecnicaPage } from '@/pages/FichaTecnicaPage';
import { IniciarRevisaoPage } from '@/pages/IniciarRevisaoPage';
import { ManuaisPage } from '@/pages/ManuaisPage';
import { ManualRevisoesPage } from '@/pages/ManualRevisoesPage';
import { ProcedimentosPage } from '@/pages/ProcedimentosPage';
import { TorquesCalculadorasPage } from '@/pages/TorquesCalculadorasPage';

const SECTION_TRANSITION = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};

function SectionContent({ id }: { id: SectionId }) {
  if (id === 'ficha-tecnica') return <FichaTecnicaPage />;
  if (id === 'iniciar-revisao') return <IniciarRevisaoPage />;
  if (id === 'manual-revisoes') return <ManualRevisoesPage />;
  if (id === 'manuais-pdf') return <ManuaisPage />;
  if (id === 'procedimentos') return <ProcedimentosPage />;
  if (id === 'ferramentas') return <FerramentasPage />;
  if (id === 'eletrica') return <EletricaInjecaoPage />;
  if (id === 'diagnostico') return <DiagnosticoCorretivoPage />;
  if (id === 'torques-calculadoras') return <TorquesCalculadorasPage />;
  return null;
}

export function AppShell() {
  const { section, setSection, trocarMoto } = useMoto();
  const moto = useMotoSelecionada();
  const {
    tema,
    modoBancada,
    manterTelaAcesa,
    menuLateralAberto,
    wakeLockAtivo,
    wakeLockMotivoIndisponivel,
    alternarTema,
    alternarModoBancada,
    alternarTelaAcesa,
    alternarMenuLateral,
    toggleFavorita,
    isFavorita,
  } = usePreferencias();

  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [colaAberta, setColaAberta] = useState(false);
  const [glossarioAberto, setGlossarioAberto] = useState(false);

  const theme = BRAND_THEME[moto.marca];
  const motoFavorita = isFavorita(moto.modelo.id, moto.geracao.id);

  const navegar = (id: SectionId) => {
    setSection(id);
    setMenuMobileAberto(false);
    window.scrollTo({ top: 0 });
  };

  const trocar = (inicio: 'fabricante' | 'ano') => {
    setMenuMobileAberto(false);
    trocarMoto(inicio);
  };

  const renderSidebarConteudo = (origem: 'desktop' | 'mobile') => (
    <>
      {/* Controles rápidos de bancada no topo do menu (ótimo no mobile!) */}
      <div className={cn('grid grid-cols-3 gap-1.5 px-4 pb-3', origem === 'desktop' && 'pt-3')}>
        <Button
          type="button"
          data-compact="true"
          variant={manterTelaAcesa ? 'default' : 'outline'}
          size="sm"
          onClick={alternarTelaAcesa}
          className="h-9 flex-col gap-0.5 px-1 text-[10px]"
        >
          <Lightbulb className={cn('size-3.5', manterTelaAcesa && 'fill-current')} />
          <span>Tela Acesa</span>
        </Button>
        <Button
          type="button"
          data-compact="true"
          variant={modoBancada ? 'default' : 'outline'}
          size="sm"
          onClick={alternarModoBancada}
          className="h-9 flex-col gap-0.5 px-1 text-[10px]"
        >
          <span className="font-mono text-xs font-extrabold">A+</span>
          <span>Bancada</span>
        </Button>
        <Button
          type="button"
          data-compact="true"
          variant={tema === 'sol' ? 'default' : 'outline'}
          size="sm"
          onClick={alternarTema}
          title={tema === 'oficina' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          className="h-9 flex-col gap-0.5 px-1 text-[10px]"
        >
          {tema === 'oficina' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          <span className="whitespace-nowrap">
            {tema === 'oficina' ? 'Tema Claro' : 'Tema Escuro'}
          </span>
        </Button>
      </div>

      <div className="px-4 pb-3">
        <div className={cn('group relative overflow-hidden rounded-xl border-2 bg-card p-3.5', theme.border)}>
          <div className="flex items-center gap-3">
            <theme.Logo emblemOnly className="size-11 shrink-0" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{moto.modelo.nome}</p>
              <p className="font-mono text-xs text-muted-foreground">{moto.geracao.anosLabel}</p>
              <p className="truncate text-xs text-muted-foreground">{moto.geracao.nomeGeracao}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="mt-2.5 w-full" onClick={() => trocar('ano')}>
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
                data-compact="true"
                onClick={() => navegar(id)}
                aria-current={ativo ? 'page' : undefined}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  ativo ? 'font-semibold text-primary' : 'text-foreground/85 hover:bg-accent',
                )}
              >
                {ativo && (
                  <motion.span
                    layoutId={`sidebar-active-section-${origem}`}
                    className="pointer-events-none absolute inset-0 rounded-lg bg-primary/15"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10 w-4 font-mono text-xs text-muted-foreground">{i + 1}</span>
                <Icon className="relative z-10 size-4 shrink-0" />
                <span className="relative z-10 flex-1">{titulo}</span>
                <ChevronRight
                  className={cn(
                    'relative z-10 size-4 opacity-0 transition-opacity group-hover:opacity-60',
                    ativo && 'opacity-60',
                  )}
                />
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Rodapé do Menu Lateral: Glossário de Siglas */}
      <div className="space-y-2.5 p-3.5">
        <Button
          type="button"
          data-compact="true"
          variant="outline"
          size="sm"
          onClick={() => {
            setMenuMobileAberto(false);
            setGlossarioAberto(true);
          }}
          className="w-full justify-start gap-2 text-xs"
        >
          <BookMarked className="size-3.5 text-primary" />
          Glossário de Siglas (PMS, TBI, CBS...)
        </Button>

        <div className="flex items-center justify-between pt-0.5 text-[11px] text-muted-foreground">
          <span>Guia de Oficina · local</span>
          <ApiStatusIndicator />
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen">
      {/* ------------------------------------------------------------------ */}
      {/* Header fixo                                                        */}
      {/* ------------------------------------------------------------------ */}
      <header className="no-print sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="flex h-14 items-center gap-1.5 px-2.5 sm:gap-2.5 sm:px-5">
          {/* Botão Mobile: abre gaveta (Sheet) */}
          <Button
            variant="ghost"
            size="icon"
            data-compact="true"
            onClick={() => setMenuMobileAberto(true)}
            aria-label="Abrir menu"
            className="md:hidden"
          >
            <Menu className="size-5" />
          </Button>

          {/* Botão Desktop: oculta / mostra menu lateral persistente */}
          <Button
            variant="ghost"
            size="icon"
            data-compact="true"
            onClick={alternarMenuLateral}
            aria-label={menuLateralAberto ? 'Ocultar menu lateral' : 'Mostrar menu lateral'}
            title={menuLateralAberto ? 'Ocultar menu lateral' : 'Mostrar menu lateral'}
            className="hidden md:inline-flex"
          >
            {menuLateralAberto ? (
              <PanelLeftClose className="size-5" />
            ) : (
              <PanelLeftOpen className="size-5" />
            )}
          </Button>

          <div className="hidden items-center gap-2 lg:flex">
            <span className="rounded-lg bg-primary/15 p-1.5 text-primary">
              <Wrench className="size-4" />
            </span>
            <span className="font-bold tracking-tight">Guia de Oficina</span>
          </div>

          <Separator orientation="vertical" className="mx-0.5 hidden !h-6 lg:block" />

          {/* Pill da Moto Ativa + Estrela Favoritar */}
          <div className="flex min-w-0 items-center gap-1">
            <button
              type="button"
              data-compact="true"
              onClick={() => trocar('ano')}
              title="Trocar ano / geração"
              className="flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-accent"
            >
              <Badge variant={theme.badge} className="shrink-0">
                {moto.marca}
              </Badge>
              <span className="truncate font-semibold">{moto.modelo.nome}</span>
              <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                • {moto.geracao.anosLabel}
              </span>
            </button>

            <button
              type="button"
              data-compact="true"
              onClick={() => toggleFavorita(moto.modelo.id, moto.geracao.id)}
              title={motoFavorita ? 'Remover de Minhas Motos' : 'Fixar moto como favorita ⭐'}
              aria-label={motoFavorita ? 'Remover de Minhas Motos' : 'Fixar moto como favorita'}
              className={cn(
                'rounded-lg p-1.5 transition-colors hover:bg-accent',
                motoFavorita ? 'text-amber-400' : 'text-muted-foreground hover:text-amber-400',
              )}
            >
              <Star className={cn('size-4', motoFavorita && 'fill-current')} />
            </button>
          </div>

          {/* Controles rápidos de Bancada à direita */}
          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
            {/* Botão Cola Rápida */}
            <Button
              type="button"
              data-compact="true"
              variant="secondary"
              size="sm"
              onClick={() => setColaAberta(true)}
              title="Abrir Cola Rápida da moto atual (óleo, válvulas, vela, PSI e torques)"
              className="h-8 gap-1.5 px-2.5 text-xs font-semibold"
            >
              <Gauge className="size-3.5 text-primary" />
              <span>Cola</span>
            </Button>

            {/* Tela Acesa (Desktop/Tablet) */}
            <Button
              type="button"
              data-compact="true"
              variant={manterTelaAcesa ? 'default' : 'ghost'}
              size="sm"
              onClick={alternarTelaAcesa}
              title={
                wakeLockMotivoIndisponivel ??
                (wakeLockAtivo
                  ? 'Tela Acesa ativa — clique para liberar'
                  : 'Manter Tela Acesa durante o serviço na bancada')
              }
              className="hidden h-8 gap-1 px-2 text-xs md:inline-flex"
            >
              <Lightbulb className={cn('size-3.5', manterTelaAcesa && 'fill-current')} />
              <span className="hidden xl:inline">Tela Acesa</span>
            </Button>

            {/* Modo Bancada A+ (Desktop/Tablet) */}
            <Button
              type="button"
              data-compact="true"
              variant={modoBancada ? 'default' : 'ghost'}
              size="sm"
              onClick={alternarModoBancada}
              title="Modo Bancada (A+): aumenta botões e números técnicos para leitura à distância"
              className="hidden h-8 px-2 font-mono text-xs font-bold md:inline-flex"
            >
              A+
            </Button>

            {/* Alternador Tema Escuro <-> Tema Claro */}
            <Button
              type="button"
              data-compact="true"
              variant="ghost"
              size="icon"
              onClick={alternarTema}
              title={
                tema === 'oficina'
                  ? 'Mudar para Tema Claro'
                  : 'Mudar para Tema Escuro'
              }
              aria-label={tema === 'oficina' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
              className="size-8"
            >
              {tema === 'oficina' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              data-compact="true"
              onClick={() => trocar('fabricante')}
              className="hidden h-8 shrink-0 gap-1.5 text-xs sm:inline-flex"
            >
              <ArrowLeftRight className="size-3.5" />
              <span className="hidden md:inline">Trocar Moto</span>
            </Button>

            <ApiStatusIndicator className="hidden xl:inline-flex" />
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Menu lateral Mobile (Sheet)                                        */}
      {/* ------------------------------------------------------------------ */}
      <Sheet open={menuMobileAberto} onOpenChange={setMenuMobileAberto}>
        <SheetContent side="left" className="w-80 gap-0 p-0 sm:max-w-80 md:hidden">
          <SheetHeader className="pb-3">
            <SheetTitle className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/15 p-1.5 text-primary">
                <Wrench className="size-4" />
              </span>
              Guia de Oficina
            </SheetTitle>
            <SheetDescription>Navegação e controles da bancada</SheetDescription>
          </SheetHeader>
          {renderSidebarConteudo('mobile')}
        </SheetContent>
      </Sheet>

      {/* ------------------------------------------------------------------ */}
      {/* Layout Desktop (Menu Lateral Persistente + Conteúdo Principal)     */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <aside
          aria-label="Menu lateral"
          aria-hidden={!menuLateralAberto}
          className={cn(
            'no-print hidden shrink-0 overflow-hidden border-r bg-card/40 transition-[width,opacity] duration-300 ease-out md:sticky md:top-14 md:flex md:h-[calc(100vh-3.5rem)] md:flex-col',
            menuLateralAberto
              ? 'w-72 opacity-100'
              : 'pointer-events-none w-0 border-r-0 opacity-0',
          )}
        >
          <div className="flex h-full w-72 flex-col">{renderSidebarConteudo('desktop')}</div>
        </aside>

        {/* Conteúdo Principal (com pb-24 no mobile para a Bottom Navigation) */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-6 md:py-8 md:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${moto.geracao.id}-${section}`}
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={SECTION_TRANSITION}
              >
                <SectionContent id={section} />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Barra Inferior Fixa no Mobile (md:hidden)                          */}
      {/* ------------------------------------------------------------------ */}
      <nav
        aria-label="Navegação rápida mobile"
        className="no-print fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-2 py-1.5 backdrop-blur md:hidden"
      >
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 'ficha-tecnica' as const, label: 'Ficha', Icon: ClipboardList },
            { id: 'iniciar-revisao' as const, label: 'Revisar', Icon: PlayCircle },
            { id: 'procedimentos' as const, label: 'Vídeos', Icon: Clapperboard },
          ].map(({ id, label, Icon }) => {
            const ativo = section === id;
            return (
              <button
                key={id}
                type="button"
                data-compact="true"
                onClick={() => navegar(id)}
                className={cn(
                  'flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[11px] font-semibold transition-colors',
                  ativo
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <Icon className="size-5" />
                <span>{label}</span>
              </button>
            );
          })}

          <button
            type="button"
            data-compact="true"
            onClick={() => setMenuMobileAberto(true)}
            className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Menu className="size-5" />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {/* Sheets auxiliares globais */}
      <ColaRapidaSheet open={colaAberta} onOpenChange={setColaAberta} />
      <GlossarioSheet open={glossarioAberto} onOpenChange={setGlossarioAberto} />
    </div>
  );
}
