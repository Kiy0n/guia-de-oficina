import type { CategoriaAcaoRevisao, Geracao, Marca, Modelo } from '@/types/moto';
import { getArquiteturaMoto } from '@/utils/arquiteturaMoto';
import { formatFaixa, formatNumero } from '@/utils/format';

export interface ItemChecklistRevisao {
  id: string;
  titulo: string;
  categoria: CategoriaAcaoRevisao;
  /** Especificação técnica real extraída da geração selecionada (volumes, folgas, códigos). */
  detalheTecnico: string;
  tempoEstimadoMin: number;
  criticidade: 'alta' | 'media' | 'rotina';
}

export interface MarcoRevisaoKm {
  km: number;
  labelKm: string;
  mesesReferencia: number;
  subtitulo: string;
  destaqueOficina: string;
  tempoTotalMin: number;
  itens: ItemChecklistRevisao[];
}

export interface DiretrizTempoSevero {
  id: string;
  titulo: string;
  prazoNormal: string;
  prazoSevero: string;
  explicacao: string;
}

export const CATEGORIA_ACAO_META: Record<
  CategoriaAcaoRevisao,
  {
    label: string;
    shortLabel: string;
    badgeClass: string;
    dotClass: string;
  }
> = {
  TROCAR: {
    label: 'TROCAR',
    shortLabel: 'Trocar',
    badgeClass: 'border-red-500/40 bg-red-500/15 text-red-300',
    dotClass: 'bg-red-400',
  },
  LIMPAR_LUBRIFICAR: {
    label: 'LIMPAR / LUBRIFICAR',
    shortLabel: 'Limpar / Lubrificar',
    badgeClass: 'border-sky-500/40 bg-sky-500/15 text-sky-300',
    dotClass: 'bg-sky-400',
  },
  REGULAR: {
    label: 'REGULAR',
    shortLabel: 'Regular',
    badgeClass: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
    dotClass: 'bg-amber-400',
  },
  CHECAR: {
    label: 'CHECAR',
    shortLabel: 'Checar',
    badgeClass: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
    dotClass: 'bg-emerald-400',
  },
};

/**
 * Intervalos validados nos manuais oficiais cacheados em `/app/data/manuals-index/`.
 */
const GERACOES_HONDA_3000_KM = new Set<string>([
  'honda-biz-100-1998-2005',
  'honda-nxr-125-bros-2003-2005',
]);

const GERACOES_HONDA_4000_KM = new Set<string>([
  'honda-biz-100-2013-2015',
  'honda-biz-125-2006-2010',
  'honda-biz-125-2011-2017',
  'honda-cg-125-2000-2008',
  'honda-cg-125-2009-2018',
  'honda-cg-150-2004-2008',
  'honda-cg-150-2009-2015',
  'honda-nxr-125-bros-2013-2015',
  'honda-nxr-150-bros-2003-2008',
  'honda-nxr-150-bros-2009-2014',
  'honda-pop-100-2007-2015',
]);

const GERACOES_YAMAHA_3000_KM = new Set<string>([
  'yamaha-ybr-factor-125-2000-2008',
  'yamaha-ybr-factor-125-2009-2016',
]);

/** Gerações Honda com filtro secundário do sistema PAIR (troca a cada 24.000 km nos manuais 2008–2014). */
const GERACOES_HONDA_PAIR = new Set<string>([
  'honda-cg-125-2000-2008',
  'honda-cg-125-2009-2018',
  'honda-cg-150-2004-2008',
  'honda-cg-150-2009-2015',
]);

export function getIntervalosRevisao(marca: Marca, geracaoId?: string): readonly number[] {
  if (marca === 'Honda') {
    if (geracaoId && GERACOES_HONDA_3000_KM.has(geracaoId)) {
      return [1000, 3000, 6000, 9000, 12000, 15000, 18000, 24000];
    }
    if (!geracaoId || GERACOES_HONDA_4000_KM.has(geracaoId)) {
      return [1000, 4000, 8000, 12000, 16000, 20000, 24000];
    }
    return [1000, 6000, 12000, 18000, 24000];
  }

  if (marca === 'Yamaha') {
    if (geracaoId && GERACOES_YAMAHA_3000_KM.has(geracaoId)) {
      return [1000, 3000, 6000, 9000, 12000, 18000];
    }
    return [1000, 5000, 10000, 15000, 20000];
  }

  return [1000, 3000, 6000, 9000, 12000, 18000];
}

export function getCicloKmGeracao(marca: Marca, geracaoId: string): number {
  if (marca === 'Honda') {
    if (GERACOES_HONDA_3000_KM.has(geracaoId)) return 3000;
    if (GERACOES_HONDA_4000_KM.has(geracaoId)) return 4000;
    return 6000;
  }
  if (marca === 'Yamaha') {
    return GERACOES_YAMAHA_3000_KM.has(geracaoId) ? 3000 : 5000;
  }
  return 3000;
}

export function getDescricaoCicloRevisao(modelo: Modelo, geracao: Geracao): string {
  const arq = getArquiteturaMoto(modelo, geracao);
  const ciclo = getCicloKmGeracao(modelo.marca, geracao.id);
  const cicloFmt = `${ciclo.toLocaleString('pt-BR')} km`;

  if (modelo.marca === 'Honda') {
    const notaFiltro =
      arq.tipoFiltroOleo === 'centrifugo_honda'
        ? ' (filtro centrífugo e tela a cada 12.000 km)'
        : '';
    return `Ciclo Honda ${modelo.nome} (${geracao.anosLabel}): 1.000 km e múltiplos de ${cicloFmt}${notaFiltro}`;
  }

  if (modelo.marca === 'Yamaha') {
    const detalheFiltro =
      arq.tipoFiltroOleo === 'papel_externo'
        ? arq.temLinkTraseiro
          ? ' (filtro de óleo em papel e lubrificação do link a cada 10.000 km)'
          : ' (filtro de óleo em elemento de papel)'
        : ' (tela metálica interna de óleo)';
    return `Ciclo Yamaha ${modelo.nome} (${geracao.anosLabel}): 1.000 km e múltiplos de ${cicloFmt}${detalheFiltro}`;
  }

  return `Ciclo Suzuki ${modelo.nome} (${geracao.anosLabel}): 1.000 km e múltiplos de ${cicloFmt} (válvulas e filtro de óleo em papel)`;
}

/**
 * Constrói o plano completo de revisões adaptado à Marca, Modelo e Geração selecionados,
 * filtrando todos os itens pela arquitetura real da moto (alimentação, freios, câmbio e filtro de óleo).
 */
export function gerarPlanoRevisoes(modelo: Modelo, geracao: Geracao): MarcoRevisaoKm[] {
  const { marca } = modelo;
  const ficha = geracao.fichaTecnica;
  const arq = getArquiteturaMoto(modelo, geracao);
  const cicloKm = getCicloKmGeracao(marca, geracao.id);
  const isHonda3000 = marca === 'Honda' && cicloKm === 3000;
  const isHonda4000 = marca === 'Honda' && cicloKm === 4000;
  const isYamaha3000 = marca === 'Yamaha' && cicloKm === 3000;
  const intervalos = getIntervalosRevisao(marca, geracao.id);

  // Textos técnicos dinâmicos extraídos da ficha real da geração
  const oleo = ficha.fluidos?.oleoMotor;
  const volOleoTroca = oleo ? `${formatNumero(oleo.capacidadeTrocaL)} L` : '1,0 L';
  const volOleoComFiltro = oleo?.capacidadeTrocaComFiltroL
    ? `${formatNumero(oleo.capacidadeTrocaComFiltroL)} L (com filtro)`
    : volOleoTroca;
  const specOleo = oleo?.especificacao ?? 'SAE 10W-30 / 10W-40';

  const admStr = formatFaixa(ficha.folgas?.valvulaAdmissaoMm);
  const escStr = formatFaixa(ficha.folgas?.valvulaEscapeMm);
  const comandoStr = ficha.motorDetalhes?.comando ?? ficha.motor;

  const velaModelo = ficha.eletrica?.vela?.modelo ?? 'NGK';
  const velaFolga = formatFaixa(ficha.eletrica?.vela?.folgaEletrodoMm);

  const temFiltroPapel = arq.tipoFiltroOleo === 'papel_externo';
  const temFiltroCentrifugo = arq.tipoFiltroOleo === 'centrifugo_honda';

  const pDiant = ficha.pneus?.dianteiro;
  const pTras = ficha.pneus?.traseiro;
  const calibragemStr =
    pDiant && pTras
      ? `Diant ${pDiant.pressaoPsi ?? 25} PSI (${pDiant.medida}) | Tras ${pTras.pressaoPsi ?? 29} PSI solo / ${pTras.pressaoComGarupaPsi ?? 33} PSI c/ garupa (${pTras.medida})`
      : 'Conferir pressão a frio e desgaste TWI';

  const relacao = ficha.transmissaoFinal;
  const folgaCorrenteStr = formatFaixa(ficha.folgas?.folgaCorrenteMm);
  const bengala = ficha.fluidos?.fluidoBengala;

  const torqueBujao =
    ficha.torques?.find(
      (t) =>
        t.item.toLowerCase().includes('drenagem') ||
        t.item.toLowerCase().includes('bujão') ||
        t.item.toLowerCase().includes('óleo'),
    )?.torque.valor ??
    ficha.torques?.[0]?.torque.valor ??
    24;

  return intervalos.map((km): MarcoRevisaoKm => {
    const isPrimeira = km === 1000;
    const isRevisaoMedia =
      (marca === 'Honda' && km % 12000 === 0) ||
      (marca === 'Yamaha' && (isYamaha3000 ? km % 6000 === 0 : km % 10000 === 0)) ||
      (marca === 'Suzuki' && km % 6000 === 0);
    const isRevisaoCompleta =
      (marca === 'Honda' && km >= 24000) ||
      (marca === 'Yamaha' && (isYamaha3000 ? km >= 18000 : km >= 20000)) ||
      (marca === 'Suzuki' && km >= 12000);
    const isMarco16000Honda =
      (geracao.id === 'honda-cg-125-2009-2018' || geracao.id === 'honda-cg-150-2009-2015') &&
      km === 16000;

    const itens: ItemChecklistRevisao[] = [];

    // 1. Óleo do motor (sempre presente em todas as revisões)
    const obsOleo =
      geracao.id === 'honda-cg-125-2000-2008'
        ? ' • Nota Manual 2000 (pág. 36): 3 primeiras trocas a cada 1.000 km e demais a cada 1.500 km (0,80 L); Manual Fan 2008 (pág. 6-2): 1.000 km e a cada 4.000 km ou 1 ano (0,9 L)'
        : isHonda4000
          ? ' • Tabela oficial Honda: trocar aos 1.000 km e a cada 4.000 km ou 1 ano'
          : isHonda3000
            ? ' • Tabela oficial Honda desta geração: trocar aos 1.000 km e a cada 3.000 km (ou metade em uso severo)'
            : '';

    itens.push({
      id: `${km}-oleo-motor`,
      titulo: 'Trocar óleo do motor',
      categoria: 'TROCAR',
      detalheTecnico: `${temFiltroPapel ? volOleoComFiltro : volOleoTroca} de ${specOleo} • Torque do bujão: ${torqueBujao} N·m${obsOleo}`,
      tempoEstimadoMin: 15,
      criticidade: 'alta',
    });

    // 2. Filtro de óleo (estritamente conforme tipoFiltroOleo da arquitetura)
    if (temFiltroPapel) {
      const trocarPapel = isPrimeira || km % 5000 === 0 || km % 6000 === 0 || marca === 'Suzuki';
      itens.push({
        id: `${km}-filtro-papel`,
        titulo: trocarPapel
          ? 'Substituir filtro de óleo (elemento de papel)'
          : 'Inspecionar tampa do filtro de óleo',
        categoria: trocarPapel ? 'TROCAR' : 'CHECAR',
        detalheTecnico:
          marca === 'Suzuki'
            ? 'Elemento de papel HF131/HF132 — atenção ao anel O-ring interno do duto e à mola da tampa.'
            : 'Elemento de papel descartável na tampa lateral direita (lubrificar O-ring novo; atenção ao parafuso inferior mais longo).',
        tempoEstimadoMin: 10,
        criticidade: 'alta',
      });
    } else if (temFiltroCentrifugo) {
      if (isRevisaoMedia) {
        const notaCg2000 =
          geracao.id === 'honda-cg-125-2000-2008'
            ? ' (no Manual 2000 pág. 36 a limpeza é indicada a cada 6.000 km)'
            : '';
        itens.push({
          id: `${km}-filtro-centrifugo`,
          titulo: 'Abrir tampa direita e limpar filtro centrífugo + tela do filtro de óleo',
          categoria: 'LIMPAR_LUBRIFICAR',
          detalheTecnico: `Limpeza obrigatória a cada 12.000 km nas tabelas Honda${notaCg2000} (${ficha.motorDetalhes?.filtroOleo ?? 'filtro centrífugo + tela'}). Após remontagem, volume de desmontagem: ${
            oleo?.capacidadeTotalL ? `${formatNumero(oleo.capacidadeTotalL)} L` : '1,2 L'
          }.`,
          tempoEstimadoMin: 45,
          criticidade: 'alta',
        });
      } else {
        const limparTela4000 = geracao.id === 'honda-cg-125-2000-2008';
        itens.push({
          id: `${km}-tela-oleo`,
          titulo: limparTela4000
            ? 'Remover bujão (15 N·m) e limpar tela do filtro de óleo'
            : 'Conferir estanqueidade do bujão e programação da tela filtrante',
          categoria: limparTela4000 ? 'LIMPAR_LUBRIFICAR' : 'CHECAR',
          detalheTecnico: limparTela4000
            ? 'Manual 2008 (pág. 6-2/6-7): limpar a tela do filtro de óleo em 1.000 km e a cada 4.000 km (a cada 1.500 km no Manual 2000 pág. 36) • Torque da tampa/bujão: 15 N·m (1,5 kgf·m).'
            : `${ficha.motorDetalhes?.filtroOleo ?? 'Tela metálica interna + filtro centrífugo'} • Limpeza da tela e do rotor centrífugo programada a cada 12.000 km.`,
          tempoEstimadoMin: limparTela4000 ? 10 : 5,
          criticidade: limparTela4000 ? 'media' : 'rotina',
        });
      }
    } else {
      // tela_simples (ex.: Yamaha YBR 125 / Factor 125 carburadas)
      itens.push({
        id: `${km}-tela-oleo`,
        titulo: isRevisaoMedia
          ? 'Limpar tela metálica interna de filtragem de óleo'
          : 'Conferir estanqueidade do bujão e tela filtrante de óleo',
        categoria: isRevisaoMedia ? 'LIMPAR_LUBRIFICAR' : 'CHECAR',
        detalheTecnico: `${ficha.motorDetalhes?.filtroOleo ?? 'Tela metálica interna'} • Conferir ausência de limalhas e estado do anel de vedação do bujão.`,
        tempoEstimadoMin: isRevisaoMedia ? 15 : 5,
        criticidade: isRevisaoMedia ? 'media' : 'rotina',
      });
    }

    // 3. Folga de Válvulas
    const regularValvulas =
      isPrimeira || isRevisaoMedia || isHonda4000 || isHonda3000 || isYamaha3000 || marca === 'Suzuki';
    const notaValvulas =
      geracao.id === 'honda-cg-125-2000-2008'
        ? ' • Tabela oficial: verificar em 1.000 km e a cada 4.000 km (3.000 km no Manual 2000)'
        : isHonda4000
          ? ' • Tabela oficial Honda: verificar em 1.000 km e a cada 4.000 km'
          : isHonda3000
            ? ' • Tabela oficial Honda: verificar em 1.000 km e a cada 3.000 km'
            : '';

    itens.push({
      id: `${km}-valvulas`,
      titulo: regularValvulas
        ? 'Verificar e regular folga das válvulas (motor frio)'
        : 'Inspecionar ruído de comando e folga de válvulas',
      categoria: regularValvulas ? 'REGULAR' : 'CHECAR',
      detalheTecnico: `Admissão: ${admStr} | Escape: ${escStr} (motor frio no PMS de compressão • ${comandoStr}${notaValvulas})`,
      tempoEstimadoMin: 35,
      criticidade: 'alta',
    });

    // 4. Vela de Ignição
    const trocarVela = isHonda4000
      ? km % 8000 === 0
      : isHonda3000
        ? km % 6000 === 0
        : isRevisaoMedia || isRevisaoCompleta;

    itens.push({
      id: `${km}-vela`,
      titulo: trocarVela
        ? `Substituir vela de ignição (${velaModelo})`
        : `Verificar e ajustar folga do eletrodo da vela (${velaModelo})`,
      categoria: trocarVela ? 'TROCAR' : 'REGULAR',
      detalheTecnico: `Vela ${velaModelo} • Folga do eletrodo: ${velaFolga}${
        ficha.eletrica?.vela?.alternativas?.length
          ? ` (Alternativa/Opcional: ${ficha.eletrica.vela.alternativas.join(', ')})`
          : ''
      }${
        isHonda4000
          ? ' • Tabela oficial Honda: verificar a cada 4.000 km e substituir a cada 8.000 km (8.000, 16.000, 24.000 km)'
          : ''
      }`,
      tempoEstimadoMin: 10,
      criticidade: trocarVela ? 'alta' : 'media',
    });

    // 5. Alimentação (Injeção 100% vs Carburador 100% vs Geração Mista)
    const lentaStr = formatFaixa(ficha.motorDetalhes?.marchaLentaRpm);
    if (arq.tipoAlimentacao === 'injetada') {
      itens.push({
        id: `${km}-alimentacao-injecao`,
        titulo: isRevisaoMedia
          ? `Substituir filtro de combustível e inspecionar corpo de borboleta (TBI) / marcha lenta (${arq.siglaInjecao})`
          : `Verificar rotação de marcha lenta e linha de combustível (${arq.siglaInjecao})`,
        categoria: isRevisaoMedia ? 'TROCAR' : 'CHECAR',
        detalheTecnico: `${ficha.motorDetalhes?.alimentacaoDetalhe ?? `Injeção eletrônica ${arq.siglaInjecao}`} • Marcha lenta: ${lentaStr}`,
        tempoEstimadoMin: isRevisaoMedia ? 35 : 10,
        criticidade: isRevisaoMedia ? 'alta' : 'media',
      });
    } else if (arq.tipoAlimentacao === 'mista') {
      itens.push({
        id: `${km}-alimentacao-mista`,
        titulo: isRevisaoMedia
          ? `Alimentação (${arq.descricaoAlimentacao}) — inspeção, limpeza/filtro e marcha lenta`
          : `Verificar marcha lenta e linha de combustível — ${arq.descricaoAlimentacao}`,
        categoria: isRevisaoMedia ? 'LIMPAR_LUBRIFICAR' : 'REGULAR',
        detalheTecnico: `${arq.descricaoAlimentacao} • Marcha lenta: ${lentaStr}`,
        tempoEstimadoMin: isRevisaoMedia ? 30 : 15,
        criticidade: 'alta',
      });
    } else {
      // 100% carburada — zero menção a bico injetor, TBI, PGM-FI ou bomba de combustível
      itens.push({
        id: `${km}-alimentacao-carburador`,
        titulo: isRevisaoMedia
          ? 'Inspecionar linha de combustível, funcionamento do afogador e regular carburador/marcha lenta'
          : 'Verificar e ajustar rotação de marcha lenta do carburador',
        categoria: 'REGULAR',
        detalheTecnico: `${ficha.motorDetalhes?.alimentacaoDetalhe ?? 'Carburador'} • Marcha lenta: ${lentaStr}`,
        tempoEstimadoMin: isRevisaoMedia ? 30 : 15,
        criticidade: 'alta',
      });
    }

    // 6. Filtro de Ar (e Filtro PAIR aos 24.000 km apenas onde aplicável)
    if (!isPrimeira) {
      const trocarFiltroAr = isRevisaoMedia || isMarco16000Honda;
      const isCgAntiga = modelo.id === 'honda-cg-125' || modelo.id === 'honda-cg-150';
      const detalheFiltroAr = isCgAntiga
        ? 'Filtros secos (modelos até 2010): limpar conforme tabela e trocar a cada 12.000 km | Filtros de papel viscoso/úmido (2011+): NUNCA soprar com ar comprimido, trocar a cada 12.000–16.000 km.'
        : 'Elemento de papel viscoso não deve ser soprado com ar comprimido (rompe as fibras); em modelos com filtro de espuma, lavar com sabão neutro/querosene e umedecer em óleo. Reduzir pela metade em estradas de terra.';

      itens.push({
        id: `${km}-filtro-ar`,
        titulo: trocarFiltroAr
          ? isMarco16000Honda
            ? 'Substituir elemento do filtro de ar (tabela 16.000 km)'
            : 'Substituir elemento do filtro de ar'
          : 'Inspecionar elemento do filtro de ar e esgotar dreno da caixa de ar',
        categoria: trocarFiltroAr ? 'TROCAR' : 'LIMPAR_LUBRIFICAR',
        detalheTecnico: detalheFiltroAr,
        tempoEstimadoMin: 10,
        criticidade: trocarFiltroAr ? 'alta' : 'media',
      });
    }

    if (GERACOES_HONDA_PAIR.has(geracao.id) && km === 24000) {
      itens.push({
        id: `${km}-filtro-pair`,
        titulo: 'Substituir filtro de ar secundário do sistema de suprimento de ar (PAIR)',
        categoria: 'TROCAR',
        detalheTecnico:
          'Tabela oficial Honda (modelos equipados com PAIR): substituir o filtro secundário a cada 24.000 km ou 3 anos.',
        tempoEstimadoMin: 15,
        criticidade: 'media',
      });
    }

    // 7. Transmissão Final (Corrente vs Scooter CVT)
    if (arq.isCvt) {
      const oleoTransm = ficha.fluidos?.oleoTransmissaoCvt;
      const cvt = relacao?.cvtDetalhe;
      itens.push({
        id: `${km}-cvt-correia`,
        titulo: isRevisaoCompleta
          ? 'Substituir correia CVT, conferir roletes e limpar polias/embreagem centrífuga'
          : 'Limpar filtro de ar da caixa CVT e inspecionar correia/roletes',
        categoria: isRevisaoCompleta ? 'TROCAR' : 'LIMPAR_LUBRIFICAR',
        detalheTecnico: `Correia: ${cvt?.correiaCodigo ?? 'V-Belt'} (limite largura: ${
          cvt?.larguraLimiteMm ? `${formatNumero(cvt.larguraLimiteMm)} mm` : 'manual'
        }) • Roletes: ${cvt?.roletesMedidaPeso ?? '6 roletes'}`,
        tempoEstimadoMin: isRevisaoCompleta ? 50 : 20,
        criticidade: 'alta',
      });

      if (isRevisaoMedia || isRevisaoCompleta) {
        itens.push({
          id: `${km}-cvt-oleo-final`,
          titulo: 'Trocar óleo da transmissão final (redutor traseiro)',
          categoria: 'TROCAR',
          detalheTecnico: `Volume exato: ${
            oleoTransm
              ? `${formatNumero(oleoTransm.capacidadeL * 1000)} ml (${formatNumero(oleoTransm.capacidadeL)} L)`
              : '100–120 ml'
          } de ${oleoTransm?.especificacao ?? 'SAE 10W-30 / 10W-40'}`,
          tempoEstimadoMin: 15,
          criticidade: 'media',
        });
      }
    } else {
      itens.push({
        id: `${km}-kit-relacao`,
        titulo: isRevisaoCompleta
          ? 'Inspecionar desgaste crítico ou substituir kit relação (coroa, pinhão e corrente)'
          : 'Limpar, lubrificar e ajustar folga da corrente de transmissão',
        categoria: isRevisaoCompleta ? 'TROCAR' : 'REGULAR',
        detalheTecnico: `Relação ${relacao?.pinhaoDentes ?? 15}x${relacao?.coroaDentes ?? 44} (${
          relacao?.corrente ?? 'passo 428H'
        }) • Folga livre no meio da balança: ${folgaCorrenteStr}`,
        tempoEstimadoMin: 15,
        criticidade: 'alta',
      });
    }

    // 8. Arrefecimento líquido (quando aplicável)
    if (arq.isArrefecimentoLiquido) {
      const arref = ficha.fluidos?.liquidoArrefecimento;
      itens.push({
        id: `${km}-arrefecimento`,
        titulo: isRevisaoCompleta
          ? 'Substituir líquido de arrefecimento e sangrar ar do radiador'
          : 'Conferir nível do líquido de arrefecimento no reservatório de expansão',
        categoria: isRevisaoCompleta ? 'TROCAR' : 'CHECAR',
        detalheTecnico: `${arref?.especificacao ?? 'Aditivo etilenoglicol 50/50'} • Capacidade total: ${
          arref ? `${formatNumero(arref.capacidadeL)} L` : '0,52 L'
        }`,
        tempoEstimadoMin: isRevisaoCompleta ? 30 : 5,
        criticidade: 'alta',
      });
    }

    // 9. Sistema de Freios (Disco / CBS / UBS / ABS / Tambor) — 100% filtrado por arquitetura
    const { sistema } = ficha.freios;

    if (arq.temAlgumFreioDisco) {
      const eixoDisco =
        arq.temFreioDiscoDianteiro && arq.temFreioDiscoTraseiro
          ? 'dianteiro e traseiro'
          : arq.temFreioDiscoDianteiro
            ? 'dianteiro'
            : 'traseiro';

      let obsSistema = `Freio a disco ${eixoDisco} • Fluido ${ficha.fluidos?.fluidoFreio ?? 'DOT 4'}`;
      if (sistema === 'CBS') {
        obsSistema +=
          ' • Freio CBS: se sangrar, fazer nos 2 sangradores da pinça dianteira de 3 êmbolos';
      } else if (sistema === 'UBS') {
        obsSistema += ' • Freio UBS: conferir sincronismo do cabo combinador acionado pelo pedal';
      } else if (sistema === 'ABS') {
        obsSistema +=
          ' • Freio ABS: inspecionar limpeza da roda fônica e distância do sensor hall (0,7–1,2 mm)';
      }

      itens.push({
        id: `${km}-freio-disco`,
        titulo: isRevisaoCompleta
          ? `Substituir fluido de freio DOT 4, sangrar linha e medir pastilhas/disco (${eixoDisco})`
          : `Inspecionar espessura das pastilhas e nível do fluido de freio (${eixoDisco})`,
        categoria: isRevisaoCompleta ? 'TROCAR' : 'CHECAR',
        detalheTecnico: obsSistema,
        tempoEstimadoMin: isRevisaoCompleta ? 25 : 10,
        criticidade: 'alta',
      });
    }

    if (arq.temAlgumFreioTambor) {
      const eixoTambor = arq.isSomenteTambor ? 'dianteiro e traseiro' : 'traseiro';
      const folgaPedal =
        formatFaixa(ficha.folgas?.folgaPedalFreioMm) !== '—'
          ? formatFaixa(ficha.folgas?.folgaPedalFreioMm)
          : '20 – 30 mm';
      const folgaTamborDetalhe = arq.isSomenteTambor
        ? `Manete dianteiro: 10 – 20 mm | Pedal traseiro: ${folgaPedal}${
            sistema === 'CBS' ? ' • Sistema CBS mecânico: conferir equalização dos cabos' : ''
          }`
        : `Folga livre do pedal traseiro: ${folgaPedal}`;

      itens.push({
        id: `${km}-freio-tambor`,
        titulo: isRevisaoMedia
          ? `Abrir espelho do tambor (${eixoTambor}), limpar pó das lonas e lubrificar eixo came`
          : `Regular curso livre do freio a tambor (${eixoTambor}) e checar indicador de desgaste`,
        categoria: isRevisaoMedia ? 'LIMPAR_LUBRIFICAR' : 'REGULAR',
        detalheTecnico: `${folgaTamborDetalhe} • Nunca engraxar excessivamente o came para não contaminar a lona.`,
        tempoEstimadoMin: isRevisaoMedia ? 20 : 5,
        criticidade: 'media',
      });
    }

    // 10. Suspensão Dianteira (Bengalas) & Traseira / Link / Coluna de Direção
    if (isRevisaoMedia || isRevisaoCompleta || isMarco16000Honda) {
      const trocarFluidoBengala = isRevisaoCompleta || isMarco16000Honda;
      itens.push({
        id: `${km}-suspensao-direcao`,
        titulo: isMarco16000Honda
          ? 'Substituir fluido da suspensão dianteira (tabela 16.000 km)'
          : isRevisaoCompleta
            ? 'Substituir fluido da suspensão dianteira e lubrificar rolamentos da coluna de direção'
            : `Lubrificar rolamentos da coluna de direção e inspecionar suspensão${arq.temLinkTraseiro ? ' e link traseiro' : ''}`,
        categoria: trocarFluidoBengala ? 'TROCAR' : 'LIMPAR_LUBRIFICAR',
        detalheTecnico: bengala
          ? `Bengala: ${bengala.volumePorCanelaMl} cm³ (ml) por canela de ${bengala.especificacao}${
              bengala.observacao ? ` (${bengala.observacao})` : ''
            }${bengala.nivelMm ? ` • Nível: ${bengala.nivelMm} mm` : ''}${
              arq.temLinkTraseiro ? ' • Desmontar e engraxar buchas do link/balança' : ''
            }`
          : 'Inspecionar vazamentos nos retentores e pré-carga dos amortecedores.',
        tempoEstimadoMin: trocarFluidoBengala ? 50 : 25,
        criticidade: trocarFluidoBengala ? 'alta' : 'media',
      });
    }

    // 11. Cabos, Embreagem (quando manual) e Bateria / Sistema de Carga
    const bateriaTxt = `Bateria ${ficha.eletrica?.bateria?.modelo ?? '12V'} (${
      ficha.eletrica?.bateria?.capacidadeAh ?? 5
    }Ah)${!arq.isBateriaSelada ? ' [conferir nível de eletrólito se convencional]' : ''} • Carga esperada: ${
      ficha.eletrica?.bateria?.tensaoCargaV ?? '13,5V – 14,8V @ 5.000 rpm'
    }`;

    if (arq.isSemiautomatica) {
      itens.push({
        id: `${km}-cabos-bateria`,
        titulo: 'Lubrificar cabo do acelerador, verificar engate da embreagem centrífuga e testar bateria',
        categoria: 'CHECAR',
        detalheTecnico: `${bateriaTxt} • Folga acelerador: ${formatFaixa(
          ficha.folgas?.folgaAceleradorMm,
        )} • Câmbio semiautomático (embreagem centrífuga): conferir suavidade nas trocas de marcha.`,
        tempoEstimadoMin: 10,
        criticidade: 'rotina',
      });
    } else if (arq.isCvt) {
      itens.push({
        id: `${km}-cabos-bateria`,
        titulo: 'Lubrificar cabo do acelerador e testar tensão de carga da bateria',
        categoria: 'CHECAR',
        detalheTecnico: `${bateriaTxt} • Folga acelerador: ${formatFaixa(ficha.folgas?.folgaAceleradorMm)}`,
        tempoEstimadoMin: 10,
        criticidade: 'rotina',
      });
    } else {
      itens.push({
        id: `${km}-cabos-bateria`,
        titulo: 'Lubrificar cabos (acelerador e embreagem), conferir folgas e testar bateria',
        categoria: 'CHECAR',
        detalheTecnico: `${bateriaTxt} • Folga acelerador: ${formatFaixa(
          ficha.folgas?.folgaAceleradorMm,
        )} • Embreagem: ${formatFaixa(ficha.folgas?.folgaManeteEmbreagemMm)}`,
        tempoEstimadoMin: 10,
        criticidade: 'rotina',
      });
    }

    // 12. Pneus e Reaperto Geral de Torques Críticos
    itens.push({
      id: `${km}-pneus-torques`,
      titulo: 'Calibrar pneus a frio e conferir aperto de eixos, motor e freios',
      categoria: 'CHECAR',
      detalheTecnico: calibragemStr,
      tempoEstimadoMin: 10,
      criticidade: 'rotina',
    });

    const tempoTotalMin = itens.reduce((acc, item) => acc + item.tempoEstimadoMin, 0);
    const mesesReferencia = isPrimeira
      ? isHonda4000
        ? 6
        : 1
      : isHonda4000
        ? Math.round((km / 4000) * 6) + 6
        : Math.round((km / cicloKm) * 6);

    let subtitulo = 'Revisão Preventiva Periódica';
    let destaqueOficina =
      'Manutenção preventiva de rotina para preservar motor, transmissão e segurança.';

    if (isPrimeira) {
      subtitulo = '1ª Revisão de Amaciamento';
      destaqueOficina =
        'Crucial para remover limalhas do amaciamento, assentar folga inicial de válvulas e reapertar chassi.';
    } else if (isRevisaoCompleta) {
      subtitulo = arq.temAlgumFreioDisco
        ? 'Revisão Maior Completa (Fluido de Bengala / Freio / Transmissão)'
        : 'Revisão Maior Completa (Fluido de Bengala / Freios / Transmissão)';
      destaqueOficina = arq.temAlgumFreioDisco
        ? 'Revisão profunda: além de motor e válvulas, inclui renovação de fluidos hidráulicos, suspensão e transmissão.'
        : 'Revisão profunda: além de motor e válvulas, inclui renovação do fluido das bengalas, freios e transmissão.';
    } else if (isRevisaoMedia) {
      subtitulo = temFiltroCentrifugo
        ? 'Revisão Intermediária + Limpeza do Filtro Centrífugo'
        : 'Revisão Intermediária Completa (Válvulas, Vela, Filtro de Ar e Alimentação)';
      destaqueOficina = temFiltroCentrifugo
        ? 'Atenção obrigatória na abertura da tampa direita para limpeza do filtro centrífugo e peneira inferior.'
        : 'Inclui troca de vela, filtro de ar, regulagem de válvulas e revisão do sistema de alimentação.';
    }

    return {
      km,
      labelKm: `${km.toLocaleString('pt-BR')} km`,
      mesesReferencia,
      subtitulo,
      destaqueOficina,
      tempoTotalMin,
      itens,
    };
  });
}

export const DIRETRIZES_TEMPO_USO_SEVERO: readonly DiretrizTempoSevero[] = [
  {
    id: 'oleo-tempo',
    titulo: 'Óleo do Motor (Quilometragem vs Tempo / Uso Severo)',
    prazoNormal: 'A cada revisão do manual ou 6 meses (o que ocorrer primeiro)',
    prazoSevero:
      'Reduzir pela METADE (1.500 a 2.500 km) em entregas, trânsito pesado ou trajetos curtos',
    explicacao:
      'Motos de baixa cilindrada operam em alto giro e levam apenas 0,7 L a 1,0 L de óleo. Em uso severo (entregas, poeira ou ladeiras com garupa), realizar troca intermediária de óleo na metade do intervalo do manual e conferir o nível toda semana.',
  },
  {
    id: 'fluido-freio',
    titulo: 'Fluido de Freio (DOT 3 / DOT 4)',
    prazoNormal: 'Substituição completa a cada 24 meses (2 anos) ou 18.000–24.000 km',
    prazoSevero: 'A cada 12 meses em regiões úmidas ou uso urbano intenso',
    explicacao:
      'O fluido glicólico DOT 3/4 é higroscópico (absorve umidade do ar). Com água acima de 3%, o ponto de ebulição despenca, causando manete borrachudo e oxidação interna dos êmbolos da pinça e do modulador ABS/CBS.',
  },
  {
    id: 'fluido-bengala',
    titulo: 'Fluido da Suspensão Dianteira (Bengalas)',
    prazoNormal: 'A cada 12 a 18 meses ou 15.000–20.000 km',
    prazoSevero: 'A cada 10.000 km em ruas esburacadas ou estradas de terra',
    explicacao:
      'O óleo ATF / Fork Oil 10W sofre cisalhamento e acumula micropartículas de alumínio das buchas, deixando a frente boba e estourando retentores precocemente.',
  },
  {
    id: 'corrente-relacao',
    titulo: 'Corrente de Transmissão e Kit Relação (Limpeza, Lubrificação e Folga)',
    prazoNormal: 'Inspeção, ajuste de folga e lubrificação a cada 500–1.000 km',
    prazoSevero: 'Limpar e lubrificar após cada chuva forte ou trecho de terra/areia',
    explicacao:
      'Corrente seca ou excessivamente esticada desgasta prematuramente os dentes da coroa/pinhão e sobrecarrega o rolamento do eixo secundário do câmbio.',
  },
];

/**
 * Filtra e adapta as diretrizes de tempo / uso severo à arquitetura real da moto
 * (ex.: omite fluido DOT 4 em motos somente a tambor; adapta transmissão em scooters CVT).
 */
export function getDiretrizesTempoUsoSevero(
  modelo: Modelo,
  geracao: Geracao,
): DiretrizTempoSevero[] {
  const arq = getArquiteturaMoto(modelo, geracao);
  const lista: DiretrizTempoSevero[] = [];

  for (const d of DIRETRIZES_TEMPO_USO_SEVERO) {
    if (d.id === 'fluido-freio') {
      if (arq.isSomenteTambor) {
        lista.push({
          id: 'freio-tambor-severo',
          titulo: 'Freios a Tambor (Lonas, Cubos e Cabos/Vareta)',
          prazoNormal: 'Limpeza de pó e regulagem a cada revisão periódica do manual',
          prazoSevero: 'Abrir e limpar a cada 3.000–4.000 km em chuva, barro ou uso urbano intenso',
          explicacao:
            'O acúmulo de pó das lonas dentro do cubo provoca chiado e perda de eficiência. Limpar com pano/ar, quebrar o espelhamento com lixa 160/180 e aplicar película mínima de graxa no eixo came.',
        });
      } else {
        lista.push(d);
      }
      continue;
    }

    if (d.id === 'corrente-relacao' && arq.isCvt) {
      lista.push({
        id: 'cvt-severo',
        titulo: 'Transmissão CVT (Correia, Roletes e Filtro da Caixa)',
        prazoNormal: 'Inspeção e limpeza a cada revisão intermediária; troca da correia na revisão maior',
        prazoSevero: 'Limpar filtro de ar da caixa CVT e soprar pó da campana a cada 5.000 km',
        explicacao:
          'Poeira acumulada na campana da embreagem centrífuga causa trepidação nas saídas e desgaste prematuro dos roletes e da correia.',
      });
      continue;
    }

    lista.push(d);
  }

  return lista;
}
