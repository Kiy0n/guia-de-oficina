import type { ComponentType } from 'react';

import { HondaLogo, SuzukiLogo, YamahaLogo, type BrandLogoProps } from '@/components/BrandLogos';
import type { Marca } from '@/types/moto';

export interface BrandTheme {
  Logo: ComponentType<BrandLogoProps>;
  /** Variante do Badge shadcn/ui para a marca. */
  badge: 'honda' | 'yamaha' | 'suzuki';
  /** Variável CSS principal da marca. */
  colorVar: string;
  /** Cor do spotlight radial nos cards principais de fabricante (Passo 1). */
  spotlightColor: string;
  /** Cor do spotlight radial mais sutil para cards de Modelo e Ano/Geração (Passos 2 e 3). */
  spotlightSubtleColor: string;
  /** Classes de borda/glow para cards no hover. */
  hoverCard: string;
  /** Glow intenso para a barra superior no hover. */
  topBarGlow: string;
  /** Borda de destaque permanente. */
  border: string;
  /** Cor de texto legível sobre fundo escuro. */
  text: string;
  /** Barra/acento sólido. */
  accent: string;
}

// Classes escritas por extenso para o Tailwind detectá-las na varredura do código.
export const BRAND_THEME: Record<Marca, BrandTheme> = {
  Honda: {
    Logo: HondaLogo,
    badge: 'honda',
    colorVar: 'var(--honda)',
    spotlightColor: 'rgba(220, 38, 38, 0.22)',
    spotlightSubtleColor: 'rgba(220, 38, 38, 0.13)',
    hoverCard:
      'hover:border-honda hover:shadow-[0_14px_38px_-10px_rgba(204,0,0,0.55)] focus-visible:border-honda',
    topBarGlow: 'group-hover:shadow-[0_0_20px_3px_var(--honda)]',
    border: 'border-honda/60',
    text: 'text-red-700 dark:text-red-400',
    accent: 'bg-honda',
  },
  Yamaha: {
    Logo: YamahaLogo,
    badge: 'yamaha',
    colorVar: 'var(--yamaha)',
    spotlightColor: 'rgba(14, 132, 235, 0.24)',
    spotlightSubtleColor: 'rgba(14, 132, 235, 0.14)',
    hoverCard:
      'hover:border-yamaha hover:shadow-[0_14px_38px_-10px_rgba(0,85,165,0.65)] focus-visible:border-yamaha',
    topBarGlow: 'group-hover:shadow-[0_0_20px_3px_var(--yamaha)]',
    border: 'border-yamaha/60',
    text: 'text-blue-700 dark:text-blue-400',
    accent: 'bg-yamaha',
  },
  Suzuki: {
    Logo: SuzukiLogo,
    badge: 'suzuki',
    colorVar: 'var(--suzuki)',
    spotlightColor: 'rgba(230, 184, 0, 0.20)',
    spotlightSubtleColor: 'rgba(230, 184, 0, 0.12)',
    hoverCard:
      'hover:border-suzuki hover:shadow-[0_14px_38px_-10px_rgba(230,184,0,0.5)] focus-visible:border-suzuki',
    topBarGlow: 'group-hover:shadow-[0_0_20px_3px_var(--suzuki)]',
    border: 'border-suzuki/60',
    text: 'text-amber-800 dark:text-yellow-300',
    accent: 'bg-suzuki',
  },
};
