import { useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  Copy,
  FileText,
  FolderOpen,
  Library,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';

import { ManualPdfViewer } from '@/components/ManualPdfViewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMotoSelecionada } from '@/context/MotoContext';
import {
  formatarTamanhoBytes,
  gerarCaminhoSugeridoManual,
  useManuais,
} from '@/hooks/useManuais';
import { BRAND_THEME } from '@/lib/brands';
import { cn } from '@/lib/utils';

export function ManuaisPage() {
  const moto = useMotoSelecionada();
  const theme = BRAND_THEME[moto.marca];

  const [verTodaBiblioteca, setVerTodaBiblioteca] = useState(false);
  const [buscaBiblioteca, setBuscaBiblioteca] = useState('');
  const [manualAtivoId, setManualAtivoId] = useState<string | undefined>(undefined);
  const [copiado, setCopiado] = useState(false);

  const filtroMoto = useMemo(
    () =>
      verTodaBiblioteca
        ? undefined
        : {
            marca: moto.marca.toLowerCase(),
            modelo: moto.modelo.id,
            anoInicio: moto.geracao.anoInicio,
            anoFim: moto.geracao.anoFim,
          },
    [verTodaBiblioteca, moto.marca, moto.modelo.id, moto.geracao.anoInicio, moto.geracao.anoFim],
  );

  const { manuais, totalBiblioteca, carregando, erro, recarregar } = useManuais(filtroMoto);

  const manuaisExibidos = useMemo(() => {
    if (!verTodaBiblioteca || !buscaBiblioteca.trim()) return manuais;
    const termo = buscaBiblioteca.trim().toLowerCase();
    return manuais.filter(
      (m) =>
        m.nomeArquivo.toLowerCase().includes(termo) ||
        m.tituloAmigavel.toLowerCase().includes(termo) ||
        m.marca.toLowerCase().includes(termo) ||
        m.modeloSlug.toLowerCase().includes(termo) ||
        (m.anoOuFaixa && m.anoOuFaixa.toLowerCase().includes(termo)),
    );
  }, [manuais, verTodaBiblioteca, buscaBiblioteca]);

  const { pastaRelativa, exemploArquivo } = useMemo(
    () => gerarCaminhoSugeridoManual(moto),
    [moto],
  );

  const copiarCaminho = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Cabeçalho da Biblioteca de Manuais PDF                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card/80 p-5 sm:flex-row sm:items-center">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={theme.badge}>{moto.marca}</Badge>
            <Badge variant="outline" className="font-mono">
              {moto.geracao.anosLabel}
            </Badge>
            <Badge
              variant="secondary"
              className="gap-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            >
              <BookOpen className="size-3.5" />
              Leitor PDF + Busca Instantânea & Modo Leitura
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Manuais PDF — {moto.modelo.nome}{' '}
            <span className="font-mono text-lg font-normal text-muted-foreground">
              ({moto.geracao.nomeGeracao})
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Pesquise por palavra-chave, use atalhos de 1 clique, salte direto para a página do diagrama ou alterne para o Modo Leitura (Texto).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={verTodaBiblioteca ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setVerTodaBiblioteca((v) => !v);
              setManualAtivoId(undefined);
            }}
            className="gap-2"
          >
            <Library className="size-4" />
            {verTodaBiblioteca
              ? `Filtrar por ${moto.modelo.nome} (${moto.geracao.anosLabel})`
              : `Ver toda a biblioteca de PDFs (${totalBiblioteca})`}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void recarregar()}
            disabled={carregando}
            className="gap-1.5"
          >
            <RefreshCw className={cn('size-4', carregando && 'animate-spin')} />
            Recarregar lista de PDFs
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Se estiver no modo "Toda a biblioteca", mostra barra de filtro     */}
      {/* ------------------------------------------------------------------ */}
      {verTodaBiblioteca && (
        <Card className="border-primary/25 bg-card/70">
          <CardHeader className="pb-3">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Library className="size-4 text-primary" />
                  Acervo Completo de Manuais PDF ({manuaisExibidos.length} de {totalBiblioteca})
                </CardTitle>
                <CardDescription>
                  Selecione qualquer documento abaixo para abri-lo no leitor integrado.
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input
                  value={buscaBiblioteca}
                  onChange={(e) => setBuscaBiblioteca(e.target.value)}
                  placeholder="Filtrar por modelo, ano ou arquivo..."
                  className="h-9 pl-9 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          {manuaisExibidos.length > 0 && (
            <CardContent className="pt-0">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {manuaisExibidos.map((item) => {
                  const ativo =
                    (manualAtivoId ?? manuaisExibidos[0]?.id) === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setManualAtivoId(item.id)}
                      className={cn(
                        'flex items-start gap-3 rounded-xl border p-3 text-left transition-all',
                        ativo
                          ? 'border-primary/70 bg-primary/10 shadow-sm'
                          : 'border-border/60 bg-background/50 hover:border-border hover:bg-accent/40',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                          ativo ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <FileText className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                            {item.marca}
                          </Badge>
                          <Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
                            {item.modeloSlug.toUpperCase()}
                          </Badge>
                          {item.anoOuFaixa && (
                            <Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px]">
                              {item.anoOuFaixa}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 truncate text-xs font-semibold">{item.nomeArquivo}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {formatarTamanhoBytes(item.tamanhoBytes)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Erro de rede/API                                                   */}
      {/* ------------------------------------------------------------------ */}
      {erro && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center justify-between gap-4 py-4 text-sm text-destructive">
            <span>{erro}</span>
            <Button variant="outline" size="sm" onClick={() => void recarregar()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Visualizador PDF Integrado OU Card Instrucional de Pasta           */}
      {/* ------------------------------------------------------------------ */}
      {manuaisExibidos.length > 0 ? (
        <ManualPdfViewer
          manuais={manuaisExibidos}
          manualSelecionadoId={manualAtivoId}
          onSelectManual={setManualAtivoId}
          onRecarregar={() => void recarregar()}
          carregando={carregando}
        />
      ) : (
        <Card className="border-dashed border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <FolderOpen className="size-6" />
              </span>
              <div>
                <CardTitle className="text-lg">
                  {carregando
                    ? 'Verificando biblioteca de manuais PDF...'
                    : `Nenhum PDF encontrado para ${moto.marca} ${moto.modelo.nome} (${moto.geracao.anosLabel})`}
                </CardTitle>
                <CardDescription>
                  Adicione o PDF oficial na pasta abaixo e clique em &ldquo;Recarregar lista de PDFs&rdquo; — não é necessário reiniciar o servidor.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/80 bg-zinc-950/90 p-4">
              <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                Caminho exato para salvar o manual desta geração:
              </p>
              <div className="mt-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <code className="rounded-lg bg-zinc-900 px-3 py-2 font-mono text-xs text-emerald-400 sm:text-sm">
                  {exemploArquivo}
                </code>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void copiarCaminho(pastaRelativa)}
                  className="shrink-0 gap-1.5"
                >
                  {copiado ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                  {copiado ? 'Caminho copiado!' : 'Copiar pasta'}
                </Button>
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground">
                Dica: o sistema também reconhece pastas sem hífen (ex.:{' '}
                <code className="font-mono text-foreground">
                  public/manuals/{moto.marca.toLowerCase()}/{moto.modelo.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}/{moto.geracao.anoInicio}/
                </code>
                ) ou colocadas diretamente na pasta do modelo.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/70 p-3.5">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0 text-emerald-400" />
                <span>
                  A biblioteca já conta com <strong className="text-foreground">{totalBiblioteca} manuais PDF</strong> disponíveis para consulta imediata.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {totalBiblioteca > 0 && !verTodaBiblioteca && (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setVerTodaBiblioteca(true)}
                    className="gap-1.5"
                  >
                    <Library className="size-4" />
                    Ver todos os {totalBiblioteca} PDFs da biblioteca
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void recarregar()}
                  disabled={carregando}
                  className="gap-1.5"
                >
                  <RefreshCw className={cn('size-3.5', carregando && 'animate-spin')} />
                  Recarregar lista de PDFs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
