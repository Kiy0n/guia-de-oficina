import {
  CircleDot,
  Cog,
  Droplets,
  FileCheck2,
  Flame,
  Gauge,
  ShieldAlert,
  SlidersHorizontal,
  Wrench,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useMotoSelecionada } from '@/context/MotoContext';
import { BRAND_THEME } from '@/lib/brands';
import { cn } from '@/lib/utils';
import { formatFaixa, formatNumero, nmParaKgfm } from '@/utils/format';

export interface ColaRapidaSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ColaRapidaSheet({ open, onOpenChange }: ColaRapidaSheetProps) {
  const moto = useMotoSelecionada();
  const { marca, modelo, geracao } = moto;
  const f = geracao.fichaTecnica;
  const theme = BRAND_THEME[marca];
  const isAuditado = geracao.auditoria.status === 'verificado_manual';

  const oleo = f.fluidos?.oleoMotor;
  const vela = f.eletrica?.vela;
  const pD = f.pneus?.dianteiro;
  const pT = f.pneus?.traseiro;
  const rel = f.transmissaoFinal;
  const isCvt = f.cambio.tipo === 'cvt' || rel?.tipo === 'correia';
  const torques = f.torques ?? [];

  const torqueBujao = torques.find(
    (t) =>
      t.item.toLowerCase().includes('drenagem') ||
      t.item.toLowerCase().includes('óleo') ||
      t.item.toLowerCase().includes('tela'),
  );
  const torqueEixoDiant = torques.find((t) => t.item.toLowerCase().includes('eixo dianteiro'));
  const torqueEixoTras = torques.find(
    (t) =>
      t.item.toLowerCase().includes('eixo traseiro') ||
      t.item.toLowerCase().includes('roda traseira'),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[94vw] overflow-y-auto p-5 sm:max-w-md">
        <SheetHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={theme.badge}>{marca}</Badge>
            <Badge variant="outline" className="font-mono text-xs">
              {geracao.anosLabel}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'gap-1 text-[11px]',
                isAuditado
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-300',
              )}
            >
              {isAuditado ? (
                <>
                  <FileCheck2 className="size-3" />
                  Manual Oficial
                </>
              ) : (
                <>
                  <ShieldAlert className="size-3" />
                  Base Fábrica
                </>
              )}
            </Badge>
          </div>
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Gauge className="size-5 text-primary" />
            Cola Rápida — {modelo.nome}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {geracao.nomeGeracao} · Consulta instantânea sem sair da tela atual.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3">
          {/* 1. Óleo */}
          <div className="rounded-xl border bg-card/80 p-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
              <span>1. Óleo do Motor</span>
              <Droplets className="size-4 text-primary" />
            </div>
            <p className="mt-1 font-mono text-xl font-extrabold text-foreground">
              {oleo
                ? `${formatNumero(oleo.capacidadeTrocaL)} L${oleo.capacidadeTrocaComFiltroL ? ` (${formatNumero(oleo.capacidadeTrocaComFiltroL)} L c/ filtro)` : ''}`
                : '—'}
            </p>
            <p className="mt-0.5 text-xs font-medium text-primary">{oleo?.especificacao ?? '—'}</p>
            {oleo?.capacidadeTotalL && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Desmontagem total: {formatNumero(oleo.capacidadeTotalL)} L
              </p>
            )}
          </div>

          {/* 2. Folga de Válvulas */}
          <div className="rounded-xl border bg-card/80 p-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
              <span>2. Válvulas (Motor Frio &lt; 35 °C)</span>
              <SlidersHorizontal className="size-4 text-primary" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-lg border bg-background/60 p-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Admissão</p>
                <p className="font-mono text-base font-extrabold text-foreground">
                  {formatFaixa(f.folgas?.valvulaAdmissaoMm)}
                </p>
              </div>
              <div className="rounded-lg border bg-background/60 p-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Escape</p>
                <p className="font-mono text-base font-extrabold text-foreground">
                  {formatFaixa(f.folgas?.valvulaEscapeMm)}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Vela NGK */}
          <div className="rounded-xl border bg-card/80 p-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
              <span>3. Vela de Ignição</span>
              <Flame className="size-4 text-primary" />
            </div>
            <p className="mt-1 font-mono text-lg font-extrabold text-foreground">
              {vela?.modelo ?? '—'}
            </p>
            <p className="text-xs text-muted-foreground">
              Folga eletrodo: <strong className="font-mono">{formatFaixa(vela?.folgaEletrodoMm)}</strong>
            </p>
          </div>

          {/* 4. Calibragem PSI */}
          <div className="rounded-xl border bg-card/80 p-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
              <span>4. Calibragem Pneus (PSI)</span>
              <CircleDot className="size-4 text-primary" />
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-2 font-mono text-sm font-bold">
              <div className="rounded-lg border bg-background/60 p-2">
                <span className="block text-[10px] font-normal text-muted-foreground">1 Pessoa (D/T)</span>
                {pD?.pressaoPsi ?? '—'} / {pT?.pressaoPsi ?? '—'} PSI
              </div>
              <div className="rounded-lg border bg-background/60 p-2">
                <span className="block text-[10px] font-normal text-muted-foreground">C/ Garupa (D/T)</span>
                {pD?.pressaoComGarupaPsi ?? pD?.pressaoPsi ?? '—'} /{' '}
                {pT?.pressaoComGarupaPsi ?? pT?.pressaoPsi ?? '—'} PSI
              </div>
            </div>
            <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
              D: {pD?.medida ?? '—'} · T: {pT?.medida ?? '—'}
            </p>
          </div>

          {/* 5. Relação / CVT */}
          <div className="rounded-xl border bg-card/80 p-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
              <span>5. {isCvt ? 'Transmissão CVT' : 'Kit Relação & Folga'}</span>
              <Cog className="size-4 text-primary" />
            </div>
            {isCvt ? (
              <div className="mt-1 space-y-0.5 text-xs">
                <p className="font-mono font-bold text-foreground">
                  {rel?.cvtDetalhe?.correiaCodigo ?? 'Correia V-Belt'}
                </p>
                <p className="text-muted-foreground">
                  Óleo Final:{' '}
                  {f.fluidos?.oleoTransmissaoCvt
                    ? `${formatNumero(f.fluidos.oleoTransmissaoCvt.capacidadeL)} L`
                    : '100–120 ml'}
                </p>
              </div>
            ) : (
              <div className="mt-1 space-y-0.5">
                <p className="font-mono text-lg font-extrabold text-foreground">
                  {rel?.pinhaoDentes ?? '—'}Z × {rel?.coroaDentes ?? '—'}Z
                </p>
                <p className="text-xs text-muted-foreground">
                  Folga corrente:{' '}
                  <strong className="font-mono text-primary">
                    {formatFaixa(f.folgas?.folgaCorrenteMm)}
                  </strong>{' '}
                  · {rel?.corrente ?? '428H'}
                </p>
              </div>
            )}
          </div>

          {/* 6. Torques Críticos */}
          <div className="rounded-xl border bg-card/80 p-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
              <span>6. Torques Críticos</span>
              <Wrench className="size-4 text-primary" />
            </div>
            <div className="mt-2 space-y-1.5 text-xs">
              {torqueBujao && (
                <div className="flex items-center justify-between rounded-lg border bg-background/60 px-2.5 py-1.5">
                  <span className="truncate pr-2 text-muted-foreground">Bujão / Dreno Óleo</span>
                  <span className="shrink-0 font-mono font-bold text-primary">
                    {torqueBujao.torque.valor} N·m ({nmParaKgfm(torqueBujao.torque.valor)} kgf·m)
                  </span>
                </div>
              )}
              {torqueEixoDiant && (
                <div className="flex items-center justify-between rounded-lg border bg-background/60 px-2.5 py-1.5">
                  <span className="truncate pr-2 text-muted-foreground">Eixo Dianteiro</span>
                  <span className="shrink-0 font-mono font-bold text-primary">
                    {torqueEixoDiant.torque.valor} N·m ({nmParaKgfm(torqueEixoDiant.torque.valor)} kgf·m)
                  </span>
                </div>
              )}
              {torqueEixoTras && (
                <div className="flex items-center justify-between rounded-lg border bg-background/60 px-2.5 py-1.5">
                  <span className="truncate pr-2 text-muted-foreground">Eixo Traseiro</span>
                  <span className="shrink-0 font-mono font-bold text-primary">
                    {torqueEixoTras.torque.valor} N·m ({nmParaKgfm(torqueEixoTras.torque.valor)} kgf·m)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
