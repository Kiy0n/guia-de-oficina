/**
 * Catálogo inicial do MotoTech Pro — motos de baixa cilindrada (até 190cc) no Brasil.
 *
 * Fase 2: dados básicos de ficha técnica por geração.
 * Fase 3: expandir `fichaTecnica` (fluidos, folgas, torques, elétrica, pneus),
 * `planoManutencao`, `procedimentos` e `diagnosticos`.
 *
 * ⚠️ Os dados básicos devem ser conferidos contra o manual do proprietário /
 * manual de serviço de cada geração antes do uso em bancada.
 */
import type { FichaTecnica, Geracao, Modelo } from '@/types/moto';

// ---------------------------------------------------------------------------
// Helpers de construção
// ---------------------------------------------------------------------------

interface GeracaoInput extends Omit<Geracao, 'id' | 'anosLabel'> {
  /** Sufixo opcional para desambiguar ids com a mesma faixa de anos. */
  sufixoId?: string;
}

function geracao(modeloId: string, { sufixoId, ...g }: GeracaoInput): Geracao {
  return {
    id: [modeloId, g.anoInicio, g.anoFim, sufixoId].filter(Boolean).join('-'),
    anosLabel: `${g.anoInicio}–${g.anoFim}`,
    ...g,
  };
}

const MOTOR_OHC_2V = 'Monocilíndrico 4T OHC 2 válvulas';
const MOTOR_SOHC_2V = 'Monocilíndrico 4T SOHC 2 válvulas';

// ---------------------------------------------------------------------------
// HONDA
// ---------------------------------------------------------------------------

const cg160Base: FichaTecnica = {
  versaoReferencia: 'Titan',
  cilindradaCc: 162.7,
  motor: MOTOR_OHC_2V,
  alimentacao: 'injecao',
  combustivel: 'flex',
  arrefecimento: 'ar',
  partida: 'eletrica',
  cambio: { tipo: 'manual', marchas: 5 },
  freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'convencional' },
};

const cg150Base: FichaTecnica = {
  versaoReferencia: 'Titan ES',
  cilindradaCc: 149.2,
  motor: MOTOR_OHC_2V,
  alimentacao: 'carburador',
  combustivel: 'gasolina',
  arrefecimento: 'ar',
  partida: 'pedal-eletrica',
  cambio: { tipo: 'manual', marchas: 5 },
  freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'convencional' },
};

const cg125Base: FichaTecnica = {
  versaoReferencia: 'Fan KS',
  cilindradaCc: 124.9,
  motor: MOTOR_OHC_2V,
  alimentacao: 'carburador',
  combustivel: 'gasolina',
  arrefecimento: 'ar',
  partida: 'pedal',
  cambio: { tipo: 'manual', marchas: 5 },
  freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'convencional' },
};

const bros160Base: FichaTecnica = {
  versaoReferencia: 'ESDD',
  cilindradaCc: 162.7,
  motor: MOTOR_OHC_2V,
  alimentacao: 'injecao',
  combustivel: 'flex',
  arrefecimento: 'ar',
  partida: 'eletrica',
  cambio: { tipo: 'manual', marchas: 5 },
  freios: { dianteiro: 'disco', traseiro: 'disco', sistema: 'CBS' },
};

const xre190Base: FichaTecnica = {
  cilindradaCc: 184.4,
  motor: MOTOR_OHC_2V,
  alimentacao: 'injecao',
  combustivel: 'flex',
  arrefecimento: 'ar',
  partida: 'eletrica',
  cambio: { tipo: 'manual', marchas: 5 },
  freios: { dianteiro: 'disco', traseiro: 'disco', sistema: 'ABS' },
};

const biz125Base: FichaTecnica = {
  versaoReferencia: 'ES',
  cilindradaCc: 124.9,
  motor: MOTOR_OHC_2V,
  alimentacao: 'carburador',
  combustivel: 'gasolina',
  arrefecimento: 'ar',
  partida: 'pedal-eletrica',
  cambio: { tipo: 'semiautomatico', marchas: 4 },
  freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'convencional' },
};

const pop110Base: FichaTecnica = {
  cilindradaCc: 109.1,
  motor: MOTOR_OHC_2V,
  alimentacao: 'injecao',
  combustivel: 'gasolina',
  arrefecimento: 'ar',
  partida: 'pedal',
  cambio: { tipo: 'semiautomatico', marchas: 4 },
  freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'convencional' },
};

const pcxBase: FichaTecnica = {
  cilindradaCc: 149.3,
  motor: 'Monocilíndrico 4T OHC 2 válvulas eSP',
  alimentacao: 'injecao',
  combustivel: 'gasolina',
  arrefecimento: 'liquido',
  partida: 'eletrica',
  cambio: { tipo: 'cvt' },
  freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'CBS' },
};

const HONDA: Modelo[] = [
  {
    id: 'honda-cg-160',
    marca: 'Honda',
    nome: 'CG 160',
    categoria: 'street',
    aliases: ['Titan', 'Fan', 'Start', 'Cargo', 'CG160'],
    geracoes: [
      geracao('honda-cg-160', {
        anoInicio: 2016,
        anoFim: 2017,
        nomeGeracao: 'Lançamento 160cc',
        versoes: ['Start', 'Fan', 'Titan'],
        destaques: ['Motor 162,7cc OHC Flex', 'Injeção eletrônica PGM-FI', 'Disco dianteiro na Titan / tambor na Start e Fan'],
        fichaTecnica: cg160Base,
      }),
      geracao('honda-cg-160', {
        anoInicio: 2018,
        anoFim: 2024,
        nomeGeracao: 'Freio Combinado CBS',
        versoes: ['Start', 'Fan', 'Titan', 'Cargo'],
        destaques: ['Freio combinado CBS', 'Painel digital revisado', 'Farol com assinatura em LED (Titan)'],
        fichaTecnica: { ...cg160Base, freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'CBS' } },
      }),
      geracao('honda-cg-160', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Nova Geração ABS / Farol LED',
        versoes: ['Start', 'Fan', 'Titan'],
        destaques: ['Novo visual e farol full LED', 'ABS dianteiro (Titan)', 'Novo painel digital'],
        fichaTecnica: { ...cg160Base, freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'ABS' } },
      }),
    ],
  },
  {
    id: 'honda-cg-150',
    marca: 'Honda',
    nome: 'CG 150',
    categoria: 'street',
    aliases: ['Titan', 'Fan', 'Job', 'Sport', 'Mix', 'CG150'],
    geracoes: [
      geracao('honda-cg-150', {
        anoInicio: 2004,
        anoFim: 2008,
        nomeGeracao: 'Carburada',
        versoes: ['Titan KS', 'Titan ES', 'Titan ESD', 'Job', 'Sport'],
        destaques: ['Motor 149,2cc OHC', 'Carburador (gasolina)', 'Partida pedal + elétrica (ES)'],
        fichaTecnica: cg150Base,
      }),
      geracao('honda-cg-150', {
        anoInicio: 2009,
        anoFim: 2015,
        nomeGeracao: 'Mix / Flex Injetada',
        versoes: ['Titan Mix', 'Fan ESi', 'Fan ESDi', 'Cargo'],
        destaques: ['Injeção PGM-FI', 'Motor Flex (Mix)', 'Primeira CG flex do Brasil'],
        fichaTecnica: { ...cg150Base, versaoReferencia: 'Titan Mix ESD', alimentacao: 'injecao', combustivel: 'flex' },
      }),
    ],
  },
  {
    id: 'honda-cg-125',
    marca: 'Honda',
    nome: 'CG 125',
    categoria: 'street',
    aliases: ['Titan', 'Fan', 'Cargo', 'CG125'],
    geracoes: [
      geracao('honda-cg-125', {
        anoInicio: 2000,
        anoFim: 2008,
        nomeGeracao: 'Titan / Fan Carburada',
        versoes: ['Titan KS', 'Titan ES', 'Fan', 'Cargo'],
        destaques: ['Motor 124,9cc OHC', 'Carburador (gasolina)', 'Freios a tambor'],
        fichaTecnica: cg125Base,
      }),
      geracao('honda-cg-125', {
        anoInicio: 2009,
        anoFim: 2018,
        nomeGeracao: 'Fan 125 (KS / ES / ESDi)',
        versoes: ['Fan KS', 'Fan ES', 'Fan ESDi', 'Cargo'],
        destaques: ['Visual Fan atualizado', 'Partida elétrica nas versões ES', 'Injeção eletrônica na versão ESDi'],
        fichaTecnica: cg125Base,
      }),
    ],
  },
  {
    id: 'honda-nxr-160-bros',
    marca: 'Honda',
    nome: 'NXR 160 Bros',
    categoria: 'trail',
    aliases: ['Bros', 'NXR', 'Bros 160'],
    geracoes: [
      geracao('honda-nxr-160-bros', {
        anoInicio: 2015,
        anoFim: 2024,
        nomeGeracao: 'Bros 160 Flex',
        versoes: ['ESD', 'ESDD'],
        destaques: ['Motor 162,7cc OHC Flex', 'Injeção PGM-FI', 'Freio combinado CBS (ESDD)'],
        fichaTecnica: bros160Base,
      }),
      geracao('honda-nxr-160-bros', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Nova Geração ABS / LED',
        destaques: ['Novo visual com farol LED', 'ABS dianteiro', 'Painel digital renovado'],
        fichaTecnica: { ...bros160Base, versaoReferencia: undefined, freios: { dianteiro: 'disco', traseiro: 'disco', sistema: 'ABS' } },
      }),
    ],
  },
  {
    id: 'honda-xre-190',
    marca: 'Honda',
    nome: 'XRE 190',
    categoria: 'trail',
    aliases: ['XRE', 'XRE190'],
    geracoes: [
      geracao('honda-xre-190', {
        anoInicio: 2016,
        anoFim: 2024,
        nomeGeracao: 'XRE 190 ABS',
        destaques: ['Motor 184,4cc OHC Flex', 'ABS dianteiro de série', 'Freio a disco nas duas rodas'],
        fichaTecnica: xre190Base,
      }),
      geracao('honda-xre-190', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Nova Geração / Farol LED',
        versoes: ['Standard', 'Adventure'],
        destaques: ['Novo visual e iluminação LED', 'Painel digital renovado', 'ABS dianteiro'],
        fichaTecnica: xre190Base,
      }),
    ],
  },
  {
    id: 'honda-biz-125',
    marca: 'Honda',
    nome: 'Biz 125',
    categoria: 'cub',
    aliases: ['Biz', 'Biz125', 'Biz ES', 'Biz EX'],
    geracoes: [
      geracao('honda-biz-125', {
        anoInicio: 2006,
        anoFim: 2010,
        nomeGeracao: 'Carburada',
        versoes: ['KS', 'ES'],
        destaques: ['Motor 124,9cc OHC', 'Carburador (gasolina)', 'Câmbio semiautomático 4 marchas'],
        fichaTecnica: biz125Base,
      }),
      geracao('honda-biz-125', {
        anoInicio: 2011,
        anoFim: 2017,
        nomeGeracao: 'Flex Injetada',
        versoes: ['ES', 'EX'],
        destaques: ['Injeção PGM-FI', 'Motor Flex', 'Disco dianteiro na versão EX'],
        fichaTecnica: { ...biz125Base, alimentacao: 'injecao', combustivel: 'flex' },
      }),
      geracao('honda-biz-125', {
        anoInicio: 2018,
        anoFim: 2026,
        nomeGeracao: 'Novo Design / CBS',
        versoes: ['125', 'EX'],
        destaques: ['Novo design e painel digital', 'Freio combinado CBS', 'Injeção PGM-FI Flex'],
        fichaTecnica: {
          ...biz125Base,
          versaoReferencia: 'EX',
          alimentacao: 'injecao',
          combustivel: 'flex',
          partida: 'eletrica',
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'CBS' },
        },
      }),
    ],
  },
  {
    id: 'honda-pop-110i',
    marca: 'Honda',
    nome: 'Pop 110i',
    categoria: 'cub',
    aliases: ['Pop', 'Pop 110', 'Pop ES'],
    geracoes: [
      geracao('honda-pop-110i', {
        anoInicio: 2016,
        anoFim: 2024,
        nomeGeracao: 'Pop 110i Injetada',
        destaques: ['Motor 109,1cc injetado', 'Partida a pedal', 'Câmbio semiautomático 4 marchas'],
        fichaTecnica: pop110Base,
      }),
      geracao('honda-pop-110i', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Pop 110i ES — Partida Elétrica',
        destaques: ['Partida elétrica', 'Motor 109,1cc injetado', 'Freios a tambor'],
        fichaTecnica: { ...pop110Base, versaoReferencia: 'ES', partida: 'pedal-eletrica' },
      }),
    ],
  },
  {
    id: 'honda-pcx',
    marca: 'Honda',
    nome: 'PCX 150 / 160',
    categoria: 'scooter',
    aliases: ['PCX', 'PCX150', 'PCX160'],
    geracoes: [
      geracao('honda-pcx', {
        anoInicio: 2016,
        anoFim: 2022,
        nomeGeracao: 'PCX 150 (eSP)',
        versoes: ['Standard', 'DLX', 'Sport'],
        destaques: ['Motor eSP 149,3cc 2V arrefecido a líquido', 'Idling Stop', 'CBS (ABS nas versões DLX)'],
        fichaTecnica: pcxBase,
      }),
      geracao('honda-pcx', {
        anoInicio: 2023,
        anoFim: 2026,
        nomeGeracao: 'PCX 160 (eSP+ 4V)',
        versoes: ['CBS', 'DLX ABS'],
        destaques: ['Motor eSP+ 156,9cc 4 válvulas', 'ABS dianteiro', 'Controle de tração HSTC (DLX)'],
        fichaTecnica: {
          ...pcxBase,
          versaoReferencia: 'DLX ABS',
          cilindradaCc: 156.9,
          motor: 'Monocilíndrico 4T OHC 4 válvulas eSP+',
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'ABS' },
        },
      }),
    ],
  },
];

// ---------------------------------------------------------------------------
// YAMAHA
// ---------------------------------------------------------------------------

const yamaha150Base: FichaTecnica = {
  cilindradaCc: 149,
  motor: MOTOR_SOHC_2V,
  alimentacao: 'injecao',
  combustivel: 'flex',
  arrefecimento: 'ar',
  partida: 'eletrica',
  cambio: { tipo: 'manual', marchas: 5 },
  freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'UBS' },
};

const ybr125Base: FichaTecnica = {
  versaoReferencia: 'ED',
  cilindradaCc: 123.7,
  motor: MOTOR_SOHC_2V,
  alimentacao: 'carburador',
  combustivel: 'gasolina',
  arrefecimento: 'ar',
  partida: 'pedal-eletrica',
  cambio: { tipo: 'manual', marchas: 5 },
  freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'convencional' },
};

const YAMAHA: Modelo[] = [
  {
    id: 'yamaha-factor-150',
    marca: 'Yamaha',
    nome: 'Factor 150',
    categoria: 'street',
    aliases: ['Factor', 'YBR 150', 'Factor150'],
    geracoes: [
      geracao('yamaha-factor-150', {
        anoInicio: 2016,
        anoFim: 2024,
        nomeGeracao: 'Factor 150 Blueflex',
        versoes: ['E', 'ED'],
        destaques: ['Motor 149cc SOHC Blueflex', 'Injeção eletrônica', 'Freio combinado UBS (ED)'],
        fichaTecnica: { ...yamaha150Base, versaoReferencia: 'ED' },
      }),
      geracao('yamaha-factor-150', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Nova Geração',
        destaques: ['Visual e painel atualizados', 'Motor 149cc Blueflex', 'Freio combinado UBS'],
        fichaTecnica: yamaha150Base,
      }),
    ],
  },
  {
    id: 'yamaha-fazer-150',
    marca: 'Yamaha',
    nome: 'Fazer 150',
    categoria: 'street',
    aliases: ['Fazer', 'YS150', 'FZ15', 'FZ 15'],
    geracoes: [
      geracao('yamaha-fazer-150', {
        anoInicio: 2014,
        anoFim: 2024,
        nomeGeracao: 'YS150 Fazer',
        versoes: ['ED', 'SED', 'UBS'],
        destaques: ['Motor 149cc SOHC Blueflex', 'Injeção eletrônica', 'Freio combinado UBS'],
        fichaTecnica: yamaha150Base,
      }),
      geracao('yamaha-fazer-150', {
        anoInicio: 2023,
        anoFim: 2026,
        nomeGeracao: 'FZ15 ABS',
        destaques: ['ABS dianteiro', 'Farol LED', 'Painel digital'],
        fichaTecnica: { ...yamaha150Base, freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'ABS' } },
      }),
    ],
  },
  {
    id: 'yamaha-crosser-150',
    marca: 'Yamaha',
    nome: 'Crosser 150',
    categoria: 'trail',
    aliases: ['Crosser', 'XTZ 150', 'XTZ150'],
    geracoes: [
      geracao('yamaha-crosser-150', {
        anoInicio: 2015,
        anoFim: 2018,
        nomeGeracao: 'XTZ 150 Crosser S / Z',
        versoes: ['S', 'Z'],
        destaques: ['Motor 149cc SOHC Blueflex', 'Injeção eletrônica', 'Disco dianteiro / tambor traseiro'],
        fichaTecnica: { ...yamaha150Base, freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'convencional' } },
      }),
      geracao('yamaha-crosser-150', {
        anoInicio: 2019,
        anoFim: 2026,
        nomeGeracao: 'Crosser ABS / LED',
        versoes: ['S ABS', 'Z ABS'],
        destaques: ['ABS dianteiro', 'Farol e lanterna LED', 'Painel digital'],
        fichaTecnica: { ...yamaha150Base, freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'ABS' } },
      }),
    ],
  },
  {
    id: 'yamaha-ybr-factor-125',
    marca: 'Yamaha',
    nome: 'YBR 125 / Factor 125',
    categoria: 'street',
    aliases: ['YBR', 'Factor 125', 'Factor', 'YBR125', 'Factor 125i'],
    geracoes: [
      geracao('yamaha-ybr-factor-125', {
        anoInicio: 2000,
        anoFim: 2008,
        nomeGeracao: 'YBR 125',
        versoes: ['K', 'E', 'ED'],
        destaques: ['Motor 123,7cc SOHC', 'Carburador (gasolina)', 'Disco dianteiro na versão ED'],
        fichaTecnica: ybr125Base,
      }),
      geracao('yamaha-ybr-factor-125', {
        anoInicio: 2009,
        anoFim: 2016,
        nomeGeracao: 'Factor YBR 125 K / E / ED',
        versoes: ['K', 'E', 'ED'],
        destaques: ['Novo visual Factor', 'Carburador (gasolina)', 'Partida elétrica (E / ED)'],
        fichaTecnica: ybr125Base,
      }),
      geracao('yamaha-ybr-factor-125', {
        anoInicio: 2017,
        anoFim: 2024,
        nomeGeracao: 'Factor 125i Injetada',
        versoes: ['125i', '125i UBS'],
        destaques: ['Injeção eletrônica Blueflex', 'Freio combinado UBS', 'Partida elétrica'],
        fichaTecnica: {
          ...ybr125Base,
          versaoReferencia: 'UBS',
          alimentacao: 'injecao',
          combustivel: 'flex',
          partida: 'eletrica',
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'UBS' },
        },
      }),
    ],
  },
  {
    id: 'yamaha-fluo-125',
    marca: 'Yamaha',
    nome: 'Fluo 125 ABS',
    categoria: 'scooter',
    aliases: ['Fluo', 'Fluo ABS', 'Fluo Hybrid'],
    geracoes: [
      geracao('yamaha-fluo-125', {
        anoInicio: 2022,
        anoFim: 2026,
        nomeGeracao: 'Fluo 125 ABS',
        destaques: ['Motor Blue Core 125cc', 'ABS dianteiro', 'Partida silenciosa (SMG)'],
        fichaTecnica: {
          cilindradaCc: 125,
          motor: 'Monocilíndrico 4T SOHC 2 válvulas Blue Core',
          alimentacao: 'injecao',
          combustivel: 'gasolina',
          arrefecimento: 'ar',
          partida: 'eletrica',
          cambio: { tipo: 'cvt' },
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'ABS' },
        },
      }),
    ],
  },
];

// ---------------------------------------------------------------------------
// SUZUKI
// ---------------------------------------------------------------------------

const suzuki125Base: FichaTecnica = {
  cilindradaCc: 124,
  motor: MOTOR_SOHC_2V,
  alimentacao: 'carburador',
  combustivel: 'gasolina',
  arrefecimento: 'ar',
  partida: 'pedal-eletrica',
  cambio: { tipo: 'manual', marchas: 5 },
  freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'convencional' },
};

const SUZUKI: Modelo[] = [
  {
    id: 'suzuki-intruder-125',
    marca: 'Suzuki',
    nome: 'Intruder 125',
    categoria: 'custom',
    aliases: ['Intruder'],
    geracoes: [
      geracao('suzuki-intruder-125', {
        anoInicio: 2002,
        anoFim: 2007,
        nomeGeracao: 'Primeira Geração',
        destaques: ['Motor 124cc SOHC', 'Carburador (gasolina)', 'Estilo custom com disco dianteiro'],
        fichaTecnica: suzuki125Base,
      }),
      geracao('suzuki-intruder-125', {
        anoInicio: 2008,
        anoFim: 2016,
        nomeGeracao: 'Segunda Geração',
        destaques: ['Visual e acabamento revisados', 'Motor 124cc carburado', 'Partida pedal + elétrica'],
        fichaTecnica: suzuki125Base,
      }),
    ],
  },
  {
    id: 'suzuki-yes-125',
    marca: 'Suzuki',
    nome: 'Yes 125 / EN125',
    categoria: 'street',
    aliases: ['Yes', 'EN125', 'EN 125'],
    geracoes: [
      geracao('suzuki-yes-125', {
        anoInicio: 2005,
        anoFim: 2016,
        nomeGeracao: 'EN125 Yes',
        versoes: ['Yes', 'Yes SE'],
        destaques: ['Motor 124cc SOHC', 'Carburador (gasolina)', 'Disco dianteiro (SE)'],
        fichaTecnica: suzuki125Base,
      }),
    ],
  },
  {
    id: 'suzuki-gsr-150i',
    marca: 'Suzuki',
    nome: 'GSR 150i',
    categoria: 'street',
    aliases: ['GSR', 'GSR150'],
    geracoes: [
      geracao('suzuki-gsr-150i', {
        anoInicio: 2011,
        anoFim: 2017,
        nomeGeracao: 'GSR 150i Injetada',
        destaques: ['Motor 149,5cc SOHC', 'Injeção eletrônica', 'Partida elétrica'],
        fichaTecnica: {
          ...suzuki125Base,
          cilindradaCc: 149.5,
          alimentacao: 'injecao',
          partida: 'eletrica',
        },
      }),
    ],
  },
  {
    id: 'suzuki-burgman-125',
    marca: 'Suzuki',
    nome: 'Burgman 125 / i',
    categoria: 'scooter',
    aliases: ['Burgman', 'Burgman i', 'AN125'],
    geracoes: [
      geracao('suzuki-burgman-125', {
        anoInicio: 2005,
        anoFim: 2010,
        nomeGeracao: 'Burgman 125 Carburada',
        destaques: ['Motor 124cc SOHC', 'Carburador (gasolina)', 'Transmissão CVT'],
        fichaTecnica: { ...suzuki125Base, partida: 'eletrica', cambio: { tipo: 'cvt' } },
      }),
      geracao('suzuki-burgman-125', {
        anoInicio: 2011,
        anoFim: 2019,
        nomeGeracao: 'Burgman i Injetada',
        destaques: ['Injeção eletrônica', 'Transmissão CVT', 'Partida elétrica'],
        fichaTecnica: { ...suzuki125Base, alimentacao: 'injecao', partida: 'eletrica', cambio: { tipo: 'cvt' } },
      }),
    ],
  },
];

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const CATALOGO: readonly Modelo[] = [...HONDA, ...YAMAHA, ...SUZUKI];
