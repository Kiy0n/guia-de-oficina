import type { EstadoVelaId } from '@/data/fundamentos';

// ---------------------------------------------------------------------------
// 1. Leitura da Ponta da Vela de Ignição (4 estados)
// ---------------------------------------------------------------------------

const ESTILO_VELA: Record<
  EstadoVelaId,
  {
    ceramica: string;
    bordaCeramica: string;
    eletrodo: string;
    deposito?: string;
    brilhoOleo?: boolean;
  }
> = {
  ideal: {
    ceramica: '#b08968',
    bordaCeramica: '#d4a373',
    eletrodo: '#cbd5e1',
  },
  rica: {
    ceramica: '#27272a',
    bordaCeramica: '#52525b',
    eletrodo: '#3f3f46',
    deposito: '#18181b',
  },
  pobre: {
    ceramica: '#f8fafc',
    bordaCeramica: '#e2e8f0',
    eletrodo: '#e2e8f0',
    deposito: '#cbd5e1',
  },
  oleo: {
    ceramica: '#18181b',
    bordaCeramica: '#3f3f46',
    eletrodo: '#27272a',
    deposito: '#09090b',
    brilhoOleo: true,
  },
};

export function VelaEstadoSvg({ estado }: { estado: EstadoVelaId }) {
  const cor = ESTILO_VELA[estado];

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-zinc-950 p-2.5">
      <svg
        viewBox="0 0 180 120"
        className="mx-auto h-28 w-auto"
        role="img"
        aria-label={`Ilustração da ponta da vela de ignição em estado ${estado}`}
      >
        <rect x="0" y="0" width="180" height="120" fill="#09090b" rx="6" />

        {/* Rosca metálica superior */}
        <rect x="52" y="8" width="76" height="36" rx="3" fill="#52525b" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="52" y1="16" x2="128" y2="16" stroke="#27272a" strokeWidth="2" />
        <line x1="52" y1="24" x2="128" y2="24" stroke="#27272a" strokeWidth="2" />
        <line x1="52" y1="32" x2="128" y2="32" stroke="#27272a" strokeWidth="2" />

        {/* Base da carcaça */}
        <rect x="58" y="44" width="64" height="16" rx="2" fill="#3f3f46" stroke="#71717a" strokeWidth="1.5" />

        {/* Cone do isolador cerâmico */}
        <polygon
          points="70,60 110,60 100,88 80,88"
          fill={cor.ceramica}
          stroke={cor.bordaCeramica}
          strokeWidth="1.5"
        />

        {/* Depósitos / bolhas / brilho conforme o estado */}
        {estado === 'rica' && (
          <>
            <circle cx="82" cy="72" r="3" fill={cor.deposito} />
            <circle cx="95" cy="76" r="3.5" fill={cor.deposito} />
            <circle cx="88" cy="82" r="2.8" fill={cor.deposito} />
          </>
        )}

        {estado === 'pobre' && (
          <>
            <circle cx="84" cy="73" r="2.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
            <circle cx="96" cy="78" r="2.2" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
            <circle cx="89" cy="83" r="1.8" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
          </>
        )}

        {cor.brilhoOleo && (
          <>
            <path
              d="M 76 66 Q 82 78 79 86"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.7"
            />
            <circle cx="96" cy="74" r="3" fill="#38bdf8" opacity="0.45" />
            <circle cx="91" cy="95" r="2.5" fill="#38bdf8" opacity="0.55" />
          </>
        )}

        {/* Eletrodo central */}
        <rect x="86" y="88" width="8" height="10" rx="1" fill={cor.eletrodo} stroke="#94a3b8" strokeWidth="1" />

        {/* Eletrodo lateral (massa) */}
        <path
          d="M 116 60 L 116 98 Q 116 106 106 106 L 83 106"
          fill="none"
          stroke={estado === 'rica' || estado === 'oleo' ? '#3f3f46' : '#94a3b8'}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Desgaste de Coroa / Pinhão (Dentes Simétricos vs "Dentes de Tubarão")
// ---------------------------------------------------------------------------

export function CoroaDesgasteSvg() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Dentes Simétricos (OK) */}
      <div className="rounded-xl border border-emerald-500/35 bg-zinc-950 p-3.5 text-zinc-100">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-emerald-400">Dentes Simétricos (Bom Estado)</span>
          <span className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            OK
          </span>
        </div>
        <svg
          viewBox="0 0 320 130"
          className="h-auto w-full"
          role="img"
          aria-label="Coroa com dentes simétricos e topo largo em bom estado"
        >
          <rect x="0" y="0" width="320" height="130" fill="#09090b" rx="6" />
          {/* Perfil de dentes simétricos */}
          <path
            d="M 20 110 L 20 82 C 32 82, 38 42, 48 42 L 62 42 C 72 42, 78 82, 92 82 C 106 82, 112 42, 122 42 L 136 42 C 146 42, 152 82, 166 82 C 180 82, 186 42, 196 42 L 210 42 C 220 42, 226 82, 240 82 C 254 82, 260 42, 270 42 L 284 42 C 294 42, 298 82, 304 82 L 304 110 Z"
            fill="#27272a"
            stroke="#34d399"
            strokeWidth="2.5"
          />
          <line x1="129" y1="22" x2="129" y2="92" stroke="#34d399" strokeDasharray="3 3" strokeWidth="1.2" />
          <text x="160" y="24" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
            Topo largo e cavidade em "U" simétrica
          </text>
          <text x="160" y="124" textAnchor="middle" fill="#a1a1aa" fontSize="9.5" fontFamily="sans-serif">
            Corrente assenta firme sem puxar para fora na traseira da coroa
          </text>
        </svg>
      </div>

      {/* Dentes de Tubarão (Trocar) */}
      <div className="rounded-xl border border-rose-500/35 bg-zinc-950 p-3.5 text-zinc-100">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-rose-400">"Dentes de Tubarão" (Desgastado)</span>
          <span className="rounded-md border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300">
            TROCAR KIT
          </span>
        </div>
        <svg
          viewBox="0 0 320 130"
          className="h-auto w-full"
          role="img"
          aria-label="Coroa gasta com dentes pontiagudos inclinados em formato de dente de tubarão"
        >
          <rect x="0" y="0" width="320" height="130" fill="#09090b" rx="6" />
          {/* Perfil de dentes inclinados e finos */}
          <path
            d="M 20 110 L 20 84 C 42 84, 58 68, 66 38 C 72 62, 74 84, 96 84 C 118 84, 134 68, 142 38 C 148 62, 150 84, 172 84 C 194 84, 210 68, 218 38 C 224 62, 226 84, 248 84 C 270 84, 286 68, 294 38 L 304 84 L 304 110 Z"
            fill="#27272a"
            stroke="#fb7185"
            strokeWidth="2.5"
          />
          <text x="160" y="24" textAnchor="middle" fill="#fda4af" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
            Pontas finas, inclinadas e cavidade escavada
          </text>
          <text x="160" y="124" textAnchor="middle" fill="#a1a1aa" fontSize="9.5" fontFamily="sans-serif">
            Substituir pinhão, coroa e corrente juntos (nunca só a corrente)
          </text>
        </svg>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Pneus (TWI) + Pastilhas de Disco + Seta do Tambor
// ---------------------------------------------------------------------------

export function PneuTwiFreiosSvg() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* 3A. Pneu / TWI */}
      <div className="rounded-xl border border-border/70 bg-zinc-950 p-3.5 text-zinc-100">
        <p className="mb-2 text-xs font-bold text-zinc-100">
          1. Pneu — Ressalto TWI (1,6 mm)
        </p>
        <svg
          viewBox="0 0 260 150"
          className="h-auto w-full"
          role="img"
          aria-label="Corte transversal do sulco do pneu mostrando o indicador TWI de 1,6 mm"
        >
          <rect x="0" y="0" width="260" height="150" fill="#09090b" rx="6" />
          {/* Carcaça do pneu com sulco */}
          <path
            d="M 16 120 L 16 42 L 88 42 L 88 94 L 114 94 L 114 78 L 146 78 L 146 94 L 172 94 L 172 42 L 244 42 L 244 120 Z"
            fill="#27272a"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          {/* Destaque do ressalto TWI */}
          <rect x="114" y="78" width="32" height="16" fill="#f59e0b" fillOpacity="0.4" stroke="#fbbf24" strokeWidth="1.5" />
          {/* Linha limite */}
          <line x1="20" y1="78" x2="240" y2="78" stroke="#fb7185" strokeDasharray="4 3" strokeWidth="1.5" />
          <text x="130" y="66" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
            TWI (1,6 mm)
          </text>
          <text x="52" y="34" textAnchor="middle" fill="#6ee7b7" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif">
            Banda OK
          </text>
          <text x="130" y="138" textAnchor="middle" fill="#fda4af" fontSize="9" fontFamily="sans-serif">
            Banda nivelada com o TWI = trocar pneu
          </text>
        </svg>
      </div>

      {/* 3B. Pastilha de Freio a Disco */}
      <div className="rounded-xl border border-border/70 bg-zinc-950 p-3.5 text-zinc-100">
        <p className="mb-2 text-xs font-bold text-zinc-100">
          2. Pastilha de Disco — Limite de 2 mm
        </p>
        <svg
          viewBox="0 0 260 150"
          className="h-auto w-full"
          role="img"
          aria-label="Pastilha de freio a disco comparando material de atrito com a linha limite de 2 mm"
        >
          <rect x="0" y="0" width="260" height="150" fill="#09090b" rx="6" />
          {/* Disco de freio */}
          <rect x="116" y="16" width="28" height="104" rx="2" fill="#475569" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="130" y="72" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold" fontFamily="monospace">
            DISCO
          </text>

          {/* Pastilha esquerda (OK) */}
          <rect x="52" y="26" width="14" height="82" rx="2" fill="#3f3f46" stroke="#94a3b8" />
          <rect x="66" y="30" width="44" height="74" rx="2" fill="#10b981" fillOpacity="0.35" stroke="#34d399" strokeWidth="1.5" />
          <text x="80" y="20" textAnchor="middle" fill="#6ee7b7" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif">
            Boa (&gt; 2 mm)
          </text>

          {/* Pastilha direita (Gasta no limite) */}
          <rect x="194" y="26" width="14" height="82" rx="2" fill="#3f3f46" stroke="#94a3b8" />
          <rect x="150" y="30" width="10" height="74" rx="1" fill="#fb7185" fillOpacity="0.45" stroke="#fb7185" strokeWidth="1.5" />
          <line x1="160" y1="24" x2="160" y2="112" stroke="#fb7185" strokeDasharray="3 2" strokeWidth="1.5" />
          <text x="184" y="20" textAnchor="middle" fill="#fda4af" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif">
            Trocar (≤ 2 mm)
          </text>

          <text x="130" y="138" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="sans-serif">
            Nunca deixe chegar no ferro da base (risca o disco)
          </text>
        </svg>
      </div>

      {/* 3C. Freio a Tambor — Seta Indicadora */}
      <div className="rounded-xl border border-border/70 bg-zinc-950 p-3.5 text-zinc-100">
        <p className="mb-2 text-xs font-bold text-zinc-100">
          3. Freio a Tambor — Seta no Espelho
        </p>
        <svg
          viewBox="0 0 260 150"
          className="h-auto w-full"
          role="img"
          aria-label="Indicador de desgaste do freio a tambor mostrando a seta alinhada ao triângulo limite"
        >
          <rect x="0" y="0" width="260" height="150" fill="#09090b" rx="6" />
          {/* Espelho do tambor */}
          <circle cx="115" cy="70" r="46" fill="#18181b" stroke="#71717a" strokeWidth="2" />
          {/* Eixo came */}
          <circle cx="115" cy="70" r="14" fill="#3f3f46" stroke="#cbd5e1" strokeWidth="2" />
          {/* Seta do braço (alinhada ao triângulo) */}
          <polygon points="129,70 147,64 147,76" fill="#fb7185" />
          {/* Triângulo gravado no espelho */}
          <polygon points="160,70 150,65 150,75" fill="#fbbf24" />
          {/* Braço acionador */}
          <rect x="109" y="74" width="12" height="44" rx="4" fill="#52525b" stroke="#cbd5e1" strokeWidth="1.5" />

          <text x="198" y="64" textAnchor="middle" fill="#fbbf24" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif">
            Seta alinhou
          </text>
          <text x="198" y="76" textAnchor="middle" fill="#fda4af" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif">
            com o Δ = Lona
          </text>
          <text x="198" y="88" textAnchor="middle" fill="#fda4af" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif">
            no limite!
          </text>
          <text x="130" y="138" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="sans-serif">
            Verifique sempre com o pedal/manete acionado
          </text>
        </svg>
      </div>
    </div>
  );
}
