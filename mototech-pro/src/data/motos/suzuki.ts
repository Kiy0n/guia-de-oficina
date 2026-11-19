import { faixaMm, faixaRpm, geracao, torque } from '@/data/motos/helpers';
import type { FichaTecnica, Modelo, TorqueAperto } from '@/types/moto';

const MOTOR_SOHC_2V = 'Monocilíndrico 4T SOHC 2 válvulas';

// ---------------------------------------------------------------------------
// Tabelas de Torque Padrão Suzuki (Manuais de Serviço EN125 / GN125)
// ---------------------------------------------------------------------------

const TORQUES_SUZUKI_125: TorqueAperto[] = [
  torque(
    'Bujão de drenagem do óleo do motor',
    18,
    'motor',
    '15 – 20 N·m (1,5 – 2,0 kgf·m) • Fonte externa: Google (Scribd / EuCurtoMoto / YouTube) — cuidado com rosca do cárter de alumínio',
  ),
  torque(
    'Vela de ignição (NGK CR8E / CR7E)',
    13,
    'motor',
    '11 – 15 N·m (1,1 – 1,5 kgf·m) • Fonte externa: Google (Scribd / EuCurtoMoto)',
  ),
  torque(
    'Porca do eixo dianteiro',
    45,
    'chassi',
    '35 – 55 N·m (3,5 – 5,5 kgf·m) • Fonte externa: Google (Scribd / EuCurtoMoto)',
  ),
  torque(
    'Porca do eixo traseiro',
    55,
    'chassi',
    '50 – 60 N·m (Intruder) / 50 – 80 N·m (Yes) • Fonte externa: Google (Scribd / EuCurtoMoto)',
  ),
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
    valvulaAdmissaoMm: faixaMm(0.05, 0.1, '0,05 – 0,10 mm (fonte web)'),
    valvulaEscapeMm: faixaMm(0.05, 0.1, '0,05 – 0,10 mm (fonte web; até 0,12 mm em algumas referências)'),
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
  torques: TORQUES_SUZUKI_125,
};

// ---------------------------------------------------------------------------
// Catálogo SUZUKI (2 modelos / 3 gerações)
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
          'OBSERVAÇÃO (FONTE WEB): o portal Suzuki Brasil não hospeda o PDF da Intruder 125; dados conferidos em fontes externas (Google: Scribd, EuCurtoMoto, Docsity, blogs técnicos).',
          'ATENÇÃO AO FILTRO DE ÓLEO: atrás do filtro de papel existe um pequeno anel O-ring interno no duto do bloco e uma mola na tampa — se o O-ring for descartado com o filtro velho, a pressão de óleo cai e funde o comando!',
          'Óleo SAE 20W-50 (ou 10W-40) API SF/SG/SL JASO MA: ~850 ml sem filtro / ~950 a 1.000 ml com troca do filtro (sempre conferir o nível final no visor de vidro).',
          'Folga de válvulas (fonte web): 0,05 – 0,10 mm (Adm e Esc; algumas referências citam até 0,08–0,12 mm no escape) • Vela NGK CR8E (0,7–0,8 mm) • Bengala 174 ml por canela • Bujão de óleo 15–20 N·m.',
        ],
        auditoria: {
          status: 'fonte_web',
          ultimaRevisao: '2026-11-19',
          origemExterna: 'Google (Scribd, EuCurtoMoto, Docsity, Blogs técnicos)',
          fonte:
            'Pesquisa Web autorizada (Google: transcrições do Manual de Serviço Suzuki Intruder 125 no Scribd, EuCurtoMoto, Docsity e blogs técnicos)',
          notas:
            'Sem PDF local em public/manuals/. Dados conferidos via fontes web: óleo SAE 20W-50/10W-40 JASO MA (850 ml sem filtro / 950–1.000 ml com filtro); válvulas 0,05–0,10 mm (motor frio); vela NGK CR8E (0,7–0,8 mm); bengala 174 ml por canela; torques bujão 15–20 N·m, eixo diant. 35–55 N·m, eixo tras. 50–60 N·m.',
        },
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
          'OBSERVAÇÃO (FONTE WEB): o portal Suzuki Brasil não hospeda o PDF da Intruder 125; dados conferidos em fontes externas (Google: Scribd, EuCurtoMoto, Docsity, blogs técnicos).',
          'Carburador Mikuni BS26 a vácuo é muito sensível a rasgos no diafragma do pistonete e ressecamento do coletor de admissão.',
          'Nunca esquecer de conferir o O-ring interno do alojamento do filtro de óleo e a mola da tampa (~850 ml sem filtro / ~950 a 1.000 ml com filtro — conferir nível final no visor de vidro).',
          'Folga de válvulas (fonte web): 0,05 – 0,10 mm (motor frio) • Vela NGK CR8E (0,7–0,8 mm) • Bengala 174 ml por canela • Bujão de óleo 15–20 N·m.',
        ],
        auditoria: {
          status: 'fonte_web',
          ultimaRevisao: '2026-11-19',
          origemExterna: 'Google (Scribd, EuCurtoMoto, Docsity, Blogs técnicos)',
          fonte:
            'Pesquisa Web autorizada (Google: transcrições do Manual de Serviço Suzuki Intruder 125 no Scribd, EuCurtoMoto, Docsity e blogs técnicos)',
          notas:
            'Sem PDF local em public/manuals/. Dados conferidos via fontes web: óleo SAE 20W-50/10W-40 JASO MA (850 ml sem filtro / 950–1.000 ml com filtro); válvulas 0,05–0,10 mm (motor frio); vela NGK CR8E (0,7–0,8 mm); bengala 174 ml por canela; torques bujão 15–20 N·m, eixo diant. 35–55 N·m, eixo tras. 50–60 N·m.',
        },
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
          'OBSERVAÇÃO (FONTE WEB): o portal Suzuki Brasil não hospeda o PDF da Yes 125 / EN125; dados conferidos em fontes externas (Google: MotosBlog, YouTube, Scribd, EuCurtoMoto, OnlyCars).',
          'ATENÇÃO AO VOLUME DE ÓLEO: fontes web divergem entre 850/950 ml (bloco GN125) e 1,1 L sem filtro / 1,2 L com filtro (Manual EN125 Yes citado em MotosBlog/YouTube) — SEMPRE abastecer aos poucos e conferir o nível exato no visor de vidro com a moto nivelada!',
          'Folga de válvulas (fonte web): 0,05 – 0,10 mm (várias referências recomendam 0,10 mm em admissão e escape com motor frio para evitar válvulas presas) • Vela NGK CR7E (ou CR8E) com folga 0,7 – 0,8 mm.',
          'Bengala dianteira (fonte web): ~153 – 155 ml de óleo 10W por canela • Relação 14x45 (corrente 428H x 118L) • Rodas aro 18.',
        ],
        auditoria: {
          status: 'fonte_web',
          ultimaRevisao: '2026-11-19',
          origemExterna: 'Google (MotosBlog, YouTube, Scribd, EuCurtoMoto)',
          fonte:
            'Pesquisa Web autorizada (Google: transcrições do Manual de Serviço Suzuki EN125 Yes no Scribd, EuCurtoMoto, MotosBlog e YouTube)',
          notas:
            'Sem PDF local em public/manuals/. Dados conferidos via fontes web: óleo 10W-40/20W-50 API SF–SL JASO MA (1,1 L troca / 1,2 L com filtro / 1,4 L desmontagem segundo fontes web da EN125 — conferir sempre no visor de vidro); válvulas 0,05–0,10 mm (0,10 mm recomendado); vela NGK CR7E / DENSO U22ESR-N (0,7–0,8 mm); bengala 153–155 ml; torques bujão 10–20 N·m, vela 11–15 N·m, eixo diant. 35–55 N·m, eixo tras. 50–80 N·m.',
        },
        fichaTecnica: {
          ...suzuki125Base,
          versaoReferencia: 'Yes SE',
          pesoSecoKg: 112,
          motorDetalhes: {
            ...suzuki125Base.motorDetalhes,
            alimentacaoDetalhe:
              'Carburador Mikuni BS26 a vácuo • Giclagem e ajustes internos: fonte web (confirmar no Manual de Serviço)',
          },
          fluidos: {
            ...suzuki125Base.fluidos,
            oleoMotor: {
              especificacao: 'SAE 10W-40 ou 20W-50 (API SF/SG/SH/SJ/SL / JASO MA)',
              capacidadeTrocaL: 1.1,
              capacidadeTrocaComFiltroL: 1.2,
              capacidadeTotalL: 1.4,
              observacao:
                'Fonte web (MotosBlog/YouTube/Scribd): 1,1 L troca / 1,2 L com filtro / 1,4 L desmontagem — conferir nível final no visor de vidro',
            },
            tanqueL: 14.0,
            reservaL: 2.0,
            fluidoBengala: {
              especificacao: 'Óleo para garfo 10W (fonte web: EuCurtoMoto / Scribd)',
              volumePorCanelaMl: 154,
              observacao: '153 – 155 ml por canela (fonte web)',
            },
          },
          eletrica: {
            ...suzuki125Base.eletrica,
            vela: {
              modelo: 'NGK CR7E (ou DENSO U22ESR-N / NGK CR8E)',
              folgaEletrodoMm: faixaMm(0.7, 0.8, '0,7 – 0,8 mm (fonte web)'),
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
];
