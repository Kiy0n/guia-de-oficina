import type { ComponentType } from 'react';

import { HondaLogo, SuzukiLogo, YamahaLogo, type BrandLogoProps } from '@/components/BrandLogos';
import type { Marca } from '@/types/moto';

export interface BrandTheme {
  Logo: ComponentType<BrandLogoProps>;
  /** Variante do Badge shadcn/ui para a marca. */
  badge: 'honda' | 'yamaha' | 'suzuki';
  /** Classes de borda/glow para cards no hover. */
  hoverCard: string;
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
    hoverCard: 'hover:border-honda hover:shadow-[0_0_32px_-6px_var(--honda)] focus-visible:border-honda',
    border: 'border-honda/60',
    text: 'text-red-400',
    accent: 'bg-honda',
  },
  Yamaha: {
    Logo: YamahaLogo,
    badge: 'yamaha',
    hoverCard: 'hover:border-yamaha hover:shadow-[0_0_32px_-6px_var(--yamaha)] focus-visible:border-yamaha',
    border: 'border-yamaha/60',
    text: 'text-sky-400',
    accent: 'bg-yamaha',
  },
  Suzuki: {
    Logo: SuzukiLogo,
    badge: 'suzuki',
    hoverCard: 'hover:border-suzuki hover:shadow-[0_0_32px_-6px_var(--suzuki)] focus-visible:border-suzuki',
    border: 'border-suzuki/60',
    text: 'text-suzuki',
    accent: 'bg-suzuki',
  },
};
