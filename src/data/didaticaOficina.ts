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

// ---------------------------------------------------------------------------
// Catálogo Canônico de Ferramentas por Tarefa (Somente Leitura)
// ---------------------------------------------------------------------------

export type CategoriaFerramentaBancada = 'basica' | 'medicao' | 'especial' | 'apoio';

export type FerramentaBancadaId =
  | 'chave_bujao_oleo'
  | 'jogo_soquetes_tampa'
  | 'chave_eixo_esticadores'
  | 'chave_phillips_fenda'
  | 'chave_allen'
  | 'chave_vela'
  | 'chave_sangrador'
  | 'chave_freio_tambor'
  | 'alicate_bico'
  | 'calibre_laminas'
  | 'multimetro_digital'
  | 'torquimetro'
  | 'calibrador_pneu'
  | 'regua_trena'
  | 'proveta_graduada'
  | 'chave_ajuste_valvula'
  | 'chave_castelo_centrifugo'
  | 'chave_impacto_manual'
  | 'instalador_retentor_bengala'
  | 'saca_buchas_prensa'
  | 'chave_gancho_direcao'
  | 'mangueira_sangria'
  | 'bandeja_coletora'
  | 'pano_limpo'
  | 'pano_umido'
  | 'escova_pincel'
  | 'ar_comprimido_pincel'
  | 'espatula_plastica'
  | 'cavalete_apoio_frente'
  | 'lanterna';

export interface FerramentaBancada {
  id: FerramentaBancadaId;
  nome: string;
  categoria: CategoriaFerramentaBancada;
}

export const FERRAMENTAS_BANCADA: Record<FerramentaBancadaId, FerramentaBancada> = {
  // Básicas
  chave_bujao_oleo: {
    id: 'chave_bujao_oleo',
    nome: 'Chave combinada ou soquete (bujão de óleo)',
    categoria: 'basica',
  },
  jogo_soquetes_tampa: {
    id: 'jogo_soquetes_tampa',
    nome: 'Jogo de soquetes e chaves combinadas',
    categoria: 'basica',
  },
  chave_eixo_esticadores: {
    id: 'chave_eixo_esticadores',
    nome: 'Chaves combinadas/soquetes (eixo traseiro e esticadores)',
    categoria: 'basica',
  },
  chave_phillips_fenda: {
    id: 'chave_phillips_fenda',
    nome: 'Chave Phillips e fenda',
    categoria: 'basica',
  },
  chave_allen: {
    id: 'chave_allen',
    nome: 'Jogo de chaves Allen',
    categoria: 'basica',
  },
  chave_vela: {
    id: 'chave_vela',
    nome: 'Chave de vela compatível com a ficha',
    categoria: 'basica',
  },
  chave_sangrador: {
    id: 'chave_sangrador',
    nome: 'Chave combinada (bico sangrador)',
    categoria: 'basica',
  },
  chave_freio_tambor: {
    id: 'chave_freio_tambor',
    nome: 'Chave combinada (porca de ajuste/eixo)',
    categoria: 'basica',
  },
  alicate_bico: {
    id: 'alicate_bico',
    nome: 'Alicate de bico fino',
    categoria: 'basica',
  },

  // Medição
  calibre_laminas: {
    id: 'calibre_laminas',
    nome: 'Calibre de lâminas',
    categoria: 'medicao',
  },
  multimetro_digital: {
    id: 'multimetro_digital',
    nome: 'Multímetro digital',
    categoria: 'medicao',
  },
  torquimetro: {
    id: 'torquimetro',
    nome: 'Torquímetro (recomendado)',
    categoria: 'medicao',
  },
  calibrador_pneu: {
    id: 'calibrador_pneu',
    nome: 'Manômetro / calibrador de pneus',
    categoria: 'medicao',
  },
  regua_trena: {
    id: 'regua_trena',
    nome: 'Régua ou trena (folga da corrente)',
    categoria: 'medicao',
  },
  proveta_graduada: {
    id: 'proveta_graduada',
    nome: 'Proveta graduada em ml',
    categoria: 'medicao',
  },

  // Especiais / Oficina
  chave_ajuste_valvula: {
    id: 'chave_ajuste_valvula',
    nome: 'Chave de ajuste de válvula (ou alicate + combinada)',
    categoria: 'especial',
  },
  chave_castelo_centrifugo: {
    id: 'chave_castelo_centrifugo',
    nome: 'Chave castelo (porca do centrífugo)',
    categoria: 'especial',
  },
  chave_impacto_manual: {
    id: 'chave_impacto_manual',
    nome: 'Chave de impacto manual',
    categoria: 'especial',
  },
  instalador_retentor_bengala: {
    id: 'instalador_retentor_bengala',
    nome: 'Sacador/instalador de retentor (oficina)',
    categoria: 'especial',
  },
  saca_buchas_prensa: {
    id: 'saca_buchas_prensa',
    nome: 'Saca-buchas ou prensa de fuso (oficina)',
    categoria: 'especial',
  },
  chave_gancho_direcao: {
    id: 'chave_gancho_direcao',
    nome: 'Chave gancho e saca-pistas de direção (oficina)',
    categoria: 'especial',
  },
  mangueira_sangria: {
    id: 'mangueira_sangria',
    nome: 'Mangueira transparente de sangria + frasco coletor',
    categoria: 'especial',
  },

  // Apoio
  bandeja_coletora: {
    id: 'bandeja_coletora',
    nome: 'Bandeja coletora (≥ 1,5 L) e funil limpo',
    categoria: 'apoio',
  },
  pano_limpo: {
    id: 'pano_limpo',
    nome: 'Pano limpo sem fiapos',
    categoria: 'apoio',
  },
  pano_umido: {
    id: 'pano_umido',
    nome: 'Pano úmido (proteger pintura do DOT 4)',
    categoria: 'apoio',
  },
  escova_pincel: {
    id: 'escova_pincel',
    nome: 'Escova macia / pincel de limpeza',
    categoria: 'apoio',
  },
  ar_comprimido_pincel: {
    id: 'ar_comprimido_pincel',
    nome: 'Ar comprimido ou pincel (limpar alojamento)',
    categoria: 'apoio',
  },
  espatula_plastica: {
    id: 'espatula_plastica',
    nome: 'Espátula plástica (limpeza de junta)',
    categoria: 'apoio',
  },
  cavalete_apoio_frente: {
    id: 'cavalete_apoio_frente',
    nome: 'Cavalete / apoio para suspender a frente',
    categoria: 'apoio',
  },
  lanterna: {
    id: 'lanterna',
    nome: 'Lanterna de inspeção',
    categoria: 'apoio',
  },
};

export const TOTAL_FERRAMENTAS_CANONICAS = Object.keys(FERRAMENTAS_BANCADA).length;

const ORDEM_CATEGORIA_FERRAMENTA: Record<CategoriaFerramentaBancada, number> = {
  basica: 0,
  medicao: 1,
  especial: 2,
  apoio: 3,
};

function mapearIdsFerramentas(ids: readonly FerramentaBancadaId[]): FerramentaBancada[] {
  const vistas = new Set<FerramentaBancadaId>();
  const lista: FerramentaBancada[] = [];
  for (const id of ids) {
    if (vistas.has(id)) continue;
    vistas.add(id);
    lista.push(FERRAMENTAS_BANCADA[id]);
  }
  return lista.sort(
    (a, b) => ORDEM_CATEGORIA_FERRAMENTA[a.categoria] - ORDEM_CATEGORIA_FERRAMENTA[b.categoria],
  );
}

/**
 * Resolve as ferramentas de bancada de cada um dos 16 passos mestre de `roteiroRevisao.ts`,
 * filtrando automaticamente conforme a arquitetura real da moto (`arquiteturaMoto.ts`).
 */
export function resolverFerramentasPassoRevisao(
  passoId: string,
  arq: ArquiteturaMoto,
): FerramentaBancada[] {
  switch (passoId) {
    case 'pneus_calibragem':
      return mapearIdsFerramentas(['calibrador_pneu', 'lanterna']);

    case 'freio_dianteiro':
      return arq.temFreioDiscoDianteiro
        ? mapearIdsFerramentas([
            'chave_phillips_fenda',
            'chave_sangrador',
            'mangueira_sangria',
            'pano_umido',
            'lanterna',
          ])
        : mapearIdsFerramentas(['chave_freio_tambor', 'escova_pincel', 'lanterna']);

    case 'bengala_suspensao':
      return mapearIdsFerramentas([
        'cavalete_apoio_frente',
        'chave_allen',
        'jogo_soquetes_tampa',
        'proveta_graduada',
        'instalador_retentor_bengala',
        'pano_limpo',
      ]);

    case 'direcao_guidao_cabos':
      return mapearIdsFerramentas([
        'cavalete_apoio_frente',
        'jogo_soquetes_tampa',
        'chave_allen',
        'chave_gancho_direcao',
      ]);

    case 'eletrica_bateria_luzes':
      return mapearIdsFerramentas([
        'multimetro_digital',
        'chave_phillips_fenda',
        'jogo_soquetes_tampa',
      ]);

    case 'vela_ignicao':
      return mapearIdsFerramentas(['chave_vela', 'calibre_laminas', 'ar_comprimido_pincel']);

    case 'folga_valvulas':
      return mapearIdsFerramentas([
        'calibre_laminas',
        'chave_ajuste_valvula',
        'jogo_soquetes_tampa',
        'torquimetro',
        'lanterna',
      ]);

    case 'arrefecimento_liquido':
      return mapearIdsFerramentas(['bandeja_coletora', 'jogo_soquetes_tampa', 'pano_limpo', 'lanterna']);

    case 'filtro_ar':
      return mapearIdsFerramentas(['chave_phillips_fenda', 'jogo_soquetes_tampa', 'pano_limpo']);

    case 'alimentacao_tbi_carb':
      return arq.tipoAlimentacao === 'injetada'
        ? mapearIdsFerramentas(['jogo_soquetes_tampa', 'chave_phillips_fenda', 'chave_allen', 'pano_limpo'])
        : mapearIdsFerramentas(['chave_phillips_fenda', 'jogo_soquetes_tampa', 'escova_pincel', 'pano_limpo']);

    case 'oleo_motor':
      return mapearIdsFerramentas(['bandeja_coletora', 'chave_bujao_oleo', 'torquimetro', 'pano_limpo']);

    case 'filtro_oleo_sistema':
      if (arq.tipoFiltroOleo === 'centrifugo_honda') {
        return mapearIdsFerramentas([
          'jogo_soquetes_tampa',
          'chave_castelo_centrifugo',
          'chave_impacto_manual',
          'alicate_bico',
          'espatula_plastica',
          'torquimetro',
        ]);
      }
      if (arq.tipoFiltroOleo === 'papel_externo') {
        return mapearIdsFerramentas(['jogo_soquetes_tampa', 'bandeja_coletora', 'torquimetro', 'pano_limpo']);
      }
      return mapearIdsFerramentas(['chave_bujao_oleo', 'alicate_bico', 'escova_pincel', 'pano_limpo']);

    case 'transmissao_final':
      return arq.isCvt
        ? mapearIdsFerramentas(['jogo_soquetes_tampa', 'bandeja_coletora', 'ar_comprimido_pincel', 'pano_limpo'])
        : mapearIdsFerramentas([
            'chave_eixo_esticadores',
            'regua_trena',
            'escova_pincel',
            'pano_limpo',
            'torquimetro',
          ]);

    case 'balanca_amortecedores':
      return mapearIdsFerramentas(['jogo_soquetes_tampa', 'saca_buchas_prensa', 'torquimetro', 'lanterna']);

    case 'freio_traseiro':
      return arq.temFreioDiscoTraseiro
        ? mapearIdsFerramentas([
            'chave_phillips_fenda',
            'chave_sangrador',
            'mangueira_sangria',
            'pano_umido',
          ])
        : mapearIdsFerramentas(['chave_freio_tambor', 'alicate_bico', 'escova_pincel', 'pano_limpo']);

    case 'aperto_teste_final':
      return mapearIdsFerramentas(['torquimetro', 'jogo_soquetes_tampa', 'lanterna']);

    default:
      return mapearIdsFerramentas(['jogo_soquetes_tampa', 'pano_limpo']);
  }
}

/**
 * Consolida e remove duplicatas das ferramentas de uma lista de passos de revisão.
 */
export function consolidarFerramentasRevisao(
  passos: readonly { ferramentas: readonly FerramentaBancada[] }[],
): FerramentaBancada[] {
  const ids: FerramentaBancadaId[] = [];
  for (const passo of passos) {
    for (const ferr of passo.ferramentas) {
      ids.push(ferr.id);
    }
  }
  return mapearIdsFerramentas(ids);
}

const FERRAMENTAS_PROCEDIMENTOS_MAP: Readonly<Record<string, readonly FerramentaBancadaId[]>> = {
  'troca-lona-freio-traseiro': [
    'chave_freio_tambor',
    'chave_eixo_esticadores',
    'alicate_bico',
    'escova_pincel',
    'pano_limpo',
    'torquimetro',
  ],
  'troca-bucha-balanca': [
    'jogo_soquetes_tampa',
    'chave_eixo_esticadores',
    'saca_buchas_prensa',
    'torquimetro',
    'pano_limpo',
  ],
  'troca-kit-relacao': [
    'chave_eixo_esticadores',
    'jogo_soquetes_tampa',
    'alicate_bico',
    'regua_trena',
    'escova_pincel',
    'torquimetro',
  ],
  'regulagem-valvulas': [
    'calibre_laminas',
    'chave_ajuste_valvula',
    'jogo_soquetes_tampa',
    'chave_phillips_fenda',
    'torquimetro',
    'lanterna',
  ],
  'limpeza-filtro-centrifugo-honda': [
    'bandeja_coletora',
    'chave_bujao_oleo',
    'jogo_soquetes_tampa',
    'chave_castelo_centrifugo',
    'chave_impacto_manual',
    'alicate_bico',
    'espatula_plastica',
    'torquimetro',
  ],
  'troca-retentor-fluido-bengala': [
    'cavalete_apoio_frente',
    'jogo_soquetes_tampa',
    'chave_allen',
    'proveta_graduada',
    'instalador_retentor_bengala',
    'bandeja_coletora',
    'pano_limpo',
  ],
  'troca-pastilhas-freio-disco': [
    'chave_allen',
    'jogo_soquetes_tampa',
    'escova_pincel',
    'pano_limpo',
    'torquimetro',
  ],
  'limpeza-bico-injetor-tbi': [
    'jogo_soquetes_tampa',
    'chave_phillips_fenda',
    'chave_allen',
    'escova_pincel',
    'pano_limpo',
  ],
  'troca-caixa-direcao': [
    'cavalete_apoio_frente',
    'jogo_soquetes_tampa',
    'chave_allen',
    'chave_gancho_direcao',
    'torquimetro',
  ],
  'troca-oleo-filtro-papel': [
    'bandeja_coletora',
    'chave_bujao_oleo',
    'jogo_soquetes_tampa',
    'torquimetro',
    'pano_limpo',
  ],
  'sangria-freio-hidraulico': [
    'chave_phillips_fenda',
    'chave_sangrador',
    'mangueira_sangria',
    'pano_umido',
  ],
};

/**
 * Resolve a lista canônica de ferramentas para os 11 procedimentos de `procedimentos.ts`,
 * filtrando itens incompatíveis com a arquitetura da moto atual.
 */
export function resolverFerramentasProcedimento(
  procedimentoId: string,
  arq: ArquiteturaMoto,
): FerramentaBancada[] {
  const base = FERRAMENTAS_PROCEDIMENTOS_MAP[procedimentoId];
  if (!base) return [];

  const filtrados = base.filter((id) => {
    if (
      arq.isSomenteTambor &&
      (id === 'chave_sangrador' || id === 'mangueira_sangria' || id === 'pano_umido')
    ) {
      return false;
    }
    if (arq.isCvt && id === 'regua_trena') {
      return false;
    }
    if (arq.tipoFiltroOleo !== 'centrifugo_honda' && id === 'chave_castelo_centrifugo') {
      return false;
    }
    return true;
  });

  return mapearIdsFerramentas(filtrados);
}
