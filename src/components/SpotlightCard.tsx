import { type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

import { BRAND_THEME } from '@/lib/brands';
import { cn } from '@/lib/utils';
import type { Marca } from '@/types/moto';

export const STAGGER_CARD_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.36,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export interface SpotlightCardProps {
  marca: Marca;
  /**
   * `featured`: card principal de Fabricante (Passo 1) com lift -translate-y-1.5 e brilho intenso.
   * `subtle`: card de Modelo (Passo 2) ou Ano/Geração (Passo 3) com polimento mais discreto.
   */
  intensity?: 'featured' | 'subtle';
  /** Destaca a borda permanentemente (ex.: geração atual selecionada). */
  active?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}

export function SpotlightCard({
  marca,
  intensity = 'featured',
  active = false,
  onClick,
  className,
  children,
  ariaLabel,
}: SpotlightCardProps) {
  const theme = BRAND_THEME[marca];
  const isFeatured = intensity === 'featured';

  // Atualiza variáveis CSS direto no DOM sem disparar re-render do React a cada pixel
  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const customStyle = {
    '--mouse-x': '50%',
    '--mouse-y': '50%',
    '--spotlight-color': isFeatured ? theme.spotlightColor : theme.spotlightSubtleColor,
    '--brand-color': theme.colorVar,
  } as CSSProperties;

  return (
    <motion.div
      variants={STAGGER_CARD_VARIANTS}
      whileTap={{ scale: isFeatured ? 0.98 : 0.985 }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      style={customStyle}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border-2 border-border bg-card text-card-foreground outline-none select-none',
        'transition-[transform,border-color,box-shadow,background-color] duration-300 ease-out',
        onClick && 'cursor-pointer focus-visible:ring-[3px] focus-visible:ring-ring/50',
        isFeatured ? 'hover:-translate-y-1.5' : 'hover:-translate-y-1',
        theme.hoverCard,
        active && theme.border,
        className,
      )}
    >
      {/* Barra superior iluminada na cor da marca */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-20 transition-all duration-300',
          isFeatured ? 'h-1.5 opacity-65 group-hover:opacity-100' : 'h-1 opacity-40 group-hover:opacity-95',
          theme.accent,
          theme.topBarGlow,
        )}
      />

      {/* Spotlight radial dinâmico seguindo o cursor (--mouse-x, --mouse-y) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isFeatured
            ? 'radial-gradient(360px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 80%)'
            : 'radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 75%)',
        }}
      />

      {/* Efeito discreto de reflexo/shimmer diagonal ao entrar com o mouse */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/2 -translate-x-full skew-x-[-22deg]',
          'bg-gradient-to-r from-transparent via-white/[0.07] to-transparent',
          'transition-transform duration-700 ease-out group-hover:translate-x-[320%]',
        )}
      />

      {/* Conteúdo do card */}
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </motion.div>
  );
}
