import { faixaMm, faixaRpm, geracao, torque } from '@/data/motos/helpers';
import type { FichaTecnica, Modelo, TorqueAperto } from '@/types/moto';

const MOTOR_OHC_2V = 'Monocilíndrico 4T OHC 2 válvulas';
const MOTOR_OHV_2V = 'Monocilíndrico 4T OHV 2 válvulas (comando por varetas)';

// ---------------------------------------------------------------------------
// Tabelas de Torque Oficiais Honda (Exclusivamente Valores dos Manuais PDF)
// ---------------------------------------------------------------------------

const TORQUES_CG160: TorqueAperto[] = [
  torque(
    'Parafuso de drenagem do óleo do motor',
    30,
    'motor',
    '30 N·m (3,1 kgf·m) • Manuais CG 160 2016 pág. 112 (PDF 132), 2018 pág. 110 (PDF 128) e 2024 pág. 112 (PDF 130)',
  ),
  torque(
    'Porca do eixo dianteiro',
    59,
    'chassi',
    '59 N·m (6,0 kgf·m) • Manuais CG 160 2016 pág. 112, 2018 pág. 110 e 2024 pág. 112',
  ),
  torque(
    'Porca do eixo traseiro',
    88,
    'chassi',
    '88 N·m (9,0 kgf·m) • Manuais CG 160 2016 pág. 112, 2018 pág. 110 e 2024 pág. 112',
  ),
  torque(
    'Porcas superiores dos amortecedores traseiros (fixação bagageiro)',
    34,
    'suspensao',
    '34 N·m (3,5 kgf·m) • Manuais CG 160 2016 (PDF pág. 33), 2024 (PDF pág. 33) e 2025 (PDF pág. 34)',
  ),
  torque(
    'Parafusos das alças traseiras (fixação bagageiro)',
    42,
    'chassi',
    '42 N·m (4,3 kgf·m) • Manuais CG 160 2016 (PDF pág. 33), 2024 (PDF pág. 33) e 2025 (PDF pág. 34)',
  ),
];

const TORQUES_BROS_OHC_XRE190: TorqueAperto[] = [
  torque(
    'Parafuso de drenagem do óleo do motor',
    30,
    'motor',
    '30 N·m (3,1 kgf·m) • Bros 125 2013/2015, Bros 150 2013, Bros 160 2015/2024 e XRE 190 2016/2024 (Bros 150 2008: 29 N·m / 3,0 kgf·m)',
  ),
  torque(
    'Porca do eixo dianteiro',
    44,
    'chassi',
    '44 N·m (4,5 kgf·m) • Manuais NXR 125/150/160 Bros e XRE 190 (ex.: Bros 160 2024 pág. 110 / XRE 190 2024 pág. 113)',
  ),
  torque(
    'Porca do eixo traseiro',
    93,
    'chassi',
    '93 N·m (9,5 kgf·m) • Manuais NXR 125/150/160 Bros e XRE 190 (ex.: Bros 160 2024 pág. 110 / XRE 190 2024 pág. 113)',
  ),
];

const TORQUES_BROS_OHV_2005: TorqueAperto[] = [
  torque(
    'Bujão do filtro de tela / drenagem de óleo',
    15,
    'motor',
    '15 N·m (1,5 kg·m) • Manuais NXR 125 Bros 2003/2005 (PDF pág. 47) e NXR 150 Bros 2005 (PDF pág. 47)',
  ),
  torque(
    'Porca do eixo dianteiro',
    44,
    'chassi',
    '44 N·m (4,4 kg·m) • Manuais NXR 125 Bros 2003/2005 e NXR 150 Bros 2005 (PDF pág. 57)',
  ),
  torque(
    'Porca do eixo traseiro',
    93,
    'chassi',
    '93 N·m (9,3 kg·m) • Manuais NXR 125 Bros 2003/2005 e NXR 150 Bros 2005 (PDF págs. 53 e 58)',
  ),
];

const TORQUES_CG150_CARB: TorqueAperto[] = [
  torque(
    'Bujão de drenagem do óleo do motor',
    30,
    'motor',
    'Faixa oficial: 25 – 34 N·m (2,5 – 3,5 kgf·m) • Manual 2004 pág. 63 (PDF pág. 68) / Manual 2008 pág. 6-7 (PDF pág. 53)',
  ),
  torque(
    'Porca do eixo dianteiro',
    62,
    'chassi',
    'Faixa oficial: 54 – 69 N·m (5,4 – 6,9 kgf·m em 2004 págs. 76/78 [PDF 81/83]; 5,5 – 7,0 kgf·m em 2008 págs. 6-25/6-27 [PDF 71/73])',
  ),
  torque(
    'Porca do eixo traseiro',
    88,
    'chassi',
    'Faixa oficial: 78 – 98 N·m (7,8 – 9,8 kgf·m em 2004 págs. 69/79 [PDF 74/84]; 8,0 – 10 kgf·m em 2008 págs. 6-14/6-28 [PDF 60/74])',
  ),
];

const TORQUES_CG150_INJ: TorqueAperto[] = [
  torque(
    'Parafuso de drenagem do óleo do motor',
    30,
    'motor',
    '30 N·m (3,1 kgf·m) • Manuais 2009–2011 pág. 6-7 e Manual 2014 págs. 55 e 110 (PDF págs. 67 e 122)',
  ),
  torque(
    'Parafusos da tampa do filtro de ar',
    1.2,
    'motor',
    '1,2 N·m (0,1 kgf·m) • Manuais 2011 Fan e 2011 Titan pág. 6-5 (PDF pág. 47)',
  ),
  torque(
    'Porca do eixo dianteiro',
    62,
    'chassi',
    '62 N·m (6,3 kgf·m) nos Manuais 2009–2011 (págs. 6-22 a 6-26) | 59 N·m (6,0 kgf·m) no Manual 2014 págs. 76 e 110 (PDF págs. 88 e 122)',
  ),
  torque(
    'Porca do eixo traseiro',
    88,
    'chassi',
    '88 N·m (9,0 kgf·m) • Manuais 2009–2011 (págs. 6-12/6-13 e 6-23/6-27) e Manual 2014 págs. 61, 78 e 110 (PDF págs. 73, 90 e 122)',
  ),
  torque(
    'Porcas superiores dos amortecedores traseiros (fixação bagageiro)',
    34,
    'suspensao',
    '34 N·m (3,5 kgf·m) • Manual 2009 pág. 5-8 (PDF pág. 30)',
  ),
  torque(
    'Parafusos das alças traseiras (fixação bagageiro)',
    42,
    'chassi',
    '42 N·m (4,3 kgf·m) • Manual 2009 pág. 5-8 (PDF pág. 30)',
  ),
];

const TORQUES_CG125_OHV: TorqueAperto[] = [
  torque(
    'Bujão de drenagem / tampa do filtro de tela de óleo',
    15,
    'motor',
    '15 N·m (1,5 kgf·m) • Manual 2000 pág. 41 (PDF pág. 48) e Manual 2008 pág. 6-7 (PDF pág. 39) • Conferir anel de vedação',
  ),
  torque(
    'Copo do filtro de combustível (registro)',
    4,
    'motor',
    '4 N·m (0,4 kg·m) • Manual 2000 pág. 47 (PDF pág. 54)',
  ),
  torque(
    'Contraporca do parafuso regulador de válvula (OHV)',
    14,
    'motor',
    '14 N·m (1,4 kgf·m) • Manual 2008 pág. 6-9 (PDF pág. 41)',
  ),
  torque(
    'Parafusos C da tampa do cabeçote (válvulas)',
    12,
    'motor',
    '12 N·m (1,2 kgf·m) • Manual 2008 pág. 6-10 (PDF pág. 42)',
  ),
  torque(
    'Parafusos A e B da válvula/tubo de sucção de ar (PAIR)',
    12,
    'motor',
    '12 N·m (1,2 kgf·m) • Manual 2008 pág. 6-10 (PDF pág. 42)',
  ),
  torque(
    'Tampa do orifício da árvore de manivelas',
    15,
    'motor',
    '15 N·m (1,5 kgf·m) • Manual 2008 pág. 6-10 (PDF pág. 42)',
  ),
  torque(
    'Porca do eixo dianteiro',
    63,
    'chassi',
    '63 N·m (6,3 kg·m) no Manual 2000 pág. 71 (PDF pág. 78) | 62 N·m (6,3 kgf·m) no Manual 2008 pág. 6-21 (PDF pág. 53)',
  ),
  torque(
    'Porca do eixo traseiro',
    90,
    'chassi',
    '90 N·m (9,0 kg·m) no Manual 2000 págs. 58 e 72 (PDF págs. 65 e 80) | 88 N·m (9,0 kgf·m) no Manual 2008 págs. 6-14 e 6-23 (PDF págs. 46 e 55)',
  ),
  torque(
    'Porca do braço limitador / ancoragem do freio traseiro',
    22,
    'freios',
    '22 N·m (2,2 kgf·m) + cupilha nova • Manual 2000 pág. 72 (PDF pág. 80) e Manual 2008 pág. 6-23 (PDF pág. 55)',
  ),
];

const TORQUES_CG125_OHC: TorqueAperto[] = [
  torque(
    'Parafuso de drenagem do óleo do motor',
    30,
    'motor',
    '30 N·m (3,1 kgf·m) • Manual 2011 pág. 6-8 (PDF pág. 48) e Manual 2014 págs. 58 e 118 (PDF págs. 70 e 130)',
  ),
  torque(
    'Porca do eixo dianteiro',
    62,
    'chassi',
    '62 N·m (6,3 kgf·m) no Manual 2011 pág. 6-24 (PDF pág. 64) | 59 N·m (6,0 kgf·m) no Manual 2014 págs. 80, 81 e 118 (PDF págs. 92, 93 e 130)',
  ),
  torque(
    'Porca do eixo traseiro',
    88,
    'chassi',
    '88 N·m (9,0 kgf·m) • Manual 2011 págs. 6-15 e 6-25 (PDF págs. 55 e 65) e Manual 2014 págs. 66, 83 e 118 (PDF págs. 78, 95 e 130)',
  ),
  torque(
    'Porca do braço limitador do freio traseiro',
    22,
    'freios',
    '22 N·m (2,2 kgf·m) + cupilha nova • Manual 2011 pág. 6-25 (PDF pág. 65) e Manual 2014 págs. 83 e 118 (PDF págs. 95 e 130)',
  ),
  torque(
    'Porcas superiores dos amortecedores traseiros (fixação bagageiro)',
    34,
    'suspensao',
    '34 N·m (3,5 kgf·m) • Manual 2011 pág. 5-8 (PDF pág. 28)',
  ),
  torque(
    'Parafusos das alças traseiras (fixação bagageiro)',
    42,
    'chassi',
    '42 N·m (4,3 kgf·m) • Manual 2011 pág. 5-8 (PDF pág. 28)',
  ),
  torque(
    'Parafuso da tampa lateral direita',
    1.5,
    'chassi',
    '1,5 N·m (0,2 kgf·m) • Manual 2011 pág. 4-3 (PDF pág. 17)',
  ),
];

const TORQUES_BIZ_C100: TorqueAperto[] = [
  torque(
    'Bujão de drenagem do óleo do motor',
    25,
    'motor',
    '25 N·m (2,5 kg·m) • Manuais C-100 Biz 2000 (PDF pág. 61) e 2005 (PDF pág. 48)',
  ),
  torque(
    'Copo do filtro de combustível (registro)',
    4,
    'motor',
    '4 N·m (0,4 kg·m) • Manuais C-100 Biz 2000 (PDF pág. 59) e 2005 (PDF pág. 46)',
  ),
  torque(
    'Porca do eixo dianteiro',
    49,
    'chassi',
    '49 N·m (4,9 kg·m) • Manuais C-100 Biz 2000 (PDF pág. 77) e 2005 (PDF pág. 60)',
  ),
  torque(
    'Porca do eixo traseiro',
    49,
    'chassi',
    '49 N·m (4,9 kg·m) • Manuais C-100 Biz 2000 (PDF págs. 70 e 79) e 2005 (PDF págs. 54 e 62)',
  ),
  torque(
    'Porca do braço limitador do freio traseiro',
    22,
    'freios',
    '22 N·m (2,2 kg·m) • Manuais C-100 Biz 2000 (PDF pág. 79) e 2005 (PDF pág. 62)',
  ),
];

const TORQUES_BIZ_MODERNA: TorqueAperto[] = [
  torque(
    'Parafuso de drenagem do óleo do motor',
    24,
    'motor',
    '24 N·m (2,4 kgf·m) • Manuais Biz 100 2013/2015, Biz 110i 2016/2024 e Biz 125 2006/2011/2017/2018',
  ),
  torque(
    'Porca do eixo dianteiro',
    49,
    'chassi',
    '49 N·m (5,0 kgf·m) • Manuais Biz 100 2013/2015, Biz 110i 2016/2024 e Biz 125 2006–2018',
  ),
  torque(
    'Porca do eixo traseiro',
    49,
    'chassi',
    '49 N·m (5,0 kgf·m) • Manuais Biz 100 2013/2015, Biz 110i 2016/2024 e Biz 125 2006–2018',
  ),
  torque(
    'Porca do braço limitador do freio traseiro',
    22,
    'freios',
    '22 N·m (2,2 kgf·m) • Manuais Biz 110i 2016/2024 e Biz 125 2006–2018',
  ),
  torque(
    'Parafuso do suporte da bateria (Biz 125 2025)',
    5.7,
    'chassi',
    '5,7 N·m (0,6 kgf·m) • Manual Biz 125 ES/EX 2025 pág. 112 (PDF págs. 78 e 130)',
  ),
];

const TORQUES_POP_100_110: TorqueAperto[] = [
  torque(
    'Parafuso de drenagem do óleo do motor',
    24,
    'motor',
    '24 N·m (2,4 kgf·m na Pop 110i 2016/2024 | 2,5 kgf·m na Pop 100 2007/2015)',
  ),
  torque(
    'Porca do eixo dianteiro',
    54,
    'chassi',
    '54 N·m (5,5 kgf·m) • Manuais Pop 100 2007/2015 e Pop 110i 2016/2024',
  ),
  torque(
    'Porca do eixo traseiro',
    54,
    'chassi',
    '54 N·m (5,5 kgf·m) • Manuais Pop 100 2007/2015 e Pop 110i 2016/2024',
  ),
  torque(
    'Porca do braço limitador do freio traseiro (Pop 100)',
    22,
    'freios',
    '22 N·m (2,2 kgf·m) • Manual Pop 100 2015 (PDF pág. 58)',
  ),
];

// ---------------------------------------------------------------------------
// Bases de Ficha Técnica
// ---------------------------------------------------------------------------

const cg160Base: FichaTecnica = {
  versaoReferencia: 'Fan / Titan / Cargo',
  cilindradaCc: 162.7,
  motor: MOTOR_OHC_2V,
  alimentacao: 'injecao',
  combustivel: 'flex',
  arrefecimento: 'ar',
  partida: 'eletrica',
  cambio: { tipo: 'manual', marchas: 5 },
  freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'convencional' },
  pesoSecoKg: 117,
  motorDetalhes: {
    diametroCursoMm: { diametro: 57.3, curso: 63.09 },
    taxaCompressao: '9,5:1',
    potencia: '14,9 cv (gasolina) / 15,1 cv (etanol) @ 8.000 rpm',
    torque: '1,40 kgf·m (gasolina) / 1,54 kgf·m (etanol) @ 6.000 rpm',
    marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
    comando: 'OHC (corrente de comando, 2 válvulas)',
    filtroOleo: 'Filtro centrífugo de óleo + tela do filtro de óleo (limpar a cada 12.000 km)',
    alimentacaoDetalhe:
      'Injeção eletrônica PGM-FI Flex • Marcha lenta: 1.400 ± 100 rpm • Pressão da bomba de combustível: aguarda confirmação no Manual de Serviço',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'ÓLEO GENUÍNO HONDA SAE 10W-30 API SJ (2016) / API SL (2018–2025) JASO MA (sem aditivos)',
      capacidadeTrocaL: 1.0,
      capacidadeTotalL: 1.2,
      observacao: '1,0 L após drenagem | 1,2 L após desmontagem do motor (Manuais CG 160 2016, 2018, 2024 e 2025)',
    },
    tanqueL: 16.1,
    reservaL: 3.1,
    fluidoFreio: 'DOT 4 (disco dianteiro Titan/Fan/Cargo)',
    fluidoBengala: {
      especificacao: 'Fluido para suspensão Honda (Manual CG 160 2016 PDF pág. 93)',
      volumePorCanelaMl: 139,
      observacao:
        '139,0 ± 2,5 cm³ por canela no Manual CG 160 2016 (PDF pág. 93) • Nível em mm e volumes exatos de 2018–2025 aguardam Manual de Serviço',
    },
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.08, 0.08, '0,08 mm (motor frio)'),
    valvulaEscapeMm: faixaMm(0.24, 0.24, '0,24 mm (motor frio)'),
    folgaCorrenteMm: faixaMm(15, 25, '15 – 25 mm (não pilotar se exceder 50 mm)'),
    folgaManeteEmbreagemMm: faixaMm(10, 20, '10 – 20 mm'),
    folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm (medida no flange da manopla)'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK CPR8EA-9',
      folgaEletrodoMm: faixaMm(0.8, 0.9, '0,80 – 0,90 mm'),
    },
    bateria: {
      modelo: '12 V – 4 Ah / DTZ5 (selada)',
      tensaoV: 12,
      capacidadeAh: 4,
      tensaoCargaV: 'Alternador / sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
    },
    fusivelPrincipalA: 15,
    fusiveisSecundarios: '10 A (2016/2018) | 7,5 A (2024) | 7,5 A, 10 A, 15 A (Titan 2025) / 7,5 A, 10 A (Fan 2025)',
    lampadaFarol: '12 V – 35/35 W (2016–2024) | LED (2025–2026)',
  },
  pneus: {
    dianteiro: {
      medida: '80/100 – 18M/C 47P',
      pressaoPsi: 25,
      pressaoComGarupaPsi: 25,
      tipo: 'Sem câmara (Titan/Fan) • 25 psi (175 kPa) só piloto e piloto + passageiro',
    },
    traseiro: {
      medida: '90/90 – 18M/C 57P (Fan/Start 2016–2024) | 100/80 – 18M/C 59P (Titan 2016–2025 e Fan 2025)',
      pressaoPsi: 29,
      pressaoComGarupaPsi: 33,
      tipo: '29 psi (200 kPa) só piloto / 33 psi (225 kPa) piloto + passageiro',
    },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: 'DID 428HX (2016/2018) | DID 428DH ou RK 428HSB (2024/2025) — 118 elos',
    pinhaoDentes: 15,
    coroaDentes: 44,
  },
  torques: TORQUES_CG160,
};

const TORQUES_CG160_START: TorqueAperto[] = [
  torque(
    'Parafuso de drenagem do óleo do motor',
    30,
    'motor',
    '30 N·m (3,1 kgf·m) • Manuais CG 160 Start 2016 pág. 104 (PDF 122), 2018 pág. 104 (PDF 122) e 2024 págs. 53/106 (PDF 71/124)',
  ),
  torque(
    'Porca do eixo dianteiro',
    59,
    'chassi',
    '59 N·m (6,0 kgf·m) • Manuais CG 160 Start 2016 pág. 104, 2018 pág. 104 e 2024 págs. 74/106 (PDF 92/124)',
  ),
  torque(
    'Porca do eixo traseiro',
    88,
    'chassi',
    '88 N·m (9,0 kgf·m) • Manuais CG 160 Start 2016 pág. 104, 2018 pág. 104 e 2024 págs. 61/77/106 (PDF 79/95/124)',
  ),
  torque(
    'Porcas superiores dos amortecedores traseiros (fixação bagageiro)',
    34,
    'suspensao',
    '34 N·m (3,5 kgf·m) • Manuais CG 160 Start 2024 (PDF pág. 33) e 2025 (PDF pág. 34)',
  ),
  torque(
    'Parafusos das alças traseiras (fixação bagageiro)',
    42,
    'chassi',
    '42 N·m (4,3 kgf·m) • Manuais CG 160 Start 2024 (PDF pág. 33) e 2025 (PDF pág. 34)',
  ),
];

const cg160StartBase: FichaTecnica = {
  versaoReferencia: 'CG 160 Start (somente gasolina)',
  cilindradaCc: 162.7,
  motor: MOTOR_OHC_2V,
  alimentacao: 'injecao',
  combustivel: 'gasolina',
  arrefecimento: 'ar',
  partida: 'eletrica',
  cambio: { tipo: 'manual', marchas: 5 },
  freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'convencional' },
  pesoSecoKg: 114,
  motorDetalhes: {
    diametroCursoMm: { diametro: 57.3, curso: 63.0 },
    taxaCompressao: '9,5:1',
    potencia: '14,9 cv @ 8.000 rpm (somente gasolina)',
    torque: '1,40 kgf·m @ 6.000 rpm',
    marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
    comando: 'OHC (acionado por corrente, 2 válvulas)',
    filtroOleo: 'Filtro centrífugo de óleo + tela do filtro de óleo (limpar a cada 12.000 km)',
    alimentacaoDetalhe:
      'Injeção eletrônica PGM-FI exclusivamente a gasolina comum • Marcha lenta: 1.400 ± 100 rpm • Pressão da bomba de combustível: aguarda Manual de Serviço',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'ÓLEO GENUÍNO HONDA SAE 10W-30 API SJ JASO MA (sem aditivos)',
      capacidadeTrocaL: 1.0,
      capacidadeTotalL: 1.2,
      observacao: '1,0 L após drenagem | 1,2 L após desmontagem do motor (Manuais CG 160 Start 2016–2025)',
    },
    tanqueL: 14.6,
    reservaL: 3.2,
    fluidoFreio: undefined,
    fluidoBengala: undefined,
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.08, 0.08, '0,08 mm (motor frio)'),
    valvulaEscapeMm: faixaMm(0.24, 0.24, '0,24 mm (motor frio)'),
    folgaCorrenteMm: faixaMm(15, 25, '15 – 25 mm (não pilotar se exceder 50 mm)'),
    folgaManeteEmbreagemMm: faixaMm(10, 20, '10 – 20 mm (e alavanca do freio dianteiro a tambor: 10 – 20 mm)'),
    folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm (2016/2025) | 2 – 5 mm no Manual 2024 (PDF pág. 82)'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK CPR8EA-9',
      folgaEletrodoMm: faixaMm(0.8, 0.9, '0,80 – 0,90 mm'),
    },
    bateria: {
      modelo: '12 V – 4 Ah / DTZ5 (selada)',
      tensaoV: 12,
      capacidadeAh: 4,
      tensaoCargaV: 'Alternador 0,15 kW / 5.000 rpm (tensão de carga detalhada aguarda Manual de Serviço)',
    },
    fusivelPrincipalA: 15,
    fusiveisSecundarios: '10 A',
    lampadaFarol: '12 V – 35/35 W (Lanterna/freio: 12 V – 21/5 W • Sinaleiras: 12 V – 10 W x 4 • Placa: 12 V – 5 W)',
  },
  pneus: {
    dianteiro: {
      medida: '80/100 – 18M/C 47P',
      pressaoPsi: 25,
      pressaoComGarupaPsi: 25,
      tipo: 'Com câmara (rodas raiadas — Pirelli City Dragon / Levorin Matrix) • 25 psi (175 kPa)',
    },
    traseiro: {
      medida: '90/90 – 18M/C REINF 57P',
      pressaoPsi: 29,
      pressaoComGarupaPsi: 33,
      tipo: 'Com câmara (rodas raiadas — Pirelli City Dragon / Levorin Matrix) • 29 psi só piloto / 33 psi com passageiro',
    },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: 'DID 428HX ou RK 428HSB — 118 elos',
    pinhaoDentes: 15,
    coroaDentes: 44,
  },
  torques: TORQUES_CG160_START,
};

const cg150Base: FichaTecnica = {
  versaoReferencia: 'Titan KS / ES / ESD / Job / Sport',
  cilindradaCc: 149.2,
  motor: MOTOR_OHC_2V,
  alimentacao: 'carburador',
  combustivel: 'gasolina',
  arrefecimento: 'ar',
  partida: 'pedal-eletrica',
  cambio: { tipo: 'manual', marchas: 5 },
  freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'convencional' },
  pesoSecoKg: 118,
  motorDetalhes: {
    diametroCursoMm: { diametro: 57.3, curso: 57.8 },
    taxaCompressao: '9,5:1',
    potencia: '14,2 cv @ 8.000 rpm (Titan KS/ES/ESD • Job) | 15,3 cv @ 8.500 rpm (CG 150 Sport)',
    torque: '1,35 kgf·m @ 6.500 rpm (Titan KS/ES/ESD • Job) | 1,41 kgf·m @ 7.000 rpm (CG 150 Sport)',
    marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
    comando: 'OHC (acionado por corrente, 2 válvulas)',
    filtroOleo: 'Filtro centrífugo de óleo + tela do filtro de óleo (limpar a cada 12.000 km)',
    alimentacaoDetalhe:
      'Carburador (gasolina comum) • Marcha lenta: 1.400 ± 100 rpm • Giclagem e regulagem interna: aguardam confirmação no Manual de Serviço',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'MOBIL SUPER MOTO 4T MULTIVISCOSO SAE 20W-50 API-SF (proibido adicionar aditivos ao óleo)',
      capacidadeTrocaL: 1.0,
      capacidadeTotalL: 1.2,
      observacao:
        '1,0 L após drenagem | 1,2 L após desmontagem do motor (Manuais 2004 pág. 62/102 e 2008 pág. 6-6/10-2)',
    },
    tanqueL: 14.0,
    reservaL: 2.0,
    fluidoFreio: 'Mobil Brake Fluid DOT 3 ou DOT 4 (Titan ESD e Sport) / Tambor mecânico (Titan KS/ES e Job)',
    fluidoBengala: {
      especificacao: 'Óleo para suspensão dianteira (viscosidade/nível em mm aguardam Manual de Serviço)',
      volumePorCanelaMl: 141.5,
      observacao:
        '141,5 cm³ por amortecedor (Titan KS/ES/ESD e Job) | 137,5 cm³ (CG 150 Sport) • Manuais 2004 pág. 102 e 2008 pág. 10-2',
    },
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.08, 0.08, '0,08 mm (motor frio no PMS de compressão)'),
    valvulaEscapeMm: faixaMm(0.12, 0.12, '0,12 mm (motor frio no PMS de compressão)'),
    folgaCorrenteMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaManeteEmbreagemMm: faixaMm(10, 20, '10 – 20 mm (e freio dianteiro a tambor KS/ES/Job: 10 – 20 mm)'),
    folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaAceleradorMm: faixaMm(3, 5, '3 – 5 mm (medida no flange da manopla • Manuais 2004 pág. 66 e 2008 pág. 6-11)'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK CPR8EA-9',
      alternativas: ['NGK CPR9EA-9 (Opcional)'],
      folgaEletrodoMm: faixaMm(0.8, 0.9, '0,8 – 0,9 mm'),
    },
    bateria: {
      modelo: '12 V – 4 Ah (Titan KS / Job) | 12 V – 6 Ah (Titan ES/ESD e Sport em 2004) | 12 V – 5 Ah (Titan ES/ESD e Sport em 2008)',
      tensaoV: 12,
      capacidadeAh: 5,
      tensaoCargaV: 'Alternador: 0,068 kW / 5.000 rpm • Ignição CDI',
    },
    fusivelPrincipalA: 15,
    fusiveisSecundarios: '5 A, 10 A',
    lampadaFarol: '12 V – 35/35 W (Lanterna/freio: 12 V – 21/5 W • Sinaleiras: 12 V – 16 W x 4)',
  },
  pneus: {
    dianteiro: {
      medida: '80/100 – 18M/C 47P',
      pressaoPsi: 25,
      pressaoComGarupaPsi: 25,
      tipo: 'Com câmara: 25 psi (Titan/Job — Pirelli City Demon) | Sem câmara: 29 psi (CG 150 Sport — Pirelli MT75)',
    },
    traseiro: {
      medida: '90/90 – 18M/C 57P (Titan/Job) | 110/80 – 17M/C 57P (Sport)',
      pressaoPsi: 29,
      pressaoComGarupaPsi: 33,
      tipo: 'Com câmara Tuffup (Titan/Job) | Sem câmara aro 17 (Sport) • 29 psi só piloto / 33 psi com passageiro (Job c/ carga: 29 psi)',
    },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: 'DID 428H (lubrificante: óleo para transmissão SAE 80 ou 90)',
    pinhaoDentes: 16,
    coroaDentes: 43,
  },
  torques: TORQUES_CG150_CARB,
};

const bros160Base: FichaTecnica = {
  versaoReferencia: 'ESDD / CBS / ABS',
  cilindradaCc: 162.7,
  motor: MOTOR_OHC_2V,
  alimentacao: 'injecao',
  combustivel: 'flex',
  arrefecimento: 'ar',
  partida: 'eletrica',
  cambio: { tipo: 'manual', marchas: 5 },
  freios: { dianteiro: 'disco', traseiro: 'disco', sistema: 'CBS' },
  pesoSecoKg: 121,
  motorDetalhes: {
    diametroCursoMm: { diametro: 57.3, curso: 63.09 },
    taxaCompressao: '9,5:1',
    potencia: '14,5 cv (gasolina) / 14,7 cv (etanol) @ 8.500 rpm',
    torque: '1,46 kgf·m (gasolina) / 1,60 kgf·m (etanol) @ 5.500 rpm',
    marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
    comando: 'OHC (corrente de comando, 2 válvulas)',
    filtroOleo: 'Filtro centrífugo + tela do filtro de óleo (limpar a cada 12.000 km)',
    alimentacaoDetalhe:
      'Injeção eletrônica PGM-FI Flex • Marcha lenta: 1.400 ± 100 rpm • Pressão da bomba de combustível: aguarda confirmação no Manual de Serviço',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'ÓLEO GENUÍNO HONDA SAE 10W-30 API SJ (2015) / API SL (2024–2025) JASO MA (sem aditivos)',
      capacidadeTrocaL: 1.0,
      capacidadeTotalL: 1.2,
      observacao: '1,0 L após drenagem | 1,2 L após desmontagem do motor (Manuais Bros 160 2015, 2024 e 2025)',
    },
    tanqueL: 12.0,
    reservaL: 2.3,
    fluidoFreio: 'DOT 4 (disco dianteiro + disco traseiro ESDD/CBS/ABS; tambor traseiro na ESD 2015)',
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.08, 0.08, '0,08 mm (motor frio)'),
    valvulaEscapeMm: faixaMm(0.24, 0.24, '0,24 mm (motor frio)'),
    folgaCorrenteMm: faixaMm(20, 30, '20 – 30 mm (não pilotar se exceder 50 mm)'),
    folgaManeteEmbreagemMm: faixaMm(10, 20, '10 – 20 mm'),
    folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm (medida no flange da manopla)'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK CPR8EA-9',
      folgaEletrodoMm: faixaMm(0.8, 0.9, '0,80 – 0,90 mm'),
    },
    bateria: {
      modelo: '12 V – 4 Ah / DTZ5 (selada)',
      tensaoV: 12,
      capacidadeAh: 4,
      tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
    },
    fusivelPrincipalA: 15,
    fusiveisSecundarios: '10 A (2015) | 7,5 A x 2 (2024) | 7,5 A, 10 A (CBS 2025) / 7,5 A, 10 A, 15 A (ABS 2025)',
    lampadaFarol: '12 V – 35/35 W (2015–2024) | LED (2025–2026)',
  },
  pneus: {
    dianteiro: {
      medida: '90/90 – 19M/C 52P',
      pressaoPsi: 22,
      pressaoComGarupaPsi: 22,
      tipo: 'Uso misto (com câmara) • 22 psi (150 kPa) só piloto e piloto + passageiro',
    },
    traseiro: {
      medida: '110/90 – 17M/C 60P',
      pressaoPsi: 22,
      pressaoComGarupaPsi: 29,
      tipo: 'Uso misto (com câmara) • 22 psi (150 kPa) só piloto / 29 psi (200 kPa) piloto + passageiro',
    },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: 'DID 428HX (2015) | DID 428DH ou RK 428HSB (2024/2025) — 128 elos',
    pinhaoDentes: 16,
    coroaDentes: 48,
  },
  torques: TORQUES_BROS_OHC_XRE190,
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
  pesoSecoKg: 127,
  motorDetalhes: {
    diametroCursoMm: { diametro: 61.0, curso: 63.09 },
    taxaCompressao: '9,5:1',
    potencia: '16,3 cv (gasolina) / 16,4 cv (etanol) @ 8.500 rpm',
    torque: '1,65 kgf·m (gasolina) / 1,66 kgf·m (etanol) @ 6.000 rpm',
    marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
    comando: 'OHC (corrente de comando, 2 válvulas)',
    filtroOleo: 'Filtro centrífugo + tela do filtro de óleo (limpar a cada 12.000 km)',
    alimentacaoDetalhe:
      'Injeção eletrônica PGM-FI Flex • Marcha lenta: 1.400 ± 100 rpm • Pressão da bomba de combustível: aguarda confirmação no Manual de Serviço',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'ÓLEO GENUÍNO HONDA SAE 10W-30 API SJ (2016) / API SL (2024–2025) JASO MA (sem aditivos)',
      capacidadeTrocaL: 1.0,
      capacidadeTotalL: 1.2,
      observacao: '1,0 L após drenagem | 1,2 L após desmontagem do motor (Manuais XRE 190 2016, 2024 e 2025)',
    },
    tanqueL: 13.5,
    reservaL: 3.1,
    fluidoFreio: 'DOT 4 (ABS de 1 canal na roda dianteira + disco traseiro)',
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.08, 0.08, '0,08 mm (motor frio)'),
    valvulaEscapeMm: faixaMm(0.24, 0.24, '0,24 mm (motor frio)'),
    folgaCorrenteMm: faixaMm(20, 30, '20 – 30 mm (não pilotar se exceder 50 mm)'),
    folgaManeteEmbreagemMm: faixaMm(10, 20, '10 – 20 mm'),
    folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm (medida no flange da manopla)'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK CPR8EA-9',
      folgaEletrodoMm: faixaMm(0.8, 0.9, '0,80 – 0,90 mm'),
    },
    bateria: {
      modelo: '12 V – 5 Ah / DTZ6 (selada)',
      tensaoV: 12,
      capacidadeAh: 5,
      tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
    },
    fusivelPrincipalA: 15,
    fusiveisSecundarios: '10 A, 30 A (ABS — 2016/2024) | 7,5 A, 10 A, 15 A (2025)',
    lampadaFarol: '12 V – 35/35 W (2016–2024) | LED (2025–2026)',
  },
  pneus: {
    dianteiro: {
      medida: '90/90 – 19M/C 52P',
      pressaoPsi: 22,
      pressaoComGarupaPsi: 22,
      tipo: 'Uso misto (com câmara) • 22 psi (150 kPa) só piloto e piloto + passageiro',
    },
    traseiro: {
      medida: '110/90 – 17M/C 60P',
      pressaoPsi: 22,
      pressaoComGarupaPsi: 29,
      tipo: 'Uso misto (com câmara) • 22 psi (150 kPa) só piloto / 29 psi (200 kPa) piloto + passageiro',
    },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: 'DID 428DH — 128 elos',
    pinhaoDentes: 16,
    coroaDentes: 48,
  },
  torques: TORQUES_BROS_OHC_XRE190,
};

const biz125Base: FichaTecnica = {
  versaoReferencia: 'KS / ES / +',
  cilindradaCc: 124.9,
  motor: MOTOR_OHC_2V,
  alimentacao: 'carburador',
  combustivel: 'gasolina',
  arrefecimento: 'ar',
  partida: 'pedal-eletrica',
  cambio: { tipo: 'semiautomatico', marchas: 4 },
  freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'convencional' },
  pesoSecoKg: 100,
  motorDetalhes: {
    diametroCursoMm: { diametro: 52.4, curso: 57.9 },
    taxaCompressao: '9,3:1',
    potencia: '9,1 cv @ 7.500 rpm',
    torque: '1,01 kgf·m @ 3.500 rpm',
    marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
    comando: 'OHC horizontal (corrente de comando, 2 válvulas)',
    filtroOleo: 'Filtro centrífugo + tela do filtro de óleo (limpar a cada 12.000 km)',
    alimentacaoDetalhe:
      'Carburador (2006–2008) / Injeção PGM-FI Gasolina (2009–2010) • Marcha lenta: 1.400 ± 100 rpm • Giclagem e pressão da bomba: aguardam confirmação no Manual de Serviço',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'MOBIL SUPER MOTO 4T SAE 20W-50 API-SF (2006–2010) | ÓLEO GENUÍNO HONDA SAE 10W-30 API SJ/SL JASO MA (2011+)',
      capacidadeTrocaL: 0.7,
      capacidadeTotalL: 0.9,
      observacao: '0,7 L após drenagem | 0,9 L após desmontagem do motor (Manuais Biz 125 2006–2018; em 2025 mudou para 0,9 L / 1,1 L)',
    },
    tanqueL: 4.0,
    reservaL: 0.8,
    fluidoFreio: 'Tambor mecânico (KS/ES) | DOT 3 ou DOT 4 no disco dianteiro (Biz 125+ / EX)',
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.1, 0.1, '0,10 mm (motor frio — Manuais Biz 125 2009, 2011, 2017 e 2018)'),
    valvulaEscapeMm: faixaMm(0.1, 0.1, '0,10 mm (motor frio — Manuais Biz 125 2009, 2011, 2017 e 2018)'),
    folgaCorrenteMm: faixaMm(25, 35, '25 – 35 mm'),
    folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm (medida no flange da manopla)'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK CPR6EA-9',
      alternativas: ['NGK CPR7EA-9 (Opcional / alta rotação)'],
      folgaEletrodoMm: faixaMm(0.8, 0.9, '0,80 – 0,90 mm'),
    },
    bateria: {
      modelo: '12 V – 4 Ah (KS) | 12 V – 6 Ah (ES/+ em 2006) | 12 V – 5 Ah (ES/+ em 2009+)',
      tensaoV: 12,
      capacidadeAh: 5,
      tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
    },
    fusivelPrincipalA: 15,
    fusiveisSecundarios: '5 A, 10 A (2006) | 10 A (2009)',
    lampadaFarol: '12 V – 35/35 W',
  },
  pneus: {
    dianteiro: {
      medida: '60/100 – 17M/C 33L',
      pressaoPsi: 25,
      pressaoComGarupaPsi: 25,
      tipo: 'Com câmara • 25 psi (175 kPa) só piloto e piloto + passageiro',
    },
    traseiro: {
      medida: '80/100 – 14M/C 49L',
      pressaoPsi: 29,
      pressaoComGarupaPsi: 33,
      tipo: 'Com câmara • 29 psi (200 kPa) só piloto / 33 psi (225 kPa) piloto + passageiro',
    },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: 'DID 428H / 428MX — 106 elos',
    pinhaoDentes: 14,
    coroaDentes: 34,
  },
  torques: TORQUES_BIZ_MODERNA,
};

const pop110Base: FichaTecnica = {
  cilindradaCc: 109.1,
  motor: MOTOR_OHC_2V,
  alimentacao: 'injecao',
  combustivel: 'gasolina',
  arrefecimento: 'ar',
  partida: 'pedal',
  cambio: { tipo: 'manual', marchas: 4 },
  freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'convencional' },
  pesoSecoKg: 87,
  motorDetalhes: {
    diametroCursoMm: { diametro: 50.0, curso: 55.6 },
    taxaCompressao: '9,3:1',
    potencia: '7,9 cv @ 7.250 rpm',
    torque: '0,90 kgf·m @ 5.000 rpm',
    marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
    comando: 'OHC horizontal (corrente de comando, 2 válvulas)',
    filtroOleo: 'Filtro centrífugo + tela do filtro de óleo (limpar a cada 12.000 km)',
    alimentacaoDetalhe:
      'Injeção eletrônica PGM-FI (somente gasolina) • Marcha lenta: 1.400 ± 100 rpm • Pressão da bomba de combustível: aguarda confirmação no Manual de Serviço',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'ÓLEO GENUÍNO HONDA SAE 10W-30 API SJ (2016) / API SL (2024–2025) JASO MA (sem aditivos)',
      capacidadeTrocaL: 0.8,
      capacidadeTotalL: 1.0,
      observacao: '0,8 L após drenagem | 1,0 L após desmontagem do motor (Manuais Pop 110i 2016, 2024 e 2025)',
    },
    tanqueL: 4.2,
    reservaL: 0.9,
    fluidoFreio: 'Não utiliza (freios a tambor acionados por cabo/varão; CBS mecânico a partir de 2019)',
    fluidoBengala: {
      especificacao: 'Fluido para suspensão Honda (Manuais Pop 110i 2016 e 2024)',
      volumePorCanelaMl: 58,
      observacao: '58 ± 1,0 cm³ por canela (Manuais Pop 110i 2016 e 2024) • Nível em mm e volume 2025 aguardam Manual de Serviço',
    },
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.1, 0.1, '0,10 mm (motor frio — Manuais Pop 110i 2016 e 2024)'),
    valvulaEscapeMm: faixaMm(0.15, 0.15, '0,15 mm (motor frio — Manuais Pop 110i 2016 e 2024)'),
    folgaCorrenteMm: faixaMm(30, 40, '30 – 40 mm (não pilotar se exceder 50 mm)'),
    folgaManeteEmbreagemMm: faixaMm(10, 20, '10 – 20 mm (câmbio manual 4 marchas em 2016–2024)'),
    folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm (medida no flange da manopla)'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK CPR6EA-9S',
      folgaEletrodoMm: faixaMm(0.8, 0.9, '0,80 – 0,90 mm'),
    },
    bateria: {
      modelo: '12 V – 4 Ah / DTZ5 (selada)',
      tensaoV: 12,
      capacidadeAh: 4,
      tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
    },
    fusivelPrincipalA: 15,
    fusiveisSecundarios: '10 A',
    lampadaFarol: '12 V – 35/35 W',
  },
  pneus: {
    dianteiro: {
      medida: '60/100 – 17M/C 33L',
      pressaoPsi: 25,
      pressaoComGarupaPsi: 25,
      tipo: 'Com câmara • 25 psi (175 kPa) só piloto e piloto + passageiro',
    },
    traseiro: {
      medida: '80/100 – 14M/C 49L',
      pressaoPsi: 29,
      pressaoComGarupaPsi: 36,
      tipo: 'Com câmara • 29 psi (200 kPa) só piloto / 36 psi (250 kPa) piloto + passageiro',
    },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: 'DID 428MX ou RK 428SB — 104 elos',
    pinhaoDentes: 14,
    coroaDentes: 34,
  },
  torques: TORQUES_POP_100_110,
};

// ---------------------------------------------------------------------------
// Catálogo HONDA (13 modelos / 27 gerações)
// ---------------------------------------------------------------------------

export const HONDA: Modelo[] = [
  {
    id: 'honda-cg-160',
    marca: 'Honda',
    nome: 'CG 160',
    categoria: 'street',
    aliases: ['Titan', 'Fan', 'Cargo', 'CG160', 'CG 160 Fan', 'CG 160 Titan'],
    geracoes: [
      geracao('honda-cg-160', {
        anoInicio: 2016,
        anoFim: 2017,
        nomeGeracao: 'Lançamento 160cc',
        versoes: ['Fan', 'Titan', 'Cargo'],
        destaques: [
          'Motor 162,7 cm³ OHC Flex (14,9 cv G / 15,1 cv E @ 8.000 rpm)',
          'Folga de válvulas: Adm 0,08 mm / Esc 0,24 mm (motor frio)',
          'Folga da corrente 15 – 25 mm • Bateria 12 V – 4 Ah (DTZ5) • Fusível principal 15 A',
        ],
        alertasBancada: [
          'Folga de escape é 0,24 mm (e não 0,12 mm como na CG 150) — motor frio (Manual CG 160 2016 PDF pág. 131).',
          'Bujão de drenagem do óleo: 30 N·m (3,1 kgf·m); óleo SAE 10W-30 API SJ JASO MA (1,0 L drenagem / 1,2 L desmontagem).',
          'Folga oficial da corrente de transmissão: 15 – 25 mm (DID 428HX, 118 elos, pinhão 15 x coroa 44).',
          'Fluido da suspensão dianteira no Manual 2016 (PDF pág. 93): 139,0 ± 2,5 cm³ por canela.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'CG 160 Fan Titan 2016.pdf (págs. 33, 93, 108–112 [PDF págs. 33, 93, 128–132])',
          notas:
            'Auditado 100% no Manual 2016: óleo SAE 10W-30 API SJ JASO MA (1,0 L / 1,2 L); válvulas 0,08 / 0,24 mm; vela NGK CPR8EA-9 (0,80–0,90 mm); bengala 139,0 ± 2,5 cm³; corrente DID 428HX 118 elos (15x44, folga 15–25 mm); bateria 12V 4Ah DTZ5; fusíveis 15A / 10A; torques 30 / 59 / 88 / 34 / 42 N·m. Pendências que aguardam Manual de Serviço: pressão da bomba PGM-FI, nível de óleo da bengala em mm e torques internos (vela em N·m, tampa do cabeçote, coroa e pinça).',
        },
        fichaTecnica: cg160Base,
      }),
      geracao('honda-cg-160', {
        anoInicio: 2018,
        anoFim: 2024,
        nomeGeracao: 'Freio Combinado CBS',
        versoes: ['Fan', 'Titan', 'Cargo'],
        destaques: [
          'Freio combinado CBS com disco dianteiro e pinça de 3 êmbolos',
          'Óleo SAE 10W-30 API SL JASO MA (1,0 L drenagem / 1,2 L desmontagem)',
          'Folga da corrente 15 – 25 mm • Bateria 12 V – 4 Ah (DTZ5) • Fusível principal 15 A',
        ],
        alertasBancada: [
          'Freio CBS na Titan/Fan possui pinça dianteira de 3 êmbolos e dois circuitos hidráulicos: sangrar ambos os circuitos com fluido DOT 4.',
          'Bujão de drenagem do óleo: 30 N·m (3,1 kgf·m); eixo dianteiro 59 N·m; eixo traseiro 88 N·m (Manuais 2018 pág. 110 e 2024 pág. 112).',
          'Fusíveis secundários: 10 A (2018) | 7,5 A (2024); fusível principal permanece 15 A e bateria 12 V – 4 Ah (DTZ5).',
          'Corrente: DID 428HX (2018) / DID 428DH ou RK 428HSB (2024), 118 elos, 15x44, folga 15 – 25 mm.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte:
            'CG 160 Fan Titan 2018.pdf (págs. 106–110 [PDF págs. 124–128]) e CG 160 Fan Titan 2024.pdf (págs. 108–112 [PDF págs. 33, 126–130])',
          notas:
            'Auditado 100% nos Manuais 2018 e 2024: óleo SAE 10W-30 API SL JASO MA (1,0 L / 1,2 L); válvulas 0,08 / 0,24 mm; vela NGK CPR8EA-9 (0,80–0,90 mm); corrente 118 elos 15x44 (folga 15–25 mm); bateria 12V 4Ah DTZ5; fusível principal 15A; torques 30 / 59 / 88 / 34 / 42 N·m. Pendências que aguardam Manual de Serviço: volume/nível de fluido da bengala 2018–2024, pressão da bomba PGM-FI e torques internos.',
        },
        fichaTecnica: {
          ...cg160Base,
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'CBS' },
          fluidos: {
            ...cg160Base.fluidos,
            fluidoBengala: undefined,
          },
          eletrica: {
            ...cg160Base.eletrica,
            fusiveisSecundarios: '10 A (2018) | 7,5 A (2024)',
            lampadaFarol: '12 V – 35/35 W',
          },
        },
      }),
      geracao('honda-cg-160', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Nova Geração ABS / Farol LED',
        versoes: ['Fan', 'Titan', 'Cargo'],
        destaques: [
          'Titan com ABS dianteiro e disco nas duas rodas (Fan e Cargo seguem com CBS)',
          'Tanque 14,0 L (reserva 2,5 L) • Potência 14,4 cv (G) / 14,7 cv (E) @ 8.000 rpm',
          'Farol e lanterna em LED • Pneu traseiro 100/80-18 na Titan e na Fan',
        ],
        alertasBancada: [
          'Nova calibração PROMOT 5 na linha 2025 (Manual CG 160 Fan/Titan 2025): potência 14,4 cv (G) / 14,7 cv (E) @ 8.000 rpm; torque 1,41 kgf·m (G) / 1,43 kgf·m (E) @ 6.750 rpm; tanque 14,0 L (reserva 2,5 L); peso seco 120 kg (Titan) / 119 kg (Fan).',
          'Titan 2025 usa ABS de 1 canal na dianteira + disco traseiro (fusíveis secundários 7,5 A, 10 A e 15 A); Fan 2025 usa CBS (fusíveis secundários 7,5 A e 10 A); principal 15 A.',
          'Mantém válvulas Adm 0,08 mm / Esc 0,24 mm, vela NGK CPR8EA-9 (0,80–0,90 mm), óleo SAE 10W-30 API SL JASO MA (1,0 / 1,2 L) e corrente 118 elos (15x44, folga 15–25 mm).',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'CG 160 Fan Titan 2025.pdf (PDF págs. 34 e 126–130)',
          notas:
            'Auditado 100% no Manual 2025: potência 14,4/14,7 cv @ 8.000 rpm; torque 1,41/1,43 kgf·m @ 6.750 rpm; peso seco 120 kg (Titan) / 119 kg (Fan); tanque 14,0 L (reserva 2,5 L); óleo SAE 10W-30 API SL JASO MA (1,0/1,2 L); válvulas 0,08 / 0,24 mm; pneu traseiro 100/80-18 59P (Titan e Fan); farol/lanterna LED; bateria 12V 4Ah DTZ5; fusível principal 15A; torques 30 / 59 / 88 / 34 / 42 N·m. Pendências que aguardam Manual de Serviço: volume/nível de óleo da bengala 33 mm, pressão da bomba PGM-FI e torques internos.',
        },
        fichaTecnica: {
          ...cg160Base,
          versaoReferencia: 'Titan ABS / Fan CBS (2025)',
          freios: { dianteiro: 'disco', traseiro: 'disco', sistema: 'ABS' },
          pesoSecoKg: 120,
          motorDetalhes: {
            ...cg160Base.motorDetalhes,
            potencia: '14,4 cv (gasolina) / 14,7 cv (etanol) @ 8.000 rpm',
            torque: '1,41 kgf·m (gasolina) / 1,43 kgf·m (etanol) @ 6.750 rpm',
          },
          eletrica: {
            ...cg160Base.eletrica,
            fusiveisSecundarios: '7,5 A, 10 A, 15 A (Titan ABS) | 7,5 A, 10 A (Fan CBS)',
            lampadaFarol: 'LED (farol e lanterna)',
          },
          fluidos: {
            ...cg160Base.fluidos,
            tanqueL: 14.0,
            reservaL: 2.5,
            fluidoBengala: undefined,
          },
          pneus: {
            dianteiro: {
              medida: '80/100 – 18M/C 47P',
              pressaoPsi: 25,
              pressaoComGarupaPsi: 25,
              tipo: 'Sem câmara • 25 psi (175 kPa) só piloto e piloto + passageiro',
            },
            traseiro: {
              medida: '100/80 – 18M/C 59P (Titan e Fan 2025)',
              pressaoPsi: 29,
              pressaoComGarupaPsi: 33,
              tipo: 'Sem câmara • 29 psi (200 kPa) só piloto / 33 psi (225 kPa) piloto + passageiro',
            },
          },
        },
      }),
    ],
  },
  {
    id: 'honda-cg-160-start',
    marca: 'Honda',
    nome: 'CG 160 Start',
    categoria: 'street',
    aliases: ['Start', 'Start 160', 'CG 160 Start', 'CG160 Start', 'CG160Start'],
    geracoes: [
      geracao('honda-cg-160-start', {
        anoInicio: 2016,
        anoFim: 2017,
        nomeGeracao: 'Tambor Convencional (Gasolina)',
        versoes: ['Start'],
        destaques: [
          'Motor 162,7 cm³ OHC PGM-FI exclusivamente a GASOLINA (14,9 cv @ 8.000 rpm)',
          'Freios a tambor mecânico nas duas rodas (sem disco e sem fluido DOT 4)',
          'Rodas raiadas com câmara • Tanque 14,6 L (reserva 3,2 L) • Peso seco 114 kg',
        ],
        alertasBancada: [
          'Atenção: a CG 160 Start é EXCLUSIVAMENTE a gasolina (NÃO é Flex) — abastecer com etanol causa falha de partida e funcionamento irregular (Manual CG 160 Start 2016 PDF pág. 119).',
          'Freios a tambor mecânico na dianteira e traseira (sem sistema hidráulico e sem fluido DOT 4); folga da alavanca dianteira 10 – 20 mm e pedal traseiro 20 – 30 mm.',
          'Rodas raiadas com pneus COM câmara (dianteiro 80/100-18 47P a 25 psi; traseiro 90/90-18 REINF 57P a 29/33 psi) — conferir tensão dos raios e nipples nas revisões (PDF pág. 89).',
          'Óleo SAE 10W-30 API SJ JASO MA (1,0 L drenagem / 1,2 L desmontagem); válvulas Adm 0,08 mm / Esc 0,24 mm (motor frio); corrente DID 428HX ou RK 428HSB (118 elos, 15x44, folga 15–25 mm).',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'CG 160 Start 2016.pdf (págs. 30, 52, 60, 100–104 [PDF págs. 7, 48, 60, 70, 78, 89, 118–122])',
          notas:
            'Auditado 100% no Manual CG 160 Start 2016: gasolina comum; 14,9 cv @ 8.000 rpm; 1,40 kgf·m @ 6.000 rpm; tanque 14,6 L (reserva 3,2 L); peso seco 114 kg; óleo SAE 10W-30 API SJ JASO MA (1,0 / 1,2 L); válvulas 0,08 / 0,24 mm; vela NGK CPR8EA-9 (0,80–0,90 mm); tambor dianteiro e traseiro sem DOT 4; rodas raiadas com câmara (80/100-18 e 90/90-18); bateria 12V 4Ah DTZ5; fusíveis 15A / 10A; torques 30 / 59 / 88 N·m. Pendências que aguardam Manual de Serviço: volume/nível de óleo da bengala, pressão da bomba PGM-FI e torques internos.',
        },
        fichaTecnica: cg160StartBase,
      }),
      geracao('honda-cg-160-start', {
        anoInicio: 2018,
        anoFim: 2024,
        nomeGeracao: 'CBS a Tambor (Gasolina)',
        versoes: ['Start CBS'],
        destaques: [
          'Freio combinado CBS mecânico a cabo nos dois tambores (sem disco e sem DOT 4)',
          'Motor 162,7 cm³ OHC PGM-FI somente gasolina • Óleo SAE 10W-30 API SL JASO MA',
          'Rodas raiadas com câmara • Tanque 14,6 L (reserva 3,2 L) • Peso seco 115 kg',
        ],
        alertasBancada: [
          'Freio CBS da Start 2018–2024 é 100% MECÂNICO a tambor (sem pinça hidráulica e sem fluido DOT 4): ajustar sempre a folga da alavanca dianteira (10–20 mm) ANTES do pedal traseiro e conferir a folga da articulação nº 2 do CBS (~1 mm — Manual 2024 PDF págs. 71–73).',
          'Exclusivamente a GASOLINA (NÃO é Flex): 14,9 cv @ 8.000 rpm; torque 1,40 kgf·m @ 6.500 rpm (2018) / 1,4 kgf·m @ 7.000 rpm (2024).',
          'Fusíveis secundários mudaram entre 2018 e 2024: 10 A x 2 no Manual 2018 (PDF pág. 122) e 7,5 A no Manual 2024 (PDF pág. 124); principal permanece 15 A.',
          'Folga da manopla do acelerador no Manual 2024 (PDF pág. 82): 2 – 5 mm. Torques oficiais: drenagem 30 N·m, eixo dianteiro 59 N·m, eixo traseiro 88 N·m, amortecedor/bagageiro 34 N·m e alças 42 N·m (PDF pág. 33).',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte:
            'CG 160 Start 2018.pdf (págs. 30, 51–53, 60, 100–104 [PDF págs. 7, 36, 48, 69–71, 78, 118–122]) e CG 160 Start 2024.pdf (págs. 32, 53–55, 62, 64, 102–106 [PDF págs. 7, 33, 38, 50, 61, 71–73, 80, 82, 120–124])',
          notas:
            'Auditado 100% nos Manuais CG 160 Start 2018 e 2024: gasolina comum; 14,9 cv @ 8.000 rpm; 1,40 kgf·m @ 6.500 rpm (2018) / 1,4 kgf·m @ 7.000 rpm (2024); tanque 14,6 L (reserva 3,2 L); peso seco 115 kg; óleo SAE 10W-30 API SL JASO MA (1,0 / 1,2 L); válvulas 0,08 / 0,24 mm; vela NGK CPR8EA-9 (0,80–0,90 mm); CBS mecânico a tambor dianteiro e traseiro (sem DOT 4); rodas raiadas com câmara (80/100-18 e 90/90-18); corrente 118 elos 15x44 (DID 428HX 2018 / DID 428DH 2024 ou RK 428HSB); bateria 12V 4Ah DTZ5; fusíveis 15A principal / 10A x 2 (2018) e 7,5A (2024); torques 30 / 59 / 88 / 34 / 42 N·m.',
        },
        fichaTecnica: {
          ...cg160StartBase,
          versaoReferencia: 'CG 160 Start CBS (tambor • gasolina)',
          pesoSecoKg: 115,
          freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'CBS' },
          motorDetalhes: {
            ...cg160StartBase.motorDetalhes,
            diametroCursoMm: { diametro: 57.3, curso: 63.095 },
            torque: '1,40 kgf·m @ 6.500 rpm (2018) | 1,4 kgf·m @ 7.000 rpm (2024)',
          },
          fluidos: {
            ...cg160StartBase.fluidos!,
            oleoMotor: {
              ...cg160StartBase.fluidos!.oleoMotor!,
              especificacao: 'ÓLEO PRO HONDA / GENUÍNO HONDA SAE 10W-30 API SL JASO MA (sem aditivos)',
            },
          },
          folgas: {
            ...cg160StartBase.folgas,
            folgaAceleradorMm: faixaMm(2, 5, '2 – 5 mm (Manual 2024 PDF pág. 82)'),
          },
          eletrica: {
            ...cg160StartBase.eletrica,
            fusiveisSecundarios: '10 A x 2 (2018) | 7,5 A (2024)',
          },
          transmissaoFinal: {
            ...cg160StartBase.transmissaoFinal!,
            corrente: 'DID 428HX (2018) | DID 428DH (2024) ou RK 428HSB — 118 elos',
          },
        },
      }),
      geracao('honda-cg-160-start', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Nova Geração Disco Dianteiro CBS (Gasolina)',
        versoes: ['Start CBS Disco'],
        destaques: [
          'Estreia freio dianteiro a DISCO hidráulico CBS (DOT 4) + rodas de liga sem câmara',
          'Continua exclusivamente a GASOLINA (PROMOT 5: 14,4 cv @ 8.000 rpm / 1,41 kgf·m @ 6.750 rpm)',
          'Tanque 14,0 L (reserva 2,5 L) • Pneu traseiro 100/80-18 • Lanterna traseira LED (farol halógeno 35/35 W)',
        ],
        alertasBancada: [
          'A partir de 2025 a CG 160 Start passa a usar freio dianteiro a DISCO com acionamento hidráulico CBS (Fluido para Freios DOT 4 — Manual 2025 PDF págs. 65 e 115) e traseiro a tambor.',
          'Passa a utilizar pneus SEM câmara (NÃO instalar câmara de ar — PDF pág. 68): dianteiro 80/100-18 (25 psi) e traseiro mais largo 100/80-18 REINF (29/33 psi).',
          'Permanece exclusivamente a GASOLINA comum (NÃO é Flex) com calibração PROMOT 5: 14,4 cv @ 8.000 rpm, 1,41 kgf·m @ 6.750 rpm, tanque 14,0 L (reserva 2,5 L) e peso seco 117 kg.',
          'Diferença de iluminação vs Fan/Titan 2025: a Start 2025 mantém farol halógeno 12 V – 35/35 W com lanterna traseira/freio em LED (PDF pág. 117). Fusíveis secundários: 7,5 A e 10 A (principal 15 A).',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'CG 160 Start 2025.pdf (págs. 39–40, 45, 59, 63, 65, 95–99 [PDF págs. 21, 34, 39, 57–58, 63, 65, 68, 77, 81, 83, 113–117])',
          notas:
            'Auditado 100% no Manual CG 160 Start 2025: gasolina comum; 14,4 cv @ 8.000 rpm; 1,41 kgf·m @ 6.750 rpm; tanque 14,0 L (reserva 2,5 L); peso seco 117 kg; óleo Pro Honda SAE 10W-30 API SL JASO MA (1,0 / 1,2 L); válvulas 0,08 / 0,24 mm; vela NGK CPR8EA-9 (0,80–0,90 mm); freio dianteiro a disco hidráulico CBS (DOT 4) e traseiro a tambor (pedal 20–30 mm); acelerador 2–6 mm; embreagem 10–20 mm; pneus sem câmara 80/100-18 e 100/80-18; corrente DID 428DH ou RK 428HSB (118 elos, 15x44, folga 15–25 mm); bateria 12V 4Ah DTZ5; fusíveis 15A principal / 7,5A e 10A; farol 12V 35/35W e lanterna LED; torques bagageiro 34 / 42 N·m.',
        },
        fichaTecnica: {
          ...cg160StartBase,
          versaoReferencia: 'CG 160 Start CBS Disco (2025 • gasolina)',
          pesoSecoKg: 117,
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'CBS' },
          motorDetalhes: {
            ...cg160StartBase.motorDetalhes,
            diametroCursoMm: { diametro: 57.3, curso: 63.096 },
            potencia: '14,4 cv @ 8.000 rpm (somente gasolina • PROMOT 5)',
            torque: '1,41 kgf·m @ 6.750 rpm',
          },
          fluidos: {
            ...cg160StartBase.fluidos!,
            oleoMotor: {
              ...cg160StartBase.fluidos!.oleoMotor!,
              especificacao: 'Óleo Pro Honda SAE 10W-30 API SL JASO MA (sem aditivos)',
            },
            tanqueL: 14.0,
            reservaL: 2.5,
            fluidoFreio: 'DOT 4 (freio dianteiro a disco hidráulico CBS; traseiro a tambor — Manual 2025 PDF pág. 65)',
          },
          folgas: {
            ...cg160StartBase.folgas,
            folgaManeteEmbreagemMm: faixaMm(10, 20, '10 – 20 mm'),
            folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm (Manual 2025 PDF pág. 83)'),
          },
          eletrica: {
            ...cg160StartBase.eletrica,
            fusiveisSecundarios: '7,5 A, 10 A',
            lampadaFarol: '12 V – 35/35 W (Lanterna/freio: LED • Sinaleiras: 12 V – 10 W x 4 • Placa: 12 V – 5 W)',
          },
          pneus: {
            dianteiro: {
              medida: '80/100 – 18M/C 47P (Pirelli) / 47S (Michelin)',
              pressaoPsi: 25,
              pressaoComGarupaPsi: 25,
              tipo: 'Sem câmara (Pirelli City Dragon / Michelin Pilot Street 2) • 25 psi (175 kPa)',
            },
            traseiro: {
              medida: '100/80 – 18M/C REINF 59P (Pirelli) / 59S (Michelin)',
              pressaoPsi: 29,
              pressaoComGarupaPsi: 33,
              tipo: 'Sem câmara (NÃO usar câmara de ar) • 29 psi só piloto / 33 psi com passageiro',
            },
          },
          transmissaoFinal: {
            ...cg160StartBase.transmissaoFinal!,
            corrente: 'DID 428DH ou RK 428HSB — 118 elos',
          },
        },
      }),
    ],
  },
  {
    id: 'honda-cg-150',
    marca: 'Honda',
    nome: 'CG 150',
    categoria: 'street',
    aliases: ['Titan 150', 'Fan 150', 'Job', 'Sport', 'Mix', 'CG150'],
    geracoes: [
      geracao('honda-cg-150', {
        anoInicio: 2004,
        anoFim: 2008,
        nomeGeracao: 'Carburada',
        versoes: ['Titan KS', 'Titan ES', 'Titan ESD', 'Job', 'Sport'],
        destaques: [
          'Motor 149,2 cm³ OHC (14,2 cv Titan/Job | 15,3 cv Sport)',
          'Carburador a gasolina (marcha lenta 1.400 ± 100 rpm)',
          'Partida a pedal (KS/Job) e elétrica (ES/ESD/Sport)',
        ],
        alertasBancada: [
          'Folga de válvulas (motor frio no PMS de compressão): Adm 0,08 mm / Esc 0,12 mm (Manuais 2004 pág. 65/103 e 2008 pág. 10-2).',
          'Diferenças exclusivas da CG 150 Sport nos manuais 2004 e 2008: potência 15,3 cv @ 8.500 rpm (vs 14,2 cv @ 8.000 rpm), torque 1,41 kgf·m @ 7.000 rpm (vs 1,35 kgf·m @ 6.500 rpm), redução final 2,800 (vs 2,687 Titan/Job), bengala com 137,5 cm³ por canela (vs 141,5 cm³ Titan/Job) e pneus SEM câmara Pirelli MT75 com traseiro aro 17 (110/80-17M/C 57P) e dianteiro calibrado com 29 psi (vs 25 psi nas Titan/Job com câmara).',
          'Óleo especificado nos manuais 2004 e 2008: MOBIL SUPER MOTO 4T MULTIVISCOSO SAE 20W-50 API-SF (proibido adicionar aditivos) • 1,0 L após drenagem / 1,2 L após desmontagem.',
          'Folga da manopla do acelerador nos manuais 2004 (pág. 66) e 2008 (pág. 6-11) é de 3 – 5 mm (e não 2 – 6 mm).',
          'Bateria mudou entre 2004 e 2008 nas versões com partida elétrica (ES/ESD/Sport): 12 V – 6 Ah no manual 2004 (pág. 106) e 12 V – 5 Ah no manual 2008 (pág. 10-4); versões KS/Job usam 12 V – 4 Ah. Peso seco: 118 kg (KS), 119 kg (ES/Job), 119 kg (2004 ESD) / 121 kg (2008 ESD), 116 kg (2004 Sport) / 117 kg (2008 Sport).',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte:
            'CG 150 Titan, Sport e Job 2004.pdf (D2203-MAN-0408 — págs. 25–35, 58–83 e 100–106 [PDF págs. 30–40, 63–88, 105–111 e 160]) e CG 150 Titan, Sport e Job 2008.pdf (D2203-MAN-0605 — págs. 6-1 a 6-31 e 10-1 a 10-5 [PDF págs. 47–77, 93–97 e 171])',
          notas:
            'Auditado 100% nos 2 PDFs locais: óleo SAE 20W-50 API-SF (1,0 L drenagem / 1,2 L desmontagem); bujão de óleo 25–34 N·m (2,5–3,5 kgf·m); válvulas Adm 0,08 mm / Esc 0,12 mm; vela NGK CPR8EA-9 (opcional CPR9EA-9), folga 0,8–0,9 mm (aperto manual + 1/2 volta + 1/8 volta nova; 1/8 volta usada); bengala 141,5 cm³ (Titan/Job) e 137,5 cm³ (Sport); eixo diant. 54–69 N·m e eixo tras. 78–98 N·m. Pendências que aguardam Manual de Serviço: modelo/giclagem do carburador, viscosidade/nível (mm) do óleo de bengala, número exato de dentes/elos da relação (manual informa redução final 2,687 Titan/Job e 2,800 Sport com corrente DID 428H) e torques internos (vela em N·m, tampa do cabeçote, contraporca de válvula, filtro centrífugo, coroa, pinça de freio e mesa/coluna de direção).',
        },
        fichaTecnica: cg150Base,
      }),
      geracao('honda-cg-150', {
        anoInicio: 2009,
        anoFim: 2015,
        nomeGeracao: 'PGM-FI (2009 Gasolina / 2010–2015 Mix & Flex)',
        versoes: ['Titan KS', 'Titan ES', 'Titan ESD', 'Titan EX', 'Titan Mix', 'Fan ESi', 'Fan ESDi', 'Cargo'],
        destaques: [
          'Injeção eletrônica PGM-FI (Gasolina em 2009 | Mix/Flex a partir de 2010)',
          'Tanque de 16,1 litros',
          'Folga da corrente 15 – 25 mm (DID 428MX-118RB / RK 428SB-118RJ)',
        ],
        alertasBancada: [
          'Atenção ao ano 2009 (CG 150 Titan 2009.pdf pág. 10-2): é injetada PGM-FI exclusivamente a GASOLINA (14,2 cv @ 8.500 rpm e 1,32 kgf·m @ 7.000 rpm). A partir de 2010 (Titan MIX / Flex) passa a aceitar gasolina e etanol (14,2 cv G / 14,3 cv E @ 8.500 rpm; 1,32 kgf·m G / 1,45 kgf·m E @ 6.500 rpm).',
          'Mudança oficial de óleo e filtro de ar na linha 2011: Manuais 2009 e 2010 especificam Mobil Super Moto 4T SAE 20W-50 API-SF e filtro de ar seco (limpar a cada 4.000 km, trocar a cada 12.000 km); Manuais 2011 e 2014 especificam Óleo Genuíno Honda SAE 10W-30 API SJ (ou superior) JASO MA e filtro de ar do tipo viscoso/úmido (NUNCA limpar com ar comprimido; trocar a cada 12.000 km no manual 2011 e a cada 16.000 km no manual 2014).',
          'Volume de fluido da suspensão dianteira por canela varia conforme o ano no manual: 141,5 cm³ (Manuais 2009 e 2010), 142 cm³ (Manuais 2011 Fan e 2011 Titan) e 139,0 ± 2,5 cm³ com troca a cada 16.000 km (Manual 2014 pág. 68 / PDF pág. 80).',
          'Torque da porca do eixo dianteiro mudou de 62 N·m (6,3 kgf·m) nos manuais 2009–2011 para 59 N·m (6,0 kgf·m) no manual 2014 (págs. 76 e 110); folga do pedal do freio traseiro mudou de 15 – 25 mm (2009–2011) para 20 – 30 mm (2014 pág. 56).',
          'Nas versões Mix/Flex (2010–2014), se o motor morrer por pane seca, reabastecer com no mínimo 1 litro de gasolina e 1 litro de etanol (50%/50%) antes da partida.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte:
            'CG 150 Titan 2009.pdf (D2203-MAN-0669 — págs. 5-8, 6-1 a 6-28 e 10-1 a 10-5 [PDF págs. 30, 41–68, 85–89 e 163]), CG 150 Titan 2010.pdf (D2203-MAN-0711 — págs. 6-1 a 6-30 e 10-1 a 10-5 [PDF págs. 47–76, 93–97 e 172]), CG 150 Fan 2011.pdf (D2203-MAN-0737 — págs. 6-1 a 6-28 e 10-1 a 10-5 [PDF págs. 43–70, 85–89 e 164]), CG 150 Titan 2011.pdf (D2203-MAN-0758 — págs. 6-1 a 6-27 e 10-1 a 10-5 [PDF págs. 43–69, 85–89 e 164]) e CG 150 Titan 2014.pdf (D2203-MAN-0945 — págs. 36–83 e 105–110 [PDF págs. 48–95, 117–122 e 203])',
          notas:
            'Auditado 100% nos 5 PDFs locais: óleo SAE 20W-50 API-SF (2009–2010) / SAE 10W-30 API SJ JASO MA (2011–2014), 1,0 L após drenagem e 1,2 L após desmontagem; bujão de dreno 30 N·m (3,1 kgf·m); válvulas Adm 0,08 mm / Esc 0,12 mm; vela NGK CPR8EA-9 (opcional CPR9EA-9), folga 0,80–0,90 mm; relação 16x43 (2,687) com corrente 118 elos (DID 428MX-118RB ou RK 428SB-118RJ) e folga 15–25 mm; bengala 141,5 cm³ (2009–2010) / 142 cm³ (2011) / 139,0 ± 2,5 cm³ (2014); eixo diant. 62 N·m (2009–2011) / 59 N·m (2014) e eixo tras. 88 N·m. Pendências que aguardam Manual de Serviço: pressão da bomba de combustível PGM-FI, nível de óleo da bengala em mm e torques internos (vela em N·m, tampa do cabeçote, contraporca de válvula, filtro centrífugo, coroa, pinça de freio e coluna de direção).',
        },
        fichaTecnica: {
          ...cg150Base,
          versaoReferencia: 'Titan KS/ES/ESD/EX • Titan MIX • Fan ESi/ESDi',
          alimentacao: 'injecao',
          combustivel: 'flex',
          pesoSecoKg: 116,
          motorDetalhes: {
            ...cg150Base.motorDetalhes,
            diametroCursoMm: { diametro: 57.3, curso: 57.84 },
            potencia:
              '14,2 cv @ 8.500 rpm (2009 Gasolina) | 14,2 cv (gasolina) / 14,3 cv (etanol/álcool) @ 8.500 rpm (2010–2014 Mix/Flex)',
            torque:
              '1,32 kgf·m @ 7.000 rpm (2009 Gasolina) | 1,32 kgf·m (gasolina) / 1,45 kgf·m (etanol/álcool) @ 6.500 rpm (2010–2014 Mix/Flex)',
            alimentacaoDetalhe:
              'Injeção eletrônica PGM-FI (somente gasolina em 2009; Mix/Flex gasolina e etanol a partir de 2010) • Marcha lenta: 1.400 ± 100 rpm • Pressão da bomba de combustível: aguarda confirmação no Manual de Serviço',
          },
          fluidos: {
            ...cg150Base.fluidos,
            oleoMotor: {
              especificacao:
                '2009–2010: MOBIL SUPER MOTO 4T SAE 20W-50 API-SF | 2011–2014: ÓLEO GENUÍNO HONDA SAE 10W-30 API SJ (ou superior) JASO MA (sem aditivos)',
              capacidadeTrocaL: 1.0,
              capacidadeTotalL: 1.2,
              observacao:
                '1,0 L após drenagem | 1,2 L após desmontagem do motor (confirmado nos 5 manuais 2009, 2010, 2011 Fan, 2011 Titan e 2014 Titan)',
            },
            tanqueL: 16.1,
            reservaL: 4.2,
            fluidoFreio:
              'Mobil Brake Fluid DOT 3 ou DOT 4 (2009 ESD) | Mobil Super Moto Brake Fluid DOT 4 (2010–2014 ESD/EX/ESDi) | Tambor mecânico (KS/ES/ESi)',
            fluidoBengala: {
              especificacao: 'Fluido para suspensão Honda (trocar a cada 16.000 km conforme Manual 2014 pág. 37 e 68)',
              volumePorCanelaMl: 141.5,
              observacao:
                '141,5 cm³ (Manuais 2009 pág. 10-2 e 2010 pág. 10-1) | 142 cm³ (Manuais 2011 Fan e 2011 Titan pág. 10-1) | 139,0 ± 2,5 cm³ (Manual 2014 pág. 68 / PDF pág. 80)',
            },
          },
          folgas: {
            ...cg150Base.folgas,
            folgaCorrenteMm: faixaMm(15, 25, '15 – 25 mm (limite máximo 50 mm)'),
            folgaPedalFreioMm: faixaMm(
              15,
              30,
              '15 – 25 mm (Manuais 2009, 2010 e 2011 pág. 6-18/6-19) | 20 – 30 mm (Manual 2014 pág. 56 / PDF pág. 68)',
            ),
            folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm (medida no flange da manopla)'),
          },
          eletrica: {
            vela: {
              modelo: 'NGK CPR8EA-9',
              alternativas: ['NGK CPR9EA-9 (Opcional)'],
              folgaEletrodoMm: faixaMm(0.8, 0.9, '0,8 – 0,9 mm (0,80 – 0,90 mm)'),
            },
            bateria: {
              modelo: '12 V – 5 Ah (DTZ6 em 2014; ES/ESD/EX/Fan ESi/ESDi) | 12 V – 4 Ah (Titan KS 2009 e 2010)',
              tensaoV: 12,
              capacidadeAh: 5,
              tensaoCargaV:
                'Alternador: 0,13 kW / 5.000 rpm (2009–2011) | 0,193 kW / 5.000 rpm (2014 pág. 110) • Ignição Eletrônica',
            },
            fusivelPrincipalA: 15,
            fusiveisSecundarios: '10 A',
            lampadaFarol:
              '12 V – 35/35 W (Lanterna/freio: 12 V – 5/21 W • Sinaleiras: 12 V – 16 W x 4 [2009–2011] / 12 V – 10 W x 4 + luz de placa 12 V – 5 W [2014])',
          },
          pneus: {
            dianteiro: {
              medida: '80/100 – 18M/C 47P',
              pressaoPsi: 25,
              pressaoComGarupaPsi: 25,
              tipo: 'Com câmara (KS/ES/ESD/Fan) | Sem câmara (Titan EX) • 25 psi (175 kPa / 1,75 kgf/cm²) • Sulco mín. 1,5 mm',
            },
            traseiro: {
              medida: '90/90 – 18M/C 57P (REINF 57P em 2014)',
              pressaoPsi: 29,
              pressaoComGarupaPsi: 33,
              tipo: 'Com câmara (KS/ES/ESD/Fan) | Sem câmara (Titan EX) • 29 psi (200 kPa) só piloto / 33 psi (225 kPa) com passageiro • Sulco mín. 2,0 mm',
            },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente:
              'DID 428MX – 118RB ou RK 428SB – 118RJ (118 elos • lubrificante: óleo para transmissão SAE 80 ou 90)',
            pinhaoDentes: 16,
            coroaDentes: 43,
          },
          torques: TORQUES_CG150_INJ,
        },
      }),
    ],
  },
  {
    id: 'honda-cg-125',
    marca: 'Honda',
    nome: 'CG 125',
    categoria: 'street',
    aliases: ['Titan 125', 'Fan 125', 'Cargo 125', 'CG125', 'Vareta'],
    geracoes: [
      geracao('honda-cg-125', {
        anoInicio: 2000,
        anoFim: 2008,
        nomeGeracao: 'Titan / Cargo / Fan OHV (Motor Vareta)',
        versoes: ['Titan KS', 'Titan ES', 'Titan KSE', 'Cargo', 'Fan 125 (2005–2008)'],
        destaques: [
          'Motor 124,1 cm³ OHV comando por vareta',
          'Folga de válvulas simétrica: Adm 0,08 mm / Esc 0,08 mm (motor frio)',
          'Bujão do filtro de tela de óleo com torque de 15 N·m (1,5 kgf·m)',
        ],
        alertasBancada: [
          'Motor OHV (Vareta 124,1 cm³): TANTO admissão QUANTO escape usam 0,08 mm com motor frio — diferente do motor OHC 2009+ que usa 0,12 mm no escape.',
          'Diferença crítica de volume de óleo do motor entre 2000 e 2008 (ambos SAE 20W-50 API-SF sem aditivos): na CG 125 Titan/Cargo 2000 (págs. 40 e 82) são 0,80 L na troca e 1,0 L total; na CG 125 Fan 2008 (págs. 6-7 e 10-1) passou para 0,9 L após drenagem e 1,1 L após desmontagem!',
          'Fluido da suspensão dianteira (ATF): 82,5 cm³ por amortecedor na Titan/Cargo 2000 (pág. 68 e 82, troca a cada 9.000 km ou 1 ano) e 75,5 cm³ na CG 125 Fan 2008 (pág. 10-1).',
          'Diferenças entre Titan/Cargo 2000 e Fan 2008 confirmadas nos manuais: marcha lenta 1.400 ± 100 rpm (2000 pág. 49/83) vs 1.500 ± 100 rpm (2008 pág. 6-12/10-2); vela NGK DP8EA-9 (2000 pág. 53/83) vs NGK DPR8EA-9 / opcional DPR9EA-9 (2008 pág. 6-8/10-2); relação final 3,071 [43/14] com folga de corrente 15 ~ 25 mm (2000 pág. 57/83) vs redução final 3,142 com corrente DID 428H e folga 10 – 20 mm (2008 pág. 6-13/10-3).',
          'Medida do pneu dianteiro em ambos os manuais (2000 pág. 23/83 e 2008 pág. 6-19/10-2) é 2.75-18 42P (e não 80/100-18); calibragem traseira é 28 psi só piloto / 32 psi com passageiro (2000) e 29 psi só piloto / 33 psi com passageiro (2008).',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte:
            'CG 125 Titan e Cargo 2000.pdf (D2203-MAN-0176 — págs. 21–23, 36–72 e 82–84 [PDF págs. 28–30, 43–80, 89–91 e 94]) e CG 125 Fan 2008.pdf (D2203-MAN-0604 — págs. 6-1 a 6-26, 9-4 e 10-1 a 10-3 [PDF págs. 33–58, 70–73 e 147])',
          notas:
            'Auditado 100% nos 2 PDFs locais: cilindrada 124,1 cm³ (56,5 x 49,5 mm); óleo Mobil Super Moto 4T SAE 20W-50 API-SF (2000: 0,80 L troca / 1,0 L total; 2008: 0,9 L drenagem / 1,1 L desmontagem); tampa do filtro de tela / bujão de drenagem 15 N·m (1,5 kgf·m); válvulas OHV Adm 0,08 mm / Esc 0,08 mm (contraporca 14 N·m, parafusos C da tampa do cabeçote 12 N·m, parafusos A/B PAIR 12 N·m, tampa do orifício do virabrequim 15 N·m); bengala ATF 82,5 cm³ (2000) e 75,5 cm³ (2008); eixo diant. 63 N·m (2000) / 62 N·m (2008), eixo tras. 90 N·m (2000) / 88 N·m (2008) e braço do freio tras. 22 N·m. Pendências que aguardam Manual de Serviço: modelo/giclagem do carburador, nível de óleo da bengala em mm, quantidade de elos da corrente e torques internos (vela em N·m, porca castelo do filtro centrífugo, coroa e coluna de direção).',
        },
        fichaTecnica: {
          versaoReferencia: 'Titan / Cargo (2000) • Fan 125 (2008)',
          cilindradaCc: 124.1,
          motor: MOTOR_OHV_2V,
          alimentacao: 'carburador',
          combustivel: 'gasolina',
          arrefecimento: 'ar',
          partida: 'pedal',
          cambio: { tipo: 'manual', marchas: 5 },
          freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'convencional' },
          pesoSecoKg: 108.9,
          motorDetalhes: {
            diametroCursoMm: { diametro: 56.5, curso: 49.5 },
            taxaCompressao: '9,2:1 (Titan/Cargo 2000 pág. 82) | 9,5:1 (Fan 2008 pág. 10-2)',
            potencia: '12,5 CV @ 9.000 rpm JIS (Titan/Cargo 2000 pág. 82) | 12,5 cv @ 8.250 rpm (Fan 2008 pág. 10-2)',
            torque: '1,00 kgf·m @ 7.500 rpm (Titan/Cargo 2000 pág. 82) | 1,02 kgf·m @ 7.000 rpm (Fan 2008 pág. 10-2)',
            marchaLentaRpm: faixaRpm(
              1300,
              1600,
              '1.400 ± 100 rpm (Manual 2000 pág. 49/83) | 1.500 ± 100 rpm (Manual 2008 pág. 6-12/10-2)',
            ),
            comando: 'OHV (4 tempos, arrefecido a ar, comando de válvulas por vareta)',
            filtroOleo:
              'Tela do filtro de óleo (bujão 15 N·m) + filtro centrífugo de óleo (limpar a cada 6.000 km no manual 2000 / a cada 12.000 km no manual 2008)',
            alimentacaoDetalhe:
              'Carburador (gasolina) • Marcha lenta: 1.400 ± 100 rpm (2000) / 1.500 ± 100 rpm (2008) • Modelo e giclagem: aguardam confirmação no Manual de Serviço',
          },
          fluidos: {
            oleoMotor: {
              especificacao: 'MOBIL SUPER MOTO 4T MULTIVISCOSO SAE 20W-50 API-SF (proibido adicionar aditivos ao óleo)',
              capacidadeTrocaL: 0.8,
              capacidadeTotalL: 1.0,
              observacao:
                'Manual 2000 (págs. 40 e 82): 0,80 L para troca / 1,0 L total | Manual 2008 (págs. 6-7 e 10-1): 0,9 L após drenagem / 1,1 L após desmontagem do motor',
            },
            tanqueL: 13.5,
            reservaL: 2.0,
            fluidoFreio: 'Não utiliza (freios dianteiro e traseiro a tambor — sapatas de expansão interna)',
            fluidoBengala: {
              especificacao: 'Fluido para Transmissão Automática - ATF (Manual 2000 pág. 68: trocar a cada 9.000 km ou 1 ano)',
              volumePorCanelaMl: 82.5,
              observacao:
                '82,5 cm³ para cada amortecedor (Manual 2000 págs. 68 e 82) | 75,5 cm³ (Manual Fan 2008 pág. 10-1)',
            },
          },
          folgas: {
            valvulaAdmissaoMm: faixaMm(0.08, 0.08, '0,08 mm (motor frio no PMS de compressão)'),
            valvulaEscapeMm: faixaMm(0.08, 0.08, '0,08 mm (motor frio no PMS de compressão)'),
            folgaCorrenteMm: faixaMm(
              10,
              25,
              '15 ~ 25 mm no cavalete central (Manual 2000 pág. 57/83) | 10 – 20 mm no cavalete lateral (Manual 2008 pág. 6-13; limite 50 mm)',
            ),
            folgaManeteEmbreagemMm: faixaMm(
              10,
              20,
              '10 – 20 mm (alavanca do freio dianteiro a tambor também 10 – 20 mm • Manual 2008 pág. 6-17)',
            ),
            folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm (Manuais 2000 pág. 62 e 2008 pág. 6-18)'),
            folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm (medida no flange da manopla • Manuais 2000 pág. 48 e 2008 pág. 6-11)'),
          },
          eletrica: {
            vela: {
              modelo: 'NGK DP8EA-9 (Manual 2000 pág. 53/83) | NGK DPR8EA-9 (Manual 2008 pág. 6-8/10-2)',
              alternativas: ['NGK DPR9EA-9 (Opcional — Manual 2008 pág. 6-8/10-2)'],
              folgaEletrodoMm: faixaMm(0.8, 0.9, '0,8 – 0,9 mm'),
            },
            bateria: {
              modelo: '12 V – 2,5 Ah com eletrólito (Manual 2000 pág. 66/84) | 12 V – 4 Ah selada (Manual 2008 pág. 6-23/10-3)',
              tensaoV: 12,
              capacidadeAh: 4,
              tensaoCargaV:
                'Alternador: 0,096 kW / 5.000 rpm (Manual 2000 pág. 84) | 0,088 kW / 5.000 rpm (Manual 2008 pág. 10-3) • Ignição CDI',
            },
            fusivelPrincipalA: 10,
            fusiveisSecundarios: 'Nenhum no Manual 2000 (pág. 67/84) | 7 A no Manual 2008 (pág. 6-26 e 10-3)',
            lampadaFarol:
              '12 V – 35/35 W (Lanterna/freio: 12 V – 5/21 W • Sinaleiras: 12 V – 10 W x 4 [2000] / 12 V – 16 W x 4 [2008])',
          },
          pneus: {
            dianteiro: {
              medida: '2.75 – 18 42P (2000: Pirelli MT39 Mandrake | 2008: 2,75 – 18 M/C 42P Pirelli City Demon)',
              pressaoPsi: 25,
              pressaoComGarupaPsi: 25,
              tipo: 'Com câmara • 25 psi (1,75 kgf/cm² / 175 kPa) só piloto e piloto + passageiro (Cargo: somente piloto) • Sulco mín. 1,5 mm',
            },
            traseiro: {
              medida: '90/90 – 18 57P (2000: Pirelli MT15 Mandrake | 2008: 90/90 – 18 M/C 57P Pirelli City Demon)',
              pressaoPsi: 29,
              pressaoComGarupaPsi: 33,
              tipo: 'Com câmara • Manual 2000 (pág. 23/83): 28 psi (2,00 kg/cm²) só piloto / 32 psi (2,25 kg/cm²) com passageiro | Manual 2008 (pág. 6-19/10-2): 29 psi (200 kPa) só piloto / 33 psi (225 kPa) com passageiro • Sulco mín. 2,0 mm',
            },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente:
              'DID 428H (Manual 2008 pág. 6-15 • Lubrificante: óleo SAE 80-90) • Redução final: 3,071 (43/14 no Manual 2000 pág. 83) | 3,142 (Manual 2008 pág. 10-3)',
            pinhaoDentes: 14,
            coroaDentes: 43,
          },
          torques: TORQUES_CG125_OHV,
        },
      }),
      geracao('honda-cg-125', {
        anoInicio: 2009,
        anoFim: 2018,
        nomeGeracao: 'Fan / Cargo 125 OHC (KS / ES / ESD / i)',
        versoes: ['Fan KS', 'Fan ES', 'Fan ESD', 'Cargo KS', 'Cargo ES', 'Fan 125i (2016–2018)'],
        destaques: [
          'Motor 124,7 cm³ OHC com corrente de comando (11,6 cv @ 8.250 rpm)',
          'Folga de válvulas OHC: Adm 0,08 mm / Esc 0,12 mm (motor frio)',
          'Óleo SAE 10W-30 API SJ (ou superior) JASO MA (1,0 L drenagem / 1,2 L desmontagem)',
        ],
        alertasBancada: [
          'Mudança estrutural em 2009: saiu o motor vareta (OHV 124,1 cm³) e entrou o OHC 124,7 cm³ (52,40 x 57,84 mm) com corrente de comando; a folga de válvula de escape passou para 0,12 mm e a vela passou para rosca M10 (NGK CPR8EA-9 ou opcional CPR9EA-9).',
          'Diferença crítica no volume de fluido da suspensão dianteira entre os manuais 2011 e 2014: o Manual 2011 (pág. 10-1) especifica 72 cm³ por canela, enquanto o Manual 2014 (pág. 38 e 73 / PDF pág. 50 e 85) especifica 139,0 ± 2,5 cm³ com substituição a cada 16.000 km!',
          'Corrente de transmissão mudou de 116 elos (DID 428MX – 116RB no Manual 2011 pág. 6-16) para 118 elos (DID 428MX – 118LE no Manual 2014 págs. 67 e 115), mantendo pinhão 14 dentes e coroa 43 dentes (redução final 3,071) e folga de 10 – 20 mm.',
          'Diferenças de freio, roda e elétrica entre os manuais 2011 e 2014: torque do eixo dianteiro mudou de 62 N·m (2011 pág. 6-24) para 59 N·m (2014 págs. 80/81/118); folga do pedal do freio traseiro mudou de 15 – 25 mm (2011 pág. 6-19) para 20 – 30 mm (2014 pág. 61); bateria na ES era 12 V – 5 Ah em 2011 (4 Ah na KS) e foi unificada em 12 V – 4 Ah / DTZ5 para KS/ES/ESD em 2014 (pág. 117).',
          'Filtro de ar é do tipo viscoso (úmido com óleo) — NUNCA limpar com ar comprimido: substituir a cada 12.000 km (Manual 2011 pág. 6-2) ou a cada 16.000 km (Manual 2014 pág. 36).',
          'Versão CG 125i Fan (2016–2018, injeção PGM-FI gasolina — Manuais 2016/2018 PDF págs. 118–122): 11,8 cv @ 8.500 rpm, 1,06 kgf·m @ 5.000 rpm, marcha lenta 1.500 ± 100 rpm, tanque 14,6 L (reserva 3,2 L), peso seco 107 kg, alternador 0,16 kW/5.000 rpm, mantendo válvulas 0,08 / 0,12 mm, vela NGK CPR8EA-9, corrente DID 428MX 118 elos (14x43, 10–20 mm) e torques 30 / 59 / 88 / 22 N·m.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte:
            'CG 125 Fan e Cargo 2011.pdf (D2203-MAN-0734 — págs. 4-3, 5-8, 6-1 a 6-29 e 10-1 a 10-5 [PDF págs. 17, 28, 41–69, 85–89 e 164]), CG 125 Fan e Cargo 2014.pdf (D2203-MAN-0944 — págs. 34–89 e 112–118 [PDF págs. 46–101, 124–130 e 211]), CG 125i Fan 2016.pdf e CG 125i Fan 2018.pdf (PDF págs. 118–122)',
          notas:
            'Auditado 100% nos 4 PDFs locais (2011 e 2014 carburadas + 2016 e 2018 CG 125i injetadas): cilindrada 124,7 cm³; óleo Genuíno Honda SAE 10W-30 API SJ/SL JASO MA (1,0 L drenagem / 1,2 L desmontagem); parafuso de drenagem 30 N·m (3,1 kgf·m); válvulas OHC Adm 0,08 mm / Esc 0,12 mm; vela NGK CPR8EA-9 (opcional CPR9EA-9), folga 0,80–0,90 mm; marcha lenta 1.400 ± 100 rpm (carburada) / 1.500 ± 100 rpm (125i); relação 14x43 (3,071) com corrente DID 428MX-116RB (2011) / DID 428MX-118LE (2014–2018) e folga 10–20 mm; bengala 72 cm³ (2011) / 139,0 ± 2,5 cm³ (2014); eixo diant. 62 N·m (2011) / 59 N·m (2014–2018), eixo tras. 88 N·m e porca do braço limitador do freio tras. 22 N·m. Pendências que aguardam Manual de Serviço: modelo/giclagem do carburador 2009–2015, pressão da bomba PGM-FI da 125i, nível de óleo da bengala em mm e torques internos (vela em N·m, tampa do cabeçote, contraporca de válvula, filtro centrífugo, coroa, pinça de freio ESD e coluna de direção).',
        },
        fichaTecnica: {
          versaoReferencia: 'Fan KS / ES / ESD • Cargo KS / ES (Manuais 2011 e 2014)',
          cilindradaCc: 124.7,
          motor: MOTOR_OHC_2V,
          alimentacao: 'carburador',
          combustivel: 'gasolina',
          arrefecimento: 'ar',
          partida: 'pedal-eletrica',
          cambio: { tipo: 'manual', marchas: 5 },
          freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'convencional' },
          pesoSecoKg: 108.9,
          motorDetalhes: {
            diametroCursoMm: { diametro: 52.4, curso: 57.84 },
            taxaCompressao: '9,2:1',
            potencia: '11,6 cv @ 8.250 rpm (Manuais 2011 pág. 10-2 e 2014 pág. 113)',
            torque: '1,06 kgf·m @ 6.000 rpm (Manuais 2011 pág. 10-2 e 2014 pág. 113)',
            marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
            comando: 'OHC (4 tempos, arrefecido a ar, monocilíndrico, acionado por corrente, 2 válvulas)',
            filtroOleo: 'Filtro centrífugo de óleo + tela do filtro de óleo (limpar a cada 12.000 km)',
            alimentacaoDetalhe:
              'Carburador (gasolina comum nos manuais 2011 e 2014) • Marcha lenta: 1.400 ± 100 rpm • Giclagem do carburador e dados de injeção da versão 125i (2016–2018): aguardam confirmação no Manual de Serviço',
          },
          fluidos: {
            oleoMotor: {
              especificacao:
                'ÓLEO GENUÍNO HONDA SAE 10W-30 API SJ (ou superior) JASO MA (proibido adicionar aditivos ao óleo)',
              capacidadeTrocaL: 1.0,
              capacidadeTotalL: 1.2,
              observacao:
                '1,0 L após drenagem | 1,2 L após desmontagem do motor (Manuais 2011 pág. 6-7/10-1 e 2014 pág. 58/112)',
            },
            tanqueL: 15.1,
            reservaL: 2.5,
            fluidoFreio:
              'Tambor mecânico (Fan KS/ES e Cargo KS/ES) | Mobil Super Moto Brake Fluid DOT 4 na versão CG 125 Fan ESD (Manual 2014 pág. 46 e 114)',
            fluidoBengala: {
              especificacao: 'Fluido para suspensão Honda (Manual 2014 pág. 38 e 73: substituir a cada 16.000 km)',
              volumePorCanelaMl: 72,
              observacao:
                '72 cm³ por canela no Manual 2011 (pág. 10-1 / PDF pág. 85) | 139,0 ± 2,5 cm³ no Manual 2014 (pág. 73 / PDF pág. 85)',
            },
          },
          folgas: {
            valvulaAdmissaoMm: faixaMm(0.08, 0.08, '0,08 mm (motor frio)'),
            valvulaEscapeMm: faixaMm(0.12, 0.12, '0,12 mm (motor frio)'),
            folgaCorrenteMm: faixaMm(10, 20, '10 – 20 mm (não pilotar se exceder 50 mm)'),
            folgaManeteEmbreagemMm: faixaMm(
              10,
              20,
              '10 – 20 mm (alavanca do freio dianteiro a tambor KS/ES também 10 – 20 mm)',
            ),
            folgaPedalFreioMm: faixaMm(
              15,
              30,
              '15 – 25 mm (Manual 2011 pág. 6-19 / PDF pág. 59) | 20 – 30 mm (Manual 2014 pág. 61 / PDF pág. 73)',
            ),
            folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm (medida no flange da manopla)'),
          },
          eletrica: {
            vela: {
              modelo: 'NGK CPR8EA-9',
              alternativas: ['NGK CPR9EA-9 (Opcional)'],
              folgaEletrodoMm: faixaMm(0.8, 0.9, '0,8 – 0,9 mm (0,80 – 0,90 mm)'),
            },
            bateria: {
              modelo:
                'Manual 2011 (pág. 10-4): 12 V – 5 Ah (10h) (Fan ES / Cargo ES) e 12 V – 4 Ah (10h) (Fan KS / Cargo KS) | Manual 2014 (pág. 117): 12 V – 4 Ah / DTZ5 (KS, ES e ESD)',
              tensaoV: 12,
              capacidadeAh: 4,
              tensaoCargaV: 'Alternador: 0,12 kW / 5.000 rpm • Ignição CDI',
            },
            fusivelPrincipalA: 15,
            fusiveisSecundarios: '5 A e 10 A (Manual 2011 pág. 6-28/10-4) | 10 A (Manual 2014 pág. 117)',
            lampadaFarol:
              '12 V – 35/35 W (Lanterna/freio: 12 V – 5/21 W • Sinaleiras: 12 V – 16 W x 4 [2011] / 12 V – 10 W x 4 + luz de placa 12 V – 5 W [2014])',
          },
          pneus: {
            dianteiro: {
              medida: '80/100 – 18M/C 47P',
              pressaoPsi: 25,
              pressaoComGarupaPsi: 25,
              tipo: 'Com câmara • 25 psi (175 kPa / 1,75 kgf/cm²) só piloto e piloto + passageiro (Cargo: somente piloto) • Sulco mín. 1,5 mm',
            },
            traseiro: {
              medida: '90/90 – 18M/C 57P (REINF 57P em 2014)',
              pressaoPsi: 29,
              pressaoComGarupaPsi: 33,
              tipo: 'Com câmara • 29 psi (200 kPa / 2,00 kgf/cm²) só piloto (e Cargo) / 33 psi (225 kPa / 2,25 kgf/cm²) piloto + passageiro (Fan) • Sulco mín. 2,0 mm',
            },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente:
              'DID 428MX – 116RB (116 elos no Manual 2011 pág. 6-16) | DID 428MX – 118LE (118 elos no Manual 2014 págs. 67 e 115) • Lubrificante: óleo SAE 80 ou 90',
            pinhaoDentes: 14,
            coroaDentes: 43,
          },
          torques: TORQUES_CG125_OHC,
        },
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
        nomeGeracao: 'Bros 160 Flex / ESDD',
        versoes: ['ESD', 'ESDD'],
        destaques: [
          'Motor 162,7 cm³ OHC Flex (14,5 cv G / 14,7 cv E @ 8.500 rpm)',
          'Folga de válvulas: Adm 0,08 mm / Esc 0,24 mm (motor frio)',
          'Corrente 128 elos (16x48, folga 20 – 30 mm) • Eixos 44 N·m (diant.) / 93 N·m (tras.)',
        ],
        alertasBancada: [
          'Folga de válvulas (motor frio): Adm 0,08 mm / Esc 0,24 mm • Óleo SAE 10W-30 API SJ (2015) / SL (2024) JASO MA (1,0 L drenagem / 1,2 L desmontagem).',
          'Folga oficial da corrente de transmissão: 20 – 30 mm (DID 428HX 2015 / DID 428DH ou RK 428HSB 2024, 128 elos, pinhão 16 x coroa 48).',
          'Calibragem oficial pneu traseiro (110/90-17 60P): 22 psi só piloto / 29 psi piloto + passageiro (dianteiro 90/90-19 52P: 22 psi).',
          'Torques oficiais: bujão de óleo 30 N·m (3,1 kgf·m), eixo dianteiro 44 N·m (4,5 kgf·m) e eixo traseiro 93 N·m (9,5 kgf·m).',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte:
            'NXR 160 Bros 2015.pdf (PDF págs. 122–126) e NXR 160 Bros 2024.pdf (pág. 110 [PDF págs. 124–128])',
          notas:
            'Auditado 100% nos Manuais 2015 e 2024: óleo SAE 10W-30 API SJ/SL JASO MA (1,0/1,2 L); válvulas 0,08 / 0,24 mm; vela NGK CPR8EA-9 (0,80–0,90 mm); corrente 128 elos 16x48 (folga 20–30 mm); pneus 90/90-19 (22 psi) e 110/90-17 (22/29 psi); bateria 12V 4Ah DTZ5; fusível principal 15A (sec. 10A em 2015 / 7,5A x 2 em 2024); torques 30 / 44 / 93 N·m. Pendências que aguardam Manual de Serviço: volume/nível de óleo da bengala, pressão da bomba PGM-FI e torques internos.',
        },
        fichaTecnica: bros160Base,
      }),
      geracao('honda-nxr-160-bros', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Nova Geração ABS / CBS & Farol LED',
        versoes: ['CBS', 'ABS'],
        destaques: [
          'Versão ABS (1 canal dianteiro) e versão CBS • Farol e lanterna em LED',
          'Calibração 2025: 14,2 cv (G) / 14,3 cv (E) @ 8.000 rpm • 1,44 / 1,45 kgf·m @ 5.500 rpm',
          'Peso seco 125 kg • Tanque 12,0 L (reserva 2,9 L) • Corrente 128 elos (20 – 30 mm)',
        ],
        alertasBancada: [
          'Calibração PROMOT 5 na linha 2025 (Manual NXR 160 Bros ABS-CBS 2025): potência 14,2 cv (G) / 14,3 cv (E) @ 8.000 rpm, torque 1,44 kgf·m (G) / 1,45 kgf·m (E) @ 5.500 rpm, peso seco 125 kg e reserva 2,9 L.',
          'Fusíveis 2025: principal 15 A; secundários 7,5 A e 10 A (CBS) | 7,5 A, 10 A e 15 A (ABS); bateria 12 V – 4 Ah / DTZ5.',
          'Mantém válvulas Adm 0,08 mm / Esc 0,24 mm, óleo SAE 10W-30 API SL JASO MA (1,0/1,2 L), vela NGK CPR8EA-9, corrente 128 elos (16x48, folga 20–30 mm) e torques 30 / 44 / 93 N·m.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'NXR 160 Bros ABS-CBS 2025.pdf (PDF págs. 124–128)',
          notas:
            'Auditado 100% no Manual 2025: potência 14,2/14,3 cv @ 8.000 rpm; torque 1,44/1,45 kgf·m @ 5.500 rpm; peso seco 125 kg; tanque 12,0 L (reserva 2,9 L); óleo SAE 10W-30 API SL JASO MA (1,0/1,2 L); válvulas 0,08 / 0,24 mm; corrente 128 elos 16x48 (20–30 mm); farol/lanterna LED; bateria 12V 4Ah DTZ5; fusível principal 15A; torques 30 / 44 / 93 N·m. Pendências que aguardam Manual de Serviço: volume/nível de óleo da bengala 33 mm, pressão da bomba PGM-FI e torques internos.',
        },
        fichaTecnica: {
          ...bros160Base,
          versaoReferencia: 'ABS / CBS (2025)',
          freios: { dianteiro: 'disco', traseiro: 'disco', sistema: 'ABS' },
          pesoSecoKg: 125,
          motorDetalhes: {
            ...bros160Base.motorDetalhes,
            potencia: '14,2 cv (gasolina) / 14,3 cv (etanol) @ 8.000 rpm',
            torque: '1,44 kgf·m (gasolina) / 1,45 kgf·m (etanol) @ 5.500 rpm',
          },
          eletrica: {
            ...bros160Base.eletrica,
            fusiveisSecundarios: '7,5 A, 10 A (CBS) | 7,5 A, 10 A, 15 A (ABS)',
            lampadaFarol: 'LED (farol e lanterna)',
          },
          fluidos: {
            ...bros160Base.fluidos,
            reservaL: 2.9,
          },
        },
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
        versoes: ['Standard', 'Adventure'],
        destaques: [
          'Motor 184,4 cm³ OHC Flex (16,3 cv G / 16,4 cv E @ 8.500 rpm)',
          'Folga de válvulas: Adm 0,08 mm / Esc 0,24 mm (motor frio)',
          'Corrente DID 428DH 128 elos (16x48, folga 20 – 30 mm) • Bateria 12 V – 5 Ah (DTZ6)',
        ],
        alertasBancada: [
          'Folga de válvulas (motor frio): Adm 0,08 mm / Esc 0,24 mm • Óleo SAE 10W-30 API SJ (2016) / SL (2024) JASO MA (1,0 L drenagem / 1,2 L desmontagem).',
          'Folga oficial da corrente de transmissão: 20 – 30 mm (DID 428DH, 128 elos, pinhão 16 x coroa 48).',
          'Calibragem oficial pneu traseiro (110/90-17 60P): 22 psi só piloto / 29 psi piloto + passageiro (dianteiro 90/90-19 52P: 22 psi).',
          'Torques oficiais: bujão de óleo 30 N·m (3,1 kgf·m), eixo dianteiro 44 N·m (4,5 kgf·m) e eixo traseiro 93 N·m (9,5 kgf·m).',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte:
            'XRE 190 2016.pdf (PDF págs. 122–126) e XRE 190 2024.pdf (pág. 113 [PDF págs. 128–132])',
          notas:
            'Auditado 100% nos Manuais 2016 e 2024: óleo SAE 10W-30 API SJ/SL JASO MA (1,0/1,2 L); tanque 13,5 L (reserva 3,1 L); válvulas 0,08 / 0,24 mm; vela NGK CPR8EA-9 (0,80–0,90 mm); corrente DID 428DH 128 elos 16x48 (folga 20–30 mm); pneus 90/90-19 (22 psi) e 110/90-17 (22/29 psi); bateria 12V 5Ah DTZ6; fusível principal 15A (sec. 10A, 30A); torques 30 / 44 / 93 N·m. Pendências que aguardam Manual de Serviço: volume/nível de óleo da bengala, pressão da bomba PGM-FI e torques internos.',
        },
        fichaTecnica: xre190Base,
      }),
      geracao('honda-xre-190', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Nova Geração / Farol LED & Suspensão 33 mm',
        versoes: ['Standard', 'Adventure'],
        destaques: [
          'Iluminação Full LED (farol, lanterna e sinaleiras) • Tanque 12,0 L (reserva 2,9 L)',
          'Calibração 2025: 15,9 cv (G) / 16,0 cv (E) @ 8.000 rpm • 1,65 / 1,66 kgf·m @ 6.000 rpm',
          'Peso seco 128 kg • Bateria 12 V – 5 Ah (DTZ6) • Torques 30 / 44 / 93 N·m',
        ],
        alertasBancada: [
          'Mudanças oficiais na linha 2025 (Manual XRE 190 2025): tanque passou para 12,0 L (reserva 2,9 L), peso seco 128 kg, potência 15,9 cv (G) / 16,0 cv (E) @ 8.000 rpm e iluminação Full LED (farol, lanterna e sinaleiras).',
          'Fusíveis 2025: principal 15 A; secundários 7,5 A, 10 A e 15 A; bateria 12 V – 5 Ah / DTZ6.',
          'Mantém válvulas Adm 0,08 mm / Esc 0,24 mm, óleo SAE 10W-30 API SL JASO MA (1,0/1,2 L), vela NGK CPR8EA-9, corrente DID 428DH 128 elos (16x48, folga 20–30 mm) e torques 30 / 44 / 93 N·m.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'XRE 190 2025.pdf (PDF págs. 128–132)',
          notas:
            'Auditado 100% no Manual 2025: potência 15,9/16,0 cv @ 8.000 rpm; torque 1,65/1,66 kgf·m @ 6.000 rpm; peso seco 128 kg; tanque 12,0 L (reserva 2,9 L); óleo SAE 10W-30 API SL JASO MA (1,0/1,2 L); válvulas 0,08 / 0,24 mm; corrente DID 428DH 128 elos 16x48 (20–30 mm); farol/lanterna/sinaleiras LED; bateria 12V 5Ah DTZ6; fusível principal 15A (sec. 7,5A, 10A, 15A); torques 30 / 44 / 93 N·m. Pendências que aguardam Manual de Serviço: volume/nível de óleo da bengala 33 mm, pressão da bomba PGM-FI e torques internos.',
        },
        fichaTecnica: {
          ...xre190Base,
          pesoSecoKg: 128,
          motorDetalhes: {
            ...xre190Base.motorDetalhes,
            potencia: '15,9 cv (gasolina) / 16,0 cv (etanol) @ 8.000 rpm',
            torque: '1,65 kgf·m (gasolina) / 1,66 kgf·m (etanol) @ 6.000 rpm',
          },
          eletrica: {
            ...xre190Base.eletrica,
            fusiveisSecundarios: '7,5 A, 10 A, 15 A',
            lampadaFarol: 'Full LED (farol, lanterna e sinaleiras)',
          },
          fluidos: {
            ...xre190Base.fluidos,
            tanqueL: 12.0,
            reservaL: 2.9,
          },
        },
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
        nomeGeracao: 'Carburada / Injeção Gasolina (2009–2010)',
        versoes: ['KS', 'ES', '+'],
        destaques: [
          'Motor 124,9 cm³ OHC horizontal • Tanque 4,0 L',
          'Folga de válvulas oficial (Manual 2009): Adm 0,10 mm / Esc 0,10 mm (motor frio)',
          'Óleo 0,7 L drenagem / 0,9 L desmontagem • Vela NGK CPR6EA-9 (opc. CPR7EA-9)',
        ],
        alertasBancada: [
          'Folga de válvulas confirmada no Manual Biz 125 2009: Adm 0,10 mm / Esc 0,10 mm (motor frio) — atenção para não confundir com os 0,05 mm da antiga C100 Biz!',
          'Volume de óleo na troca: apenas 0,7 L após drenagem (0,9 L após desmontagem) • Torques: bujão 24 N·m, eixos 49 N·m, braço do freio traseiro 22 N·m.',
          'Bateria varia conforme versão/ano: 12 V – 4 Ah (KS) | 6 Ah (ES/+ em 2006) | 5 Ah (ES/+ em 2009); fusível principal 15 A (sec. 5 A, 10 A em 2006 / 10 A em 2009).',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'Biz 125 2006.pdf e Biz 125 2009.pdf (seções de Manutenção e Especificações Técnicas)',
          notas:
            'Auditado 100% nos Manuais 2006 e 2009: cilindrada 124,9 cm³; tanque 4,0 L; óleo 0,7 L drenagem / 0,9 L desmontagem; válvulas 0,10 / 0,10 mm (2009); vela NGK CPR6EA-9 (opcional CPR7EA-9), folga 0,80–0,90 mm; bateria 4Ah (KS) / 6Ah (ES/+ 2006) / 5Ah (ES/+ 2009); fusíveis 15A + 5A/10A (2006) / 10A (2009); torques 24 / 49 / 49 / 22 N·m. Pendências que aguardam Manual de Serviço: giclagem do carburador (2006–2008), pressão da bomba PGM-FI (2009–2010), volume/nível de óleo da bengala e torques internos.',
        },
        fichaTecnica: biz125Base,
      }),
      geracao('honda-biz-125', {
        anoInicio: 2011,
        anoFim: 2017,
        nomeGeracao: 'Flex Injetada',
        versoes: ['ES', 'EX'],
        destaques: [
          'Injeção eletrônica PGM-FI Flex • Tanque 5,5 L (2011) / 5,1 L (2017)',
          'Folga de válvulas: Adm 0,10 mm / Esc 0,10 mm • Óleo SAE 10W-30 JASO MA (0,7 / 0,9 L)',
          'Corrente 106 elos (14x34, folga 25 – 35 mm) • Pneu traseiro 33 / 41 psi (2017)',
        ],
        alertasBancada: [
          'Folga de válvulas confirmada nos Manuais 2011 e 2017: Adm 0,10 mm / Esc 0,10 mm (motor frio).',
          'Vela padrão: NGK CPR6EA-9 ou DENSO U20EPR9 (alta rotação contínua: NGK CPR7EA-9 ou DENSO U22EPR9), folga 0,80–0,90 mm.',
          'Diferenças entre 2011 e 2017: tanque passou de 5,5 L (2011) para 5,1 L (2017); calibragem traseira em 2017 passou para 33 psi só piloto / 41 psi piloto + passageiro.',
          'Torques oficiais: bujão de óleo 24 N·m, eixo dianteiro 49 N·m, eixo traseiro 49 N·m e braço limitador do freio traseiro 22 N·m.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'Biz 125 2011.pdf e Biz 125 2017.pdf (seções de Manutenção e Especificações Técnicas)',
          notas:
            'Auditado 100% nos Manuais 2011 e 2017: óleo SAE 10W-30 API SJ/SL JASO MA (0,7/0,9 L); tanque 5,5 L (2011) / 5,1 L (2017); válvulas 0,10 / 0,10 mm; vela NGK CPR6EA-9 / DENSO U20EPR9 (alta rotação CPR7EA-9 / U22EPR9); fluido de freio DOT 3 ou DOT 4; corrente 106 elos 14x34 (25–35 mm); pneu traseiro 33 / 41 psi (2017); torques 24 / 49 / 49 / 22 N·m. Pendências que aguardam Manual de Serviço: volume/nível de óleo da bengala, pressão da bomba PGM-FI e torques internos.',
        },
        fichaTecnica: {
          ...biz125Base,
          versaoReferencia: 'EX / ES (Flex)',
          alimentacao: 'injecao',
          combustivel: 'flex',
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'convencional' },
          motorDetalhes: {
            ...biz125Base.motorDetalhes,
            potencia: '9,1 cv @ 7.500 rpm (2011) / 9,2 cv @ 7.500 rpm (2017)',
            torque: '1,01 kgf·m @ 3.500 rpm (2011) / 1,04 kgf·m @ 3.500 rpm (2017)',
            alimentacaoDetalhe:
              'Injeção eletrônica PGM-FI Flex • Marcha lenta: 1.400 ± 100 rpm • Pressão da bomba de combustível: aguarda confirmação no Manual de Serviço',
          },
          fluidos: {
            ...biz125Base.fluidos,
            oleoMotor: {
              especificacao: 'ÓLEO GENUÍNO HONDA SAE 10W-30 API SJ/SL JASO MA (sem aditivos)',
              capacidadeTrocaL: 0.7,
              capacidadeTotalL: 0.9,
              observacao: '0,7 L após drenagem | 0,9 L após desmontagem do motor (Manuais Biz 125 2011 e 2017)',
            },
            tanqueL: 5.5,
            fluidoFreio: 'DOT 3 ou DOT 4 (disco dianteiro na EX) | Tambor mecânico na ES',
          },
          eletrica: {
            ...biz125Base.eletrica,
            vela: {
              modelo: 'NGK CPR6EA-9 ou DENSO U20EPR9',
              alternativas: ['NGK CPR7EA-9 / DENSO U22EPR9 (alta rotação)'],
              folgaEletrodoMm: faixaMm(0.8, 0.9, '0,80 – 0,90 mm'),
            },
          },
          pneus: {
            dianteiro: {
              medida: '60/100 – 17M/C 33L',
              pressaoPsi: 25,
              pressaoComGarupaPsi: 25,
              tipo: 'Com câmara • 25 psi (175 kPa) só piloto e piloto + passageiro',
            },
            traseiro: {
              medida: '80/100 – 14M/C 49L',
              pressaoPsi: 33,
              pressaoComGarupaPsi: 41,
              tipo: 'Com câmara • 33 psi só piloto / 41 psi piloto + passageiro (Manual 2017)',
            },
          },
        },
      }),
      geracao('honda-biz-125', {
        anoInicio: 2018,
        anoFim: 2026,
        nomeGeracao: 'Novo Design / CBS (Novo Motor 123,9 cm³ em 2025+)',
        versoes: ['125 (2018–2024)', '125 ES (2025+)', '125 EX (2025+)'],
        destaques: [
          '2018–2024: 124,9 cm³, óleo 0,7/0,9 L, válvulas 0,10/0,10 mm, corrente 428 (14x33)',
          '2025–2026: Novo motor 123,9 cm³, óleo 0,9/1,1 L, válvulas 0,08/0,20 mm, vela CPR7EA-9, corrente DID 420AD2 (14x34)',
          'Freio combinado CBS • Freio traseiro no manete esquerdo na linha 2025+',
        ],
        alertasBancada: [
          'ATENÇÃO CRÍTICA À MUDANÇA TOTAL DE MOTOR EM 2025 (Manual Biz 125 ES/EX 2025): cilindrada passou para 123,9 cm³ (50,000 x 63,121 mm, 10,0:1, 9,53 cv @ 7.500 rpm, 1,03 kgf·m @ 6.000 rpm); óleo passou para 0,9 L após drenagem / 1,1 L desmontagem (vs 0,7/0,9 L em 2018–2024)!',
          'VÁLVULAS MUDARAM COMPLETAMENTE EM 2025: 2018–2024 usa Adm 0,10 mm / Esc 0,10 mm; a partir de 2025 usa Adm 0,08 mm / Esc 0,20 mm (motor frio)!',
          'VELA E TRANSMISSÃO EM 2025: vela padrão mudou para NGK CPR7EA-9 (vs CPR6EA-9 em 2018–2024); corrente mudou para passo 420 (DID 420AD2, 106 elos, 14x34, folga 30–40 mm; em 2018–2024 era 106 elos 14x33, folga 30–40 mm).',
          'Na linha 2025, Biz ES é somente Gasolina com pneu dianteiro 60/100-17 (com câmara) e Biz EX é Flex com pneu dianteiro 70/90-17 sem câmara; tanque 5,0 L (reserva 1,1 L); bateria 12 V – 5 Ah / DTZ6; torque do suporte da bateria 5,7 N·m.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte:
            'Biz 125 2018.pdf (seção Especificações) e Biz 125 ES EX 2025.pdf (págs. 78 e 112 [PDF págs. 78 e 126–130])',
          notas:
            'Auditado 100% nos Manuais 2018 e 2025 com registro explícito das duas arquiteturas: 2018–2024 (124,9 cm³, óleo 0,7/0,9 L, válvulas 0,10/0,10 mm, vela CPR6EA-9, relação 14x33, pneu tras. 33/41 psi, torques 24/49/49/22 N·m) vs 2025–2026 (123,9 cm³, 50,000x63,121 mm, 10,0:1, 9,53 cv, 1,03 kgf·m, óleo 0,9/1,1 L, tanque 5,0 L / reserva 1,1 L, válvulas 0,08/0,20 mm, vela NGK CPR7EA-9, corrente DID 420AD2 106 elos 14x34 folga 30–40 mm, bateria 12V 5Ah DTZ6, suporte bateria 5,7 N·m). Pendências que aguardam Manual de Serviço: volume/nível de óleo da bengala, pressão da bomba PGM-FI e torques internos.',
        },
        fichaTecnica: {
          ...biz125Base,
          versaoReferencia: '125 (2018–2024) • 125 ES / EX (2025+)',
          cilindradaCc: 123.9,
          alimentacao: 'injecao',
          combustivel: 'flex',
          partida: 'eletrica',
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'CBS' },
          motorDetalhes: {
            ...biz125Base.motorDetalhes,
            diametroCursoMm: { diametro: 50.0, curso: 63.12 },
            taxaCompressao: '9,3:1 (2018–2024) | 10,0:1 (2025–2026)',
            potencia: '9,2 cv @ 7.500 rpm (2018–2024) | 9,53 cv @ 7.500 rpm (2025–2026)',
            torque: '1,04 kgf·m @ 3.500 rpm (2018–2024) | 1,03 kgf·m @ 6.000 rpm (2025–2026)',
            alimentacaoDetalhe:
              'Injeção eletrônica PGM-FI Flex (2025 ES: somente gasolina; 2025 EX: Flex) • Pressão da bomba de combustível: aguarda confirmação no Manual de Serviço',
          },
          fluidos: {
            ...biz125Base.fluidos,
            oleoMotor: {
              especificacao: 'ÓLEO GENUÍNO HONDA SAE 10W-30 API SL JASO MA (sem aditivos)',
              capacidadeTrocaL: 0.7,
              capacidadeTotalL: 0.9,
              observacao: '2018–2024: 0,7 L drenagem / 0,9 L desmontagem | 2025–2026: 0,9 L drenagem / 1,1 L desmontagem',
            },
            tanqueL: 5.0,
            reservaL: 1.1,
            fluidoFreio: 'DOT 4 (disco dianteiro + CBS na 2018–2024 e EX 2025) | Tambor CBS na ES 2025',
          },
          folgas: {
            valvulaAdmissaoMm: faixaMm(0.08, 0.1, '0,10 mm (2018–2024) | 0,08 mm (2025–2026) — motor frio'),
            valvulaEscapeMm: faixaMm(0.1, 0.2, '0,10 mm (2018–2024) | 0,20 mm (2025–2026) — motor frio'),
            folgaCorrenteMm: faixaMm(30, 40, '30 – 40 mm'),
            folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm (2018–2024; 2025+ freio traseiro no manete esquerdo)'),
            folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
          },
          eletrica: {
            ...biz125Base.eletrica,
            vela: {
              modelo: 'NGK CPR6EA-9 (2018–2024) | NGK CPR7EA-9 (2025–2026)',
              alternativas: ['NGK CPR7EA-9 (alta rotação 2018–2024)'],
              folgaEletrodoMm: faixaMm(0.8, 0.9, '0,80 – 0,90 mm'),
            },
            bateria: {
              modelo: '12 V – 5 Ah / DTZ6 (selada)',
              tensaoV: 12,
              capacidadeAh: 5,
              tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
            },
          },
          pneus: {
            dianteiro: {
              medida: '60/100 – 17M/C 33L (2018–2024 e ES 2025) | 70/90 – 17M/C (EX 2025 sem câmara)',
              pressaoPsi: 25,
              pressaoComGarupaPsi: 25,
              tipo: '25 psi só piloto e piloto + passageiro',
            },
            traseiro: {
              medida: '80/100 – 14M/C 49L',
              pressaoPsi: 33,
              pressaoComGarupaPsi: 41,
              tipo: '33 psi só piloto / 41 psi piloto + passageiro',
            },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '106 elos • 428 (14x33 em 2018–2024) | DID 420AD2 (14x34 em 2025–2026)',
            pinhaoDentes: 14,
            coroaDentes: 34,
          },
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
        nomeGeracao: 'Pop 110i Injetada (Pedal / Embreagem Manual)',
        destaques: [
          'Motor 109,1 cm³ injetado (somente gasolina) • Câmbio MANUAL 4 marchas com manete de embreagem',
          'Folga de válvulas: Adm 0,10 mm / Esc 0,15 mm (motor frio) • Bengala 58 ± 1,0 cm³',
          'Corrente 104 elos (14x34, folga 30 – 40 mm) • Óleo SAE 10W-30 JASO MA (0,8 / 1,0 L)',
        ],
        alertasBancada: [
          'ATENÇÃO: a Pop 110i 2016–2024 tem câmbio MANUAL de 4 marchas com embreagem multidisco acionada por manete (folga 10 – 20 mm) — o câmbio semiautomático só entrou em 2025 (Pop 110i ES)!',
          'Folga de válvulas oficial nos Manuais 2016 e 2024: Adm 0,10 mm / Esc 0,15 mm (motor frio) — diferente do escape 0,10 mm da Biz 125.',
          'Volume oficial de fluido da suspensão dianteira (Manuais 2016 e 2024): 58 ± 1,0 cm³ por canela.',
          'Motor exclusivamente a GASOLINA • Óleo SAE 10W-30 API SJ/SL JASO MA (0,8 L drenagem / 1,0 L desmontagem) • Torques: bujão 24 N·m, eixos dianteiro e traseiro 54 N·m.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'Pop 110i 2016.pdf e Pop 110i 2024.pdf (seções de Manutenção e Especificações Técnicas)',
          notas:
            'Auditado 100% nos Manuais 2016 e 2024: câmbio manual 4 marchas com embreagem multidisco; 109,1 cm³ (50,0x55,6 mm, 9,3:1, 7,9 cv @ 7.250 rpm, 0,90 kgf·m @ 5.000 rpm); óleo SAE 10W-30 JASO MA (0,8/1,0 L); válvulas 0,10 / 0,15 mm; vela NGK CPR6EA-9S (0,80–0,90 mm); bengala 58 ± 1,0 cm³; corrente DID 428MX/RK 428SB 104 elos 14x34 (30–40 mm); bateria 12V 4Ah DTZ5; torques 24 / 54 / 54 N·m. Pendências que aguardam Manual de Serviço: nível de óleo da bengala em mm, pressão da bomba PGM-FI e torques internos.',
        },
        fichaTecnica: pop110Base,
      }),
      geracao('honda-pop-110i', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Pop 110i ES — Partida Elétrica & Câmbio Semiautomático',
        destaques: [
          'Novo motor 109,5 cm³ (47,000 x 63,121 mm, 10,0:1) • 8,43 cv @ 7.250 rpm • 0,945 kgf·m @ 5.000 rpm',
          'Partida elétrica + câmbio semiautomático (centrífuga + multidisco)',
          'NOVAS FOLGAS DE VÁLVULAS: Adm 0,08 mm / Esc 0,20 mm • Vela NGK CPR8EA-9 • Corrente DID 420AD2',
        ],
        alertasBancada: [
          'ATENÇÃO CRÍTICA AO NOVO MOTOR 2025 (Manual Pop 110i ES 2025): folga de válvulas mudou para Adm 0,08 mm / Esc 0,20 mm (motor frio) e a vela padrão mudou para NGK CPR8EA-9 (0,80–0,90 mm) — NÃO usar a folga 0,10/0,15 mm nem a vela CPR6EA-9S da geração 2016–2024!',
          'Corrente de transmissão mudou para passo 420: DID 420AD2 (104 elos, pinhão 14 x coroa 34, folga 30 – 40 mm).',
          'Partida elétrica de série (sem pedal de partida) com bateria 12 V – 4 Ah / DTZ5 e fusíveis 15 A / 10 A; tanque 4,2 L (reserva 0,8 L).',
          'Continua exclusivamente a GASOLINA, óleo SAE 10W-30 API SL JASO MA (0,8 L drenagem / 1,0 L desmontagem) e freios a tambor CBS.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'Pop 110i ES 2025.pdf (seções de Manutenção e Especificações Técnicas)',
          notas:
            'Auditado 100% no Manual Pop 110i ES 2025: câmbio semiautomático (centrífuga + multidisco); partida elétrica; 109,5 cm³ (47,000x63,121 mm, 10,0:1, 8,43 cv @ 7.250 rpm, 0,945 kgf·m @ 5.000 rpm); tanque 4,2 L (reserva 0,8 L); óleo SAE 10W-30 API SL JASO MA (0,8/1,0 L); válvulas 0,08 / 0,20 mm; vela NGK CPR8EA-9 (0,80–0,90 mm); corrente DID 420AD2 104 elos 14x34 (30–40 mm); bateria 12V 4Ah DTZ5; fusíveis 15A / 10A. Pendências que aguardam Manual de Serviço: volume/nível de óleo da bengala 2025, pressão da bomba PGM-FI e torques internos.',
        },
        fichaTecnica: {
          ...pop110Base,
          versaoReferencia: 'ES (2025)',
          cilindradaCc: 109.5,
          partida: 'eletrica',
          cambio: { tipo: 'semiautomatico', marchas: 4 },
          freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'CBS' },
          motorDetalhes: {
            ...pop110Base.motorDetalhes,
            diametroCursoMm: { diametro: 47.0, curso: 63.12 },
            taxaCompressao: '10,0:1',
            potencia: '8,43 cv @ 7.250 rpm',
            torque: '0,945 kgf·m @ 5.000 rpm',
          },
          fluidos: {
            ...pop110Base.fluidos,
            reservaL: 0.8,
            fluidoBengala: undefined,
          },
          folgas: {
            valvulaAdmissaoMm: faixaMm(0.08, 0.08, '0,08 mm (motor frio — Manual Pop 110i ES 2025)'),
            valvulaEscapeMm: faixaMm(0.2, 0.2, '0,20 mm (motor frio — Manual Pop 110i ES 2025)'),
            folgaCorrenteMm: faixaMm(30, 40, '30 – 40 mm'),
            folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
            folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
          },
          eletrica: {
            ...pop110Base.eletrica,
            vela: {
              modelo: 'NGK CPR8EA-9',
              folgaEletrodoMm: faixaMm(0.8, 0.9, '0,80 – 0,90 mm'),
            },
            bateria: {
              modelo: '12 V – 4 Ah / DTZ5 (selada)',
              tensaoV: 12,
              capacidadeAh: 4,
              tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
            },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: 'DID 420AD2 — 104 elos',
            pinhaoDentes: 14,
            coroaDentes: 34,
          },
        },
      }),
    ],
  },
  {
    id: 'honda-biz-100',
    marca: 'Honda',
    nome: 'Biz 100',
    categoria: 'cub',
    aliases: ['C100', 'C100 Biz', 'Biz 100', 'Biz100'],
    geracoes: [
      geracao('honda-biz-100', {
        anoInicio: 1998,
        anoFim: 2005,
        nomeGeracao: 'C100 Biz KS / ES — Carburada',
        versoes: ['KS', 'ES', '+'],
        destaques: [
          'Motor 97,1 cm³ OHC horizontal carburado (7,6 cv @ 8.000 rpm • 0,8 kgf·m @ 6.000 rpm)',
          'Folga de válvulas: Adm 0,05 mm / Esc 0,05 mm (motor frio) • Vela NGK C6HSA',
          'Óleo SAE 20W-50 API-SF (0,7 / 0,9 L) • Relação 15x35 (2,333) • Folga corrente 25 – 35 mm',
        ],
        alertasBancada: [
          'Folga de válvulas da C100 Biz (Manuais 2000 e 2005): Adm 0,05 mm / Esc 0,05 mm (motor frio) — diferente dos 0,10 mm da Biz 100 2013–2015!',
          'Vela oficial: NGK C6HSA com folga 0,6 – 0,8 mm (Manual 2000) / 0,6 – 0,7 mm (Manual 2005).',
          'Óleo especificado: SAE 20W-50 API-SF (0,7 L troca / 0,9 L total) • Torques: bujão 25 N·m, copo do filtro de combustível 4 N·m, eixos dianteiro e traseiro 49 N·m, braço do freio traseiro 22 N·m.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte:
            'C-100 Biz 2000.pdf (PDF págs. 59, 61, 70, 77, 79 e Especificações) e C-100 Biz 2005.pdf (PDF págs. 46, 48, 54, 60, 62 e Especificações)',
          notas:
            'Auditado 100% nos Manuais C-100 Biz 2000 e 2005: 97,1 cm³ (8,8:1, 7,6 cv @ 8.000 rpm, 0,8 kgf·m @ 6.000 rpm); tanque 4,0 L; óleo SAE 20W-50 API-SF (0,7/0,9 L); válvulas 0,05 / 0,05 mm; vela NGK C6HSA (0,6–0,8 mm em 2000 / 0,6–0,7 mm em 2005); relação 15x35 (2,333), folga corrente 25–35 mm; bateria 12V 3Ah (2000) / 4Ah Delphi ou 3Ah Yuasa (2005); fusível 10A; farol 12V 30/30W; torques 25 / 4 / 49 / 49 / 22 N·m. Pendências que aguardam Manual de Serviço: giclagem do carburador, volume/nível de óleo da bengala e torques internos.',
        },
        fichaTecnica: {
          ...biz125Base,
          versaoReferencia: 'C100 Biz KS / ES',
          cilindradaCc: 97.1,
          alimentacao: 'carburador',
          combustivel: 'gasolina',
          partida: 'pedal-eletrica',
          freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'convencional' },
          pesoSecoKg: 93,
          motorDetalhes: {
            diametroCursoMm: { diametro: 50.0, curso: 49.5 },
            taxaCompressao: '8,8:1',
            potencia: '7,6 cv @ 8.000 rpm',
            torque: '0,8 kgf·m @ 6.000 rpm',
            marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
            comando: 'OHC horizontal (corrente de comando, 2 válvulas)',
            filtroOleo: 'Tela do filtro de óleo + filtro centrífugo',
            alimentacaoDetalhe:
              'Carburador (gasolina) • Giclagem e ajustes internos aguardam confirmação no Manual de Serviço',
          },
          fluidos: {
            oleoMotor: {
              especificacao: 'MOBIL SUPER MOTO 4T SAE 20W-50 API-SF (sem aditivos)',
              capacidadeTrocaL: 0.7,
              capacidadeTotalL: 0.9,
              observacao: '0,7 L após drenagem | 0,9 L após desmontagem (Manuais C-100 Biz 2000 e 2005)',
            },
            tanqueL: 4.0,
            reservaL: 0.8,
            fluidoFreio: 'Não utiliza (freios a tambor mecânico)',
          },
          folgas: {
            valvulaAdmissaoMm: faixaMm(0.05, 0.05, '0,05 mm (motor frio)'),
            valvulaEscapeMm: faixaMm(0.05, 0.05, '0,05 mm (motor frio)'),
            folgaCorrenteMm: faixaMm(25, 35, '25 – 35 mm'),
            folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
            folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
          },
          eletrica: {
            vela: {
              modelo: 'NGK C6HSA',
              folgaEletrodoMm: faixaMm(0.6, 0.8, '0,6 – 0,8 mm (2000) | 0,6 – 0,7 mm (2005)'),
            },
            bateria: {
              modelo: '12 V – 3 Ah (2000) | 12 V – 4 Ah Delphi / 3 Ah Yuasa (2005)',
              tensaoV: 12,
              capacidadeAh: 3,
              tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
            },
            fusivelPrincipalA: 10,
            lampadaFarol: '12 V – 30/30 W',
          },
          pneus: {
            dianteiro: { medida: '60/100 – 17M/C 33L', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Com câmara' },
            traseiro: { medida: '80/100 – 14M/C 49L', pressaoPsi: 29, pressaoComGarupaPsi: 33, tipo: 'Com câmara' },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428 (redução final 2,333 • nº exato de elos aguarda Manual de Serviço)',
            pinhaoDentes: 15,
            coroaDentes: 35,
          },
          torques: TORQUES_BIZ_C100,
        },
      }),
      geracao('honda-biz-100', {
        anoInicio: 2013,
        anoFim: 2015,
        nomeGeracao: 'Biz 100 KS / ES — Carburada',
        versoes: ['KS', 'ES'],
        destaques: [
          'Motor 97,1 cm³ OHC carburado (6,43 cv @ 7.000 rpm • 0,71 kgf·m @ 5.500 rpm)',
          'Folga de válvulas: Adm 0,10 mm / Esc 0,10 mm • Vela NGK CR6HSA (0,6 – 0,7 mm)',
          'Tanque 5,5 L (reserva 1,5 L) • Relação 14x34 (2,428) • Óleo SAE 10W-30 JASO MA (0,7 / 0,9 L)',
        ],
        alertasBancada: [
          'Folga de válvulas mudou em relação à antiga C100: na Biz 100 2013–2015 é Adm 0,10 mm / Esc 0,10 mm (motor frio)!',
          'Vela padrão: NGK CR6HSA com folga 0,6 – 0,7 mm • Farol 12 V – 30/30 W.',
          'Tanque ampliado para 5,5 L (reserva 1,5 L) • Bateria DTZ5 4 Ah (KS) / DTZ6 5 Ah (ES) • Fusíveis 15 A / 10 A.',
          'Torques oficiais: bujão de óleo 24 N·m, eixo dianteiro 49 N·m e eixo traseiro 49 N·m.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'Biz 100 2013.pdf e Biz 100 2015.pdf (seções de Manutenção e Especificações Técnicas)',
          notas:
            'Auditado 100% nos Manuais Biz 100 2013 e 2015: 97,1 cm³ (8,8:1, 6,43 cv @ 7.000 rpm, 0,71 kgf·m @ 5.500 rpm); tanque 5,5 L (reserva 1,5 L); óleo SAE 10W-30 API SJ/SL JASO MA (0,7/0,9 L); válvulas 0,10 / 0,10 mm; vela NGK CR6HSA (0,6–0,7 mm); redução final 2,428 (14x34); bateria DTZ5 4Ah (KS) / DTZ6 5Ah (ES); fusíveis 15A / 10A; farol 12V 30/30W; torques 24 / 49 / 49 N·m. Pendências que aguardam Manual de Serviço: giclagem do carburador, volume/nível de óleo da bengala e torques internos.',
        },
        fichaTecnica: {
          ...biz125Base,
          versaoReferencia: 'Biz 100 KS / ES',
          cilindradaCc: 97.1,
          alimentacao: 'carburador',
          combustivel: 'gasolina',
          partida: 'pedal-eletrica',
          freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'convencional' },
          pesoSecoKg: 98,
          motorDetalhes: {
            diametroCursoMm: { diametro: 50.0, curso: 49.5 },
            taxaCompressao: '8,8:1',
            potencia: '6,43 cv @ 7.000 rpm',
            torque: '0,71 kgf·m @ 5.500 rpm',
            marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
            comando: 'OHC horizontal (corrente de comando, 2 válvulas)',
            filtroOleo: 'Tela do filtro de óleo + filtro centrífugo',
            alimentacaoDetalhe:
              'Carburador (gasolina) • Giclagem e ajustes internos aguardam confirmação no Manual de Serviço',
          },
          fluidos: {
            oleoMotor: {
              especificacao: 'ÓLEO GENUÍNO HONDA SAE 10W-30 API SJ/SL JASO MA (sem aditivos)',
              capacidadeTrocaL: 0.7,
              capacidadeTotalL: 0.9,
              observacao: '0,7 L após drenagem | 0,9 L após desmontagem (Manuais Biz 100 2013 e 2015)',
            },
            tanqueL: 5.5,
            reservaL: 1.5,
            fluidoFreio: 'Não utiliza (freios a tambor mecânico)',
          },
          folgas: {
            valvulaAdmissaoMm: faixaMm(0.1, 0.1, '0,10 mm (motor frio)'),
            valvulaEscapeMm: faixaMm(0.1, 0.1, '0,10 mm (motor frio)'),
            folgaCorrenteMm: faixaMm(25, 35, '25 – 35 mm'),
            folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
            folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
          },
          eletrica: {
            vela: {
              modelo: 'NGK CR6HSA',
              folgaEletrodoMm: faixaMm(0.6, 0.7, '0,6 – 0,7 mm'),
            },
            bateria: {
              modelo: '12 V – 4 Ah / DTZ5 (KS) | 12 V – 5 Ah / DTZ6 (ES)',
              tensaoV: 12,
              capacidadeAh: 4,
              tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
            },
            fusivelPrincipalA: 15,
            fusiveisSecundarios: '10 A',
            lampadaFarol: '12 V – 30/30 W',
          },
          pneus: {
            dianteiro: { medida: '60/100 – 17M/C 33L', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Com câmara' },
            traseiro: { medida: '80/100 – 14M/C 49L', pressaoPsi: 29, pressaoComGarupaPsi: 33, tipo: 'Com câmara' },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428 (redução final 2,428 • nº exato de elos aguarda Manual de Serviço)',
            pinhaoDentes: 14,
            coroaDentes: 34,
          },
          torques: TORQUES_BIZ_MODERNA,
        },
      }),
    ],
  },
  {
    id: 'honda-biz-110i',
    marca: 'Honda',
    nome: 'Biz 110i',
    categoria: 'cub',
    aliases: ['Biz 110', 'Biz 110i', 'Biz110', 'Biz110i'],
    geracoes: [
      geracao('honda-biz-110i', {
        anoInicio: 2016,
        anoFim: 2024,
        nomeGeracao: 'Biz 110i — Injeção PGM-FI / Partida Elétrica',
        versoes: ['Standard (2016–2017)', 'CBS (2018–2024)'],
        destaques: [
          'Motor 109,1 cm³ OHC injetado (somente gasolina • 8,33 cv @ 7.250 rpm • 0,89 kgf·m @ 5.500 rpm)',
          'Folga de válvulas: Adm 0,10 mm / Esc 0,15 mm • Óleo SAE 10W-30 JASO MA (0,8 / 1,0 L)',
          'Corrente 106 elos (14x33, folga 30 – 40 mm) • Pneu traseiro 33 / 41 psi • Bateria 12 V – 4 Ah (DTZ5)',
        ],
        alertasBancada: [
          'Folga de válvulas oficial nos Manuais 2016 e 2024: Adm 0,10 mm / Esc 0,15 mm (motor frio).',
          'Motor exclusivamente a GASOLINA (não é Flex) • Tanque 5,1 L (reserva 1,4 L) • Óleo SAE 10W-30 API SJ/SL JASO MA (0,8 L drenagem / 1,0 L desmontagem).',
          'Transmissão final: corrente DID 428MX/428DX2 ou RK 428SB, 106 elos, pinhão 14 x coroa 33 (2,357), folga 30 – 40 mm.',
          'A partir de 2018 adotou freio combinado CBS mecânico; bateria 12 V – 4 Ah / DTZ5; fusíveis 15 A + 10 A (2016) / 1 A, 7,5 A x 2 (2024); torques 24 / 49 / 49 / 22 N·m.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'Biz 110i 2016.pdf e Biz 110i 2024.pdf (seções de Manutenção e Especificações Técnicas)',
          notas:
            'Auditado 100% nos Manuais Biz 110i 2016 e 2024: 109,1 cm³ (50,0x55,6 mm, 9,3:1, 8,33 cv @ 7.250 rpm, 0,89 kgf·m @ 5.500 rpm); tanque 5,1 L (reserva 1,4 L); óleo SAE 10W-30 SJ/SL JASO MA (0,8/1,0 L); válvulas 0,10 / 0,15 mm; vela NGK CPR6EA-9S (0,80–0,90 mm); corrente DID 428MX/428DX2 ou RK 428SB 106 elos 14x33 (folga 30–40 mm); pneu tras. 33 psi solo / 41 psi garupa; bateria 12V 4Ah DTZ5; fusíveis 15A + 10A (2016) / 1A, 7,5A x 2 (2024); torques 24 / 49 / 49 / 22 N·m. Pendências que aguardam Manual de Serviço: volume/nível de óleo da bengala, pressão da bomba PGM-FI e torques internos.',
        },
        fichaTecnica: {
          ...pop110Base,
          versaoReferencia: 'Biz 110i (CBS 2018+)',
          cilindradaCc: 109.1,
          alimentacao: 'injecao',
          combustivel: 'gasolina',
          partida: 'eletrica',
          cambio: { tipo: 'semiautomatico', marchas: 4 },
          freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'CBS' },
          pesoSecoKg: 97,
          motorDetalhes: {
            ...pop110Base.motorDetalhes,
            potencia: '8,33 cv @ 7.250 rpm',
            torque: '0,89 kgf·m @ 5.500 rpm',
            alimentacaoDetalhe:
              'Injeção eletrônica PGM-FI (somente gasolina) • Pressão da bomba de combustível: aguarda confirmação no Manual de Serviço',
          },
          fluidos: {
            ...pop110Base.fluidos,
            tanqueL: 5.1,
            reservaL: 1.4,
            fluidoFreio: 'Não utiliza (freios a tambor mecânico; CBS a partir de 2018)',
            fluidoBengala: undefined,
          },
          folgas: {
            valvulaAdmissaoMm: faixaMm(0.1, 0.1, '0,10 mm (motor frio)'),
            valvulaEscapeMm: faixaMm(0.15, 0.15, '0,15 mm (motor frio)'),
            folgaCorrenteMm: faixaMm(30, 40, '30 – 40 mm'),
            folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
            folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
          },
          eletrica: {
            ...pop110Base.eletrica,
            bateria: {
              modelo: '12 V – 4 Ah / DTZ5 (selada)',
              tensaoV: 12,
              capacidadeAh: 4,
              tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
            },
            fusiveisSecundarios: '10 A (2016) | 1 A, 7,5 A x 2 (2024)',
          },
          pneus: {
            dianteiro: { medida: '60/100 – 17M/C 33L', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Com câmara' },
            traseiro: {
              medida: '80/100 – 14M/C 49L',
              pressaoPsi: 33,
              pressaoComGarupaPsi: 41,
              tipo: 'Com câmara • 33 psi só piloto / 41 psi piloto + passageiro',
            },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: 'DID 428MX / 428DX2 ou RK 428SB — 106 elos',
            pinhaoDentes: 14,
            coroaDentes: 33,
          },
          torques: TORQUES_BIZ_MODERNA,
        },
      }),
    ],
  },
  {
    id: 'honda-nxr-125-bros',
    marca: 'Honda',
    nome: 'NXR 125 Bros',
    categoria: 'trail',
    aliases: ['Bros 125', 'NXR 125', 'NXR125', 'Bros125'],
    geracoes: [
      geracao('honda-nxr-125-bros', {
        anoInicio: 2003,
        anoFim: 2005,
        nomeGeracao: 'NXR 125 Bros KS / ES — Motor OHV Vareta, Carburada',
        versoes: ['KS', 'ES'],
        destaques: [
          'Motor 124 cm³ OHV comando por varetas (12,5 cv @ 8.500 rpm • 1,04 kgf·m @ 7.000 rpm)',
          'Folga de válvulas OHV: Adm 0,08 mm / Esc 0,08 mm • Vela NGK DPR8EA-9',
          'Bujão do filtro de tela 15 N·m • Eixos 44 N·m (diant.) / 93 N·m (tras.) • Relação 17x54 (3,176)',
        ],
        alertasBancada: [
          'Motor OHV (vareta 124 cm³, 56,5 x 49,5 mm, 9,5:1): folga de válvulas simétrica Adm 0,08 mm / Esc 0,08 mm e vela NGK DPR8EA-9 (0,80–0,90 mm).',
          'Óleo SAE 20W-50 API-SF: 0,9 L após drenagem / 1,1 L após desmontagem • Bujão do filtro de tela/drenagem: APENAS 15 N·m (1,5 kg·m)!',
          'Tanque 12,0 L com reserva de 3,5 L • Redução final 3,176 (54/17) com folga da corrente 20 – 30 mm • Bateria 12 V – 4 Ah • Fusíveis 15 A + 5 A, 10 A.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte:
            'NXR 125 Bros 2003.pdf e NXR 125 Bros 2005.pdf (PDF págs. 47, 53, 57, 58 e Especificações Técnicas)',
          notas:
            'Auditado 100% nos Manuais NXR 125 Bros 2003 e 2005: OHV 124 cm³ (56,5x49,5 mm, 9,5:1, 12,5 cv @ 8.500 rpm, 1,04 kgf·m @ 7.000 rpm); óleo SAE 20W-50 API-SF (0,9/1,1 L); tanque 12,0 L (reserva 3,5 L); válvulas 0,08 / 0,08 mm; vela NGK DPR8EA-9 (0,80–0,90 mm); redução final 3,176 (54/17), folga corrente 20–30 mm; bateria 12V 4Ah; fusíveis 15A + 5A, 10A; torques 15 / 44 / 93 N·m. Pendências que aguardam Manual de Serviço: giclagem do carburador, volume/nível de óleo da bengala, nº exato de elos da corrente e torques internos.',
        },
        fichaTecnica: {
          ...bros160Base,
          versaoReferencia: 'KS / ES (OHV)',
          cilindradaCc: 124.0,
          motor: MOTOR_OHV_2V,
          alimentacao: 'carburador',
          combustivel: 'gasolina',
          partida: 'pedal-eletrica',
          freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'convencional' },
          pesoSecoKg: 112,
          motorDetalhes: {
            diametroCursoMm: { diametro: 56.5, curso: 49.5 },
            taxaCompressao: '9,5:1',
            potencia: '12,5 cv @ 8.500 rpm',
            torque: '1,04 kgf·m @ 7.000 rpm',
            marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
            comando: 'OHV (comando por varetas, 2 válvulas)',
            filtroOleo: 'Tela do filtro de óleo (bujão 15 N·m) + filtro centrífugo',
            alimentacaoDetalhe:
              'Carburador (gasolina) • Giclagem e ajustes internos aguardam confirmação no Manual de Serviço',
          },
          fluidos: {
            oleoMotor: {
              especificacao: 'MOBIL SUPER MOTO 4T SAE 20W-50 API-SF (sem aditivos)',
              capacidadeTrocaL: 0.9,
              capacidadeTotalL: 1.1,
              observacao: '0,9 L após drenagem | 1,1 L após desmontagem (Manuais NXR 125 Bros 2003 e 2005)',
            },
            tanqueL: 12.0,
            reservaL: 3.5,
            fluidoFreio: 'Não utiliza (freios a tambor mecânico)',
          },
          folgas: {
            valvulaAdmissaoMm: faixaMm(0.08, 0.08, '0,08 mm (motor frio)'),
            valvulaEscapeMm: faixaMm(0.08, 0.08, '0,08 mm (motor frio)'),
            folgaCorrenteMm: faixaMm(20, 30, '20 – 30 mm'),
            folgaManeteEmbreagemMm: faixaMm(10, 20, '10 – 20 mm'),
            folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
            folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
          },
          eletrica: {
            vela: {
              modelo: 'NGK DPR8EA-9',
              folgaEletrodoMm: faixaMm(0.8, 0.9, '0,80 – 0,90 mm'),
            },
            bateria: {
              modelo: '12 V – 4 Ah',
              tensaoV: 12,
              capacidadeAh: 4,
              tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
            },
            fusivelPrincipalA: 15,
            fusiveisSecundarios: '5 A, 10 A',
            lampadaFarol: '12 V – 35/35 W',
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428 (redução final 3,176 • nº exato de elos aguarda Manual de Serviço)',
            pinhaoDentes: 17,
            coroaDentes: 54,
          },
          torques: TORQUES_BROS_OHV_2005,
        },
      }),
      geracao('honda-nxr-125-bros', {
        anoInicio: 2013,
        anoFim: 2015,
        nomeGeracao: 'NXR 125 Bros KS / ES — Motor OHC Corrente, Carburada',
        versoes: ['KS', 'ES'],
        destaques: [
          'Motor 124,8 cm³ OHC com corrente de comando (11,6 cv @ 8.000 rpm • 1,06 kgf·m @ 6.500 rpm)',
          'Folga de válvulas OHC: Adm 0,08 mm / Esc 0,12 mm • Vela NGK CPR8EA-9 (opc. CPR9EA-9)',
          'Óleo SAE 10W-30 JASO MA (1,0 / 1,2 L) • Bujão 30 N·m • Eixos 44 N·m / 93 N·m',
        ],
        alertasBancada: [
          'Motor OHC 124,8 cm³ (52,4 x 57,88 mm, 9,2:1): folga de válvulas Adm 0,08 mm / Esc 0,12 mm (motor frio) e vela NGK CPR8EA-9 (opcional CPR9EA-9).',
          'Óleo SAE 10W-30 API SJ/SL JASO MA: 1,0 L após drenagem / 1,2 L após desmontagem • Bujão de drenagem: 30 N·m (3,1 kgf·m).',
          'Tanque 12,0 L com reserva de 3,0 L • Bateria: 5 Ah (ES) / 4 Ah (KS) em 2013 e unificada em 4 Ah em 2015 • Farol 12 V – 32/32 W.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'NXR 125 Bros 2013.pdf e NXR 125 Bros 2015.pdf (seções de Manutenção e Especificações Técnicas)',
          notas:
            'Auditado 100% nos Manuais NXR 125 Bros 2013 e 2015: OHC 124,8 cm³ (52,4x57,88 mm, 9,2:1, 11,6 cv @ 8.000 rpm, 1,06 kgf·m @ 6.500 rpm); óleo SAE 10W-30 JASO MA (1,0/1,2 L); tanque 12,0 L (reserva 3,0 L); válvulas 0,08 / 0,12 mm; vela NGK CPR8EA-9 / CPR9EA-9 (0,80–0,90 mm); redução final 3,187; bateria 5Ah (ES)/4Ah (KS) em 2013 e 4Ah em 2015; farol 12V 32/32W; torques 30 / 44 / 93 N·m. Pendências que aguardam Manual de Serviço: giclagem do carburador, volume/nível de óleo da bengala, nº exato de elos da corrente e torques internos.',
        },
        fichaTecnica: {
          ...bros160Base,
          versaoReferencia: 'KS / ES (OHC)',
          cilindradaCc: 124.8,
          motor: MOTOR_OHC_2V,
          alimentacao: 'carburador',
          combustivel: 'gasolina',
          partida: 'pedal-eletrica',
          freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'convencional' },
          pesoSecoKg: 114,
          motorDetalhes: {
            diametroCursoMm: { diametro: 52.4, curso: 57.88 },
            taxaCompressao: '9,2:1',
            potencia: '11,6 cv @ 8.000 rpm',
            torque: '1,06 kgf·m @ 6.500 rpm',
            marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
            comando: 'OHC (corrente de comando, 2 válvulas)',
            filtroOleo: 'Filtro centrífugo + tela do filtro de óleo (limpar a cada 12.000 km)',
            alimentacaoDetalhe:
              'Carburador (gasolina) • Giclagem e ajustes internos aguardam confirmação no Manual de Serviço',
          },
          fluidos: {
            oleoMotor: {
              especificacao: 'ÓLEO GENUÍNO HONDA SAE 10W-30 API SJ/SL JASO MA (sem aditivos)',
              capacidadeTrocaL: 1.0,
              capacidadeTotalL: 1.2,
              observacao: '1,0 L após drenagem | 1,2 L após desmontagem (Manuais NXR 125 Bros 2013 e 2015)',
            },
            tanqueL: 12.0,
            reservaL: 3.0,
            fluidoFreio: 'Não utiliza (freios a tambor mecânico)',
          },
          folgas: {
            valvulaAdmissaoMm: faixaMm(0.08, 0.08, '0,08 mm (motor frio)'),
            valvulaEscapeMm: faixaMm(0.12, 0.12, '0,12 mm (motor frio)'),
            folgaCorrenteMm: faixaMm(20, 30, '20 – 30 mm'),
            folgaManeteEmbreagemMm: faixaMm(10, 20, '10 – 20 mm'),
            folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
            folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
          },
          eletrica: {
            vela: {
              modelo: 'NGK CPR8EA-9',
              alternativas: ['NGK CPR9EA-9 (Opcional)'],
              folgaEletrodoMm: faixaMm(0.8, 0.9, '0,80 – 0,90 mm'),
            },
            bateria: {
              modelo: '12 V – 5 Ah (ES 2013) | 12 V – 4 Ah (KS 2013 e KS/ES 2015)',
              tensaoV: 12,
              capacidadeAh: 4,
              tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
            },
            fusivelPrincipalA: 15,
            fusiveisSecundarios: '10 A',
            lampadaFarol: '12 V – 32/32 W',
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428 (redução final 3,187 • nº exato de elos aguarda Manual de Serviço)',
            pinhaoDentes: 16,
            coroaDentes: 51,
          },
          torques: TORQUES_BROS_OHC_XRE190,
        },
      }),
    ],
  },
  {
    id: 'honda-nxr-150-bros',
    marca: 'Honda',
    nome: 'NXR 150 Bros',
    categoria: 'trail',
    aliases: ['Bros 150', 'NXR 150', 'NXR150', 'Bros150'],
    geracoes: [
      geracao('honda-nxr-150-bros', {
        anoInicio: 2003,
        anoFim: 2008,
        nomeGeracao: 'NXR 150 Bros KS / ES / ESD — Carburada',
        versoes: ['KS', 'ES', 'ESD'],
        destaques: [
          '2003–2005: Motor OHC 156,7 cm³ (63,5x49,5 mm, válvulas 0,10/0,10 mm, vela DPR8EA-9, bujão 15 N·m)',
          '2006–2008: Motor OHC 149,2 cm³ (57,3x57,8 mm, válvulas 0,08/0,12 mm, vela CPR8EA-9, bujão 29 N·m)',
          'Torques de eixos: 44 N·m (dianteiro) / 93 N·m (traseiro) em toda a geração',
        ],
        alertasBancada: [
          'CORREÇÃO TÉCNICA CRÍTICA (Manual NXR 150 Bros 2005): a Bros 150 2003–2005 NÃO é OHV vareta — é motor OHC 156,7 cm³ (63,5 x 49,5 mm, 9,0:1, 13,5 cv @ 7.500 rpm, 1,26 kgf·m @ 6.000 rpm) com válvulas Adm 0,10 mm / Esc 0,10 mm, vela NGK DPR8EA-9, bujão do filtro de tela 15 N·m e redução final 2,941 (50/17)!',
          'A partir de 2006–2008 (Manual NXR 150 Bros 2008): entrou o motor OHC 149,2 cm³ (57,3 x 57,8 mm, 9,5:1, 14,0 cv @ 8.000 rpm, 1,36 kgf·m @ 6.000 rpm) com válvulas Adm 0,08 mm / Esc 0,12 mm, vela NGK CPR8EA-9 (opc. CPR9EA-9), bujão de drenagem 29 N·m (3,0 kgf·m) e redução final 2,882 (49/17).',
          'Sempre identificar o motor (156,7 cm³ 2003–2005 vs 149,2 cm³ 2006–2008) antes de regular válvulas, escolher a vela ou aplicar torque no bujão de óleo!',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte:
            'NXR 150 Bros 2005.pdf (PDF págs. 47, 53, 57, 58 e Especificações) e NXR 150 Bros 2008.pdf (seções de Manutenção e Especificações Técnicas)',
          notas:
            'Auditado 100% nos Manuais NXR 150 Bros 2005 e 2008: 2003–2005 (OHC 156,7 cm³, 63,5x49,5 mm, 9,0:1, 13,5 cv, 1,26 kgf·m, válvulas 0,10/0,10 mm, vela NGK DPR8EA-9, bujão 15 N·m, relação 17x50 = 2,941) vs 2006–2008 (OHC 149,2 cm³, 57,3x57,8 mm, 9,5:1, 14,0 cv, 1,36 kgf·m, válvulas 0,08/0,12 mm, vela NGK CPR8EA-9/CPR9EA-9, bujão 29 N·m, relação 17x49 = 2,882); eixos 44 / 93 N·m em ambos. Pendências que aguardam Manual de Serviço: giclagem do carburador, volume/nível de óleo da bengala, nº exato de elos da corrente e torques internos.',
        },
        fichaTecnica: {
          ...bros160Base,
          versaoReferencia: 'KS / ES / ESD (2003–2005 156,7cc • 2006–2008 149,2cc)',
          cilindradaCc: 149.2,
          motor: 'Monocilíndrico 4T OHC 2 válvulas (156,7 cm³ em 2003–2005 | 149,2 cm³ em 2006–2008)',
          alimentacao: 'carburador',
          combustivel: 'gasolina',
          partida: 'pedal-eletrica',
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'convencional' },
          pesoSecoKg: 118,
          motorDetalhes: {
            diametroCursoMm: { diametro: 57.3, curso: 57.8 },
            taxaCompressao: '9,0:1 (2003–2005) | 9,5:1 (2006–2008)',
            potencia: '13,5 cv @ 7.500 rpm (2003–2005) | 14,0 cv @ 8.000 rpm (2006–2008)',
            torque: '1,26 kgf·m @ 6.000 rpm (2003–2005) | 1,36 kgf·m @ 6.000 rpm (2006–2008)',
            marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
            comando: 'OHC (corrente de comando — 156,7 cm³ em 2003–2005 | 149,2 cm³ em 2006–2008)',
            filtroOleo: 'Tela do filtro de óleo + filtro centrífugo (bujão 15 N·m em 2003–2005 | 29 N·m em 2006–2008)',
            alimentacaoDetalhe:
              'Carburador (gasolina) • Giclagem e ajustes internos aguardam confirmação no Manual de Serviço',
          },
          fluidos: {
            oleoMotor: {
              especificacao: 'MOBIL SUPER MOTO 4T SAE 20W-50 API-SF (sem aditivos)',
              capacidadeTrocaL: 1.0,
              capacidadeTotalL: 1.2,
              observacao: '1,0 L após drenagem | 1,2 L após desmontagem (Manuais NXR 150 Bros 2005 e 2008)',
            },
            tanqueL: 12.0,
            reservaL: 2.0,
            fluidoFreio: 'DOT 3 ou DOT 4 (disco dianteiro na ESD) | Tambor nas KS e ES',
          },
          folgas: {
            valvulaAdmissaoMm: faixaMm(0.08, 0.1, '0,10 mm (2003–2005) | 0,08 mm (2006–2008) — motor frio'),
            valvulaEscapeMm: faixaMm(0.1, 0.12, '0,10 mm (2003–2005) | 0,12 mm (2006–2008) — motor frio'),
            folgaCorrenteMm: faixaMm(20, 30, '20 – 30 mm'),
            folgaManeteEmbreagemMm: faixaMm(10, 20, '10 – 20 mm'),
            folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
            folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
          },
          eletrica: {
            vela: {
              modelo: 'NGK DPR8EA-9 (2003–2005) | NGK CPR8EA-9 (2006–2008)',
              alternativas: ['NGK CPR9EA-9 (Opcional 2006–2008)'],
              folgaEletrodoMm: faixaMm(0.8, 0.9, '0,80 – 0,90 mm'),
            },
            bateria: {
              modelo: '12 V – 4 Ah (KS) | 12 V – 5 Ah / 6 Ah (ES/ESD)',
              tensaoV: 12,
              capacidadeAh: 5,
              tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
            },
            fusivelPrincipalA: 15,
            fusiveisSecundarios: '10 A',
            lampadaFarol: '12 V – 35/35 W',
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428 (redução final 2,941 [50/17] em 2003–2005 | 2,882 [49/17] em 2006–2008)',
            pinhaoDentes: 17,
            coroaDentes: 49,
          },
          torques: TORQUES_BROS_OHC_XRE190,
        },
      }),
      geracao('honda-nxr-150-bros', {
        anoInicio: 2009,
        anoFim: 2014,
        nomeGeracao: 'NXR 150 Bros Mix / Flex — Injeção PGM-FI',
        versoes: ['KS', 'ES', 'ESD'],
        destaques: [
          'Motor 149,2 cm³ OHC PGM-FI Mix/Flex (13,8 cv G / 14,0 cv E @ 8.000 rpm • 1,39 / 1,53 kgf·m @ 6.000 rpm)',
          'Folga de válvulas: Adm 0,08 mm / Esc 0,12 mm • Vela NGK CPR8EA-9 (opc. CPR9EA-9)',
          'Tanque 12,0 L (reserva 3,0 L) • Relação 17x49 (2,882) • Torques 30 / 44 / 93 N·m',
        ],
        alertasBancada: [
          'Transição de óleo na geração: SAE 20W-50 API-SF (2009–2010) → Óleo Genuíno Honda SAE 10W-30 API SJ/SL JASO MA (2011–2014), sempre 1,0 L drenagem / 1,2 L desmontagem.',
          'Folga de válvulas (motor frio): Adm 0,08 mm / Esc 0,12 mm • Vela NGK CPR8EA-9 (opcional CPR9EA-9), folga 0,80–0,90 mm.',
          'Diferença de farol entre manuais: 12 V – 32/32 W (Manual 2009) e 12 V – 35/35 W (Manual 2013); reserva do tanque: 3,0 L; torques: bujão 30 N·m, eixo dianteiro 44 N·m, eixo traseiro 93 N·m.',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'NXR 150 Bros 2009.pdf e NXR 150 Bros 2013.pdf (seções de Manutenção e Especificações Técnicas)',
          notas:
            'Auditado 100% nos Manuais NXR 150 Bros 2009 e 2013: 149,2 cm³ (13,8 cv G / 14,0 cv E @ 8.000 rpm; 1,39 / 1,53 kgf·m @ 6.000 rpm); tanque 12,0 L (reserva 3,0 L); óleo 1,0/1,2 L; válvulas 0,08 / 0,12 mm; vela NGK CPR8EA-9 / CPR9EA-9 (0,80–0,90 mm); redução final 2,882 (49/17); farol 32/32W (2009) / 35/35W (2013); torques 30 / 44 / 93 N·m. Pendências que aguardam Manual de Serviço: pressão da bomba PGM-FI, volume/nível de óleo da bengala, nº exato de elos da corrente e torques internos.',
        },
        fichaTecnica: {
          ...bros160Base,
          versaoReferencia: 'Mix / Flex ESD',
          cilindradaCc: 149.2,
          motor: MOTOR_OHC_2V,
          alimentacao: 'injecao',
          combustivel: 'flex',
          partida: 'pedal-eletrica',
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'convencional' },
          pesoSecoKg: 119,
          motorDetalhes: {
            diametroCursoMm: { diametro: 57.3, curso: 57.84 },
            taxaCompressao: '9,5:1',
            potencia: '13,8 cv (gasolina) / 14,0 cv (etanol) @ 8.000 rpm',
            torque: '1,39 kgf·m (gasolina) / 1,53 kgf·m (etanol) @ 6.000 rpm',
            marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
            comando: 'OHC (corrente de comando, 2 válvulas)',
            filtroOleo: 'Filtro centrífugo + tela do filtro de óleo (limpar a cada 12.000 km)',
            alimentacaoDetalhe:
              'Injeção eletrônica PGM-FI Mix / Flex • Pressão da bomba de combustível: aguarda confirmação no Manual de Serviço',
          },
          fluidos: {
            oleoMotor: {
              especificacao: '2009–2010: SAE 20W-50 API-SF | 2011–2014: ÓLEO GENUÍNO HONDA SAE 10W-30 API SJ/SL JASO MA (sem aditivos)',
              capacidadeTrocaL: 1.0,
              capacidadeTotalL: 1.2,
              observacao: '1,0 L após drenagem | 1,2 L após desmontagem (Manuais NXR 150 Bros 2009 e 2013)',
            },
            tanqueL: 12.0,
            reservaL: 3.0,
            fluidoFreio: 'DOT 4 (disco dianteiro na ESD) | Tambor nas KS e ES',
          },
          folgas: {
            valvulaAdmissaoMm: faixaMm(0.08, 0.08, '0,08 mm (motor frio)'),
            valvulaEscapeMm: faixaMm(0.12, 0.12, '0,12 mm (motor frio)'),
            folgaCorrenteMm: faixaMm(20, 30, '20 – 30 mm'),
            folgaManeteEmbreagemMm: faixaMm(10, 20, '10 – 20 mm'),
            folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
            folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
          },
          eletrica: {
            vela: {
              modelo: 'NGK CPR8EA-9',
              alternativas: ['NGK CPR9EA-9 (Opcional)'],
              folgaEletrodoMm: faixaMm(0.8, 0.9, '0,80 – 0,90 mm'),
            },
            bateria: {
              modelo: '12 V – 5 Ah (ES/ESD) | 12 V – 4 Ah (KS)',
              tensaoV: 12,
              capacidadeAh: 5,
              tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
            },
            fusivelPrincipalA: 15,
            fusiveisSecundarios: '10 A',
            lampadaFarol: '12 V – 32/32 W (2009) | 12 V – 35/35 W (2013)',
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428 (redução final 2,882 • nº exato de elos aguarda Manual de Serviço)',
            pinhaoDentes: 17,
            coroaDentes: 49,
          },
          torques: TORQUES_BROS_OHC_XRE190,
        },
      }),
    ],
  },
  {
    id: 'honda-pop-100',
    marca: 'Honda',
    nome: 'Pop 100',
    categoria: 'cub',
    aliases: ['Pop 100', 'Pop100', 'Pop'],
    geracoes: [
      geracao('honda-pop-100', {
        anoInicio: 2007,
        anoFim: 2015,
        nomeGeracao: 'Pop 100 — Carburada / Partida a Pedal',
        versoes: ['Standard'],
        destaques: [
          'Motor 97,1 cm³ OHC horizontal carburado • Câmbio MANUAL 4 marchas com manete de embreagem',
          'Folga de válvulas: Adm 0,10 mm / Esc 0,10 mm • Vela NGK C7HSA (0,60 – 0,70 mm)',
          'Relação 14x35 (2,500) • Óleo 0,7 / 0,9 L • Torques 24 / 54 / 54 / 22 N·m',
        ],
        alertasBancada: [
          'Folga de válvulas confirmada nos Manuais Pop 100 2007 e 2015: Adm 0,10 mm / Esc 0,10 mm (motor frio) — diferente dos 0,05 mm da C100 Biz!',
          'Vela oficial em toda a geração: NGK C7HSA com folga 0,60 – 0,70 mm • Farol 12 V – 32/32 W • Fusível 10 A • Bateria 12 V – 4 Ah (DTZ5).',
          'Diferenças entre 2007 e 2015: 6,5 cv @ 8.000 rpm / 0,72 kgf·m @ 5.000 rpm / reserva 0,8 L / óleo 20W-50 (2007) vs 6,17 cv @ 7.500 rpm / 0,74 kgf·m @ 4.000 rpm / reserva 1,1 L / óleo 10W-30 JASO MA (2015).',
          'Torques oficiais: bujão de drenagem 24 N·m, eixo dianteiro 54 N·m, eixo traseiro 54 N·m e braço limitador do freio traseiro 22 N·m (2015).',
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte: 'Pop 100 2007.pdf e Pop 100 2015.pdf (PDF pág. 58 e seções de Especificações Técnicas)',
          notas:
            'Auditado 100% nos Manuais Pop 100 2007 e 2015: 97,1 cm³ (8,8:1); 6,5 cv @ 8.000 rpm / 0,72 kgf·m @ 5.000 rpm (2007) e 6,17 cv @ 7.500 rpm / 0,74 kgf·m @ 4.000 rpm (2015); tanque 4,0 L (reserva 0,8 L em 2007 / 1,1 L em 2015); óleo 0,7/0,9 L; válvulas 0,10 / 0,10 mm; vela NGK C7HSA (0,60–0,70 mm); redução final 2,500 (35/14); bateria 12V 4Ah (DTZ5); fusível 10A; farol 12V 32/32W; torques 24 / 54 / 54 / 22 N·m. Pendências que aguardam Manual de Serviço: giclagem do carburador, volume/nível de óleo da bengala, nº exato de elos da corrente e torques internos.',
        },
        fichaTecnica: {
          ...pop110Base,
          versaoReferencia: 'Pop 100',
          cilindradaCc: 97.1,
          motor: MOTOR_OHC_2V,
          alimentacao: 'carburador',
          combustivel: 'gasolina',
          arrefecimento: 'ar',
          partida: 'pedal',
          cambio: { tipo: 'manual', marchas: 4 },
          freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'convencional' },
          pesoSecoKg: 85,
          motorDetalhes: {
            diametroCursoMm: { diametro: 50.0, curso: 49.5 },
            taxaCompressao: '8,8:1',
            potencia: '6,5 cv @ 8.000 rpm (2007) | 6,17 cv @ 7.500 rpm (2015)',
            torque: '0,72 kgf·m @ 5.000 rpm (2007) | 0,74 kgf·m @ 4.000 rpm (2015)',
            marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
            comando: 'OHC horizontal (corrente de comando, 2 válvulas)',
            filtroOleo: 'Tela do filtro de óleo + filtro centrífugo',
            alimentacaoDetalhe:
              'Carburador (gasolina) • Giclagem e ajustes internos aguardam confirmação no Manual de Serviço',
          },
          fluidos: {
            oleoMotor: {
              especificacao: '2007–2010: SAE 20W-50 API-SF | 2011–2015: ÓLEO GENUÍNO HONDA SAE 10W-30 API SJ/SL JASO MA (sem aditivos)',
              capacidadeTrocaL: 0.7,
              capacidadeTotalL: 0.9,
              observacao: '0,7 L após drenagem | 0,9 L após desmontagem (Manuais Pop 100 2007 e 2015)',
            },
            tanqueL: 4.0,
            reservaL: 1.1,
            fluidoFreio: 'Não utiliza (freios a tambor mecânico)',
          },
          folgas: {
            valvulaAdmissaoMm: faixaMm(0.1, 0.1, '0,10 mm (motor frio)'),
            valvulaEscapeMm: faixaMm(0.1, 0.1, '0,10 mm (motor frio)'),
            folgaCorrenteMm: faixaMm(20, 30, '20 – 30 mm'),
            folgaManeteEmbreagemMm: faixaMm(10, 20, '10 – 20 mm'),
            folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
            folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
          },
          eletrica: {
            vela: {
              modelo: 'NGK C7HSA',
              folgaEletrodoMm: faixaMm(0.6, 0.7, '0,60 – 0,70 mm'),
            },
            bateria: {
              modelo: '12 V – 4 Ah / DTZ5',
              tensaoV: 12,
              capacidadeAh: 4,
              tensaoCargaV: 'Sistema de carga 12 V (tensão de carga detalhada aguarda Manual de Serviço)',
            },
            fusivelPrincipalA: 10,
            lampadaFarol: '12 V – 32/32 W',
          },
          pneus: {
            dianteiro: { medida: '60/100 – 17M/C 33L', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Com câmara' },
            traseiro: { medida: '80/100 – 14M/C 49L', pressaoPsi: 29, pressaoComGarupaPsi: 36, tipo: 'Com câmara' },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428 (redução final 2,500 [35/14] • nº exato de elos aguarda Manual de Serviço)',
            pinhaoDentes: 14,
            coroaDentes: 35,
          },
          torques: TORQUES_POP_100_110,
        },
      }),
    ],
  },
];
