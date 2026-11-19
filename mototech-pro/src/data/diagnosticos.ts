import type { SectionId } from '@/lib/sections';
import type { MotoSelecionada } from '@/types/moto';

export type SistemaDiagnostico =
  | 'Partida/Motor'
  | 'Alimentacao'
  | 'Eletrica'
  | 'Freios'
  | 'Chassi/Transmissao';

export type FocoArquiteturaEtapa =
  | 'todas'
  | 'injecao'
  | 'carburador'
  | 'corrente'
  | 'cvt'
  | 'disco'
  | 'tambor';

export interface EtapaDiagnosticoCorretivo {
  id: string;
  titulo: string;
  oQueVerificar: string;
  causaProvavelSeFalhar: string;
  solucaoSugerida: string;
  focoArquitetura: FocoArquiteturaEtapa;
  atalhoSecao?: {
    sectionId: SectionId;
    label: string;
  };
}

export interface CenarioDiagnosticoCorretivo {
  id: string;
  numero: number;
  sintoma: string;
  resumo: string;
  sistema: SistemaDiagnostico;
  urgencia: 'alta' | 'media';
  etapas: EtapaDiagnosticoCorretivo[];
}

export const SISTEMAS_DIAGNOSTICO: readonly SistemaDiagnostico[] = [
  'Partida/Motor',
  'Alimentacao',
  'Eletrica',
  'Freios',
  'Chassi/Transmissao',
];

export const SISTEMA_DIAGNOSTICO_LABEL: Record<SistemaDiagnostico, string> = {
  'Partida/Motor': 'Partida & Motor',
  Alimentacao: 'Alimentação & Combustível',
  Eletrica: 'Elétrica & Carga',
  Freios: 'Freios',
  'Chassi/Transmissao': 'Chassi & Transmissão',
};

export function etapaDestacadaParaMoto(
  foco: FocoArquiteturaEtapa,
  moto: MotoSelecionada,
): { aplicaDireto: boolean; badgeLabel?: string } {
  const f = moto.geracao.fichaTecnica;
  const isCvt = f.cambio.tipo === 'cvt' || f.transmissaoFinal?.tipo === 'correia';

  if (foco === 'todas') {
    return { aplicaDireto: true };
  }
  if (foco === 'injecao') {
    return {
      aplicaDireto: f.alimentacao === 'injecao',
      badgeLabel: 'Específico Injeção Eletrônica',
    };
  }
  if (foco === 'carburador') {
    return {
      aplicaDireto: f.alimentacao === 'carburador',
      badgeLabel: 'Específico Carburador',
    };
  }
  if (foco === 'corrente') {
    return {
      aplicaDireto: !isCvt,
      badgeLabel: 'Transmissão Manual / Corrente',
    };
  }
  if (foco === 'cvt') {
    return {
      aplicaDireto: isCvt,
      badgeLabel: 'Específico Scooter CVT',
    };
  }
  if (foco === 'disco') {
    return {
      aplicaDireto: f.freios.dianteiro === 'disco' || f.freios.traseiro === 'disco',
      badgeLabel: 'Freio a Disco Hidráulico',
    };
  }
  if (foco === 'tambor') {
    return {
      aplicaDireto: f.freios.traseiro === 'tambor' || f.freios.dianteiro === 'tambor',
      badgeLabel: 'Freio a Tambor Mecânico',
    };
  }

  return { aplicaDireto: true };
}

export const CENARIOS_DIAGNOSTICO: readonly CenarioDiagnosticoCorretivo[] = [
  // -------------------------------------------------------------------------
  // 1. Motor gira na partida, mas a moto não pega
  // -------------------------------------------------------------------------
  {
    id: 'motor-gira-nao-pega',
    numero: 1,
    sintoma: 'Motor gira na partida, mas a moto não pega',
    resumo:
      'Roteiro da Tríade de Combustão: eliminação rápida de corta-corrente/sensores, centelha na vela, pressão de combustível e compressão/válvulas.',
    sistema: 'Partida/Motor',
    urgencia: 'alta',
    etapas: [
      {
        id: '1-corta-corrente-combustivel',
        titulo: '1º) Checagem de 30 Segundos (Corta-Corrente, Cavalete, Sensor de Queda e Gasolina)',
        oQueVerificar:
          'Confirme se há combustível real no tanque (não confie apenas na boia), se o botão Engine Stop está em RUN, se o interruptor do cavalete lateral não está travado e (em injetadas) se o sensor de inclinação (Bank Angle / TO) está na vertical.',
        causaProvavelSeFalhar:
          'Pane seca disfarçada por boia travada, interruptor de guidão oxidado ou sensor de queda montado invertido após desmontagem de carenagem.',
        solucaoSugerida:
          'Abastecer, jumpear temporariamente o interruptor do cavalete para teste e reposicionar o sensor de inclinação com a seta "UP" para cima.',
        focoArquitetura: 'todas',
        atalhoSecao: { sectionId: 'eletrica', label: 'Ver Códigos FI (54 / 30 / C23)' },
      },
      {
        id: '1-faisca-vela-cachimbo',
        titulo: '2º) Teste de Centelha (Vela de Ignição, Cachimbo 5 kΩ e Bobina de Pulso)',
        oQueVerificar:
          'Retire a vela, encaixe no cachimbo, encoste a rosca da vela no cabeçote e dê partida: a faísca deve ser azulada e forte no eletrodo central (e não saltando pela porcelana lateral). Se não houver faísca, desrosqueie o cachimbo e teste a ponta do cabo direto a 5 mm do motor.',
        causaProvavelSeFalhar:
          'Vela em curto por excesso de combustível, resistor interno do cachimbo (5 kΩ) aberto ou bobina de pulso (CKP) sem sinal.',
        solucaoSugerida:
          'Substituir a vela pelo código exato da Ficha Técnica, testar o cachimbo na escala 20 kΩ e medir a bobina de pulso (180–300 Ω).',
        focoArquitetura: 'todas',
        atalhoSecao: { sectionId: 'eletrica', label: 'Testar Bobina e CKP no Multímetro' },
      },
      {
        id: '1-bomba-bico-injecao',
        titulo: '3º) Temporização da Bomba (3s) e Pulso do Bico Injetor',
        oQueVerificar:
          'Ao virar a chave para ON, escute se a bomba elétrica arma por ~3 segundos. Se armar, verifique com manômetro se há 2,9–3,0 bar (Honda) ou 2,5 bar (Yamaha) e se o bico injetor está pulverizando (10–14 Ω).',
        causaProvavelSeFalhar:
          'Refil da bomba queimado/travado, filtro de combustível saturado, fusível secundário 10A aberto ou conector do bico injetor frouxo (Código 12 / 39 / C32).',
        solucaoSugerida:
          'Medir chegada de 12V por 3 segundos no plug da bomba, limpar/testar o bico injetor ou substituir o refil da bomba.',
        focoArquitetura: 'injecao',
        atalhoSecao: { sectionId: 'procedimentos', label: 'Procedimento: Limpeza de Bico e TBI' },
      },
      {
        id: '1-carburador-torneira',
        titulo: '3º-B) Alimentação na Cuba do Carburador e Torneira/Vácuo',
        oQueVerificar:
          'Abra o parafuso de dreno no fundo da cuba do carburador: deve sair gasolina limpa imediatamente. Se não sair, verifique a torneira de combustível (ou mangueira de vácuo na Yes 125 / Burgman / Neo).',
        causaProvavelSeFalhar:
          'Agulha da boia travada fechada, peneira da torneira entupida ou água no fundo da cuba.',
        solucaoSugerida:
          'Esgotar a cuba pelo dreno, limpar giclês de baixa/alta e revisar estanqueidade da agulha e sede da boia.',
        focoArquitetura: 'carburador',
        atalhoSecao: { sectionId: 'ficha-tecnica', label: 'Ver Giclagem na Ficha Técnica' },
      },
      {
        id: '1-compressao-valvula-presa',
        titulo: '4º) Compressão do Cilindro e Válvula Enforcada (Presa)',
        oQueVerificar:
          'Observe se o motor gira "leve demais" (sem resistência de compressão). Coloque no PMS de compressão (marca T) e confira se há folga nos dois balancins.',
        causaProvavelSeFalhar:
          'Válvula de admissão ou escape enforcada (zero folga, impedindo vedação da câmara) ou corrente de comando fora de ponto.',
        solucaoSugerida:
          'Regular as válvulas com o motor frio conforme a Ficha Técnica (ex.: 0,08 / 0,24 mm na linha Honda 160/190).',
        focoArquitetura: 'todas',
        atalhoSecao: { sectionId: 'procedimentos', label: 'Procedimento: Regulagem de Válvulas' },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 2. Partida elétrica não gira / só dá estalo ("tec") no relé
  // -------------------------------------------------------------------------
  {
    id: 'partida-nao-gira-estalo-rele',
    numero: 2,
    sintoma: 'Partida elétrica não gira / só dá estalo ("tec") no relé',
    resumo:
      'Diagnóstico da linha de alta corrente: queda de tensão da bateria, relé de partida (auxiliar), escovas do motor de arranque e sensores de neutro/embreagem.',
    sistema: 'Eletrica',
    urgencia: 'alta',
    etapas: [
      {
        id: '2-queda-tensao-bateria',
        titulo: '1º) Teste de Queda de Tensão da Bateria no Momento da Partida',
        oQueVerificar:
          'Coloque o multímetro em DCV 20V nos bornes da bateria e aperte o botão de partida. Observe para quanto a tensão cai no instante do "tec".',
        causaProvavelSeFalhar:
          'Se a tensão cair de 12,4V para 6V ou 8V e o painel apagar, a bateria está sem corrente de partida (CCA) ou os bornes estão sulfatados/frouxos.',
        solucaoSugerida:
          'Limpar e apertar os terminais da bateria, dar carga lenta ou substituir a bateria.',
        focoArquitetura: 'todas',
        atalhoSecao: { sectionId: 'eletrica', label: 'Teste de Bateria no Multímetro' },
      },
      {
        id: '2-teste-direto-rele-partida',
        titulo: '2º) Teste dos Bornes de Potência do Relé de Partida (Chave de Fenda)',
        oQueVerificar:
          'Se a bateria mantém > 11V e o relé faz "tec", encoste uma chave de fenda grossa (cabo isolado) fechando contato direto por 1 segundo entre os DOIS parafusos grossos (M6) do relé de partida (com a moto em Neutro!).',
        causaProvavelSeFalhar:
          'Se o motor de arranque girar forte ao fechar os bornes: o contato interno de cobre do relé de partida está carbonizado. Se NÃO girar (ou só sair faísca pesada sem girar): defeito nas escovas do motor de partida!',
        solucaoSugerida:
          'Substituir o relé de partida (se girou no jumper) ou trocar o porta-escovas do motor de arranque (se não girou).',
        focoArquitetura: 'todas',
        atalhoSecao: { sectionId: 'eletrica', label: 'Ver Fios do Relé de Partida' },
      },
      {
        id: '2-escovas-motor-arranque',
        titulo: '3º) Escovas do Motor de Partida Gastas ou Coletor Sujo',
        oQueVerificar:
          'Dê duas batidas leves com o cabo de madeira/borracha do martelo no corpo do motor de partida enquanto aperta o botão Start: se girar, as escovas de carvão chegaram ao fim e não encostam mais no induzido.',
        causaProvavelSeFalhar:
          'Desgaste natural das escovas de carvão do motor de partida e acúmulo de pó de grafite no coletor.',
        solucaoSugerida:
          'Desmontar o motor de partida, limpar o coletor do induzido com lixa fina e limpa-contatos, lubrificar buchas e instalar kit de escovas novo.',
        focoArquitetura: 'todas',
      },
      {
        id: '2-interruptor-neutro-embreagem-freio',
        titulo: '4º) Relé Não Faz Nem "Tec" (Botão Start, Interruptor de Embreagem / Freio Scooter)',
        oQueVerificar:
          'Se o relé fica 100% mudo: em motos manuais, aperte a embreagem ao dar partida; em scooters (PCX/Fluo/Burgman), aperte firme o manete de freio traseiro/dianteiro (veja se a luz de freio acende!).',
        causaProvavelSeFalhar:
          'Cebolinha do freio (em scooters) ou interruptor de neutro/embreagem aberto, impedindo que o negativo/positivo chegue à bobina do relé.',
        solucaoSugerida:
          'Limpar ou substituir o interruptor da manete de freio/embreagem e aplicar limpa-contatos no botão Start.',
        focoArquitetura: 'todas',
        atalhoSecao: { sectionId: 'eletrica', label: 'Guia de Cores de Fios' },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 3. Moto falha em alta rotação, engasga ou perde força na subida
  // -------------------------------------------------------------------------
  {
    id: 'falha-alta-rotacao-perde-forca',
    numero: 3,
    sintoma: 'Moto falha em alta rotação, engasga ou perde força na subida',
    resumo:
      'Diagnóstico de restrição de fluxo e ignição sob carga: pressão da bomba de combustível, filtro obstruído, vela/cachimbo, filtro de ar e giclê principal.',
    sistema: 'Alimentacao',
    urgencia: 'media',
    etapas: [
      {
        id: '3-pressao-bomba-filtro-combustivel',
        titulo: '1º) Pressão e Vazão da Bomba de Combustível + Filtro de Linha',
        oQueVerificar:
          'Em marcha lenta a moto parece perfeita, mas quando exige carga (subida ou acima de 80 km/h) ela "amarra" ou dá cabeçadas. Instale o manômetro na linha e acelere sob carga.',
        causaProvavelSeFalhar:
          'Filtro de combustível entupido, pré-filtro (saquinho) da bomba sujo ou refil da bomba cansado caindo de 3,0 bar para menos de 2,0 bar em alta.',
        solucaoSugerida:
          'Substituir o filtro de combustível externo/interno e medir a pressão estanque do regulador de pressão.',
        focoArquitetura: 'injecao',
        atalhoSecao: { sectionId: 'eletrica', label: 'Teste de Bomba de Combustível' },
      },
      {
        id: '3-gicle-alta-diafragma-carburador',
        titulo: '1º-B) Giclê de Alta, Nível de Boia e Diafragma do Pistão a Vácuo',
        oQueVerificar:
          'Em motos com carburador a vácuo (CG 150 2004–2008, YBR/Factor 125, Yes 125, Intruder 125), verifique se o diafragma de borracha superior não tem microfuro ou se o giclê principal está parcialmente obstruído.',
        causaProvavelSeFalhar:
          'Diafragma furado (o pistonete não sobe todo quando abre o acelerador) ou respiro da tampa do tanque entupido criando vácuo no tanque.',
        solucaoSugerida:
          'Inspecionar o diafragma contra a luz, limpar o giclê de alta e conferir o respiro da tampa do tanque.',
        focoArquitetura: 'carburador',
        atalhoSecao: { sectionId: 'ficha-tecnica', label: 'Conferir Medida dos Giclês' },
      },
      {
        id: '3-fuga-corrente-vela-bobina',
        titulo: '2º) Fuga de Centelha no Cachimbo / Vela Sob Alta Pressão de Cilindro',
        oQueVerificar:
          'Inspecione a vela de ignição quanto a desgaste do eletrodo (> 1,0 mm) ou trinca na cerâmica branca, e verifique se o cachimbo não está oxidado.',
        causaProvavelSeFalhar:
          'Em alta rotação a pressão dentro do cilindro é máxima: uma bobina fraca ou vela com gap aberto falha justamente sob carga.',
        solucaoSugerida:
          'Calibrar a folga da vela (0,8–0,9 mm na Honda/Yamaha, 0,7–0,8 mm na Suzuki) ou instalar vela nova.',
        focoArquitetura: 'todas',
        atalhoSecao: { sectionId: 'ficha-tecnica', label: 'Ver Vela e Folga na Ficha Técnica' },
      },
      {
        id: '3-filtro-ar-afogador',
        titulo: '3º) Filtro de Ar Saturado (Especialmente Filtro Viscoso de Papel)',
        oQueVerificar:
          'Inspecione o elemento do filtro de ar. Atenção: filtros de papel viscoso (CG 160, Bros 160, Factor 150, PCX) NÃO podem ser soprados com ar comprimido — quando saturam de poeira fina, estrangulam a moto em alta.',
        causaProvavelSeFalhar:
          'Restrição severa de entrada de ar deixando a mistura excessivamente rica em alta rotação.',
        solucaoSugerida:
          'Substituir o elemento do filtro de ar (ou lavar e umedecer com óleo apenas nos filtros de espuma das 125/Intruder/XTZ 125).',
        focoArquitetura: 'todas',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 4. Marcha lenta instável ou moto morre ao parar no semáforo
  // -------------------------------------------------------------------------
  {
    id: 'marcha-lenta-instavel-morre-quente',
    numero: 4,
    sintoma: 'Marcha lenta instável ou moto morre ao parar no semáforo',
    resumo:
      'As 4 causas campeãs de oficina: válvula de escape presa (motor morre quente), TBI/IACV carbonizado, falta de reset de combustível Flex e entrada falsa de ar.',
    sistema: 'Alimentacao',
    urgencia: 'media',
    etapas: [
      {
        id: '4-valvula-escape-presa',
        titulo: '1º) Válvula de Escape Enforcada / Presa (Morre Quando Esquenta!)',
        oQueVerificar:
          'Se a moto pega bem fria, mas depois de rodar 10 a 15 minutos no trânsito começa a apagar toda vez que você aperta a embreagem para parar no semáforo: confira a folga de válvulas com o motor frio!',
        causaProvavelSeFalhar:
          'Com o calor, a haste da válvula dilata: se a folga de escape estiver menor que o manual (ex.: deixaram 0,12 mm numa CG 160/Bros 160/XRE 190 que exige 0,24 mm), a válvula não fecha 100% quente e perde compressão em baixa.',
        solucaoSugerida:
          'Regular as válvulas rigorosamente na medida da Ficha Técnica com motor frio (< 35 °C).',
        focoArquitetura: 'todas',
        atalhoSecao: { sectionId: 'procedimentos', label: 'Procedimento: Regulagem de Válvulas' },
      },
      {
        id: '4-tbi-iacv-reset-flex',
        titulo: '2º) Carbonização no Corpo de Borboleta (TBI / IACV) e Reset do TPS/ECM',
        oQueVerificar:
          'Verifique acúmulo de borra preta ao redor da borboleta e no canal da válvula de controle de marcha lenta (IACV/ISC), especialmente se o cliente trocou de gasolina para etanol recentemente.',
        causaProvavelSeFalhar:
          'A crosta de carvão veda a fresta mínima de ar da marcha lenta ou a central ECM está com o mapa de álcool/gasolina descalibrado.',
        solucaoSugerida:
          'Descarbonizar o TBI (cuidando para não jogar CAR 80 no sensor MAP) e executar o Reset do TPS/ECM.',
        focoArquitetura: 'injecao',
        atalhoSecao: { sectionId: 'procedimentos', label: 'Procedimento: Limpeza de TBI e Bico' },
      },
      {
        id: '4-parafuso-mistura-gicle-baixa',
        titulo: '2º-B) Giclê de Baixa Entupido e Regulagem do Parafuso de Mistura',
        oQueVerificar:
          'Com o motor aquecido, ajuste a rotação em ~1.400 rpm e regule o parafuso de mistura de ar/combustível conforme o padrão da Ficha Técnica (ex.: 1 e 7/8 a 2 voltas).',
        causaProvavelSeFalhar:
          'Giclê de marcha lenta (#38/#40) obstruído por goma de gasolina velha ou O-ring do parafuso de mistura ressecado.',
        solucaoSugerida:
          'Limpar o circuito de baixa com ar e descarbonizante e acertar o ponto de maior rotação no parafuso de mistura.',
        focoArquitetura: 'carburador',
        atalhoSecao: { sectionId: 'ficha-tecnica', label: 'Ver Voltas do Parafuso de Mistura' },
      },
      {
        id: '4-entrada-falsa-ar-coletor',
        titulo: '3º) Entrada Falsa de Ar no Coletor de Admissão ou Isolador',
        oQueVerificar:
          'Com o motor em marcha lenta, borrife um pouco de água com sabão (ou limpa-contatos com cuidado) ao redor da junção do coletor de admissão com o cabeçote: se a rotação alterar, há entrada falsa de ar.',
        causaProvavelSeFalhar:
          'Anel O-ring do coletor achatado, coletor de borracha rachado ou abraçadeira frouxa empobrecendo a mistura.',
        solucaoSugerida:
          'Substituir o O-ring de vedação do isolador/coletor de admissão.',
        focoArquitetura: 'todas',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 5. Bateria descarregando rápido / farol fraco ou queimando lâmpada
  // -------------------------------------------------------------------------
  {
    id: 'bateria-descarregando-farol-queimando',
    numero: 5,
    sintoma: 'Bateria descarregando rápido / farol fraco ou queimando lâmpada',
    resumo:
      'Isolamento completo entre bateria morta, estator sem geração, retificador em sobrecarga/fuga e consumo parasita de rastreador/alarme.',
    sistema: 'Eletrica',
    urgencia: 'alta',
    etapas: [
      {
        id: '5-tensao-carga-5000rpm',
        titulo: '1º) Medir Tensão de Carga nos Polos da Bateria a 5.000 RPM',
        oQueVerificar:
          'Com multímetro em DCV 20V na bateria e motor a 5.000 rpm: verifique se a tensão está abaixo de 13,2V (não carrega), entre 13,5V e 14,8V (normal) ou acima de 15,0V (sobrecarga queimando lâmpadas!).',
        causaProvavelSeFalhar:
          'Se passar de 15,0V: o Regulador/Retificador entrou em curto e está jogando tensão bruta nas lâmpadas e estufando a bateria. Se ficar em 12,0V: sistema não está gerando carga.',
        solucaoSugerida:
          'Se > 15V, substituir o Retificador/Regulador imediatamente. Se < 13,2V, passar para o teste do estator abaixo.',
        focoArquitetura: 'todas',
        atalhoSecao: { sectionId: 'eletrica', label: 'Teste de Bateria & Carga' },
      },
      {
        id: '5-teste-estator-ac',
        titulo: '2º) Teste do Estator (Resistência Ω, Isolamento de Massa e Tensão AC~)',
        oQueVerificar:
          'Desconecte o plug do estator: meça a resistência entre as fases (0,3–1,5 Ω), verifique se não há curto com a carcaça e meça a tensão AC~ a 5.000 rpm (deve dar 45V a 80V AC).',
        causaProvavelSeFalhar:
          'Bobina do estator carbonizada/aterrada (muito comum quando o nível de óleo do motor roda baixo, pois o óleo resfria o estator!).',
        solucaoSugerida:
          'Se o estator gera 60V+ AC e não tem curto com a massa, troque o Retificador. Se o estator não gera ou apita com o chassi, substitua o Estator.',
        focoArquitetura: 'todas',
        atalhoSecao: { sectionId: 'eletrica', label: 'Teste Completo do Estator' },
      },
      {
        id: '5-fuga-corrente-rastreador',
        titulo: '3º) Teste de Fuga de Corrente (Rastreador, Alarme, USB ou Diodo do Retificador)',
        oQueVerificar:
          'Se o sistema carrega 14,2V perfeitamente, mas a bateria amanhece arriada após 2 dias parada: desligue a chave, solte o cabo negativo da bateria e ligue o multímetro em série na escala mA (Amperímetro DC).',
        causaProvavelSeFalhar:
          'Consumo parasita em repouso acima de 3 mA causado por rastreador com bateria interna viciada, tomada USB xing-ling com LED aceso direto ou diodo do retificador em fuga.',
        solucaoSugerida:
          'Desconectar acessórios um a um (e o plug do retificador) olhando o multímetro até a fuga cair a zero.',
        focoArquitetura: 'todas',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 6. Barulho metálico no motor (válvula, corrente de comando, embreagem, biela)
  // -------------------------------------------------------------------------
  {
    id: 'barulho-metalico-motor',
    numero: 6,
    sintoma: 'Barulho metálico no motor (diferenciar válvula, corrente de comando, embreagem e biela)',
    resumo:
      'Guia auditivo e mecânico para localizar a origem exata de batidas e chocalhos no motor sem desmontar à toa.',
    sistema: 'Partida/Motor',
    urgencia: 'alta',
    etapas: [
      {
        id: '6-tec-tec-agudo-cabecote',
        titulo: '1º) "Tec-Tec-Tec" Agudo no Topo do Cabeçote (Válvulas / Balancins)',
        oQueVerificar:
          'Som metálico fino e ritmado na parte superior do cabeçote, que acompanha metade da rotação do motor e fica mais audível na tampa de válvulas.',
        causaProvavelSeFalhar:
          'Folga excessiva nos parafusos reguladores de válvula ou desgaste nos roletes/pinos dos balancins (ou varetas na CG 125 OHV).',
        solucaoSugerida:
          'Conferir e calibrar a folga de admissão e escape com motor frio usando o cálibre de lâminas.',
        focoArquitetura: 'todas',
        atalhoSecao: { sectionId: 'procedimentos', label: 'Procedimento: Regulagem de Válvulas' },
      },
      {
        id: '6-chocalho-corrente-comando',
        titulo: '2º) "Chocalho / Raspado" na Lateral Esquerda do Cilindro (Corrente de Comando / Acionador)',
        oQueVerificar:
          'Som de corrente chicoteando na lateral do cilindro, especialmente ao desacelerar entre 3.000 e 4.000 rpm.',
        causaProvavelSeFalhar:
          'Mola do acionador (tensor) da corrente de comando cansada sem pressão na catraca, guias plásticos gastos ou corrente de comando no fim de curso.',
        solucaoSugerida:
          'Remover o acionador externo no cilindro, testar se a haste trava ao ser empurrada (substituir acionador ou kit corrente de comando).',
        focoArquitetura: 'todas',
      },
      {
        id: '6-campana-embreagem',
        titulo: '3º) Ruído Grave em Ponto Morto que SOME ao Apertar a Embreagem (Campana)',
        oQueVerificar:
          'Em ponto morto faz um "cloc-cloc" ou ronco na tampa direita; quando você aperta o manete da embreagem, o motor fica silencioso na hora.',
        causaProvavelSeFalhar:
          'Folga nas borrachas amortecedoras internas da campana da embreagem ou rolamento de encosto.',
        solucaoSugerida:
          'Abrir a tampa direita para revisar a campana (aproveitando para limpar o filtro centrífugo e a peneira nas Honda).',
        focoArquitetura: 'corrente',
        atalhoSecao: { sectionId: 'procedimentos', label: 'Procedimento: Tampa Direita & Centrífugo' },
      },
      {
        id: '6-batida-seca-biela-pistao',
        titulo: '4º) Batida Seca e Forte Sob Carga ("Toc-Toc-Toc" ao Acelerar — Pino/Biela ou Saia de Pistão)',
        oQueVerificar:
          'Som pesado e grave vindo do centro/baixo do motor que aumenta forte ao abrir o acelerador em subida.',
        causaProvavelSeFalhar:
          'Folga na gaiola de agulhas da cabeça da biela (frequentemente causada por rodar sem óleo ou por filtro centrífugo entupido que cortou a lubrificação do virabrequim).',
        solucaoSugerida:
          'Drenar o óleo procurando limalha dourada/prateada e desmontar a parte de força para retífica/substituição do kit biela e cilindro.',
        focoArquitetura: 'todas',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 7. Consumo alto, fumaça escura ou vela encharcada/carbonizada
  // -------------------------------------------------------------------------
  {
    id: 'consumo-alto-fumaca-vela-preta',
    numero: 7,
    sintoma: 'Consumo alto, fumaça escura ou vela encharcada/carbonizada',
    resumo:
      'Diferenciação técnica entre excesso de combustível (fumaça preta / fuligem seca) e queima de óleo lubrificante (fumaça azulada/branca / crosta oleosa).',
    sistema: 'Alimentacao',
    urgencia: 'media',
    etapas: [
      {
        id: '7-cor-fumaca-aspecto-vela',
        titulo: '1º) Leitura da Vela: Fuligem Preta Seca (Excesso) vs Crosta Preta Úmida de Óleo',
        oQueVerificar:
          'Retire a vela: se a ponta estiver coberta de pó preto SECO e a fumaça no escape for escura com cheiro de combustível cru, é mistura rica. Se a rosca/eletrodo estiver molhado de ÓLEO e a fumaça for azulada/esbranquiçada com cheiro de óleo queimado, é passagem de óleo para a câmara.',
        causaProvavelSeFalhar:
          'Mistura rica = filtro de ar entupido, bico gotejando, sensor EOT/O2 ou boia alta. Óleo = retentores de válvula ressecados ou anéis de segmento gastos.',
        solucaoSugerida:
          'Identificar qual dos dois caminhos abaixo atacar primeiro.',
        focoArquitetura: 'todas',
      },
      {
        id: '7-bico-gotejando-sensor-eot-o2',
        titulo: '2º) Bico Injetor Gotejando (Sem Estanqueidade) ou Sensor EOT/Sonda O2',
        oQueVerificar:
          'Se o sensor EOT indicar para a central que o motor está sempre a -20 °C (fio com mau contato), a central injeta dose dupla o tempo todo. Verifique também se o bico injetor não fica pingando quando pressurizado.',
        causaProvavelSeFalhar:
          'Bico injetor travado aberto por sujeira ou leitura errada da sonda lambda / sensor de temperatura.',
        solucaoSugerida:
          'Limpar e testar estanqueidade do bico injetor, checar códigos na luz FI e fazer reset do ECM.',
        focoArquitetura: 'injecao',
        atalhoSecao: { sectionId: 'eletrica', label: 'Ver Teste dos Sensores EOT e Sonda O2' },
      },
      {
        id: '7-freio-preso-relacao-calibragem',
        titulo: '3º) Arrasto Mecânico Oculto (Pneu Murcho, Freio Enforcado ou Corrente Seca)',
        oQueVerificar:
          'No cavalete central, gire as duas rodas com a mão: elas devem dar várias voltas livres. Confira também a pressão dos pneus com manômetro.',
        causaProvavelSeFalhar:
          'Pneu rodando com 15 PSI (em vez de 25/29–33 PSI) ou pinça de freio com pino guia travado aumenta o consumo em até 25%!',
        solucaoSugerida:
          'Calibrar os pneus conforme a Ficha Técnica e destravar/lubrificar os pinos da pinça ou eixo came do tambor.',
        focoArquitetura: 'todas',
        atalhoSecao: { sectionId: 'ficha-tecnica', label: 'Ver Pressão dos Pneus (PSI)' },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 8. Freio borrachudo, travando ou tambor sem eficiência / chiando
  // -------------------------------------------------------------------------
  {
    id: 'freio-borrachudo-travando-chiando',
    numero: 8,
    sintoma: 'Freio borrachudo, travando ou tambor sem eficiência / chiando',
    resumo:
      'Solução definitiva para manete esponjoso (ar no circuito / CBS), roda presa após frear e tambor traseiro vitrificado.',
    sistema: 'Freios',
    urgencia: 'alta',
    etapas: [
      {
        id: '8-manete-esponjoso-ar-sangria',
        titulo: '1º) Manete "Borrachudo" Encostando no Punho (Ar no Sistema ou Fluido Velho)',
        oQueVerificar:
          'Se o manete vai fundo e só pega pressão depois de bombear 2 ou 3 vezes: há bolhas de ar na linha ou o fluido DOT 4 absorveu umidade e ferveu.',
        causaProvavelSeFalhar:
          'Falta de sangria completa ou, nas motos Honda CBS (CG 160 / Bros 160 / Biz EX), esqueceram de sangrar o SEGUNDO sangrador da pinça dianteira acionado pelo pedal traseiro.',
        solucaoSugerida:
          'Executar a sangria completa com DOT 4 novo (nas duas válvulas sangradoras se for sistema CBS).',
        focoArquitetura: 'disco',
        atalhoSecao: { sectionId: 'procedimentos', label: 'Procedimento: Sangria Hidráulica & CBS' },
      },
      {
        id: '8-freio-disco-prendendo-roda',
        titulo: '2º) Roda Dianteira Pesada / Presa Após Soltar o Manete',
        oQueVerificar:
          'Verifique se os dois pinos guias do suporte da pinça deslizam livres e se os pistões não foram empurrados sujos para dentro na última troca de pastilha.',
        causaProvavelSeFalhar:
          'Colocaram graxa comum (derivada de petróleo) nos pinos guias inchando as coifas de borracha, ou o furo de retorno do burrinho (cilindro mestre) está obstruído.',
        solucaoSugerida:
          'Limpar pistões, lavar coifas e lubrificar os pinos guias exclusivamente com graxa de silicone.',
        focoArquitetura: 'disco',
        atalhoSecao: { sectionId: 'procedimentos', label: 'Procedimento: Pastilhas & Limpeza da Pinça' },
      },
      {
        id: '8-tambor-chiando-pedal-duro',
        titulo: '3º) Freio a Tambor Apitando Alto, Sem Força ou Pedal Não Volta',
        oQueVerificar:
          'Desmonte o espelho traseiro: verifique se a pista do cubo está brilhando como espelho (vitrificada) e se o eixo came ("S") está seco e oxidado.',
        causaProvavelSeFalhar:
          'Cubo espelhado cheio de fuligem acumulada e eixo came engripado por falta de limpeza.',
        solucaoSugerida:
          'Passar lixa 160 ou 180 no cubo e na lona, soprar todo o pó, aplicar película mínima de graxa no eixo came e centralizar o espelho pisando no freio ao apertar o eixo.',
        focoArquitetura: 'tambor',
        atalhoSecao: { sectionId: 'procedimentos', label: 'Procedimento: Troca de Lona & Limpeza do Cubo' },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 9. Moto instável / traseira "sambando", direção travando ou bengala vazando
  // -------------------------------------------------------------------------
  {
    id: 'moto-instavel-traseira-sambando-direcao',
    numero: 9,
    sintoma: 'Moto instável / traseira "sambando", direção travando ou bengala melada de óleo',
    resumo:
      'Inspeção estrutural de ciclística: buchas da balança, rolamentos de roda, calo na caixa de direção e retentor de suspensão dianteira.',
    sistema: 'Chassi/Transmissao',
    urgencia: 'alta',
    etapas: [
      {
        id: '9-traseira-sambando-bucha-balanca',
        titulo: '1º) Traseira "Sambando" em Curvas ou ao Passar em Faixa Pintada (Bucha da Balança vs Rolamento)',
        oQueVerificar:
          'Com a roda traseira suspensa, segure o pneu às 9h e 3h e force lateralmente: veja se o jogo está no cubo da roda (rolamentos estourados) ou na frente do garfo traseiro junto ao chassi (buchas da balança gastas).',
        causaProvavelSeFalhar:
          'Buchas do quadro elástico estouradas ou rolamento 6202/6301 do cubo traseiro com folga.',
        solucaoSugerida:
          'Substituir o kit de buchas e espaçadores da balança (engraxando bem o eixo) ou os rolamentos do cubo.',
        focoArquitetura: 'todas',
        atalhoSecao: { sectionId: 'procedimentos', label: 'Procedimento: Troca da Bucha da Balança' },
      },
      {
        id: '9-calo-caixa-direcao',
        titulo: '2º) Guidão com "Calo" no Centro ou Estalo Seco ao Frear na Lombada (Caixa de Direção)',
        oQueVerificar:
          'Com a roda dianteira no ar, gire o guidão bem devagar de um lado ao outro: se sentir uma "travadinha" exatamente no meio (como se caísse num degrau), as pistas da caixa de direção estão marcadas pelas esferas.',
        causaProvavelSeFalhar:
          'Pistas da caixa de direção com calos ou porca castelo da coluna frouxa.',
        solucaoSugerida:
          'Substituir o conjunto completo da caixa de direção (pistas + colares/roletes) e ajustar a pré-carga.',
        focoArquitetura: 'todas',
        atalhoSecao: { sectionId: 'procedimentos', label: 'Procedimento: Troca da Caixa de Direção' },
      },
      {
        id: '9-bengala-vazando-oleo',
        titulo: '3º) Canela da Bengala Melada de Óleo ou Batendo Seco no Fim de Curso',
        oQueVerificar:
          'Verifique anéis de óleo no tubo cromado (cuidado: óleo da bengala escorre para o disco de freio e contamina as pastilhas!) e passe a unha no tubo cromado procurando riscos ou pontos de ferrugem.',
        causaProvavelSeFalhar:
          'Retentor de bengala cortado ou fluido vencido/abaixo do volume.',
        solucaoSugerida:
          'Substituir retentores e guarda-pós e abastecer no copo graduado a quantidade exata em ml por canela da Ficha Técnica.',
        focoArquitetura: 'todas',
        atalhoSecao: { sectionId: 'procedimentos', label: 'Procedimento: Retentor e Fluido da Bengala' },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 10. Embreagem patinando / marchas duras (ou CVT trepidando em scooters)
  // -------------------------------------------------------------------------
  {
    id: 'embreagem-patinando-marchas-duras-cvt',
    numero: 10,
    sintoma: 'Embreagem patinando / marchas duras (ou CVT patinando/trepidando em scooters)',
    resumo:
      'Diagnóstico da transmissão primária e secundária: folga do cabo, discos queimados, regulagem da semiautomática (Biz/Pop/Crypton) e polias/roletes CVT.',
    sistema: 'Chassi/Transmissao',
    urgencia: 'media',
    etapas: [
      {
        id: '10-folga-manete-cabo-embreagem',
        titulo: '1º) Folga Livre do Manete de Embreagem (10 a 20 mm) e Óleo Correto (JASO MA)',
        oQueVerificar:
          'Antes de abrir a tampa da embreagem: verifique se o manete tem de 10 a 20 mm de folga livre na ponta antes de começar a puxar o braço. Se estiver esticado sem folga, a embreagem fica pré-acionada e patina em subida!',
        causaProvavelSeFalhar:
          'Cabo de embreagem enforcado sem folga, discos de fibra gastos ou uso de óleo automotivo com redutor de atrito (que faz a embreagem banhada a óleo deslizar).',
        solucaoSugerida:
          'Deixar 10–20 mm de folga no manete, usar óleo com norma JASO MA/MA2 e, se persistir, trocar o kit de discos, separadores e molas.',
        focoArquitetura: 'corrente',
        atalhoSecao: { sectionId: 'ficha-tecnica', label: 'Ver Folga e Óleo JASO na Ficha' },
      },
      {
        id: '10-regulagem-externa-cub',
        titulo: '2º) Regulagem Externa da Embreagem Semiautomática (Biz 125 / Pop 110i / Crypton)',
        oQueVerificar:
          'Nas CUBs sem manete de embreagem, se o pedal de câmbio estiver duro para engatar ou patinando: utilize o parafuso regulador externo na tampa lateral do motor.',
        causaProvavelSeFalhar:
          'Desajuste do mecanismo acionador do câmbio rotativo ou excesso de óleo no cárter (lembre-se: a Biz 125 leva apenas 700 ml na troca!).',
        solucaoSugerida:
          'Soltar a contraporca externa (14 mm), girar o parafuso de ajuste até sentir resistência do encosto e retornar 1/8 a 1/4 de volta.',
        focoArquitetura: 'corrente',
      },
      {
        id: '10-cvt-scooter-trepidando',
        titulo: '3º) Scooter Trepidando na Saída ou Sem Velocidade Final (CVT: Campana, Roletes e Correia)',
        oQueVerificar:
          'Em scooters (PCX 150/160, Fluo 125, Neo 125, Burgman 125): se a moto trepida ao arrancar devagar, há pó de sapata acumulado na campana traseira. Se o motor berra e não desenvolve, os roletes estão quadrados ou a correia gastou abaixo da largura limite.',
        causaProvavelSeFalhar:
          'Vitrificação das sapatas da embreagem centrífuga seca, roletes com calo ou correia V-Belt desgastada.',
        solucaoSugerida:
          'Abrir a tampa do CVT, soprar o pó, lixar de leve a campana e as sapatas com lixa 160/180, conferir se os 6 roletes estão perfeitamente cilíndricos e medir a largura da correia.',
        focoArquitetura: 'cvt',
        atalhoSecao: { sectionId: 'ficha-tecnica', label: 'Ver Código da Correia e Roletes CVT' },
      },
    ],
  },
];
