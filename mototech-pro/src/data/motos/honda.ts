import { faixaMm, faixaRpm, geracao, torque } from '@/data/motos/helpers';
import type { FichaTecnica, Modelo, TorqueAperto } from '@/types/moto';

const MOTOR_OHC_2V = 'Monocilíndrico 4T OHC 2 válvulas';
const MOTOR_OHV_2V = 'Monocilíndrico 4T OHV 2 válvulas (comando por varetas)';

// ---------------------------------------------------------------------------
// Tabelas de Torque Padrão Honda (Manuais de Serviço)
// ---------------------------------------------------------------------------

const TORQUES_CG160_BROS_XRE: TorqueAperto[] = [
  torque('Bujão de drenagem do óleo do motor', 24, 'motor', 'Substituir arruela de vedação de alumínio (12 mm)'),
  torque('Vela de ignição (NGK CPR8EA-9)', 16, 'motor', 'Rosca M10 — encostar à mão antes de torquear'),
  torque('Parafusos da tampa do cabeçote (válvulas)', 10, 'motor', 'Apertar cruzado; conferir coxim de borracha'),
  torque('Porca de trava do parafuso regulador de válvula', 14, 'motor', 'Segurar o regulador com chave quadrada'),
  torque('Parafusos da tampa do filtro centrífugo', 12, 'motor', 'Usar junta nova ou verificar integridade'),
  torque('Porca castelo do rotor do filtro centrífugo', 64, 'motor', 'Usar chave castelo especial e travar arruela'),
  torque('Porca do eixo dianteiro', 59, 'chassi'),
  torque('Porca do eixo traseiro', 88, 'chassi', 'Conferir alinhamento da corrente nas marcações da balança'),
  torque('Porcas da coroa de transmissão', 64, 'chassi', 'Apertar em cruz'),
  torque('Parafusos de fixação da pinça de freio dianteira', 30, 'freios', 'Aplicar trava-rosca médio (Loctite 243)'),
  torque('Porca da coluna de direção (mesa superior)', 74, 'suspensao'),
  torque('Parafusos das mesas da suspensão (inferior / superior)', 32, 'suspensao'),
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

const TORQUES_CUB_BIZ_POP: TorqueAperto[] = [
  torque('Bujão de drenagem do óleo do motor', 24, 'motor', 'Arruela de vedação 12 mm'),
  torque('Vela de ignição', 16, 'motor'),
  torque('Parafusos da tampa de válvulas', 10, 'motor'),
  torque('Contratuerca de regulagem de válvula', 9, 'motor', 'Rosca fina — cuidado para não espanar'),
  torque('Contratuerca de ajuste da embreagem centrífuga', 12, 'motor'),
  torque('Porca do eixo dianteiro', 59, 'chassi'),
  torque('Porca do eixo traseiro', 59, 'chassi'),
  torque('Porcas da coroa traseira', 32, 'chassi'),
];

const TORQUES_PCX: TorqueAperto[] = [
  torque('Bujão de drenagem do óleo do motor', 24, 'motor', 'Arruela de alumínio 12 mm'),
  torque('Tampa da tela filtrante de óleo (bujão lateral)', 20, 'motor', 'Conferir O-ring de vedação'),
  torque('Parafusos de dreno/nível do óleo de transmissão final', 12, 'motor', 'Usar arruela de vedação 8 mm nova'),
  torque('Vela de ignição', 16, 'motor'),
  torque('Porca da polia primária do CVT (variador)', 59, 'motor', 'Travar variador com ferramenta especial'),
  torque('Porca do tambor da embreagem CVT (polia secundária)', 49, 'motor'),
  torque('Porca do eixo dianteiro', 59, 'chassi'),
  torque('Porca do eixo da roda traseira', 118, 'chassi', 'Torque alto — aplicar com freio traseiro acionado'),
  torque('Parafusos da pinça de freio dianteira', 30, 'freios', 'Trava-rosca médio'),
];

// ---------------------------------------------------------------------------
// Bases de Ficha Técnica
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
  pesoSecoKg: 117,
  motorDetalhes: {
    diametroCursoMm: { diametro: 57.3, curso: 63.09 },
    taxaCompressao: '9,5:1',
    potencia: '14,9 cv (gasolina) / 15,1 cv (etanol) @ 8.000 rpm',
    torque: '1,40 kgf·m (G) / 1,54 kgf·m (E) @ 7.000 rpm',
    marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
    comando: 'OHC (corrente de comando com acionador catracado)',
    filtroOleo: 'Filtro centrífugo no virabrequim + tela metálica (limpar a cada 12.000 km)',
    alimentacaoDetalhe: 'Injeção PGM-FI • Pressão da bomba de combustível: 2,9 – 3,0 bar (294 kPa / 43 psi)',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'SAE 10W-30 Semissintético (API SL / JASO MA)',
      capacidadeTrocaL: 1.0,
      capacidadeTotalL: 1.2,
      observacao: '1,0 L na troca periódica | 1,2 L após abertura da tampa direita/limpeza do centrífugo',
    },
    tanqueL: 16.1,
    reservaL: 3.1,
    fluidoFreio: 'DOT 4 (Disco na Titan/Fan; Tambor mecânico na Start)',
    fluidoBengala: {
      especificacao: 'Fluido ATF / Honda Ultra Cushion Oil 10W',
      volumePorCanelaMl: 138,
      nivelMm: 155,
      observacao: '138 ml por canela (2016–2017) | 142 ml por canela a partir de 2018',
    },
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.06, 0.1, '0,08 ± 0,02 mm'),
    valvulaEscapeMm: faixaMm(0.22, 0.26, '0,24 ± 0,02 mm'),
    folgaCorrenteMm: faixaMm(25, 35, '25 – 35 mm'),
    folgaManeteEmbreagemMm: faixaMm(10, 20, '10 – 20 mm'),
    folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
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
      tensaoCargaV: '13,5V – 14,8V @ 5.000 rpm',
    },
    fusivelPrincipalA: 20,
    fusiveisSecundarios: '10A (injeção, ignição, iluminação)',
    lampadaFarol: 'H4 12V 35/35W (halógena)',
  },
  pneus: {
    dianteiro: { medida: '80/100-18 M/C 47P', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Sem câmara (Titan/Fan)' },
    traseiro: { medida: '100/80-18 M/C 59P', pressaoPsi: 29, pressaoComGarupaPsi: 33, tipo: '90/90-18 na Start/Fan' },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: '428H x 118L (sem retentor de fábrica)',
    pinhaoDentes: 15,
    coroaDentes: 44,
  },
  torques: TORQUES_CG160_BROS_XRE,
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
  versaoReferencia: 'ESDD',
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
    torque: '1,46 kgf·m (G) / 1,60 kgf·m (E) @ 5.500 rpm',
    marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
    comando: 'OHC (corrente de comando)',
    filtroOleo: 'Filtro centrífugo + tela metálica (limpeza a cada 12.000 km)',
    alimentacaoDetalhe: 'Injeção PGM-FI • Pressão da bomba de combustível: 2,9 – 3,0 bar (294 kPa)',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'SAE 10W-30 Semissintético (API SL / JASO MA)',
      capacidadeTrocaL: 1.0,
      capacidadeTotalL: 1.2,
      observacao: '1,0 L na troca simples | 1,2 L com abertura da tampa direita',
    },
    tanqueL: 12.0,
    reservaL: 2.3,
    fluidoFreio: 'DOT 4 (disco dianteiro 240 mm + disco traseiro 220 mm)',
    fluidoBengala: {
      especificacao: 'Fluido ATF / Fork Oil 10W',
      volumePorCanelaMl: 190,
      nivelMm: 165,
      observacao: 'Suspensão de longo curso (180 mm) — 190 ml por canela',
    },
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.06, 0.1, '0,08 ± 0,02 mm'),
    valvulaEscapeMm: faixaMm(0.22, 0.26, '0,24 ± 0,02 mm'),
    folgaCorrenteMm: faixaMm(30, 40, '30 – 40 mm'),
    folgaManeteEmbreagemMm: faixaMm(10, 20, '10 – 20 mm'),
    folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
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
      tensaoCargaV: '13,5V – 14,8V @ 5.000 rpm',
    },
    fusivelPrincipalA: 20,
    fusiveisSecundarios: '10A (sistema PGM-FI e iluminação)',
    lampadaFarol: 'HS1 12V 35/35W',
  },
  pneus: {
    dianteiro: { medida: '90/90-19 M/C 52P', pressaoPsi: 22, pressaoComGarupaPsi: 22, tipo: 'Uso misto (com câmara)' },
    traseiro: { medida: '110/90-17 M/C 60P', pressaoPsi: 22, pressaoComGarupaPsi: 25, tipo: 'Uso misto (com câmara)' },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: '428H x 132L',
    pinhaoDentes: 16,
    coroaDentes: 48,
  },
  torques: TORQUES_CG160_BROS_XRE,
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
    torque: '1,65 kgf·m (G) / 1,66 kgf·m (E) @ 6.000 rpm',
    marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
    comando: 'OHC (corrente de comando — compartilha base inferior da 160 com cilindro 61 mm)',
    filtroOleo: 'Filtro centrífugo + tela metálica (limpeza a cada 12.000 km)',
    alimentacaoDetalhe: 'Injeção PGM-FI • Pressão da bomba de combustível: 2,9 – 3,0 bar (294 kPa)',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'SAE 10W-30 Semissintético (API SL / JASO MA)',
      capacidadeTrocaL: 1.0,
      capacidadeTotalL: 1.2,
      observacao: 'Monitorar nível a cada 1.000 km em uso rodoviário constante',
    },
    tanqueL: 13.5,
    reservaL: 3.1,
    fluidoFreio: 'DOT 4 (ABS de 1 canal na roda dianteira + disco traseiro)',
    fluidoBengala: {
      especificacao: 'Fluido ATF / Fork Oil 10W',
      volumePorCanelaMl: 190,
      nivelMm: 164,
    },
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.06, 0.1, '0,08 ± 0,02 mm'),
    valvulaEscapeMm: faixaMm(0.22, 0.26, '0,24 ± 0,02 mm'),
    folgaCorrenteMm: faixaMm(30, 40, '30 – 40 mm'),
    folgaManeteEmbreagemMm: faixaMm(10, 20, '10 – 20 mm'),
    folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
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
      tensaoCargaV: '13,5V – 14,8V @ 5.000 rpm',
    },
    fusivelPrincipalA: 20,
    fusiveisSecundarios: '10A (ABS, injeção, iluminação)',
    lampadaFarol: 'HS1 12V 35/35W (2016–2024) / Full LED (2025–2026)',
  },
  pneus: {
    dianteiro: { medida: '90/90-19 M/C 52P', pressaoPsi: 22, pressaoComGarupaPsi: 22, tipo: 'Uso misto (com câmara)' },
    traseiro: { medida: '110/90-17 M/C 60P', pressaoPsi: 22, pressaoComGarupaPsi: 25, tipo: 'Uso misto (com câmara)' },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: '428HO x 132L (com retentor O-Ring)',
    pinhaoDentes: 16,
    coroaDentes: 48,
  },
  torques: TORQUES_CG160_BROS_XRE,
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
  pesoSecoKg: 100,
  motorDetalhes: {
    diametroCursoMm: { diametro: 52.4, curso: 57.9 },
    taxaCompressao: '9,3:1',
    potencia: '9,1 cv @ 7.500 rpm',
    torque: '1,01 kgf·m @ 3.500 rpm',
    marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
    comando: 'OHC horizontal (corrente de comando)',
    filtroOleo: 'Filtro centrífugo na embreagem primária + tela metálica (limpeza a cada 12.000 km)',
    alimentacaoDetalhe: 'Carburador Keihin PB18 • Giclê principal #85 / baixa #40 • Parafuso de ar: 1 e 3/4 voltas',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'SAE 10W-30 Semissintético (API SL / JASO MA)',
      capacidadeTrocaL: 0.7,
      capacidadeTotalL: 0.9,
      observacao: 'Apenas 700 ml na troca — não colocar 1 litro inteiro para não afogar respiro e patinar embreagem',
    },
    tanqueL: 5.1,
    reservaL: 1.0,
    fluidoFreio: 'Tambor mecânico (KS/ES) / DOT 4 no disco dianteiro (EX / +)',
    fluidoBengala: {
      especificacao: 'Fluido ATF / Fork Oil 10W',
      volumePorCanelaMl: 62,
      nivelMm: 98,
    },
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.03, 0.07, '0,05 ± 0,02 mm'),
    valvulaEscapeMm: faixaMm(0.03, 0.07, '0,05 ± 0,02 mm'),
    folgaCorrenteMm: faixaMm(25, 35, '25 – 35 mm'),
    folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK CPR6EA-9S',
      alternativas: ['NGK CPR7EA-9'],
      folgaEletrodoMm: faixaMm(0.8, 0.9, '0,8 – 0,9 mm'),
    },
    bateria: {
      modelo: 'Yuasa YTX4L-BS / YTX5L-BS',
      tensaoV: 12,
      capacidadeAh: 4,
      tensaoCargaV: '13,5V – 14,8V @ 5.000 rpm',
    },
    fusivelPrincipalA: 15,
    fusiveisSecundarios: '10A',
    lampadaFarol: '12V 35/35W',
  },
  pneus: {
    dianteiro: { medida: '60/100-17 M/C 33L', pressaoPsi: 25, pressaoComGarupaPsi: 25 },
    traseiro: { medida: '80/100-14 M/C 49L', pressaoPsi: 29, pressaoComGarupaPsi: 33 },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: '428H x 106L',
    pinhaoDentes: 14,
    coroaDentes: 34,
  },
  torques: TORQUES_CUB_BIZ_POP,
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
  pesoSecoKg: 87,
  motorDetalhes: {
    diametroCursoMm: { diametro: 50.0, curso: 55.6 },
    taxaCompressao: '9,3:1',
    potencia: '7,9 cv @ 7.250 rpm (2016–2024) / 8,43 cv @ 7.250 rpm (2025–2026)',
    torque: '0,90 kgf·m @ 5.000 rpm',
    marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
    comando: 'OHC horizontal (corrente de comando)',
    filtroOleo: 'Filtro centrífugo + tela metálica (limpeza a cada 12.000 km)',
    alimentacaoDetalhe: 'Injeção PGM-FI (somente gasolina) • Pressão da bomba: 2,9 – 3,0 bar (294 kPa)',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'SAE 10W-30 Semissintético (API SL / JASO MA)',
      capacidadeTrocaL: 0.8,
      capacidadeTotalL: 1.0,
      observacao: '0,8 L na troca periódica | 1,0 L após desmontagem',
    },
    tanqueL: 4.2,
    reservaL: 0.9,
    fluidoFreio: 'Não utiliza (freios a tambor acionados por cabo/varão)',
    fluidoBengala: {
      especificacao: 'Fluido ATF / Fork Oil 10W',
      volumePorCanelaMl: 60,
      nivelMm: 102,
    },
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.08, 0.12, '0,10 ± 0,02 mm'),
    valvulaEscapeMm: faixaMm(0.08, 0.12, '0,10 ± 0,02 mm'),
    folgaCorrenteMm: faixaMm(25, 35, '25 – 35 mm'),
    folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK CPR6EA-9S',
      alternativas: ['NGK CPR7EA-9'],
      folgaEletrodoMm: faixaMm(0.8, 0.9, '0,8 – 0,9 mm'),
    },
    bateria: {
      modelo: 'Yuasa YTX4L-BS (2016–2024) / YTX5L-BS (2025 ES)',
      tensaoV: 12,
      capacidadeAh: 4,
      tensaoCargaV: '13,5V – 14,8V @ 5.000 rpm',
    },
    fusivelPrincipalA: 15,
    fusiveisSecundarios: '10A',
    lampadaFarol: 'HS1 12V 35/35W',
  },
  pneus: {
    dianteiro: { medida: '60/100-17 M/C 33L', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Com câmara' },
    traseiro: { medida: '80/100-14 M/C 49L', pressaoPsi: 29, pressaoComGarupaPsi: 36, tipo: 'Com câmara' },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: '428H x 104L',
    pinhaoDentes: 14,
    coroaDentes: 34,
  },
  torques: TORQUES_CUB_BIZ_POP,
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
  pesoSecoKg: 126,
  motorDetalhes: {
    diametroCursoMm: { diametro: 57.3, curso: 57.9 },
    taxaCompressao: '10,6:1',
    potencia: '13,2 cv @ 8.500 rpm',
    torque: '1,38 kgf·m @ 5.000 rpm',
    marchaLentaRpm: faixaRpm(1600, 1800, '1.700 ± 100 rpm'),
    comando: 'OHC 2 válvulas eSP com partida silenciosa ACG e Idling Stop',
    filtroOleo: 'Tela metálica no bujão lateral (não possui filtro centrífugo nem elemento de papel)',
    alimentacaoDetalhe: 'Injeção PGM-FI (gasolina) • Pressão da bomba de combustível: 2,9 – 3,0 bar (294 kPa)',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'SAE 10W-30 Semissintético (API SL / JASO MB — baixa fricção para scooter)',
      capacidadeTrocaL: 0.8,
      capacidadeTotalL: 0.9,
      observacao: 'Usar especificação JASO MB (embreagem seca no CVT); JASO MA também é tolerado em emergência',
    },
    oleoTransmissaoCvt: {
      especificacao: 'SAE 10W-30 JASO MB',
      capacidadeL: 0.12,
    },
    liquidoArrefecimento: {
      especificacao: 'Honda Pro Coolant (etilenoglicol pronto para uso 50/50)',
      capacidadeL: 0.52,
    },
    tanqueL: 8.0,
    fluidoFreio: 'DOT 4',
    fluidoBengala: {
      especificacao: 'Fluido ATF / Fork Oil 10W',
      volumePorCanelaMl: 117,
      nivelMm: 95,
    },
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.08, 0.12, '0,10 ± 0,02 mm'),
    valvulaEscapeMm: faixaMm(0.22, 0.26, '0,24 ± 0,02 mm'),
    folgaAceleradorMm: faixaMm(2, 6, '2 – 6 mm'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK CPR7EA-9',
      alternativas: ['DENSO U22EPR9'],
      folgaEletrodoMm: faixaMm(0.8, 0.9, '0,8 – 0,9 mm'),
    },
    bateria: {
      modelo: 'Yuasa YTZ7V / YTX7L-BS (específica para Idling Stop)',
      tensaoV: 12,
      capacidadeAh: 6.3,
      tensaoCargaV: '13,8V – 14,8V @ 5.000 rpm',
    },
    fusivelPrincipalA: 25,
    fusiveisSecundarios: '15A / 10A (ACG, ABS, Smart Key)',
    lampadaFarol: 'Full LED integrado',
  },
  pneus: {
    dianteiro: { medida: '100/80-14 M/C 48P', pressaoPsi: 29, pressaoComGarupaPsi: 29, tipo: 'Sem câmara' },
    traseiro: { medida: '120/70-14 M/C 61P', pressaoPsi: 33, pressaoComGarupaPsi: 36, tipo: 'Sem câmara' },
  },
  transmissaoFinal: {
    tipo: 'correia',
    cvtDetalhe: {
      correiaCodigo: 'Honda 23100-K36-J01 (Bando V-Belt)',
      larguraLimiteMm: 21.5,
      roletesMedidaPeso: '6 roletes 20x15 mm (15g ou 17g conforme ano)',
    },
  },
  torques: TORQUES_PCX,
};

// ---------------------------------------------------------------------------
// Catálogo HONDA (8 modelos / 18 gerações)
// ---------------------------------------------------------------------------

export const HONDA: Modelo[] = [
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
        destaques: [
          'Motor 162,7cc OHC Flex',
          'Injeção eletrônica PGM-FI',
          'Disco dianteiro na Titan/Fan (tambor na Start) sem CBS',
        ],
        alertasBancada: [
          'Folga de escape 0,24 mm (muito maior que os 0,12 mm da CG 150) — erro comum de oficina deixar presa em 0,12 mm causando motor apagando quente.',
          'Abrir tampa direita a cada 12.000 km para limpar a borra acumulada no rotor do filtro centrífugo e na peneira inferior.',
          'Fluido de bengala desta 1ª fase é 138 ml por canela (tubo interno diferente da linha 2018+).',
          'Sempre verificar pressão da bomba de combustível (2,9–3,0 bar) quando houver falha de retomada com etanol.',
        ],
        fichaTecnica: cg160Base,
      }),
      geracao('honda-cg-160', {
        anoInicio: 2018,
        anoFim: 2024,
        nomeGeracao: 'Freio Combinado CBS',
        versoes: ['Start', 'Fan', 'Titan', 'Cargo'],
        destaques: ['Freio combinado CBS', 'Painel digital blackout revisado', 'Suspensão dianteira reforçada (142 ml)'],
        alertasBancada: [
          'Freio CBS na Titan/Fan possui pinça dianteira de 3 êmbolos e 2 sangradores: sangrar primeiro o circuito do manete e depois o cilindro mestre secundário acionado pelo pedal traseiro.',
          'Na Start 160 (tambor dianteiro), o CBS é mecânico por cabos duplos — regular primeiro o freio traseiro antes de ajustar o cabo combinador dianteiro.',
          'Nunca esquecer de limpar o filtro centrífugo e a tela metálica a cada 12.000 km; entupimento funde pino de biela e comando.',
          'Bengala passou para 142 ml por canela devido à mudança nas buchas e molas a partir de 2018.',
        ],
        fichaTecnica: {
          ...cg160Base,
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'CBS' },
          fluidos: {
            ...cg160Base.fluidos,
            fluidoBengala: {
              especificacao: 'Fluido ATF / Honda Ultra Cushion Oil 10W',
              volumePorCanelaMl: 142,
              nivelMm: 151,
            },
          },
        },
      }),
      geracao('honda-cg-160', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Nova Geração ABS / Farol LED',
        versoes: ['Start', 'Fan', 'Titan'],
        destaques: [
          'Titan com ABS dianteiro e disco nas duas rodas (fim do CBS na Titan)',
          'Nova suspensão dianteira 33 mm e balança retangular',
          'Farol full LED, painel com indicador de marcha e porta USB-C',
        ],
        alertasBancada: [
          'CG 160 Titan 2025–2026 abandonou o CBS: agora traz ABS de 1 canal na dianteira e freio a disco traseiro independente (Start e Fan seguem com CBS).',
          'Cuidado ao desmontar a roda dianteira da Titan 2025+: proteger a roda fônica e o sensor hall do ABS (folga do sensor 0,7–1,2 mm).',
          'Bengalas novas com tubos de 33 mm (mais robustos que os 31 mm anteriores) — não intercambiáveis com mesas/retentores da 2016–2024.',
          'Motor mantém a mesma calibração de válvulas (Adm 0,08 mm / Esc 0,24 mm) e filtro centrífugo.',
        ],
        fichaTecnica: {
          ...cg160Base,
          freios: { dianteiro: 'disco', traseiro: 'disco', sistema: 'ABS' },
          eletrica: {
            ...cg160Base.eletrica,
            lampadaFarol: 'Full LED selado',
          },
          fluidos: {
            ...cg160Base.fluidos,
            tanqueL: 14.0,
            fluidoBengala: {
              especificacao: 'Fluido ATF / Honda Ultra Cushion Oil 10W',
              volumePorCanelaMl: 155,
              observacao: 'Nova suspensão dianteira com tubos de 33 mm',
            },
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
        ],
        auditoria: {
          status: 'verificado_manual',
          ultimaRevisao: '2026-11-19',
          fonte:
            'CG 125 Fan e Cargo 2011.pdf (D2203-MAN-0734 — págs. 4-3, 5-8, 6-1 a 6-29 e 10-1 a 10-5 [PDF págs. 17, 28, 41–69, 85–89 e 164]) e CG 125 Fan e Cargo 2014.pdf (D2203-MAN-0944 — págs. 34–89 e 112–118 [PDF págs. 46–101, 124–130 e 211])',
          notas:
            'Auditado 100% nos 2 PDFs locais (2011 e 2014 carburadas): cilindrada 124,7 cm³; óleo Genuíno Honda SAE 10W-30 API SJ JASO MA (1,0 L drenagem / 1,2 L desmontagem); parafuso de drenagem 30 N·m (3,1 kgf·m); válvulas OHC Adm 0,08 mm / Esc 0,12 mm; vela NGK CPR8EA-9 (opcional CPR9EA-9), folga 0,80–0,90 mm; relação 14x43 (3,071) com corrente DID 428MX-116RB (2011) / DID 428MX-118LE (2014) e folga 10–20 mm; bengala 72 cm³ (2011) / 139,0 ± 2,5 cm³ (2014); eixo diant. 62 N·m (2011) / 59 N·m (2014), eixo tras. 88 N·m e porca do braço limitador do freio tras. 22 N·m. Pendências que aguardam Manual de Serviço (e manual específico da CG 125i 2016–2018 não presente em public/manuals/): dados do sistema PGM-FI da versão 125i (2016–2018), modelo/giclagem do carburador 2009–2015, nível de óleo da bengala em mm e torques internos (vela em N·m, tampa do cabeçote, contraporca de válvula, filtro centrífugo, coroa, pinça de freio ESD e coluna de direção).',
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
        destaques: ['Motor 162,7cc OHC Flex', 'Injeção PGM-FI', 'Disco nas duas rodas com CBS (ESDD 2018+)'],
        alertasBancada: [
          'Mesma folga de válvulas da CG 160: Adm 0,08 ± 0,02 mm e Esc 0,24 ± 0,02 mm com motor frio.',
          'Folga da corrente é maior que na CG (30 a 40 mm no cavalete lateral) devido ao curso longo da suspensão traseira Mono Shock.',
          'Nas Bros ESDD CBS (2018–2024), a pinça dianteira tem 3 pistões e dois circuitos hidráulicos: sangrar ambos os sangradores ao trocar o fluido DOT 4.',
          'Lubrificar buchas da balança e articulações da suspensão traseira a cada 12.000 km (ou antes se rodar em terra/chuva).',
        ],
        fichaTecnica: bros160Base,
      }),
      geracao('honda-nxr-160-bros', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Nova Geração ABS / CBS & Farol LED',
        versoes: ['CBS', 'ABS'],
        destaques: [
          'Versão ABS (1 canal dianteiro) e versão CBS',
          'Suspensão dianteira com tubos de 33 mm',
          'Farol full LED, painel com indicador de marcha e USB-C',
        ],
        alertasBancada: [
          'Nova suspensão dianteira passou de 31 mm para 33 mm de diâmetro — retentores e guarda-pó específicos da linha 2025+.',
          'Na versão ABS, inspecionar distância do sensor dianteiro à roda fônica (0,7–1,2 mm) após qualquer serviço de pneu ou pastilha.',
          'Filtro de combustível agora separado do módulo da bomba, facilitando manutenção preventiva.',
          'Motor mantém 1,0 L de 10W-30 na troca e limpeza obrigatória do filtro centrífugo aos 12.000 km.',
        ],
        fichaTecnica: {
          ...bros160Base,
          versaoReferencia: 'ABS',
          freios: { dianteiro: 'disco', traseiro: 'disco', sistema: 'ABS' },
          eletrica: {
            ...bros160Base.eletrica,
            lampadaFarol: 'Full LED integrado',
          },
          fluidos: {
            ...bros160Base.fluidos,
            fluidoBengala: {
              especificacao: 'Fluido ATF / Fork Oil 10W',
              volumePorCanelaMl: 205,
              observacao: 'Novas canelas de 33 mm de diâmetro (geração 2025+)',
            },
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
        destaques: ['Motor 184,4cc OHC Flex', 'ABS dianteiro de série', 'Freio a disco nas duas rodas'],
        alertasBancada: [
          'Compartilha carcaça inferior e cabeçote 2V com a família 160 (cilindro de 61 mm): folga de válvulas é idêntica — Adm 0,08 ± 0,02 mm / Esc 0,24 ± 0,02 mm.',
          'Não sofre do problema crônico de trinca de cabeçote das antigas XRE 300 DOHC, pois usa cabeçote OHC simples de 2 válvulas.',
          'Como o cárter leva apenas 1,0 L de óleo 10W-30 na troca, orientar o cliente a conferir o nível na vareta a cada 1.000 km.',
          'Corrente original 428HO possui retentores (O-Ring) — lavar apenas com querosene ou desengraxante próprio, nunca gasolina.',
        ],
        fichaTecnica: xre190Base,
      }),
      geracao('honda-xre-190', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Nova Geração / Farol LED & Suspensão 33 mm',
        versoes: ['Standard', 'Adventure'],
        destaques: ['Suspensão dianteira de 33 mm', 'Iluminação Full LED e porta USB-C', 'Novo painel blackout com indicador de marcha'],
        alertasBancada: [
          'Bengalas passaram de 31 mm para 33 mm em 2025 — verificar código de retentor específico antes da desmontagem.',
          'Carenagens do tanque e conjunto óptico full LED redesenhados; atenção aos encaixes plásticos ocultos ao acessar a bateria/filtro de ar.',
          'Manter atenção rigorosa à limpeza do filtro centrífugo e peneira a cada 12.000 km.',
        ],
        fichaTecnica: {
          ...xre190Base,
          eletrica: {
            ...xre190Base.eletrica,
            lampadaFarol: 'Full LED integrado',
          },
          fluidos: {
            ...xre190Base.fluidos,
            fluidoBengala: {
              especificacao: 'Fluido ATF / Fork Oil 10W',
              volumePorCanelaMl: 205,
              observacao: 'Suspensão dianteira redimensionada para 33 mm (linha 2025+)',
            },
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
        destaques: ['Motor 124,9cc OHC horizontal', 'Câmbio rotativo semiautomático 4 marchas', 'Folga de válvulas 0,05 / 0,05 mm'],
        alertasBancada: [
          'Folga de válvulas da Biz 125 é bem justa: Adm 0,05 ± 0,02 mm e Esc 0,05 ± 0,02 mm (motor frio).',
          'Volume de óleo na troca é apenas 0,7 L (700 ml) — colocar 1 litro inteiro faz o motor fumar pelo respiro e patinar a embreagem centrífuga.',
          'Embreagem semiautomática tem regulagem externa na tampa direita: soltar a contratuerca, girar o parafuso no sentido horário até sentir resistência e voltar 1/8 a 1/4 de volta.',
          'De 2006 a 2008 é carburada (Keihin PB18); em 2009–2010 recebeu injeção PGM-FI ainda somente a gasolina.',
        ],
        fichaTecnica: biz125Base,
      }),
      geracao('honda-biz-125', {
        anoInicio: 2011,
        anoFim: 2017,
        nomeGeracao: 'Flex Injetada',
        versoes: ['ES', 'EX'],
        destaques: ['Injeção eletrônica PGM-FI Flex', 'Disco dianteiro e rodas de liga na EX', 'Tanque ampliado para 5,5 L'],
        alertasBancada: [
          'Acesso à vela (NGK CPR6EA-9S) e ao cabeçote é feito removendo o escudo central acima do túnel.',
          'Se a marcha lenta oscilar ao usar etanol, limpar o corpo de borboleta (TBI) e executar o reset do ECM/TPS via conector DLC.',
          'Manter volume exato de 0,7 L de óleo 10W-30 JASO MA na troca e limpar o filtro centrífugo aos 12.000 km.',
        ],
        fichaTecnica: {
          ...biz125Base,
          versaoReferencia: 'EX',
          alimentacao: 'injecao',
          combustivel: 'flex',
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'convencional' },
          motorDetalhes: {
            ...biz125Base.motorDetalhes,
            potencia: '9,2 cv @ 7.500 rpm',
            torque: '1,04 kgf·m @ 3.500 rpm',
            alimentacaoDetalhe: 'Injeção PGM-FI Flex • Pressão da bomba de combustível: 2,9 – 3,0 bar (294 kPa)',
          },
          fluidos: {
            ...biz125Base.fluidos,
            tanqueL: 5.5,
            fluidoFreio: 'DOT 4 (disco dianteiro na EX) / Tambor na ES',
          },
        },
      }),
      geracao('honda-biz-125', {
        anoInicio: 2018,
        anoFim: 2026,
        nomeGeracao: 'Novo Design / CBS (Freio de Mão na 2025+)',
        versoes: ['125 ES', '125 EX'],
        destaques: ['Freio combinado CBS', 'Painel digital e tomada 12V/USB-C', 'Freio traseiro no manete esquerdo na linha 2025+'],
        alertasBancada: [
          'Na linha 2025–2026 a Biz 125 eliminou o pedal de freio no pé direito: o freio traseiro passou para o manete esquerdo (com trava de estacionamento) e o motor ganhou arquitetura de curso longo.',
          'Folga das válvulas continua 0,05 ± 0,02 mm (2018–2024) e volume de óleo 0,7 L na troca periódica.',
          'Sempre regular a sapata do freio traseiro antes de ajustar o cabo do sistema combinado CBS.',
        ],
        fichaTecnica: {
          ...biz125Base,
          versaoReferencia: 'EX',
          alimentacao: 'injecao',
          combustivel: 'flex',
          partida: 'eletrica',
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'CBS' },
          motorDetalhes: {
            ...biz125Base.motorDetalhes,
            potencia: '9,2 cv (2018–2024) / 9,53 cv (2025+) @ 7.500 rpm',
            torque: '1,04 kgf·m @ 3.500 rpm',
            alimentacaoDetalhe: 'Injeção PGM-FI Flex • Pressão da bomba: 2,9 – 3,0 bar (294 kPa)',
          },
          fluidos: {
            ...biz125Base.fluidos,
            tanqueL: 5.1,
            fluidoFreio: 'DOT 4 (EX com disco dianteiro + CBS) / Tambor CBS mecânico na ES',
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
        nomeGeracao: 'Pop 110i Injetada (Pedal)',
        destaques: ['Motor 109,1cc injetado (gasolina)', 'Partida a pedal', 'Câmbio semiautomático 4 marchas'],
        alertasBancada: [
          'Motor é exclusivamente a GASOLINA — abastecer com etanol causa falha grave de mistura, pois o mapa do ECM não é Flex.',
          'Folga de válvulas é Adm 0,10 ± 0,02 mm e Esc 0,10 ± 0,02 mm (motor frio) — diferente dos 0,05 mm da Biz 125.',
          'Volume de óleo na troca é 0,8 L (800 ml) de SAE 10W-30 JASO MA.',
          'Mesmo com bateria fraca, a Pop 110i pega no pedal graças ao gerador que alimenta a linha da bomba/ECM no chute.',
        ],
        fichaTecnica: pop110Base,
      }),
      geracao('honda-pop-110i', {
        anoInicio: 2025,
        anoFim: 2026,
        nomeGeracao: 'Pop 110i ES — Partida Elétrica',
        destaques: [
          'Partida elétrica de série (eliminou o pedal de partida)',
          'Novo motor 109,5cc de curso longo (+6% de potência)',
          'Câmbio semiautomático rotativo atualizado',
        ],
        alertasBancada: [
          'A Pop 110i ES 2025+ NÃO possui mais pedal de partida: manter a bateria (YTX5L-BS) e o sistema de carga (13,5–14,8V) sempre saudáveis.',
          'Novo motor de diâmetro x curso 47,0 x 63,1 mm (curso longo, mais econômico e forte em baixa), mantendo 0,8 L de óleo 10W-30 na troca.',
          'Continua sendo exclusivamente a GASOLINA e com freios a tambor CBS mecânico por cabos.',
        ],
        fichaTecnica: {
          ...pop110Base,
          versaoReferencia: 'ES',
          cilindradaCc: 109.5,
          partida: 'eletrica',
          freios: { dianteiro: 'tambor', traseiro: 'tambor', sistema: 'CBS' },
          motorDetalhes: {
            ...pop110Base.motorDetalhes,
            diametroCursoMm: { diametro: 47.0, curso: 63.12 },
            taxaCompressao: '10,0:1',
            potencia: '8,43 cv @ 7.250 rpm',
            torque: '0,94 kgf·m @ 5.000 rpm',
          },
          eletrica: {
            ...pop110Base.eletrica,
            bateria: {
              modelo: 'Yuasa YTX5L-BS / Heliar HTZ6L',
              tensaoV: 12,
              capacidadeAh: 5,
              tensaoCargaV: '13,5V – 14,8V @ 5.000 rpm',
            },
          },
        },
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
        nomeGeracao: 'PCX 150 (eSP 2V)',
        versoes: ['Standard CBS', 'DLX', 'Sport', 'ABS (2019–2022)'],
        destaques: [
          'Motor eSP 149,3cc 2 válvulas arrefecido a líquido',
          'Sistema Idling Stop e partida silenciosa ACG',
          'Transmissão CVT com correia dentada e óleo final (120 ml)',
        ],
        alertasBancada: [
          'Válvulas com motor frio: Adm 0,10 ± 0,02 mm e Esc 0,24 ± 0,02 mm (acesso pela tampa de inspeção sob o baú/assoalho).',
          'NÃO possui filtro centrífugo: limpar apenas a tela filtrante do bujão lateral esquerdo (torque 20 N·m) e trocar os 0,8 L de óleo 10W-30 JASO MB.',
          'Não esquecer do óleo da transmissão final (redutor traseiro): 120 ml (0,12 L) de SAE 10W-30 JASO MB a cada 12.000 km.',
          'Se o Idling Stop parar de funcionar, 90% dos casos é bateria abaixo de 12,4V em repouso ou interruptor do assento/temperatura do líquido de arrefecimento.',
        ],
        fichaTecnica: pcxBase,
      }),
      geracao('honda-pcx', {
        anoInicio: 2023,
        anoFim: 2026,
        nomeGeracao: 'PCX 160 (eSP+ 4V)',
        versoes: ['CBS', 'ABS', 'DLX ABS'],
        destaques: [
          'Novo motor eSP+ 156,9cc SOHC de 4 válvulas (16 cv)',
          'Disco traseiro + ABS dianteiro + controle de tração HSTC (ABS/DLX)',
          'Roda traseira aro 13 com pneu 130/70-13',
        ],
        alertasBancada: [
          'Motor eSP+ tem 4 válvulas (2 de admissão e 2 de escape): regular os 4 parafusos com Adm 0,10 ± 0,02 mm e Esc 0,24 ± 0,02 mm.',
          'Vela mudou para NGK LMAR8L-9 (rosca longa M10) — NUNCA instalar a CPR7EA-9 da PCX 150.',
          'A PCX 160 ganhou tensor hidráulico na corrente de comando e jato de óleo sob o pistão; manter rigorosamente óleo 10W-30 JASO MB (0,8 L na troca).',
          'Versões ABS/DLX têm disco traseiro e controle de tração HSTC: ao girar a roda traseira no cavalete central com o motor ligado, desligar o HSTC no painel para não gravar código de falha no ABS.',
        ],
        fichaTecnica: {
          ...pcxBase,
          versaoReferencia: 'DLX ABS',
          cilindradaCc: 156.9,
          motor: 'Monocilíndrico 4T OHC 4 válvulas eSP+',
          freios: { dianteiro: 'disco', traseiro: 'disco', sistema: 'ABS' },
          pesoSecoKg: 126,
          motorDetalhes: {
            ...pcxBase.motorDetalhes,
            diametroCursoMm: { diametro: 60.0, curso: 55.5 },
            taxaCompressao: '12,0:1',
            potencia: '16,0 cv @ 8.500 rpm',
            torque: '1,50 kgf·m @ 6.500 rpm',
            comando: 'SOHC 4 válvulas eSP+ com tensor hidráulico e partida ACG',
          },
          eletrica: {
            ...pcxBase.eletrica,
            vela: {
              modelo: 'NGK LMAR8L-9 (rosca longa)',
              folgaEletrodoMm: faixaMm(0.8, 0.9, '0,8 – 0,9 mm'),
            },
          },
          pneus: {
            dianteiro: { medida: '110/70-14 M/C 50P', pressaoPsi: 29, pressaoComGarupaPsi: 29, tipo: 'Sem câmara' },
            traseiro: { medida: '130/70-13 M/C 63P', pressaoPsi: 33, pressaoComGarupaPsi: 36, tipo: 'Sem câmara' },
          },
          transmissaoFinal: {
            tipo: 'correia',
            cvtDetalhe: {
              correiaCodigo: 'Honda 23100-K1Z-J11 (Double Cog V-Belt)',
              larguraLimiteMm: 21.5,
              roletesMedidaPeso: '6 roletes 20x15 mm (15g)',
            },
          },
        },
      }),
    ],
  },
];
