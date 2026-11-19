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
  Honda: [1000, 6000, 12000, 18000, 24000],
  Yamaha: [1000, 5000, 10000, 15000, 20000],
  Suzuki: [1000, 3000, 6000, 9000, 12000, 18000],
};

export function getIntervalosRevisao(marca: Marca): readonly number[] {
  return INTERVALOS_POR_MARCA[marca];
}

/**
 * Constrói o plano completo de revisões adaptado à Marca, Modelo e Geração selecionados,
 * injetando automaticamente os dados técnicos reais (óleo, válvulas, vela, relação/CVT, freios, alimentação).
 */
export function gerarPlanoRevisoes(modelo: Modelo, geracao: Geracao): MarcoRevisaoKm[] {
  const { marca } = modelo;
  const ficha = geracao.fichaTecnica;
  const intervalos = getIntervalosRevisao(marca);

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

    const itens: ItemChecklistRevisao[] = [];

    // 1. Óleo do motor (sempre presente em todas as revisões)
    itens.push({
      id: `${km}-oleo-motor`,
      titulo: 'Trocar óleo do motor',
      categoria: 'TROCAR',
      detalheTecnico: `${ temFiltroPapel ? volOleoComFiltro : volOleoTroca } de ${specOleo} • Torque do bujão: ${
        ficha.torques?.[0]?.torque.valor ?? 24
      } N·m`,
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
        titulo: 'Abrir tampa direita e limpar filtro centrífugo + peneira metálica',
        categoria: 'LIMPAR_LUBRIFICAR',
        detalheTecnico: `Obrigatório a cada 12.000 km nas Honda (${ficha.motorDetalhes?.filtroOleo ?? 'centrífugo + tela'}). Após remontar com junta nova, abastecer ${
          oleo?.capacidadeTotalL ? `${formatNumero(oleo.capacidadeTotalL)} L` : '1,2 L'
        }.`,
        tempoEstimadoMin: 45,
        criticidade: 'alta',
      });
    } else {
      itens.push({
        id: `${km}-tela-oleo`,
        titulo: 'Conferir estanqueidade do bujão e tela filtrante de óleo',
        categoria: 'CHECAR',
        detalheTecnico: `${ficha.motorDetalhes?.filtroOleo ?? 'Tela metálica interna'} • Substituir arruela de vedação de alumínio.`,
        tempoEstimadoMin: 5,
        criticidade: 'rotina',
      });
    }

    // 3. Folga de Válvulas
    const regularValvulas = isPrimeira || isRevisaoMedia || marca === 'Suzuki';
    itens.push({
      id: `${km}-valvulas`,
      titulo: regularValvulas
        ? 'Conferir e regular folga de válvulas (motor totalmente frio)'
        : 'Inspecionar ruído de comando e folga de válvulas',
      categoria: regularValvulas ? 'REGULAR' : 'CHECAR',
      detalheTecnico: `Admissão: ${admStr} | Escape: ${escStr} (motor abaixo de 35 °C no PMS de compressão • ${comandoStr})`,
      tempoEstimadoMin: 35,
      criticidade: 'alta',
    });

    // 4. Vela de Ignição
    const trocarVela = isRevisaoMedia || isRevisaoCompleta;
    itens.push({
      id: `${km}-vela`,
      titulo: trocarVela
        ? `Substituir vela de ignição (${velaModelo})`
        : `Limpar e calibrar eletrodo da vela (${velaModelo})`,
      categoria: trocarVela ? 'TROCAR' : 'REGULAR',
      detalheTecnico: `Vela ${velaModelo} • Folga do eletrodo: ${velaFolga}${
        ficha.eletrica?.vela?.iridiumAlternativa ? ` (Upgrade Iridium: ${ficha.eletrica.vela.iridiumAlternativa})` : ''
      }`,
      tempoEstimadoMin: 10,
      criticidade: trocarVela ? 'alta' : 'media',
    });

    // 5. Alimentação (Injeção vs Carburador)
    if (isInjetada) {
      itens.push({
        id: `${km}-alimentacao-injecao`,
        titulo: isRevisaoMedia
          ? 'Limpar corpo de borboleta (TBI), verificar pressão da bomba e trocar filtro de combustível'
          : 'Verificar marcha lenta, códigos da injeção e funcionamento do TBI',
        categoria: isRevisaoMedia ? 'LIMPAR_LUBRIFICAR' : 'CHECAR',
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
          ? 'Desmontar, limpar carburador em ultrassom e regular mistura/marcha lenta'
          : 'Ajustar rotação de marcha lenta e drenar impurezas da cuba do carburador',
        categoria: isRevisaoMedia ? 'LIMPAR_LUBRIFICAR' : 'REGULAR',
        detalheTecnico: `${ficha.motorDetalhes?.alimentacaoDetalhe ?? 'Carburador'} • Marcha lenta: ${formatFaixa(
          ficha.motorDetalhes?.marchaLentaRpm,
        )}`,
        tempoEstimadoMin: isRevisaoMedia ? 45 : 15,
        criticidade: 'alta',
      });
    }

    // 6. Filtro de Ar
    if (!isPrimeira) {
      itens.push({
        id: `${km}-filtro-ar`,
        titulo: isRevisaoMedia ? 'Substituir elemento do filtro de ar' : 'Inspecionar elemento do filtro de ar e dreno da caixa',
        categoria: isRevisaoMedia ? 'TROCAR' : 'CHECAR',
        detalheTecnico:
          'Elemento de papel viscoso não deve ser soprado com ar comprimido (rompe as fibras); substituir na metade do prazo se rodar em estrada de terra.',
        tempoEstimadoMin: 10,
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
    if (isRevisaoMedia || isRevisaoCompleta) {
      itens.push({
        id: `${km}-suspensao-direcao`,
        titulo: isRevisaoCompleta
          ? 'Trocar fluido das bengalas dianteiras e engraxar caixa de direção / balança'
          : `Verificar folga da caixa de direção, retentores de bengala${temLinkTraseiro ? ' e lubrificar link traseiro' : ''}`,
        categoria: isRevisaoCompleta ? 'TROCAR' : 'LIMPAR_LUBRIFICAR',
        detalheTecnico: bengala
          ? `Bengala: ${bengala.volumePorCanelaMl} ml por canela de ${bengala.especificacao}${
              bengala.nivelMm ? ` (nível ${bengala.nivelMm} mm)` : ''
            }${temLinkTraseiro ? ' • Desmontar e engraxar buchas do link/balança' : ''}`
          : 'Inspecionar vazamentos nos retentores e pré-carga dos amortecedores.',
        tempoEstimadoMin: isRevisaoCompleta ? 60 : 25,
        criticidade: isRevisaoCompleta ? 'alta' : 'media',
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
    const mesesReferencia = isPrimeira ? 1 : Math.round((km / (marca === 'Suzuki' ? 3000 : 5000)) * 6);

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
