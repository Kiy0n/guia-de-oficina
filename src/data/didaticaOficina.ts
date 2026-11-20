import type { ArquiteturaMoto } from '@/utils/arquiteturaMoto';

/**
 * Classificação didática de dificuldade por procedimento (FVM vs. Oficina).
 */
export type NivelDificuldade = 'basico' | 'intermediario' | 'profissional';

export const NIVEIS_DIFICULDADE: readonly NivelDificuldade[] = [
  'basico',
  'intermediario',
  'profissional',
] as const;

export interface MetaDificuldade {
  nivel: NivelDificuldade;
  label: string;
  labelCurto: string;
  tooltip: string;
  badgeClass: string;
  dotClass: string;
}

export const DIFICULDADE_META: Record<NivelDificuldade, MetaDificuldade> = {
  basico: {
    nivel: 'basico',
    label: 'Básico (FVM)',
    labelCurto: 'Básico · FVM',
    tooltip: 'Ideal para iniciantes com ferramentas comuns',
    badgeClass:
      'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    dotClass: 'bg-emerald-500 dark:bg-emerald-400',
  },
  intermediario: {
    nivel: 'intermediario',
    label: 'Intermediário',
    labelCurto: 'Intermediário',
    tooltip: 'Requer atenção técnica e instrumentos de medição',
    badgeClass:
      'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300',
    dotClass: 'bg-amber-500 dark:bg-amber-400',
  },
  profissional: {
    nivel: 'profissional',
    label: 'Profissional (Oficina)',
    labelCurto: 'Profissional',
    tooltip: 'Recomendado executar em oficina equipada',
    badgeClass:
      'border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300',
    dotClass: 'bg-rose-500 dark:bg-rose-400',
  },
};

// ---------------------------------------------------------------------------
// Base estruturada de Alertas de "Erros Clássicos" (Armadilhas de Oficina)
// ---------------------------------------------------------------------------

export type ArmadilhaOficinaId =
  | 'troca_oleo_bujao'
  | 'regulagem_valvulas'
  | 'vela_ignicao'
  | 'freio_disco_dot4'
  | 'corrente_transmissao'
  | 'bateria_eletrica'
  | 'filtro_ar_viscoso'
  | 'suspensao_bengalas';

export interface ArmadilhaOficina {
  id: ArmadilhaOficinaId;
  titulo: string;
  mensagem: string;
  severidade: 'alerta' | 'critico';
}

export const ARMADILHAS_OFICINA: Record<ArmadilhaOficinaId, ArmadilhaOficina> = {
  troca_oleo_bujao: {
    id: 'troca_oleo_bujao',
    titulo: 'Armadilha Comum — Bujão de Óleo',
    mensagem:
      'Aperto excessivo espana fácil a rosca de alumínio do cárter: rosqueie sempre com a mão primeiro e respeite o torque do manual. Nunca reutilize arruela de vedação amassada.',
    severidade: 'critico',
  },
  regulagem_valvulas: {
    id: 'regulagem_valvulas',
    titulo: 'Armadilha Comum — Motor Quente ou Cruzamento',
    mensagem:
      'SEMPRE meça com o motor 100% frio (abaixo de 35 °C) e confirme o PMS na fase de compressão (balancins livres), nunca no cruzamento de válvulas.',
    severidade: 'critico',
  },
  vela_ignicao: {
    id: 'vela_ignicao',
    titulo: 'Armadilha Comum — Rosca do Cabeçote',
    mensagem:
      'Risco de espanar a rosca de alumínio do cabeçote: comece o rosqueamento da vela sempre com a mão (nunca direto na chave) e confira a folga dos eletrodos antes de instalar.',
    severidade: 'alerta',
  },
  freio_disco_dot4: {
    id: 'freio_disco_dot4',
    titulo: 'Armadilha Comum — Fluido DOT 4 Corrosivo',
    mensagem:
      'O fluido de freio corrói pintura e plásticos em segundos (proteja tanque e carenagens com pano úmido). Nunca misture DOT 3 com DOT 4 nem use frasco aberto há muito tempo (absorve umidade).',
    severidade: 'critico',
  },
  corrente_transmissao: {
    id: 'corrente_transmissao',
    titulo: 'Armadilha Comum — Corrente Sem Folga',
    mensagem:
      'Nunca deixe a corrente esticada demais sem folga: ao comprimir a suspensão, ela sobrecarrega o rolamento do eixo secundário do câmbio e pode romper. Confira o alinhamento nos dois lados da balança.',
    severidade: 'alerta',
  },
  bateria_eletrica: {
    id: 'bateria_eletrica',
    titulo: 'Armadilha Comum — Curto e Polaridade',
    mensagem:
      'Desconecte sempre o polo negativo (-) primeiro e reconecte por último para evitar curto-circuito com a chave no chassi. Nunca inverta a polaridade (queima imediata de fusível principal, retificador ou ECU).',
    severidade: 'critico',
  },
  filtro_ar_viscoso: {
    id: 'filtro_ar_viscoso',
    titulo: 'Armadilha Comum — Filtro de Papel Viscoso',
    mensagem:
      'Em filtros de ar viscosos (papel oleado, ex.: Honda CG/Bros/Biz), NUNCA sopre com ar comprimido nem lave com gasolina ou água — isso rompe as fibras e deixa poeira entrar no cilindro.',
    severidade: 'alerta',
  },
  suspensao_bengalas: {
    id: 'suspensao_bengalas',
    titulo: 'Armadilha Comum — Volume de Fluido nas Bengalas',
    mensagem:
      'Respeite o volume exato em ml nos dois tubos da suspensão dianteira: diferença de nível entre as canelas compromete frenagem, estabilidade e pode estourar os retentores.',
    severidade: 'alerta',
  },
};

export const TOTAL_ARMADILHAS_MAPEADAS = Object.keys(ARMADILHAS_OFICINA).length;

/**
 * Resolve uma armadilha garantindo 100% de coerência com a arquitetura real da moto
 * (ex.: omite DOT 4 em motos somente tambor, omite corrente em CVT e remove menção à ECU em carburadas).
 */
export function resolverArmadilhaOficina(
  id: ArmadilhaOficinaId,
  arq: ArquiteturaMoto,
): ArmadilhaOficina | null {
  if (id === 'freio_disco_dot4' && arq.isSomenteTambor) {
    return null;
  }

  if (id === 'corrente_transmissao' && arq.isCvt) {
    return null;
  }

  const base = ARMADILHAS_OFICINA[id];

  if (id === 'bateria_eletrica' && !arq.isInjetada) {
    return {
      ...base,
      mensagem:
        'Desconecte sempre o polo negativo (-) primeiro e reconecte por último para evitar curto-circuito com a chave no chassi. Nunca inverta a polaridade (queima imediata de fusível principal, retificador ou módulo CDI).',
    };
  }

  return base;
}

// ---------------------------------------------------------------------------
// Classificadores consistentes para Procedimentos e Diagnóstico Corretivo
// ---------------------------------------------------------------------------

const DIFICULDADE_PROCEDIMENTOS_MAP: Readonly<Record<string, NivelDificuldade>> = {
  'troca-lona-freio-traseiro': 'intermediario',
  'troca-bucha-balanca': 'profissional',
  'troca-kit-relacao': 'intermediario',
  'regulagem-valvulas': 'intermediario',
  'limpeza-filtro-centrifugo-honda': 'intermediario',
  'troca-retentor-fluido-bengala': 'profissional',
  'troca-pastilhas-freio-disco': 'intermediario',
  'limpeza-bico-injetor-tbi': 'intermediario',
  'troca-caixa-direcao': 'profissional',
  'troca-oleo-filtro-papel': 'basico',
  'sangria-freio-hidraulico': 'intermediario',
};

export function getDificuldadeProcedimento(procedimentoId: string): NivelDificuldade {
  return DIFICULDADE_PROCEDIMENTOS_MAP[procedimentoId] ?? 'intermediario';
}

const DIFICULDADE_ETAPA_DIAGNOSTICO_MAP: Readonly<Record<string, NivelDificuldade>> = {
  // Cenário 1: Motor gira na partida, mas não pega
  '1-corta-corrente-combustivel': 'basico',
  '1-faisca-vela-cachimbo': 'basico',
  '1-bomba-bico-injecao': 'intermediario',
  '1-carburador-torneira': 'intermediario',
  '1-compressao-valvula-presa': 'intermediario',

  // Cenário 2: Partida elétrica não gira / estalo no relé
  '2-queda-tensao-bateria': 'intermediario',
  '2-teste-direto-rele-partida': 'intermediario',
  '2-escovas-motor-arranque': 'profissional',
  '2-interruptor-neutro-embreagem-freio': 'basico',

  // Cenário 3: Falha em alta / perde força
  '3-pressao-bomba-filtro-combustivel': 'intermediario',
  '3-gicle-alta-diafragma-carburador': 'intermediario',
  '3-fuga-corrente-vela-bobina': 'basico',
  '3-filtro-ar-afogador': 'basico',

  // Cenário 4: Marcha lenta instável / morre quente
  '4-valvula-escape-presa': 'intermediario',
  '4-tbi-iacv-reset-flex': 'intermediario',
  '4-parafuso-mistura-gicle-baixa': 'intermediario',
  '4-entrada-falsa-ar-coletor': 'basico',

  // Cenário 5: Bateria descarregando / farol queimando
  '5-tensao-carga-5000rpm': 'intermediario',
  '5-teste-estator-ac': 'intermediario',
  '5-fuga-corrente-rastreador': 'intermediario',

  // Cenário 6: Barulho metálico no motor
  '6-tec-tec-agudo-cabecote': 'intermediario',
  '6-chocalho-corrente-comando': 'profissional',
  '6-campana-embreagem': 'profissional',
  '6-batida-seca-biela-pistao': 'profissional',

  // Cenário 7: Consumo alto / fumaça / vela preta
  '7-cor-fumaca-aspecto-vela': 'basico',
  '7-bico-gotejando-sensor-eot-o2': 'intermediario',
  '7-freio-preso-relacao-calibragem': 'basico',

  // Cenário 8: Freio borrachudo / travando / chiando
  '8-manete-esponjoso-ar-sangria': 'intermediario',
  '8-freio-disco-prendendo-roda': 'intermediario',
  '8-tambor-chiando-pedal-duro': 'intermediario',

  // Cenário 9: Moto instável / direção / bengala
  '9-traseira-sambando-bucha-balanca': 'profissional',
  '9-calo-caixa-direcao': 'profissional',
  '9-bengala-vazando-oleo': 'profissional',

  // Cenário 10: Embreagem patinando / marchas duras
  '10-folga-manete-cabo-embreagem': 'basico',
  '10-regulagem-externa-cub': 'intermediario',
  '10-discos-molas-oleo-jaso': 'profissional',
};

export function getDificuldadeEtapaDiagnostico(etapaId: string): NivelDificuldade {
  return DIFICULDADE_ETAPA_DIAGNOSTICO_MAP[etapaId] ?? 'intermediario';
}

const ARMADILHA_ETAPA_DIAGNOSTICO_MAP: Readonly<Record<string, ArmadilhaOficinaId>> = {
  '1-faisca-vela-cachimbo': 'vela_ignicao',
  '1-compressao-valvula-presa': 'regulagem_valvulas',
  '2-queda-tensao-bateria': 'bateria_eletrica',
  '3-fuga-corrente-vela-bobina': 'vela_ignicao',
  '3-filtro-ar-afogador': 'filtro_ar_viscoso',
  '4-valvula-escape-presa': 'regulagem_valvulas',
  '5-tensao-carga-5000rpm': 'bateria_eletrica',
  '6-tec-tec-agudo-cabecote': 'regulagem_valvulas',
  '8-manete-esponjoso-ar-sangria': 'freio_disco_dot4',
  '9-bengala-vazando-oleo': 'suspensao_bengalas',
};

export function getArmadilhaEtapaDiagnostico(
  etapaId: string,
  arq: ArquiteturaMoto,
): ArmadilhaOficina | null {
  const armadilhaId = ARMADILHA_ETAPA_DIAGNOSTICO_MAP[etapaId];
  if (!armadilhaId) return null;
  return resolverArmadilhaOficina(armadilhaId, arq);
}
