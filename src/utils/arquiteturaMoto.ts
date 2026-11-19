import type { Geracao, Modelo } from '@/types/moto';

export type TipoAlimentacaoArquitetura = 'carburada' | 'injetada' | 'mista';
export type TipoFiltroOleo = 'centrifugo_honda' | 'papel_externo' | 'tela_simples';

export interface ArquiteturaMoto {
  tipoAlimentacao: TipoAlimentacaoArquitetura;
  /** Verdadeiro em gerações 100% injetadas ou mistas (ex.: CG 125 2009–2018 e Biz 125 2006–2010). */
  isInjetada: boolean;
  /** Verdadeiro em gerações 100% carburadas ou mistas. */
  isCarburada: boolean;
  /** Verdadeiro quando a mesma geração do catálogo engloba anos carburados e anos injetados. */
  isAlimentacaoMista: boolean;
  /** Rótulo claro da alimentação para exibição em telas, tabelas e roteiros. */
  descricaoAlimentacao: string;
  /** Sigla/nome comercial do sistema de injeção eletrônica da marca. */
  siglaInjecao: string;

  temFreioDiscoDianteiro: boolean;
  temFreioDiscoTraseiro: boolean;
  temAlgumFreioDisco: boolean;
  temAlgumFreioTambor: boolean;
  isSomenteTambor: boolean;

  isSemiautomatica: boolean;
  isCvt: boolean;
  temEmbreagemManual: boolean;

  tipoFiltroOleo: TipoFiltroOleo;

  isBateriaSelada: boolean;
  temPartidaEletrica: boolean;
  temPedalPartida: boolean;
  isArrefecimentoLiquido: boolean;
  temLinkTraseiro: boolean;
}

/**
 * Gerações do catálogo que englobam anos carburados e anos com injeção eletrônica.
 * Mapeadas explicitamente por ID (sem depender de `.includes()` em textos livres).
 */
const GERACOES_ALIMENTACAO_MISTA: Readonly<Record<string, string>> = {
  'honda-cg-125-2009-2018': 'Carburador (2009–2015) / Bico e TBI (apenas 125i 2016–2018)',
  'honda-biz-125-2006-2010': 'Carburador (2006–2008) / Bico e TBI (apenas PGM-FI 2009–2010)',
};

/**
 * Gerações Yamaha 125 carburadas que usam apenas tela metálica interna (sem filtro de óleo de papel).
 */
const GERACOES_YAMAHA_TELA_SIMPLES = new Set<string>([
  'yamaha-ybr-factor-125-2000-2008',
  'yamaha-ybr-factor-125-2009-2016',
]);

/**
 * Gerações que podem utilizar bateria convencional com eletrólito (além de selada em anos posteriores).
 */
const GERACOES_BATERIA_CONVENCIONAL = new Set<string>([
  'honda-biz-100-1998-2005',
  'honda-cg-125-2000-2008',
  'suzuki-intruder-125-2002-2007',
  'suzuki-intruder-125-2008-2016',
  'suzuki-yes-125-2005-2016',
]);

export function isAlimentacaoMista(geracao: Geracao): boolean {
  return geracao.id in GERACOES_ALIMENTACAO_MISTA;
}

export function isInjetada(geracao: Geracao): boolean {
  return geracao.fichaTecnica.alimentacao === 'injecao' || isAlimentacaoMista(geracao);
}

export function isCarburada(geracao: Geracao): boolean {
  return geracao.fichaTecnica.alimentacao === 'carburador' || isAlimentacaoMista(geracao);
}

export function temFreioDiscoDianteiro(geracao: Geracao): boolean {
  return geracao.fichaTecnica.freios.dianteiro === 'disco';
}

export function temFreioDiscoTraseiro(geracao: Geracao): boolean {
  return geracao.fichaTecnica.freios.traseiro === 'disco';
}

export function isSemiautomatica(geracao: Geracao): boolean {
  return geracao.fichaTecnica.cambio.tipo === 'semiautomatico';
}

export function getTipoFiltroOleo(modelo: Modelo, geracao: Geracao): TipoFiltroOleo {
  const isCvt =
    geracao.fichaTecnica.cambio.tipo === 'cvt' ||
    geracao.fichaTecnica.transmissaoFinal?.tipo === 'correia';

  if (modelo.marca === 'Honda') {
    return isCvt ? 'tela_simples' : 'centrifugo_honda';
  }

  if (modelo.marca === 'Yamaha') {
    if (isCvt || GERACOES_YAMAHA_TELA_SIMPLES.has(geracao.id)) {
      return 'tela_simples';
    }
    return 'papel_externo';
  }

  // Suzuki (Intruder 125 / Yes 125)
  return isCvt ? 'tela_simples' : 'papel_externo';
}

export function getArquiteturaMoto(modelo: Modelo, geracao: Geracao): ArquiteturaMoto {
  const ficha = geracao.fichaTecnica;

  const descricaoMista = GERACOES_ALIMENTACAO_MISTA[geracao.id];
  const mista = Boolean(descricaoMista);
  const tipoAlimentacao: TipoAlimentacaoArquitetura = mista
    ? 'mista'
    : ficha.alimentacao === 'injecao'
      ? 'injetada'
      : 'carburada';

  const siglaInjecao =
    modelo.marca === 'Honda'
      ? 'PGM-FI'
      : modelo.marca === 'Yamaha'
        ? ficha.combustivel === 'flex'
          ? 'Blueflex'
          : 'Injeção Eletrônica'
        : 'Injeção Eletrônica';

  const descricaoAlimentacao =
    descricaoMista ??
    (tipoAlimentacao === 'injetada'
      ? `Injeção Eletrônica ${siglaInjecao}`
      : 'Carburador');

  const discoDianteiro = temFreioDiscoDianteiro(geracao);
  const discoTraseiro = temFreioDiscoTraseiro(geracao);
  const algumDisco = discoDianteiro || discoTraseiro;
  const algumTambor = ficha.freios.dianteiro === 'tambor' || ficha.freios.traseiro === 'tambor';

  const cvt = ficha.cambio.tipo === 'cvt' || ficha.transmissaoFinal?.tipo === 'correia';
  const semiauto = isSemiautomatica(geracao);
  const embreagemManual = ficha.cambio.tipo === 'manual';

  const tipoFiltroOleo = getTipoFiltroOleo(modelo, geracao);

  const temPartidaEletrica =
    ficha.partida === 'eletrica' || ficha.partida === 'pedal-eletrica';
  const temPedalPartida =
    ficha.partida === 'pedal' || ficha.partida === 'pedal-eletrica';

  const temLinkTraseiro =
    modelo.categoria === 'trail' ||
    modelo.id === 'yamaha-crosser-150' ||
    (modelo.id === 'yamaha-fazer-150' && geracao.anoInicio >= 2023);

  return {
    tipoAlimentacao,
    isInjetada: tipoAlimentacao === 'injetada' || tipoAlimentacao === 'mista',
    isCarburada: tipoAlimentacao === 'carburada' || tipoAlimentacao === 'mista',
    isAlimentacaoMista: mista,
    descricaoAlimentacao,
    siglaInjecao,

    temFreioDiscoDianteiro: discoDianteiro,
    temFreioDiscoTraseiro: discoTraseiro,
    temAlgumFreioDisco: algumDisco,
    temAlgumFreioTambor: algumTambor,
    isSomenteTambor: !algumDisco,

    isSemiautomatica: semiauto,
    isCvt: cvt,
    temEmbreagemManual: embreagemManual,

    tipoFiltroOleo,

    isBateriaSelada: !GERACOES_BATERIA_CONVENCIONAL.has(geracao.id),
    temPartidaEletrica,
    temPedalPartida,
    isArrefecimentoLiquido: ficha.arrefecimento === 'liquido',
    temLinkTraseiro,
  };
}
