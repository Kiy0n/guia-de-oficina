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

export type NivelDificuldade = 'facil' | 'medio' | 'dificil';

// ---------------------------------------------------------------------------
// Medidas
// ---------------------------------------------------------------------------

/** Valor com unidade, ex.: { valor: 12, unidade: 'N·m' }. */
export interface Medida<U extends string = string> {
  valor: number;
  unidade: U;
}

/** Faixa de valores com unidade, ex.: folga de válvula 0,08–0,12 mm. */
export interface Faixa<U extends string = string> {
  min: number;
  max: number;
  unidade: U;
}

// ---------------------------------------------------------------------------
// Ficha técnica — blocos detalhados (preenchidos na Fase 3)
// ---------------------------------------------------------------------------

export interface MotorDetalhes {
  diametroCursoMm?: { diametro: number; curso: number };
  taxaCompressao?: string; // ex.: "9,5:1"
  potencia?: string; // ex.: "14,2 cv @ 8.250 rpm"
  torque?: string;
  marchaLentaRpm?: Faixa<'rpm'>;
}

export interface Fluidos {
  oleoMotor?: {
    especificacao: string; // ex.: "SAE 10W-30 API SL JASO MA"
    capacidadeTrocaL: number;
    capacidadeTrocaComFiltroL?: number;
    capacidadeTotalL?: number;
  };
  tanqueL?: number;
  reservaL?: number;
  fluidoFreio?: string; // ex.: "DOT 4"
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
  vela?: { modelo: string; alternativas?: string[]; folgaEletrodoMm?: Faixa<'mm'> };
  bateria?: { modelo: string; tensaoV: number; capacidadeAh: number };
  fusivelPrincipalA?: number;
  lampadaFarol?: string;
}

export interface Pneus {
  dianteiro: { medida: string; pressaoPsi?: number };
  traseiro: { medida: string; pressaoPsi?: number; pressaoComGarupaPsi?: number };
}

export interface TransmissaoFinal {
  tipo: 'corrente' | 'correia';
  corrente?: string; // ex.: "428H x 118L"
  pinhaoDentes?: number;
  coroaDentes?: number;
}

export interface TorqueAperto {
  item: string; // ex.: "Bujão de drenagem do óleo"
  torque: Medida<'N·m'>;
  observacao?: string;
}

// ---------------------------------------------------------------------------
// Ficha técnica
// ---------------------------------------------------------------------------

export interface FichaTecnica {
  /** Versão usada como referência quando a geração tem várias (ex.: "Titan", "ED"). */
  versaoReferencia?: string;

  // Dados básicos (obrigatórios desde a Fase 2)
  cilindradaCc: number;
  motor: string; // ex.: "Monocilíndrico 4T OHC 2V"
  alimentacao: Alimentacao;
  combustivel: Combustivel;
  arrefecimento: Arrefecimento;
  partida: Partida;
  cambio: Cambio;
  freios: { dianteiro: TipoFreio; traseiro: TipoFreio; sistema: SistemaFreio };

  // Dados detalhados (opcionais até a Fase 3)
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
  versoes?: string[]; // ex.: ["Start", "Fan", "Titan"]
  fichaTecnica: FichaTecnica;
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
