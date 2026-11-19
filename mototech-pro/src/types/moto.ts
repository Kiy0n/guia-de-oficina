/**
 * Tipos de domínio do MotoTech Pro.
 *
 * Hierarquia: Marca → Modelo → Geracao (faixa de anos + diferenças mecânicas).
 * Todos os manuais e fichas técnicas são módulos TypeScript estáticos em `src/data`.
 */

// ---------------------------------------------------------------------------
// Enumerações básicas
// ---------------------------------------------------------------------------

export type Marca = 'Honda' | 'Yamaha' | 'Suzuki';

export const MARCAS = ['Honda', 'Yamaha', 'Suzuki'] as const satisfies readonly Marca[];

/** Cilindrada máxima suportada pelo projeto. */
export const CILINDRADA_MAXIMA = 190 as const;

export type Categoria = 'street' | 'trail' | 'cub' | 'scooter' | 'custom';

export type Alimentacao = 'carburador' | 'injecao';

export type Combustivel = 'gasolina' | 'flex';

export type Partida = 'pedal' | 'eletrica' | 'pedal-eletrica';

export type Arrefecimento = 'ar' | 'ar-oleo' | 'liquido';

export type TipoFreio = 'tambor' | 'disco';

/** CBS (Honda) e UBS (Yamaha) = frenagem combinada; ABS = antitravamento. */
export type SistemaFreio = 'convencional' | 'CBS' | 'UBS' | 'ABS';

export type Cambio =
  | { tipo: 'manual'; marchas: 4 | 5 | 6 }
  | { tipo: 'semiautomatico'; marchas: 4 }
  | { tipo: 'cvt' };

export type TipoManutencao = 'preventiva' | 'corretiva';

export type AcaoRevisao = 'inspecionar' | 'limpar' | 'ajustar' | 'lubrificar' | 'substituir';

/** Categorias visuais de ação no Manual de Revisões (Fase 3). */
export type CategoriaAcaoRevisao = 'TROCAR' | 'LIMPAR_LUBRIFICAR' | 'REGULAR' | 'CHECAR';

export type NivelDificuldade = 'facil' | 'medio' | 'dificil';

// ---------------------------------------------------------------------------
// Medidas
// ---------------------------------------------------------------------------

/** Valor com unidade, ex.: { valor: 12, unidade: 'N·m' }. */
export interface Medida<U extends string = string> {
  valor: number;
  unidade: U;
}

/** Faixa de valores com unidade, ex.: folga de válvula 0,08–0,12 mm ou 0,08 ± 0,02 mm. */
export interface Faixa<U extends string = string> {
  min: number;
  max: number;
  unidade: U;
  /** Representação textual fiel ao manual quando expressa como nominal ± tolerância (ex.: "0,08 ± 0,02 mm"). */
  label?: string;
}

// ---------------------------------------------------------------------------
// Ficha técnica — blocos detalhados (Fase 3)
// ---------------------------------------------------------------------------

export interface MotorDetalhes {
  diametroCursoMm?: { diametro: number; curso: number };
  taxaCompressao?: string; // ex.: "9,5:1"
  potencia?: string; // ex.: "15,1 cv @ 8.000 rpm (etanol)"
  torque?: string; // ex.: "1,54 kgf·m @ 7.000 rpm"
  marchaLentaRpm?: Faixa<'rpm'>;
  /** Comando de válvulas / arquitetura (ex.: "OHV (varetas)" vs "OHC (corrente de comando)"). */
  comando?: string;
  /** Tipo de filtragem de óleo do motor. */
  filtroOleo?: string;
  /** Pressão da bomba de combustível (injetadas) ou giclagem/parafuso de mistura (carburadas). */
  alimentacaoDetalhe?: string;
}

export interface Fluidos {
  oleoMotor?: {
    especificacao: string; // ex.: "SAE 10W-30 Semissintético (API SL / JASO MA)"
    capacidadeTrocaL: number;
    capacidadeTrocaComFiltroL?: number;
    capacidadeTotalL?: number;
    observacao?: string;
  };
  tanqueL?: number;
  reservaL?: number;
  fluidoFreio?: string; // ex.: "DOT 4"
  fluidoBengala?: {
    especificacao: string; // ex.: "Fluido ATF / Fork Oil 10W"
    volumePorCanelaMl: number;
    nivelMm?: number;
    observacao?: string;
  };
  liquidoArrefecimento?: { especificacao: string; capacidadeL: number };
  oleoTransmissaoCvt?: { especificacao: string; capacidadeL: number };
}

export interface Folgas {
  valvulaAdmissaoMm?: Faixa<'mm'>;
  valvulaEscapeMm?: Faixa<'mm'>;
  folgaCorrenteMm?: Faixa<'mm'>;
  folgaManeteEmbreagemMm?: Faixa<'mm'>;
  folgaPedalFreioMm?: Faixa<'mm'>;
  folgaManeteFreioMm?: Faixa<'mm'>;
  folgaAceleradorMm?: Faixa<'mm'>;
}

export interface Eletrica {
  vela?: {
    modelo: string;
    iridiumAlternativa?: string;
    alternativas?: string[];
    folgaEletrodoMm?: Faixa<'mm'>;
  };
  bateria?: {
    modelo: string;
    tensaoV: number;
    capacidadeAh: number;
    tensaoCargaV?: string; // ex.: "13,5V – 14,8V @ 5.000 rpm"
  };
  fusivelPrincipalA?: number;
  fusiveisSecundarios?: string;
  lampadaFarol?: string;
}

export interface Pneus {
  dianteiro: { medida: string; pressaoPsi?: number; pressaoComGarupaPsi?: number; tipo?: string };
  traseiro: { medida: string; pressaoPsi?: number; pressaoComGarupaPsi?: number; tipo?: string };
}

export interface TransmissaoFinal {
  tipo: 'corrente' | 'correia';
  corrente?: string; // ex.: "428H x 118L"
  pinhaoDentes?: number;
  coroaDentes?: number;
  cvtDetalhe?: {
    correiaCodigo?: string;
    larguraLimiteMm?: number;
    roletesMedidaPeso?: string;
  };
}

export interface TorqueAperto {
  item: string; // ex.: "Bujão de drenagem do óleo"
  categoria?: 'motor' | 'chassi' | 'freios' | 'suspensao';
  torque: Medida<'N·m'>;
  observacao?: string;
}

// ---------------------------------------------------------------------------
// Ficha técnica
// ---------------------------------------------------------------------------

export interface FichaTecnica {
  /** Versão usada como referência quando a geração tem várias (ex.: "Titan", "ED"). */
  versaoReferencia?: string;

  // Dados básicos
  cilindradaCc: number;
  motor: string; // ex.: "Monocilíndrico 4T OHC 2V"
  alimentacao: Alimentacao;
  combustivel: Combustivel;
  arrefecimento: Arrefecimento;
  partida: Partida;
  cambio: Cambio;
  freios: { dianteiro: TipoFreio; traseiro: TipoFreio; sistema: SistemaFreio };

  // Dados detalhados de bancada (Fase 3)
  motorDetalhes?: MotorDetalhes;
  fluidos?: Fluidos;
  folgas?: Folgas;
  eletrica?: Eletrica;
  pneus?: Pneus;
  transmissaoFinal?: TransmissaoFinal;
  torques?: TorqueAperto[];
  pesoSecoKg?: number;
}

// ---------------------------------------------------------------------------
// Manutenção
// ---------------------------------------------------------------------------

/** Item do plano de manutenção preventiva (tabela de revisões do manual). */
export interface ItemPlanoManutencao {
  id: string;
  item: string; // ex.: "Óleo do motor"
  acao: AcaoRevisao;
  intervaloKm?: number;
  intervaloMeses?: number;
  observacao?: string;
}

/** Procedimento passo a passo (preventivo ou corretivo). */
export interface Procedimento {
  id: string;
  titulo: string;
  tipo: TipoManutencao;
  dificuldade: NivelDificuldade;
  tempoEstimadoMin?: number;
  ferramentas: string[];
  pecas?: string[];
  passos: string[];
  avisos?: string[];
  videoUrl?: string;
}

/** Diagnóstico de defeito: sintoma -> causas prováveis -> verificações. */
export interface Diagnostico {
  id: string;
  sintoma: string;
  causasProvaveis: string[];
  verificacoes: string[];
  procedimentosRelacionados?: string[]; // ids de Procedimento
}

// ---------------------------------------------------------------------------
// Auditoria Técnica (Selo de Confiabilidade de Manual)
// ---------------------------------------------------------------------------

export type StatusAuditoria = 'verificado_manual' | 'fonte_web' | 'pendente_conferencia';

export interface AuditoriaTecnica {
  status: StatusAuditoria;
  ultimaRevisao?: string;
  /** Fonte documental exata (ex.: "Manual do Proprietário Honda CG 150 2004, pág. 62–65 / 102–105"). */
  fonte?: string;
  /** Quando `status === 'fonte_web'`, identifica as fontes externas consultadas (ex.: "Google, YouTube, Reddit, fóruns técnicos"). */
  origemExterna?: string;
  notas?: string;
}

// ---------------------------------------------------------------------------
// Hierarquia do catálogo
// ---------------------------------------------------------------------------

export interface Geracao {
  id: string; // ex.: "honda-cg-160-2025-2026"
  anoInicio: number;
  anoFim: number;
  anosLabel: string; // ex.: "2025–2026"
  nomeGeracao: string; // ex.: "Nova Geração ABS / Farol LED"
  /** Lista curta de mudanças técnicas que diferenciam a geração. */
  destaques: string[];
  /** Alertas práticos de oficina específicos deste ano/geração ("Atenção neste Ano/Geração"). */
  alertasBancada?: string[];
  versoes?: string[]; // ex.: ["Start", "Fan", "Titan"]
  fichaTecnica: FichaTecnica;
  /** Selo de auditoria técnica e rastreabilidade dos dados de óleo, válvulas e torques. */
  auditoria: AuditoriaTecnica;
  planoManutencao?: ItemPlanoManutencao[];
  procedimentos?: Procedimento[];
  diagnosticos?: Diagnostico[];
}

/** Garante ao menos uma geração por modelo (útil com `noUncheckedIndexedAccess`). */
export type ListaGeracoes = [Geracao, ...Geracao[]];

export interface Modelo {
  id: string; // ex.: "honda-cg-160"
  marca: Marca;
  nome: string; // ex.: "CG 160"
  categoria: Categoria;
  /** Termos extras para a busca rápida (versões, apelidos, códigos). */
  aliases?: string[];
  geracoes: ListaGeracoes;
}

/** Seleção completa resolvida a partir do catálogo. */
export interface MotoSelecionada {
  marca: Marca;
  modelo: Modelo;
  geracao: Geracao;
}
