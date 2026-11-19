/**
 * Logos vetoriais simplificados das fabricantes (sem URLs externas).
 * Representações estilizadas para uso pessoal/identificação visual na bancada.
 */
import type { SVGProps } from 'react';

import { cn } from '@/lib/utils';

export interface BrandLogoProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Exibe apenas o emblema, sem o nome da marca. */
  emblemOnly?: boolean;
  title?: string;
}

const WORDMARK_STYLE = {
  fontFamily: 'Arial Black, Arial, Helvetica, sans-serif',
  fontWeight: 900,
} as const;

// ---------------------------------------------------------------------------
// Honda — asa estilizada + wordmark
// ---------------------------------------------------------------------------

function HondaWing() {
  return (
    <g fill="var(--honda)">
      {/* Penas da asa, da maior (topo) para a menor */}
      <path d="M6 30 C 22 12, 52 6, 76 7 C 62 13, 46 19, 32 26 Z" />
      <path d="M14 36 C 30 24, 54 19, 72 19 C 60 25, 46 30, 34 34 Z" />
      <path d="M22 42 C 36 33, 54 30, 68 31 C 58 36, 46 40, 36 42 Z" />
      <path d="M30 48 C 40 42, 54 40, 64 42 C 56 46, 46 49, 38 50 Z" />
      {/* Corpo / base da asa */}
      <path d="M4 30 L 14 36 L 22 42 L 30 48 L 26 56 C 16 50, 8 42, 4 30 Z" />
    </g>
  );
}

export function HondaLogo({ emblemOnly = false, title = 'Honda', className, ...props }: BrandLogoProps) {
  return (
    <svg
      viewBox={emblemOnly ? '0 0 80 60' : '0 0 80 84'}
      role="img"
      aria-label={title}
      className={cn('h-auto', className)}
      {...props}
    >
      <title>{title}</title>
      <HondaWing />
      {!emblemOnly && (
        <text x="40" y="80" textAnchor="middle" fontSize="17" letterSpacing="1.5" fill="var(--honda)" style={WORDMARK_STYLE}>
          HONDA
        </text>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Yamaha — emblema dos 3 diapasões + wordmark
// ---------------------------------------------------------------------------

/** Um diapasão apontando para cima, com a base no centro (40, 30). */
function TuningFork() {
  return <path d="M40 30 V 17 M34 6 V 13 Q 34 17 40 17 Q 46 17 46 13 V 6" />;
}

function YamahaEmblem() {
  return (
    <g fill="none" stroke="var(--yamaha)" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="40" cy="30" r="27" strokeWidth="3.5" />
      <g strokeWidth="3.5">
        <TuningFork />
        <g transform="rotate(120 40 30)">
          <TuningFork />
        </g>
        <g transform="rotate(240 40 30)">
          <TuningFork />
        </g>
      </g>
    </g>
  );
}

export function YamahaLogo({ emblemOnly = false, title = 'Yamaha', className, ...props }: BrandLogoProps) {
  return (
    <svg
      viewBox={emblemOnly ? '0 0 80 60' : '0 0 80 84'}
      role="img"
      aria-label={title}
      className={cn('h-auto', className)}
      {...props}
    >
      <title>{title}</title>
      <YamahaEmblem />
      {!emblemOnly && (
        <text
          x="40"
          y="80"
          textAnchor="middle"
          fontSize="15"
          letterSpacing="1"
          fill="var(--yamaha)"
          fontStyle="italic"
          style={WORDMARK_STYLE}
        >
          YAMAHA
        </text>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Suzuki — "S" geométrico + wordmark
// ---------------------------------------------------------------------------

function SuzukiEmblem() {
  return (
    <g>
      <rect x="14" y="2" width="52" height="54" rx="10" fill="var(--suzuki-secondary)" />
      <polyline
        points="54,12 30,12 22,20 58,38 50,46 26,46"
        fill="none"
        stroke="var(--suzuki)"
        strokeWidth="8"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
    </g>
  );
}

export function SuzukiLogo({ emblemOnly = false, title = 'Suzuki', className, ...props }: BrandLogoProps) {
  return (
    <svg
      viewBox={emblemOnly ? '0 0 80 60' : '0 0 80 84'}
      role="img"
      aria-label={title}
      className={cn('h-auto', className)}
      {...props}
    >
      <title>{title}</title>
      <SuzukiEmblem />
      {!emblemOnly && (
        <text x="40" y="80" textAnchor="middle" fontSize="15.5" letterSpacing="1" fill="var(--suzuki)" style={WORDMARK_STYLE}>
          SUZUKI
        </text>
      )}
    </svg>
  );
}
