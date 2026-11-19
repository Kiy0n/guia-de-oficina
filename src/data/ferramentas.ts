export type NivelFerramenta = 'essencial' | 'intermediario' | 'avancado';

export type CategoriaFerramenta =
  | 'chaves'
  | 'medicao'
  | 'especiais'
  | 'eletrica'
  | 'insumos';

export interface ItemFerramenta {
  id: string;
  nome: string;
  especificacao: string;
  nivel: NivelFerramenta;
  categoria: CategoriaFerramenta;
  paraQueServe: string;
  prioridade: number;
}

export const NIVEL_FERRAMENTA_INFO: Record<
  NivelFerramenta,
  { titulo: string; curto: string; subtitulo: string; badgeClass: string }
> = {
  essencial: {
    titulo: 'Nível 1 — Essencial',
    curto: 'Essencial',
    subtitulo: 'Manutenções básicas, trocas de óleo, freios, relação e ajustes semanais',
    badgeClass:
      'border-emerald-600/40 bg-emerald-500/12 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  intermediario: {
    titulo: 'Nível 2 — Intermediário',
    curto: 'Intermediário',
    subtitulo: 'Preventiva completa: regulagem de válvulas, filtro centrífugo, elétrica e sangria',
    badgeClass:
      'border-sky-600/40 bg-sky-500/12 text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-300',
  },
  avancado: {
    titulo: 'Nível 3 — Avançado / Especialista',
    curto: 'Avançado',
    subtitulo: 'Torquímetro de precisão, suspensão, caixa de direção, CVT e diagnóstico de injeção',
    badgeClass:
      'border-purple-600/40 bg-purple-500/12 text-purple-700 dark:border-purple-500/40 dark:bg-purple-500/15 dark:text-purple-300',
  },
};

export const CATEGORIA_FERRAMENTA_LABEL: Record<CategoriaFerramenta, string> = {
  chaves: 'Chaves & Soquetes',
  medicao: 'Medição & Calibração',
  especiais: 'Ferramentas Especiais',
  eletrica: 'Elétrica & Diagnóstico',
  insumos: 'Insumos & Bancada',
};

export const CATALOGO_FERRAMENTAS: readonly ItemFerramenta[] = [
  // =========================================================================
  // NÍVEL 1 — ESSENCIAL (Manutenções Básicas)
  // =========================================================================
  {
    id: 'jogo-combinadas-8-24',
    nome: 'Jogo de Chaves Combinadas (Boca / Estrela)',
    especificacao: '8, 10, 12, 13, 14, 17, 19, 22 e 24 mm (Aço Cromo-Vanádio)',
    nivel: 'essencial',
    categoria: 'chaves',
    paraQueServe:
      'Soltar eixos de roda (17, 19, 22, 24 mm), eixo da balança, amortecedores (14, 17 mm), bujão de óleo (12, 17 mm), esticadores de corrente e vareta de freio (10, 12, 14 mm).',
    prioridade: 1,
  },
  {
    id: 'chaves-l-canhao-8-10-12',
    nome: 'Trio de Chaves L / Canhão Sextavadas',
    especificacao: '8 mm, 10 mm e 12 mm (preferencialmente perfil longo)',
    nivel: 'essencial',
    categoria: 'chaves',
    paraQueServe:
      'As 3 chaves mais usadas na oficina japonesa: tampas de motor/pinhão/filtro (8 mm), carenagens, trava de pinhão e tampa de válvulas (10 mm), bujão Honda e suporte de pinça/escapamento (12 mm).',
    prioridade: 1,
  },
  {
    id: 'jogo-allen-4-8',
    nome: 'Jogo de Chaves Allen Abaulada (Hexagonal)',
    especificacao: '4 mm, 5 mm, 6 mm e 8 mm (formato L longo)',
    nivel: 'essencial',
    categoria: 'chaves',
    paraQueServe:
      'Pino guia das pastilhas de freio e carenagens (5 mm), mesa superior e guidão (6 mm), parafuso inferior do cilindro da bengala (6 mm ou 8 mm) e tampa do tanque (4 mm).',
    prioridade: 2,
  },
  {
    id: 'chaves-fenda-phillips-vela',
    nome: 'Kit Fenda, Phillips (PH2/PH3) e Chave de Vela',
    especificacao: 'Phillips PH2 e PH3 imantadas + Fenda 6 mm + Chave de vela 16 mm e 18 mm',
    nivel: 'essencial',
    categoria: 'chaves',
    paraQueServe:
      'Tampa do reservatório de fluido de freio e abraçadeiras de TBI/carburador (PH2), tampas de inspeção do sincronismo no magneto (fenda larga) e remoção de velas M10 (16 mm) e M12 OHV/Suzuki (18 mm).',
    prioridade: 2,
  },
  {
    id: 'alicates-universal-bico',
    nome: 'Alicate Universal + Alicate de Bico Fino',
    especificacao: 'Alicate universal 8" + Alicate de bico meia-cana 6" isolados',
    nivel: 'essencial',
    categoria: 'chaves',
    paraQueServe:
      'Remover e instalar a trava de emenda da corrente de transmissão, puxar a peneira (tela metálica) de óleo das motos Honda, remover contrapinos (cupilhas) do eixo/braço de freio e molas de patins.',
    prioridade: 2,
  },
  {
    id: 'bacia-drenagem-funil',
    nome: 'Bacia Coletora de Óleo + Funil Longo + Copo Graduado',
    especificacao: 'Bacia plástica 3 L + Funil bico fino + Copo medidor 500 ml / 1.000 ml (divisão 5 ml)',
    nivel: 'essencial',
    categoria: 'insumos',
    paraQueServe:
      'Drenar óleo usado sem sujar o piso, medir o volume exato de óleo do cárter (ex.: 700 ml na Biz, 800 ml na Pop, 950 ml na Yes/Intruder) e dosar os ml exatos do fluido de bengala.',
    prioridade: 1,
  },
  {
    id: 'insumos-lixas-limpeza-ar',
    nome: 'Kit Limpeza de Cubo e Peças (Lixas 160/180, Pincel, Microfibra e Ar)',
    especificacao: 'Folhas de lixa ferro/água grão 160 e 180 + Pincel cerdas firmes + Panos microfibra + Soprador de ar',
    nivel: 'essencial',
    categoria: 'insumos',
    paraQueServe:
      'Lixa 160/180 para quebrar o espelhamento do cubo de freio traseiro e das lonas/pastilhas novas; soprador de ar (ou soprar com cuidado/máscara na ausência de compressor) para expulsar a fuligem do tambor.',
    prioridade: 1,
  },
  {
    id: 'insumos-quimicos-bancada',
    nome: 'Químicos Essenciais (Graxa Azul, Desengripante, DOT 4 e Limpa-Contatos)',
    especificacao: 'Graxa azul para rolamentos (500g) + Spray desengripante + Fluido de freio DOT 4 + Limpa-contatos + CAR 80',
    nivel: 'essencial',
    categoria: 'insumos',
    paraQueServe:
      'Lubrificar eixos de roda, bucha da balança, came de freio e caixa de direção (graxa azul); renovar fluido hidráulico (DOT 4); descarbonizar TBI/bico injetor (CAR 80) e proteger conectores elétricos.',
    prioridade: 1,
  },

  // =========================================================================
  // NÍVEL 2 — INTERMEDIÁRIO (Preventiva Completa)
  // =========================================================================
  {
    id: 'jogo-catraca-soquetes',
    nome: 'Jogo de Catraca Reversível + Soquetes Sextavados',
    especificacao: 'Encaixe 3/8" ou 1/2" com soquetes de 8 a 24 mm + Extensões curta/longa + Cabo T',
    nivel: 'intermediario',
    categoria: 'chaves',
    paraQueServe:
      'Agilizar desmontagem de tampas, suporte de freio, amortecedores, porcas de coroa e eixo traseiro de scooters (24 mm) aplicando torque uniforme sem arredondar sextavados.',
    prioridade: 3,
  },
  {
    id: 'calibre-laminas-chave-valvula',
    nome: 'Cálibre de Lâminas + Chave Quadrada de Válvulas',
    especificacao: 'Lâminas de 0,04 a 1,00 mm (com 0,05 / 0,08 / 0,10 / 0,12 / 0,15 / 0,24 mm) + Chavinha 3 mm e 9 mm',
    nivel: 'intermediario',
    categoria: 'medicao',
    paraQueServe:
      'Conferir e regular a folga de válvulas com motor frio em toda a linha Honda (0,05 a 0,24 mm), Yamaha (0,08 a 0,16 mm) e Suzuki (0,04 a 0,14 mm), além de calibrar o gap da vela (0,7–0,9 mm).',
    prioridade: 2,
  },
  {
    id: 'chave-castelo-centrifugo',
    nome: 'Chave Castelo do Filtro Centrífugo + Travador de Engrenagem',
    especificacao: 'Soquete castelo duplo 20 mm x 24 mm (encaixe 1/2") + Trava de engrenagem primária',
    nivel: 'intermediario',
    categoria: 'especiais',
    paraQueServe:
      'Soltar e apertar a porca castelo interna do rotor do filtro centrífugo de óleo nas motos Honda (CG 125/150/160, Bros, XRE 190, Biz e Pop) a cada 12.000 km sem usar talhadeira.',
    prioridade: 3,
  },
  {
    id: 'chave-impacto-manual',
    nome: 'Chave de Impacto Manual Reversível com Bits Phillips',
    especificacao: 'Corpo de impacto 1/2" com pontas reforçadas PH2 e PH3',
    nivel: 'intermediario',
    categoria: 'especiais',
    paraQueServe:
      'Destravar sem espanar os 3 parafusos Phillips da tampa do filtro centrífugo Honda e parafusos de estator/tampas antigas que travam por dilatação térmica.',
    prioridade: 3,
  },
  {
    id: 'multimetro-digital-agulha',
    nome: 'Multímetro Digital True RMS com Pontas Agulha',
    especificacao: 'Medição DCV (20V), ACV (200V), Resistência (Ω), Continuidade com bip e ponta fina',
    nivel: 'intermediario',
    categoria: 'eletrica',
    paraQueServe:
      'Testar saúde e carga da bateria (13,5V–14,8V @ 5.000 rpm), bobina de pulso, resistência do estator, sensor TPS/EOT, continuidade de chicote e fusíveis.',
    prioridade: 3,
  },
  {
    id: 'kit-sangria-freio',
    nome: 'Kit de Sangria de Freio (Mangueira Silicone + Seringa 60 ml)',
    especificacao: 'Mangueira cristal/silicone 4 mm (50 cm) + Seringa graduada 60 ml + Frasco coletor',
    nivel: 'intermediario',
    categoria: 'especiais',
    paraQueServe:
      'Expulsar bolhas de ar em sistemas a disco convencional, freio combinado Honda CBS (pinça de 3 êmbolos com 2 sangradores) e módulos ABS (XRE 190, CG Titan 2025+, Crosser, FZ15).',
    prioridade: 3,
  },
  {
    id: 'trava-rosca-juntas',
    nome: 'Trava-Rosca Azul (Médio Torque) + Silicone Alta Temperatura',
    especificacao: 'Adesivo anaeróbico médio torque (tipo Loctite 243) + Junta líquida cinza oximica',
    nivel: 'intermediario',
    categoria: 'insumos',
    paraQueServe:
      'Travar parafusos de segurança (pinça de freio dianteira, disco, trava do pinhão e coroa) permitindo desmontagem futura com chave manual.',
    prioridade: 3,
  },

  // =========================================================================
  // NÍVEL 3 — AVANÇADO / ESPECIALISTA
  // =========================================================================
  {
    id: 'torquimetro-estalo',
    nome: 'Torquímetro de Estalo (Precisão de Bancada)',
    especificacao: 'Faixa 5–25 N·m (3/8") ou 20–110 N·m (1/2") com certificado de calibração',
    nivel: 'avancado',
    categoria: 'medicao',
    paraQueServe:
      'Aplicar o aperto exato do manual de serviço no bujão de óleo (20–30 N·m), vela (13–18 N·m), pinça de freio (30–35 N·m), eixo dianteiro (59–63 N·m) e eixo traseiro (85–118 N·m).',
    prioridade: 4,
  },
  {
    id: 'manometro-combustivel',
    nome: 'Manômetro de Pressão e Vazão da Bomba de Combustível',
    especificacao: 'Manômetro 0–7 bar (0–100 psi) com mangueiras e engates rápidos Honda/Yamaha',
    nivel: 'avancado',
    categoria: 'medicao',
    paraQueServe:
      'Diagnosticar falhas de alta rotação e partida a frio medindo a pressão da linha PGM-FI Honda (2,9–3,0 bar) e BlueFlex Yamaha (2,5 bar).',
    prioridade: 5,
  },
  {
    id: 'extrator-bucha-batedor-retentor',
    nome: 'Saca-Buchas / Rolamentos + Batedor de Retentor de Bengala',
    especificacao: 'Fuso extrator de bucha de balança + Instalador de retentor 31 / 33 mm + Martelo de borracha',
    nivel: 'avancado',
    categoria: 'especiais',
    paraQueServe:
      'Sacar e prensar buchas do quadro elástico sem empenar a balança e assentar retentores novos de suspensão dianteira (31 mm e 33 mm) sem ferir o lábio de vedação.',
    prioridade: 4,
  },
  {
    id: 'chave-gancho-caixa-direcao',
    nome: 'Chave Gancho (Meia-Lua) para Caixa de Direção + Saca-Pistas',
    especificacao: 'Chave castelo/meia-lua para porca serrilhada da coluna + Soquete 30 mm + Punção saca-pista',
    nivel: 'avancado',
    categoria: 'especiais',
    paraQueServe:
      'Extrair as pistas de rolamento do chassi e ajustar a pré-carga exata da porca castelo da coluna de direção sem marcar com talhadeira.',
    prioridade: 4,
  },
];
