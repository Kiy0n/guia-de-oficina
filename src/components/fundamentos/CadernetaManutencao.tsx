import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  ClipboardList,
  Download,
  Filter,
  Gauge,
  PlusCircle,
  Printer,
  Trash2,
  Upload,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMoto } from '@/context/MotoContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

const CADERNETA_STORAGE_KEY = 'guia-oficina-caderneta-v1';

export type CategoriaCaderneta =
  | 'Óleo'
  | 'Relação'
  | 'Freios'
  | 'Válvulas'
  | 'Pneus'
  | 'Elétrica'
  | 'Revisão Geral'
  | 'Outro';

const CATEGORIAS_CADERNETA: readonly CategoriaCaderneta[] = [
  'Óleo',
  'Relação',
  'Freios',
  'Válvulas',
  'Pneus',
  'Elétrica',
  'Revisão Geral',
  'Outro',
] as const;

const CATEGORIA_CADERNETA_BADGE: Record<CategoriaCaderneta, string> = {
  Óleo: 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300',
  Relação: 'border-purple-500/40 bg-purple-500/15 text-purple-700 dark:text-purple-300',
  Freios: 'border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300',
  Válvulas: 'border-orange-500/40 bg-orange-500/15 text-orange-700 dark:text-orange-300',
  Pneus: 'border-cyan-500/40 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
  Elétrica: 'border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-300',
  'Revisão Geral': 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  Outro: 'border-border bg-muted/60 text-muted-foreground',
};

export interface RegistroCaderneta {
  id: string;
  moto: string;
  data: string; // YYYY-MM-DD
  km: number;
  categoria: CategoriaCaderneta;
  descricao: string;
  observacao?: string;
  criadoEm: string;
}

function hojeIso(): string {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function formatarDataBr(iso: string): string {
  const partes = iso.split('-');
  if (partes.length !== 3) return iso;
  const [ano, mes, dia] = partes;
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

function isCategoriaValida(val: unknown): val is CategoriaCaderneta {
  return typeof val === 'string' && (CATEGORIAS_CADERNETA as readonly string[]).includes(val);
}

function validarRegistro(raw: unknown): RegistroCaderneta | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === 'string' && r.id.trim() ? r.id.trim() : null;
  const moto = typeof r.moto === 'string' && r.moto.trim() ? r.moto.trim() : null;
  const data = typeof r.data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.data) ? r.data : null;
  const km = typeof r.km === 'number' && Number.isFinite(r.km) && r.km >= 0 ? Math.round(r.km) : null;
  const categoria = isCategoriaValida(r.categoria) ? r.categoria : null;
  const descricao =
    typeof r.descricao === 'string' && r.descricao.trim() ? r.descricao.trim() : null;
  const observacao =
    typeof r.observacao === 'string' && r.observacao.trim() ? r.observacao.trim() : undefined;
  const criadoEm =
    typeof r.criadoEm === 'string' && r.criadoEm.trim() ? r.criadoEm : new Date().toISOString();

  if (!id || !moto || !data || km === null || !categoria || !descricao) {
    return null;
  }

  return { id, moto, data, km, categoria, descricao, observacao, criadoEm };
}

function lerCadernetaStorage(): RegistroCaderneta[] {
  try {
    const raw = window.localStorage.getItem(CADERNETA_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const validos: RegistroCaderneta[] = [];
    for (const item of parsed) {
      const reg = validarRegistro(item);
      if (reg) validos.push(reg);
    }
    return validos;
  } catch {
    return [];
  }
}

function salvarCadernetaStorage(lista: RegistroCaderneta[]): void {
  try {
    window.localStorage.setItem(CADERNETA_STORAGE_KEY, JSON.stringify(lista));
  } catch {
    // ignore quota errors
  }
}

export function CadernetaManutencao() {
  const { moto } = useMoto();
  const { mostrarToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const nomeMotoPadrao = moto
    ? `${moto.marca} ${moto.modelo.nome} (${moto.geracao.anosLabel})`
    : '';

  const [registros, setRegistros] = useState<RegistroCaderneta[]>(() => lerCadernetaStorage());

  // Campos do formulário
  const [motoInput, setMotoInput] = useState<string>(nomeMotoPadrao);
  const [dataInput, setDataInput] = useState<string>(hojeIso);
  const [kmInput, setKmInput] = useState<string>('');
  const [categoriaInput, setCategoriaInput] = useState<CategoriaCaderneta>('Óleo');
  const [descricaoInput, setDescricaoInput] = useState<string>('');
  const [observacaoInput, setObservacaoInput] = useState<string>('');

  // Filtros e confirmação de exclusão
  const [filtroMoto, setFiltroMoto] = useState<string>('TODAS');
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaCaderneta | 'TODAS'>('TODAS');
  const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState<string | null>(null);

  // Sincroniza o campo Moto ao trocar de moto no contexto (sem apagar se o usuário já digitou algo diferente)
  useEffect(() => {
    if (nomeMotoPadrao) {
      setMotoInput(nomeMotoPadrao);
    }
  }, [nomeMotoPadrao]);

  const motosUnicas = useMemo(() => {
    const set = new Set<string>();
    for (const r of registros) {
      set.add(r.moto);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [registros]);

  const registrosFiltrados = useMemo(() => {
    return [...registros]
      .filter((r) => {
        if (filtroMoto !== 'TODAS' && r.moto !== filtroMoto) return false;
        if (filtroCategoria !== 'TODAS' && r.categoria !== filtroCategoria) return false;
        return true;
      })
      .sort((a, b) => b.data.localeCompare(a.data) || b.criadoEm.localeCompare(a.criadoEm));
  }, [registros, filtroMoto, filtroCategoria]);

  const adicionarRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    const motoLimpa = motoInput.trim();
    const descLimpa = descricaoInput.trim();
    const kmNumero = Number(kmInput.replace(/[^\d]/g, ''));

    if (!motoLimpa) {
      mostrarToast({
        dedupeKey: 'caderneta-validacao-moto',
        titulo: 'Informe o nome da moto',
        descricao: 'Ex.: Honda CG 160 Fan 2024.',
        variante: 'aviso',
      });
      return;
    }

    if (!descLimpa) {
      mostrarToast({
        dedupeKey: 'caderneta-validacao-desc',
        titulo: 'Informe uma descrição curta do serviço',
        descricao: 'Ex.: Troca de óleo 10W-30 + arruela do bujão.',
        variante: 'aviso',
      });
      return;
    }

    const novo: RegistroCaderneta = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      moto: motoLimpa,
      data: /^\d{4}-\d{2}-\d{2}$/.test(dataInput) ? dataInput : hojeIso(),
      km: Number.isFinite(kmNumero) && kmNumero >= 0 ? kmNumero : 0,
      categoria: categoriaInput,
      descricao: descLimpa,
      observacao: observacaoInput.trim() || undefined,
      criadoEm: new Date().toISOString(),
    };

    const proxima = [novo, ...registros];
    setRegistros(proxima);
    salvarCadernetaStorage(proxima);

    setDescricaoInput('');
    setObservacaoInput('');
    setKmInput('');

    mostrarToast({
      dedupeKey: 'caderneta-salvo',
      titulo: 'Manutenção registrada na caderneta!',
      variante: 'sucesso',
      duracaoMs: 2200,
    });
  };

  const excluirRegistro = (id: string) => {
    const anterior = registros;
    const proxima = registros.filter((r) => r.id !== id);
    setRegistros(proxima);
    salvarCadernetaStorage(proxima);
    setConfirmandoExclusaoId(null);

    mostrarToast({
      dedupeKey: `caderneta-excluir-${id}`,
      titulo: 'Registro removido da caderneta',
      variante: 'aviso',
      acaoDesfazer: () => {
        setRegistros(anterior);
        salvarCadernetaStorage(anterior);
      },
    });
  };

  const exportarJson = () => {
    const payload = {
      app: 'Guia de Oficina',
      versaoSchema: 1,
      exportadoEm: new Date().toISOString(),
      registros,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caderneta-guia-de-oficina-${hojeIso()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    mostrarToast({
      dedupeKey: 'caderneta-export',
      titulo: 'Backup JSON exportado!',
      descricao: `${registros.length} registro(s) salvo(s) no arquivo.`,
      variante: 'sucesso',
    });
  };

  const importarJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const texto = await file.text();
      const parsed = JSON.parse(texto) as unknown;

      const origemLista: unknown[] | null = Array.isArray(parsed)
        ? parsed
        : parsed &&
            typeof parsed === 'object' &&
            Array.isArray((parsed as Record<string, unknown>).registros)
          ? ((parsed as Record<string, unknown>).registros as unknown[])
          : null;

      if (!origemLista) {
        mostrarToast({
          dedupeKey: 'caderneta-import-erro',
          titulo: 'Arquivo JSON inválido',
          descricao: 'O arquivo não segue o formato da Caderneta de Manutenção.',
          variante: 'aviso',
        });
        return;
      }

      const validados: RegistroCaderneta[] = [];
      for (const item of origemLista) {
        const reg = validarRegistro(item);
        if (reg) validados.push(reg);
      }

      if (validados.length === 0) {
        mostrarToast({
          dedupeKey: 'caderneta-import-vazio',
          titulo: 'Nenhum registro válido encontrado no JSON',
          variante: 'aviso',
        });
        return;
      }

      const idsExistentes = new Set(registros.map((r) => r.id));
      const novos = validados.filter((r) => !idsExistentes.has(r.id));
      const combinados = [...novos, ...registros];

      setRegistros(combinados);
      salvarCadernetaStorage(combinados);

      mostrarToast({
        dedupeKey: 'caderneta-import-ok',
        titulo: `Importação concluída (${novos.length} novo(s))`,
        descricao:
          validados.length > novos.length
            ? `${validados.length - novos.length} registro(s) duplicado(s) ignorado(s).`
            : undefined,
        variante: 'sucesso',
      });
    } catch {
      mostrarToast({
        dedupeKey: 'caderneta-import-parse-erro',
        titulo: 'Não foi possível ler o arquivo JSON',
        descricao: 'Verifique se o arquivo não está corrompido.',
        variante: 'aviso',
      });
    }
  };

  return (
    <section aria-label="Caderneta de Manutenção Local" className="space-y-4">
      {/* Cabeçalho + Ações de Backup e Impressão */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 text-primary" />
          <h2 className="text-base font-bold text-foreground sm:text-lg">
            Caderneta de Manutenção (FVM · Salva Localmente)
          </h2>
          <Badge variant="secondary" className="font-mono text-xs">
            {registros.length} {registros.length === 1 ? 'registro' : 'registros'}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={(e) => void importarJson(e)}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-compact="true"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 gap-1.5 text-xs"
          >
            <Upload className="size-3.5" />
            Importar JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-compact="true"
            disabled={registros.length === 0}
            onClick={exportarJson}
            className="h-8 gap-1.5 text-xs"
          >
            <Download className="size-3.5" />
            Exportar JSON
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            data-compact="true"
            disabled={registros.length === 0}
            onClick={() => window.print()}
            className="h-8 gap-1.5 text-xs"
          >
            <Printer className="size-3.5" />
            Imprimir Caderneta
          </Button>
        </div>
      </div>

      {/* Formulário de Novo Registro (oculto na impressão) */}
      <Card className="no-print border-border/80 bg-card/90">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Registrar Manutenção Realizada</CardTitle>
          <CardDescription className="text-xs">
            Fica salvo offline neste computador. Ideal para acompanhar trocas de óleo, folga de
            válvulas, relação e freios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={adicionarRegistro} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Moto *</label>
                <Input
                  value={motoInput}
                  onChange={(e) => setMotoInput(e.target.value)}
                  placeholder="Ex.: Honda CG 160 Fan (2024)"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Data *</label>
                <Input
                  type="date"
                  value={dataInput}
                  onChange={(e) => setDataInput(e.target.value)}
                  className="h-9 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">KM Atual</label>
                <Input
                  type="number"
                  min={0}
                  value={kmInput}
                  onChange={(e) => setKmInput(e.target.value)}
                  placeholder="Ex.: 12450"
                  className="h-9 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Categoria</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIAS_CADERNETA.map((cat) => {
                  const ativa = categoriaInput === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      data-compact="true"
                      onClick={() => setCategoriaInput(cat)}
                      className={cn(
                        'rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all',
                        ativa
                          ? CATEGORIA_CADERNETA_BADGE[cat] + ' ring-1 ring-primary/50'
                          : 'border-border bg-background/60 text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Descrição curta *</label>
                <Input
                  value={descricaoInput}
                  onChange={(e) => setDescricaoInput(e.target.value)}
                  placeholder="Ex.: Troca de óleo 10W-30 semissintético + arruela nova"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Observação opcional (marca, torque, peças)
                </label>
                <Input
                  value={observacaoInput}
                  onChange={(e) => setObservacaoInput(e.target.value)}
                  placeholder="Ex.: Mobil 10W-30 JASO MA2 · Bujão 24 N·m"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" size="sm" className="gap-1.5">
                <PlusCircle className="size-4" />
                Salvar na Caderneta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Histórico + Filtros + Área Imprimível */}
      <Card className="print-report border-border/80 bg-card/90">
        <CardHeader className="border-b border-border/60 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Histórico de Manutenções</CardTitle>
              <CardDescription className="text-xs">
                Ordenado do serviço mais recente para o mais antigo · Guia de Oficina
              </CardDescription>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              Exibindo {registrosFiltrados.length} de {registros.length}
            </span>
          </div>

          {/* Filtros rápidos (ocultos na impressão) */}
          {registros.length > 0 && (
            <div className="no-print mt-3 flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <Filter className="size-3" />
                  Categoria:
                </span>
                <button
                  type="button"
                  data-compact="true"
                  onClick={() => setFiltroCategoria('TODAS')}
                  className={cn(
                    'rounded-md border px-2 py-0.5 text-[11px] font-semibold transition-colors',
                    filtroCategoria === 'TODAS'
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-background/60 text-muted-foreground hover:text-foreground',
                  )}
                >
                  Todas
                </button>
                {CATEGORIAS_CADERNETA.map((cat) => {
                  const qtd = registros.filter((r) => r.categoria === cat).length;
                  if (qtd === 0) return null;
                  const ativa = filtroCategoria === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      data-compact="true"
                      onClick={() => setFiltroCategoria(cat)}
                      className={cn(
                        'rounded-md border px-2 py-0.5 text-[11px] font-semibold transition-colors',
                        ativa
                          ? CATEGORIA_CADERNETA_BADGE[cat]
                          : 'border-border bg-background/60 text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {cat} ({qtd})
                    </button>
                  );
                })}
              </div>

              {motosUnicas.length > 1 && (
                <select
                  aria-label="Filtrar histórico por moto"
                  value={filtroMoto}
                  onChange={(e) => setFiltroMoto(e.target.value)}
                  className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground"
                >
                  <option value="TODAS">Todas as motos ({motosUnicas.length})</option>
                  {motosUnicas.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-4">
          {registrosFiltrados.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground sm:text-sm">
              {registros.length === 0
                ? 'Nenhum serviço registrado ainda. Use o formulário acima para anotar sua primeira manutenção.'
                : 'Nenhum registro corresponde aos filtros selecionados.'}
            </p>
          ) : (
            <div className="space-y-2.5">
              {registrosFiltrados.map((reg) => (
                <div
                  key={reg.id}
                  className="flex flex-col justify-between gap-2.5 rounded-xl border border-border/75 bg-background/55 p-3.5 sm:flex-row sm:items-start"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={cn('text-[10px]', CATEGORIA_CADERNETA_BADGE[reg.categoria])}
                      >
                        {reg.categoria}
                      </Badge>
                      <span className="text-xs font-bold text-foreground">{reg.moto}</span>
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                        <Calendar className="size-3" />
                        {formatarDataBr(reg.data)}
                      </span>
                      {reg.km > 0 && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-primary">
                          <Gauge className="size-3" />
                          {reg.km.toLocaleString('pt-BR')} km
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-foreground">{reg.descricao}</p>

                    {reg.observacao && (
                      <p className="text-xs text-muted-foreground">Obs.: {reg.observacao}</p>
                    )}
                  </div>

                  {/* Botão de excluir individual com confirmação simples (oculto na impressão) */}
                  <div className="no-print flex shrink-0 items-center gap-1.5 self-end sm:self-start">
                    {confirmandoExclusaoId === reg.id ? (
                      <>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          data-compact="true"
                          onClick={() => excluirRegistro(reg.id)}
                          className="h-7 px-2 text-[11px]"
                        >
                          Confirmar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          data-compact="true"
                          onClick={() => setConfirmandoExclusaoId(null)}
                          className="h-7 px-2 text-[11px]"
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        data-compact="true"
                        onClick={() => setConfirmandoExclusaoId(reg.id)}
                        aria-label={`Excluir registro ${reg.descricao}`}
                        className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only sm:not-sr-only">Excluir</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
