export type CategoriaGlossario =
  | 'Motor'
  | 'Injeção/Elétrica'
  | 'Chassi/Freios'
  | 'Fluidos';

export const CATEGORIAS_GLOSSARIO: readonly CategoriaGlossario[] = [
  'Motor',
  'Injeção/Elétrica',
  'Chassi/Freios',
  'Fluidos',
] as const;

export interface TermoGlossarioTecnico {
  id: string;
  sigla: string;
  termo: string;
  categoria: CategoriaGlossario;
  descricao: string;
  exemploPratico?: string;
}

export const GLOSSARIO_TECNICO: readonly TermoGlossarioTecnico[] = [
  // -------------------------------------------------------------------------
  // MOTOR
  // -------------------------------------------------------------------------
  {
    id: 'pms',
    sigla: 'PMS',
    termo: 'Ponto Morto Superior',
    categoria: 'Motor',
    descricao:
      'Ponto mais alto que o pistão atinge dentro do cilindro (marca "T" no volante). Na fase de compressão, é a posição obrigatória para medir e regular a folga das válvulas.',
    exemploPratico: 'Alinhe o "T" no visor esquerdo e confirme os dois balancins livres.',
  },
  {
    id: 'pmi',
    sigla: 'PMI',
    termo: 'Ponto Morto Inferior',
    categoria: 'Motor',
    descricao:
      'Ponto mais baixo que o pistão alcança no curso dentro do cilindro. A distância entre o PMS e o PMI define o curso do motor.',
  },
  {
    id: 'folga-valvulas',
    sigla: 'Folga de Válvulas',
    termo: 'Folga entre Balancim e Haste da Válvula',
    categoria: 'Motor',
    descricao:
      'Espaço milimétrico (ex.: 0,08 mm) deixado com o motor frio para compensar a dilatação do metal quando esquenta. Sem folga a moto morre quente; folga excessiva gera batida "tec-tec".',
    exemploPratico: 'Medir sempre abaixo de 35 °C com cálibre de lâminas.',
  },
  {
    id: 'filtro-centrifugo',
    sigla: 'Filtro Centrífugo',
    termo: 'Rotor Centrífugo de Óleo (Honda)',
    categoria: 'Motor',
    descricao:
      'Copo giratório preso ao virabrequim que separa impurezas pesadas do óleo pela força centrífuga. Precisa ser aberto e raspado a cada 12.000 km para não cortar óleo da biela.',
  },
  {
    id: 'tela-filtrante',
    sigla: 'Tela Filtrante',
    termo: 'Peneira Metálica Interna de Óleo',
    categoria: 'Motor',
    descricao:
      'Malha metálica lavável instalada antes da bomba de óleo para reter fiapos de junta, fragmentos de embreagem e partículas maiores.',
  },
  {
    id: 'sistema-pair',
    sigla: 'Sistema PAIR',
    termo: 'Injeção de Ar Secundário no Escapamento',
    categoria: 'Motor',
    descricao:
      'Válvula que injeta ar limpo na saída de escape para terminar de queimar gases e reduzir poluentes. Se vazar ou entupir, pode causar pipocos na desaceleração.',
  },
  {
    id: 'marcha-lenta',
    sigla: 'Marcha Lenta',
    termo: 'Rotação Mínima Estável (RPM)',
    categoria: 'Motor',
    descricao:
      'Rotação em que o motor se mantém ligado sem acelerar (geralmente 1.400 a 1.500 rpm com motor quente). Lenta baixa demais apaga no semáforo; alta demais gera tranco ao engatar.',
  },
  {
    id: 'torque-aperto',
    sigla: 'Torque (N·m)',
    termo: 'Torque de Aperto Especificado',
    categoria: 'Motor',
    descricao:
      'Força rotacional exata aplicada em um parafuso ou porca, medida em Newton-metro (N·m) ou kgf·m. Evita tanto parafusos soltos quanto roscas de alumínio espanadas.',
    exemploPratico: '1 kgf·m equivale a aproximadamente 9,8 N·m (ex.: 24 N·m ≈ 2,4 kgf·m).',
  },

  // -------------------------------------------------------------------------
  // INJEÇÃO / ELÉTRICA
  // -------------------------------------------------------------------------
  {
    id: 'pgm-fi-blueflex',
    sigla: 'PGM-FI / Blueflex',
    termo: 'Sistemas de Injeção Eletrônica (Honda / Yamaha)',
    categoria: 'Injeção/Elétrica',
    descricao:
      'Nomes comerciais da injeção eletrônica que substitui o carburador, dosando combustível automaticamente via sensores e bico injetor (inclusive misturas de etanol e gasolina).',
  },
  {
    id: 'ecu-ecm',
    sigla: 'ECU / ECM',
    termo: 'Central Eletrônica de Injeção e Ignição',
    categoria: 'Injeção/Elétrica',
    descricao:
      'Módulo computadorizado que lê os sensores do motor e comanda o tempo de injeção, a faísca da vela e a bomba de combustível. Muito sensível a inversão de polaridade da bateria.',
  },
  {
    id: 'cdi',
    sigla: 'CDI',
    termo: 'Ignição por Descarga Capacitiva',
    categoria: 'Injeção/Elétrica',
    descricao:
      'Módulo eletrônico usado em motos carburadas para receber o sinal da bobina de pulso e disparar a alta tensão na bobina de ignição no ponto certo.',
  },
  {
    id: 'estator',
    sigla: 'Estator',
    termo: 'Bobinas Geradoras de Energia (Magneto)',
    categoria: 'Injeção/Elétrica',
    descricao:
      'Conjunto de bobinas de cobre fixo na tampa esquerda do motor que gera corrente alternada (AC) quando o volante magnético gira, alimentando carga da bateria e iluminação.',
  },
  {
    id: 'retificador-regulador',
    sigla: 'Retificador',
    termo: 'Retificador / Regulador de Voltagem',
    categoria: 'Injeção/Elétrica',
    descricao:
      'Transforma a corrente alternada (AC) do estator em corrente contínua (DC) e limita a tensão entre 13,5V e 14,8V para carregar a bateria sem queimar lâmpadas ou a central.',
  },
  {
    id: 'tbi',
    sigla: 'TBI',
    termo: 'Corpo de Borboleta (Injeção Eletrônica)',
    categoria: 'Injeção/Elétrica',
    descricao:
      'Peça que controla a entrada de ar nas motos injetadas e abriga os sensores TPS/MAP/IAT e o canal de marcha lenta. Acúmulo de borra preta nele causa lenta irregular.',
  },

  // -------------------------------------------------------------------------
  // CHASSI / FREIOS
  // -------------------------------------------------------------------------
  {
    id: 'cbs',
    sigla: 'CBS',
    termo: 'Freio Combinado (Combined Brake System)',
    categoria: 'Chassi/Freios',
    descricao:
      'Sistema que distribui parte da frenagem para a roda dianteira quando o freio traseiro é acionado. Em motos a disco CBS, a pinça dianteira tem dois sangradores separados.',
  },
  {
    id: 'abs',
    sigla: 'ABS',
    termo: 'Sistema de Freio Antitravamento',
    categoria: 'Chassi/Freios',
    descricao:
      'Lê a velocidade da roda por uma roda fônica e alivia a pressão em milissegundos se detectar travamento em freadas de emergência, mantendo o controle da direção.',
  },
  {
    id: 'twi',
    sigla: 'TWI',
    termo: 'Indicador de Desgaste do Pneu',
    categoria: 'Chassi/Freios',
    descricao:
      'Pequenos ressaltos de borracha de 1,6 mm no fundo dos sulcos do pneu. Quando a banda de rodagem nivela com o TWI, o pneu chegou ao limite legal e seguro de uso.',
  },
  {
    id: 'bucha-retentor-bengala',
    sigla: 'Retentor de Bengala',
    termo: 'Vedação e Bucha da Suspensão Dianteira',
    categoria: 'Chassi/Freios',
    descricao:
      'Anel de borracha que retém o fluido dentro dos tubos da suspensão dianteira. Quando vaza, deixa o tubo melado de óleo e pode escorrer para o disco/pastilhas de freio.',
  },
  {
    id: 'relacao',
    sigla: 'Kit Relação',
    termo: 'Pinhão, Coroa e Corrente de Transmissão',
    categoria: 'Chassi/Freios',
    descricao:
      'Conjunto que leva a força do motor para a roda traseira. Os três componentes se desgastam juntos e devem ser trocados em conjunto para evitar quebra ou desgaste precoce.',
  },
  {
    id: 'passo-corrente',
    sigla: 'Passo 428 / 520',
    termo: 'Medida e Espessura da Corrente',
    categoria: 'Chassi/Freios',
    descricao:
      'Código que identifica o espaçamento entre pinos e a largura interna da corrente. Motos de 110 a 190 cc usam tipicamente passo 428 (ou 428H reforçada); cilindradas maiores usam 520.',
  },
  {
    id: 'sangria-freio',
    sigla: 'Sangria de Freio',
    termo: 'Remoção de Ar e Troca do Fluido Hidráulico',
    categoria: 'Chassi/Freios',
    descricao:
      'Procedimento de bombear o circuito hidráulico abrindo e fechando o bico sangrador da pinça para expulsar bolhas de ar (que deixam o manete borrachudo) e renovar o fluido.',
  },

  // -------------------------------------------------------------------------
  // FLUIDOS
  // -------------------------------------------------------------------------
  {
    id: 'jaso-ma-ma2',
    sigla: 'JASO MA / MA2',
    termo: 'Norma de Óleo para Embreagem Banhada a Óleo',
    categoria: 'Fluidos',
    descricao:
      'Certificação japonesa que garante atrito correto para os discos de embreagem que trabalham dentro do óleo do motor. Óleo de carro (sem JASO MA) faz a embreagem patinar.',
  },
  {
    id: 'api',
    sigla: 'API (SJ / SL / SN)',
    termo: 'Classificação de Desempenho do Óleo',
    categoria: 'Fluidos',
    descricao:
      'Selo que mede a capacidade do óleo de resistir à oxidação, borra e desgaste em altas temperaturas. Quanto mais avançada a segunda letra (SJ → SL → SM → SN), maior a proteção.',
  },
  {
    id: 'viscosidade-sae',
    sigla: 'SAE 10W-30 / 20W-50',
    termo: 'Viscosidade do Óleo a Frio e a Quente',
    categoria: 'Fluidos',
    descricao:
      'O número antes do "W" indica fluidez na partida a frio (menor = sobe mais rápido); o segundo número indica a resistência da película lubrificante com o motor quente.',
  },
  {
    id: 'dot3-dot4',
    sigla: 'DOT 3 vs DOT 4',
    termo: 'Especificação de Fluido de Freio Hidráulico',
    categoria: 'Fluidos',
    descricao:
      'O DOT 4 suporta temperatura de ebulição mais alta que o DOT 3. Ambos são higroscópicos (absorvem água do ar), corroem pintura e devem ser trocados a cada 2 anos.',
    exemploPratico: 'Nunca misture DOT 3 com DOT 4 nem use frasco aberto há muito tempo.',
  },
  {
    id: 'fluido-bengala',
    sigla: 'ATF / Fork Oil',
    termo: 'Fluido Hidráulico da Suspensão Dianteira',
    categoria: 'Fluidos',
    descricao:
      'Óleo específico que controla o amortecimento dentro das bengalas. Deve ser dosado no volume exato em mililitros (ml) indicado no manual para manter frenagem e estabilidade.',
  },
];

// ---------------------------------------------------------------------------
// Módulo 3: Estados da Vela de Ignição (Olho Clínico)
// ---------------------------------------------------------------------------

export type EstadoVelaId = 'ideal' | 'rica' | 'pobre' | 'oleo';

export interface EstadoVelaClinico {
  id: EstadoVelaId;
  titulo: string;
  corAparente: string;
  status: 'OK' | 'Atenção' | 'Crítico';
  diagnostico: string;
  oQueFazer: string;
}

export const ESTADOS_VELA_CLINICO: readonly EstadoVelaClinico[] = [
  {
    id: 'ideal',
    titulo: 'Queima Ideal',
    corAparente: 'Marrom claro / cinza-areia seco',
    status: 'OK',
    diagnostico:
      'Mistura ar/combustível equilibrada, grau térmico correto da vela e motor operando na temperatura certa.',
    oQueFazer:
      'Apenas conferir a folga dos eletrodos com o cálibre e reinstalar rosqueando primeiro com a mão.',
  },
  {
    id: 'rica',
    titulo: 'Mistura Rica (Excesso)',
    corAparente: 'Preto seco / fuligem aveludada',
    status: 'Atenção',
    diagnostico:
      'Excesso de combustível ou falta de ar: filtro de ar saturado, afogador preso, bico gotejando ou vela muito fria.',
    oQueFazer:
      'Inspecionar filtro de ar, regulagem de carburador/TBI e confirmar se o código da vela corresponde ao manual.',
  },
  {
    id: 'pobre',
    titulo: 'Mistura Pobre / Superaquecimento',
    corAparente: 'Branco esbranquiçado / bolhas na cerâmica',
    status: 'Crítico',
    diagnostico:
      'Falta de combustível ou excesso de ar: entrada falsa de ar no coletor, baixa pressão da bomba, giclê obstruído ou vela quente demais.',
    oQueFazer:
      'Risco de furar pistão! Verificar vedação do coletor de admissão, linha de combustível e folga de válvulas.',
  },
  {
    id: 'oleo',
    titulo: 'Passagem de Óleo',
    corAparente: 'Preto oleoso / molhado com crosta brilhante',
    status: 'Crítico',
    diagnostico:
      'Óleo lubrificante entrando na câmara de combustão por retentores de válvula ressecados ou anéis de segmento gastos.',
    oQueFazer:
      'Acompanhar fumaça azulada no escape e consumo de óleo; encaminhar para diagnóstico de parte superior do motor.',
  },
];
