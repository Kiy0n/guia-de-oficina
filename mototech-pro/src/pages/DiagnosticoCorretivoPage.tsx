import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  RotateCcw,
  Search,
  Sparkles,
  Stethoscope,
  XCircle,
} from 'lucide-react';

import { SectionHeader } from '@/components/SectionHeader';
import { SpotlightCard } from '@/components/SpotlightCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMoto, useMotoSelecionada } from '@/context/MotoContext';
import { useToast } from '@/context/ToastContext';
import {
  CENARIOS_DIAGNOSTICO,
  SISTEMAS_DIAGNOSTICO,
  SISTEMA_DIAGNOSTICO_LABEL,
  etapaDestacadaParaMoto,
  type CenarioDiagnosticoCorretivo,
  type SistemaDiagnostico,
} from '@/data/diagnosticos';
import { SECTIONS } from '@/lib/sections';
import { cn } from '@/lib/utils';

type StatusEtapa = 'pendente' | 'ok' | 'falha';

export function DiagnosticoCorretivoPage() {
  const moto = useMotoSelecionada();
  const { setSection } = useMoto();
  const { mostrarToast } = useToast();

  const [busca, setBusca] = useState<string>('');
  const [sistemaFiltro, setSistemaFiltro] = useState<SistemaDiagnostico | 'todos'>('todos');
  const [cenarioAtivoId, setCenarioAtivoId] = useState<string>(
    CENARIOS_DIAGNOSTICO[0]?.id ?? 'motor-gira-nao-pega',
  );
  const [statusEtapas, setStatusEtapas] = useState<Record<string, StatusEtapa>>({});
  const [copiadoResumo, setCopiadoResumo] = useState<boolean>(false);

  const def = SECTIONS.find((s) => s.id === 'diagnostico') ?? SECTIONS[0];
  const f = moto.geracao.fichaTecnica;

  const cenariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return CENARIOS_DIAGNOSTICO.filter((c) => {
      if (sistemaFiltro !== 'todos' && c.sistema !== sistemaFiltro) return false;
      if (!termo) return true;
      const texto = [
        c.sintoma,
        c.resumo,
        ...c.etapas.map(
          (e) => `${e.titulo} ${e.oQueVerificar} ${e.causaProvavelSeFalhar} ${e.solucaoSugerida}`,
        ),
      ]
        .join(' ')
        .toLowerCase();
      return texto.includes(termo);
    });
  }, [busca, sistemaFiltro]);

  const cenarioAtivo: CenarioDiagnosticoCorretivo | undefined = useMemo(
    () =>
      cenariosFiltrados.find((c) => c.id === cenarioAtivoId) ??
      cenariosFiltrados[0] ??
      CENARIOS_DIAGNOSTICO[0],
    [cenariosFiltrados, cenarioAtivoId],
  );

  if (!def) return null;

  const definirStatusEtapa = (etapaId: string, novo: StatusEtapa) => {
    setStatusEtapas((prev) => ({
      ...prev,
      [etapaId]: prev[etapaId] === novo ? 'pendente' : novo,
    }));
  };

  const resetarDiagnosticoAtual = () => {
    if (!cenarioAtivo) return;
    setStatusEtapas((prev) => {
      const copia = { ...prev };
      for (const e of cenarioAtivo.etapas) {
        delete copia[e.id];
      }
      return copia;
    });
  };

  const handleCopiarResumoDiagnostico = async (cenario: CenarioDiagnosticoCorretivo) => {
    const falhas = cenario.etapas.filter((e) => statusEtapas[e.id] === 'falha');
    const verificadosOk = cenario.etapas.filter((e) => statusEtapas[e.id] === 'ok');

    const linhas: string[] = [
      `🩺 *MOTOTECH PRO — RESUMO DE DIAGNÓSTICO*`,
      `🏍️ *Moto:* ${moto.marca} ${moto.modelo.nome} (${moto.geracao.anosLabel})`,
      `⚠️ *Sintoma:* ${cenario.sintoma}`,
      `----------------------------------------`,
    ];

    if (falhas.length > 0) {
      linhas.push(`❌ *Defeito(s) Identificado(s) (${falhas.length}):*`);
      for (const e of falhas) {
        linhas.push(`• ${e.titulo}`);
        linhas.push(`   ↳ Causa: ${e.causaProvavelSeFalhar}`);
        linhas.push(`   ↳ Solução: ${e.solucaoSugerida}`);
      }
    }

    if (verificadosOk.length > 0) {
      linhas.push(`✅ *Testes Aprovados (${verificadosOk.length}):*`);
      for (const e of verificadosOk) {
        linhas.push(`• ${e.titulo}`);
      }
    }

    if (falhas.length === 0 && verificadosOk.length === 0) {
      linhas.push(`📋 *Roteiro de verificação:* ${cenario.resumo}`);
    }

    const texto = linhas.join('\n');
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const area = document.createElement('textarea');
      area.value = texto;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }

    setCopiadoResumo(true);
    mostrarToast({
      dedupeKey: 'copiar-resumo-diagnostico',
      titulo: 'Resumo do diagnóstico copiado para WhatsApp!',
      variante: 'sucesso',
      duracaoMs: 2400,
    });
    window.setTimeout(() => setCopiadoResumo(false), 2400);
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader section={def}>
        <Badge variant="outline" className="gap-1.5 px-2.5 py-1">
          <Sparkles className="size-3.5 text-primary" />
          Filtro inteligente: {f.alimentacao === 'injecao' ? 'Injetada' : 'Carburada'} ·{' '}
          {f.cambio.tipo === 'cvt' ? 'CVT' : 'Corrente'} · Freios{' '}
          {f.freios.dianteiro}/{f.freios.traseiro}
        </Badge>
      </SectionHeader>

      {/* ------------------------------------------------------------------ */}
      {/* Barra de Busca e Filtro por Sistema                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card/80 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder='Descreva o defeito ou sintoma (ex.: "não pega", "estalo no relé", "morre no semáforo", "bateria", "barulho", "sambando")...'
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            variant={sistemaFiltro === 'todos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSistemaFiltro('todos')}
            className="h-8 text-xs"
          >
            Todos os 10 Cenários
          </Button>
          {SISTEMAS_DIAGNOSTICO.map((sis) => (
            <Button
              key={sis}
              type="button"
              variant={sistemaFiltro === sis ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSistemaFiltro(sis)}
              className="h-8 text-xs"
            >
              {SISTEMA_DIAGNOSTICO_LABEL[sis]}
            </Button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Layout Principal: Índice de Sintomas (Esquerda) + Roteiro (Direita)*/}
      {/* ------------------------------------------------------------------ */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Lista dos 10 cenários de defeito */}
        <div className="space-y-2.5 lg:col-span-4">
          <p className="px-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Selecione o Sintoma na Bancada ({cenariosFiltrados.length})
          </p>
          {cenariosFiltrados.map((cenario) => {
            const ativo = cenario.id === cenarioAtivo?.id;
            const falhasCount = cenario.etapas.filter((e) => statusEtapas[e.id] === 'falha').length;
            const okCount = cenario.etapas.filter((e) => statusEtapas[e.id] === 'ok').length;

            return (
              <SpotlightCard
                key={cenario.id}
                marca={moto.marca}
                intensity="subtle"
                onClick={() => setCenarioAtivoId(cenario.id)}
                className={cn(
                  'cursor-pointer p-3.5 transition-all',
                  ativo
                    ? 'border-primary/70 bg-primary/10 shadow-md'
                    : 'hover:border-border',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold',
                        ativo
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {cenario.numero}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {SISTEMA_DIAGNOSTICO_LABEL[cenario.sistema]}
                    </Badge>
                  </div>

                  {(falhasCount > 0 || okCount > 0) && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-mono text-[10px]',
                        falhasCount > 0
                          ? 'border-rose-500/40 bg-rose-500/15 text-rose-300'
                          : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
                      )}
                    >
                      {falhasCount > 0 ? `${falhasCount} falha(s)` : `${okCount} OK`}
                    </Badge>
                  )}
                </div>

                <p className="mt-2 text-sm font-bold leading-snug text-foreground">
                  {cenario.sintoma}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {cenario.resumo}
                </p>
              </SpotlightCard>
            );
          })}
        </div>

        {/* Checklist de Eliminação Passo a Passo do Cenário Ativo */}
        <div className="lg:col-span-8">
          {cenarioAtivo ? (
            <Card className="border-border/80 bg-card/90">
              <CardHeader className="border-b border-border/60 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Cenário #{cenarioAtivo.numero}</Badge>
                    <Badge variant="outline">
                      {SISTEMA_DIAGNOSTICO_LABEL[cenarioAtivo.sistema]}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetarDiagnosticoAtual}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <RotateCcw className="size-3.5" />
                      Resetar Diagnóstico
                    </Button>

                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => void handleCopiarResumoDiagnostico(cenarioAtivo)}
                      className="h-8 gap-1.5 text-xs"
                    >
                      {copiadoResumo ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      {copiadoResumo ? 'Resumo Copiado!' : 'Copiar Resumo (WhatsApp)'}
                    </Button>
                  </div>
                </div>

                <CardTitle className="mt-2 text-xl sm:text-2xl">
                  {cenarioAtivo.sintoma}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed sm:text-sm">
                  {cenarioAtivo.resumo}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-semibold uppercase">
                    <Stethoscope className="size-4 text-primary" />
                    Checklist de Eliminação (do teste mais rápido/barato ao mais complexo)
                  </span>
                </div>

                {cenarioAtivo.etapas.map((etapa) => {
                  const status = statusEtapas[etapa.id] ?? 'pendente';
                  const destaque = etapaDestacadaParaMoto(etapa.focoArquitetura, moto);

                  return (
                    <div
                      key={etapa.id}
                      className={cn(
                        'rounded-2xl border p-4 transition-all',
                        status === 'ok' && 'border-emerald-500/45 bg-emerald-500/8',
                        status === 'falha' && 'border-rose-500/55 bg-rose-500/10 shadow-md',
                        status === 'pendente' &&
                          (destaque.aplicaDireto
                            ? 'border-border/80 bg-background/60'
                            : 'border-border/40 bg-background/25 opacity-65'),
                      )}
                    >
                      {/* Cabeçalho da etapa + Botões de marcação OK / Falha */}
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {destaque.aplicaDireto ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-300"
                              >
                                Aplicável à {moto.modelo.nome} ({moto.geracao.anosLabel})
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-zinc-500/40 bg-zinc-500/10 text-[10px] text-muted-foreground"
                              >
                                Outra arquitetura ({destaque.badgeLabel})
                              </Badge>
                            )}
                            {destaque.badgeLabel && destaque.aplicaDireto && (
                              <Badge variant="secondary" className="text-[10px]">
                                {destaque.badgeLabel}
                              </Badge>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-foreground sm:text-base">
                            {etapa.titulo}
                          </h4>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <Button
                            type="button"
                            variant={status === 'ok' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => definirStatusEtapa(etapa.id, 'ok')}
                            className={cn(
                              'h-8 gap-1 text-xs',
                              status === 'ok' &&
                                'bg-emerald-600 text-white hover:bg-emerald-500',
                            )}
                          >
                            <CheckCircle2 className="size-3.5" />
                            Teste OK
                          </Button>

                          <Button
                            type="button"
                            variant={status === 'falha' ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => definirStatusEtapa(etapa.id, 'falha')}
                            className="h-8 gap-1 text-xs"
                          >
                            <XCircle className="size-3.5" />
                            Achei Defeito
                          </Button>
                        </div>
                      </div>

                      {/* Corpo da etapa: O que verificar + Causa provável + Solução */}
                      <div className="mt-3 grid gap-2.5 text-xs sm:grid-cols-2">
                        <div className="rounded-xl border bg-card/80 p-3">
                          <p className="font-bold text-primary">O que verificar na bancada:</p>
                          <p className="mt-1 leading-relaxed text-foreground/90">
                            {etapa.oQueVerificar}
                          </p>
                        </div>

                        <div className="rounded-xl border border-amber-500/25 bg-amber-500/6 p-3">
                          <p className="flex items-center gap-1 font-bold text-amber-300">
                            <AlertTriangle className="size-3.5" />
                            Se falhar — Causa provável & Solução:
                          </p>
                          <p className="mt-1 leading-relaxed text-muted-foreground">
                            {etapa.causaProvavelSeFalhar}
                          </p>
                          <p className="mt-1.5 font-medium text-emerald-300">
                            → {etapa.solucaoSugerida}
                          </p>
                        </div>
                      </div>

                      {/* Atalho direto para a aba técnica relacionada */}
                      {etapa.atalhoSecao && (
                        <div className="mt-3 flex justify-end">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setSection(etapa.atalhoSecao!.sectionId)}
                            className="h-7 gap-1.5 text-xs"
                          >
                            <span>{etapa.atalhoSecao.label}</span>
                            <ArrowRight className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
