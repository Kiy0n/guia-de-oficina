import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftRight,
  BookMarked,
  ChevronRight,
  Clapperboard,
  ClipboardList,
  Download,
  Gauge,
  Lightbulb,
  Menu,
  Moon,
  PlayCircle,
  Star,
  Sun,
  Upload,
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
import { useFerramentas } from '@/context/FerramentasContext';
import { useMoto, useMotoSelecionada } from '@/context/MotoContext';
import { usePreferencias } from '@/context/PreferenciasContext';
import { useToast } from '@/context/ToastContext';
import { BRAND_THEME } from '@/lib/brands';
import { SECTIONS, type SectionId } from '@/lib/sections';
import { cn } from '@/lib/utils';
import { DiagnosticoCorretivoPage } from '@/pages/DiagnosticoCorretivoPage';
import { EletricaInjecaoPage } from '@/pages/EletricaInjecaoPage';
import { FichaTecnicaPage } from '@/pages/FichaTecnicaPage';
import { IniciarRevisaoPage } from '@/pages/IniciarRevisaoPage';
import { KitFerramentasPage } from '@/pages/KitFerramentasPage';
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
  if (id === 'ferramentas') return <KitFerramentasPage />;
  if (id === 'eletrica') return <EletricaInjecaoPage />;
  if (id === 'diagnostico') return <DiagnosticoCorretivoPage />;
  if (id === 'torques-calculadoras') return <TorquesCalculadorasPage />;
  return null;
}

export function AppShell() {
  const { section, setSection, trocarMoto } = useMoto();
  const moto = useMotoSelecionada();
  const { recarregarFerramentas } = useFerramentas();
  const { mostrarToast } = useToast();
  const {
    tema,
    modoBancada,
    manterTelaAcesa,
    wakeLockAtivo,
    wakeLockMotivoIndisponivel,
    alternarTema,
    alternarModoBancada,
    alternarTelaAcesa,
    toggleFavorita,
    isFavorita,
  } = usePreferencias();

  const [menuAberto, setMenuAberto] = useState(false);
  const [colaAberta, setColaAberta] = useState(false);
  const [glossarioAberto, setGlossarioAberto] = useState(false);
  const [restaurandoBackup, setRestaurandoBackup] = useState(false);
  const inputBackupRef = useRef<HTMLInputElement | null>(null);

  const theme = BRAND_THEME[moto.marca];
  const motoFavorita = isFavorita(moto.modelo.id, moto.geracao.id);

  const navegar = (id: SectionId) => {
    setSection(id);
    setMenuAberto(false);
    window.scrollTo({ top: 0 });
  };

  const trocar = (inicio: 'fabricante' | 'ano') => {
    setMenuAberto(false);
    trocarMoto(inicio);
  };

  const baixarBackup = async () => {
    try {
      const res = await fetch('/api/backup');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const hoje = new Date().toISOString().slice(0, 10);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mototech-pro-backup-${hoje}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      mostrarToast({
        dedupeKey: 'backup-oficina',
        titulo: 'Backup baixado com sucesso!',
        descricao: `Arquivo mototech-pro-backup-${hoje}.json salvo no seu dispositivo.`,
        variante: 'sucesso',
      });
    } catch {
      mostrarToast({
        dedupeKey: 'backup-oficina',
        titulo: 'Não foi possível baixar o backup',
        descricao: 'Verifique se o servidor Express local está ativo.',
        variante: 'erro',
      });
    }
  };

  const handleSelecionarArquivoBackup = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;

    const confirmado = window.confirm(
      `Deseja restaurar o backup "${arquivo.name}"?\n\nIsso substituirá seu inventário do Kit de Ferramentas em data/oficina.json.`,
    );
    if (!confirmado) return;

    setRestaurandoBackup(true);
    try {
      const texto = await arquivo.text();
      const json: unknown = JSON.parse(texto);

      const res = await fetch('/api/backup/restaurar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(json),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        totalFerramentas?: number;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? `Erro HTTP ${res.status}`);
      }

      await recarregarFerramentas();

      mostrarToast({
        dedupeKey: 'backup-oficina',
        titulo: 'Backup restaurado com sucesso!',
        descricao: `${data.totalFerramentas ?? 0} ferramentas do Kit de Ferramentas carregadas.`,
        variante: 'sucesso',
        duracaoMs: 4500,
      });
    } catch (err) {
      mostrarToast({
        dedupeKey: 'backup-oficina',
        titulo: 'Falha ao restaurar backup',
        descricao:
          err instanceof Error ? err.message : 'Verifique se o arquivo JSON é um backup válido.',
        variante: 'erro',
      });
    } finally {
      setRestaurandoBackup(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ------------------------------------------------------------------ */}
      {/* Header fixo                                                        */}
      {/* ------------------------------------------------------------------ */}
      <header className="no-print sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-1.5 px-2.5 sm:gap-2.5 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            data-compact="true"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </Button>

          <div className="hidden items-center gap-2 lg:flex">
            <span className="rounded-lg bg-primary/15 p-1.5 text-primary">
              <Wrench className="size-4" />
            </span>
            <span className="font-bold tracking-tight">MotoTech Pro</span>
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

            {/* Tema Oficina (Escuro) <-> Modo Sol (Claro) */}
            <Button
              type="button"
              data-compact="true"
              variant="ghost"
              size="icon"
              onClick={alternarTema}
              title={
                tema === 'oficina'
                  ? 'Mudar para Modo Sol (Claro Alto Contraste)'
                  : 'Voltar para Modo Oficina (Escuro)'
              }
              aria-label="Alternar tema Oficina / Modo Sol"
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
      {/* Menu lateral (Sheet)                                               */}
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
            <SheetDescription>Navegação e controles da bancada</SheetDescription>
          </SheetHeader>

          {/* Controles rápidos de bancada no topo do menu (ótimo no mobile!) */}
          <div className="grid grid-cols-3 gap-1.5 px-4 pb-3">
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
              className="h-9 flex-col gap-0.5 px-1 text-[10px]"
            >
              {tema === 'oficina' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
              <span>{tema === 'oficina' ? 'Modo Sol' : 'Oficina'}</span>
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
                        layoutId="sidebar-active-section"
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

          {/* Rodapé do Menu Lateral: Glossário de Siglas + Backup/Restauração */}
          <div className="space-y-2.5 p-3.5">
            <Button
              type="button"
              data-compact="true"
              variant="outline"
              size="sm"
              onClick={() => {
                setMenuAberto(false);
                setGlossarioAberto(true);
              }}
              className="w-full justify-start gap-2 text-xs"
            >
              <BookMarked className="size-3.5 text-primary" />
              Glossário de Siglas (PMS, TBI, CBS...)
            </Button>

            <div className="rounded-xl border bg-background/60 p-2.5">
              <p className="mb-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Dados Locais (oficina.json)
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  type="button"
                  data-compact="true"
                  variant="secondary"
                  size="sm"
                  onClick={() => void baixarBackup()}
                  className="h-8 gap-1 px-2 text-[11px]"
                >
                  <Download className="size-3.5" />
                  Baixar Backup
                </Button>
                <Button
                  type="button"
                  data-compact="true"
                  variant="outline"
                  size="sm"
                  disabled={restaurandoBackup}
                  onClick={() => inputBackupRef.current?.click()}
                  className="h-8 gap-1 px-2 text-[11px]"
                >
                  <Upload className="size-3.5" />
                  {restaurandoBackup ? 'Restaurando...' : 'Restaurar'}
                </Button>
              </div>
              <input
                ref={inputBackupRef}
                type="file"
                accept="application/json,.json"
                onChange={(e) => void handleSelecionarArquivoBackup(e)}
                className="hidden"
              />
            </div>

            <div className="flex items-center justify-between pt-0.5 text-[11px] text-muted-foreground">
              <span>MotoTech Pro · local</span>
              <ApiStatusIndicator />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ------------------------------------------------------------------ */}
      {/* Conteúdo Principal (com pb-24 no mobile para a Bottom Navigation)  */}
      {/* ------------------------------------------------------------------ */}
      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-6 md:py-8 md:pb-8">
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
      </main>

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
            onClick={() => setMenuAberto(true)}
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
