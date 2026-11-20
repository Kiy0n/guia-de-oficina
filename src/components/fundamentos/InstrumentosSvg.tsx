import { useState } from 'react';

import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// 1. Calibre de Lâminas (Folga de Válvulas)
// ---------------------------------------------------------------------------

export function CalibreLaminasSvg({ pausado }: { pausado: boolean }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/70 bg-zinc-950 p-3 text-zinc-100',
        pausado && 'anim-pausada',
      )}
    >
      <svg
        viewBox="0 0 360 190"
        className="h-auto w-full"
        role="img"
        aria-label="Diagrama animado do calibre de lâminas deslizando entre o parafuso de ajuste do balancim e a haste da válvula"
      >
        <defs>
          <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <linearGradient id="bladeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        {/* Fundo grade sutil */}
        <rect x="0" y="0" width="360" height="190" fill="#09090b" rx="8" />

        {/* Balancim */}
        <path
          d="M 45 58 C 95 45, 160 45, 225 56 L 232 76 C 175 72, 110 74, 52 80 Z"
          fill="#27272a"
          stroke="#71717a"
          strokeWidth="2"
        />
        <circle cx="115" cy="63" r="10" fill="#18181b" stroke="#a1a1aa" strokeWidth="2" />
        <text x="58" y="38" fill="#a1a1aa" fontSize="10" fontFamily="monospace">
          Balancim
        </text>

        {/* Contraporca e Parafuso Regulador */}
        <rect x="193" y="34" width="24" height="12" rx="2" fill="url(#metalGrad)" stroke="#475569" />
        <rect x="200" y="20" width="10" height="66" rx="2" fill="url(#metalGrad)" stroke="#475569" />
        <text x="225" y="34" fill="#cbd5e1" fontSize="10" fontFamily="monospace">
          Contraporca +
        </text>
        <text x="225" y="46" fill="#cbd5e1" fontSize="10" fontFamily="monospace">
          Parafuso 3 mm
        </text>

        {/* Zona de Folga (destaque) */}
        <rect
          x="185"
          y="87"
          width="40"
          height="13"
          rx="3"
          fill="#10b981"
          fillOpacity="0.18"
          stroke="#10b981"
          strokeDasharray="3 2"
          strokeWidth="1"
        />

        {/* Lâmina do Cálibre animada deslizando */}
        <g className="anim-lamina-desliza">
          <rect
            x="165"
            y="90"
            width="138"
            height="7"
            rx="2"
            fill="url(#bladeGrad)"
            stroke="#fef3c7"
            strokeWidth="0.8"
          />
          <rect x="292" y="85" width="42" height="17" rx="4" fill="#3f3f46" stroke="#a1a1aa" />
          <text x="235" y="95.5" fill="#18181b" fontSize="7" fontWeight="bold" fontFamily="monospace">
            0,08 mm
          </text>
        </g>

        {/* Haste da Válvula + Mola */}
        <rect x="196" y="101" width="18" height="72" rx="2" fill="url(#metalGrad)" stroke="#475569" />
        <rect x="178" y="114" width="54" height="8" rx="2" fill="#3f3f46" stroke="#94a3b8" />
        {/* Espiras da mola */}
        <path
          d="M 182 126 L 228 134 M 182 138 L 228 146 M 182 150 L 228 158 M 182 162 L 228 170"
          stroke="#71717a"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <text x="238" y="148" fill="#a1a1aa" fontSize="10" fontFamily="monospace">
          Haste da
        </text>
        <text x="238" y="160" fill="#a1a1aa" fontSize="10" fontFamily="monospace">
          Válvula
        </text>

        {/* Legenda de Arrasto Leve */}
        <rect x="14" y="142" width="150" height="34" rx="6" fill="#10b981" fillOpacity="0.14" stroke="#10b981" strokeOpacity="0.45" />
        <text x="24" y="157" fill="#6ee7b7" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif">
          Sensação ideal: "arrasto leve"
        </text>
        <text x="24" y="170" fill="#d1fae5" fontSize="8.5" fontFamily="sans-serif">
          Desliza firme sem travar nem dobrar
        </text>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Multímetro Digital Interativo (3 modos clicáveis)
// ---------------------------------------------------------------------------

type ModoMultimetro = 'dcv' | 'ohm' | 'bip';

const MODOS_MULTIMETRO: Record<
  ModoMultimetro,
  {
    id: ModoMultimetro;
    label: string;
    curto: string;
    angulo: number;
    leituraPrincipal: string;
    leituraSecundaria: string;
    corVisor: string;
    dicaModo: string;
  }
> = {
  dcv: {
    id: 'dcv',
    label: 'DCV 20V (Bateria/Carga)',
    curto: 'DCV 20V',
    angulo: -42,
    leituraPrincipal: '12.6 V',
    leituraSecundaria: '5.000 rpm: 13.8 – 14.5 V',
    corVisor: '#34d399',
    dicaModo: 'Ponta vermelha no (+) e preta no (-) da bateria.',
  },
  ohm: {
    id: 'ohm',
    label: 'Ω (Resistência/Bobinas)',
    curto: 'Ω 200 / 2k',
    angulo: 0,
    leituraPrincipal: '220 Ω',
    leituraSecundaria: 'Estator: 0,3–1,5 Ω · Pulso: 180–300 Ω',
    corVisor: '#fbbf24',
    dicaModo: 'Sempre desconecte a peça do chicote e meça fria (20 °C).',
  },
  bip: {
    id: 'bip',
    label: 'Bip (Continuidade/Fusíveis)',
    curto: 'Bip / Diodo',
    angulo: 42,
    leituraPrincipal: '000 · BIP',
    leituraSecundaria: 'Fusível bom = apita | Rompido = OL',
    corVisor: '#38bdf8',
    dicaModo: 'Desligue a ignição ao testar continuidade de fios ou fusíveis.',
  },
};

export function MultimetroInterativoSvg() {
  const [modo, setModo] = useState<ModoMultimetro>('dcv');
  const atual = MODOS_MULTIMETRO[modo];

  return (
    <div className="space-y-2.5 rounded-xl border border-border/70 bg-zinc-950 p-3 text-zinc-100">
      {/* Botões interativos de seleção de modo */}
      <div className="flex flex-wrap gap-1.5">
        {(['dcv', 'ohm', 'bip'] as const).map((m) => {
          const item = MODOS_MULTIMETRO[m];
          const ativo = modo === m;
          return (
            <button
              key={m}
              type="button"
              data-compact="true"
              onClick={() => setModo(m)}
              aria-pressed={ativo}
              className={cn(
                'rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all',
                ativo
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white',
              )}
            >
              {item.curto}
            </button>
          );
        })}
      </div>

      <svg
        viewBox="0 0 360 190"
        className="h-auto w-full"
        role="img"
        aria-label={`Multímetro digital no modo ${atual.label}, exibindo ${atual.leituraPrincipal}`}
      >
        <rect x="0" y="0" width="360" height="190" fill="#09090b" rx="8" />

        {/* Corpo do Multímetro */}
        <rect
          x="18"
          y="12"
          width="148"
          height="166"
          rx="14"
          fill="#18181b"
          stroke="#f59e0b"
          strokeWidth="2.5"
        />

        {/* Visor LCD */}
        <rect
          x="30"
          y="24"
          width="124"
          height="42"
          rx="6"
          fill="#0f172a"
          stroke="#334155"
          strokeWidth="1.5"
        />
        <text
          x="92"
          y="52"
          textAnchor="middle"
          fill={atual.corVisor}
          fontSize="20"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {atual.leituraPrincipal}
        </text>

        {/* Etiquetas ao redor do seletor */}
        <text
          x="44"
          y="88"
          fill={modo === 'dcv' ? '#34d399' : '#71717a'}
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
        >
          DCV
        </text>
        <text
          x="92"
          y="78"
          textAnchor="middle"
          fill={modo === 'ohm' ? '#fbbf24' : '#71717a'}
          fontSize="9.5"
          fontWeight="bold"
          fontFamily="monospace"
        >
          Ω
        </text>
        <text
          x="138"
          y="88"
          textAnchor="end"
          fill={modo === 'bip' ? '#38bdf8' : '#71717a'}
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
        >
          BIP
        </text>

        {/* Seletor Giratório */}
        <circle cx="92" cy="112" r="24" fill="#27272a" stroke="#52525b" strokeWidth="2" />
        <g
          style={{
            transform: `rotate(${atual.angulo}deg)`,
            transformOrigin: '92px 112px',
            transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <rect x="88" y="90" width="8" height="44" rx="4" fill="#e4e4e7" />
          <polygon points="92,89 88,97 96,97" fill="#f97316" />
        </g>

        {/* Bornes das pontas de prova */}
        {/* 10A (evitar para testes comuns) */}
        <circle cx="48" cy="158" r="8" fill="#18181b" stroke="#52525b" strokeWidth="2" />
        <text x="48" y="174" textAnchor="middle" fill="#71717a" fontSize="7.5" fontFamily="monospace">
          10A
        </text>

        {/* VΩmA (Vermelho) */}
        <circle cx="92" cy="158" r="8" fill="#dc2626" stroke="#fca5a5" strokeWidth="2" />
        <text x="92" y="174" textAnchor="middle" fill="#fca5a5" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
          VΩmA
        </text>

        {/* COM (Preto) */}
        <circle cx="136" cy="158" r="8" fill="#09090b" stroke="#e4e4e7" strokeWidth="2" />
        <text x="136" y="174" textAnchor="middle" fill="#e4e4e7" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
          COM
        </text>

        {/* Painel de leitura didática à direita */}
        <rect x="180" y="18" width="166" height="154" rx="10" fill="#18181b" stroke="#27272a" />
        <text x="192" y="38" fill="#a1a1aa" fontSize="9.5" fontWeight="bold" fontFamily="sans-serif">
          MODO SELECIONADO
        </text>
        <text x="192" y="56" fill={atual.corVisor} fontSize="11.5" fontWeight="bold" fontFamily="sans-serif">
          {atual.label}
        </text>

        <line x1="192" y1="68" x2="334" y2="68" stroke="#27272a" />

        <text x="192" y="86" fill="#a1a1aa" fontSize="9" fontFamily="sans-serif">
          Referência na moto:
        </text>
        <text x="192" y="102" fill="#f4f4f5" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
          {atual.leituraSecundaria}
        </text>

        <rect x="190" y="116" width="146" height="44" rx="6" fill="#27272a" />
        <text x="198" y="131" fill="#fbbf24" fontSize="8.5" fontWeight="bold" fontFamily="sans-serif">
          Pontas de prova:
        </text>
        <text x="198" y="144" fill="#d4d4d8" fontSize="7.8" fontFamily="sans-serif">
          Preta em COM · Vermelha em VΩmA
        </text>
        <text x="198" y="155" fill="#a1a1aa" fontSize="8" fontFamily="sans-serif">
          Nunca deixe na entrada 10A!
        </text>
      </svg>

      <p className="text-[11px] text-zinc-300">
        <strong className="text-primary">Na prática:</strong> {atual.dicaModo}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Torquímetro de Estalo (N·m vs kgf·m)
// ---------------------------------------------------------------------------

export function TorquimetroEstaloSvg({ pausado }: { pausado: boolean }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/70 bg-zinc-950 p-3 text-zinc-100',
        pausado && 'anim-pausada',
      )}
    >
      <svg
        viewBox="0 0 360 190"
        className="h-auto w-full"
        role="img"
        aria-label="Diagrama animado do torquímetro de estalo indicando o ponto exato do clique para parar de puxar"
      >
        <rect x="0" y="0" width="360" height="190" fill="#09090b" rx="8" />

        {/* Parafuso sextavado (pivô) */}
        <polygon
          points="78,78 96,78 105,94 96,110 78,110 69,94"
          fill="#3f3f46"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        <circle cx="87" cy="94" r="9" fill="#18181b" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Arco guia do movimento */}
        <path
          d="M 270 60 A 195 195 0 0 1 268 134"
          fill="none"
          stroke="#3f3f46"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Braço do Torquímetro animado */}
        <g className="anim-torquimetro-puxa" style={{ transformOrigin: '87px 94px' }}>
          <circle cx="87" cy="94" r="18" fill="#52525b" stroke="#e4e4e7" strokeWidth="2" />
          <circle cx="87" cy="94" r="7" fill="#27272a" stroke="#a1a1aa" strokeWidth="1.5" />
          <rect x="102" y="87" width="136" height="14" rx="4" fill="#cbd5e1" stroke="#64748b" />
          {/* Escala no corpo */}
          <line x1="168" y1="88" x2="168" y2="100" stroke="#18181b" strokeWidth="1.5" />
          <line x1="178" y1="90" x2="178" y2="98" stroke="#18181b" strokeWidth="1" />
          <line x1="188" y1="88" x2="188" y2="100" stroke="#18181b" strokeWidth="1.5" />
          <line x1="198" y1="90" x2="198" y2="98" stroke="#18181b" strokeWidth="1" />
          {/* Empunhadura recartilhada */}
          <rect x="236" y="83" width="66" height="22" rx="6" fill="#27272a" stroke="#f59e0b" strokeWidth="2" />
          <text x="269" y="97" textAnchor="middle" fill="#fbbf24" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
            24 N·m
          </text>
        </g>

        {/* Destaque visual do "Estalo / Clique" */}
        <g className="anim-torquimetro-estalo">
          <path
            d="M 108 66 Q 124 72 128 84"
            fill="none"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 114 56 Q 136 64 142 82"
            fill="none"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
          <rect x="148" y="18" width="194" height="34" rx="8" fill="#10b981" fillOpacity="0.18" stroke="#10b981" />
          <text x="245" y="33" textAnchor="middle" fill="#6ee7b7" fontSize="10.5" fontWeight="bold" fontFamily="sans-serif">
            CLIQUE! Pare imediatamente de puxar
          </text>
          <text x="245" y="45" textAnchor="middle" fill="#d1fae5" fontSize="8.5" fontFamily="sans-serif">
            Dar "mais um apertinho" passa do torque
          </text>
        </g>

        {/* Mini tabela de conversão rápida */}
        <rect x="14" y="146" width="332" height="32" rx="6" fill="#18181b" stroke="#27272a" />
        <text x="22" y="160" fill="#fbbf24" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
          1 kgf·m ≈ 9,8 N·m
        </text>
        <text x="132" y="160" fill="#e4e4e7" fontSize="8" fontFamily="monospace">
          10 N·m ≈ 1,0 kgf·m · 30 N·m ≈ 3,0 kgf·m
        </text>
        <text x="22" y="172" fill="#a1a1aa" fontSize="7.8" fontFamily="sans-serif">
          Regra de ouro: sempre volte a escala para o mínimo (zero) ao guardar o torquímetro.
        </text>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Folga da Corrente de Transmissão
// ---------------------------------------------------------------------------

export function FolgaCorrenteSvg({ pausado }: { pausado: boolean }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/70 bg-zinc-950 p-3 text-zinc-100',
        pausado && 'anim-pausada',
      )}
    >
      <svg
        viewBox="0 0 360 190"
        className="h-auto w-full"
        role="img"
        aria-label="Diagrama animado da folga da corrente no ponto médio entre pinhão e coroa com régua vertical"
      >
        <rect x="0" y="0" width="360" height="190" fill="#09090b" rx="8" />

        {/* Pinhão (esquerda) */}
        <circle cx="56" cy="90" r="22" fill="#27272a" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5 3" />
        <circle cx="56" cy="90" r="8" fill="#18181b" stroke="#cbd5e1" strokeWidth="2" />
        <text x="56" y="130" textAnchor="middle" fill="#a1a1aa" fontSize="9.5" fontFamily="monospace">
          Pinhão
        </text>

        {/* Coroa (direita) */}
        <circle cx="292" cy="90" r="42" fill="#27272a" stroke="#94a3b8" strokeWidth="3.5" strokeDasharray="7 4" />
        <circle cx="292" cy="90" r="14" fill="#18181b" stroke="#cbd5e1" strokeWidth="2" />
        <text x="292" y="148" textAnchor="middle" fill="#a1a1aa" fontSize="9.5" fontFamily="monospace">
          Coroa
        </text>

        {/* Parte superior da corrente (tensa) */}
        <line
          x1="58"
          y1="68"
          x2="290"
          y2="48"
          stroke="#cbd5e1"
          strokeWidth="5"
          strokeDasharray="8 4"
          strokeLinecap="round"
        />

        {/* Faixa verde da folga ideal na régua vertical */}
        <rect
          x="154"
          y="104"
          width="36"
          height="32"
          rx="4"
          fill="#10b981"
          fillOpacity="0.18"
          stroke="#10b981"
          strokeWidth="1.2"
        />

        {/* Régua vertical no ponto médio */}
        <line x1="172" y1="88" x2="172" y2="152" stroke="#64748b" strokeWidth="1.5" />
        <line x1="166" y1="104" x2="178" y2="104" stroke="#34d399" strokeWidth="1.5" />
        <line x1="166" y1="136" x2="178" y2="136" stroke="#34d399" strokeWidth="1.5" />
        <text x="195" y="118" fill="#6ee7b7" fontSize="10" fontWeight="bold" fontFamily="monospace">
          15 – 25 mm
        </text>
        <text x="195" y="130" fill="#a7f3d0" fontSize="8.5" fontFamily="sans-serif">
          (conforme manual)
        </text>

        {/* Parte inferior da corrente oscilando suavemente */}
        <g className="anim-corrente-folga">
          <path
            d="M 58 112 Q 172 128 290 132"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="5.5"
            strokeDasharray="8 4"
            strokeLinecap="round"
          />
          <circle cx="172" cy="123" r="5" fill="#fbbf24" stroke="#fef3c7" strokeWidth="1.5" />
        </g>

        {/* Lembrete inferior */}
        <rect x="14" y="156" width="332" height="24" rx="6" fill="#18181b" stroke="#27272a" />
        <text x="180" y="171.5" textAnchor="middle" fill="#e4e4e7" fontSize="7.5" fontFamily="sans-serif">
          Gire a roda antes e ajuste sempre no ponto mais tenso da corrente (meio do vão inferior).
        </text>
      </svg>
    </div>
  );
}
