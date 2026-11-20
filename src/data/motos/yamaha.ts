import { faixaMm, faixaRpm, geracao, torque } from '@/data/motos/helpers';
import type { FichaTecnica, Modelo, TorqueAperto } from '@/types/moto';

const MOTOR_SOHC_2V = 'Monocilíndrico 4T SOHC 2 válvulas';

// ---------------------------------------------------------------------------
// Tabelas de Torque Oficiais Yamaha (Exclusivamente Valores dos Manuais PDF)
// ---------------------------------------------------------------------------

const TORQUES_YAMAHA_150_STREET: TorqueAperto[] = [
  torque(
    'Parafuso de drenagem do óleo do motor',
    20,
    'motor',
    '20 N·m (2,0 kgf·m) • Manuais Factor 150 (2016/2024/2025) e Fazer YS150 (2015/2024)',
  ),
  torque(
    'Parafusos da tampa do filtro de óleo',
    10,
    'motor',
    '10 N·m (1,0 kgf·m) • Manuais Factor 150 e Fazer YS150 (substituir O-ring se danificado)',
  ),
  torque(
    'Parafuso de sangria / dreno de ar do filtro de óleo',
    7,
    'motor',
    '7 N·m (0,7 kgf·m) • Manuais Factor 150 e Fazer YS150',
  ),
  torque(
    'Vela de ignição (NGK MR8D)',
    12.5,
    'motor',
    '12,5 N·m (1,25 kgf·m) • Manuais Factor 150 (2016/2024/2025) e Fazer YS150 (2015/2024)',
  ),
  torque(
    'Porca do eixo dianteiro',
    59,
    'chassi',
    '59 N·m (5,9 kgf·m) • Manuais Factor 150 e Fazer YS150',
  ),
  torque(
    'Porca do eixo traseiro',
    78,
    'chassi',
    '78 N·m (7,8 kgf·m) • Manuais Factor 150 (2024/2025) e Fazer YS150 (2024)',
  ),
  torque(
    'Porca do braço de torque do freio traseiro',
    18,
    'freios',
    '18 N·m (1,8 kgf·m na Factor 150) | 17,5 N·m (1,75 kgf·m na Fazer YS150)',
  ),
];

const TORQUES_YAMAHA_FZ15: TorqueAperto[] = [
  torque(
    'Parafuso de drenagem do óleo do motor',
    20,
    'motor',
    '20 N·m (2,0 kgf·m) • Manuais FZ15 ABS 2023 e 2025',
  ),
  torque(
    'Parafusos da tampa do filtro de óleo',
    10,
    'motor',
    '10 N·m (1,0 kgf·m) • Manuais FZ15 ABS 2023 e 2025',
  ),
  torque(
    'Vela de ignição (NGK MR8D)',
    13,
    'motor',
    '13 N·m (1,3 kgf·m) • Manuais FZ15 ABS 2023 e 2025',
  ),
  torque(
    'Porca do eixo dianteiro',
    59,
    'chassi',
    '59 N·m (5,9 kgf·m) • Manuais FZ15 ABS 2023 e 2025',
  ),
  torque(
    'Porca do eixo traseiro',
    59,
    'chassi',
    '59 N·m (5,9 kgf·m) • Manuais FZ15 ABS 2023 e 2025',
  ),
];

const TORQUES_YAMAHA_CROSSER: TorqueAperto[] = [
  torque(
    'Parafuso de drenagem do óleo do motor',
    20,
    'motor',
    '20 N·m (2,0 kgf·m) • Manuais Crosser 150 (2016/2018/2019/2024/2026)',
  ),
  torque(
    'Parafusos da tampa do filtro de óleo',
    10,
    'motor',
    '10 N·m (1,0 kgf·m) • Manuais Crosser 150',
  ),
  torque(
    'Parafuso de sangria / dreno de ar do filtro de óleo',
    7,
    'motor',
    '7 N·m (0,7 kgf·m) • Manuais Crosser 150',
  ),
  torque(
    'Vela de ignição (NGK MR8D)',
    12.5,
    'motor',
    '12,5 N·m (1,25 kgf·m) • Manuais Crosser 150 (2016–2026)',
  ),
  torque(
    'Porca do eixo dianteiro',
    60,
    'chassi',
    '60 N·m (6,0 kgf·m) • Manuais Crosser 150 (2019–2026)',
  ),
  torque(
    'Porca do eixo traseiro',
    80,
    'chassi',
    '80 N·m (8,0 kgf·m) • Manual Crosser 150 2018',
  ),
];

const TORQUES_FACTOR_125I: TorqueAperto[] = [
  torque(
    'Parafuso de drenagem do óleo do motor',
    20,
    'motor',
    '20 N·m (2,0 kgf·m) • Manuais Factor 125i 2017 e 2024',
  ),
  torque(
    'Parafusos da tampa do filtro de óleo',
    10,
    'motor',
    '10 N·m (1,0 kgf·m) • Manuais Factor 125i 2017 e 2024',
  ),
  torque(
    'Parafuso de sangria / dreno de ar do filtro de óleo',
    7,
    'motor',
    '7 N·m (0,7 kgf·m) • Manuais Factor 125i 2017 e 2024',
  ),
  torque(
    'Vela de ignição (NGK MR8D)',
    12.5,
    'motor',
    '12,5 N·m (1,25 kgf·m) • Manuais Factor 125i 2017 e 2024',
  ),
  torque(
    'Porca do eixo dianteiro',
    59,
    'chassi',
    '60 N·m (2017) | 59 N·m (2024) • Manuais Factor 125i 2017 e 2024',
  ),
  torque(
    'Porca do eixo traseiro',
    78,
    'chassi',
    '90 N·m (2017) | 78 N·m (2024) • Manuais Factor 125i 2017 e 2024',
  ),
  torque(
    'Porca do braço de torque do freio traseiro',
    18,
    'freios',
    '18 N·m (1,8 kgf·m) • Manuais Factor 125i 2017 e 2024',
  ),
];

const TORQUES_FACTOR_125_CARB: TorqueAperto[] = [
  torque(
    'Parafuso de drenagem do óleo do motor',
    20,
    'motor',
    '20 N·m (2,0 kgf·m) • Manuais Factor 125 2015 e 2016',
  ),
  torque(
    'Vela de ignição (NGK CR7HSA)',
    12.5,
    'motor',
    '12,5 N·m (1,25 kgf·m) • Manuais Factor 125 2015 e 2016',
  ),
];

const TORQUES_YBR_125_WEB: TorqueAperto[] = [
  torque(
    'Bujão de drenagem do óleo do motor',
    20,
    'motor',
    '20 N·m (2,0 kgf·m) • Fonte externa: Google (Scribd / SlideShare / Manual de Serviço YBR 125)',
  ),
  torque(
    'Vela de ignição (NGK CR7HSA)',
    12.5,
    'motor',
    '12,5 N·m (1,25 kgf·m) • Fonte externa: Google (Scribd / SlideShare)',
  ),
  torque(
    'Porcas cegas do cabeçote',
    22,
    'motor',
    '22 N·m (2,2 kgf·m) • Fonte externa: Google (Scribd)',
  ),
  torque(
    'Porca do eixo dianteiro',
    70,
    'chassi',
    '70 N·m (7,0 kgf·m) • Fonte externa: Google (Scribd / Manual de Serviço YBR 125)',
  ),
  torque(
    'Porca do eixo traseiro',
    90,
    'chassi',
    '90 N·m (9,0 kgf·m) • Fonte externa: Google (Scribd / Manual de Serviço YBR 125)',
  ),
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
    comando: 'SOHC 2 válvulas (corrente de comando)',
    filtroOleo: 'Elemento de papel descartável (tampa lateral com 3 parafusos, 10 N·m)',
    alimentacaoDetalhe:
      'Injeção eletrônica Blueflex • Pressão da bomba de combustível e folga de válvulas: aguardam confirmação no Manual de Serviço',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'YAMALUBE SAE 10W-40 / 20W-50 (20W-40 em 2015–2017) API SL ou superior, JASO MA',
      capacidadeTrocaL: 1.0,
      capacidadeTrocaComFiltroL: 1.1,
      observacao: '1,00 L sem troca do filtro de óleo | 1,10 L com troca do elemento do filtro de óleo (Manuais Yamaha 150)',
    },
    tanqueL: 15.7,
    reservaL: 2.2,
    fluidoFreio: 'DOT 4',
  },
  folgas: {
    folgaCorrenteMm: faixaMm(30, 40, '30 – 40 mm'),
    folgaManeteEmbreagemMm: faixaMm(10, 15, '10 – 15 mm'),
    folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaAceleradorMm: faixaMm(3, 5, '3 – 5 mm'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK MR8D',
      folgaEletrodoMm: faixaMm(0.8, 0.9, '0,8 – 0,9 mm'),
    },
    bateria: {
      modelo: '12 V – 5 Ah (selada)',
      tensaoV: 12,
      capacidadeAh: 5,
      tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
    },
    fusivelPrincipalA: 20,
    fusiveisSecundarios: '7,5 A / 10 A / 15 A (conforme ano/versão)',
    lampadaFarol: 'HS1 12 V – 35/35 W',
  },
  pneus: {
    dianteiro: { medida: '2.75-18 M/C 42P (ou 80/100-18)', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Sem câmara (ED/UBS)' },
    traseiro: { medida: '90/90-18 M/C 57P', pressaoPsi: 29, pressaoComGarupaPsi: 41, tipo: 'Sem câmara • 29 psi solo / 41 psi com garupa (Factor 150 2016)' },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: '428 (com retentor O-Ring)',
    pinhaoDentes: 14,
    coroaDentes: 39,
  },
  torques: TORQUES_YAMAHA_150_STREET,
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
    comando: 'SOHC 2 válvulas (corrente de comando)',
    filtroOleo: 'Tela metálica interna (não usa filtro de papel nas 125 carburadas)',
    alimentacaoDetalhe:
      'Carburador Mikuni VM20 (2000–2008) | Mikuni BS25 (2009–2016) — giclagem e ajustes internos aguardam confirmação no Manual de Serviço',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'YAMALUBE 4 SAE 20W-50 API SL JASO MA',
      capacidadeTrocaL: 1.0,
      capacidadeTotalL: 1.2,
    },
    tanqueL: 13.0,
    reservaL: 2.4,
    fluidoFreio: 'DOT 4 (versão ED) | Tambor nas versões K e E',
  },
  folgas: {
    folgaCorrenteMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaManeteEmbreagemMm: faixaMm(10, 15, '10 – 15 mm'),
    folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaAceleradorMm: faixaMm(3, 5, '3 – 5 mm'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK CR7HSA',
      folgaEletrodoMm: faixaMm(0.6, 0.7, '0,6 – 0,7 mm'),
    },
    bateria: {
      modelo: '12 V – 5 Ah',
      tensaoV: 12,
      capacidadeAh: 5,
      tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
    },
    fusivelPrincipalA: 15,
    lampadaFarol: '12 V – 35/35 W',
  },
  pneus: {
    dianteiro: { medida: '2.75-18 42P', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Com câmara (sem câmara na Factor ED)' },
    traseiro: { medida: '90/90-18 57P', pressaoPsi: 28, pressaoComGarupaPsi: 32 },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: '428 (relação 14x45 = 3,214)',
    pinhaoDentes: 14,
    coroaDentes: 45,
  },
  torques: TORQUES_YBR_125_WEB,
};

// ---------------------------------------------------------------------------
// Catálogo YAMAHA (5 modelos / 10 gerações)
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
          'Motor 149 cm³ SOHC Blueflex • Óleo 1,00 L sem filtro / 1,10 L com filtro de papel',
          'Vela oficial: NGK MR8D (0,8 – 0,9 mm • torque 12,5 N·m)',
          'Relação 14x39 (2,786) • Tanque 16,0 L (2016) / 15,7 L (2024) • Torques 20 / 10 / 7 / 59 / 78 N·m',
        ],
        alertasBancada: [
          'CORREÇÕES OFICIAIS DOS MANUAIS YAMAHA (2016 e 2024): vela padrão é NGK MR8D (0,8–0,9 mm, torque 12,5 N·m) e volume de óleo COM troca do filtro de papel é 1,10 L (1,00 L sem filtro) de YAMALUBE SAE 10W-40 / 20W-50 (20W-40 em 2016) API SL JASO MA.',
          'Calibragem pneu traseiro no Manual 2016: 29 psi só piloto / 41 psi com garupa (dianteiro 25 psi). Tanque: 16,0 L (2016) / 15,7 L (2024).',
          'Torques oficiais: bujão de óleo 20 N·m, tampa do filtro 10 N·m, parafuso de sangria 7 N·m, eixo dianteiro 59 N·m, eixo traseiro 78 N·m (2024) e braço de torque do freio traseiro 18 N·m.',
          'Folga de válvulas, volume de fluido de bengala e pressão da bomba de combustível não constam no Manual do Proprietário Yamaha — aguardam confirmação no Manual de Serviço.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'Factor 150 2016.pdf e Factor 150 2024.pdf (seções Manutenção Periódica e Especificações)',
          notas:
            'Auditado 100% nos Manuais Factor 150 2016 e 2024: óleo YAMALUBE 10W-40/20W-50 (20W-40 em 2016) API SL JASO MA, 1,00 L sem filtro / 1,10 L com filtro; vela NGK MR8D (0,8–0,9 mm, 12,5 N·m); relação 14x39 (2,786); tanque 16,0 L (2016) / 15,7 L (2024); pneu tras. 29/41 psi (2016); torques 20 / 10 / 7 / 12,5 / 59 / 78 / 18 N·m. Pendências que aguardam Manual de Serviço Yamaha: folga de válvulas em mm, volume/nível de óleo da bengala, pressão da bomba e torques internos.',
        },
        fichaTecnica: { ...yamaha150Base, versaoReferencia: 'ED UBS' },
      }),
      geracao('yamaha-factor-150', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Nova Geração Farol LED / DX',
        versoes: ['Factor 150', 'Factor 150 DX'],
        destaques: [
          'Novo farol em LED • Tanque 15,4 L • Pneus 80/100-18 e 100/80-18 sem câmara',
          'Óleo YAMALUBE 10W-40 / 20W-50 API SL JASO MA (1,00 L sem filtro / 1,10 L com filtro)',
          'Vela NGK MR8D (12,5 N·m) • Relação 14x39 (2,786) • Torques 20 / 10 / 7 / 59 / 78 N·m',
        ],
        alertasBancada: [
          'Mudanças oficiais na Factor 150 2025 (Manual Factor 150 2025): tanque passou para 15,4 L, farol em LED e pneus sem câmara 80/100-18 (dianteiro) e 100/80-18 (traseiro).',
          'Mantém óleo 1,00 L sem filtro / 1,10 L com troca do filtro de papel, vela NGK MR8D (0,8–0,9 mm, torque 12,5 N·m), relação 14x39 e torques 20 / 10 / 7 / 59 / 78 / 18 N·m.',
          'Folga de válvulas, volume de bengala e pressão da bomba de combustível aguardam confirmação no Manual de Serviço Yamaha.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'Factor 150 2025.pdf (seções Manutenção Periódica e Especificações)',
          notas:
            'Auditado 100% no Manual Factor 150 2025: tanque 15,4 L; pneus 80/100-18 e 100/80-18 sem câmara; farol LED; óleo YAMALUBE 10W-40/20W-50 API SL JASO MA (1,00 L sem filtro / 1,10 L com filtro); vela NGK MR8D (0,8–0,9 mm, 12,5 N·m); relação 14x39 (2,786); torques 20 / 10 / 7 / 12,5 / 59 / 78 / 18 N·m. Pendências que aguardam Manual de Serviço Yamaha: folga de válvulas em mm, volume/nível de óleo da bengala, pressão da bomba e torques internos.',
        },
        fichaTecnica: {
          ...yamaha150Base,
          versaoReferencia: 'Factor 150 / DX (2025)',
          fluidos: {
            ...yamaha150Base.fluidos,
            tanqueL: 15.4,
          },
          eletrica: {
            ...yamaha150Base.eletrica,
            lampadaFarol: 'LED',
          },
          pneus: {
            dianteiro: { medida: '80/100-18 M/C 47P', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Sem câmara' },
            traseiro: { medida: '100/80-18 M/C 59P', pressaoPsi: 29, pressaoComGarupaPsi: 33, tipo: 'Sem câmara' },
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
          'Motor 149 cm³ SOHC Blueflex • Óleo 1,00 L sem filtro / 1,10 L com filtro de papel',
          'Vela NGK MR8D (0,8 – 0,9 mm • 12,5 N·m) • Relação 14x41 (2,929) • Tanque 15,2 L (reserva 3,0 L)',
          'Folga do pedal de freio 10 – 20 mm • Torques 20 / 10 / 7 / 59 / 78 / 17,5 N·m',
        ],
        alertasBancada: [
          'Vela oficial nos Manuais YS150 2015 e 2024: NGK MR8D (0,8–0,9 mm, torque 12,5 N·m); óleo YAMALUBE SAE 10W-40 / 20W-50 (20W-40 em 2015) API SL JASO MA — 1,00 L sem filtro / 1,10 L com troca do filtro de papel.',
          'Relação oficial da YS150: 14x41 (2,929); tanque 15,2 L (reserva 3,0 L); folga do pedal do freio traseiro 10 – 20 mm; pneus 2.75-18 / 80/100-18 (25 psi) e 100/80-18 (29 psi solo / 33 psi com garupa).',
          'Torques oficiais: bujão 20 N·m, tampa filtro 10 N·m, sangria 7 N·m, eixo dianteiro 59 N·m, eixo traseiro 78 N·m (2024) e braço de torque do freio traseiro 17,5 N·m.',
          'Folga de válvulas, volume de fluido de bengala e pressão da bomba de combustível aguardam confirmação no Manual de Serviço Yamaha.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'Fazer 150 YS150 2015.pdf e Fazer 150 YS150 2024.pdf (seções Manutenção Periódica e Especificações)',
          notas:
            'Auditado 100% nos Manuais Fazer YS150 2015 e 2024: óleo YAMALUBE 10W-40/20W-50 (20W-40 em 2015) API SL JASO MA, 1,00 L sem filtro / 1,10 L com filtro; vela NGK MR8D (0,8–0,9 mm, 12,5 N·m); relação 14x41 (2,929); tanque 15,2 L (reserva 3,0 L); pneus 2.75-18/80/100-18 (25 psi) e 100/80-18 (29/33 psi); pedal freio 10–20 mm; torques 20 / 10 / 7 / 12,5 / 59 / 78 / 17,5 N·m. Pendências que aguardam Manual de Serviço Yamaha: folga de válvulas em mm, volume/nível de óleo da bengala, pressão da bomba e torques internos.',
        },
        fichaTecnica: {
          ...yamaha150Base,
          versaoReferencia: 'YS150 ED / SED / UBS',
          fluidos: {
            ...yamaha150Base.fluidos,
            tanqueL: 15.2,
            reservaL: 3.0,
          },
          folgas: {
            ...yamaha150Base.folgas,
            folgaPedalFreioMm: faixaMm(10, 20, '10 – 20 mm'),
          },
          pneus: {
            dianteiro: { medida: '2.75-18 / 80/100-18 M/C 47P', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Sem câmara' },
            traseiro: { medida: '100/80-18 M/C 59P', pressaoPsi: 29, pressaoComGarupaPsi: 33, tipo: 'Sem câmara' },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428 (relação 14x41 = 2,929)',
            pinhaoDentes: 14,
            coroaDentes: 41,
          },
        },
      }),
      geracao('yamaha-fazer-150', {
        anoInicio: 2023,
        anoFim: 2026,
        nomeGeracao: 'FZ15 Fazer ABS',
        versoes: ['FZ15 ABS'],
        destaques: [
          'Freio a disco nas duas rodas com ABS dianteiro • Farol e lanterna em LED',
          'Pneus Pirelli Diablo Rosso 2: 100/80 R17 (diant.) e 140/60 R17 (tras.) • Tanque 11,9 L (2023) / 12,0 L (2025)',
          'ATENÇÃO AO TORQUE DO EIXO TRASEIRO: 59 N·m (igual ao dianteiro) • Vela NGK MR8D (13 N·m)',
        ],
        alertasBancada: [
          'ATENÇÃO CRÍTICA AOS TORQUES DA FZ15 ABS (Manuais 2023 e 2025): a porca do eixo traseiro é APENAS 59 N·m (5,9 kgf·m) — bem menor que os 78–80 N·m da YS150/Factor/Crosser! Eixo dianteiro também é 59 N·m e vela NGK MR8D é 13 N·m.',
          'Óleo YAMALUBE SAE 10W-40 / 20W-50 API SL JASO MA: 1,00 L sem filtro / 1,10 L com troca do filtro de papel (bujão 20 N·m, tampa do filtro 10 N·m).',
          'Tanque: 11,9 L (Manual 2023) / 12,0 L (Manual 2025) • Pneus aro 17: 100/80 R17 e 140/60 R17 (Diablo Rosso 2) • Farol e lanterna em LED.',
          'Folga de válvulas, volume de fluido de bengala (41 mm) e pressão da bomba de combustível aguardam confirmação no Manual de Serviço Yamaha.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'Fazer FZ15 ABS 2023.pdf e Fazer FZ15 ABS 2025.pdf (seções Manutenção Periódica e Especificações)',
          notas:
            'Auditado 100% nos Manuais FZ15 ABS 2023 e 2025: óleo YAMALUBE 10W-40/20W-50 API SL JASO MA, 1,00 L sem filtro / 1,10 L com filtro; vela NGK MR8D (0,8–0,9 mm, 13 N·m); tanque 11,9 L (2023) / 12,0 L (2025); pneus 100/80 R17 e 140/60 R17 (Diablo Rosso 2); farol/lanterna LED; torques 20 / 10 / 13 / 59 (diant.) / 59 (tras.) N·m. Pendências que aguardam Manual de Serviço Yamaha: folga de válvulas em mm, volume/nível de óleo da bengala 41 mm, pressão da bomba e torques internos.',
        },
        fichaTecnica: {
          ...yamaha150Base,
          versaoReferencia: 'FZ15 ABS',
          freios: { dianteiro: 'disco', traseiro: 'disco', sistema: 'ABS' },
          pesoSecoKg: 127,
          fluidos: {
            ...yamaha150Base.fluidos,
            tanqueL: 12.0,
          },
          eletrica: {
            ...yamaha150Base.eletrica,
            lampadaFarol: 'LED (farol e lanterna)',
          },
          pneus: {
            dianteiro: { medida: '100/80 R17 M/C 52P (Diablo Rosso 2)', pressaoPsi: 28, pressaoComGarupaPsi: 28, tipo: 'Sem câmara' },
            traseiro: { medida: '140/60 R17 M/C 63P (Diablo Rosso 2)', pressaoPsi: 32, pressaoComGarupaPsi: 32, tipo: 'Radial sem câmara' },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428 (com retentor)',
            pinhaoDentes: 14,
            coroaDentes: 41,
          },
          torques: TORQUES_YAMAHA_FZ15,
        },
      }),
    ],
  },
  {
    id: 'yamaha-crosser-150',
    marca: 'Yamaha',
    nome: 'Crosser 150',
    categoria: 'trail',
    aliases: ['Crosser', 'XTZ 150', 'XTZ150', 'Crosser S', 'Crosser Z', 'Crosser 150 S', 'Crosser 150 Z'],
    geracoes: [
      geracao('yamaha-crosser-150', {
        anoInicio: 2015,
        anoFim: 2018,
        nomeGeracao: 'XTZ 150 Crosser E / ED / S / Z',
        versoes: ['E', 'ED', 'S', 'Z'],
        destaques: [
          'Motor 149 cm³ SOHC Blueflex • Óleo 1,00 L sem filtro / 1,10 L com filtro de papel',
          'Vela NGK MR8D (0,8 – 0,9 mm • 12,5 N·m) • Relação 14x41 (2,929) • Tanque 12,0 L (reserva 3,0 L)',
          'Pneu traseiro 110/90-17: 22 psi solo / 28 psi com garupa • Eixo traseiro 80 N·m',
        ],
        alertasBancada: [
          'Óleo YAMALUBE SAE 10W-40 / 20W-50 (20W-40 em 2016) API SL JASO MA: 1,00 L sem filtro / 1,10 L com troca do filtro de papel; vela oficial NGK MR8D (0,8–0,9 mm, torque 12,5 N·m).',
          'Calibragem oficial pneu traseiro (110/90-17 60P): 22 psi só piloto / 28 psi piloto + passageiro (dianteiro 90/90-19 52P: 22 psi).',
          'Relação 14x41 (2,929); tanque 12,0 L (reserva 3,0 L); farol halógeno HS1 35/35 W; torques: bujão 20 N·m, tampa filtro 10 N·m, sangria 7 N·m, eixo dianteiro 60 N·m, eixo traseiro 80 N·m (2018).',
          'Folga de válvulas, volume de fluido de bengala e pressão da bomba de combustível aguardam confirmação no Manual de Serviço Yamaha.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'Crosser 150 2016.pdf e Crosser 150 2018.pdf (seções Manutenção Periódica e Especificações)',
          notas:
            'Auditado 100% nos Manuais Crosser 150 2016 e 2018: óleo YAMALUBE 10W-40/20W-50 (20W-40 em 2016) API SL JASO MA, 1,00 L sem filtro / 1,10 L com filtro; vela NGK MR8D (0,8–0,9 mm, 12,5 N·m); relação 14x41 (2,929); tanque 12,0 L (reserva 3,0 L); pneus 90/90-19 (22 psi) e 110/90-17 (22/28 psi); farol HS1 35/35W; torques 20 / 10 / 7 / 12,5 / 60 / 80 N·m. Pendências que aguardam Manual de Serviço Yamaha: folga de válvulas em mm, volume/nível de óleo da bengala, pressão da bomba e torques internos.',
        },
        fichaTecnica: {
          ...yamaha150Base,
          versaoReferencia: 'ED / S / Z',
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'convencional' },
          pesoSecoKg: 120,
          fluidos: {
            ...yamaha150Base.fluidos,
            tanqueL: 12.0,
            reservaL: 3.0,
          },
          folgas: {
            ...yamaha150Base.folgas,
            folgaCorrenteMm: faixaMm(40, 50, '40 – 50 mm'),
          },
          pneus: {
            dianteiro: { medida: '90/90-19 M/C 52P', pressaoPsi: 22, pressaoComGarupaPsi: 22, tipo: 'Uso misto com câmara' },
            traseiro: { medida: '110/90-17 M/C 60P', pressaoPsi: 22, pressaoComGarupaPsi: 28, tipo: 'Uso misto com câmara • 22 psi solo / 28 psi com garupa' },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428 (relação 14x41 = 2,929)',
            pinhaoDentes: 14,
            coroaDentes: 41,
          },
          torques: TORQUES_YAMAHA_CROSSER,
        },
      }),
      geracao('yamaha-crosser-150', {
        anoInicio: 2019,
        anoFim: 2026,
        nomeGeracao: 'Crosser 150 ABS / Projetor LED (2023+)',
        versoes: ['S ABS', 'Z ABS'],
        destaques: [
          'ABS dianteiro e disco de freio nas duas rodas • Farol HS1 35/35 W (2019) / LED (2024–2026)',
          'Óleo 1,00 L sem filtro / 1,10 L com filtro • Vela NGK MR8D (12,5 N·m) • Relação 14x41',
          'Pneu traseiro 110/90-17: 22 psi solo / 28 psi com garupa • Eixo dianteiro 60 N·m',
        ],
        alertasBancada: [
          'A partir de 2019 a Crosser adotou freio a disco traseiro + ABS dianteiro (fluido DOT 4); a partir de 2023–2026 o farol passou para projetor LED (halógeno HS1 35/35 W em 2019).',
          'Óleo YAMALUBE SAE 10W-40 / 20W-50 API SL JASO MA: 1,00 L sem filtro / 1,10 L com troca do filtro de papel; vela NGK MR8D (0,8–0,9 mm, torque 12,5 N·m).',
          'Tanque 12,0 L (reserva 3,0 L); relação 14x41 (2,929); pneu traseiro 22 psi solo / 28 psi com garupa; torques: bujão 20 N·m, tampa filtro 10 N·m, sangria 7 N·m, eixo dianteiro 60 N·m.',
          'Folga de válvulas, volume de fluido de bengala e pressão da bomba de combustível aguardam confirmação no Manual de Serviço Yamaha.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte:
            'Crosser 150 2019.pdf, Crosser 150 2024.pdf e Crosser 150 2026.pdf (seções Manutenção Periódica e Especificações)',
          notas:
            'Auditado 100% nos Manuais Crosser 150 2019, 2024 e 2026: óleo YAMALUBE 10W-40/20W-50 API SL JASO MA, 1,00 L sem filtro / 1,10 L com filtro; vela NGK MR8D (0,8–0,9 mm, 12,5 N·m); relação 14x41 (2,929); tanque 12,0 L (reserva 3,0 L); pneus 90/90-19 (22 psi) e 110/90-17 (22/28 psi); farol HS1 35/35W (2019) / LED (2024–2026); torques 20 / 10 / 7 / 12,5 / 60 N·m. Pendências que aguardam Manual de Serviço Yamaha: folga de válvulas em mm, volume/nível de óleo da bengala, pressão da bomba e torques internos.',
        },
        fichaTecnica: {
          ...yamaha150Base,
          versaoReferencia: 'S ABS / Z ABS',
          freios: { dianteiro: 'disco', traseiro: 'disco', sistema: 'ABS' },
          pesoSecoKg: 125,
          fluidos: {
            ...yamaha150Base.fluidos,
            tanqueL: 12.0,
            reservaL: 3.0,
          },
          folgas: {
            ...yamaha150Base.folgas,
            folgaCorrenteMm: faixaMm(40, 50, '40 – 50 mm'),
          },
          eletrica: {
            ...yamaha150Base.eletrica,
            lampadaFarol: 'HS1 35/35 W (2019–2022) | LED (2023–2026)',
          },
          pneus: {
            dianteiro: { medida: '90/90-19 M/C 52P', pressaoPsi: 22, pressaoComGarupaPsi: 22, tipo: 'Uso misto com câmara' },
            traseiro: { medida: '110/90-17 M/C 60P', pressaoPsi: 22, pressaoComGarupaPsi: 28, tipo: 'Uso misto com câmara • 22 psi solo / 28 psi com garupa' },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428 (relação 14x41 = 2,929)',
            pinhaoDentes: 14,
            coroaDentes: 41,
          },
          torques: TORQUES_YAMAHA_CROSSER,
        },
      }),
    ],
  },
  {
    id: 'yamaha-ybr-factor-125',
    marca: 'Yamaha',
    nome: 'YBR 125 / Factor 125',
    categoria: 'street',
    aliases: ['YBR', 'YBR 125', 'Factor 125', 'Factor', 'YBR125', 'Factor 125i'],
    geracoes: [
      geracao('yamaha-ybr-factor-125', {
        anoInicio: 2000,
        anoFim: 2008,
        nomeGeracao: 'YBR 125 (K / E / ED)',
        versoes: ['K', 'E', 'ED'],
        destaques: [
          'Motor 123,7 cm³ SOHC carburado (Mikuni VM20) • Óleo 20W-50 (1,0 L troca / 1,2 L desmontagem)',
          'Folga de válvulas (fonte web): Adm 0,08 – 0,12 mm / Esc 0,10 – 0,14 mm (motor frio)',
          'Vela NGK CR7HSA (0,7 mm • 12,5 N·m) • Bengala 154,5 ml (nível 156 mm) • Eixos 70 / 90 N·m',
        ],
        alertasBancada: [
          'OBSERVAÇÃO (FONTE WEB): sem PDF local da YBR 125 (2000–2008); dados conferidos em fontes externas na internet (Google: Scribd, SlideShare, EuCurtoMoto, Magnetron). Confirmar no manual oficial em PDF quando disponível.',
          'Motor YBR 125 carburado NÃO tem filtro de óleo de papel (apenas tela interna): 1,0 L na troca / 1,2 L na desmontagem (SAE 20W-50 API SG/SH/SL JASO MA).',
          'Vela NGK CR7HSA (ou CR6HSA em algumas tabelas alternativas) de rosca curta M10, folga 0,6–0,7 mm, torque 12,5 N·m — nunca usar vela de rosca longa.',
          'Suspensão dianteira (fonte web): 154,5 ml de fluido 10W/ATF por canela (nível 156 mm sem mola, tubo comprimido).',
        ],
        auditoria: {
          status: 'fonte_web',
          ultimaRevisao: '2026-11-19',
          origemExterna: 'Google (Scribd, SlideShare, EuCurtoMoto, Magnetron)',
          fonte:
            'Pesquisa Web autorizada (Google: transcrições do Manual de Serviço YBR 125 no Scribd, SlideShare, EuCurtoMoto e Magnetron)',
          notas:
            'Sem PDF local em public/manuals/. Dados conferidos via fontes externas: óleo SAE 20W-50 JASO MA (1,0 L / 1,2 L); válvulas Adm 0,08–0,12 mm / Esc 0,10–0,14 mm; vela NGK CR7HSA (0,6–0,7 mm, 12,5 N·m); bengala 154,5 ml (nível 156 mm, 10W); torques bujão 20 N·m, cabeçote 22 N·m, eixo diant. 70 N·m, eixo tras. 90 N·m. Substituir por auditoria oficial assim que o PDF estiver em public/manuals/.',
        },
        fichaTecnica: {
          ...ybr125Base,
          fluidos: {
            ...ybr125Base.fluidos,
            fluidoBengala: {
              especificacao: 'Óleo de garfo 10W / ATF (fonte web: EuCurtoMoto / Scribd)',
              volumePorCanelaMl: 154.5,
              nivelMm: 156,
            },
          },
          folgas: {
            ...ybr125Base.folgas,
            valvulaAdmissaoMm: faixaMm(0.08, 0.12, '0,08 – 0,12 mm (fonte web)'),
            valvulaEscapeMm: faixaMm(0.1, 0.14, '0,10 – 0,14 mm (fonte web)'),
          },
        },
      }),
      geracao('yamaha-ybr-factor-125', {
        anoInicio: 2009,
        anoFim: 2016,
        nomeGeracao: 'Factor YBR 125 K / E / ED',
        versoes: ['K', 'E', 'ED'],
        destaques: [
          'Motor 123,7 cm³ (54,0 x 54,0 mm, 10,0:1) • Carburador Mikuni BS25',
          'Óleo YAMALUBE 4 SAE 20W-50 API SL JASO MA (1,00 L sem filtro de papel)',
          'Vela NGK CR7HSA (0,6 – 0,7 mm • 12,5 N·m) • Relação 14x45 (3,214) • Tanque 13,0 L (reserva 2,4 L)',
        ],
        alertasBancada: [
          'Confirmado nos Manuais Factor 125 2015 e 2016: motor 123,7 cm³ (54,0 x 54,0 mm, 10,0:1), carburador BS25, óleo YAMALUBE 4 20W-50 API SL JASO MA (1,00 L, sem filtro de papel) e vela rosca curta NGK CR7HSA (0,6–0,7 mm, torque 12,5 N·m).',
          'Relação 14x45 (3,214); tanque 13,0 L (reserva 2,4 L); fusível principal 15 A; torque do bujão de drenagem de óleo 20 N·m.',
          'Folga de válvulas, giclagem interna do carburador BS25, volume de fluido de bengala e torques de eixos aguardam confirmação no Manual de Serviço Yamaha.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'Factor 125 2015.pdf e Factor 125 2016.pdf (seções Manutenção Periódica e Especificações)',
          notas:
            'Auditado 100% nos Manuais Factor 125 2015 e 2016: 123,7 cm³ (54,0x54,0 mm, 10,0:1); carburador BS25; óleo YAMALUBE 4 20W-50 API SL JASO MA (1,00 L, sem filtro de papel); vela NGK CR7HSA (0,6–0,7 mm, 12,5 N·m); relação 14x45 (3,214); tanque 13,0 L (reserva 2,4 L); fusível 15A; bujão de óleo 20 N·m. Pendências que aguardam Manual de Serviço Yamaha: folga de válvulas em mm, giclagem BS25, volume/nível de óleo da bengala e torques de eixos/internos.',
        },
        fichaTecnica: {
          ...ybr125Base,
          motorDetalhes: {
            ...ybr125Base.motorDetalhes,
            potencia: '10,2 cv @ 7.800 rpm',
            torque: '1,13 kgf·m @ 6.000 rpm',
            alimentacaoDetalhe:
              'Carburador Mikuni BS25 (gasolina) • Giclagem e ajustes internos aguardam confirmação no Manual de Serviço',
          },
          torques: TORQUES_FACTOR_125_CARB,
        },
      }),
      geracao('yamaha-ybr-factor-125', {
        anoInicio: 2017,
        anoFim: 2024,
        nomeGeracao: 'Factor 125i Injetada Blueflex',
        versoes: ['125i', '125i UBS'],
        destaques: [
          'Motor 124,9 cm³ (52,4 x 57,9 mm, 10,0:1) Blueflex com filtro de óleo de papel (1,00 L / 1,10 L)',
          'Vela oficial: NGK MR8D (0,8 – 0,9 mm • 12,5 N·m) • Relação 14x43 (3,071)',
          'Tanque 15,7 L (reserva 2,2 L) • Pneu traseiro 29 / 41 psi • Fusível principal 20 A',
        ],
        alertasBancada: [
          'CORREÇÕES OFICIAIS DOS MANUAIS FACTOR 125i (2017 e 2024): vela padrão é NGK MR8D (0,8–0,9 mm, torque 12,5 N·m — NÃO usar CR7HSA nem CPR8EA-9!), óleo COM filtro de papel é 1,10 L (1,00 L sem filtro) e relação oficial é 14x43 (3,071)!',
          'Atenção aos torques de eixo entre anos: eixo dianteiro 60 N·m (2017) / 59 N·m (2024); eixo traseiro 90 N·m (2017) / 78 N·m (2024); bujão 20 N·m; tampa filtro 10 N·m; sangria 7 N·m; braço freio traseiro 18 N·m.',
          'Tanque 15,7 L (reserva 2,2 L); pneu traseiro 29 psi solo / 41 psi com garupa; fusível principal 20 A (15 A ignição/backup).',
          'Folga de válvulas, volume de fluido de bengala e pressão da bomba de combustível aguardam confirmação no Manual de Serviço Yamaha.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'Factor 125i 2017.pdf e Factor 125i 2024.pdf (seções Manutenção Periódica e Especificações)',
          notas:
            'Auditado 100% nos Manuais Factor 125i 2017 e 2024: 124,9 cm³ (52,4x57,9 mm, 10,0:1); óleo YAMALUBE 10W-40/20W-50 (20W-40 em 2017) API SL JASO MA, 1,00 L sem filtro / 1,10 L com filtro; vela NGK MR8D (0,8–0,9 mm, 12,5 N·m); relação 14x43 (3,071); tanque 15,7 L (reserva 2,2 L); pneu tras. 29/41 psi; fusível principal 20A (15A ignição/backup); torques 20 / 10 / 7 / 12,5 / 60-59 / 90-78 / 18 N·m. Pendências que aguardam Manual de Serviço Yamaha: folga de válvulas em mm, volume/nível de óleo da bengala, pressão da bomba e torques internos.',
        },
        fichaTecnica: {
          ...yamaha150Base,
          versaoReferencia: '125i UBS',
          cilindradaCc: 124.9,
          alimentacao: 'injecao',
          combustivel: 'flex',
          partida: 'eletrica',
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'UBS' },
          motorDetalhes: {
            ...yamaha150Base.motorDetalhes,
            diametroCursoMm: { diametro: 52.4, curso: 57.9 },
            taxaCompressao: '10,0:1',
            potencia: '11,0 cv (gasolina) / 11,1 cv (etanol) @ 7.500 rpm',
            torque: '1,16 kgf·m @ 6.000 rpm',
            filtroOleo: 'Elemento de papel descartável na tampa lateral direita (10 N·m)',
            alimentacaoDetalhe:
              'Injeção eletrônica Blueflex • Pressão da bomba de combustível e folga de válvulas: aguardam confirmação no Manual de Serviço',
          },
          fluidos: {
            ...yamaha150Base.fluidos,
            tanqueL: 15.7,
            reservaL: 2.2,
          },
          eletrica: {
            ...yamaha150Base.eletrica,
            fusivelPrincipalA: 20,
            fusiveisSecundarios: '15 A (ignição / backup)',
          },
          pneus: {
            dianteiro: { medida: '2.75-18 M/C 42P', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Sem câmara' },
            traseiro: { medida: '90/90-18 M/C 57P', pressaoPsi: 29, pressaoComGarupaPsi: 41, tipo: 'Sem câmara • 29 psi solo / 41 psi com garupa' },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428 (relação 14x43 = 3,071)',
            pinhaoDentes: 14,
            coroaDentes: 43,
          },
          torques: TORQUES_FACTOR_125I,
        },
      }),
    ],
  },
  {
    id: 'yamaha-fazer-125',
    marca: 'Yamaha',
    nome: 'Fazer 125',
    categoria: 'street',
    aliases: ['Fazer 125', 'Fazer125', 'YBR 125 Fazer', 'Factor 125i'],
    geracoes: [
      geracao('yamaha-fazer-125', {
        anoInicio: 2016,
        anoFim: 2024,
        nomeGeracao: 'Fazer 125',
        versoes: ['Standard'],
        destaques: [
          'Street 125cc SOHC 2 válvulas arrefecida a ar',
          'Injeção eletrônica BlueFlex (confirmar especificação exata no Manual Oficial)',
          'Câmbio manual de 5 marchas e freio dianteiro a disco',
        ],
        alertasBancada: [
          'OBSERVAÇÃO (FONTE WEB): no Brasil a linha street 125cc moderna da Yamaha foi comercializada como Factor 125i (sem manual separado "Fazer 125"); dados conferidos via fontes externas (Google: Scribd, SlideShare, Magnetron, TudoDeMoto).',
          'Óleo SAE 10W-40 / 20W-50 API SL JASO MA (1,0 L sem filtro / 1,1 L com troca do filtro de papel); relação padrão 14x43 (passo 428).',
          'Folga de válvulas (fonte web): Adm 0,08 – 0,12 mm / Esc 0,10 – 0,14 mm (até 0,12 – 0,16 mm nas 125i injetadas). Conferir se a unidade usa vela NGK MR8D (injetada) ou CR7HSA (carburada).',
        ],
        auditoria: {
          status: 'fonte_web',
          ultimaRevisao: '2026-11-19',
          origemExterna: 'Google (Scribd, SlideShare, Magnetron, TudoDeMoto)',
          fonte:
            'Pesquisa Web autorizada (Google: fichas técnicas e referências da família Yamaha 125cc street no Scribd, SlideShare, Magnetron e TudoDeMoto)',
          notas:
            'Sem PDF local separado com nome "Fazer 125" (no Brasil a 125cc injetada equivalente é a Factor 125i, já auditada via PDF oficial). Dados conferidos via fontes web: óleo 10W-40/20W-50 JASO MA (1,0 L / 1,1 L com filtro); válvulas Adm 0,08–0,12 mm / Esc 0,10–0,14 mm (até 0,16 mm na 125i); relação 14x43.',
        },
        fichaTecnica: {
          ...yamaha150Base,
          versaoReferencia: 'Fazer 125',
          cilindradaCc: 125,
          motor: MOTOR_SOHC_2V,
          alimentacao: 'injecao',
          combustivel: 'flex',
          arrefecimento: 'ar',
          partida: 'eletrica',
          cambio: { tipo: 'manual', marchas: 5 },
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'UBS' },
          pesoSecoKg: 117,
          motorDetalhes: {
            diametroCursoMm: { diametro: 52.4, curso: 57.9 },
            taxaCompressao: '10,0:1',
            potencia: '11,1 cv @ 7.500 rpm (referência — confirmar no manual)',
            torque: '1,16 kgf·m @ 6.000 rpm (referência — confirmar no manual)',
            marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
            comando: 'SOHC 2 válvulas (corrente de comando)',
            filtroOleo: 'Elemento de papel descartável (confirmar no manual)',
            alimentacaoDetalhe: 'Injeção eletrônica Yamaha — confirmar pressão da bomba e parâmetros no Manual Oficial',
          },
          fluidos: {
            oleoMotor: {
              especificacao: 'Yamalube 4T SAE 10W-40 / 20W-50 JASO MA (confirmar no manual)',
              capacidadeTrocaL: 1.0,
              capacidadeTrocaComFiltroL: 1.1,
              observacao: 'Volume de referência — confirmar no Manual Oficial em PDF',
            },
            tanqueL: 15.7,
            reservaL: 2.2,
            fluidoFreio: 'DOT 4 (confirmar no manual)',
          },
          folgas: {
            valvulaAdmissaoMm: faixaMm(0.08, 0.12, '0,08 – 0,12 mm (fonte web)'),
            valvulaEscapeMm: faixaMm(0.1, 0.14, '0,10 – 0,14 mm (até 0,16 mm na 125i — fonte web)'),
            folgaCorrenteMm: faixaMm(25, 35, '25 – 35 mm'),
            folgaManeteEmbreagemMm: faixaMm(10, 15, '10 – 15 mm'),
            folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
            folgaAceleradorMm: faixaMm(3, 5, '3 – 5 mm'),
          },
          eletrica: {
            vela: {
              modelo: 'NGK MR8D (125i) / NGK CR7HSA (carburada — fonte web)',
              folgaEletrodoMm: faixaMm(0.7, 0.9, '0,7 – 0,8 mm (CR7HSA) | 0,8 – 0,9 mm (MR8D)'),
            },
            bateria: {
              modelo: '12V 5Ah (fonte web)',
              tensaoV: 12,
              capacidadeAh: 5,
              tensaoCargaV: 'Sistema de carga 12 V (fonte web)',
            },
            fusivelPrincipalA: 15,
            fusiveisSecundarios: '7,5A / 10A (fonte web)',
            lampadaFarol: '12V 35/35W',
          },
          pneus: {
            dianteiro: { medida: '2.75-18 M/C 42P', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Sem câmara' },
            traseiro: { medida: '90/90-18 M/C 57P', pressaoPsi: 29, pressaoComGarupaPsi: 33, tipo: 'Sem câmara' },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428 (relação 14x43 — fonte web)',
            pinhaoDentes: 14,
            coroaDentes: 43,
          },
          torques: TORQUES_YAMAHA_150_STREET,
        },
      }),
    ],
  },
];
