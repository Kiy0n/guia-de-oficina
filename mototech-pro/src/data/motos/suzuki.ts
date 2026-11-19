import { faixaMm, faixaRpm, geracao, torque } from '@/data/motos/helpers';
import type { FichaTecnica, Modelo, TorqueAperto } from '@/types/moto';

const MOTOR_SOHC_2V = 'Monocilíndrico 4T SOHC 2 válvulas';

// ---------------------------------------------------------------------------
// Tabelas de Torque Padrão Suzuki (Manuais de Serviço EN125 / GN125 / GSR / AN125)
// ---------------------------------------------------------------------------

const TORQUES_SUZUKI_125_150: TorqueAperto[] = [
  torque('Bujão de drenagem do óleo do motor', 21, 'motor', 'Cuidado redobrado: carcaça de alumínio Suzuki espana se passar de 23 N·m'),
  torque('Porcas da tampa do filtro de óleo (3x M6)', 9, 'motor', 'Conferir posição da mola e o O-ring interno do filtro'),
  torque('Parafusos da tampa inferior da peneira de óleo', 10, 'motor'),
  torque('Vela de ignição (NGK CR8E)', 11, 'motor', 'Rosca M10 longa — torque moderado (11 N·m)'),
  torque('Parafusos da tampa de inspeção de válvulas', 10, 'motor'),
  torque('Contratuerca do regulador de válvula', 10, 'motor'),
  torque('Porca do eixo dianteiro', 44, 'chassi'),
  torque('Porca do eixo traseiro', 65, 'chassi'),
  torque('Porcas da coroa traseira', 25, 'chassi', 'Dobrar chapas trava de segurança'),
  torque('Parafusos da pinça de freio dianteira', 25, 'freios'),
  torque('Porca da coluna de direção (mesa superior)', 65, 'suspensao'),
];

const TORQUES_BURGMAN_125: TorqueAperto[] = [
  torque('Bujão de drenagem do óleo do motor', 18, 'motor'),
  torque('Bujão de drenagem do óleo de transmissão final', 12, 'motor'),
  torque('Vela de ignição (NGK CR7E)', 11, 'motor'),
  torque('Porca da polia primária do CVT (variador)', 50, 'motor'),
  torque('Porca da campana da embreagem CVT', 50, 'motor'),
  torque('Porca do eixo dianteiro', 42, 'chassi'),
  torque('Porca do eixo da roda traseira', 110, 'chassi'),
  torque('Parafusos da pinça de freio dianteira', 23, 'freios'),
];

// ---------------------------------------------------------------------------
// Base Suzuki 125 (GN125 Intruder / EN125 Yes)
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
  pesoSecoKg: 107,
  motorDetalhes: {
    diametroCursoMm: { diametro: 57.0, curso: 48.8 },
    taxaCompressao: '9,5:1',
    potencia: '12,5 cv @ 9.000 rpm (2002–2007) / 11,0 cv @ 9.000 rpm (2008–2016)',
    torque: '1,17 kgf·m @ 8.000 rpm',
    marchaLentaRpm: faixaRpm(1350, 1550, '1.450 ± 100 rpm'),
    comando: 'SOHC 2 válvulas (motor superquadrado de giro alto)',
    filtroOleo: 'Elemento de papel descartável (HF131) na tampa lateral direita + peneira inferior',
    alimentacaoDetalhe:
      'Carburador Mikuni VM22 mecânico (2002–2007: alta #97,5 / baixa #17,5) | Mikuni BS26 a vácuo (2008–2016: alta #112,5 / baixa #12,5)',
  },
  fluidos: {
    oleoMotor: {
      especificacao: 'SAE 10W-40 Semissintético ou 20W-50 Mineral (API SL / JASO MA)',
      capacidadeTrocaL: 0.85,
      capacidadeTrocaComFiltroL: 0.95,
      capacidadeTotalL: 1.1,
      observacao: '0,85 L sem filtro | 0,95 L trocando o filtro de papel HF131 | 1,1 L após desmontagem',
    },
    tanqueL: 10.3,
    reservaL: 2.0,
    fluidoFreio: 'DOT 4 (disco dianteiro)',
    fluidoBengala: {
      especificacao: 'Fork Oil 10W / ATF',
      volumePorCanelaMl: 174,
      nivelMm: 146,
    },
  },
  folgas: {
    valvulaAdmissaoMm: faixaMm(0.04, 0.07, '0,04 – 0,07 mm'),
    valvulaEscapeMm: faixaMm(0.08, 0.13, '0,08 – 0,13 mm'),
    folgaCorrenteMm: faixaMm(15, 25, '15 – 25 mm'),
    folgaManeteEmbreagemMm: faixaMm(10, 15, '10 – 15 mm'),
    folgaPedalFreioMm: faixaMm(20, 30, '20 – 30 mm'),
    folgaAceleradorMm: faixaMm(2, 4, '2 – 4 mm'),
  },
  eletrica: {
    vela: {
      modelo: 'NGK CR8E',
      iridiumAlternativa: 'NGK CR8EIX',
      folgaEletrodoMm: faixaMm(0.7, 0.8, '0,7 – 0,8 mm'),
    },
    bateria: {
      modelo: 'Yuasa YB7-A (convencional) ou YTX7A-BS / Motobatt MBTX7U',
      tensaoV: 12,
      capacidadeAh: 7,
      tensaoCargaV: '13,5V – 15,0V @ 5.000 rpm',
    },
    fusivelPrincipalA: 15,
    lampadaFarol: 'H4 12V 35/35W',
  },
  pneus: {
    dianteiro: { medida: '2.75-18 42P', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Sem câmara' },
    traseiro: { medida: '3.50-16 58P', pressaoPsi: 29, pressaoComGarupaPsi: 33, tipo: 'Sem câmara (aro 16 traseiro)' },
  },
  transmissaoFinal: {
    tipo: 'corrente',
    corrente: '428H x 116L',
    pinhaoDentes: 14,
    coroaDentes: 43,
  },
  torques: TORQUES_SUZUKI_125_150,
};

// ---------------------------------------------------------------------------
// Catálogo SUZUKI (4 modelos / 6 gerações)
// ---------------------------------------------------------------------------

export const SUZUKI: Modelo[] = [
  {
    id: 'suzuki-intruder-125',
    marca: 'Suzuki',
    nome: 'Intruder 125',
    categoria: 'custom',
    aliases: ['Intruder', 'GN125', 'GN 125'],
    geracoes: [
      geracao('suzuki-intruder-125', {
        anoInicio: 2002,
        anoFim: 2007,
        nomeGeracao: 'Primeira Geração (Carburador Mecânico VM22)',
        versoes: ['ED', 'Cargo'],
        destaques: [
          'Motor 124cc SOHC de 12,5 cv (Pré-Promot 3)',
          'Carburador Mikuni VM22 de acionamento direto (pistonete a cabo)',
          'Folga de válvulas justa: Adm 0,04–0,07 mm / Esc 0,08–0,13 mm',
        ],
        alertasBancada: [
          'ATENÇÃO AO FILTRO DE ÓLEO: atrás do filtro de papel existe um pequeno anel O-ring interno que encaixa no duto do bloco e uma mola na tampa — se o O-ring sair junto com o filtro velho e for jogado fora, a pressão de óleo cai e funde o comando de válvulas!',
          'Folga de admissão da Intruder/Yes é de apenas 0,04 a 0,07 mm (usar lâmina de 0,05 mm) e escape 0,08 a 0,13 mm (lâmina de 0,10 mm).',
          'Carburador Mikuni VM22 (2002–2007) tem resposta imediata mas costuma vazar pela agulha da boia se a moto ficar parada com a torneira aberta.',
          'Bujão de óleo no cárter de alumínio Suzuki é famoso por espanar se apertado demais: respeitar 21 N·m e usar arruela de esmagamento nova.',
        ],
        fichaTecnica: {
          ...suzuki125Base,
          partida: 'eletrica',
          motorDetalhes: {
            ...suzuki125Base.motorDetalhes,
            potencia: '12,5 cv @ 9.000 rpm',
            alimentacaoDetalhe:
              'Carburador Mikuni VM22 (acionamento direto) • Giclê alta #97,5 / baixa #17,5 • Parafuso mistura: 2 voltas',
          },
        },
      }),
      geracao('suzuki-intruder-125', {
        anoInicio: 2008,
        anoFim: 2016,
        nomeGeracao: 'Segunda Geração (Carburador a Vácuo BS26)',
        versoes: ['ED', 'Cargo'],
        destaques: [
          'Carburador Mikuni BS26 a vácuo + válvula PAIR (Promot 3)',
          'Pedal de partida adicionado a partir de 2012 + indicador de marcha no painel',
          'Rodas de liga leve estrela e roda traseira aro 16',
        ],
        alertasBancada: [
          'Carburador Mikuni BS26 a vácuo é muito sensível a rasgos no diafragma do pistonete e ressecamento do coletor de admissão.',
          'Em 2011–2016 o giclê de baixa original (#12,5) é muito magro para a gasolina brasileira atual com 27% de etanol: se falhar fria, abrir parafuso de mistura para 2,5 a 3 voltas ou subir giclê de baixa para #15.',
          'Nunca esquecer de conferir o O-ring interno do alojamento do filtro de óleo e a mola da tampa (0,95 L de óleo 10W-40 ou 20W-50 com filtro).',
        ],
        fichaTecnica: {
          ...suzuki125Base,
          motorDetalhes: {
            ...suzuki125Base.motorDetalhes,
            potencia: '11,0 cv @ 9.000 rpm',
            torque: '0,98 kgf·m @ 7.000 rpm',
            alimentacaoDetalhe:
              'Carburador Mikuni BS26 a vácuo • Giclê alta #112,5 / baixa #12,5 (#15 recomendado) • Parafuso mistura: 2,5 voltas',
          },
        },
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
        nomeGeracao: 'EN125 Yes / Yes SE / Cargo',
        versoes: ['Yes ED', 'Yes SE', 'Cargo'],
        destaques: [
          'Motor 124cc SOHC compartilhado com a Intruder 125',
          'Carburador Mikuni BS26 a vácuo e tanque de 14 litros',
          'Rodas de liga leve aro 18 com pneus sem câmara e painel com indicador de marcha',
        ],
        alertasBancada: [
          'Compartilha motor completo com a Intruder 125: folga de válvulas Adm 0,04–0,07 mm (lâmina 0,05) e Esc 0,08–0,13 mm (lâmina 0,10).',
          'Cuidado com o anel O-ring do fundo do filtro de óleo (HF131) e a mola da tampa: erro de montagem bloqueia ou desvia a lubrificação do cabeçote.',
          'Diferente da Intruder (coroa 43 dentes e aro 16), a Yes 125 usa relação 14x45 (corrente 428H x 118L) e rodas aro 18.',
          'Bengala dianteira da Yes 125 leva 148 ml de fluido Fork Oil 10W por canela.',
        ],
        fichaTecnica: {
          ...suzuki125Base,
          versaoReferencia: 'Yes SE',
          pesoSecoKg: 112,
          motorDetalhes: {
            ...suzuki125Base.motorDetalhes,
            alimentacaoDetalhe:
              'Carburador Mikuni BS26 a vácuo • Giclê alta #110 / baixa #12,5 (#15 recomendado) • Parafuso mistura: 2,5 voltas',
          },
          fluidos: {
            ...suzuki125Base.fluidos,
            tanqueL: 14.0,
            reservaL: 2.0,
            fluidoBengala: {
              especificacao: 'Fork Oil 10W / ATF',
              volumePorCanelaMl: 148,
              nivelMm: 152,
            },
          },
          pneus: {
            dianteiro: { medida: '2.75-18 42P', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Sem câmara' },
            traseiro: { medida: '90/90-18 57P', pressaoPsi: 29, pressaoComGarupaPsi: 33, tipo: 'Sem câmara' },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428H x 118L',
            pinhaoDentes: 14,
            coroaDentes: 45,
          },
        },
      }),
    ],
  },
  {
    id: 'suzuki-gsr-150i',
    marca: 'Suzuki',
    nome: 'GSR 150i',
    categoria: 'street',
    aliases: ['GSR', 'GSR150', 'GSR 150'],
    geracoes: [
      geracao('suzuki-gsr-150i', {
        anoInicio: 2011,
        anoFim: 2017,
        nomeGeracao: 'GSR 150i Injetada (6 Marchas)',
        versoes: ['GSR 150i', 'GSR 150i Cargo'],
        destaques: [
          'Motor 149,5cc SOHC com balanceiro e câmbio exclusivo de 6 marchas',
          'Injeção eletrônica Mikuni DCP-FI',
          'Suspensão traseira com amortecedores a gás (reservatório externo)',
        ],
        alertasBancada: [
          'Folga de válvulas da GSR 150i é ligeiramente maior que da Yes 125: Adm 0,06 – 0,10 mm e Esc 0,10 – 0,14 mm com motor frio.',
          'O sistema de injeção Mikuni DCP-FI integra a bomba de alta pressão e o bico injetor em uma única peça (alimentada por gravidade do tanque): nunca deixar faltar combustível para não travar o êmbolo do DCP.',
          'Utiliza o mesmo filtro de óleo em papel (HF131) com O-ring interno e mola da linha 125; capacidade de óleo é 0,95 L com troca de filtro.',
          'Única street 150 da categoria com câmbio de 6 marchas e eixo balanceiro anti-vibração.',
        ],
        fichaTecnica: {
          ...suzuki125Base,
          cilindradaCc: 149.5,
          alimentacao: 'injecao',
          partida: 'eletrica',
          cambio: { tipo: 'manual', marchas: 6 },
          pesoSecoKg: 120,
          motorDetalhes: {
            diametroCursoMm: { diametro: 57.0, curso: 58.6 },
            taxaCompressao: '9,1:1',
            potencia: '12,0 cv @ 8.000 rpm',
            torque: '1,08 kgf·m @ 6.000 rpm',
            marchaLentaRpm: faixaRpm(1300, 1500, '1.400 ± 100 rpm'),
            comando: 'SOHC 2 válvulas com eixo balanceiro e câmbio de 6 velocidades',
            filtroOleo: 'Elemento de papel descartável (HF131) + peneira inferior no cárter',
            alimentacaoDetalhe:
              'Injeção eletrônica Mikuni DCP-FI (Discharge Pump Fuel Injection — bomba e bico integrados)',
          },
          fluidos: {
            ...suzuki125Base.fluidos,
            tanqueL: 14.0,
            oleoMotor: {
              especificacao: 'SAE 10W-40 Semissintético (API SL / JASO MA)',
              capacidadeTrocaL: 0.9,
              capacidadeTrocaComFiltroL: 0.95,
              capacidadeTotalL: 1.1,
            },
            fluidoBengala: {
              especificacao: 'Fork Oil 10W',
              volumePorCanelaMl: 151,
              nivelMm: 149,
            },
          },
          folgas: {
            ...suzuki125Base.folgas,
            valvulaAdmissaoMm: faixaMm(0.06, 0.1, '0,06 – 0,10 mm'),
            valvulaEscapeMm: faixaMm(0.1, 0.14, '0,10 – 0,14 mm'),
          },
          pneus: {
            dianteiro: { medida: '2.75-18 42P', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Sem câmara' },
            traseiro: { medida: '90/90-18 57P', pressaoPsi: 29, pressaoComGarupaPsi: 33, tipo: 'Sem câmara' },
          },
          transmissaoFinal: {
            tipo: 'corrente',
            corrente: '428H x 122L',
            pinhaoDentes: 14,
            coroaDentes: 42,
          },
        },
      }),
    ],
  },
  {
    id: 'suzuki-burgman-125',
    marca: 'Suzuki',
    nome: 'Burgman 125 / i',
    categoria: 'scooter',
    aliases: ['Burgman', 'Burgman i', 'AN125', 'AN 125'],
    geracoes: [
      geracao('suzuki-burgman-125', {
        anoInicio: 2005,
        anoFim: 2010,
        nomeGeracao: 'AN125 Burgman Carburada',
        destaques: [
          'Motor 124cc SOHC carburado com filtro de óleo em papel',
          'Transmissão automática CVT e rodas aro 10',
          'Folga de válvulas Adm 0,05–0,09 mm / Esc 0,08–0,12 mm',
        ],
        alertasBancada: [
          'A Burgman 125 carburada (AN125 2005–2010) USA filtro de óleo em elemento de papel (HF132): leva 0,8 L sem filtro e 0,9 L trocando o filtro.',
          'Afogador automático elétrico (by-starter) no carburador Mikuni BS26: se a moto beber demais ou afogar quente, testar se a agulha térmica do afogador está expandindo com 12V.',
          'Torneira de combustível a vácuo: quando o diafragma fura, passa gasolina direto pelo tubo de vácuo para o coletor e calça hidraulicamente o motor.',
          'Óleo da transmissão final traseira leva 90 ml (0,09 L) de SAE 10W-40.',
        ],
        fichaTecnica: {
          cilindradaCc: 124,
          motor: MOTOR_SOHC_2V,
          alimentacao: 'carburador',
          combustivel: 'gasolina',
          arrefecimento: 'ar',
          partida: 'pedal-eletrica',
          cambio: { tipo: 'cvt' },
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'convencional' },
          pesoSecoKg: 109,
          motorDetalhes: {
            diametroCursoMm: { diametro: 53.5, curso: 55.2 },
            taxaCompressao: '9,6:1',
            potencia: '11,2 cv @ 8.500 rpm',
            torque: '1,0 kgf·m @ 7.000 rpm',
            marchaLentaRpm: faixaRpm(1400, 1600, '1.500 ± 100 rpm'),
            comando: 'SOHC 2 válvulas horizontal com refrigeração forçada por ventoinha',
            filtroOleo: 'Elemento de papel descartável (HF132) + tela metálica',
            alimentacaoDetalhe:
              'Carburador Mikuni BS26 a vácuo com afogador elétrico automático • Giclê alta #102,5 / baixa #15',
          },
          fluidos: {
            oleoMotor: {
              especificacao: 'SAE 10W-40 Semissintético (API SL / JASO MB ou MA)',
              capacidadeTrocaL: 0.8,
              capacidadeTrocaComFiltroL: 0.9,
              capacidadeTotalL: 0.95,
            },
            oleoTransmissaoCvt: {
              especificacao: 'SAE 10W-40',
              capacidadeL: 0.09,
            },
            tanqueL: 6.0,
            fluidoFreio: 'DOT 4 (disco dianteiro)',
            fluidoBengala: {
              especificacao: 'Fork Oil 10W',
              volumePorCanelaMl: 68,
            },
          },
          folgas: {
            valvulaAdmissaoMm: faixaMm(0.05, 0.09, '0,05 – 0,09 mm'),
            valvulaEscapeMm: faixaMm(0.08, 0.12, '0,08 – 0,12 mm'),
            folgaAceleradorMm: faixaMm(2, 4, '2 – 4 mm'),
          },
          eletrica: {
            vela: {
              modelo: 'NGK CR7E',
              iridiumAlternativa: 'NGK CR7EIX',
              folgaEletrodoMm: faixaMm(0.7, 0.8, '0,7 – 0,8 mm'),
            },
            bateria: {
              modelo: 'Yuasa YTX7A-BS',
              tensaoV: 12,
              capacidadeAh: 6,
              tensaoCargaV: '13,5V – 15,0V @ 5.000 rpm',
            },
            fusivelPrincipalA: 15,
            lampadaFarol: 'HS1 12V 35/35W',
          },
          pneus: {
            dianteiro: { medida: '3.50-10 51J', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Sem câmara' },
            traseiro: { medida: '3.50-10 51J', pressaoPsi: 29, pressaoComGarupaPsi: 36, tipo: 'Sem câmara' },
          },
          transmissaoFinal: {
            tipo: 'correia',
            cvtDetalhe: {
              correiaCodigo: 'Suzuki 27601-06F10 / Mitsuboshi V-Belt',
              larguraLimiteMm: 18.1,
              roletesMedidaPeso: '6 roletes 17x12 mm (11g)',
            },
          },
          torques: TORQUES_BURGMAN_125,
        },
      }),
      geracao('suzuki-burgman-125', {
        anoInicio: 2011,
        anoFim: 2019,
        nomeGeracao: 'Burgman 125i Injetada',
        destaques: [
          'Injeção eletrônica Mikuni DCP-FI',
          'Novo design e painel atualizado',
          'Transmissão automática CVT',
        ],
        alertasBancada: [
          'Usa sistema de injeção Mikuni DCP-FI (bomba e bico injetor conjugados): manter filtro de combustível limpo e nunca rodar até secar o tanque.',
          'Volume de óleo do motor é 0,8 L de SAE 10W-40 + 90 ml (0,09 L) na transmissão final.',
          'Folga de válvulas a frio: Adm 0,05 – 0,09 mm e Esc 0,08 – 0,12 mm.',
          'Inspecionar desgaste de roletes (calos planos) e largura da correia CVT a cada 6.000 km.',
        ],
        fichaTecnica: {
          cilindradaCc: 124,
          motor: MOTOR_SOHC_2V,
          alimentacao: 'injecao',
          combustivel: 'gasolina',
          arrefecimento: 'ar',
          partida: 'pedal-eletrica',
          cambio: { tipo: 'cvt' },
          freios: { dianteiro: 'disco', traseiro: 'tambor', sistema: 'convencional' },
          pesoSecoKg: 110,
          motorDetalhes: {
            diametroCursoMm: { diametro: 53.5, curso: 55.2 },
            taxaCompressao: '9,6:1',
            potencia: '9,0 cv @ 7.500 rpm',
            torque: '0,95 kgf·m @ 6.000 rpm',
            marchaLentaRpm: faixaRpm(1400, 1600, '1.500 ± 100 rpm'),
            comando: 'SOHC 2 válvulas horizontal com refrigeração forçada',
            filtroOleo: 'Tela metálica no bujão inferior do cárter',
            alimentacaoDetalhe: 'Injeção eletrônica Mikuni DCP-FI (bomba e injetor integrados)',
          },
          fluidos: {
            oleoMotor: {
              especificacao: 'SAE 10W-40 Semissintético (API SL / JASO MB)',
              capacidadeTrocaL: 0.8,
              capacidadeTotalL: 0.9,
            },
            oleoTransmissaoCvt: {
              especificacao: 'SAE 10W-40',
              capacidadeL: 0.09,
            },
            tanqueL: 5.5,
            fluidoFreio: 'DOT 4 (disco dianteiro)',
            fluidoBengala: {
              especificacao: 'Fork Oil 10W',
              volumePorCanelaMl: 68,
            },
          },
          folgas: {
            valvulaAdmissaoMm: faixaMm(0.05, 0.09, '0,05 – 0,09 mm'),
            valvulaEscapeMm: faixaMm(0.08, 0.12, '0,08 – 0,12 mm'),
            folgaAceleradorMm: faixaMm(2, 4, '2 – 4 mm'),
          },
          eletrica: {
            vela: {
              modelo: 'NGK CR7E',
              iridiumAlternativa: 'NGK CR7EIX',
              folgaEletrodoMm: faixaMm(0.7, 0.8, '0,7 – 0,8 mm'),
            },
            bateria: {
              modelo: 'Yuasa YTX7A-BS',
              tensaoV: 12,
              capacidadeAh: 6,
              tensaoCargaV: '13,5V – 15,0V @ 5.000 rpm',
            },
            fusivelPrincipalA: 15,
            lampadaFarol: 'HS1 12V 35/35W',
          },
          pneus: {
            dianteiro: { medida: '90/90-10 50J', pressaoPsi: 25, pressaoComGarupaPsi: 25, tipo: 'Sem câmara' },
            traseiro: { medida: '100/90-10 56J', pressaoPsi: 29, pressaoComGarupaPsi: 36, tipo: 'Sem câmara' },
          },
          transmissaoFinal: {
            tipo: 'correia',
            cvtDetalhe: {
              correiaCodigo: 'Mitsuboshi V-Belt Burgman 125i',
              larguraLimiteMm: 18.1,
              roletesMedidaPeso: '6 roletes 17x12 mm (11g)',
            },
          },
          torques: TORQUES_BURGMAN_125,
        },
      }),
    ],
  },
];
