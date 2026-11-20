import type { Geracao, Marca, Modelo } from '@/types/moto';
import { findModelo } from '@/utils/catalog';

export interface VersaoFamiliaMoto {
  slug: string;
  nome: string;
  /** Título completo exibido no card e cabeçalho (ex.: "CG 160 Start", "FZ15 ABS", "Crosser 150 Z"). */
  tituloCompleto: string;
  anosLabel: string;
  resumo: string;
  destaqueBadge: string;
  /** ID do modelo no catálogo cujas gerações devem ser exibidas (ex.: `honda-cg-160-start` para Start). */
  modeloDestinoId: string;
  /** Lista ordenada dos IDs de geração compatíveis com esta versão. */
  geracaoIds: readonly string[];
}

export interface FamiliaMotoConfig {
  familiaModeloId: string;
  marca: Marca;
  nomeFamilia: string;
  subtitulo: string;
  versoes: readonly VersaoFamiliaMoto[];
}

/**
 * Ramificação condicional de versões para famílias com diferenças visuais/técnicas claras:
 * - Honda: CG 125, CG 150 e CG 160
 * - Yamaha: Fazer 150, YBR 125 / Factor 125 e Crosser 150
 *
 * Demais modelos (Biz, Pop, Bros, XRE, Factor 150, Fazer 125, Intruder, Yes)
 * seguem direto Modelo -> Ano/Geração, sem cliques extras.
 */
export const FAMILIAS_MOTO: Readonly<Record<string, FamiliaMotoConfig>> = {
  // -------------------------------------------------------------------------
  // HONDA — Linha CG
  // -------------------------------------------------------------------------
  'honda-cg-125': {
    familiaModeloId: 'honda-cg-125',
    marca: 'Honda',
    nomeFamilia: 'CG 125',
    subtitulo: 'Escolha a versão da CG 125 para filtrar apenas os anos e manuais compatíveis.',
    versoes: [
      {
        slug: 'titan',
        nome: 'Titan',
        tituloCompleto: 'CG 125 Titan',
        anosLabel: '2000–2004',
        resumo: 'Motor OHV 124,1 cm³ (vareta) · Carburador · Freios a tambor',
        destaqueBadge: 'Carburada · OHV',
        modeloDestinoId: 'honda-cg-125',
        geracaoIds: ['honda-cg-125-2000-2008'],
      },
      {
        slug: 'fan',
        nome: 'Fan',
        tituloCompleto: 'CG 125 Fan',
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
        tituloCompleto: 'CG 125 Cargo',
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
    marca: 'Honda',
    nomeFamilia: 'CG 150',
    subtitulo: 'Escolha a versão da CG 150 para ver somente as gerações correspondentes.',
    versoes: [
      {
        slug: 'titan',
        nome: 'Titan',
        tituloCompleto: 'CG 150 Titan',
        anosLabel: '2004–2015',
        resumo: 'Carburada KS/ES/ESD (2004–2008) e PGM-FI / Mix / Flex (2009–2015)',
        destaqueBadge: 'Carburada · Flex',
        modeloDestinoId: 'honda-cg-150',
        geracaoIds: ['honda-cg-150-2004-2008', 'honda-cg-150-2009-2015'],
      },
      {
        slug: 'fan',
        nome: 'Fan',
        tituloCompleto: 'CG 150 Fan',
        anosLabel: '2009–2015',
        resumo: 'Fan ESi e ESDi com injeção eletrônica PGM-FI',
        destaqueBadge: 'PGM-FI',
        modeloDestinoId: 'honda-cg-150',
        geracaoIds: ['honda-cg-150-2009-2015'],
      },
      {
        slug: 'cargo',
        nome: 'Cargo',
        tituloCompleto: 'CG 150 Cargo',
        anosLabel: '2014–2015',
        resumo: 'Versão utilitária com injeção eletrônica PGM-FI',
        destaqueBadge: 'Utilitária · PGM-FI',
        modeloDestinoId: 'honda-cg-150',
        geracaoIds: ['honda-cg-150-2009-2015'],
      },
      {
        slug: 'sport',
        nome: 'Sport',
        tituloCompleto: 'CG 150 Sport',
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
    marca: 'Honda',
    nomeFamilia: 'CG 160',
    subtitulo:
      'Escolha a versão da CG 160 — a Start possui ficha técnica, freios e manuais exclusivos (somente gasolina).',
    versoes: [
      {
        slug: 'start',
        nome: 'Start',
        tituloCompleto: 'CG 160 Start',
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
        tituloCompleto: 'CG 160 Fan',
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
        tituloCompleto: 'CG 160 Titan',
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
        tituloCompleto: 'CG 160 Cargo',
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

  // -------------------------------------------------------------------------
  // YAMAHA — Fazer 150, YBR / Factor 125 e Crosser 150
  // -------------------------------------------------------------------------
  'yamaha-fazer-150': {
    familiaModeloId: 'yamaha-fazer-150',
    marca: 'Yamaha',
    nomeFamilia: 'Fazer 150',
    subtitulo: 'Escolha entre a linha tradicional YS150 (UBS / tambor traseiro) e a FZ15 ABS (disco duplo / monocross).',
    versoes: [
      {
        slug: 'ys150',
        nome: 'YS150 Fazer',
        tituloCompleto: 'YS150 Fazer',
        anosLabel: '2014–2024',
        resumo: 'ED / SED / UBS · Disco dianteiro + tambor traseiro · Dois amortecedores traseiros',
        destaqueBadge: 'Blueflex · UBS',
        modeloDestinoId: 'yamaha-fazer-150',
        geracaoIds: ['yamaha-fazer-150-2014-2024'],
      },
      {
        slug: 'fz15',
        nome: 'FZ15 ABS',
        tituloCompleto: 'FZ15 Fazer ABS',
        anosLabel: '2023–2026',
        resumo: 'ABS dianteiro + disco traseiro · Suspensão traseira monocross · Farol projetor LED',
        destaqueBadge: 'ABS · Disco Duplo',
        modeloDestinoId: 'yamaha-fazer-150',
        geracaoIds: ['yamaha-fazer-150-2023-2026'],
      },
    ],
  },
  'yamaha-ybr-factor-125': {
    familiaModeloId: 'yamaha-ybr-factor-125',
    marca: 'Yamaha',
    nomeFamilia: 'YBR / Factor 125',
    subtitulo: 'Separe pela geração correta entre YBR 125 clássica, Factor 125 carburada e Factor 125i injetada.',
    versoes: [
      {
        slug: 'ybr125',
        nome: 'YBR 125',
        tituloCompleto: 'YBR 125',
        anosLabel: '2000–2008',
        resumo: 'Versões K / E / ED · Carburador a gasolina · Motor 124 cm³ OHC',
        destaqueBadge: 'Carburada · Gasolina',
        modeloDestinoId: 'yamaha-ybr-factor-125',
        geracaoIds: ['yamaha-ybr-factor-125-2000-2008'],
      },
      {
        slug: 'factor125',
        nome: 'Factor 125',
        tituloCompleto: 'Factor 125',
        anosLabel: '2009–2016',
        resumo: 'Factor YBR 125 K / E / ED · Carburador a gasolina · Tela metálica interna',
        destaqueBadge: 'Carburada · 2009–2016',
        modeloDestinoId: 'yamaha-ybr-factor-125',
        geracaoIds: ['yamaha-ybr-factor-125-2009-2016'],
      },
      {
        slug: 'factor125i',
        nome: 'Factor 125i',
        tituloCompleto: 'Factor 125i',
        anosLabel: '2017–2024',
        resumo: 'Injeção eletrônica Blueflex · Freio UBS · Filtro de óleo externo de papel',
        destaqueBadge: 'Injetada · Blueflex',
        modeloDestinoId: 'yamaha-ybr-factor-125',
        geracaoIds: ['yamaha-ybr-factor-125-2017-2024'],
      },
    ],
  },
  'yamaha-crosser-150': {
    familiaModeloId: 'yamaha-crosser-150',
    marca: 'Yamaha',
    nomeFamilia: 'Crosser 150',
    subtitulo: 'Escolha o acabamento visual da Crosser 150 (S para-lama baixo urbano ou Z para-lama alto trail).',
    versoes: [
      {
        slug: 's',
        nome: 'Crosser S',
        tituloCompleto: 'Crosser 150 S',
        anosLabel: '2015–2026',
        resumo: 'Para-lama dianteiro baixo junto à roda · Proposta urbana/mista · UBS (até 2018) e ABS (2019+)',
        destaqueBadge: 'Para-lama Baixo',
        modeloDestinoId: 'yamaha-crosser-150',
        geracaoIds: ['yamaha-crosser-150-2015-2018', 'yamaha-crosser-150-2019-2026'],
      },
      {
        slug: 'z',
        nome: 'Crosser Z',
        tituloCompleto: 'Crosser 150 Z',
        anosLabel: '2015–2026',
        resumo: 'Para-lama dianteiro alto estilo trail + sanfonas nas bengalas · UBS (até 2018) e ABS (2019+)',
        destaqueBadge: 'Para-lama Alto',
        modeloDestinoId: 'yamaha-crosser-150',
        geracaoIds: ['yamaha-crosser-150-2015-2018', 'yamaha-crosser-150-2019-2026'],
      },
    ],
  },
};

/**
 * Modelos unificados visualmente dentro de uma família na tela de Modelos
 * (permanecem independentes no catálogo para busca, manuais e arquitetura).
 */
export const MODELOS_OCULTOS_NO_GRID_DE_MODELOS = new Set<string>(['honda-cg-160-start']);

export function getFamiliaMoto(modeloId: string): FamiliaMotoConfig | undefined {
  return FAMILIAS_MOTO[modeloId];
}

/**
 * Se o usuário entrar direto em um modelo filho (ex.: `honda-cg-160-start` via busca "start"),
 * resolve o contexto da família + versão para manter breadcrumbs e fotos consistentes.
 */
export function resolverContextoFamiliaInicial(modeloId: string): {
  familia: FamiliaMotoConfig;
  versao?: VersaoFamiliaMoto;
} | null {
  const direta = FAMILIAS_MOTO[modeloId];
  if (direta) return { familia: direta };

  for (const familia of Object.values(FAMILIAS_MOTO)) {
    const versao = familia.versoes.find((v) => v.modeloDestinoId === modeloId);
    if (versao) return { familia, versao };
  }
  return null;
}

/** Resolve o Modelo e as Gerações filtradas para a versão selecionada. */
export function resolverGeracoesVersaoFamilia(versao: VersaoFamiliaMoto): {
  modelo: Modelo;
  geracoes: Geracao[];
} | null {
  const modelo = findModelo(versao.modeloDestinoId);
  if (!modelo) return null;

  const permitidos = new Set(versao.geracaoIds);
  const geracoes = modelo.geracoes.filter((g) => permitidos.has(g.id));
  return { modelo, geracoes };
}
