import type { Marca, MotoSelecionada } from '@/types/moto';

export type CategoriaProcedimento =
  | 'freios'
  | 'motor'
  | 'transmissao'
  | 'suspensao'
  | 'chassi'
  | 'injecao';

export type DificuldadeProcedimento = 'Basico' | 'Intermediario' | 'Avancado';

export type TagAplicacaoProcedimento =
  | 'tambor'
  | 'disco'
  | 'corrente'
  | 'cvt'
  | 'centrifugo'
  | 'filtro_papel'
  | 'injecao'
  | 'carburada'
  | 'geral';

export interface FerramentaExataProcedimento {
  ferramentaId?: string;
  nome: string;
  medidaOuDetalhe: string;
  obrigatoria: boolean;
}

export interface VideoProcedimento {
  youtubeId: string;
  titulo: string;
  canal: string;
  url: string;
}

export interface ProcedimentoOficina {
  id: string;
  titulo: string;
  resumo: string;
  categoria: CategoriaProcedimento;
  dificuldade: DificuldadeProcedimento;
  tempoEstimado: string;
  marcasAplicaveis: Marca[];
  tagsAplicacao: TagAplicacaoProcedimento[];
  ferramentasExatas: FerramentaExataProcedimento[];
  insumos: string[];
  passoAPasso: string[];
  dicasDeOuro: string[];
  errosComuns: string[];
  videos: VideoProcedimento[];
}

export const CATEGORIA_PROCEDIMENTO_LABEL: Record<CategoriaProcedimento, string> = {
  freios: 'Freios',
  motor: 'Motor & Válvulas',
  transmissao: 'Transmissão & CVT',
  suspensao: 'Suspensão',
  chassi: 'Chassi & Direção',
  injecao: 'Injeção & Alimentação',
};

export const DIFICULDADE_BADGE_CLASS: Record<DificuldadeProcedimento, string> = {
  Basico: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
  Intermediario: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
  Avancado: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
};

export const PROCEDIMENTOS_OFICINA: readonly ProcedimentoOficina[] = [
  // -------------------------------------------------------------------------
  // 1. Troca de Lona / Patins de Freio Traseiro (Tambor)
  // -------------------------------------------------------------------------
  {
    id: 'troca-lona-freio-traseiro',
    titulo: 'Troca de Lona / Patins de Freio Traseiro (Tambor)',
    resumo:
      'Substituição dos patins de freio a tambor, quebra de espelhamento do cubo com lixa 160/180, limpeza de fuligem e lubrificação do eixo came.',
    categoria: 'freios',
    dificuldade: 'Basico',
    tempoEstimado: '25 – 35 min',
    marcasAplicaveis: ['Honda', 'Yamaha', 'Suzuki'],
    tagsAplicacao: ['tambor'],
    ferramentasExatas: [
      {
        ferramentaId: 'jogo-combinadas-8-24',
        nome: 'Chave Combinada 19 mm e 22 mm',
        medidaOuDetalhe: 'Soltar porca e segurar cabeça do eixo traseiro (19 mm e 22 mm; 17 mm em algumas 125)',
        obrigatoria: true,
      },
      {
        ferramentaId: 'jogo-combinadas-8-24',
        nome: 'Chave Combinada 10 mm, 12 mm e 14 mm',
        medidaOuDetalhe: '14 mm (porca da vareta/braço limitador) + 10 e 12 mm (esticadores da corrente)',
        obrigatoria: true,
      },
      {
        ferramentaId: 'alicates-universal-bico',
        nome: 'Alicate de Bico Fino',
        medidaOuDetalhe: 'Retirar e instalar contrapino (cupilha) do braço limitador e molas dos patins',
        obrigatoria: true,
      },
      {
        ferramentaId: 'insumos-lixas-limpeza-ar',
        nome: 'Lixa 160 ou 180 + Soprador de Ar',
        medidaOuDetalhe: 'Quebrar espelhamento do cubo interno e expulsar o pó acumulado',
        obrigatoria: true,
      },
      {
        ferramentaId: 'insumos-quimicos-bancada',
        nome: 'Graxa Azul / Alta Temperatura',
        medidaOuDetalhe: 'Camada mínima apenas no pino pivô e eixo came (nunca na pista)',
        obrigatoria: true,
      },
    ],
    insumos: [
      'Jogo de patins (lona) de freio novo compatível com o modelo (Standard ou 0,25 mm se o cubo já tiver desgaste)',
      'Lixa grão 160 ou 180 (para quebrar o espelhamento da pista do cubo e tirar a goma superficial da lona nova)',
      'Soprador de ar / compressor (Alternativa prática: soprar bem o pó com a boca a favor do vento e de olhos fechados/máscara, ou lavar o espelho com água e sabão secando 100%)',
      'Camada mínima de graxa azul ou graxa de alta temperatura somente no eixo came ("S") e no pino fixo de apoio',
      'Contrapino (cupilha) novo para o parafuso do braço limitador do espelho',
    ],
    passoAPasso: [
      'Apoie a moto em cavalete central ou lateral reforçado, solte totalmente a porca recartilhada da vareta do freio traseiro (14 mm) e remova o pino clevis.',
      'Solte o contrapino e a porca (14 mm) do braço limitador (ancoragem) preso ao espelho do freio.',
      'Com as chaves 19 mm e 22 mm, solte a porca do eixo traseiro, recue o eixo e afaste a roda para retirar o espelho de freio do cubo.',
      'Com a lixa 160 ou 180, lixe em movimentos cruzados toda a pista interna do cubo da roda até remover o brilho espelhado (vitrificação que faz o freio apitar e perder eficiência).',
      'Remova todo o pó do cubo usando soprador de ar (ou sopre com cuidado sem inalar a poeira) e passe um pano limpo e seco — nunca deixe óleo ou graxa encostar no cubo.',
      'Retire os patins velhos forçando-os em "V". Limpe o espelho, desmonte ou afaste o eixo came e aplique uma película mínima de graxa apenas no pino pivô e no eixo came para o pedal voltar macio.',
      'Dê uma leve quebrada de lixa (160/180) na superfície e nas quinas da lona nova (chanfro anti-chiado), monte as duas molas fora do espelho e encaixe o conjunto em "V" sobre o came e o pino.',
      'Remonte a roda, alinhe os esticadores da corrente na mesma marcação dos dois lados da balança, aperte o eixo traseiro (pisando no freio para centralizar o espelho), trave o braço limitador com cupilha nova e regule a folga livre do pedal (20 a 30 mm).',
    ],
    dicasDeOuro: [
      'Antes de apertar em definitivo a porca do eixo traseiro (88–90 N·m), pise firme no pedal de freio e mantenha pressionado enquanto dá o aperto final: isso centraliza as sapatas dentro do cubo e deixa o freio alto e macio de primeira.',
      'Chanfrar de leve as duas bordas de ataque da lona nova com a lixa 160 elimina 95% dos assobios agudos nos primeiros dias de uso.',
      'Confira sempre a seta indicadora de desgaste no braço do came: após montar a lona nova, o braço deve trabalhar em ângulo próximo de 90° em relação à vareta quando acionado.',
    ],
    errosComuns: [
      'Exagerar na graxa do eixo came: com o calor da frenagem a graxa derrete, escorre para a lona e inutiliza o freio traseiro.',
      'Montar lona nova em cubo vitrificado/espelhado sem passar a lixa 160 ou 180.',
      'Esquecer de recolocar o contrapino (cupilha) no parafuso do braço ancorador do espelho de freio.',
    ],
    videos: [
      {
        youtubeId: '4ILRHxbFi7Y',
        titulo: 'Passo a passo da troca dos patins de freio',
        canal: 'Nicolas Engrenados',
        url: 'https://www.youtube.com/watch?v=4ILRHxbFi7Y',
      },
      {
        youtubeId: 'xAYOUe-bte4',
        titulo: 'Troca de lona no dia a dia de uma oficina',
        canal: 'Nicolas Engrenados',
        url: 'https://www.youtube.com/watch?v=xAYOUe-bte4',
      },
      {
        youtubeId: 'DjuFzmmc8GE',
        titulo: 'Dica para deixar o freio traseiro melhor do que nunca',
        canal: 'Nicolas Engrenados',
        url: 'https://www.youtube.com/watch?v=DjuFzmmc8GE',
      },
      {
        youtubeId: 'jmgrE5TOZMg',
        titulo: 'Dica prática para melhorar o freio',
        canal: 'Nicolas Engrenados',
        url: 'https://www.youtube.com/watch?v=jmgrE5TOZMg',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 2. Troca da Bucha da Balança (Quadro Elástico)
  // -------------------------------------------------------------------------
  {
    id: 'troca-bucha-balanca',
    titulo: 'Troca da Bucha da Balança (Quadro Elástico)',
    resumo:
      'Remoção da balança traseira, extração e prensagem das buchas e espaçadores internos para eliminar jogo lateral da traseira.',
    categoria: 'chassi',
    dificuldade: 'Intermediario',
    tempoEstimado: '45 – 70 min',
    marcasAplicaveis: ['Honda', 'Yamaha', 'Suzuki'],
    tagsAplicacao: ['corrente'],
    ferramentasExatas: [
      {
        ferramentaId: 'jogo-combinadas-8-24',
        nome: 'Chave Combinada 19 mm e 22 mm',
        medidaOuDetalhe: 'Soltar porca do eixo da balança e eixo da roda traseira',
        obrigatoria: true,
      },
      {
        ferramentaId: 'jogo-combinadas-8-24',
        nome: 'Chave Combinada 14 mm e 17 mm',
        medidaOuDetalhe: 'Soltar fixação inferior dos amortecedores traseiros e braço de freio',
        obrigatoria: true,
      },
      {
        ferramentaId: 'chaves-l-canhao-8-10-12',
        nome: 'Chave L 10 mm e 12 mm',
        medidaOuDetalhe: 'Remover capa da corrente, guia deslizante e suportes',
        obrigatoria: true,
      },
      {
        ferramentaId: 'extrator-bucha-batedor-retentor',
        nome: 'Saca-Buchas (ou Barra Roscada c/ Porcas e Soquete) + Martelo de Borracha',
        medidaOuDetalhe: 'Extrair e prensar as buchas novas sem entortar os olhais da balança',
        obrigatoria: false,
      },
    ],
    insumos: [
      'Kit de buchas da balança novo (buchas externas, tubos espaçadores internos e retentores/guarda-pó)',
      'Graxa azul de rolamento em abundância para o eixo da balança e tubos internos',
      'Desengripante spray (para destravar eixo da balança oxidado no espaçador)',
    ],
    passoAPasso: [
      'Com a moto no cavalete central (ou chassi apoiado em cavalete sob o motor), remova a roda traseira (19/22 mm), a capa de corrente (L 10 mm) e a fixação inferior dos amortecedores (14/17 mm).',
      'Solte a porca do eixo da balança (19 ou 22 mm) e retire o eixo longo batendo levemente com martelo de borracha ou punção de bronze.',
      'Retire a balança da moto e avalie o estado do guia de borracha da corrente (saboneteira) — aproveite para trocá-lo se estiver cortado.',
      'Use um fuso saca-buchas (ou barra roscada de 1/2" com arruelas reforçadas e um soquete largo como copo receptor) para extrair as buchas antigas.',
      'Limpe o alojamento interno dos olhais da balança com lixa fina e pano; lubrifique levemente a parede externa antes de prensar as buchas novas alinhadas.',
      'Preencha os canais internos dos tubos espaçadores e os guarda-pós laterais com graxa azul nova.',
      'Posicione a balança no chassi, passe o eixo untado com graxa azul (para nunca gripar por ferrugem) e monte amortecedores e roda.',
      'Dê o aperto final na porca do eixo da balança com a suspensão apoiada no peso normal de trabalho.',
    ],
    dicasDeOuro: [
      '80% dos casos em que o eixo da balança "solda" de ferrugem acontecem porque na fábrica o eixo vem quase seco: sempre passe uma camada generosa de graxa azul em todo o comprimento do eixo.',
      'Em buchas de borracha vulcanizada, o aperto final do eixo da balança deve ser feito com a moto apoiada nas rodas (altura de trabalho), evitando que a borracha fique pré-torcida.',
    ],
    errosComuns: [
      'Marretar a balança sem apoio entre os dois lados, fechando o garfo e impedindo o encaixe de volta no chassi.',
      'Esquecer de montar os guarda-pós laterais, permitindo entrada de água e areia na bucha nova na primeira chuva.',
    ],
    videos: [
      {
        youtubeId: '9MyQg7ORqcg',
        titulo: 'Como realizar a troca da bucha do quadro elástico de uma moto',
        canal: 'Nicolas Engrenados',
        url: 'https://www.youtube.com/watch?v=9MyQg7ORqcg',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 3. Troca do Kit Relação (Pinhão, Coroa e Corrente)
  // -------------------------------------------------------------------------
  {
    id: 'troca-kit-relacao',
    titulo: 'Troca do Kit Relação (Pinhão, Coroa e Corrente)',
    resumo:
      'Substituição sincronizada de pinhão, coroa e corrente com sequência ágil de bancada, sentido correto da trava da emenda e ajuste de folga.',
    categoria: 'transmissao',
    dificuldade: 'Basico',
    tempoEstimado: '25 – 40 min',
    marcasAplicaveis: ['Honda', 'Yamaha', 'Suzuki'],
    tagsAplicacao: ['corrente'],
    ferramentasExatas: [
      {
        ferramentaId: 'chaves-l-canhao-8-10-12',
        nome: 'Chave L 8 mm e 10 mm',
        medidaOuDetalhe: '8 mm (tampa do pinhão) + 10 mm (parafusos da chapinha trava do pinhão)',
        obrigatoria: true,
      },
      {
        ferramentaId: 'jogo-combinadas-8-24',
        nome: 'Chave Combinada 19 mm e 22 mm',
        medidaOuDetalhe: 'Soltar e apertar eixo da roda traseira',
        obrigatoria: true,
      },
      {
        ferramentaId: 'jogo-combinadas-8-24',
        nome: 'Chave Combinada / Soquete 14 mm ou 17 mm',
        medidaOuDetalhe: 'Soltar as 4 porcas/prisioneiros da coroa traseira',
        obrigatoria: true,
      },
      {
        ferramentaId: 'jogo-combinadas-8-24',
        nome: 'Chave Combinada 10 mm e 12 mm',
        medidaOuDetalhe: 'Recuar e regular os esticadores da corrente na balança',
        obrigatoria: true,
      },
      {
        ferramentaId: 'alicates-universal-bico',
        nome: 'Alicate de Bico Fino',
        medidaOuDetalhe: 'Abrir e travar o clipe da emenda da corrente no sentido correto',
        obrigatoria: true,
      },
    ],
    insumos: [
      'Kit relação novo (Pinhão, Coroa e Corrente) na medida especificada na Ficha Técnica (ex.: 428H)',
      'Trava-rosca azul (médio torque) para os parafusos da trava do pinhão e porcas da coroa',
      'Desengraxante + pincel (para limpar a cavidade do pinhão cheia de graxa velha com areia)',
      'Graxa ou spray específico para corrente (SAE 90 / spray sintético)',
    ],
    passoAPasso: [
      'Antes de tirar a corrente velha ou levantar a roda: remova a tampa do pinhão (L 8 mm), engate a 1ª marcha (ou pise no freio traseiro) e já afrouxe os dois parafusos 10 mm da chapinha trava do pinhão e as 4 porcas da coroa (14 ou 17 mm).',
      'Coloque em ponto morto, localize o elo de emenda da corrente antiga, retire a trava com o alicate e remova a corrente.',
      'Gire a chapinha trava do pinhão até alinhar os dentes com as ranhuras do eixo secundário, retire a trava e puxe o pinhão velho. Limpe toda a crosta de graxa e terra acumulada na carcaça ao redor do retentor do pinhão.',
      'Instale o pinhão novo, encaixe a chapinha trava nova girando-a no rasgo do eixo e aplique uma gota de trava-rosca azul nos parafusos 10 mm.',
      'Remova a roda traseira, substitua a coroa no flange (conferindo o estado das borrachas amortecedoras / coxim do cubo) e aperte as 4 porcas em cruz.',
      'Recue totalmente os esticadores (10/12 mm), monte a roda no lugar e passe a corrente nova pelo pinhão e coroa.',
      'Monte o elo de emenda com o alicate: a PARTE FECHADA (curva) do clipe da trava deve apontar SEMPRE para o SENTIDO DE ROTAÇÃO da corrente!',
      'Ajuste a folga livre da corrente no meio do vão inferior conforme a Ficha Técnica (ex.: 20–30 mm na CG / 30–40 mm em trails), alinhe as marcas dos dois lados da balança e dê o torque final no eixo traseiro.',
    ],
    dicasDeOuro: [
      'Macete de agilidade: afrouxar os parafusos do pinhão (10 mm) e as porcas da coroa (14/17 mm) com a roda ainda no chão e a corrente antiga montada economiza mais de 15 minutos de esforço.',
      'Aproveite a roda fora para verificar se há folga no rolamento do flange da coroa e nas borrachas do coxim do cubo — coxim frouxo destrói o kit relação novo na metade do tempo.',
    ],
    errosComuns: [
      'Montar a trava da emenda da corrente invertida (com a boca aberta apontando para o sentido de giro), fazendo a trava escapar em movimento.',
      'Deixar a corrente esticada demais sem folga para o curso da suspensão: quando o piloto e o garupa sentam, a corrente estica, força o rolamento do eixo do pinhão e pode arrebentar.',
      'Trocar apenas a corrente mantendo coroa e pinhão gastos ("dente de tubarão"), o que ovaliza a corrente nova em poucos quilômetros.',
    ],
    videos: [
      {
        youtubeId: 'Wt1ZMXnenSM',
        titulo: 'A troca do kit relação de 30 minutos vira 5 minutos',
        canal: 'Nicolas Engrenados',
        url: 'https://www.youtube.com/watch?v=Wt1ZMXnenSM',
      },
      {
        youtubeId: 'tiVselOjy_A',
        titulo: 'Parte 02 — Troca do kit relação na agilidade',
        canal: 'Nicolas Engrenados',
        url: 'https://www.youtube.com/watch?v=tiVselOjy_A',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 4. Regulagem de Válvulas (Motor Frio)
  // -------------------------------------------------------------------------
  {
    id: 'regulagem-valvulas',
    titulo: 'Regulagem de Válvulas (Motor Frio)',
    resumo:
      'Calibração precisa da folga de admissão e escape no PMS de compressão (marca T) com motor totalmente frio (< 35 °C).',
    categoria: 'motor',
    dificuldade: 'Intermediario',
    tempoEstimado: '35 – 50 min',
    marcasAplicaveis: ['Honda', 'Yamaha', 'Suzuki'],
    tagsAplicacao: ['geral'],
    ferramentasExatas: [
      {
        ferramentaId: 'calibre-laminas-chave-valvula',
        nome: 'Cálibre de Lâminas + Chavinha Quadrada 3 mm e Combinada 9 mm / 10 mm',
        medidaOuDetalhe: 'Medir folga exata em centésimos de mm, segurar o pino regulador e travar a contraporca',
        obrigatoria: true,
      },
      {
        ferramentaId: 'chaves-l-canhao-8-10-12',
        nome: 'Chave L 8 mm e 10 mm',
        medidaOuDetalhe: 'Remover parafusos da tampa do cabeçote (tampa de válvulas) e carenagens/abas',
        obrigatoria: true,
      },
      {
        ferramentaId: 'chaves-fenda-phillips-vela',
        nome: 'Chave de Fenda Larga (ou Allen 6/10 mm conforme modelo)',
        medidaOuDetalhe: 'Abrir as tampinhas redondas de inspeção do virabrequim e da marca T na tampa esquerda',
        obrigatoria: true,
      },
      {
        ferramentaId: 'jogo-catraca-soquetes',
        nome: 'Soquete 14 mm ou 17 mm com Cabo T',
        medidaOuDetalhe: 'Girar o rotor do magneto no sentido anti-horário até alinhar o PMS ("T")',
        obrigatoria: true,
      },
    ],
    insumos: [
      'Guarnição de borracha da tampa de válvulas + coxins dos parafusos da tampa (trocar se estiverem ressecados ou vazando)',
      'Pano microfibra limpo e desengraxante para limpar a borda de assentamento do cabeçote',
    ],
    passoAPasso: [
      'REGRA ABSOLUTA: certifique-se de que o motor está TOTALMENTE FRIO (temperatura ambiente, abaixo de 35 °C — ideal após 3 a 4 horas desligado).',
      'Limpe com ar ou pincel a parte superior do cabeçote para não cair areia dentro do comando, solte os parafusos da tampa de válvulas (L 8 mm ou 10 mm) e retire a tampa.',
      'Abra as duas tampas de inspeção na carcaça esquerda do motor (fenda larga ou Allen). Com o soquete 14 mm ou 17 mm no parafuso central do volante, gire no sentido ANTI-HORÁRIO até alinhar o traço "T" com o entalhe da carcaça.',
      'Confirme que o motor está no PMS do tempo de COMPRESSÃO: a linha da engrenagem do comando deve estar paralela ao cabeçote e os dois balancins (admissão e escape) devem apresentar leve folga livre ao balançar com os dedos. Se estiverem presos (cruzamento), dê mais uma volta completa (360°) até a marca "T".',
      'Insira a lâmina do cálibre correspondente à ADMISSÃO (veja o valor exato no banner da moto acima) entre a ponta do parafuso regulador e a haste da válvula. A lâmina deve deslizar com leve arrasto ("efeito manteiga").',
      'Se precisar ajustar: solte a contraporca (9 mm ou 10 mm), gire o pino quadrado (3 mm) até obter o arrasto ideal na lâmina, segure firme o pino quadrado para ele não girar junto e aperte a contraporca (14 N·m).',
      'Repita o mesmo procedimento na válvula de ESCAPE (lado do escapamento) com a lâmina exata especificada na Ficha Técnica.',
      'Dê duas voltas completas no virabrequim, pare novamente na marca "T" de compressão e confira as duas folgas com o cálibre antes de fechar a tampa.',
    ],
    dicasDeOuro: [
      'Ao apertar a contraporca, a folga tende a alterar 0,01 a 0,02 mm se o parafuso regulador mexer um fio de cabelo: sempre passe a lâmina NOVAMENTE após o aperto final da contraporca.',
      'Nas Honda 160 / XRE 190, lembre-se sempre: Admissão é 0,08 mm, mas o Escape é 0,24 mm (o dobro da CG 150!). Já na CG 125 Vareta (OHV 2000–2008), ambas são 0,08 mm.',
    ],
    errosComuns: [
      'Regular as válvulas no PMS de cruzamento (exaustão/admissão) em vez do PMS de compressão — quando o motor gira para a compressão, as válvulas ficam com 1 mm de folga e batem alto.',
      'Regular válvula com o motor morno ou quente, deixando a válvula enforcada (presa) quando esfria ou queimando a sede de escape.',
      'Deixar o escape da CG 160 / Bros 160 / XRE 190 com 0,12 mm achando que é igual à CG 150: a moto morre sozinha ao parar no semáforo quente.',
    ],
    videos: [
      {
        youtubeId: 'He3NwdYvqAM',
        titulo: 'Regulagem de válvula é essencial para o bom desempenho',
        canal: 'Nicolas Engrenados',
        url: 'https://www.youtube.com/watch?v=He3NwdYvqAM',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 5. Limpeza do Filtro Centrífugo e Peneira de Óleo (Honda)
  // -------------------------------------------------------------------------
  {
    id: 'limpeza-filtro-centrifugo-honda',
    titulo: 'Limpeza do Filtro Centrífugo e Peneira de Óleo (Honda 110 / 125 / 150 / 160 / 190)',
    resumo:
      'Manutenção preventiva obrigatória a cada 12.000 km nos motores Honda: abertura da tampa direita, remoção da borra prensada no rotor centrífugo e limpeza da tela metálica inferior.',
    categoria: 'motor',
    dificuldade: 'Intermediario',
    tempoEstimado: '50 – 75 min',
    marcasAplicaveis: ['Honda'],
    tagsAplicacao: ['centrifugo'],
    ferramentasExatas: [
      {
        ferramentaId: 'chaves-l-canhao-8-10-12',
        nome: 'Chave L 8 mm e Combinada 12 mm',
        medidaOuDetalhe: '12 mm (bujão de dreno de óleo) + L 8 mm (todos os parafusos da tampa lateral direita)',
        obrigatoria: true,
      },
      {
        ferramentaId: 'chave-impacto-manual',
        nome: 'Chave de Impacto Manual (ou Phillips PH2/PH3 de precisão)',
        medidaOuDetalhe: 'Soltar os 3 parafusos da tampa do rotor do filtro centrífugo sem espanar a cabeça',
        obrigatoria: true,
      },
      {
        ferramentaId: 'chave-castelo-centrifugo',
        nome: 'Chave Castelo 20/24 mm + Travador de Engrenagem',
        medidaOuDetalhe: 'Caso seja necessário remover o copo completo do filtro centrífugo no virabrequim',
        obrigatoria: false,
      },
      {
        ferramentaId: 'alicates-universal-bico',
        nome: 'Alicate de Bico Fino',
        medidaOuDetalhe: 'Puxar a peneira (tela filtrante metálica) alojada na parte inferior da carcaça',
        obrigatoria: true,
      },
      {
        ferramentaId: 'bacia-drenagem-funil',
        nome: 'Bacia Coletora + Funil + Copo Medidor',
        medidaOuDetalhe: 'Drenar óleo velho e reabastecer com o volume de desmontagem (1,2 L nas 125/150/160/190)',
        obrigatoria: true,
      },
    ],
    insumos: [
      'Junta nova da tampa lateral direita da embreagem (ou verificar se a junta original metálica emborrachada está perfeita)',
      'Junta nova da tampinha do filtro centrífugo (obrigatório verificar vedação pois por ali passa a pressão de óleo para a biela!)',
      'Óleo novo na especificação da Ficha Técnica (atenção: ao abrir a tampa direita, o volume sobe de 1,0 L para cerca de 1,1 a 1,2 L — conferir na vareta)',
      'Desengraxante / querosene, espátula plástica/madeira e pano sem fiapos',
    ],
    passoAPasso: [
      'Drene totalmente o óleo do motor pelo bujão inferior (12 mm). Solte o cabo de embreagem, o pedal de partida (se houver) e afaste o estribo/pedal de freio direito.',
      'Solte os parafusos 8 mm da tampa direita do motor de forma cruzada (anotando a posição dos parafusos mais longos) e remova a tampa com cuidado.',
      'Com o alicate de bico, puxe a peneira (tela metálica retangular) localizada na galeria inferior direita da carcaça. Remova fiapos de junta, limalhas de embreagem e lave a tela até ficar 100% translúcida.',
      'No rotor do filtro centrífugo (preso à ponta direita do virabrequim), use a chave de impacto manual ou chave Phillips PH2 bem apoiada para soltar os 3 parafusos da tampinha externa.',
      'Retire a tampinha e observe a parede interna do rotor: toda a borra cinza/preta fica prensada pela força centrífuga formando um anel duro nas bordas. Raspe e remova 100% dessa massa com uma espátula e pano com solvente.',
      'Verifique se o pino central com mola na tampa direita (que injeta óleo no centro do virabrequim) está deslizando livremente.',
      'Monte a junta nova da tampinha do centrífugo, aperte os 3 parafusos com firmeza (12 N·m), reinsira a peneira metálica na posição correta e monte a tampa lateral direita com junta nova apertando os parafusos 8 mm em cruz (10 N·m).',
      'Reinstale o bujão inferior (arruela 12 mm), abasteça o óleo novo, funcione em marcha lenta por 2 minutos e confira o nível na vareta sem rosqueá-la.',
    ],
    dicasDeOuro: [
      'O óleo que lubrifica o pino da biela das motos Honda passa PELO CENTRO da tampa do filtro centrífugo: se a borra entupir o rotor ou se a junta da tampinha do centrífugo vazar pressão, o motor funde a biela em poucos quilômetros!',
      'Dê uma pancada seca com a chave de impacto manual nos 3 parafusos Phillips da tampa do centrífugo antes de girar: eles saem na hora sem espanar.',
    ],
    errosComuns: [
      'Usar excesso de silicone na junta da tampa direita: os filetes internos de silicone se soltam, entopem a peneira de óleo e travam o motor por falta de lubrificação.',
      'Montar a tampinha do filtro centrífugo sem a junta ou com o pino de passagem de óleo da tampa direita travado.',
    ],
    videos: [
      {
        youtubeId: 'dTKUzivxH9o',
        titulo: 'Limpeza do filtro centrífugo e peneira de óleo a cada 12.000 km',
        canal: 'Nicolas Engrenados',
        url: 'https://www.youtube.com/watch?v=dTKUzivxH9o',
      },
      {
        youtubeId: 'acEVx-Pn9wo',
        titulo: 'Limpeza importante do filtro centrífugo e filtro de tela',
        canal: 'Jurandi Motos',
        url: 'https://www.youtube.com/watch?v=acEVx-Pn9wo',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 6. Troca do Retentor e Fluido da Bengala
  // -------------------------------------------------------------------------
  {
    id: 'troca-retentor-fluido-bengala',
    titulo: 'Troca do Retentor e Fluido da Bengala',
    resumo:
      'Desmontagem dos tubos da suspensão dianteira, substituição de retentores e guarda-pós, limpeza interna e dosagem exata em ml por canela.',
    categoria: 'suspensao',
    dificuldade: 'Intermediario',
    tempoEstimado: '60 – 90 min',
    marcasAplicaveis: ['Honda', 'Yamaha', 'Suzuki'],
    tagsAplicacao: ['geral'],
    ferramentasExatas: [
      {
        ferramentaId: 'jogo-combinadas-8-24',
        nome: 'Chaves / Soquetes 12, 14, 17, 19 e 22 mm',
        medidaOuDetalhe: 'Soltar roda dianteira, pinça, para-lama, mesas inferior/superior e tampão da bengala',
        obrigatoria: true,
      },
      {
        ferramentaId: 'jogo-allen-4-8',
        nome: 'Chave Allen 6 mm ou 8 mm Longa',
        medidaOuDetalhe: 'Parafuso Allen inferior da flauta (no fundo da canela, sob o eixo)',
        obrigatoria: true,
      },
      {
        ferramentaId: 'bacia-drenagem-funil',
        nome: 'Proveta / Copo Medidor Graduado em ml',
        medidaOuDetalhe: 'Dosar o volume exato em ml por canela indicado no banner da Ficha Técnica',
        obrigatoria: true,
      },
      {
        ferramentaId: 'extrator-bucha-batedor-retentor',
        nome: 'Batedor de Retentor (ou Retentor Antigo como Calço)',
        medidaOuDetalhe: 'Assentar o retentor novo no alojamento da canela sem marcar o tubo cromado',
        obrigatoria: false,
      },
    ],
    insumos: [
      'Par de retentores de bengala novos (preferir originais ou NOK/Corteco de mola dupla) + Guarda-pós',
      'Fluido de suspensão especificado na Ficha Técnica (Fluido ATF ou Fork Oil 10W) — conferir ml exatos por canela',
      'Arruela de cobre nova para o parafuso Allen inferior da canela (se estiver amassada)',
      'Querosene / desengraxante para lavar a borra preta acumulada no fundo da canela',
    ],
    passoAPasso: [
      'DICA ANTES DE DESMONTAR: com a bengala ainda presa na mesa inferior, afrouxe apenas 1/2 volta o parafuso superior da mesa e já destrave o tampão superior da bengala (17 mm, 22 mm ou Allen) e o parafuso Allen inferior no pé da canela (6 ou 8 mm com a mola ainda fazendo pressão interna!).',
      'Levante a frente da moto, retire a pinça de freio (12 mm), a roda dianteira (17/19 mm) e o para-lama dianteiro.',
      'Solte os parafusos das mesas superior e inferior e puxe o cilindro completo para baixo.',
      'Abra o tampão superior com cuidado (a mola está sob leve pressão), retire o espaçador, a arruela e a mola, e vire a bengala na bacia bombeando o tubo cromado para esgotar todo o óleo velho.',
      'Remova o parafuso Allen inferior (6 ou 8 mm), retire a flauta interna, remova o guarda-pó e a trava de arame interna, e saque o retentor velho (protegendo a borda da canela com uma chapa ou pano grosso se usar alavanca).',
      'Lave todas as peças internas e inspecione o tubo cromado: se houver riscos profundos ou pontos de ferrugem na área de curso, polir com lixa d’água 1200/2000 ou substituir o tubo para não rasgar o retentor novo.',
      'Envolva o topo do tubo cromado com um saquinho plástico fino untado em óleo (para não cortar o lábio do retentor na borda viva), deslize o retentor novo com a inscrição/código voltada para CIMA e bata uniformemente usando o batedor ou o retentor antigo cortado ao meio.',
      'Instale a trava de aço no sulco, o guarda-pó, aperte o parafuso Allen inferior com a flauta e adicione no copo medidor o VOLUME EXATO EM ML da Ficha Técnica desta geração. Bombeie o tubo 10 vezes para sangrar o ar, coloque a mola (elos mais fechados para baixo) e feche o tampão.',
    ],
    dicasDeOuro: [
      'Soltar o parafuso Allen inferior da flauta ANTES de tirar a mola e o tampão superior evita que a flauta gire em falso lá dentro sem precisar de ferramenta especial longa.',
      'Nunca coloque "meio litro dividido no olho": 20 ml a mais deixam a frente dura como pedra e estouram o retentor novo; 20 ml a menos fazem a suspensão bater seco no fim de curso.',
    ],
    errosComuns: [
      'Montar o retentor de cabeça para baixo (o lado com as inscrições e número da medida fica sempre virado para cima, visível ao olhar de cima).',
      'Esquecer de recolocar a trava de arame de aço acima do retentor antes de encaixar o guarda-pó.',
    ],
    videos: [
      {
        youtubeId: 'NV77cWnjLwE',
        titulo: 'Passo a passo para realizar a troca do retentor da bengala',
        canal: 'Nicolas Engrenados',
        url: 'https://www.youtube.com/watch?v=NV77cWnjLwE',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 7. Troca de Pastilhas de Freio a Disco + Limpeza da Pinça
  // -------------------------------------------------------------------------
  {
    id: 'troca-pastilhas-freio-disco',
    titulo: 'Troca de Pastilhas de Freio a Disco + Limpeza da Pinça',
    resumo:
      'Substituição das pastilhas com lavagem prévia dos êmbolos da pinça, lubrificação dos pinos deslizantes com graxa de silicone e assentamento no disco.',
    categoria: 'freios',
    dificuldade: 'Basico',
    tempoEstimado: '20 – 30 min',
    marcasAplicaveis: ['Honda', 'Yamaha', 'Suzuki'],
    tagsAplicacao: ['disco'],
    ferramentasExatas: [
      {
        ferramentaId: 'jogo-allen-4-8',
        nome: 'Chave Allen 5 mm (ou Fenda + Allen conforme pinça)',
        medidaOuDetalhe: 'Soltar o pino guia que prende as pastilhas na pinça',
        obrigatoria: true,
      },
      {
        ferramentaId: 'chaves-l-canhao-8-10-12',
        nome: 'Chave L 12 mm (ou 10 mm / 14 mm)',
        medidaOuDetalhe: 'Remover os 2 parafusos de fixação da pinça na canela da bengala',
        obrigatoria: true,
      },
      {
        ferramentaId: 'insumos-lixas-limpeza-ar',
        nome: 'Lixa 180 + Escova Macia + Pano',
        medidaOuDetalhe: 'Quebrar vitrificação da pastilha e lavar os pistões antes de recuá-los',
        obrigatoria: true,
      },
    ],
    insumos: [
      'Jogo de pastilhas de freio novo compatível com a pinça (atenção especial se a moto for CBS com pinça de 3 êmbolos vs convencional de 2 êmbolos)',
      'Água com detergente neutro ou spray limpa-freios + escova de dentes/pincel macio',
      'Lixa grão 180 em superfície plana',
      'Graxa de silicone (ou graxa específica para coifas de borracha — NUNCA usar graxa comum de petróleo nos pinos da pinça pois incha as borrachas e trava o freio!)',
    ],
    passoAPasso: [
      'Com a pinça ainda montada na bengala, afrouxe 1/2 volta o pino guia das pastilhas (Allen 5 mm — em algumas pinças NISSIN antigas há um bujãozinho de fenda cobrindo o pino Allen).',
      'Remova os dois parafusos de fixação da pinça na canela (L 12 mm), retire a pinça do disco e puxe o pino guia para remover as pastilhas gastas.',
      'PASSO CRÍTICO DE OFICINA: com os pistões (êmbolos) ainda avançados para fora, lave toda a crosta de pó de freio ao redor dos pistões com água e detergente neutro (ou limpa-freios) e escova macia, secando bem.',
      'Só depois que os pistões estiverem brilhando e limpos, empurre-os suavemente para dentro com os polegares (ou usando a pastilha velha como apoio).',
      'Retire o suporte flutuante da pinça, limpe os dois pinos deslizantes, verifique se as coifas de borracha não estão rasgadas e aplique graxa de SILICONE nos pinos para que a pinça flutue livremente.',
      'Passe as pastilhas novas levemente sobre a lixa 180 apoiada em bancada plana para remover a resina superficial, posicione a chapinha mola anti-ruído no fundo da pinça e encaixe as pastilhas novas.',
      'Passe o pino guia (limpo e lixado se tiver degrau), monte a pinça no disco, aplique trava-rosca azul nos dois parafusos de fixação (torque 30 N·m) e aperte o pino guia.',
      'ANTES DE SAIR COM A MOTO: bombeie o manete/pedal de freio de 5 a 10 vezes até os pistões encostarem nas pastilhas novas e o manete ficar firme!',
    ],
    dicasDeOuro: [
      'Nunca empurre o pistão sujo para dentro da pinça: a crosta de ferro e areia entra rasgando o retentor quadrado interno e faz a pinça travar a roda ou vazar fluido.',
      'Nos pinos deslizantes com coifa de borracha, use exclusivamente graxa de silicone ou sintética para freios — graxa de rolamento comum dilata a borracha e engripa o suporte flutuante, gastando uma pastilha torta.',
    ],
    errosComuns: [
      'Esquecer de bombear o manete de freio ao terminar o serviço: na primeira esquina o piloto aperta o manete e ele vai até o punho sem frear.',
      'Entortar ou montar invertida a chapinha mola de inox no fundo da pinça, fazendo as pastilhas baterem em ruas de paralelepípedo.',
    ],
    videos: [
      {
        youtubeId: 'ddfRY5H0juY',
        titulo: 'Trocar a pastilha de freio não é só preço, é segurança',
        canal: 'Nicolas Engrenados',
        url: 'https://www.youtube.com/watch?v=ddfRY5H0juY',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 8. Limpeza de Bico Injetor e Corpo de Borboleta (TBI)
  // -------------------------------------------------------------------------
  {
    id: 'limpeza-bico-injetor-tbi',
    titulo: 'Limpeza de Bico Injetor e Corpo de Borboleta (TBI)',
    resumo:
      'Descarbonização técnica do corpo de aceleração, galeria de marcha lenta (IACV/parafuso de ar) e bico injetor, seguida de reset do ECM/TPS.',
    categoria: 'injecao',
    dificuldade: 'Intermediario',
    tempoEstimado: '40 – 60 min',
    marcasAplicaveis: ['Honda', 'Yamaha', 'Suzuki'],
    tagsAplicacao: ['injecao'],
    ferramentasExatas: [
      {
        ferramentaId: 'chaves-l-canhao-8-10-12',
        nome: 'Chave L 8 mm e 10 mm',
        medidaOuDetalhe: 'Soltar tanque/carenagens, coletor de admissão e suporte do bico injetor',
        obrigatoria: true,
      },
      {
        ferramentaId: 'chaves-fenda-phillips-vela',
        nome: 'Chave Phillips PH2',
        medidaOuDetalhe: 'Abraçadeira do duto do filtro de ar e cabos do acelerador',
        obrigatoria: true,
      },
      {
        ferramentaId: 'jogo-allen-4-8',
        nome: 'Chave Allen 5 mm / Torx',
        medidaOuDetalhe: 'Fixação do corpo do TBI no coletor (conforme modelo)',
        obrigatoria: true,
      },
      {
        ferramentaId: 'insumos-quimicos-bancada',
        nome: 'Descarbonizante CAR 80 + Limpa-Contatos',
        medidaOuDetalhe: 'Remover goma de combustível da borboleta e limpar conectores dos sensores',
        obrigatoria: true,
      },
    ],
    insumos: [
      'Spray descarbonizante para TBI (ex.: CAR 80 ou similar)',
      'Limpa-contatos elétrico spray para os conectores da unidade de sensores (MAP/IAT/TPS)',
      'Anel O-ring de vedação do bico injetor e do coletor (substituir se estiver achatado ou ressecado)',
      'Pano microfibra limpo e cotonetes',
    ],
    passoAPasso: [
      'Com a chave de ignição DESLIGADA, desconecte a mangueira de engate rápido de combustível (envolva com um pano para absorver a pressão residual da linha) e solte os conectores elétricos do bico e da unidade de sensores.',
      'Solte a abraçadeira da caixa de ar (Phillips PH2), os cabos do acelerador (10/12 mm) e os parafusos que prendem o TBI ao coletor de admissão (L 8/10 mm ou Allen 5 mm), retirando o corpo de borboleta para a bancada.',
      'Remova o bico injetor do alojamento com cuidado para não morder os dois anéis O-ring de vedação.',
      'Evite jatear descarbonizante agressivo diretamente dentro do furo da unidade de sensores (MAP/IAT/TPS): segure o TBI com a unidade de sensores voltada para CIMA para que o líquido sujo escorra para fora e não penetre no sensor MAP.',
      'Aplique o descarbonizante na borboleta de aceleração, nas bordas do venturi e no canal de passagem de ar da marcha lenta (IACV ou parafuso de ar), removendo toda a crosta preta de carvão com pincel macio e pano.',
      'Limpe os microfuros da ponta do bico injetor (ou execute retrolavagem e teste de equalização/leque na máquina de ultrassom, verificando se não goteja estanque).',
      'Lubrifique levemente os O-rings do bico com uma gota de óleo novo ou vaselina para encaixar sem cortar, remonte o TBI no coletor e regule a folga livre do cabo do acelerador (2 a 6 mm).',
      'Execute o procedimento de RESET do TPS / Inicialização do ECM (nas Honda PGM-FI: jumper no conector DLC de 4 pinos + sequência do sensor EOT/acelerador) e deixe a moto funcionar em marcha lenta por 10 minutos sem tocar no acelerador para aprendizado.',
    ],
    dicasDeOuro: [
      'Sempre segure o TBI de modo que o descarbonizante NUNCA escorra para dentro do orifício do sensor MAP (unidade de sensores Honda/Yamaha): o solvente do CAR 80 ataca a membrana de silicone do MAP e gera erro na injeção.',
      'Em motos Flex (Honda Mix/FlexOne e Yamaha BlueFlex), fazer o reset do ECM após limpar o TBI é o que faz a marcha lenta cravar em 1.400 rpm redondinha.',
    ],
    errosComuns: [
      'Destacar ou mexer nos parafusos Torx lacrados com tinta da unidade de sensores (TPS) ou no batente lacrado da borboleta.',
      'Montar o bico injetor a seco mordendo o O-ring superior, o que causa vazamento perigoso de gasolina sob pressão de 3 bar sobre o motor quente.',
    ],
    videos: [
      {
        youtubeId: 'bckBjaXXD58',
        titulo: 'Limpeza correta do bico injetor muda tudo no funcionamento da moto',
        canal: 'Nicolas Engrenados',
        url: 'https://www.youtube.com/watch?v=bckBjaXXD58',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 9. Troca da Caixa de Direção (Cônica ou Esferas)
  // -------------------------------------------------------------------------
  {
    id: 'troca-caixa-direcao',
    titulo: 'Troca da Caixa de Direção (Cônica ou Esferas)',
    resumo:
      'Substituição completa das pistas e colares de rolamento da coluna de direção para eliminar calos centrais e folgas em frenagem.',
    categoria: 'chassi',
    dificuldade: 'Avancado',
    tempoEstimado: '75 – 110 min',
    marcasAplicaveis: ['Honda', 'Yamaha', 'Suzuki'],
    tagsAplicacao: ['geral'],
    ferramentasExatas: [
      {
        ferramentaId: 'jogo-catraca-soquetes',
        nome: 'Soquete / Chave 22 mm, 24 mm ou 30 mm',
        medidaOuDetalhe: 'Soltar a porca central cega da mesa superior da coluna de direção',
        obrigatoria: true,
      },
      {
        ferramentaId: 'chave-gancho-caixa-direcao',
        nome: 'Chave Gancho (Meia-Lua) + Punção Saca-Pistas',
        medidaOuDetalhe: 'Extrair as pistas internas do canote do chassi e regular a porca castelo serrilhada',
        obrigatoria: true,
      },
      {
        ferramentaId: 'chaves-l-canhao-8-10-12',
        nome: 'Chave L 10 mm e 12 mm + Allen 6 mm',
        medidaOuDetalhe: 'Soltar guidão, bloco óptico/painel, pinça, roda e mesas',
        obrigatoria: true,
      },
    ],
    insumos: [
      'Kit caixa de direção novo (de esferas original ou de roletes cônicos) + guarda-pó inferior novo',
      'Graxa azul de rolamento de alta resistência à água (lubrificar fartamente os colares/roletes)',
    ],
    passoAPasso: [
      'Apoie o motor da moto de forma firme para deixar a frente suspensa. Remova roda dianteira, para-lama, pinça de freio e solte os dois tubos da bengala.',
      'Solte os 4 parafusos do cavalete do guidão (L 10/12 mm ou Allen 6 mm) e afaste o guidão protegendo o tanque com um pano grosso.',
      'Solte a porca central da mesa superior (22, 24 ou 30 mm), retire a mesa superior e, segurando a mesa inferior por baixo, desenrosque a porca castelo serrilhada com a chave gancho para descer a coluna.',
      'Com um punção longo de aço inserido por dentro do canote do chassi, bata alternadamente em cruz (lados opostos a cada batida) para extrair as duas pistas antigas do quadro sem ovalizar o canote.',
      'Na árvore da mesa inferior, retire a pista cônica antiga (usando saca-pista ou enfraquecendo-a com cuidado sem ferir o eixo), coloque o guarda-pó novo primeiro e prense a pista inferior nova até assentar 100% na base (use a pista velha invertida como calço de batida).',
      'Assente as duas pistas novas no canote do chassi batendo perfeitamente alinhadas (usando as pistas antigas como batedor ou prensa de fuso) até o som mudar para metálico firme.',
      'Aplique bastante graxa azul nas pistas superior e inferior, posicione os colares de esferas (ou roletes cônicos) no sentido correto, suba a mesa inferior e rosqueie a porca castelo.',
      'AJUSTE FINO: aperte a porca castelo com a chave gancho para assentar as pistas, volte 1/8 a 1/4 de volta e reencoste até que a direção gire de batente a batente livremente pelo próprio peso, mas SEM qualquer folga ao puxar as bengalas para frente/trás.',
    ],
    dicasDeOuro: [
      'Sempre use a pista velha (com um corte lateral feito na esmerilhadeira para não ficar presa) como batedor para assentar a pista nova até o fundo do canote sem marcar a pista onde correm as esferas.',
      'Ao apertar a porca central final da mesa superior (74 N·m), a tendência é a caixa ficar um pouco mais justa: confira novamente a leveza do guidão e a ausência de folga com a roda montada.',
    ],
    errosComuns: [
      'Esquecer de colocar o guarda-pó de borracha na mesa inferior ANTES de prensar a pista inferior na coluna.',
      'Deixar a pista do chassi 1 mm fora do assentamento final: na primeira freada forte a pista desce até o fundo e a direção fica totalmente bamba.',
    ],
    videos: [
      {
        youtubeId: '8Bcfsgs0DoI',
        titulo: 'Como trocar caixa de direção passo a passo — macetes de oficina',
        canal: 'Jurandi Motos',
        url: 'https://www.youtube.com/watch?v=8Bcfsgs0DoI',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 10. Troca de Óleo + Filtro de Papel (Yamaha 150 / Suzuki 125)
  // -------------------------------------------------------------------------
  {
    id: 'troca-oleo-filtro-papel',
    titulo: 'Troca de Óleo + Filtro de Papel (Yamaha 150 / Suzuki 125)',
    resumo:
      'Substituição do óleo lubrificante e do elemento filtrante em papel com conferência da mola de pressão, O-ring da tampa e sentido da válvula bypass.',
    categoria: 'motor',
    dificuldade: 'Basico',
    tempoEstimado: '20 – 30 min',
    marcasAplicaveis: ['Yamaha', 'Suzuki'],
    tagsAplicacao: ['filtro_papel'],
    ferramentasExatas: [
      {
        ferramentaId: 'jogo-combinadas-8-24',
        nome: 'Chave Combinada / Soquete 12 mm ou 17 mm',
        medidaOuDetalhe: 'Soltar o bujão de drenagem inferior do cárter (12 mm na Yamaha 150 / 17 mm na Suzuki 125)',
        obrigatoria: true,
      },
      {
        ferramentaId: 'chaves-l-canhao-8-10-12',
        nome: 'Chave L 8 mm (ou 10 mm)',
        medidaOuDetalhe: 'Soltar as 3 porcas/parafusos da tampinha redonda do filtro de óleo na lateral direita',
        obrigatoria: true,
      },
      {
        ferramentaId: 'bacia-drenagem-funil',
        nome: 'Bacia Coletora + Funil + Copo Graduado',
        medidaOuDetalhe: 'Medir o volume exato COM filtro de óleo (ex.: 1,05 L na Yamaha 150 / 0,95 L na Suzuki Yes/Intruder)',
        obrigatoria: true,
      },
    ],
    insumos: [
      'Óleo na viscosidade e volume exatos da Ficha Técnica (usando a medida "Com troca de filtro")',
      'Elemento de filtro de óleo em papel novo (código específico Yamaha 150 ou Suzuki 125 — não são intercambiáveis!)',
      'Anel O-ring grande da tampa do filtro + O-ring pequeno do fundo do alojamento (muito comum nas Suzuki)',
      'Arruela de vedação do bujão de óleo',
    ],
    passoAPasso: [
      'Funcione o motor por 2 a 3 minutos para amornar o óleo (facilita o escoamento), desligue e remova a vareta/tampa de abastecimento superior.',
      'Posicione a bacia coletora, solte o bujão inferior do cárter (12 mm nas Yamaha Factor/Fazer/Crosser 150 ou 17 mm nas Suzuki Yes/Intruder) e deixe escorrer completamente.',
      'Na tampa lateral direita do motor, solte de forma cruzada os 3 parafusos/porcas (L 8 mm) da tampinha redonda do filtro de óleo, segurando a tampa pois há uma mola interna fazendo pressão.',
      'ATENÇÃO AO DESMONTAR: observe a posição da MOLA na tampa externa e, nas motos Suzuki (Yes 125 / Intruder 125), verifique se o pequeno O-ring interno de borracha não ficou grudado no fundo do filtro velho!',
      'Limpe o alojamento interno do filtro com um pano limpo (sem fiapos). Umedeça as borrachas do filtro novo com óleo limpo e insira o filtro novo no sentido correto (o furo com vedação de borracha encaixa no pino de passagem ao fundo do bloco, e o lado fechado metálico com válvula recebe a mola da tampa).',
      'Instale um anel O-ring novo na tampa do filtro, posicione a mola centralizada e aperte os 3 parafusos 8 mm de forma cruzada e suave (apenas 7 a 10 N·m — a rosca no alumínio é M6 e espana fácil se exagerar!).',
      'Reinstale o bujão de drenagem inferior (20 N·m na Yamaha / 21 N·m na Suzuki) e abasteça com o volume exato para troca COM filtro indicado no banner da moto.',
      'Ligue o motor em marcha lenta por 2 minutos, desligue, aguarde 2 minutos para o óleo assentar e confira o nível na vareta ou no visor de vidro lateral (com a moto nivelada na vertical).',
    ],
    dicasDeOuro: [
      'Nas Suzuki Intruder 125 e Yes 125, existe um O-ring pequeno no pino do fundo da câmara do filtro: 50% das pessoas jogam esse O-ring fora grudado no filtro velho. Sem ele, o óleo passa direto sem filtrar e a pressão do cabeçote cai!',
      'Nunca aperte os 3 parafusos 8 mm da tampa do filtro com cabo de força: quem faz a vedação é o anel O-ring de borracha, não o aperto excessivo.',
    ],
    errosComuns: [
      'Montar o filtro de papel ao contrário (tampando a passagem de óleo para o cabeçote e fundindo comando e balancins em menos de 15 minutos!).',
      'Esquecer de recolocar a mola atrás da tampa do filtro, permitindo que o filtro recue e o óleo circule sem pressão.',
    ],
    videos: [
      {
        youtubeId: 'dTKUzivxH9o',
        titulo: 'A importância da filtragem correta de óleo na vida útil do motor',
        canal: 'Nicolas Engrenados',
        url: 'https://www.youtube.com/watch?v=dTKUzivxH9o',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 12. Sangria de Freio Hidráulico (Disco Padrão, CBS e ABS)
  // -------------------------------------------------------------------------
  {
    id: 'sangria-freio-hidraulico',
    titulo: 'Sangria de Freio Hidráulico (Disco Padrão, CBS e ABS)',
    resumo:
      'Substituição completa do fluido DOT 4 e remoção de ar do sistema hidráulico, incluindo a sequência dupla dos 2 sangradores do sistema Honda CBS.',
    categoria: 'freios',
    dificuldade: 'Intermediario',
    tempoEstimado: '25 – 45 min',
    marcasAplicaveis: ['Honda', 'Yamaha', 'Suzuki'],
    tagsAplicacao: ['disco'],
    ferramentasExatas: [
      {
        ferramentaId: 'jogo-combinadas-8-24',
        nome: 'Chave Combinada 8 mm (Lado Estrela)',
        medidaOuDetalhe: 'Abrir e fechar o bico sangrador da pinça sem arredondar o sextavado',
        obrigatoria: true,
      },
      {
        ferramentaId: 'chaves-fenda-phillips-vela',
        nome: 'Chave Phillips PH2 de Precisão',
        medidaOuDetalhe: 'Soltar os 2 parafusos chanfrados da tampa do reservatório (burrinho de freio)',
        obrigatoria: true,
      },
      {
        ferramentaId: 'kit-sangria-freio',
        nome: 'Mangueira Transparente de Silicone + Seringa 60 ml',
        medidaOuDetalhe: 'Conduzir o fluido velho sem respingar e fazer sangria reversa ou por sucção',
        obrigatoria: true,
      },
    ],
    insumos: [
      'Frasco lacrado de Fluido de Freio DOT 4 (ou DOT 3/DOT 4 conforme especificado na tampa do reservatório)',
      'Pano úmido com água cobrindo o tanque e o painel (fluido de freio arranca a tinta em segundos se pingar!)',
    ],
    passoAPasso: [
      'Gire o guidão para deixar o reservatório (burrinho) nivelado na horizontal e cubra o tanque, carenagens e para-lama com um pano úmido.',
      'Com uma chave Phillips PH2 perfeitamente encaixada, solte os 2 parafusos da tampa do reservatório, retire a placa plástica e o diafragma de borracha (seque o diafragma e nunca o lave com gasolina).',
      'Com a seringa, aspire o fluido velho e escuro do fundo do reservatório, limpe a borra com papel absorvente e complete até a borda com fluido DOT 4 novo e cristalino.',
      'Encaixe o lado ESTRELA da chave 8 mm no bico sangrador da pinça e conecte a mangueira transparente de silicone levando até o frasco coletor.',
      'SEQUÊNCIA DE SANGRIA: bombeie o manete 3 a 4 vezes devagar e SEGURE PRESSIONADO -> abra o sangrador 8 mm 1/4 de volta (o fluido velho e as bolhas saem na mangueira e o manete encosta no punho) -> FECHE o sangrador 8 mm ANTES de soltar o manete -> solte o manete devagar.',
      'Repita o ciclo monitorando constantemente o reservatório superior para NUNCA deixar o nível baixar até o fundo (se entrar ar em cima, terá que recomeçar toda a sangria) até sair fluido limpo e zero bolhas na mangueira.',
      'REGRA ESPECIAL HONDA CBS (CG 160 / Bros 160 / Biz 125 EX 2018+): a pinça dianteira possui 3 pistões e DOIS sangradores independentes! 1º) Sangre o sangrador do circuito do manete (pistões externos) usando o reservatório do guidão; 2º) Sangre o sangrador central (acionado pelo pedal traseiro) bombeando o PEDAL DE FREIO TRASEIRO e completando o reservatório do cilindro mestre do CBS.',
      'Complete o fluido exatamente até a marca "UPPER" (com pastilhas em bom estado), remonte o diafragma de borracha recolhido, a tampa e lave qualquer respingo na pinça com água corrente.',
    ],
    dicasDeOuro: [
      'Se você trocou o flexível (mangueira) ou desmontou o cilindro mestre e o sistema estiver totalmente seco (não dá pressão ao bombear), use a SERINGA de 60 ml cheia de DOT 4 pelo sangrador da pinça injetando de baixo para cima (sangria reversa): o ar sobe naturalmente e o freio pega pressão em 10 segundos!',
      'Tenha sempre uma garrafa de água ao lado da bancada: a água neutraliza instantaneamente o fluido DOT 4 caso caia alguma gota na pintura.',
    ],
    errosComuns: [
      'Soltar o manete de freio com o sangrador 8 mm ainda aberto, puxando o ar da mangueira de volta para dentro da pinça.',
      'Nas motos Honda CBS, sangrar apenas o manete dianteiro e esquecer de sangrar o segundo sangrador da pinça dianteira que vem do cilindro mestre acionado pelo pedal traseiro.',
    ],
    videos: [
      {
        youtubeId: 'ddfRY5H0juY',
        titulo: 'Manutenção completa e segurança no sistema de freio a disco',
        canal: 'Nicolas Engrenados',
        url: 'https://www.youtube.com/watch?v=ddfRY5H0juY',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Lógica de compatibilidade automática com a Moto + Geração selecionada
// ---------------------------------------------------------------------------

export function verificarCompatibilidadeProcedimento(
  proc: ProcedimentoOficina,
  moto: MotoSelecionada,
): { compativel: boolean; motivo: string } {
  const { marca, modelo, geracao } = moto;
  const f = geracao.fichaTecnica;

  if (!proc.marcasAplicaveis.includes(marca)) {
    return {
      compativel: false,
      motivo: `Específico para ${proc.marcasAplicaveis.join(' / ')}`,
    };
  }

  for (const tag of proc.tagsAplicacao) {
    if (tag === 'geral') {
      return {
        compativel: true,
        motivo: `Aplicável à ${marca} ${modelo.nome} (${geracao.anosLabel})`,
      };
    }

    if (tag === 'tambor') {
      const temTambor = f.freios.traseiro === 'tambor' || f.freios.dianteiro === 'tambor';
      return temTambor
        ? { compativel: true, motivo: 'Possui freio a tambor' }
        : { compativel: false, motivo: 'Esta geração utiliza freio a disco nas duas rodas' };
    }

    if (tag === 'disco') {
      const temDisco = f.freios.dianteiro === 'disco' || f.freios.traseiro === 'disco';
      return temDisco
        ? {
            compativel: true,
            motivo: `Freio a disco (${f.freios.sistema === 'convencional' ? 'Padrão' : f.freios.sistema})`,
          }
        : { compativel: false, motivo: 'Esta geração utiliza freios a tambor mecânico' };
    }

    if (tag === 'corrente') {
      const isCorrente =
        f.transmissaoFinal?.tipo === 'corrente' ||
        (f.cambio.tipo !== 'cvt' && modelo.categoria !== 'scooter');
      return isCorrente
        ? {
            compativel: true,
            motivo: f.transmissaoFinal?.corrente
              ? `Transmissão por corrente (${f.transmissaoFinal.corrente})`
              : 'Transmissão final por corrente',
          }
        : { compativel: false, motivo: 'Scooter com transmissão automática CVT por correia' };
    }

    if (tag === 'cvt') {
      const isCvt =
        f.cambio.tipo === 'cvt' ||
        f.transmissaoFinal?.tipo === 'correia' ||
        modelo.categoria === 'scooter';
      return isCvt
        ? { compativel: true, motivo: 'Transmissão CVT por correia' }
        : { compativel: false, motivo: 'Específico para transmissão CVT' };
    }

    if (tag === 'centrifugo') {
      const textoFiltro = (f.motorDetalhes?.filtroOleo ?? '').toLowerCase();
      const temCentrifugo =
        marca === 'Honda' &&
        modelo.categoria !== 'scooter' &&
        (textoFiltro.includes('centrífugo') || textoFiltro.includes('centrifugo') || !textoFiltro);
      return temCentrifugo
        ? { compativel: true, motivo: 'Motor Honda com filtro centrífugo + peneira metálica' }
        : {
            compativel: false,
            motivo: 'Utiliza filtro de óleo em elemento de papel',
          };
    }

    if (tag === 'filtro_papel') {
      const textoFiltro = (f.motorDetalhes?.filtroOleo ?? '').toLowerCase();
      const temPapel =
        Boolean(f.fluidos?.oleoMotor?.capacidadeTrocaComFiltroL) ||
        textoFiltro.includes('papel') ||
        textoFiltro.includes('elemento');
      return temPapel
        ? { compativel: true, motivo: 'Motor com filtro de óleo em elemento de papel substituível' }
        : { compativel: false, motivo: 'Este motor utiliza filtro centrífugo / tela metálica' };
    }

    if (tag === 'injecao') {
      return f.alimentacao === 'injecao'
        ? { compativel: true, motivo: 'Alimentação por Injeção Eletrônica (TBI + Bico Injetor)' }
        : { compativel: false, motivo: 'Esta geração é carburada (não possui bico injetor/TBI)' };
    }

    if (tag === 'carburada') {
      return f.alimentacao === 'carburador'
        ? { compativel: true, motivo: 'Alimentação por Carburador' }
        : { compativel: false, motivo: 'Esta geração utiliza Injeção Eletrônica' };
    }
  }

  return { compativel: true, motivo: 'Compatível' };
}
