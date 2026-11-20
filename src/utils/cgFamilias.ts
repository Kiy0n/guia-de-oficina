import type { Geracao, Modelo } from '@/types/moto';
import { findModelo } from '@/utils/catalog';

export interface VersaoFamiliaCg {
  slug: string;
  nome: string;
  anosLabel: string;
  resumo: string;
  destaqueBadge: string;
  /** ID do modelo no catálogo cujas gerações devem ser exibidas (ex.: `honda-cg-160-start` para Start). */
  modeloDestinoId: string;
  /** Lista ordenada dos IDs de geração compatíveis com esta versão. */
  geracaoIds: readonly string[];
}

export interface FamiliaCgConfig {
  familiaModeloId: string;
  nomeFamilia: string;
  subtitulo: string;
  versoes: readonly VersaoFamiliaCg[];
}

/**
 * Ramificação condicional exclusiva da família Honda CG (125, 150 e 160).
 * Demais modelos (Biz, Pop, Bros, XRE, Yamaha e Suzuki) seguem direto Modelo -> Ano/Geração.
 */
export const FAMILIAS_CG: Readonly<Record<string, FamiliaCgConfig>> = {
  'honda-cg-125': {
    familiaModeloId: 'honda-cg-125',
    nomeFamilia: 'CG 125',
    subtitulo: 'Escolha a versão da CG 125 para filtrar apenas os anos e manuais compatíveis.',
    versoes: [
      {
        slug: 'titan',
        nome: 'Titan',
        anosLabel: '2000–2004',
        resumo: 'Motor OHV 124,1 cm³ (vareta) · Carburador · Freios a tambor',
        destaqueBadge: 'Carburada · OHV',
        modeloDestinoId: 'honda-cg-125',
        geracaoIds: ['honda-cg-125-2000-2008'],
      },
      {
        slug: 'fan',
        nome: 'Fan',
        anosLabel: '2005–2018',
        resumo: 'OHV vareta (2005–2008), OHC Carburada (2009–2015) e 125i PGM-FI (2016–2018)',
        destaqueBadge: 'OHV · OHC · 125i',
        modeloDestinoId: 'honda-cg-125',
        geracaoIds: [
          'honda-cg-125-2000-2008',
          'honda-cg-125-2009-2015',
          'honda-cg-125-2016-2018',
        ],
      },
      {
        slug: 'cargo',
        nome: 'Cargo',
        anosLabel: '2000–2018',
        resumo: 'Versão utilitária · OHV vareta, OHC Carburada e Cargo 125i PGM-FI',
        destaqueBadge: 'Utilitária',
        modeloDestinoId: 'honda-cg-125',
        geracaoIds: [
          'honda-cg-125-2000-2008',
          'honda-cg-125-2009-2015',
          'honda-cg-125-2016-2018',
        ],
      },
    ],
  },
  'honda-cg-150': {
    familiaModeloId: 'honda-cg-150',
    nomeFamilia: 'CG 150',
    subtitulo: 'Escolha a versão da CG 150 para ver somente as gerações correspondentes.',
    versoes: [
      {
        slug: 'titan',
        nome: 'Titan',
        anosLabel: '2004–2015',
        resumo: 'Carburada KS/ES/ESD (2004–2008) e PGM-FI / Mix / Flex (2009–2015)',
        destaqueBadge: 'Carburada · Flex',
        modeloDestinoId: 'honda-cg-150',
        geracaoIds: ['honda-cg-150-2004-2008', 'honda-cg-150-2009-2015'],
      },
      {
        slug: 'fan',
        nome: 'Fan',
        anosLabel: '2009–2015',
        resumo: 'Fan ESi e ESDi com injeção eletrônica PGM-FI',
        destaqueBadge: 'PGM-FI',
        modeloDestinoId: 'honda-cg-150',
        geracaoIds: ['honda-cg-150-2009-2015'],
      },
      {
        slug: 'cargo',
        nome: 'Cargo',
        anosLabel: '2014–2015',
        resumo: 'Versão utilitária com injeção eletrônica PGM-FI',
        destaqueBadge: 'Utilitária · PGM-FI',
        modeloDestinoId: 'honda-cg-150',
        geracaoIds: ['honda-cg-150-2009-2015'],
      },
      {
        slug: 'sport',
        nome: 'Sport',
        anosLabel: '2005–2008',
        resumo: '15,3 cv @ 8.500 rpm · Rodas aro 17 sem câmara · Carburada',
        destaqueBadge: 'Carburada · 15,3 cv',
        modeloDestinoId: 'honda-cg-150',
        geracaoIds: ['honda-cg-150-2004-2008'],
      },
    ],
  },
  'honda-cg-160': {
    familiaModeloId: 'honda-cg-160',
    nomeFamilia: 'CG 160',
    subtitulo:
      'Escolha a versão da CG 160 — a Start possui ficha técnica, freios e manuais exclusivos (somente gasolina).',
    versoes: [
      {
        slug: 'start',
        nome: 'Start',
        anosLabel: '2016–2026',
        resumo: 'PGM-FI somente gasolina · Tambor (2016–2024) e Disco dianteiro CBS (2025+)',
        destaqueBadge: 'Gasolina · Ficha exclusiva',
        modeloDestinoId: 'honda-cg-160-start',
        geracaoIds: [
          'honda-cg-160-start-2016-2017',
          'honda-cg-160-start-2018-2024',
          'honda-cg-160-start-2025-2026',
        ],
      },
      {
        slug: 'fan',
        nome: 'Fan',
        anosLabel: '2016–2026',
        resumo: 'PGM-FI Flex · Disco dianteiro · Freio CBS (2018–2026) · Farol LED (2025+)',
        destaqueBadge: 'Flex · CBS',
        modeloDestinoId: 'honda-cg-160',
        geracaoIds: [
          'honda-cg-160-2016-2017',
          'honda-cg-160-2018-2024',
          'honda-cg-160-2025-2026',
        ],
      },
      {
        slug: 'titan',
        nome: 'Titan',
        anosLabel: '2016–2026',
        resumo: 'PGM-FI Flex · CBS (2018–2024) e ABS dianteiro + disco duplo (2025+)',
        destaqueBadge: 'Flex · ABS 2025+',
        modeloDestinoId: 'honda-cg-160',
        geracaoIds: [
          'honda-cg-160-2016-2017',
          'honda-cg-160-2018-2024',
          'honda-cg-160-2025-2026',
        ],
      },
      {
        slug: 'cargo',
        nome: 'Cargo',
        anosLabel: '2016–2026',
        resumo: 'Versão utilitária PGM-FI Flex · Disco dianteiro e freio CBS',
        destaqueBadge: 'Utilitária · Flex',
        modeloDestinoId: 'honda-cg-160',
        geracaoIds: [
          'honda-cg-160-2016-2017',
          'honda-cg-160-2018-2024',
          'honda-cg-160-2025-2026',
        ],
      },
    ],
  },
};

/**
 * Modelos que são unificados visualmente dentro de uma família CG na tela de Modelos
 * (mas permanecem como modelos independentes no catálogo para busca, manuais e arquitetura).
 */
export const MODELOS_OCULTOS_NO_GRID_DE_MODELOS = new Set<string>(['honda-cg-160-start']);

export function getFamiliaCg(modeloId: string): FamiliaCgConfig | undefined {
  return FAMILIAS_CG[modeloId];
}

/**
 * Se o usuário entrar direto em `honda-cg-160-start` (ex.: via busca rápida "start"),
 * resolve o contexto da família CG 160 + versão Start para manter breadcrumbs consistentes.
 */
export function resolverContextoCgInicial(modeloId: string): {
  familia: FamiliaCgConfig;
  versao?: VersaoFamiliaCg;
} | null {
  const direta = FAMILIAS_CG[modeloId];
  if (direta) return { familia: direta };

  for (const familia of Object.values(FAMILIAS_CG)) {
    const versao = familia.versoes.find((v) => v.modeloDestinoId === modeloId);
    if (versao) return { familia, versao };
  }
  return null;
}

/** Resolve o Modelo e as Gerações filtradas para a versão CG selecionada. */
export function resolverGeracoesVersaoCg(versao: VersaoFamiliaCg): {
  modelo: Modelo;
  geracoes: Geracao[];
} | null {
  const modelo = findModelo(versao.modeloDestinoId);
  if (!modelo) return null;

  const permitidos = new Set(versao.geracaoIds);
  const geracoes = modelo.geracoes.filter((g) => permitidos.has(g.id));
  return { modelo, geracoes };
}
