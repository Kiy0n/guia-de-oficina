import { faixaMm, faixaRpm, geracao, torque } from '@/data/motos/helpers';
import type { FichaTecnica, Modelo, TorqueAperto } from '@/types/moto';

const MOTOR_SOHC_2V = 'Monocilíndrico 4T SOHC 2 válvulas';

// ---------------------------------------------------------------------------
// Tabelas de Torque Padrão Yamaha (Manuais de Serviço)
// ---------------------------------------------------------------------------

const TORQUES_YAMAHA_150: TorqueAperto[] = [
  torque('Bujão de drenagem do óleo do motor', 20, 'motor', 'Substituir gaxeta/arruela de vedação'),
  torque('Parafusos da tampa do filtro de óleo (3x M6)', 10, 'motor', 'Atenção: o parafuso inferior é mais longo; verificar O-ring'),
  torque('Vela de ignição (NGK CPR8EA-9)', 13, 'motor', 'Rosca M10 — não exceder 15 N·m no cabeçote frio'),
  torque('Parafusos da tampa de inspeção de válvulas', 10, 'motor'),
  torque('Contratuerca do parafuso regulador de válvula', 14, 'motor'),
  torque('Porca do eixo dianteiro', 59, 'chassi'),
  torque('Porca do eixo traseiro', 85, 'chassi', 'Travar com cupilha nova quando aplicável'),
  torque('Porcas da coroa traseira', 43, 'chassi', 'Apertar cruzado'),
  torque('Parafusos da pinça de freio dianteira', 35, 'freios'),
  torque('Porca da mesa superior (coluna de direção)', 75, 'suspensao'),
  torque('Parafusos dos grampos das mesas (superior / inferior)', 23, 'suspensao'),
];

const TORQUES_YBR_125: TorqueAperto[] = [
  torque('Bujão de drenagem do óleo do motor', 20, 'motor'),
  torque('Vela de ignição (NGK CR7HSA)', 13, 'motor'),
  torque('Tampas de inspeção das válvulas (roscadas)', 18, 'motor', 'Lubrificar O-ring antes de fechar'),
  torque('Contratuerca do regulador de válvula', 14, 'motor'),
  torque('Porca do eixo dianteiro', 59, 'chassi'),
  torque('Porca do eixo traseiro', 80, 'chassi'),
  torque('Porcas da coroa de transmissão', 40, 'chassi'),
  torque('Parafusos da pinça de freio dianteira (ED)', 35, 'freios'),
];

const TORQUES_FLUO_125: TorqueAperto[] = [
  torque('Bujão de drenagem do óleo do motor', 20, 'motor'),
  torque('Bujão de drenagem do óleo da transmissão final', 20, 'motor', 'Usar arruela de vedação nova'),
  torque('Vela de ignição (NGK CR6HSA)', 13, 'motor'),
  torque('Contratuerca do regulador de válvula', 7, 'motor'),
  torque('Porca da polia primária do CVT (variador)', 45, 'motor'),
  torque('Porca da campana da embreagem CVT', 45, 'motor'),
  torque('Porca do eixo dianteiro', 26, 'chassi'),
  torque('Porca do eixo da roda traseira', 150, 'chassi'),
  torque('Parafusos da pinça de freio dianteira', 35, 'freios'),
];

// ---------------------------------------------------------------------------
// Bases de Ficha Técnica Yamaha
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
  pesoSecoKg: 117,
  motorDetalhes: {
    diametroCursoMm: { diametro: 57.3, curso: 57.9 },
    taxaCompressao: '9,6:1',
    potencia: '12,2 cv (gasolina) / 12,4 cv (etanol) @ 7.500 rpm',
    torque: '1,30 kgf·m @ 5.500 rpm',
    marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
    comando: 'SOHC 2 válvulas com balancins roletados e pistão forjado em alumínio',
    filtroOleo: 'Elemento de papel descartável (tampa lateral com 3 parafusos) + tela metálica inferior',
    alimentacaoDetalhe: 'Injeção eletrônica Blueflex • Pressão da bomba de combustível: 2,5 – 3,0 bar (250–300 kPa)',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'Yamalube SAE 10W-40 Semissintético ou 20W-50 (API SL / JASO MA2)',
      capacidadeTrocaL: 1.0,
      capacidadeTrocaComFiltroL: 1.05,
      capacidadeTotalL: 1.15,
      observacao: '1,0 L sem filtro | 1,05 L trocando o elemento de papel | 1,15 L motor seco',
    },
    tanqueL: 15.7,
    reservaL: 2.2,
    fluidoFreio: 'DOT 4',
    fluidoBengala: {
      especificacao: 'Yamaha Fork Oil 10W / ATF equivalente',
      volumePorCanelaMl: 154,
      nivelMm: 147,
    },
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.08, 0.12, '0,08 – 0,12 mm'),
    valvulaEscapeMm: faixaMm(0.12, 0.16, '0,12 – 0,16 mm'),
    folgaCorrenteMm: faixaMm(30, 40, '30 – 40 mm'),
    folgaManeteEmbreagemMm: faixaMm(10, 15, '10 – 15 mm'),
    folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaAceleradorMm: faixaMm(3, 5, '3 – 5 mm'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK CPR8EA-9',
      iridiumAlternativa: 'NGK CPR8EAIX-9',
      folgaEletrodoMm: faixaMm(0.8, 0.9, '0,8 – 0,9 mm'),
    },
    bateria: {
      modelo: 'Yuasa YTX5L-BS / Heliar HTZ6L',
      tensaoV: 12,
      capacidadeAh: 5,
      tensaoCargaV: '14,0V ± 0,5V @ 5.000 rpm',
    },
    fusivelPrincipalA: 15,
    fusiveisSecundarios: '7,5A (injeção / sinalização)',
    lampadaFarol: 'HS1 / H4 12V 35/35W',
  },
  pneus: {
    dianteiro: { medida: '2.75-18 42P (ou 80/100-18)', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Sem câmara (ED/UBS)' },
    traseiro: { medida: '90/90-18 57P (ou 100/80-18 na Fazer)', pressaoPsi: 29, pressaoComGarupaPsi: 33, tipo: 'Sem câmara' },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: '428HO x 126L (com retentor O-Ring)',
    pinhaoDentes: 14,
    coroaDentes: 39,
  },
  torques: TORQUES_YAMAHA_150,
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
  pesoSecoKg: 112,
  motorDetalhes: {
    diametroCursoMm: { diametro: 54.0, curso: 54.0 },
    taxaCompressao: '10,0:1',
    potencia: '12,5 cv @ 8.000 rpm (YBR) / 10,2 cv @ 7.800 rpm (Factor)',
    torque: '1,19 kgf·m @ 6.500 rpm',
    marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
    comando: 'SOHC 2 válvulas (corrente de comando silenciosa)',
    filtroOleo: 'Tela metálica interna junto ao cárter (não usa filtro de papel nas 125 carburadas)',
    alimentacaoDetalhe:
      'Carburador Mikuni VM20 (2000–2008: giclê alta #110 / baixa #17,5) | Mikuni BS25 a vácuo na Factor (2009–2016: alta #115)',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'Yamalube SAE 20W-50 Mineral (API SL / JASO MA2)',
      capacidadeTrocaL: 1.0,
      capacidadeTotalL: 1.2,
    },
    tanqueL: 13.0,
    reservaL: 1.8,
    fluidoFreio: 'DOT 4 (versão ED) / Tambor nas versões K e E',
    fluidoBengala: {
      especificacao: 'Yamaha Fork Oil 10W / ATF',
      volumePorCanelaMl: 154,
      nivelMm: 147,
    },
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.08, 0.12, '0,08 – 0,12 mm'),
    valvulaEscapeMm: faixaMm(0.1, 0.14, '0,10 – 0,14 mm'),
    folgaCorrenteMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaManeteEmbreagemMm: faixaMm(10, 15, '10 – 15 mm'),
    folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaAceleradorMm: faixaMm(3, 5, '3 – 5 mm'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK CR7HSA',
      iridiumAlternativa: 'NGK CR7HIX',
      folgaEletrodoMm: faixaMm(0.6, 0.7, '0,6 – 0,7 mm'),
    },
    bateria: {
      modelo: 'Yuasa YB5L-B (K/E) / YTX5L-BS (Factor)',
      tensaoV: 12,
      capacidadeAh: 5,
      tensaoCargaV: '14,0V ± 0,5V @ 5.000 rpm',
    },
    fusivelPrincipalA: 15,
    lampadaFarol: '12V 35/35W (BA20d na YBR / HS1 na Factor)',
  },
  pneus: {
    dianteiro: { medida: '2.75-18 42P', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Com câmara (sem câmara na Factor ED)' },
    traseiro: { medida: '90/90-18 57P', pressaoPsi: 28, pressaoComGarupaPsi: 32 },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: '428H x 118L',
    pinhaoDentes: 14,
    coroaDentes: 45,
  },
  torques: TORQUES_YBR_125,
};

const fluo125Base: FichaTecnica = {
  cilindradaCc: 125,
  motor: 'Monocilíndrico 4T SOHC 2 válvulas Blue Core',
  alimentacao: 'injecao',
  combustivel: 'gasolina',
  arrefecimento: 'ar',
  partida: 'eletrica',
  cambio: { tipo: 'cvt' },
  freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'ABS' },
  pesoSecoKg: 98,
  motorDetalhes: {
    diametroCursoMm: { diametro: 52.4, curso: 57.9 },
    taxaCompressao: '9,5:1',
    potencia: '9,5 cv @ 8.000 rpm',
    torque: '1,0 kgf·m @ 5.500 rpm',
    marchaLentaRpm: faixaRpm(1400, 1600, '1.500 ± 100 rpm'),
    comando: 'SOHC 2V Blue Core com Smart Motor Generator (SMG) e Stop & Start',
    filtroOleo: 'Tela metálica no bujão de drenagem inferior',
    alimentacaoDetalhe: 'Injeção eletrônica Yamaha (gasolina) • Pressão da bomba: 2,5 bar (250 kPa)',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'Yamalube Scooter SAE 10W-40 Semissintético (API SL / JASO MB)',
      capacidadeTrocaL: 0.8,
      capacidadeTotalL: 0.84,
      observacao: '800 ml na troca periódica — verificar com a vareta apenas apoiada (sem rosquear)',
    },
    oleoTransmissaoCvt: {
      especificacao: 'Yamalube SAE 10W-40 ou 85W-140',
      capacidadeL: 0.1,
    },
    tanqueL: 4.2,
    fluidoFreio: 'DOT 4 (ABS dianteiro de série)',
    fluidoBengala: {
      especificacao: 'Yamaha Fork Oil 10W',
      volumePorCanelaMl: 61,
    },
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.06, 0.1, '0,06 – 0,10 mm'),
    valvulaEscapeMm: faixaMm(0.1, 0.14, '0,10 – 0,14 mm'),
    folgaAceleradorMm: faixaMm(3, 5, '3 – 5 mm'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK CR6HSA',
      folgaEletrodoMm: faixaMm(0.6, 0.7, '0,6 – 0,7 mm'),
    },
    bateria: {
      modelo: 'Yuasa YTZ6V (12V 5Ah — compatível Stop & Start)',
      tensaoV: 12,
      capacidadeAh: 5,
      tensaoCargaV: '14,0V ± 0,5V @ 5.000 rpm',
    },
    fusivelPrincipalA: 15,
    fusiveisSecundarios: '7,5A (ABS, Smart Key, ECU)',
    lampadaFarol: 'Full LED',
  },
  pneus: {
    dianteiro: { medida: '100/90-12 59J', pressaoPsi: 22, pressaoComGarupaPsi: 22, tipo: 'Sem câmara (pneu largo)' },
    traseiro: { medida: '110/90-12 64J', pressaoPsi: 25, pressaoComGarupaPsi: 29, tipo: 'Sem câmara' },
  },
  transmissaoFinal: {
    tipo: 'correia',
    cvtDetalhe: {
      correiaCodigo: 'Yamaha B44-E7641-00 (V-Belt)',
      larguraLimiteMm: 18.0,
      roletesMedidaPeso: '6 roletes 20x12 mm (10g)',
    },
  },
  torques: TORQUES_FLUO_125,
};

// ---------------------------------------------------------------------------
// Catálogo YAMAHA (5 modelos / 11 gerações)
// ---------------------------------------------------------------------------

export const YAMAHA: Modelo[] = [
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
        nomeGeracao: 'Factor 150 Blueflex (E / ED / UBS)',
        versoes: ['E', 'ED', 'UBS'],
        destaques: [
          'Motor 149cc SOHC Blueflex com filtro de óleo em papel',
          'Injeção eletrônica e painel digital com indicador de marcha e ECO',
          'Freio combinado UBS por cabo/varão (versão ED/UBS)',
        ],
        alertasBancada: [
          'Diferente das Honda 160, o motor Yamaha 150 usa FILTRO DE ÓLEO EM ELEMENTO DE PAPEL externo: trocar o filtro (1,05 L de óleo) e cuidar para não inverter o parafuso longo inferior da tampa.',
          'Folga de válvulas a frio: Adm 0,08 – 0,12 mm e Esc 0,12 – 0,16 mm.',
          'No sistema UBS da Factor/Fazer 150, a combinação é mecânica no pedal do freio traseiro (puxa um cabo que aciona o cilindro mestre dianteiro) — regular a porca do varão traseiro antes da folga do cabo combinador.',
          'Corrente original 428HO possui retentores O-Ring (folga 30 a 40 mm).',
        ],
        fichaTecnica: { ...yamaha150Base, versaoReferencia: 'ED UBS' },
      }),
      geracao('yamaha-factor-150', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Nova Geração Farol LED / DX',
        versoes: ['Factor 150', 'Factor 150 DX'],
        destaques: [
          'Novo farol em LED e carenagens redesenhadas',
          'Painel blackout atualizado e tampa de tanque tipo aviação',
          'Motor 149cc Blueflex homologado Promot M5',
        ],
        alertasBancada: [
          'Calibração Promot M5 (2025+): verificar integridade da sonda lambda e catalisador; nunca remover catalisador sob risco de acender luz de anomalia.',
          'Tampa do tanque agora é articulada (estilo aviação) — verificar alinhamento da borracha de respiro caso haja cheiro de combustível.',
          'Manter troca do filtro de óleo de papel e óleo Yamalube 10W-40 Semissintético (1,05 L com filtro).',
        ],
        fichaTecnica: {
          ...yamaha150Base,
          versaoReferencia: 'DX',
          fluidos: {
            ...yamaha150Base.fluidos,
            tanqueL: 15.4,
          },
          eletrica: {
            ...yamaha150Base.eletrica,
            lampadaFarol: 'Full LED',
          },
        },
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
        nomeGeracao: 'YS150 Fazer (ED / SED / UBS)',
        versoes: ['ED', 'SED', 'UBS'],
        destaques: [
          'Motor 149cc SOHC Blueflex',
          'Pneu traseiro 100/80-18 sem câmara e painel analógico-digital',
          'Freio combinado UBS a partir de 2017',
        ],
        alertasBancada: [
          'Primeiros lotes (2014–2016) recomendavam Yamalube 20W-50; a partir de 2018 a Yamaha adotou 10W-40 Semissintético para toda a família 150.',
          'Ao substituir o filtro de óleo de papel, sempre lubrificar o anel O-ring da tampa e encaixar o fundo cego do filtro voltado para fora.',
          'Folga de válvulas: Adm 0,08 – 0,12 mm | Esc 0,12 – 0,16 mm com motor frio.',
        ],
        fichaTecnica: {
          ...yamaha150Base,
          versaoReferencia: 'SED / UBS',
          pneus: {
            dianteiro: { medida: '80/100-18 M/C 47P', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Sem câmara' },
            traseiro: { medida: '100/80-18 M/C 59P', pressaoPsi: 29, pressaoComGarupaPsi: 33, tipo: 'Sem câmara' },
          },
        },
      }),
      geracao('yamaha-fazer-150', {
        anoInicio: 2023,
        anoFim: 2026,
        nomeGeracao: 'FZ15 Fazer ABS',
        versoes: ['FZ15 ABS'],
        destaques: [
          'Suspensão traseira Monocross com link e bengalas robustas de 41 mm',
          'Freio a disco nas duas rodas com ABS dianteiro',
          'Farol projetor LED e pneus largos aro 17 (100/80-17 e 140/60-17)',
        ],
        alertasBancada: [
          'ATENÇÃO À BENGALA DA FZ15: usa tubos largos de 41 mm (da família Fazer 250) e leva 445 ml de fluido por canela — nunca usar os 154 ml da Fazer 150 UBS!',
          'Relação da FZ15 é mais curta (14x41) para compensar o pneu traseiro radial 140/60-17.',
          'Suspensão traseira Monocross possui sistema de link: desmontar e engraxar buchas/roletes do link a cada 10.000 km.',
          'Freio traseiro é a disco hidráulico independente (DOT 4) e dianteiro conta com ABS de 1 canal.',
        ],
        fichaTecnica: {
          ...yamaha150Base,
          versaoReferencia: 'FZ15 ABS',
          freios: { dianteiro: 'disco', traseiro: 'disco', sistema: 'ABS' },
          pesoSecoKg: 127,
          fluidos: {
            ...yamaha150Base.fluidos,
            tanqueL: 11.9,
            fluidoBengala: {
              especificacao: 'Yamaha Fork Oil 10W',
              volumePorCanelaMl: 445,
              nivelMm: 150,
              observacao: 'Bengalas de 41 mm de diâmetro — 445 ml por canela',
            },
          },
          eletrica: {
            ...yamaha150Base.eletrica,
            lampadaFarol: 'Projetor LED bifuncional + DRL',
          },
          pneus: {
            dianteiro: { medida: '100/80-17 M/C 52P', pressaoPsi: 28, pressaoComGarupaPsi: 28, tipo: 'Sem câmara' },
            traseiro: { medida: '140/60-R17 M/C 63P', pressaoPsi: 32, pressaoComGarupaPsi: 32, tipo: 'Radial sem câmara' },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428HO x 128L (com retentor)',
            pinhaoDentes: 14,
            coroaDentes: 41,
          },
        },
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
        nomeGeracao: 'XTZ 150 Crosser E / ED / S / Z',
        versoes: ['E', 'ED', 'S', 'Z'],
        destaques: [
          'Motor 149cc SOHC Blueflex com balancins roletados',
          'Suspensão traseira Monocross com link',
          'Disco dianteiro / tambor traseiro (sem ABS)',
        ],
        alertasBancada: [
          'Obrigatório desmontar e lubrificar os espaçadores do link da suspensão traseira Monocross a cada 10.000 km; se trabalhar seco, gripa e quebra a haste.',
          'Folga da corrente é medida com a moto no cavalete lateral: 40 a 50 mm na Crosser devido ao curso de 180 mm da suspensão.',
          'Volume de fluido da bengala dianteira é 206 ml por canela (Yamaha Fork Oil 10W).',
        ],
        fichaTecnica: {
          ...yamaha150Base,
          versaoReferencia: 'ED / Z',
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'convencional' },
          pesoSecoKg: 120,
          fluidos: {
            ...yamaha150Base.fluidos,
            tanqueL: 12.0,
            reservaL: 2.3,
            fluidoBengala: {
              especificacao: 'Yamaha Fork Oil 10W',
              volumePorCanelaMl: 206,
              nivelMm: 153,
            },
          },
          folgas: {
            ...yamaha150Base.folgas,
            folgaCorrenteMm: faixaMm(40, 50, '40 – 50 mm'),
          },
          pneus: {
            dianteiro: { medida: '90/90-19 M/C 52P', pressaoPsi: 22, pressaoComGarupaPsi: 22, tipo: 'Uso misto com câmara' },
            traseiro: { medida: '110/90-17 M/C 60P', pressaoPsi: 22, pressaoComGarupaPsi: 25, tipo: 'Uso misto com câmara' },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428HO x 126L (com retentor)',
            pinhaoDentes: 14,
            coroaDentes: 41,
          },
        },
      }),
      geracao('yamaha-crosser-150', {
        anoInicio: 2019,
        anoFim: 2026,
        nomeGeracao: 'Crosser 150 ABS / Projetor LED (2023+)',
        versoes: ['S ABS', 'Z ABS'],
        destaques: [
          'ABS dianteiro e disco de freio nas duas rodas',
          'Farol projetor LED, painel digital completo e tomada 12V (2023+)',
          'Suspensão traseira Monocross com link',
        ],
        alertasBancada: [
          'A partir de 2019 a Crosser ganhou freio a disco traseiro + ABS dianteiro: trocar fluido DOT 4 dos dois reservatórios a cada 2 anos.',
          'Versão S (para-lama baixo em duas partes) e versão Z (para-lama alto na mesa inferior) compartilham exatamente a mesma mecânica e volume de bengala (206 ml).',
          'Engraxar o sistema de link traseiro e rolamentos da coluna de direção a cada 10.000 km.',
        ],
        fichaTecnica: {
          ...yamaha150Base,
          versaoReferencia: 'Z ABS',
          freios: { dianteiro: 'disco', traseiro: 'disco', sistema: 'ABS' },
          pesoSecoKg: 125,
          fluidos: {
            ...yamaha150Base.fluidos,
            tanqueL: 12.0,
            reservaL: 2.3,
            fluidoBengala: {
              especificacao: 'Yamaha Fork Oil 10W',
              volumePorCanelaMl: 206,
              nivelMm: 153,
            },
          },
          folgas: {
            ...yamaha150Base.folgas,
            folgaCorrenteMm: faixaMm(40, 50, '40 – 50 mm'),
          },
          eletrica: {
            ...yamaha150Base.eletrica,
            lampadaFarol: 'Projetor LED + DRL (2023–2026) / HS1 35/35W (2019–2022)',
          },
          pneus: {
            dianteiro: { medida: '90/90-19 M/C 52P', pressaoPsi: 22, pressaoComGarupaPsi: 22, tipo: 'Uso misto com câmara' },
            traseiro: { medida: '110/90-17 M/C 60P', pressaoPsi: 22, pressaoComGarupaPsi: 25, tipo: 'Uso misto com câmara' },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428HO x 126L (com retentor)',
            pinhaoDentes: 14,
            coroaDentes: 41,
          },
        },
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
        nomeGeracao: 'YBR 125 (K / E / ED)',
        versoes: ['K', 'E', 'ED'],
        destaques: [
          'Motor 123,7cc SOHC carburado (Mikuni VM20)',
          'Folga de válvulas Adm 0,08–0,12 mm / Esc 0,10–0,14 mm',
          'Vela NGK CR7HSA',
        ],
        alertasBancada: [
          'Motor YBR 125 carburado NÃO tem filtro de óleo de papel: possui apenas peneira interna; trocar 1,0 L de óleo 20W-50 rigorosamente a cada 3.000 km.',
          'Folga de escape da 125 (0,10 – 0,14 mm) é ligeiramente menor que a da 150 (0,12 – 0,16 mm).',
          'Vela NGK CR7HSA tem rosca curta M10 — cuidado para não rosquear vela de rosca longa (CPR8EA-9), pois bate na cabeça do pistão!',
        ],
        fichaTecnica: ybr125Base,
      }),
      geracao('yamaha-ybr-factor-125', {
        anoInicio: 2009,
        anoFim: 2016,
        nomeGeracao: 'Factor YBR 125 K / E / ED',
        versoes: ['K', 'E', 'ED'],
        destaques: [
          'Carburador Mikuni BS25 a vácuo com sensor TPS',
          'Rodas de liga leve e pneus sem câmara na versão ED',
          'Novo design de tanque e carenagens',
        ],
        alertasBancada: [
          'Carburador Mikuni BS25 usa pistonete a diafragma (vácuo): furinhos ou ressecamento no diafragma impedem a moto de passar de 60 km/h.',
          'Continua utilizando vela de rosca curta NGK CR7HSA e 1,0 L de óleo 20W-50 sem filtro de papel.',
          'Verificar estado do coletor de admissão de borracha, que costuma rachar e dar entrada falsa de ar.',
        ],
        fichaTecnica: {
          ...ybr125Base,
          motorDetalhes: {
            ...ybr125Base.motorDetalhes,
            potencia: '11,2 cv @ 7.800 rpm',
            torque: '1,15 kgf·m @ 6.000 rpm',
            alimentacaoDetalhe:
              'Carburador Mikuni BS25 a vácuo com TPS • Giclê principal #115 / baixa #15 • Parafuso mistura: 2,5 voltas',
          },
        },
      }),
      geracao('yamaha-ybr-factor-125', {
        anoInicio: 2017,
        anoFim: 2024,
        nomeGeracao: 'Factor 125i Injetada Blueflex',
        versoes: ['125i', '125i UBS'],
        destaques: [
          'Novo motor 125cc Blueflex injetado (com filtro de óleo de papel!)',
          'Vela rosca longa NGK CPR8EA-9',
          'Freio combinado UBS e painel digital',
        ],
        alertasBancada: [
          'Atenção máxima: a Factor 125i (2017+) compartilha a arquitetura da Factor 150 — ela TEM filtro de óleo de papel na tampa direita (1,05 L com filtro) e usa vela de rosca longa NGK CPR8EA-9!',
          'Relação também mudou para 14x39 com corrente 428HO com retentor (folga 30–40 mm).',
          'Óleo recomendado passou a ser o Yamalube 10W-40 Semissintético.',
        ],
        fichaTecnica: {
          ...ybr125Base,
          versaoReferencia: '125i UBS',
          cilindradaCc: 125,
          alimentacao: 'injecao',
          combustivel: 'flex',
          partida: 'eletrica',
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'UBS' },
          motorDetalhes: {
            ...ybr125Base.motorDetalhes,
            diametroCursoMm: { diametro: 52.4, curso: 57.9 },
            potencia: '11,0 cv (gasolina) / 11,1 cv (etanol) @ 7.500 rpm',
            torque: '1,20 kgf·m @ 6.000 rpm',
            filtroOleo: 'Elemento de papel descartável na tampa lateral direita + tela metálica',
            alimentacaoDetalhe: 'Injeção eletrônica Blueflex • Pressão da bomba: 2,5 – 3,0 bar (250–300 kPa)',
          },
          fluidos: {
            ...ybr125Base.fluidos,
            tanqueL: 15.7,
            oleoMotor: {
              especificacao: 'Yamalube SAE 10W-40 Semissintético (API SL / JASO MA2)',
              capacidadeTrocaL: 1.0,
              capacidadeTrocaComFiltroL: 1.05,
              capacidadeTotalL: 1.15,
            },
          },
          folgas: {
            ...ybr125Base.folgas,
            folgaCorrenteMm: faixaMm(30, 40, '30 – 40 mm'),
          },
          eletrica: {
            ...ybr125Base.eletrica,
            vela: {
              modelo: 'NGK CPR8EA-9 (Rosca longa M10)',
              iridiumAlternativa: 'NGK CPR8EAIX-9',
              folgaEletrodoMm: faixaMm(0.8, 0.9, '0,8 – 0,9 mm'),
            },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428HO x 126L (com retentor)',
            pinhaoDentes: 14,
            coroaDentes: 39,
          },
          torques: TORQUES_YAMAHA_150,
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
        nomeGeracao: 'Fluo 125 ABS (Blue Core)',
        destaques: [
          'Motor Blue Core 125cc SOHC arrefecido a ar',
          'ABS dianteiro de série e Smart Key',
          'Partida silenciosa (SMG) e sistema Stop & Start',
        ],
        alertasBancada: [
          'Folga de válvulas da Fluo 125: Adm 0,06 – 0,10 mm e Esc 0,10 – 0,14 mm com motor frio.',
          'Volume de óleo do motor é 0,8 L (800 ml) de Yamalube Scooter 10W-40 JASO MB + 0,10 L (100 ml) de óleo na transmissão final.',
          'Limpar filtro de espuma da caixa de ventilação do CVT a cada 5.000 km; se entupir, superaquece a correia e derrete os roletes.',
          'Vela é a NGK CR6HSA (rosca curta M10, folga 0,6–0,7 mm).',
        ],
        fichaTecnica: fluo125Base,
      }),
      geracao('yamaha-fluo-125', {
        anoInicio: 2025,
        anoFim: 2026,
        sufixoId: 'hybrid',
        nomeGeracao: 'Fluo 125 Hybrid Connected ABS',
        destaques: [
          'Assistência elétrica Power Assist (SMG atua como motor auxiliar na arrancada)',
          'Conectividade Y-Connect e novo painel LCD',
          'ABS dianteiro e chave presencial Smart Key',
        ],
        alertasBancada: [
          'Sistema Mild-Hybrid usa o próprio Smart Motor Generator (SMG) alimentado pela bateria 12V para dar impulso nos primeiros 3 segundos de arrancada.',
          'Exige bateria YTZ6V em perfeito estado de saúde (acima de 12,6V em repouso) para habilitar tanto o Power Assist quanto o Stop & Start.',
          'Mecânica de cabeçote (Adm 0,06–0,10 mm / Esc 0,10–0,14 mm) e óleo (0,8 L motor + 0,10 L transmissão) permanece idêntica à Fluo padrão.',
        ],
        fichaTecnica: {
          ...fluo125Base,
          versaoReferencia: 'Hybrid Connected',
          motor: 'Monocilíndrico 4T SOHC 2V Blue Core Hybrid (Power Assist)',
        },
      }),
    ],
  },
];
