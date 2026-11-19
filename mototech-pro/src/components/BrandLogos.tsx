/**
 * Logos oficiais das fabricantes carregadas de `public/logos/`.
 * Renderizadas com proporção equilibrada, proteção contra arraste/seleção
 * e halo radial sutil para leitura perfeita sobre o tema escuro da oficina.
 */
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';
import type { Marca } from '@/types/moto';

export const BRAND_LOGO_FILES: Record<Marca, string> = {
  Honda: '/logos/honda.png',
  Yamaha: '/logos/yamaha.png',
  Suzuki: '/logos/suzuki.png',
} as const;

export interface BrandLogoProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Modo compacto (ex.: card lateral do AppShell). */
  emblemOnly?: boolean;
  /** Texto alternativo acessível da imagem. */
  title?: string;
  /** Classes extras aplicadas diretamente na tag `<img>`. */
  imgClassName?: string;
}

interface InternalLogoConfig {
  src: string;
  defaultTitle: string;
  /** Halo radial sutil sob a logo para destacar detalhes escuros sem caixa sólida. */
  haloClass: string;
  /** Drop-shadow base + reação luminosa no hover do card (`group-hover`). */
  shadowClass: string;
  /** Compensação óptica de escala para igualar a altura visual entre os 3 PNGs. */
  opticalScaleClass: string;
}

const LOGO_CONFIG: Record<Marca, InternalLogoConfig> = {
  Honda: {
    src: BRAND_LOGO_FILES.Honda,
    defaultTitle: 'Honda',
    haloClass:
      'bg-[radial-gradient(closest-side,rgba(255,255,255,0.09)_0%,rgba(204,0,0,0.08)_55%,transparent_100%)]',
    shadowClass:
      'drop-shadow-[0_2px_10px_rgba(255,255,255,0.12)] group-hover:drop-shadow-[0_10px_24px_rgba(220,38,38,0.55)]',
    // honda.png (320x320) possui margem transparente interna (~14%), compensada aqui
    opticalScaleClass: 'scale-[1.18] group-hover:scale-[1.28]',
  },
  Yamaha: {
    src: BRAND_LOGO_FILES.Yamaha,
    defaultTitle: 'Yamaha',
    haloClass:
      'bg-[radial-gradient(closest-side,rgba(255,255,255,0.11)_0%,rgba(0,85,165,0.10)_58%,transparent_100%)]',
    shadowClass:
      'drop-shadow-[0_2px_10px_rgba(255,255,255,0.14)] group-hover:drop-shadow-[0_10px_24px_rgba(14,165,233,0.55)]',
    opticalScaleClass: 'scale-[0.96] group-hover:scale-[1.06]',
  },
  Suzuki: {
    src: BRAND_LOGO_FILES.Suzuki,
    defaultTitle: 'Suzuki',
    // Halo claro mais presente no centro/base para destacar o wordmark azul escuro da Suzuki no tema dark
    haloClass:
      'bg-[radial-gradient(closest-side,rgba(255,255,255,0.16)_0%,rgba(230,184,0,0.09)_60%,transparent_100%)]',
    shadowClass:
      'drop-shadow-[0_2px_12px_rgba(255,255,255,0.22)] group-hover:drop-shadow-[0_10px_24px_rgba(230,184,0,0.55)]',
    opticalScaleClass: 'scale-[0.95] group-hover:scale-[1.05]',
  },
};

function BrandLogoBase({
  marca,
  emblemOnly = false,
  title,
  className,
  imgClassName,
  ...props
}: BrandLogoProps & { marca: Marca }) {
  const cfg = LOGO_CONFIG[marca];
  const altText = title ?? cfg.defaultTitle;

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center select-none',
        emblemOnly ? 'size-12 rounded-xl p-1.5' : 'h-28 w-36 sm:h-32 sm:w-40',
        className,
      )}
      {...props}
    >
      {/* Fundo radial sutil para contraste perfeito no tema escuro (sem caixa branca) */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 rounded-full opacity-85 blur-md transition-opacity duration-300 group-hover:opacity-100',
          cfg.haloClass,
        )}
      />
      <img
        src={cfg.src}
        alt={altText}
        draggable={false}
        loading="eager"
        decoding="async"
        className={cn(
          'relative z-10 max-h-full max-w-full object-contain select-none',
          'transition-all duration-300 ease-out will-change-transform',
          cfg.shadowClass,
          cfg.opticalScaleClass,
          imgClassName,
        )}
      />
    </div>
  );
}

export function HondaLogo(props: BrandLogoProps) {
  return <BrandLogoBase marca="Honda" {...props} />;
}

export function YamahaLogo(props: BrandLogoProps) {
  return <BrandLogoBase marca="Yamaha" {...props} />;
}

export function SuzukiLogo(props: BrandLogoProps) {
  return <BrandLogoBase marca="Suzuki" {...props} />;
}
