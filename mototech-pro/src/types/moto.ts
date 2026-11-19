/**
 * Tipos de domínio do MotoTech Pro.
 * Todos os manuais e fichas técnicas são módulos TypeScript estáticos em `src/data`.
 */

export type Marca = 'Honda' | 'Yamaha';

/** Cilindrada máxima suportada pelo projeto. */
export const CILINDRADA_MAXIMA = 190 as const;

export type Categoria = 'street' | 'trail' | 'scooter' | 'cub';

export type Alimentacao = 'carburador' | 'injecao';

export type Partida = 'pedal' | 'eletrica' | 'pedal-eletrica';

export type Arrefecimento = 'ar' | 'ar-oleo' | 'liquido';

export type TipoTransmissaoFinal = 'corrente' | 'cvt';

export type TipoFreio = 'tambor' | 'disco' | 'disco-cbs' | 'disco-abs';

export type TipoManutencao = 'preventiva' | 'corretiva';

export type AcaoRevisao =
  | 'inspecionar'
  | 'limpar'
  | 'ajustar'
  | 'lubrificar'
  | 'substituir';

export type NivelDificuldade = 'facil' | 'medio' | 'dificil';

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

export interface Motor {
  cilindradaCc: number;
  tipo: string; // ex.: "Monocilíndrico 4T OHC 2 válvulas"
  diametroCursoMm: { diametro: number; curso: number };
  taxaCompressao: string; // ex.: "9,5:1"
  potencia?: string; // ex.: "14,2 cv @ 8.250 rpm"
  torque?: string;
  alimentacao: Alimentacao;
  arrefecimento: Arrefecimento;
  partida: Partida;
  marchas: number | 'CVT';
  marchaLentaRpm: Faixa<'rpm'>;
}

export interface Fluidos {
  oleoMotor: {
    especificacao: string; // ex.: "SAE 10W-30 API SL JASO MA"
    capacidadeTrocaL: number;
    capacidadeTrocaComFiltroL?: number;
    capacidadeTotalL: number;
  };
  combustivel: { tipo: string; tanqueL: number; reservaL?: number };
  fluidoFreio?: string; // ex.: "DOT 4"
  arrefecimento?: { especificacao: string; capacidadeL: number };
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
  vela: { modelo: string; alternativas?: string[]; folgaEletrodoMm: Faixa<'mm'> };
  bateria?: { modelo: string; tensaoV: number; capacidadeAh: number };
  fusivelPrincipalA?: number;
  lampadaFarol?: string;
}

export interface Pneus {
  dianteiro: { medida: string; pressaoPsi: number };
  traseiro: { medida: string; pressaoPsi: number; pressaoComGarupaPsi?: number };
}

export interface Transmissao {
  tipo: TipoTransmissaoFinal;
  corrente?: string; // ex.: "428H x 118L"
  pinhaoDentes?: number;
  coroaDentes?: number;
}

export interface Freios {
  dianteiro: TipoFreio;
  traseiro: TipoFreio;
}

export interface TorqueAperto {
  item: string; // ex.: "Bujão de drenagem do óleo"
  torque: Medida<'N·m'>;
  observacao?: string;
}

export interface FichaTecnica {
  motor: Motor;
  fluidos: Fluidos;
  folgas: Folgas;
  eletrica: Eletrica;
  pneus: Pneus;
  transmissao: Transmissao;
  freios: Freios;
  torques: TorqueAperto[];
  pesoSecoKg?: number;
}

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
}

/** Diagnóstico de defeito: sintoma -> causas prováveis -> soluções. */
export interface Diagnostico {
  id: string;
  sintoma: string;
  causasProvaveis: string[];
  verificacoes: string[];
  procedimentosRelacionados?: string[]; // ids de Procedimento
}

export interface Moto {
  id: string; // slug, ex.: "honda-cg-160-fan-2020"
  marca: Marca;
  modelo: string; // ex.: "CG 160 Fan"
  anos: { inicio: number; fim?: number };
  categoria: Categoria;
  imagem?: string;
  ficha: FichaTecnica;
  planoManutencao: ItemPlanoManutencao[];
  procedimentos: Procedimento[];
  diagnosticos: Diagnostico[];
}
