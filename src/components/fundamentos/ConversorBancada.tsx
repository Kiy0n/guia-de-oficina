import { useState } from 'react';
import { Calculator, Gauge, Ruler, Wrench } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const NM_POR_KGFM = 9.80665;
const NM_POR_LBFFT = 1.35582;
const PSI_POR_BAR = 14.5038;
const KPA_POR_BAR = 100;
const MM_POR_POL = 25.4;

function parseDecimal(raw: string): number | null {
  const limpo = raw.trim().replace(',', '.');
  if (!limpo) return null;
  const n = Number(limpo);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function formatarDecimal(valor: number, casas: number): string {
  if (!Number.isFinite(valor)) return '';
  return Number(valor.toFixed(casas)).toString().replace('.', ',');
}

function mdc(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/**
 * Converte polegadas decimais em fração aproximada de chave (denominador até 32 avos).
 */
function polegadasParaFracao(pol: number): string {
  if (!Number.isFinite(pol) || pol <= 0) return '—';
  if (pol < 1 / 64) return '< 1/64" (lâmina fina)';

  const inteiros = Math.floor(pol);
  const resto = pol - inteiros;
  const base = 32;
  let num = Math.round(resto * base);
  let den = base;

  if (num === 0) {
    return `${inteiros}"`;
  }
  if (num === base) {
    return `${inteiros + 1}"`;
  }

  const divisor = mdc(num, den);
  num /= divisor;
  den /= divisor;

  return inteiros > 0 ? `${inteiros} ${num}/${den}"` : `${num}/${den}"`;
}

export function ConversorBancada() {
  // 1. Torque (padrão inicial: 24 N·m — bujão de óleo clássico)
  const [nm, setNm] = useState<string>('24');
  const [kgfm, setKgfm] = useState<string>(formatarDecimal(24 / NM_POR_KGFM, 2));
  const [lbfft, setLbfft] = useState<string>(formatarDecimal(24 / NM_POR_LBFFT, 2));

  // 2. Pressão de Pneus (padrão inicial: 29 PSI)
  const [psi, setPsi] = useState<string>('29');
  const [bar, setBar] = useState<string>(formatarDecimal(29 / PSI_POR_BAR, 2));
  const [kpa, setKpa] = useState<string>(formatarDecimal((29 / PSI_POR_BAR) * KPA_POR_BAR, 0));

  // 3. Comprimento / Folgas (padrão inicial: 12,7 mm = 1/2")
  const [mm, setMm] = useState<string>('12,7');
  const [pol, setPol] = useState<string>(formatarDecimal(12.7 / MM_POR_POL, 4));

  // Handlers de Torque
  const atualizarPorNm = (raw: string) => {
    setNm(raw);
    const val = parseDecimal(raw);
    if (val === null) {
      setKgfm('');
      setLbfft('');
      return;
    }
    setKgfm(formatarDecimal(val / NM_POR_KGFM, 2));
    setLbfft(formatarDecimal(val / NM_POR_LBFFT, 2));
  };

  const atualizarPorKgfm = (raw: string) => {
    setKgfm(raw);
    const val = parseDecimal(raw);
    if (val === null) {
      setNm('');
      setLbfft('');
      return;
    }
    const emNm = val * NM_POR_KGFM;
    setNm(formatarDecimal(emNm, 2));
    setLbfft(formatarDecimal(emNm / NM_POR_LBFFT, 2));
  };

  const atualizarPorLbfft = (raw: string) => {
    setLbfft(raw);
    const val = parseDecimal(raw);
    if (val === null) {
      setNm('');
      setKgfm('');
      return;
    }
    const emNm = val * NM_POR_LBFFT;
    setNm(formatarDecimal(emNm, 2));
    setKgfm(formatarDecimal(emNm / NM_POR_KGFM, 2));
  };

  // Handlers de Pressão
  const atualizarPorPsi = (raw: string) => {
    setPsi(raw);
    const val = parseDecimal(raw);
    if (val === null) {
      setBar('');
      setKpa('');
      return;
    }
    const emBar = val / PSI_POR_BAR;
    setBar(formatarDecimal(emBar, 2));
    setKpa(formatarDecimal(emBar * KPA_POR_BAR, 0));
  };

  const atualizarPorBar = (raw: string) => {
    setBar(raw);
    const val = parseDecimal(raw);
    if (val === null) {
      setPsi('');
      setKpa('');
      return;
    }
    setPsi(formatarDecimal(val * PSI_POR_BAR, 1));
    setKpa(formatarDecimal(val * KPA_POR_BAR, 0));
  };

  const atualizarPorKpa = (raw: string) => {
    setKpa(raw);
    const val = parseDecimal(raw);
    if (val === null) {
      setPsi('');
      setBar('');
      return;
    }
    const emBar = val / KPA_POR_BAR;
    setBar(formatarDecimal(emBar, 2));
    setPsi(formatarDecimal(emBar * PSI_POR_BAR, 1));
  };

  // Handlers de Comprimento / Folgas
  const atualizarPorMm = (raw: string) => {
    setMm(raw);
    const val = parseDecimal(raw);
    if (val === null) {
      setPol('');
      return;
    }
    setPol(formatarDecimal(val / MM_POR_POL, 4));
  };

  const atualizarPorPol = (raw: string) => {
    setPol(raw);
    const val = parseDecimal(raw);
    if (val === null) {
      setMm('');
      return;
    }
    setMm(formatarDecimal(val * MM_POR_POL, 2));
  };

  const polNumerico = parseDecimal(pol);
  const fracaoAproximada = polNumerico !== null ? polegadasParaFracao(polNumerico) : '—';

  return (
    <section aria-label="Conversor Rápido de Oficina" className="no-print space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calculator className="size-4 text-primary" />
          <h2 className="text-base font-bold text-foreground sm:text-lg">
            Conversor Rápido de Oficina (Tempo Real)
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">
          Aceita vírgula ou ponto decimal — atualiza instantaneamente
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ---------------------------------------------------------------- */}
        {/* 1. Torque (N·m ↔ kgf·m ↔ lbf·ft)                                 */}
        {/* ---------------------------------------------------------------- */}
        <Card className="border-border/80 bg-card/90">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/15 text-[11px] text-amber-700 dark:text-amber-300"
              >
                <Wrench className="mr-1 size-3" />
                Torque
              </Badge>
              <span className="font-mono text-[10px] text-muted-foreground">1 kgf·m = 9,81 N·m</span>
            </div>
            <CardTitle className="mt-1 text-base">Torque de Aperto</CardTitle>
            <CardDescription className="text-xs">
              Converta entre N·m, kgf·m e lbf·ft para ajustar seu torquímetro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Newton-metro (N·m)
                </label>
                <Input
                  inputMode="decimal"
                  value={nm}
                  onChange={(e) => atualizarPorNm(e.target.value)}
                  placeholder="Ex.: 24"
                  className="h-9 font-mono text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">kgf·m</label>
                  <Input
                    inputMode="decimal"
                    value={kgfm}
                    onChange={(e) => atualizarPorKgfm(e.target.value)}
                    placeholder="Ex.: 2,45"
                    className="h-9 font-mono text-sm font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">lbf·ft</label>
                  <Input
                    inputMode="decimal"
                    value={lbfft}
                    onChange={(e) => atualizarPorLbfft(e.target.value)}
                    placeholder="Ex.: 17,7"
                    className="h-9 font-mono text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-2.5">
              <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Atalhos comuns de bancada:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { valor: '12', dica: 'Tampas / Vela' },
                  { valor: '24', dica: 'Bujão de óleo' },
                  { valor: '59', dica: 'Eixo dianteiro' },
                  { valor: '88', dica: 'Eixo traseiro' },
                ].map((preset) => (
                  <button
                    key={preset.valor}
                    type="button"
                    data-compact="true"
                    onClick={() => atualizarPorNm(preset.valor)}
                    title={preset.dica}
                    className="rounded-md border border-border/80 bg-background/70 px-2 py-1 font-mono text-[11px] font-semibold text-foreground/90 transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  >
                    {preset.valor} N·m
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---------------------------------------------------------------- */}
        {/* 2. Pressão de Pneus (PSI ↔ bar ↔ kPa)                            */}
        {/* ---------------------------------------------------------------- */}
        <Card className="border-border/80 bg-card/90">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="outline"
                className="border-sky-500/40 bg-sky-500/15 text-[11px] text-sky-700 dark:text-sky-300"
              >
                <Gauge className="mr-1 size-3" />
                Calibragem
              </Badge>
              <span className="font-mono text-[10px] text-muted-foreground">1 bar = 14,50 PSI</span>
            </div>
            <CardTitle className="mt-1 text-base">Pressão de Pneus</CardTitle>
            <CardDescription className="text-xs">
              Converta rapidamente PSI (libras) para bar ou kPa (manuais oficiais).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Libras (PSI)
                </label>
                <Input
                  inputMode="decimal"
                  value={psi}
                  onChange={(e) => atualizarPorPsi(e.target.value)}
                  placeholder="Ex.: 29"
                  className="h-9 font-mono text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">bar</label>
                  <Input
                    inputMode="decimal"
                    value={bar}
                    onChange={(e) => atualizarPorBar(e.target.value)}
                    placeholder="Ex.: 2,00"
                    className="h-9 font-mono text-sm font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">kPa</label>
                  <Input
                    inputMode="decimal"
                    value={kpa}
                    onChange={(e) => atualizarPorKpa(e.target.value)}
                    placeholder="Ex.: 200"
                    className="h-9 font-mono text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-2.5">
              <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Atalhos comuns de moto (frio):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['25', '29', '33', '36'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    data-compact="true"
                    onClick={() => atualizarPorPsi(val)}
                    className="rounded-md border border-border/80 bg-background/70 px-2 py-1 font-mono text-[11px] font-semibold text-foreground/90 transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  >
                    {val} PSI
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---------------------------------------------------------------- */}
        {/* 3. Comprimento / Folgas (mm ↔ pol + fração de chave)             */}
        {/* ---------------------------------------------------------------- */}
        <Card className="border-border/80 bg-card/90">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/15 text-[11px] text-emerald-700 dark:text-emerald-300"
              >
                <Ruler className="mr-1 size-3" />
                Chaves & Lâminas
              </Badge>
              <span className="font-mono text-[10px] text-muted-foreground">1 pol = 25,4 mm</span>
            </div>
            <CardTitle className="mt-1 text-base">Comprimento & Folgas</CardTitle>
            <CardDescription className="text-xs">
              Converta mm e polegadas para conferir chaves combinadas e lâminas de calibre.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Milímetros (mm)
                </label>
                <Input
                  inputMode="decimal"
                  value={mm}
                  onChange={(e) => atualizarPorMm(e.target.value)}
                  placeholder="Ex.: 12,7"
                  className="h-9 font-mono text-sm font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Polegada decimal (pol)
                </label>
                <Input
                  inputMode="decimal"
                  value={pol}
                  onChange={(e) => atualizarPorPol(e.target.value)}
                  placeholder="Ex.: 0,5"
                  className="h-9 font-mono text-sm font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                Fração aprox. de chave:
              </span>
              <span className="font-mono text-sm font-extrabold text-foreground">
                {fracaoAproximada}
              </span>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-2.5">
              <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Atalhos rápidos:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { valor: '0,08', label: '0,08 mm' },
                  { valor: '0,24', label: '0,24 mm' },
                  { valor: '12,7', label: '12,7 mm (1/2")' },
                  { valor: '19,05', label: '19 mm (3/4")' },
                ].map((item) => (
                  <button
                    key={item.valor}
                    type="button"
                    data-compact="true"
                    onClick={() => atualizarPorMm(item.valor)}
                    className="rounded-md border border-border/80 bg-background/70 px-2 py-1 font-mono text-[11px] font-semibold text-foreground/90 transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
