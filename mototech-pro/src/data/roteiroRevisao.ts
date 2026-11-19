import type { Geracao, Modelo } from '@/types/moto';
import { getArquiteturaMoto, type ArquiteturaMoto } from '@/utils/arquiteturaMoto';
import { formatFaixa, formatNumero, nmParaKgfm } from '@/utils/format';

export type TipoRevisaoGuiada = 'basica' | 'completa' | 'pre_viagem';

export type ZonaVisualMoto =
  | 'frente_roda'
  | 'bengala'
  | 'direcao_guidao'
  | 'motor_topo'
  | 'motor_oleo'
  | 'alimentacao'
  | 'eletrica_bateria'
  | 'transmissao_balanca'
  | 'traseira_freio'
  | 'geral';

export type AcaoSugeridaPasso = 'checar' | 'lubrificar_limpar' | 'regular' | 'substituir';

export type StatusFeedbackPasso =
  | 'checado_ok'
  | 'limpo_lubrificado'
  | 'regulado'
  | 'substituido'
  | 'trocar_em_breve'
  | 'nao_aplica';

export interface RegistroFeedbackPasso {
  status: StatusFeedbackPasso;
  observacao?: string;
  pecaUsada?: string;
}

export interface PassoRevisao {
  id: string;
  ordem: number;
  titulo: string;
  zonaVisual: ZonaVisualMoto;
  acaoSugerida: AcaoSugeridaPasso;
  valorFicha: string;
  comoInspecionar: string;
  criterioVisual: {
    ok: string;
    atencao: string;
    substituir: string;
  };
  procedimentoIdRelacionado?: string;
}

export interface PerfilRevisaoMeta {
  id: TipoRevisaoGuiada;
  titulo: string;
  subtitulo: string;
  tempoEstimado: string;
  qtdAproximada: string;
}

export const PERFIS_REVISAO: readonly PerfilRevisaoMeta[] = [
  {
    id: 'basica',
    titulo: 'Revisão Básica / Troca de Óleo',
    subtitulo: 'Essencial do dia a dia: óleo, freios, pneus, transmissão, cabos e elétrica.',
    tempoEstimado: '25 – 40 min',
    qtdAproximada: '~8 passos',
  },
  {
    id: 'completa',
    titulo: 'Revisão Completa de Bancada',
    subtitulo: 'Inspeção total ponta a ponta: válvulas, sistema de óleo, alimentação, bengala, direção e chassi.',
    tempoEstimado: '90 – 150 min',
    qtdAproximada: '~16 passos',
  },
  {
    id: 'pre_viagem',
    titulo: 'Inspeção Pré-Viagem / Compra',
    subtitulo: 'Check de segurança e avaliação de moto usada: freios, folgas estruturais, vazamentos e carga.',
    tempoEstimado: '20 – 35 min',
    qtdAproximada: '~10 passos',
  },
];

export function getPerfisRevisao(modelo: Modelo, geracao: Geracao): PerfilRevisaoMeta[] {
  const arq = getArquiteturaMoto(modelo, geracao);
  const transmLabel = arq.isCvt ? 'CVT' : 'corrente';
  const filtroLabel =
    arq.tipoFiltroOleo === 'centrifugo_honda'
      ? 'filtro centrífugo e tela'
      : arq.tipoFiltroOleo === 'papel_externo'
        ? 'filtro de óleo em papel'
        : 'tela filtrante de óleo';

  return [
    {
      id: 'basica',
      titulo: 'Revisão Básica / Troca de Óleo',
      subtitulo: `Essencial do dia a dia: óleo, freios, pneus, ${transmLabel}, comandos e elétrica.`,
      tempoEstimado: '25 – 40 min',
      qtdAproximada: '~8 passos',
    },
    {
      id: 'completa',
      titulo: 'Revisão Completa de Bancada',
      subtitulo: `Inspeção total ponta a ponta: válvulas, ${filtroLabel}, alimentação, bengala, direção e chassi.`,
      tempoEstimado: '90 – 150 min',
      qtdAproximada: '~16 passos',
    },
    {
      id: 'pre_viagem',
      titulo: 'Inspeção Pré-Viagem / Compra',
      subtitulo: 'Check de segurança e avaliação de moto usada: freios, folgas estruturais, vazamentos e carga.',
      tempoEstimado: '20 – 35 min',
      qtdAproximada: '~10 passos',
    },
  ];
}

export const ZONA_VISUAL_INFO: Record<
  ZonaVisualMoto,
  { tituloCurto: string; callout: string }
> = {
  frente_roda: {
    tituloCurto: 'Roda & Freio Dianteiro',
    callout: 'Frente — Roda, Pneu e Freio Dianteiro',
  },
  bengala: {
    tituloCurto: 'Suspensão / Bengala',
    callout: 'Suspensão Dianteira — Tubos, Retentores e Fluido',
  },
  direcao_guidao: {
    tituloCurto: 'Direção, Guidão & Comandos',
    callout: 'Coluna de Direção — Caixa, Guidão e Comandos',
  },
  motor_topo: {
    tituloCurto: 'Cabeçote, Vela & Válvulas',
    callout: 'Topo do Motor — Vela e Válvulas',
  },
  motor_oleo: {
    tituloCurto: 'Cárter, Óleo & Filtragem',
    callout: 'Base do Motor — Óleo, Bujão e Filtragem',
  },
  alimentacao: {
    tituloCurto: 'Admissão & Alimentação',
    callout: 'Alimentação — Filtro de Ar e Combustível',
  },
  eletrica_bateria: {
    tituloCurto: 'Elétrica, Bateria & Carga',
    callout: 'Sistema Elétrico — Bateria, Fusíveis e Luzes',
  },
  transmissao_balanca: {
    tituloCurto: 'Transmissão & Balança',
    callout: 'Transmissão & Balança — Relação e Buchas',
  },
  traseira_freio: {
    tituloCurto: 'Roda & Freio Traseiro',
    callout: 'Traseira — Roda, Pneu e Freio Traseiro',
  },
  geral: {
    tituloCurto: 'Inspeção Geral & Rodagem',
    callout: 'Moto Completa — Aperto Geral e Teste Final',
  },
};

export function getZonaVisualInfo(
  zona: ZonaVisualMoto,
  arq?: ArquiteturaMoto,
): { tituloCurto: string; callout: string } {
  if (!arq) return ZONA_VISUAL_INFO[zona];

  if (zona === 'alimentacao') {
    if (arq.tipoAlimentacao === 'injetada') {
      return {
        tituloCurto: 'Admissão, Filtro & TBI',
        callout: `Alimentação — Filtro de Ar e Injeção (${arq.siglaInjecao})`,
      };
    }
    if (arq.tipoAlimentacao === 'mista') {
      return {
        tituloCurto: 'Admissão & Alimentação',
        callout: 'Alimentação — Filtro de Ar, Carburador / Injeção (conforme ano)',
      };
    }
    return {
      tituloCurto: 'Admissão, Filtro & Carburador',
      callout: 'Alimentação — Filtro de Ar e Carburador',
    };
  }

  if (zona === 'motor_oleo') {
    if (arq.tipoFiltroOleo === 'centrifugo_honda') {
      return {
        tituloCurto: 'Cárter, Óleo & Centrífugo',
        callout: 'Base do Motor — Óleo, Bujão e Filtro Centrífugo',
      };
    }
    if (arq.tipoFiltroOleo === 'papel_externo') {
      return {
        tituloCurto: 'Cárter, Óleo & Filtro de Papel',
        callout: 'Base do Motor — Óleo, Bujão e Filtro de Papel',
      };
    }
    return {
      tituloCurto: 'Cárter, Óleo & Tela Filtrante',
      callout: 'Base do Motor — Óleo, Bujão e Tela Metálica',
    };
  }

  if (zona === 'motor_topo' && arq.isArrefecimentoLiquido) {
    return {
      tituloCurto: 'Cabeçote, Vela, Válvulas & Radiador',
      callout: 'Topo do Motor — Vela, Válvulas e Arrefecimento Líquido',
    };
  }

  if (zona === 'transmissao_balanca') {
    return arq.isCvt
      ? {
          tituloCurto: 'Transmissão CVT & Balança',
          callout: 'Transmissão CVT — Correia, Roletes e Óleo Final',
        }
      : {
          tituloCurto: 'Kit Relação & Balança',
          callout: 'Transmissão & Balança — Corrente, Coroa, Pinhão e Buchas',
        };
  }

  return ZONA_VISUAL_INFO[zona];
}

export const ACAO_SUGERIDA_LABEL: Record<AcaoSugeridaPasso, { label: string; badgeClass: string }> = {
  checar: {
    label: 'Inspecionar / Checar',
    badgeClass: 'border-sky-500/40 bg-sky-500/15 text-sky-300',
  },
  lubrificar_limpar: {
    label: 'Limpar / Lubrificar',
    badgeClass: 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300',
  },
  regular: {
    label: 'Regular / Calibrar',
    badgeClass: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
  },
  substituir: {
    label: 'Substituir / Trocar',
    badgeClass: 'border-purple-500/40 bg-purple-500/15 text-purple-300',
  },
};

export const FEEDBACK_STATUS_META: Record<
  StatusFeedbackPasso,
  { label: string; shortLabel: string; emoji: string; activeClass: string; pillClass: string }
> = {
  checado_ok: {
    label: 'Checado / OK',
    shortLabel: 'OK',
    emoji: '✅',
    activeClass: 'border-emerald-500 bg-emerald-600 text-white shadow-md',
    pillClass: 'bg-emerald-500 text-white border-emerald-400',
  },
  limpo_lubrificado: {
    label: 'Limpo / Lubrificado',
    shortLabel: 'Limpo',
    emoji: '🧽',
    activeClass: 'border-cyan-500 bg-cyan-600 text-white shadow-md',
    pillClass: 'bg-cyan-500 text-white border-cyan-400',
  },
  regulado: {
    label: 'Regulado',
    shortLabel: 'Regulado',
    emoji: '🔧',
    activeClass: 'border-amber-500 bg-amber-500 text-zinc-950 shadow-md',
    pillClass: 'bg-amber-500 text-zinc-950 border-amber-400',
  },
  substituido: {
    label: 'Substituído',
    shortLabel: 'Trocado',
    emoji: '🔄',
    activeClass: 'border-purple-500 bg-purple-600 text-white shadow-md',
    pillClass: 'bg-purple-500 text-white border-purple-400',
  },
  trocar_em_breve: {
    label: 'Trocar em Breve',
    shortLabel: 'Atenção',
    emoji: '⚠️',
    activeClass: 'border-rose-500 bg-rose-600 text-white shadow-md',
    pillClass: 'bg-rose-500 text-white border-rose-400',
  },
  nao_aplica: {
    label: 'Não se aplica / Pular',
    shortLabel: 'Pular',
    emoji: '⏭️',
    activeClass: 'border-zinc-500 bg-zinc-700 text-zinc-100',
    pillClass: 'bg-zinc-600 text-zinc-200 border-zinc-500',
  },
};

export function gerarRoteiroRevisao(
  modelo: Modelo,
  geracao: Geracao,
  tipoRevisao: TipoRevisaoGuiada,
): PassoRevisao[] {
  const f = geracao.fichaTecnica;
  const arq = getArquiteturaMoto(modelo, geracao);
  const isScooter = arq.isCvt;
  const isDiscoDiant = arq.temFreioDiscoDianteiro;
  const isDiscoTras = arq.temFreioDiscoTraseiro;
  const isLiquido = arq.isArrefecimentoLiquido;
  const isHondaCentrifugo = arq.tipoFiltroOleo === 'centrifugo_honda';
  const isFiltroPapel = arq.tipoFiltroOleo === 'papel_externo';

  const torques = f.torques ?? [];
  const acharTorque = (termo: string) =>
    torques.find((t) => t.item.toLowerCase().includes(termo.toLowerCase()));

  const tBujao = acharTorque('drenagem') ?? acharTorque('óleo') ?? acharTorque('tela');
  const tEixoT = acharTorque('eixo traseiro') ?? acharTorque('roda traseira');

  const oleo = f.fluidos?.oleoMotor;
  const bengala = f.fluidos?.fluidoBengala;
  const pDiant = f.pneus?.dianteiro;
  const pTras = f.pneus?.traseiro;
  const rel = f.transmissaoFinal;

  // Bloco de Alimentação 100% coerente com a arquitetura (injetada vs carburada vs mista)
  const passoAlimentacao: Omit<PassoRevisao, 'ordem'> =
    arq.tipoAlimentacao === 'injetada'
      ? {
          id: 'alimentacao_tbi_carb',
          titulo: `Injeção Eletrônica (${arq.siglaInjecao}) — Corpo de Borboleta (TBI), Bico & Marcha Lenta`,
          zonaVisual: 'alimentacao',
          acaoSugerida: 'lubrificar_limpar',
          valorFicha: `Lenta: ${formatFaixa(f.motorDetalhes?.marchaLentaRpm)} · ${f.motorDetalhes?.alimentacaoDetalhe ?? `Injeção eletrônica ${arq.siglaInjecao}`}`,
          comoInspecionar:
            'Verifique se a luz MIL/FI acende e apaga após 3s ao ligar a chave, escute a bomba pressurizar, observe a estabilidade da marcha lenta quente e inspecione se há borra preta na borboleta do TBI.',
          criterioVisual: {
            ok: 'Luz da injeção apaga, marcha lenta estável na faixa do manual e aceleração linear sem buracos.',
            atencao:
              'Lenta oscilando ou pós-troca de combustível: descarbonizar TBI/bico (protegendo sensores) e conferir reset do TPS/ECM.',
            substituir:
              'Filtro de combustível vencido, O-ring do bico ressecado ou bomba abaixo da pressão especificada.',
          },
          procedimentoIdRelacionado: 'limpeza-bico-injetor-tbi',
        }
      : arq.tipoAlimentacao === 'mista'
        ? {
            id: 'alimentacao_tbi_carb',
            titulo: `Alimentação — ${arq.descricaoAlimentacao}`,
            zonaVisual: 'alimentacao',
            acaoSugerida: 'lubrificar_limpar',
            valorFicha: `Lenta: ${formatFaixa(f.motorDetalhes?.marchaLentaRpm)} · ${arq.descricaoAlimentacao}`,
            comoInspecionar:
              'Nos anos carburados, drene a cuba para checar água/impurezas, verifique entrada falsa de ar no coletor e ajuste a marcha lenta. Nos anos injetados desta geração, verifique a luz MIL/FI ao ligar a chave, pressão da bomba e limpeza do TBI/bico.',
            criterioVisual: {
              ok: 'Marcha lenta estável na faixa do manual e aceleração progressiva sem falhas.',
              atencao:
                'Lenta irregular ou engasgos: limpar cuba/giclês (anos carburados) ou descarbonizar TBI/bico (anos injetados).',
              substituir:
                'Agulha da boia/vedações gastas (carburados) ou filtro de combustível/O-ring do bico vencidos (injetados).',
            },
            procedimentoIdRelacionado: 'limpeza-bico-injetor-tbi',
          }
        : {
            id: 'alimentacao_tbi_carb',
            titulo: 'Carburador — Cuba, Giclagem, Afogador & Marcha Lenta',
            zonaVisual: 'alimentacao',
            acaoSugerida: 'lubrificar_limpar',
            valorFicha: `Lenta: ${formatFaixa(f.motorDetalhes?.marchaLentaRpm)} · ${f.motorDetalhes?.alimentacaoDetalhe ?? 'Carburador'}`,
            comoInspecionar:
              'Esgote um pouco da cuba pelo parafuso inferior para checar presença de água/sujeira, verifique o coletor contra entrada falsa de ar, teste o acionamento do afogador e avalie a resposta limpa ao acelerar.',
            criterioVisual: {
              ok: 'Marcha lenta estável, sem vazamento pelo ladrão da cuba e retomada limpa.',
              atencao:
                'Pipoco na desaceleração ou lenta irregular: limpar giclês de baixa/alta e regular parafuso de mistura.',
              substituir:
                'Agulha da boia vazando gasolina pelo ladrão, guarnição da cuba ressecada ou diafragma furado (quando aplicável).',
            },
            procedimentoIdRelacionado: undefined,
          };

  // Bloco de Direção / Guidão / Cabos adaptado a Semiautomáticas vs CVT vs Embreagem Manual
  const passoDirecaoCabos: Omit<PassoRevisao, 'ordem'> = arq.isSemiautomatica
    ? {
        id: 'direcao_guidao_cabos',
        titulo: 'Caixa de Direção, Guidão, Cabo do Acelerador & Engate Semiautomático',
        zonaVisual: 'direcao_guidao',
        acaoSugerida: 'regular',
        valorFicha: `Acelerador: ${formatFaixa(f.folgas?.folgaAceleradorMm)} | Câmbio semiautomático 4 marchas (embreagem centrífuga)`,
        comoInspecionar:
          'Com a roda dianteira suspensa, gire o guidão suavemente de batente a batente sentindo se há "calo" no centro; puxe as bengalas para frente e trás verificando folga na coluna. Confira o retorno rápido do acelerador e a suavidade nos engates da embreagem centrífuga.',
        criterioVisual: {
          ok: 'Guidão gira leve sem travar no centro, zero folga na coluna, acelerador macio e engates limpos no pedal.',
          atencao:
            'Cabo do acelerador preso, leve folga na direção ou engate duro: lubrificar cabo, reajustar direção e regular parafuso da embreagem centrífuga.',
          substituir:
            'Calo nítido no centro da direção, estalo seco ao frear ou cabo do acelerador desfiando.',
        },
        procedimentoIdRelacionado: 'troca-caixa-direcao',
      }
    : arq.isCvt
      ? {
          id: 'direcao_guidao_cabos',
          titulo: 'Caixa de Direção, Guidão & Cabo do Acelerador',
          zonaVisual: 'direcao_guidao',
          acaoSugerida: 'regular',
          valorFicha: `Acelerador: ${formatFaixa(f.folgas?.folgaAceleradorMm)} | Transmissão automática CVT`,
          comoInspecionar:
            'Com a roda dianteira suspensa, gire o guidão suavemente de batente a batente sentindo se há "calo" no centro; puxe as bengalas para frente e trás verificando folga na coluna e teste o retorno livre do acelerador.',
          criterioVisual: {
            ok: 'Guidão gira leve sem travar no centro, zero folga na coluna e cabo do acelerador retornando livre.',
            atencao:
              'Cabo duro ou pequena folga na porca castelo da direção: lubrificar cabo e reajustar pré-carga.',
            substituir:
              'Calo nítido no centro da direção, estalo seco ao frear ou cabo de aço desfiando.',
          },
          procedimentoIdRelacionado: 'troca-caixa-direcao',
        }
      : {
          id: 'direcao_guidao_cabos',
          titulo: 'Caixa de Direção, Guidão & Folga dos Cabos (Acelerador / Embreagem)',
          zonaVisual: 'direcao_guidao',
          acaoSugerida: 'regular',
          valorFicha: `Acelerador: ${formatFaixa(f.folgas?.folgaAceleradorMm)} | Embreagem: ${formatFaixa(f.folgas?.folgaManeteEmbreagemMm)}`,
          comoInspecionar:
            'Com a roda dianteira suspensa, gire o guidão suavemente de batente a batente sentindo se há "calo" no centro; puxe as bengalas para frente e trás verificando folga na coluna. Confira o retorno rápido do acelerador e a folga livre no manete de embreagem.',
          criterioVisual: {
            ok: 'Guidão gira leve sem travar no centro, zero folga na coluna e cabos deslizando macios na folga certa.',
            atencao:
              'Cabo duro/enforcado ou pequena folga na porca castelo da direção: lubrificar cabos e reajustar pré-carga.',
            substituir:
              'Calo nítido no centro da direção, estalo seco ao frear ou cabo de aço desfiando.',
          },
          procedimentoIdRelacionado: 'troca-caixa-direcao',
        };

  // Bloco de Filtro de Óleo adaptado rigorosamente ao tipoFiltroOleo
  const passoFiltroOleo: Omit<PassoRevisao, 'ordem'> = isHondaCentrifugo
    ? {
        id: 'filtro_oleo_sistema',
        titulo: 'Filtro Centrífugo & Peneira Metálica de Óleo (A cada 12.000 km)',
        zonaVisual: 'motor_oleo',
        acaoSugerida: 'lubrificar_limpar',
        valorFicha: f.motorDetalhes?.filtroOleo ?? 'Filtro centrífugo + tela metálica interna',
        comoInspecionar:
          'A cada 12.000 km, abra a tampa direita da embreagem, retire a tela metálica inferior com alicate de bico e limpe a borra prensada dentro do copo do filtro centrífugo.',
        criterioVisual: {
          ok: 'Tela limpa sem fiapos/limalhas, junta íntegra e filtragem em dia pela quilometragem.',
          atencao:
            'Próximo do marco de 12.000 km: programar limpeza do rotor centrífugo e da tela na próxima troca.',
          substituir: 'Junta da tampa direita ou tampa do centrífugo rasgada/ressecada vazando óleo.',
        },
        procedimentoIdRelacionado: 'limpeza-filtro-centrifugo-honda',
      }
    : isFiltroPapel
      ? {
          id: 'filtro_oleo_sistema',
          titulo: 'Filtro de Óleo em Elemento de Papel & Anéis O-ring',
          zonaVisual: 'motor_oleo',
          acaoSugerida: 'substituir',
          valorFicha: f.motorDetalhes?.filtroOleo ?? 'Elemento de papel descartável',
          comoInspecionar:
            'Ao trocar o elemento de papel na tampa lateral direita, confira o sentido de montagem, a posição da mola de pressão na tampa e o anel O-ring de vedação.',
          criterioVisual: {
            ok: 'Elemento de papel novo lubrificado com óleo limpo, O-rings íntegros e tampa seca.',
            atencao: 'Anel O-ring levemente achatado ou tampa suada: substituir vedação na próxima troca.',
            substituir: 'Elemento de papel saturado/vencido ou O-ring ressecado vazando óleo.',
          },
          procedimentoIdRelacionado: 'troca-oleo-filtro-papel',
        }
      : {
          id: 'filtro_oleo_sistema',
          titulo: 'Tela Filtrante Interna de Óleo',
          zonaVisual: 'motor_oleo',
          acaoSugerida: 'lubrificar_limpar',
          valorFicha: f.motorDetalhes?.filtroOleo ?? 'Tela metálica interna',
          comoInspecionar:
            'Remova o acesso da tela metálica filtrante de óleo, lave a peneira com solvente limpo, sopre com ar e verifique a integridade da malha e do anel de vedação.',
          criterioVisual: {
            ok: 'Tela metálica desobstruída sem limalhas e vedação íntegra sem gotejamento.',
            atencao: 'Pequenos resíduos retidos na peneira: lavar bem e inspecionar na próxima troca.',
            substituir: 'Malha da tela rasgada ou anel de vedação achatado/ressecado.',
          },
          procedimentoIdRelacionado: undefined,
        };

  // Catálogo mestre de blocos adaptados à geração selecionada
  const passosMestre: Record<string, Omit<PassoRevisao, 'ordem'>> = {
    pneus_calibragem: {
      id: 'pneus_calibragem',
      titulo: 'Pneus, Banda de Rodagem, Válvulas & Calibragem (PSI)',
      zonaVisual: 'frente_roda',
      acaoSugerida: 'regular',
      valorFicha: `Diant: ${pDiant?.medida ?? '—'} (${pDiant?.pressaoPsi ?? '—'} PSI) | Tras: ${pTras?.medida ?? '—'} (${pTras?.pressaoPsi ?? '—'} PSI solo / ${pTras?.pressaoComGarupaPsi ?? '—'} PSI garupa)`,
      comoInspecionar:
        'Com os pneus frios, confira a calibragem no manômetro, verifique se há pregos/cortes na banda de rodagem, ressecamento lateral e gire as rodas procurando jogo nos rolamentos do cubo.',
      criterioVisual: {
        ok: 'Sulcos acima do indicador TWI (> 1,6 mm), pressão exata e rodas girando silenciosas sem folga lateral.',
        atencao:
          'Pneu abaixo da pressão especificada ou pequeno desgaste irregular: calibrar frio e conferir alinhamento.',
        substituir:
          'Banda atingindo o TWI ("careca"), bolhas/cortes profundos ou rolamento de roda roncando/com folga.',
      },
      procedimentoIdRelacionado: undefined,
    },

    freio_dianteiro: {
      id: 'freio_dianteiro',
      titulo: isDiscoDiant
        ? `Freio Dianteiro a Disco (${f.freios.sistema}) — Pastilhas, Disco e Fluido`
        : 'Freio Dianteiro a Tambor — Lona, Cabo e Alavanca',
      zonaVisual: 'frente_roda',
      acaoSugerida: 'checar',
      valorFicha: isDiscoDiant
        ? `Sistema: ${f.freios.sistema} · Fluido: ${f.fluidos?.fluidoFreio ?? 'DOT 4'} · Manete firme sem curso esponjoso`
        : `Tambor mecânico (${f.freios.sistema}) · Folga livre do manete: 10 – 20 mm`,
      comoInspecionar: isDiscoDiant
        ? 'Olhe pelos rasgos da pinça a espessura do material de atrito das duas pastilhas, passe o dedo no disco procurando degrau acentuado, verifique o nível/cor do fluido DOT 4 no visor do burrinho e confira se a roda gira livre após soltar o manete.'
        : 'Verifique a seta indicadora de desgaste no espelho dianteiro com o manete acionado, teste a maciez do cabo e a folga livre no manete.',
      criterioVisual: isDiscoDiant
        ? {
            ok: 'Pastilhas com mais de 2 mm de material, disco liso sem sulcos fundos e fluido DOT 4 claro no nível.',
            atencao:
              'Pinça suja/presa ou manete borrachudo: lavar pistões, lubrificar pinos com graxa de silicone e fazer sangria.',
            substituir:
              'Pastilhas abaixo de 2 mm, contaminadas com óleo de bengala, disco abaixo da espessura mínima ou fluido escuro (> 2 anos).',
          }
        : {
            ok: 'Seta dentro da faixa de uso, cabo macio e frenagem progressiva sem chiado.',
            atencao:
              'Curso longo no manete ou chiado: desmontar, lixar cubo/lona com lixa 160/180, soprar pó e regular cabo.',
            substituir: 'Seta atingiu o limite de desgaste ou cabo desfiando perto do manete.',
          },
      procedimentoIdRelacionado: isDiscoDiant ? 'troca-pastilhas-freio-disco' : undefined,
    },

    bengala_suspensao: {
      id: 'bengala_suspensao',
      titulo: 'Suspensão Dianteira (Bengalas, Retentores e Guarda-Pós)',
      zonaVisual: 'bengala',
      acaoSugerida: 'checar',
      valorFicha: bengala
        ? `${formatNumero(bengala.volumePorCanelaMl)} ml por canela · ${bengala.especificacao}${bengala.nivelMm ? ` (nível ${bengala.nivelMm} mm)` : ''}`
        : 'Fluido ATF / Fork Oil 10W',
      comoInspecionar:
        'Comprima a frente da moto algumas vezes segurando o freio dianteiro e passe o dedo limpo no tubo cromado logo acima do guarda-pó procurando anéis de óleo, riscos ou pontos de ferrugem.',
      criterioVisual: {
        ok: 'Tubos cromados 100% secos, lisos e suspensão com retorno firme sem bater seco.',
        atencao:
          'Guarda-pó ressecado com poeira acumulada, mas ainda sem vazamento de óleo: limpar e monitorar.',
        substituir:
          'Canela melada de óleo escorrendo (risco de contaminar o freio!) ou suspensão mole batendo fim de curso.',
      },
      procedimentoIdRelacionado: 'troca-retentor-fluido-bengala',
    },

    direcao_guidao_cabos: passoDirecaoCabos,

    eletrica_bateria_luzes: {
      id: 'eletrica_bateria_luzes',
      titulo: 'Bateria, Sistema de Carga (Multímetro), Fusíveis & Iluminação',
      zonaVisual: 'eletrica_bateria',
      acaoSugerida: 'checar',
      valorFicha: `Bateria: ${f.eletrica?.bateria?.modelo ?? '12V'} · Carga: ${f.eletrica?.bateria?.tensaoCargaV ?? '13,5–14,8V @ 5.000 rpm'} · Fusível: ${f.eletrica?.fusivelPrincipalA ?? 15}A`,
      comoInspecionar:
        'Teste farol alto/baixo, lanterna, luz de freio (manete e pedal), setas e buzina. Com o multímetro em DCV 20V, confira repouso (12,5–12,8V) e carga a 5.000 rpm (13,5–14,8V). Verifique aperto e ausência de zinabre nos polos.',
      criterioVisual: {
        ok: 'Tensão de repouso >= 12,5V, carga entre 13,5V e 14,8V e todas as lâmpadas/sensores funcionando.',
        atencao:
          'Terminais oxidados ou bateria em 12,2V: limpar polos com limpa-contatos e aplicar carga lenta.',
        substituir:
          'Tensão cai abaixo de 9,5V na partida (bateria morta), carga > 15V (retificador) ou lâmpada queimada.',
      },
    },

    vela_ignicao: {
      id: 'vela_ignicao',
      titulo: 'Vela de Ignição (Cor da Queima, Eletrodo & Folga) + Cachimbo',
      zonaVisual: 'motor_topo',
      acaoSugerida: 'checar',
      valorFicha: `Vela: ${f.eletrica?.vela?.modelo ?? 'NGK'} · Folga: ${formatFaixa(f.eletrica?.vela?.folgaEletrodoMm)}${f.eletrica?.vela?.iridiumAlternativa ? ` (Iridium: ${f.eletrica.vela.iridiumAlternativa})` : ''}`,
      comoInspecionar:
        'Sopre a cavidade da vela antes de removê-la (evita cair areia no cilindro). Analise a cor da ponta (marrom café = ideal; preta seca = excesso; oleosa = passagem de óleo) e meça a folga do eletrodo com o cálibre.',
      criterioVisual: {
        ok: 'Isolador marrom-claro/acinzentado seco, eletrodo central quadrado e folga dentro do manual.',
        atencao:
          'Eletrodo ainda bom, mas folga aberta acima de 1,0 mm ou leve fuligem: limpar e recalibrar o gap.',
        substituir:
          'Eletrodo arredondado/gasto, porcelana trincada, vencida pela quilometragem ou cachimbo medindo OL.',
      },
    },

    folga_valvulas: {
      id: 'folga_valvulas',
      titulo: 'Regulagem de Folga de Válvulas (Motor Totalmente Frio < 35 °C)',
      zonaVisual: 'motor_topo',
      acaoSugerida: 'regular',
      valorFicha: `Admissão: ${formatFaixa(f.folgas?.valvulaAdmissaoMm)} | Escape: ${formatFaixa(f.folgas?.valvulaEscapeMm)} (${f.motorDetalhes?.comando ?? f.motor})`,
      comoInspecionar:
        'Com o motor frio, alinhe a marca "T" no volante (PMS de compressão com ambos balancins livres) e passe as lâminas exatas do cálibre na admissão e no escape.',
      criterioVisual: {
        ok: 'Lâminas exatas deslizam com leve arrasto ("efeito manteiga") na admissão e no escape.',
        atencao:
          'Folga fora do padrão (presa ou batendo "tec-tec"): soltar contraporca, calibrar com chavinha 3 mm e conferir novamente após aperto.',
        substituir:
          'Guarnição da tampa de válvulas ressecada vazando óleo ou parafuso regulador com ponta cavada.',
      },
      procedimentoIdRelacionado: 'regulagem-valvulas',
    },

    arrefecimento_liquido: {
      id: 'arrefecimento_liquido',
      titulo: 'Sistema de Arrefecimento Líquido (Nível, Radiador e Mangueiras)',
      zonaVisual: 'motor_topo',
      acaoSugerida: 'checar',
      valorFicha: f.fluidos?.liquidoArrefecimento
        ? `${f.fluidos.liquidoArrefecimento.especificacao} (${formatNumero(f.fluidos.liquidoArrefecimento.capacidadeL)} L)`
        : 'Fluido à base de etilenoglicol 50/50 pronto para uso',
      comoInspecionar:
        'Com o motor frio, confira o nível no reservatório de expansão (entre LOWER e UPPER), inspecione abraçadeiras procurando crostas esverdeadas/brancas de vazamento e verifique se as aletas do radiador não estão entupidas de barro.',
      criterioVisual: {
        ok: 'Fluido limpo na marca entre mínimo e máximo, sem vazamentos nas mangueiras ou bomba d’água.',
        atencao:
          'Nível levemente baixo no reservatório: completar somente com fluido pronto 50/50 (nunca água de torneira!).',
        substituir:
          'Fluido turvo/enferrujado ou com mais de 2 anos / 24.000 km: drenar e renovar todo o circuito.',
      },
    },

    filtro_ar: {
      id: 'filtro_ar',
      titulo: 'Filtro de Ar & Dreno da Caixa de Ar',
      zonaVisual: 'alimentacao',
      acaoSugerida: 'checar',
      valorFicha:
        'Verificar elemento filtrante + esgotar o tubinho transparente de dreno de óleo/água sob a caixa de ar',
      comoInspecionar:
        'Abra a tampa da caixa de ar, retire o elemento filtrante e examine contra a luz. Se a moto utilizar elemento de papel viscoso/úmido, NUNCA sopre ar comprimido — se estiver escurecido ou saturado, substitua.',
      criterioVisual: {
        ok: 'Elemento limpo sem poeira grossa, borracha de vedação intacta e caixa de ar seca.',
        atencao:
          'Elemento de espuma ou papel seco sujo: limpar conforme o manual (espuma lavada com sabão neutro e umedecida em óleo).',
        substituir:
          'Elemento de papel viscoso escurecido/saturado, rasgado ou encharcado de óleo do respiro.',
      },
    },

    alimentacao_tbi_carb: passoAlimentacao,

    oleo_motor: {
      id: 'oleo_motor',
      titulo: 'Óleo do Motor — Nível, Aspecto, Drenagem & Torque do Bujão',
      zonaVisual: 'motor_oleo',
      acaoSugerida: 'substituir',
      valorFicha: oleo
        ? `${formatNumero(oleo.capacidadeTrocaL)} L na troca${oleo.capacidadeTrocaComFiltroL ? ` (${formatNumero(oleo.capacidadeTrocaComFiltroL)} L c/ filtro)` : ''}${oleo.capacidadeTotalL ? ` · ${formatNumero(oleo.capacidadeTotalL)} L total` : ''} — ${oleo.especificacao}${tBujao ? ` · Bujão: ${tBujao.torque.valor} N·m (${nmParaKgfm(tBujao.torque.valor)})` : ''}`
        : 'Consulte a Ficha Técnica',
      comoInspecionar:
        'Com a moto nivelada na vertical, confira o nível na vareta (sem rosquear) ou visor. Avalie cor/cheiro (aspecto "café com leite" indica água; brilho metálico indica desgaste interno). Na troca, substitua a arruela de vedação do bujão.',
      criterioVisual: {
        ok: 'Óleo no nível entre mínimo e máximo, viscosidade íntegra e cárter seco sem gotejamento no bujão.',
        atencao:
          'Nível levemente baixo dentro do prazo de troca: completar com a mesma especificação e monitorar consumo.',
        substituir:
          'Vencido por km/tempo, óleo muito escuro/queimado ou nível abaixo do mínimo: drenar quente e abastecer volume exato.',
      },
      procedimentoIdRelacionado: isFiltroPapel ? 'troca-oleo-filtro-papel' : undefined,
    },

    filtro_oleo_sistema: passoFiltroOleo,

    transmissao_final: {
      id: 'transmissao_final',
      titulo: isScooter
        ? 'Transmissão CVT (Correia, Roletes, Campana & Óleo Final)'
        : 'Kit Relação (Pinhão, Coroa, Corrente & Ajuste de Folga)',
      zonaVisual: 'transmissao_balanca',
      acaoSugerida: isScooter ? 'checar' : 'regular',
      valorFicha: isScooter
        ? `${rel?.cvtDetalhe?.correiaCodigo ?? 'Correia V-Belt'} · Óleo Final: ${f.fluidos?.oleoTransmissaoCvt ? `${formatNumero(f.fluidos.oleoTransmissaoCvt.capacidadeL)} L (${f.fluidos.oleoTransmissaoCvt.especificacao})` : '100–120 ml'}`
        : `Relação ${rel?.pinhaoDentes ?? '—'}Z × ${rel?.coroaDentes ?? '—'}Z (${rel?.corrente ?? '428H'}) · Folga: ${formatFaixa(f.folgas?.folgaCorrenteMm)}`,
      comoInspecionar: isScooter
        ? 'Teste a arrancada procurando trepidação (pó na campana); na revisão completa, abra a tampa do CVT, sopre o pó, confira se os roletes estão cilíndricos (sem calo quadrado), meça a largura da correia e renove o óleo da transmissão final.'
        : 'Gire a roda procurando pontos apertados e pontos frouxos na corrente (sinal de ovalização), puxe a corrente para trás na traseira da coroa (não deve expor meio dente) e meça a folga livre no meio do vão inferior.',
      criterioVisual: isScooter
        ? {
            ok: 'Arrancada lisa sem trepidação, correia sem trincas dentro da largura limite e roletes redondos.',
            atencao:
              'Leve trepidação ao sair devagar: abrir CVT, soprar pó, lixar de leve sapatas/campana com lixa 180.',
            substituir:
              'Correia rachada/abaixo da largura limite, roletes quadrados ou óleo final vencido (12.000 km).',
          }
        : {
            ok: 'Dentes da coroa/pinhão simétricos, folga na faixa do manual e elos articulando livres e lubrificados.',
            atencao:
              'Corrente seca ou folga acima do limite: lavar, lubrificar, esticar alinhando as marcas da balança.',
            substituir:
              'Dentes afinados ("dente de tubarão"), corrente ovalizada ou esticador já no fim do curso.',
          },
      procedimentoIdRelacionado: isScooter ? undefined : 'troca-kit-relacao',
    },

    balanca_amortecedores: {
      id: 'balanca_amortecedores',
      titulo: 'Bucha da Balança (Quadro Elástico) & Amortecedores Traseiros',
      zonaVisual: 'transmissao_balanca',
      acaoSugerida: 'checar',
      valorFicha:
        'Folga lateral zero no pivô da balança · Hastes dos amortecedores secas sem vazamento',
      comoInspecionar:
        'Com a roda traseira fora do chão, segure o pneu às 9h e 3h e force lateralmente observando o encontro da balança com o chassi. Inspecione as hastes dos amortecedores traseiros procurando óleo vazando.',
      criterioVisual: {
        ok: 'Balança firme sem jogo lateral, guia de corrente inteiro e amortecedores secos.',
        atencao: 'Rangido seco ao balançar a suspensão: desmontar eixo da balança e aplicar graxa azul.',
        substituir:
          'Jogo lateral visível na bucha da balança (moto "sambando" em curva) ou amortecedor estourado vazando óleo.',
      },
      procedimentoIdRelacionado: isScooter ? undefined : 'troca-bucha-balanca',
    },

    freio_traseiro: {
      id: 'freio_traseiro',
      titulo: isDiscoTras
        ? 'Freio Traseiro a Disco — Pastilhas, Disco e Fluido DOT 4'
        : 'Freio Traseiro a Tambor — Patins (Lona), Cubo, Came & Vareta',
      zonaVisual: 'traseira_freio',
      acaoSugerida: isDiscoTras ? 'checar' : 'regular',
      valorFicha: isDiscoTras
        ? `Disco traseiro · Fluido ${f.fluidos?.fluidoFreio ?? 'DOT 4'}${tEixoT ? ` · Eixo Tras.: ${tEixoT.torque.valor} N·m` : ''}`
        : `Tambor mecânico · Folga do pedal: ${formatFaixa(f.folgas?.folgaPedalFreioMm)}${tEixoT ? ` · Eixo Tras.: ${tEixoT.torque.valor} N·m (${nmParaKgfm(tEixoT.torque.valor)})` : ''}`,
      comoInspecionar: isDiscoTras
        ? 'Verifique a espessura das pastilhas traseiras, nível do reservatório traseiro DOT 4 e se o disco não está azulado/empenado.'
        : 'Acione o freio traseiro e olhe a seta indicadora de desgaste no braço do espelho; teste se o pedal volta macio sem enroscar e ouça se o freio está apitando.',
      criterioVisual: isDiscoTras
        ? {
            ok: 'Pastilhas > 2 mm, disco sem sulcos profundos e pedal firme.',
            atencao: 'Pedal baixo/borrachudo ou pinça suja: limpar pistão e fazer sangria com DOT 4.',
            substituir: 'Pastilhas abaixo de 2 mm ou fluido contaminado.',
          }
        : {
            ok: 'Seta longe do limite, pedal com 20–30 mm de folga livre e retorno imediato sem chiado.',
            atencao:
              'Cubo empoeirado, freio chiando ou curso longo: lixar cubo/lona com lixa 160/180, soprar o pó, graxa mínima no came e regular a porca da vareta.',
            substituir:
              'Seta indicadora atingiu o limite ou lona abaixo de 2 mm / vitrificada/contaminada com óleo.',
          },
      procedimentoIdRelacionado: isDiscoTras
        ? 'troca-pastilhas-freio-disco'
        : 'troca-lona-freio-traseiro',
    },

    aperto_teste_final: {
      id: 'aperto_teste_final',
      titulo: 'Conferência Final de Apertos, Vazamentos & Teste de Rodagem',
      zonaVisual: 'geral',
      acaoSugerida: 'checar',
      valorFicha: arq.temAlgumFreioDisco
        ? 'Conferir bujão de óleo, eixos de roda, pinça de freio, cavalete e luz de freio antes de entregar a moto'
        : 'Conferir bujão de óleo, eixos de roda, braço/vareta de freio, cavalete e luz de freio antes de entregar a moto',
      comoInspecionar:
        'Funcione a moto por 3 minutos em marcha lenta verificando ausência de vazamentos no bujão/tampas, acione os freios dianteiro e traseiro antes de mover a moto e dê uma volta curta testando engates, frenagem e direção.',
      criterioVisual: {
        ok: 'Motor silencioso, marcha lenta estável, zero vazamentos, freios responsivos e ciclística alinhada.',
        atencao: 'Pequeno ajuste fino necessário em marcha lenta, espelho ou altura do pedal de freio.',
        substituir:
          'Identificado ruído anormal ou falha de segurança no teste de rodagem — retornar à bancada.',
      },
    },
  };

  // Monta a lista ordenada conforme o perfil escolhido
  let idsSelecionados: string[];

  if (tipoRevisao === 'basica') {
    idsSelecionados = [
      'pneus_calibragem',
      'freio_dianteiro',
      'direcao_guidao_cabos',
      'oleo_motor',
      ...(isFiltroPapel ? ['filtro_oleo_sistema'] : []),
      'transmissao_final',
      'freio_traseiro',
      'eletrica_bateria_luzes',
      'aperto_teste_final',
    ];
  } else if (tipoRevisao === 'pre_viagem') {
    idsSelecionados = [
      'pneus_calibragem',
      'freio_dianteiro',
      'bengala_suspensao',
      'direcao_guidao_cabos',
      'eletrica_bateria_luzes',
      'oleo_motor',
      ...(isLiquido ? ['arrefecimento_liquido'] : []),
      'transmissao_final',
      'balanca_amortecedores',
      'freio_traseiro',
      'aperto_teste_final',
    ];
  } else {
    // Completa de Bancada (15 a 16 passos cobrindo a moto inteira)
    idsSelecionados = [
      'pneus_calibragem',
      'freio_dianteiro',
      'bengala_suspensao',
      'direcao_guidao_cabos',
      'eletrica_bateria_luzes',
      'vela_ignicao',
      'folga_valvulas',
      ...(isLiquido ? ['arrefecimento_liquido'] : []),
      'filtro_ar',
      'alimentacao_tbi_carb',
      'oleo_motor',
      'filtro_oleo_sistema',
      'transmissao_final',
      'balanca_amortecedores',
      'freio_traseiro',
      'aperto_teste_final',
    ];
  }

  return idsSelecionados
    .map((id) => passosMestre[id])
    .filter((p): p is Omit<PassoRevisao, 'ordem'> => Boolean(p))
    .map((p, index) => ({
      ...p,
      ordem: index + 1,
    }));
}
