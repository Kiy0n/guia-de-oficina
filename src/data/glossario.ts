export interface TermoGlossario {
  sigla: string;
  nomeCompleto: string;
  explicacao: string;
  ondeAparece: string;
}

export const GLOSSARIO_SIGLAS: readonly TermoGlossario[] = [
  {
    sigla: 'PMS',
    nomeCompleto: 'Ponto Morto Superior',
    explicacao:
      'Momento exato em que o pistão chega no ponto mais alto do cilindro (marca "T" no volante). Usado para regular válvulas e conferir o ponto da corrente de comando.',
    ondeAparece: 'Regulagem de válvulas e sincronismo do motor',
  },
  {
    sigla: 'TBI',
    nomeCompleto: 'Throttle Body Injection (Corpo de Borboleta)',
    explicacao:
      'Peça que substitui o carburador nas motos injetadas: controla a entrada de ar pela borboleta e aloja sensores (TPS/MAP/IAT) e a válvula de marcha lenta.',
    ondeAparece: 'Motos com injeção eletrônica (PGM-FI / BlueFlex / DCP-FI)',
  },
  {
    sigla: 'CBS',
    nomeCompleto: 'Combined Brake System (Freio Combinado Honda)',
    explicacao:
      'Sistema em que apertar o freio traseiro aciona automaticamente parte do freio dianteiro. Nas pinças a disco CBS existem 3 pistões e 2 sangradores independentes.',
    ondeAparece: 'Honda CG 160 (2018+), Bros 160 ESDD, Biz 110i (2018+), Biz 125 e Pop ES',
  },
  {
    sigla: 'UBS',
    nomeCompleto: 'Unified Brake System (Freio Unificado Yamaha)',
    explicacao:
      'Equivalente Yamaha ao CBS: distribui a força de frenagem entre a roda traseira e dianteira ao acionar o pedal traseiro.',
    ondeAparece: 'Yamaha Factor 125i/150, Fazer 150, Neo 125',
  },
  {
    sigla: 'ABS',
    nomeCompleto: 'Anti-lock Braking System (Freio Antitravamento)',
    explicacao:
      'Sensor na roda fônica evita que a roda trave em freadas bruscas. Ao desmontar a roda, nunca bater no anel dentado nem no sensor.',
    ondeAparece: 'XRE 190, CG 160 Titan 2025+, Bros ABS 2025+, FZ15 e Crosser ABS',
  },
  {
    sigla: 'JASO MA',
    nomeCompleto: 'Norma Japonesa para Embreagem Banhada a Óleo',
    explicacao:
      'Indica que o óleo NÃO tem aditivos redutores de atrito, evitando que os discos da embreagem patinem. Obrigatório em motos manuais e semiautomáticas.',
    ondeAparece: 'Rótulo de óleos 10W-30, 10W-40 e 20W-50 para motos',
  },
  {
    sigla: 'JASO MB',
    nomeCompleto: 'Norma Japonesa de Baixa Fricção (Scooters CVT)',
    explicacao:
      'Óleo mais escorregadio para economia de combustível, exclusivo para scooters onde a embreagem trabalha a seco fora do óleo do motor.',
    ondeAparece: 'Scooters com embreagem seca (NÃO usar em motos manuais ou semiautomáticas com embreagem banhada a óleo)',
  },
  {
    sigla: 'CKP',
    nomeCompleto: 'Crankshaft Position Sensor (Bobina de Pulso)',
    explicacao:
      'Sensor magnético junto ao volante que lê a rotação do virabrequim e avisa o CDI/ECM a hora exata de soltar a centelha na vela.',
    ondeAparece: 'Tampa esquerda do estator e códigos de falha (52 / 12 / C12)',
  },
  {
    sigla: 'TPS',
    nomeCompleto: 'Throttle Position Sensor (Sensor da Borboleta)',
    explicacao:
      'Informa à central eletrônica o quanto você girou o acelerador. Precisa de reset após limpeza do TBI ou troca brusca de álcool/gasolina.',
    ondeAparece: 'Corpo de borboleta (TBI) e códigos de falha (8 / 15 / C14)',
  },
  {
    sigla: 'EOT',
    nomeCompleto: 'Engine Oil Temperature (Sensor de Temperatura do Óleo)',
    explicacao:
      'Mede se o motor está frio ou quente para ajustar a mistura na partida a frio. Também é usado no procedimento de reset do ECM Honda.',
    ondeAparece: 'Base esquerda do cilindro nas Honda PGM-FI (Código 7)',
  },
  {
    sigla: 'DLC',
    nomeCompleto: 'Data Link Connector (Conector de Diagnóstico)',
    explicacao:
      'Tomada vermelha/azul de 4 pinos sob o banco usada para conectar scanner ou fazer jumper de leitura/reset de códigos de falha.',
    ondeAparece: 'Sob o banco ou carenagem lateral das Honda injetadas',
  },
  {
    sigla: 'TWI',
    nomeCompleto: 'Tread Wear Indicator (Indicador de Desgaste do Pneu)',
    explicacao:
      'Pequenos ressaltos de borracha dentro dos sulcos do pneu (1,6 mm). Quando a banda encosta no TWI, o pneu chegou ao limite de troca.',
    ondeAparece: 'Lateral e sulcos de todos os pneus',
  },
  {
    sigla: 'CVT',
    nomeCompleto: 'Continuously Variable Transmission (Câmbio Automático)',
    explicacao:
      'Transmissão de scooter feita por polias variáveis, roletes, correia V-Belt e embreagem centrífuga seca, sem troca de marchas.',
    ondeAparece: 'Scooters com câmbio automático por correia (não se aplica a motos com corrente de transmissão)',
  },
  {
    sigla: 'OHV',
    nomeCompleto: 'Overhead Valve (Motor Comando por Varetas)',
    explicacao:
      'Arquitetura clássica sem corrente de comando: o comando fica embaixo e aciona os balancins por duas varetas metálicas (ex.: CG 125 2000–2008).',
    ondeAparece: 'Honda CG 125 Titan / Fan 2000–2008 (folga 0,08 / 0,08 mm)',
  },
  {
    sigla: 'OHC',
    nomeCompleto: 'Overhead Camshaft (Comando no Cabeçote por Corrente)',
    explicacao:
      'Comando de válvulas no topo do cabeçote acionado por corrente de comando com acionador/tensor.',
    ondeAparece: 'CG 150, CG 160, CG 125 2009+, Bros, XRE, Factor, Fazer, Intruder, Yes',
  },
  {
    sigla: 'DOT 4',
    nomeCompleto: 'Especificação de Fluido de Freio Hidráulico',
    explicacao:
      'Fluido sintético de alto ponto de ebulição para freios a disco. Absorve umidade do ar com o tempo (trocar a cada 2 anos) e corrói pintura se respingar.',
    ondeAparece: 'Reservatório (burrinho) de freio a disco dianteiro/traseiro',
  },
  {
    sigla: 'MIL',
    nomeCompleto: 'Malfunction Indicator Lamp (Luz da Injeção no Painel)',
    explicacao:
      'Luz laranja/amarela no painel que acende por ~3 segundos ao ligar a chave e pisca códigos numéricos quando algum sensor falha.',
    ondeAparece: 'Painel de todas as motos com injeção eletrônica',
  },
];

export function buscarSiglaGlossario(sigla: string): TermoGlossario | undefined {
  const alvo = sigla.trim().toUpperCase();
  return GLOSSARIO_SIGLAS.find((t) => t.sigla.toUpperCase() === alvo);
}
