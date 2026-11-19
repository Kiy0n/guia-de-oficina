import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

import {
  ZONA_VISUAL_INFO,
  type PassoRevisao,
  type RegistroFeedbackPasso,
  type ZonaVisualMoto,
} from '@/data/roteiroRevisao';
import { cn } from '@/lib/utils';
import type { Marca } from '@/types/moto';

export interface MotoBlueprintVisualProps {
  marca: Marca;
  isScooter: boolean;
  zonaAtiva: ZonaVisualMoto;
  passoAtual: PassoRevisao;
  passos: PassoRevisao[];
  registros: Record<string, RegistroFeedbackPasso>;
  onSelectZona?: (zona: ZonaVisualMoto) => void;
}

interface HotspotCoord {
  zona: Exclude<ZonaVisualMoto, 'geral'>;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
}

const HOTSPOTS_MOTO: readonly HotspotCoord[] = [
  { zona: 'frente_roda', x: 515, y: 222, labelX: 430, labelY: 278 },
  { zona: 'bengala', x: 472, y: 146, labelX: 460, labelY: 44 },
  { zona: 'direcao_guidao', x: 432, y: 78, labelX: 350, labelY: 28 },
  { zona: 'motor_topo', x: 344, y: 158, labelX: 255, labelY: 42 },
  { zona: 'motor_oleo', x: 332, y: 214, labelX: 250, labelY: 278 },
  { zona: 'alimentacao', x: 294, y: 138, labelX: 180, labelY: 36 },
  { zona: 'eletrica_bateria', x: 245, y: 148, labelX: 130, labelY: 44 },
  { zona: 'transmissao_balanca', x: 218, y: 212, labelX: 115, labelY: 278 },
  { zona: 'traseira_freio', x: 132, y: 222, labelX: 70, labelY: 278 },
];

const HOTSPOTS_SCOOTER: readonly HotspotCoord[] = [
  { zona: 'frente_roda', x: 506, y: 230, labelX: 420, labelY: 282 },
  { zona: 'bengala', x: 474, y: 168, labelX: 460, labelY: 44 },
  { zona: 'direcao_guidao', x: 434, y: 82, labelX: 350, labelY: 28 },
  { zona: 'motor_topo', x: 288, y: 186, labelX: 235, labelY: 42 },
  { zona: 'motor_oleo', x: 278, y: 226, labelX: 220, labelY: 282 },
  { zona: 'alimentacao', x: 266, y: 152, labelX: 175, labelY: 36 },
  { zona: 'eletrica_bateria', x: 362, y: 204, labelX: 310, labelY: 282 },
  { zona: 'transmissao_balanca', x: 208, y: 216, labelX: 110, labelY: 282 },
  { zona: 'traseira_freio', x: 144, y: 230, labelX: 70, labelY: 282 },
];

const COR_MARCA_HEX: Record<Marca, string> = {
  Honda: '#ef4444',
  Yamaha: '#3b82f6',
  Suzuki: '#eab308',
};

type EstadoVisualZona = 'pendente' | 'ok' | 'substituido' | 'atencao';

function resolverEstadoZona(
  zona: ZonaVisualMoto,
  passos: PassoRevisao[],
  registros: Record<string, RegistroFeedbackPasso>,
): EstadoVisualZona {
  const passosZona = passos.filter((p) => p.zonaVisual === zona);
  if (passosZona.length === 0) return 'pendente';

  const feedbacks = passosZona
    .map((p) => registros[p.id]?.status)
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  if (feedbacks.length === 0) return 'pendente';
  if (feedbacks.includes('trocar_em_breve')) return 'atencao';
  if (feedbacks.includes('substituido')) return 'substituido';
  return 'ok';
}

export function MotoBlueprintVisual({
  marca,
  isScooter,
  zonaAtiva,
  passoAtual,
  passos,
  registros,
  onSelectZona,
}: MotoBlueprintVisualProps) {
  const hotspots = isScooter ? HOTSPOTS_SCOOTER : HOTSPOTS_MOTO;
  const corMarca = COR_MARCA_HEX[marca];
  const infoAtiva = ZONA_VISUAL_INFO[zonaAtiva];
  const hotspotAtivo = hotspots.find((h) => h.zona === zonaAtiva);

  return (
    <div className="space-y-3.5">
      {/* ------------------------------------------------------------------ */}
      {/* Container Blueprint HUD                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-zinc-950 p-3 shadow-inner">
        {/* Grade técnica de fundo */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Cabeçalho HUD */}
        <div className="relative z-10 mb-1.5 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: corMarca, boxShadow: `0 0 10px ${corMarca}` }}
            />
            <span className="font-mono text-[11px] font-bold tracking-wider text-zinc-300 uppercase">
              HUD {isScooter ? 'SCOOTER CVT' : 'MOTO'} · ZONA EM INSPEÇÃO
            </span>
          </div>
          <span className="font-mono text-[11px] text-zinc-400">
            Clique nos pontos para navegar
          </span>
        </div>

        {/* SVG Técnico */}
        <svg
          viewBox="0 0 640 305"
          className="relative z-10 h-auto w-full select-none"
          role="img"
          aria-label={`Diagrama técnico destacando ${infoAtiva.callout}`}
        >
          {/* Linha de piso */}
          <line
            x1="40"
            y1="274"
            x2="600"
            y2="274"
            stroke="rgba(148,163,184,0.28)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />

          {/* Destaque global quando o passo é 'geral' */}
          {zonaAtiva === 'geral' && (
            <motion.rect
              x="54"
              y="46"
              width="532"
              height="226"
              rx="18"
              fill="none"
              stroke={corMarca}
              strokeWidth="2"
              strokeDasharray="8 6"
              initial={{ opacity: 0.35 }}
              animate={{ opacity: [0.35, 0.9, 0.35] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {isScooter ? (
            /* ============================================================= */
            /* SILHUETA TÉCNICA — MODO SCOOTER CVT                           */
            /* ============================================================= */
            <g
              fill="none"
              stroke="rgba(226,232,240,0.45)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Roda Traseira (Aro 13/14) */}
              <circle cx="144" cy="230" r="42" strokeWidth="4" stroke="rgba(226,232,240,0.55)" />
              <circle cx="144" cy="230" r="24" stroke="rgba(148,163,184,0.45)" />
              <circle cx="144" cy="230" r="7" fill="rgba(148,163,184,0.35)" />

              {/* Roda Dianteira (Aro 14) */}
              <circle cx="506" cy="230" r="42" strokeWidth="4" stroke="rgba(226,232,240,0.55)" />
              <circle cx="506" cy="230" r="24" stroke="rgba(148,163,184,0.45)" />
              <circle cx="506" cy="230" r="14" strokeDasharray="4 3" stroke="rgba(148,163,184,0.5)" />
              <circle cx="506" cy="230" r="6" fill="rgba(148,163,184,0.35)" />

              {/* Conjunto CVT / Balança Traseira em destaque técnico */}
              <rect
                x="138"
                y="198"
                width="136"
                height="36"
                rx="18"
                fill="rgba(30,41,59,0.55)"
                stroke="rgba(226,232,240,0.65)"
              />
              <circle cx="164" cy="216" r="11" stroke="rgba(148,163,184,0.55)" />
              <circle cx="248" cy="216" r="10" stroke="rgba(148,163,184,0.55)" />
              <line x1="164" y1="205" x2="248" y2="206" strokeDasharray="3 3" />
              <line x1="164" y1="227" x2="248" y2="226" strokeDasharray="3 3" />

              {/* Motor horizontal + Admissão */}
              <rect x="256" y="176" width="66" height="44" rx="8" fill="rgba(15,23,42,0.5)" />
              <line x1="270" y1="184" x2="310" y2="184" stroke="rgba(148,163,184,0.4)" />
              <line x1="270" y1="194" x2="310" y2="194" stroke="rgba(148,163,184,0.4)" />

              {/* Escudo frontal, assoalho e carenagem traseira */}
              <path d="M 424 88 L 474 96 L 516 144 L 496 196 L 444 214 L 336 218 L 288 164 L 122 150 L 146 116 L 296 122 L 338 172 L 420 174 L 434 114 Z" />
              {/* Banco duplo de scooter */}
              <path
                d="M 146 116 Q 220 100 302 122"
                strokeWidth="3.5"
                stroke="rgba(226,232,240,0.65)"
              />
              {/* Bolha / Para-brisa e Guidão */}
              <path d="M 434 84 L 466 54 L 480 86" stroke="rgba(148,163,184,0.6)" />
              <path d="M 412 80 L 446 84" strokeWidth="3.2" />
              {/* Suspensão Dianteira (Bengala) */}
              <line x1="454" y1="112" x2="506" y2="230" strokeWidth="4" />
              <line x1="464" y1="112" x2="514" y2="226" strokeWidth="1.5" stroke="rgba(148,163,184,0.4)" />
              {/* Amortecedor traseiro */}
              <line x1="168" y1="150" x2="152" y2="212" strokeWidth="3" strokeDasharray="4 2" />
              {/* Bateria no assoalho */}
              <rect x="346" y="190" width="32" height="24" rx="4" stroke="rgba(148,163,184,0.6)" />
            </g>
          ) : (
            /* ============================================================= */
            /* SILHUETA TÉCNICA — MODO MOTO (Street / Trail / Custom / Cub)  */
            /* ============================================================= */
            <g
              fill="none"
              stroke="rgba(226,232,240,0.45)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Roda Traseira */}
              <circle cx="132" cy="222" r="50" strokeWidth="4" stroke="rgba(226,232,240,0.55)" />
              <circle cx="132" cy="222" r="32" stroke="rgba(148,163,184,0.4)" />
              <circle cx="132" cy="222" r="12" stroke="rgba(148,163,184,0.55)" />

              {/* Roda Dianteira */}
              <circle cx="515" cy="222" r="50" strokeWidth="4" stroke="rgba(226,232,240,0.55)" />
              <circle cx="515" cy="222" r="32" stroke="rgba(148,163,184,0.4)" />
              <circle cx="515" cy="222" r="18" strokeDasharray="4 3" stroke="rgba(148,163,184,0.55)" />
              <circle cx="515" cy="222" r="7" fill="rgba(148,163,184,0.35)" />

              {/* Bengala / Suspensão Dianteira */}
              <line x1="432" y1="82" x2="515" y2="222" strokeWidth="4.5" />
              <line x1="442" y1="86" x2="523" y2="218" strokeWidth="1.5" stroke="rgba(148,163,184,0.4)" />
              {/* Para-lama dianteiro */}
              <path d="M 464 186 Q 515 162 556 184" />

              {/* Guidão & Farol */}
              <path d="M 404 76 L 440 78" strokeWidth="3.5" />
              <path d="M 454 96 L 482 104 L 478 124 L 452 120 Z" fill="rgba(30,41,59,0.55)" />

              {/* Tanque de Combustível */}
              <path
                d="M 294 128 Q 345 86 426 102 L 414 134 L 304 136 Z"
                fill="rgba(30,41,59,0.45)"
              />

              {/* Banco e Rabeta */}
              <path
                d="M 118 134 L 186 128 Q 244 136 294 128"
                strokeWidth="3.5"
                stroke="rgba(226,232,240,0.65)"
              />
              <path d="M 118 134 L 154 156 L 266 156 L 294 128" />

              {/* Quadro / Chassi */}
              <path d="M 424 106 L 386 218 L 266 218 L 288 138" stroke="rgba(148,163,184,0.55)" />

              {/* Bloco do Motor + Aletas do Cilindro */}
              <path
                d="M 306 146 L 372 146 L 382 222 L 296 222 Z"
                fill="rgba(15,23,42,0.6)"
                stroke="rgba(226,232,240,0.65)"
              />
              <line x1="316" y1="158" x2="366" y2="158" stroke="rgba(148,163,184,0.45)" />
              <line x1="316" y1="168" x2="366" y2="168" stroke="rgba(148,163,184,0.45)" />
              <line x1="316" y1="178" x2="366" y2="178" stroke="rgba(148,163,184,0.45)" />
              <circle cx="336" cy="206" r="14" stroke="rgba(148,163,184,0.5)" />

              {/* Balança Traseira + Corrente + Amortecedor */}
              <line x1="266" y1="216" x2="132" y2="222" strokeWidth="4" />
              <line x1="274" y1="205" x2="132" y2="210" strokeDasharray="3 3" stroke="rgba(148,163,184,0.55)" />
              <line x1="274" y1="227" x2="132" y2="234" strokeDasharray="3 3" stroke="rgba(148,163,184,0.55)" />
              <line x1="186" y1="146" x2="152" y2="218" strokeWidth="3" strokeDasharray="4 2" />

              {/* Escapamento */}
              <path d="M 366 174 Q 382 238 308 242 L 154 226" stroke="rgba(148,163,184,0.5)" />

              {/* Caixa de Bateria / Lateral */}
              <rect x="228" y="144" width="38" height="32" rx="4" stroke="rgba(148,163,184,0.55)" />
            </g>
          )}

          {/* --------------------------------------------------------------- */}
          {/* Linha Guia (Callout) apontando para a zona ativa                */}
          {/* --------------------------------------------------------------- */}
          {hotspotAtivo && (
            <g>
              <motion.line
                key={`line-${hotspotAtivo.zona}`}
                x1={hotspotAtivo.x}
                y1={hotspotAtivo.y}
                x2={hotspotAtivo.labelX}
                y2={hotspotAtivo.labelY}
                stroke={corMarca}
                strokeWidth="1.8"
                strokeDasharray="4 3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.9 }}
                transition={{ duration: 0.35 }}
              />
              <circle cx={hotspotAtivo.labelX} cy={hotspotAtivo.labelY} r="3" fill={corMarca} />
            </g>
          )}

          {/* --------------------------------------------------------------- */}
          {/* 9 Hotspots Clicáveis                                            */}
          {/* --------------------------------------------------------------- */}
          {hotspots.map((spot) => {
            const ativo = spot.zona === zonaAtiva;
            const estado = resolverEstadoZona(spot.zona, passos, registros);
            const temPassos = passos.some((p) => p.zonaVisual === spot.zona);

            let corPonto = 'rgba(148,163,184,0.55)';
            if (ativo) corPonto = corMarca;
            else if (estado === 'atencao') corPonto = '#f59e0b';
            else if (estado === 'substituido') corPonto = '#a855f7';
            else if (estado === 'ok') corPonto = '#10b981';

            return (
              <g
                key={spot.zona}
                onClick={() => temPassos && onSelectZona?.(spot.zona)}
                className={cn(temPassos ? 'cursor-pointer' : 'opacity-35')}
              >
                <title>
                  {ZONA_VISUAL_INFO[spot.zona].callout}
                  {temPassos ? ' (clique para ir a esta região)' : ''}
                </title>

                {/* Anel pulsante no hotspot ativo */}
                {ativo && (
                  <>
                    <motion.circle
                      cx={spot.x}
                      cy={spot.y}
                      r={18}
                      fill={corMarca}
                      fillOpacity={0.2}
                      stroke={corMarca}
                      strokeWidth={1.8}
                      animate={{ scale: [0.85, 1.35, 0.85], opacity: [0.85, 0.15, 0.85] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ transformOrigin: `${spot.x}px ${spot.y}px` }}
                    />
                    <circle
                      cx={spot.x}
                      cy={spot.y}
                      r={11}
                      fill="none"
                      stroke={corMarca}
                      strokeWidth={2}
                    />
                  </>
                )}

                {/* Alvo clicável invisível maior para facilitar toque/clique */}
                <circle cx={spot.x} cy={spot.y} r={16} fill="transparent" />

                {/* Núcleo do ponto */}
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={ativo ? 6.5 : 5}
                  fill={corPonto}
                  stroke="#09090b"
                  strokeWidth={2}
                />
              </g>
            );
          })}
        </svg>

        {/* Legenda Callout inferior do HUD */}
        <div className="relative z-10 mt-1 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-zinc-900/90 px-3 py-2">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: corMarca }}
            />
            <span>{infoAtiva.callout}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" /> OK / Limpo
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-purple-500" /> Substituído
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-amber-500" /> Atenção
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Mini Cartão Visual de Critério Físico (OK / Atenção / Substituir)  */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-2 rounded-2xl border bg-card/80 p-3.5">
        <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
          Critério Visual de Bancada (Como Decidir)
        </p>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/8 p-2.5">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
            <div>
              <span className="font-bold text-emerald-300">OK: </span>
              <span className="text-foreground/90">{passoAtual.criterioVisual.ok}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/8 p-2.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold text-amber-300">Limpar / Regular: </span>
              <span className="text-foreground/90">{passoAtual.criterioVisual.atencao}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/8 p-2.5">
            <XCircle className="mt-0.5 size-4 shrink-0 text-rose-400" />
            <div>
              <span className="font-bold text-rose-300">Substituir: </span>
              <span className="text-foreground/90">{passoAtual.criterioVisual.substituir}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
