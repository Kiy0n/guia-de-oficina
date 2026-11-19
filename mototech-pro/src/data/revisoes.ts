import type { CategoriaAcaoRevisao, Geracao, Marca, Modelo } from '@/types/moto';
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

const INTERVALOS_POR_MARCA: Record<Marca, readonly number[]> = {
  Honda: [1000, 4000, 8000, 12000, 16000, 20000, 24000],
  Yamaha: [1000, 5000, 10000, 15000, 20000],
  Suzuki: [1000, 3000, 6000, 9000, 12000, 18000],
};

const GERACOES_HONDA_4000_KM = new Set<string>([
  'honda-cg-125-2000-2008',
  'honda-cg-125-2009-2018',
  'honda-cg-150-2004-2008',
  'honda-cg-150-2009-2015',
]);

export function getIntervalosRevisao(marca: Marca, geracaoId?: string): readonly number[] {
  if (marca === 'Honda') {
    if (!geracaoId || GERACOES_HONDA_4000_KM.has(geracaoId)) {
      return [1000, 4000, 8000, 12000, 16000, 20000, 24000];
    }
    return [1000, 6000, 12000, 18000, 24000];
  }
  return INTERVALOS_POR_MARCA[marca];
}

/**
 * Constrói o plano completo de revisões adaptado à Marca, Modelo e Geração selecionados,
 * injetando automaticamente os dados técnicos reais (óleo, válvulas, vela, relação/CVT, freios, alimentação).
 */
export function gerarPlanoRevisoes(modelo: Modelo, geracao: Geracao): MarcoRevisaoKm[] {
  const { marca } = modelo;
  const ficha = geracao.fichaTecnica;
  const isHonda4000 = marca === 'Honda' && GERACOES_HONDA_4000_KM.has(geracao.id);
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

  const isCvt = ficha.cambio.tipo === 'cvt' || ficha.transmissaoFinal?.tipo === 'correia';
  const isInjetada = ficha.alimentacao === 'injecao';
  const isLiquido = ficha.arrefecimento === 'liquido';
  const temFiltroPapel =
    (ficha.motorDetalhes?.filtroOleo ?? '').toLowerCase().includes('papel') ||
    (marca === 'Yamaha' && (ficha.cilindradaCc >= 145 || geracao.anoInicio >= 2017) && !isCvt) ||
    (marca === 'Suzuki' && (!isCvt || geracao.anoInicio <= 2010));
  const temFiltroCentrifugo = (ficha.motorDetalhes?.filtroOleo ?? '').toLowerCase().includes('centrífugo');
  const temLinkTraseiro =
    modelo.id === 'yamaha-crosser-150' ||
    (modelo.id === 'yamaha-fazer-150' && geracao.anoInicio >= 2023) ||
    modelo.categoria === 'trail';

  const pDiant = ficha.pneus?.dianteiro;
  const pTras = ficha.pneus?.traseiro;
  const calibragemStr =
    pDiant && pTras
      ? `Diant ${pDiant.pressaoPsi ?? 25} PSI (${pDiant.medida}) | Tras ${pTras.pressaoPsi ?? 29} PSI solo / ${pTras.pressaoComGarupaPsi ?? 33} PSI c/ garupa (${pTras.medida})`
      : 'Conferir pressão a frio e desgaste TWI';

  const relacao = ficha.transmissaoFinal;
  const folgaCorrenteStr = formatFaixa(ficha.folgas?.folgaCorrenteMm);
  const bengala = ficha.fluidos?.fluidoBengala;

  return intervalos.map((km): MarcoRevisaoKm => {
    const isPrimeira = km === 1000;
    const isRevisaoMedia =
      (marca === 'Honda' && km % 12000 === 0) ||
      (marca === 'Yamaha' && km % 10000 === 0) ||
      (marca === 'Suzuki' && km % 6000 === 0);
    const isRevisaoCompleta =
      (marca === 'Honda' && km >= 24000) ||
      (marca === 'Yamaha' && km >= 20000) ||
      (marca === 'Suzuki' && km >= 12000);
    const isMarco16000Honda = isHonda4000 && km === 16000;

    const itens: ItemChecklistRevisao[] = [];

    // 1. Óleo do motor (sempre presente em todas as revisões)
    const obsOleo2000 =
      geracao.id === 'honda-cg-125-2000-2008'
        ? ' • Nota Manual 2000 (pág. 36): 3 primeiras trocas a cada 1.000 km e demais a cada 1.500 km (0,80 L); Manual Fan 2008 (pág. 6-2): 1.000 km e a cada 4.000 km ou 1 ano (0,9 L)'
        : isHonda4000
          ? ' • Tabela oficial Honda: trocar aos 1.000 km e a cada 4.000 km ou 1 ano'
          : '';
    itens.push({
      id: `${km}-oleo-motor`,
      titulo: 'Trocar óleo do motor',
      categoria: 'TROCAR',
      detalheTecnico: `${temFiltroPapel ? volOleoComFiltro : volOleoTroca} de ${specOleo} • Torque do bujão: ${
        ficha.torques?.[0]?.torque.valor ?? 24
      } N·m${obsOleo2000}`,
      tempoEstimadoMin: 15,
      criticidade: 'alta',
    });

    // 2. Filtro de óleo (papel vs centrífugo vs tela)
    if (temFiltroPapel) {
      const trocarPapel = isPrimeira || km % 5000 === 0 || km % 6000 === 0 || marca === 'Suzuki';
      itens.push({
        id: `${km}-filtro-papel`,
        titulo: trocarPapel ? 'Substituir filtro de óleo (elemento de papel)' : 'Inspecionar tampa do filtro de óleo',
        categoria: trocarPapel ? 'TROCAR' : 'CHECAR',
        detalheTecnico:
          marca === 'Suzuki'
            ? 'Elemento de papel HF131/HF132 — ATENÇÃO ao anel O-ring interno do duto e à mola da tampa!'
            : 'Elemento de papel descartável na tampa direita (lubrificar O-ring novo; atenção ao parafuso inferior mais longo).',
        tempoEstimadoMin: 10,
        criticidade: 'alta',
      });
    } else if (temFiltroCentrifugo && isRevisaoMedia) {
      itens.push({
        id: `${km}-filtro-centrifugo`,
        titulo: 'Abrir tampa direita e limpar filtro centrífugo + tela do filtro de óleo',
        categoria: 'LIMPAR_LUBRIFICAR',
        detalheTecnico: `Obrigatório a cada 12.000 km nas tabelas Honda (${ficha.motorDetalhes?.filtroOleo ?? 'centrífugo + tela'}; no Manual CG 125 2000 pág. 36 o filtro centrífugo é limpo a cada 6.000 km). Após remontagem, volume de desmontagem: ${
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
          : 'Conferir estanqueidade do bujão e tela filtrante de óleo',
        categoria: limparTela4000 ? 'LIMPAR_LUBRIFICAR' : 'CHECAR',
        detalheTecnico: limparTela4000
          ? 'Manual CG 125 Fan 2008 (pág. 6-2/6-7): limpar a tela do filtro de óleo em 1.000 km e a cada 4.000 km (a cada 1.500 km no Manual 2000 pág. 36) • Torque da tampa/bujão: 15 N·m (1,5 kgf·m).'
          : `${ficha.motorDetalhes?.filtroOleo ?? 'Tela metálica interna'} • Limpeza da tela e filtro centrífugo programada a cada 12.000 km.`,
        tempoEstimadoMin: limparTela4000 ? 10 : 5,
        criticidade: limparTela4000 ? 'media' : 'rotina',
      });
    }

    // 3. Folga de Válvulas
    const regularValvulas = isPrimeira || isRevisaoMedia || isHonda4000 || marca === 'Suzuki';
    itens.push({
      id: `${km}-valvulas`,
      titulo: regularValvulas
        ? 'Verificar e regular folga das válvulas (motor frio)'
        : 'Inspecionar ruído de comando e folga de válvulas',
      categoria: regularValvulas ? 'REGULAR' : 'CHECAR',
      detalheTecnico: `Admissão: ${admStr} | Escape: ${escStr} (motor frio no PMS de compressão • ${comandoStr}${
        isHonda4000 ? ' • Tabela oficial Honda: verificar em 1.000 km e a cada 4.000 km [3.000 km na CG 125 2000]' : ''
      })`,
      tempoEstimadoMin: 35,
      criticidade: 'alta',
    });

    // 4. Vela de Ignição
    const trocarVela = isHonda4000 ? km % 8000 === 0 : isRevisaoMedia || isRevisaoCompleta;
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

    // 5. Alimentação (Injeção vs Carburador)
    if (isInjetada) {
      itens.push({
        id: `${km}-alimentacao-injecao`,
        titulo: isRevisaoMedia
          ? 'Substituir unidade do filtro de combustível (12.000 km) e verificar linha/marcha lenta PGM-FI'
          : 'Verificar rotação de marcha lenta e linha de combustível PGM-FI',
        categoria: isRevisaoMedia ? 'TROCAR' : 'CHECAR',
        detalheTecnico: `${ficha.motorDetalhes?.alimentacaoDetalhe ?? 'Injeção eletrônica'} • Marcha lenta: ${formatFaixa(
          ficha.motorDetalhes?.marchaLentaRpm,
        )}`,
        tempoEstimadoMin: isRevisaoMedia ? 35 : 10,
        criticidade: isRevisaoMedia ? 'alta' : 'media',
      });
    } else {
      itens.push({
        id: `${km}-alimentacao-carburador`,
        titulo: isRevisaoMedia
          ? 'Inspecionar linha de combustível, funcionamento do afogador e ajustar marcha lenta'
          : 'Verificar e ajustar rotação de marcha lenta do carburador',
        categoria: 'REGULAR',
        detalheTecnico: `${ficha.motorDetalhes?.alimentacaoDetalhe ?? 'Carburador'} • Marcha lenta: ${formatFaixa(
          ficha.motorDetalhes?.marchaLentaRpm,
        )}`,
        tempoEstimadoMin: isRevisaoMedia ? 30 : 15,
        criticidade: 'alta',
      });
    }

    // 6. Filtro de Ar (e Filtro PAIR aos 24.000 km)
    if (!isPrimeira) {
      const trocarFiltroAr = isRevisaoMedia || isMarco16000Honda;
      const detalheFiltroAr = isHonda4000
        ? 'Manuais 2004–2010 (filtro seco): limpar a cada 4.000 km (3.000 km na CG 125 2000) e trocar a cada 12.000 km | Manuais 2011 (filtro viscoso/úmido): NUNCA limpar com ar comprimido, trocar a cada 12.000 km | Manuais 2014 (filtro viscoso/úmido): trocar a cada 16.000 km.'
        : 'Elemento de papel viscoso não deve ser soprado com ar comprimido (rompe as fibras); substituir na metade do prazo se rodar em estrada de terra.';
      itens.push({
        id: `${km}-filtro-ar`,
        titulo: trocarFiltroAr
          ? isMarco16000Honda
            ? 'Substituir elemento do filtro de ar (tabela 16.000 km linha 2014)'
            : 'Substituir elemento do filtro de ar (tabela 12.000 km)'
          : 'Inspecionar/limpar filtro de ar (apenas tipo seco 2000–2010) e tubo de respiro do motor',
        categoria: trocarFiltroAr ? 'TROCAR' : 'LIMPAR_LUBRIFICAR',
        detalheTecnico: detalheFiltroAr,
        tempoEstimadoMin: 10,
        criticidade: trocarFiltroAr ? 'alta' : 'media',
      });
    }

    if (isHonda4000 && km === 24000) {
      itens.push({
        id: `${km}-filtro-pair`,
        titulo: 'Substituir filtro de ar secundário do sistema de suprimento de ar (PAIR)',
        categoria: 'TROCAR',
        detalheTecnico:
          'Tabela oficial Honda (Manuais 2008 a 2014): substituir o filtro PAIR a cada 24.000 km ou 3 anos.',
        tempoEstimadoMin: 15,
        criticidade: 'media',
      });
    }

    // 7. Transmissão Final (Corrente vs Scooter CVT)
    if (isCvt) {
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
            oleoTransm ? `${formatNumero(oleoTransm.capacidadeL * 1000)} ml (${formatNumero(oleoTransm.capacidadeL)} L)` : '100–120 ml'
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

    // 8. Arrefecimento líquido (quando aplicável, ex: PCX 150 / 160)
    if (isLiquido) {
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

    // 9. Sistema de Freios (Disco / CBS / UBS / ABS / Tambor)
    const { dianteiro, traseiro, sistema } = ficha.freios;
    const temDisco = dianteiro === 'disco' || traseiro === 'disco';
    const temTambor = dianteiro === 'tambor' || traseiro === 'tambor';

    if (temDisco) {
      let obsSistema = `Fluido ${ficha.fluidos?.fluidoFreio ?? 'DOT 4'}`;
      if (sistema === 'CBS') {
        obsSistema += ' • Freio CBS: se sangrar, fazer nos 2 sangradores da pinça dianteira de 3 êmbolos';
      } else if (sistema === 'UBS') {
        obsSistema += ' • Freio UBS: conferir sincronismo do cabo combinador acionado pelo pedal';
      } else if (sistema === 'ABS') {
        obsSistema += ' • Freio ABS: inspecionar limpeza da roda fônica e distância do sensor hall (0,7–1,2 mm)';
      }

      itens.push({
        id: `${km}-freio-disco`,
        titulo: isRevisaoCompleta
          ? 'Substituir fluido de freio DOT 4, sangrar linha e medir pastilhas/disco'
          : 'Inspecionar espessura das pastilhas e nível do fluido de freio',
        categoria: isRevisaoCompleta ? 'TROCAR' : 'CHECAR',
        detalheTecnico: obsSistema,
        tempoEstimadoMin: isRevisaoCompleta ? 25 : 10,
        criticidade: 'alta',
      });
    }

    if (temTambor) {
      itens.push({
        id: `${km}-freio-tambor`,
        titulo: isRevisaoMedia
          ? 'Abrir espelho do tambor, limpar pó das lonas e lubrificar eixo came'
          : 'Regular curso livre do freio a tambor e checar indicador de desgaste',
        categoria: isRevisaoMedia ? 'LIMPAR_LUBRIFICAR' : 'REGULAR',
        detalheTecnico: `Folga livre do pedal/manete: ${formatFaixa(ficha.folgas?.folgaPedalFreioMm) !== '—' ? formatFaixa(ficha.folgas?.folgaPedalFreioMm) : '20 – 30 mm'} • Nunca engraxar excessivamente o came para não contaminar a lona.`,
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
          ? 'Substituir fluido da suspensão dianteira (tabela 16.000 km linha 2014)'
          : isRevisaoCompleta
            ? 'Substituir fluido da suspensão dianteira e lubrificar rolamentos da coluna de direção'
            : `Lubrificar rolamentos da coluna de direção (12.000 km) e inspecionar suspensão${temLinkTraseiro ? ' e link traseiro' : ''}`,
        categoria: trocarFluidoBengala ? 'TROCAR' : 'LIMPAR_LUBRIFICAR',
        detalheTecnico: bengala
          ? `Bengala: ${bengala.volumePorCanelaMl} cm³ (ml) por canela de ${bengala.especificacao}${
              bengala.observacao ? ` (${bengala.observacao})` : ''
            }${bengala.nivelMm ? ` • Nível: ${bengala.nivelMm} mm` : ''}${
              temLinkTraseiro ? ' • Desmontar e engraxar buchas do link/balança' : ''
            }`
          : 'Inspecionar vazamentos nos retentores e pré-carga dos amortecedores.',
        tempoEstimadoMin: trocarFluidoBengala ? 50 : 25,
        criticidade: trocarFluidoBengala ? 'alta' : 'media',
      });
    }

    // 11. Cabos, Manetes e Bateria / Sistema de Carga
    itens.push({
      id: `${km}-cabos-bateria`,
      titulo: 'Lubrificar cabos/manetes e testar tensão de carga da bateria',
      categoria: 'CHECAR',
      detalheTecnico: `Bateria ${ficha.eletrica?.bateria?.modelo ?? '12V'} (${
        ficha.eletrica?.bateria?.capacidadeAh ?? 5
      }Ah) • Carga esperada: ${ficha.eletrica?.bateria?.tensaoCargaV ?? '13,5V – 14,8V @ 5.000 rpm'} • Folga acelerador: ${formatFaixa(
        ficha.folgas?.folgaAceleradorMm,
      )}`,
      tempoEstimadoMin: 10,
      criticidade: 'rotina',
    });

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
        : Math.round((km / (marca === 'Suzuki' ? 3000 : 5000)) * 6);

    let subtitulo = 'Revisão Preventiva Periódica';
    let destaqueOficina = 'Manutenção preventiva de rotina para preservar motor, transmissão e segurança.';

    if (isPrimeira) {
      subtitulo = '1ª Revisão de Amaciamento';
      destaqueOficina =
        'Crucial para remover limalhas do amaciamento, assentar folga inicial de válvulas e reapertar chassi.';
    } else if (isRevisaoCompleta) {
      subtitulo = 'Revisão Maior Completa (Fluido de Bengala / Freio / Transmissão)';
      destaqueOficina =
        'Revisão profunda: além de motor e válvulas, inclui renovação de fluidos hidráulicos, suspensão e transmissão.';
    } else if (isRevisaoMedia) {
      subtitulo = temFiltroCentrifugo
        ? 'Revisão Intermediária + Limpeza do Filtro Centrífugo'
        : 'Revisão Intermediária Completa (Válvulas, Vela, Filtro de Ar e Alimentação)';
      destaqueOficina = temFiltroCentrifugo
        ? 'Atenção obrigatória na abertura da tampa direita para limpeza do filtro centrífugo e peneira inferior.'
        : 'Inclui troca de vela, filtro de ar, regulagem de válvulas e limpeza de alimentação.';
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
    prazoSevero: 'Reduzir pela METADE (1.500 a 2.500 km) em entregas, trânsito pesado ou trajetos curtos',
    explicacao:
      'Motos de baixa cilindrada operam em alto giro e levam apenas 0,7 L a 1,0 L de óleo. Em uso severo (iFood/motoboy, poeira ou ladeiras com garupa), realizar troca intermediária de óleo na metade do intervalo do manual e conferir o nível na vareta toda semana.',
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
    id: 'arrefecimento-cvt',
    titulo: 'Líquido de Arrefecimento & Correia CVT (Scooters)',
    prazoNormal: 'Aditivo radiador: 24 meses | Correia CVT: inspeção a cada 6.000 km, troca aos 20.000–24.000 km',
    prazoSevero: 'Limpar filtro de espuma da tampa CVT a cada 3.000 km',
    explicacao:
      'Em scooters (PCX, Fluo, Burgman), o filtro de ventilação do CVT entupido superaquece as polias, vitrifica as sapatas da embreagem (trepidação na arrancada) e reduz a vida útil da correia pela metade.',
  },
];
