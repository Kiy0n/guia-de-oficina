import type { ArmadilhaOficinaId, NivelDificuldade } from '@/data/didaticaOficina';
import type { Marca } from '@/types/moto';

export interface CodigoFalhaFI {
  codigo: string;
  marca: Marca;
  piscadasLabel: string;
  componente: string;
  sintomaTipico: string;
  oQueTestarPrimeiro: string;
  testeMultimetro: string;
}

export interface GuiaLeituraFI {
  marca: Marca;
  sistemaNome: string;
  regraPiscadas: string;
  comoLer: string[];
  comoResetar: string[];
}

export interface TesteMultimetroBancada {
  id: string;
  titulo: string;
  subtitulo: string;
  dificuldade: NivelDificuldade;
  escalaMultimetro: string;
  valorNormal: string;
  valorDefeito: string;
  pontasDeProva: string;
  passoAPasso: string[];
  dicaBancada: string;
  armadilhaId?: ArmadilhaOficinaId;
  /** Quando verdadeiro, o teste se aplica exclusivamente a motos com injeção eletrônica. */
  apenasInjecao?: boolean;
}

export interface CorFioFabricante {
  nomeCor: string;
  codigoSigla: string;
  hexPrimaria: string;
  hexListra?: string;
  detalhe?: string;
}

export interface LinhaCorChicote {
  id: string;
  funcaoCircuito: string;
  ondeEncontrar: string;
  Honda: CorFioFabricante;
  Yamaha: CorFioFabricante;
  Suzuki: CorFioFabricante;
}

// ===========================================================================
// 1. Guias de Leitura e Reset por Marca + Códigos de Falha (MIL / FI)
// ===========================================================================

export const GUIAS_LEITURA_FI: Record<Marca, GuiaLeituraFI> = {
  Honda: {
    marca: 'Honda',
    sistemaNome: 'Honda PGM-FI (Conector DLC 4 Pinos)',
    regraPiscadas:
      'Piscada LONGA (1,3 s) = 10 (dezena) · Piscada CURTA (0,3 s) = 1 (unidade). Ex.: 1 longa + 2 curtas = Código 12 (Bico Injetor).',
    comoLer: [
      'Com a moto parada e o cavalete lateral baixado, se houver falha ativa a luz MIL (injeção) já pisca o código diretamente no painel.',
      'Para ler o histórico de falhas gravadas na memória: desligue a chave, localize o conector DLC vermelho/azul de 4 pinos (sob o banco ou carenagem lateral), faça um jumper entre os fios Verde (Terra) e Marrom/Azul (Linha K/SCS) e vire a chave para ON (sem dar partida).',
      'Conte as piscadas da luz da injeção: cada piscada longa vale 10 e cada piscada curta vale 1.',
    ],
    comoResetar: [
      '1) Apagar Memória de Códigos (DTC): com o jumper conectado no DLC, ligue a chave de ignição. Remova o jumper do DLC e reconecte-o dentro de 5 segundos: a luz MIL começará a piscar rápido confirmando que a memória foi limpa.',
      '2) Reset de TPS / Mapa de Combustível (obrigatório após limpar TBI ou trocar álcool ↔ gasolina): com o jumper no DLC, desconecte o plug de 2 fios do sensor de temperatura do óleo (EOT) no cilindro e faça um jumper nos 2 terminais do chicote do EOT. Ligue a chave, aguarde a luz MIL piscar e remova o jumper do EOT em até 5 s (a luz piscará rápido confirmando Nível 1).',
    ],
  },
  Yamaha: {
    marca: 'Yamaha',
    sistemaNome: 'Yamaha FI / BlueFlex (Painel MIL)',
    regraPiscadas:
      'Piscada LONGA (1,0 s) = 10 (dezena) · Piscada CURTA (0,5 s) = 1 (unidade) — ou número de 2 dígitos exibido diretamente no visor LCD.',
    comoLer: [
      'Ao girar a chave para ON, a luz amarela da injeção acende por ~2 a 3 segundos (autoteste) e apaga. Se permanecer acesa ou piscando, o módulo ECU detectou anomalia.',
      'Nos modelos com painel digital completo (Factor 150 / Fazer 125 / Fazer 150 / Crosser 150), o código de 2 dígitos (ex.: 12, 15, 37, 46) pode ser exibido no display LCD ou lido contando as piscadas longas (dezenas) e curtas (unidades).',
    ],
    comoResetar: [
      'Após corrigir o defeito elétrico/conector, a luz MIL apaga automaticamente ao funcionar o motor.',
      'Para aprendizado da válvula de marcha lenta (ISC): ligue a chave por 3 segundos, desligue por 3 segundos (a válvula ISC faz o ciclo de fim de curso) e dê a partida deixando aquecer em marcha lenta sem acelerar.',
    ],
  },
  Suzuki: {
    marca: 'Suzuki',
    sistemaNome: 'Suzuki 125 Carburada (Intruder 125 / Yes 125 — Ignição CDI)',
    regraPiscadas:
      'As Suzuki do catálogo (Intruder 125 e Yes 125 / EN125) são carburadas com ignição CDI — não possuem luz MIL nem códigos de falha FI.',
    comoLer: [
      'A linha Suzuki 125 do catálogo (Intruder 125 e Yes 125) utiliza carburador Mikuni e módulo CDI convencional, sem conector de diagnóstico eletrônico.',
      'Para falhas de ignição ou partida, utilize diretamente os testes de bancada no multímetro (bateria/carga, bobina de pulso, estator e bobina de ignição).',
    ],
    comoResetar: [
      'Não há memória de falhas eletrônicas (ECM) para resetar nos modelos Suzuki 125 carburados.',
    ],
  },
};

export const CODIGOS_FALHA_FI: readonly CodigoFalhaFI[] = [
  // -------------------------------------------------------------------------
  // HONDA PGM-FI
  // -------------------------------------------------------------------------
  {
    codigo: '1',
    marca: 'Honda',
    piscadasLabel: '1 piscada curta',
    componente: 'Sensor MAP (Pressão Absoluta do Coletor — Unidade de Sensores)',
    sintomaTipico: 'Marcha lenta irregular, consumo elevado e perda de potência em retomada.',
    oQueTestarPrimeiro:
      'Verificar se o conector de 5 pinos da Unidade de Sensores no TBI está mal encaixado, oxidado ou se caiu descarbonizante (CAR 80) dentro do orifício do MAP.',
    testeMultimetro:
      'DCV 20V: Alimentação do sensor entre 4,75V e 5,25V (fio Amarelo/Vermelho e Verde/Laranja). Sinal varia de ~1,0V a ~4,2V conforme vácuo.',
  },
  {
    codigo: '7',
    marca: 'Honda',
    piscadasLabel: '7 piscadas curtas',
    componente: 'Sensor EOT / ECT (Temperatura do Óleo / Motor)',
    sintomaTipico:
      'Dificuldade extrema na partida a frio (especialmente com etanol) ou mistura rica demais com motor quente.',
    oQueTestarPrimeiro:
      'Inspecionar o plug de 2 fios na base esquerda do cilindro (muito comum quebrar o fio rente ao conector por vibração ou ao lavar a moto).',
    testeMultimetro:
      'Escala 20 kΩ (sensor desconectado): a 20 °C deve medir ~2,5 a 2,8 kΩ; com motor quente (80 °C) cai para ~0,3 a 0,4 kΩ. Se der "OL" (aberto), sensor ou fio partido.',
  },
  {
    codigo: '8',
    marca: 'Honda',
    piscadasLabel: '8 piscadas curtas',
    componente: 'Sensor TPS (Posição da Borboleta de Aceleração)',
    sintomaTipico:
      'Moto engasga ao abrir o acelerador, dá "buraco" na saída ou não responde linearmente.',
    oQueTestarPrimeiro:
      'Conferir o conector da Unidade de Sensores no TBI e se os parafusos Torx lacrados não foram alterados.',
    testeMultimetro:
      'DCV 20V no fio de sinal do TPS: borboleta fechada ~0,45V a 0,55V; borboleta 100% aberta ~4,2V a 4,6V (subida contínua sem saltos ou quedas a zero).',
  },
  {
    codigo: '9',
    marca: 'Honda',
    piscadasLabel: '9 piscadas curtas',
    componente: 'Sensor IAT (Temperatura do Ar de Admissão)',
    sintomaTipico: 'Motor funciona normalmente em emergência, mas apresenta mistura incorreta em dias frios.',
    oQueTestarPrimeiro:
      'Conferir oxidação nos terminais do conector de 5 vias da Unidade de Sensores no corpo de borboleta.',
    testeMultimetro:
      'Escala 20 kΩ: resistência típica de 1,0 a 4,0 kΩ em temperatura ambiente (25 °C). Tensão de referência de 5V no chicote com chave ligada.',
  },
  {
    codigo: '12',
    marca: 'Honda',
    piscadasLabel: '1 longa + 2 curtas',
    componente: 'Bico Injetor de Combustível (Circuito Aberto ou Curto)',
    sintomaTipico:
      'O motor gira na partida, tem faísca na vela, a bomba arma, mas a moto NÃO PEGA de jeito nenhum.',
    oQueTestarPrimeiro:
      'Verificar se o plug de 2 vias do bico injetor soltou a trava, se há fio rompido no chicote próximo ao TBI ou se a bobina interna do bico queimou.',
    testeMultimetro:
      'Escala 200 Ω direto nos 2 pinos do bico injetor: deve medir entre 9,5 e 14,5 Ω (a 20 °C). No chicote (chave ON): 12V positivo no fio Preto/Branco.',
  },
  {
    codigo: '21',
    marca: 'Honda',
    piscadasLabel: '2 longas + 1 curta',
    componente: 'Sonda Lambda (Sensor de Oxigênio O2 no Escapamento)',
    sintomaTipico:
      'Alto consumo de combustível, cheiro forte no escapamento ou falha após aquecer (comum em motos Mix/Flex).',
    oQueTestarPrimeiro:
      'Conferir se o fio da sonda encostou na curva quente do escapamento derretendo a capa isolante ou se o conector entrou água.',
    testeMultimetro:
      'DCV 2V com motor quente (80 °C) a 2.500 rpm: sinal da sonda deve oscilar rapidamente entre 0,1V (pobre) e 0,9V (rica).',
  },
  {
    codigo: '29',
    marca: 'Honda',
    piscadasLabel: '2 longas + 9 curtas',
    componente: 'Válvula IACV (Controle Automático de Marcha Lenta)',
    sintomaTipico:
      'Marcha lenta disparada (alta demais) ou moto morrendo toda vez que fecha o acelerador.',
    oQueTestarPrimeiro:
      'Desmontar e limpar o alojamento da válvula de passo IACV no TBI (carbonização trava o êmbolo) e conferir o conector de 4 pinos.',
    testeMultimetro:
      'Escala 200 Ω nas duas bobinas do motor de passo da IACV: resistência típica entre 100 e 140 Ω em cada par de pinos.',
  },
  {
    codigo: '33',
    marca: 'Honda',
    piscadasLabel: '3 longas + 3 curtas',
    componente: 'Memória EEPROM da Central ECM (Módulo de Injeção)',
    sintomaTipico: 'Moto falha intermitentemente ou não aceita gravação/apagamento de parâmetros.',
    oQueTestarPrimeiro:
      'Executar o procedimento de limpeza de códigos pelo conector DLC e verificar aterramento principal (fio Verde no chassi/motor).',
    testeMultimetro:
      'Continuidade entre os fios Verdes do conector do ECM e o polo negativo da bateria (< 0,5 Ω).',
  },
  {
    codigo: '52',
    marca: 'Honda',
    piscadasLabel: '5 longas + 2 curtas',
    componente: 'Sensor CKP (Bobina de Pulso / Posição do Virabrequim)',
    sintomaTipico: 'Motor gira mas não tem faísca nem pulso no bico injetor, ou corta ignição quando esquenta.',
    oQueTestarPrimeiro:
      'Conector de 2 vias (fios Azul/Amarelo e Branco/Amarelo) que sobe da tampa esquerda do estator.',
    testeMultimetro:
      'Escala 200 / 2k Ω: resistência da bobina de pulso entre 180 e 280 Ω (a 20 °C).',
  },
  {
    codigo: '54',
    marca: 'Honda',
    piscadasLabel: '5 longas + 4 curtas',
    componente: 'Bank Angle Sensor (Sensor de Inclinação / Queda)',
    sintomaTipico:
      'Corta bomba de combustível e ignição (comum após queda ou se o mecânico montou o sensor de cabeça para baixo!).',
    oQueTestarPrimeiro:
      'Verificar se a seta "UP" gravada no corpo do sensor de inclinação está apontando para CIMA.',
    testeMultimetro:
      'DCV 20V: com o sensor na horizontal (~0°), tensão de sinal ~4,0 a 4,8V; inclinado acima de 60°, cai para < 0,6V cortando o motor.',
  },

  // -------------------------------------------------------------------------
  // YAMAHA FI (Factor 150 / Fazer 125 / Fazer 150 / Crosser 150)
  // -------------------------------------------------------------------------
  {
    codigo: '12',
    marca: 'Yamaha',
    piscadasLabel: '1 longa + 2 curtas (Código 12)',
    componente: 'Sensor de Posição do Virabrequim (Bobina de Pulso / CKP)',
    sintomaTipico: 'Motor gira na partida elétrica, mas não recebe sinal de rotação e não pega.',
    oQueTestarPrimeiro:
      'Conector de 2 fios da bobina de pulso vindo da tampa esquerda do magneto ou limalha de ferro colada no imã do captador.',
    testeMultimetro:
      'Escala 2k Ω nos 2 fios da bobina de pulso: 192 a 288 Ω (a 20 °C).',
  },
  {
    codigo: '13',
    marca: 'Yamaha',
    piscadasLabel: '1 longa + 3 curtas (Código 13)',
    componente: 'Sensor de Pressão do Ar de Admissão (Circuito Elétrico)',
    sintomaTipico: 'Falha em retomada, marcha lenta oscilando e luz MIL acesa fixa.',
    oQueTestarPrimeiro: 'Conector do conjunto de sensores (MAQS) no corpo de borboleta.',
    testeMultimetro:
      'DCV 20V: confirmar alimentação de 5V da ECU no conector do sensor.',
  },
  {
    codigo: '14',
    marca: 'Yamaha',
    piscadasLabel: '1 longa + 4 curtas (Código 14)',
    componente: 'Passagem / Orifício do Sensor de Pressão de Admissão (Entupido ou Solto)',
    sintomaTipico:
      'O sensor está bom eletricamente, mas não lê variação de vácuo quando o motor gira.',
    oQueTestarPrimeiro:
      'Limpar a passagem interna de vácuo no TBI (muito comum entupir com borra de óleo/carbonização) e verificar entrada falsa de ar no coletor.',
    testeMultimetro:
      'DCV 20V: tensão de saída deve cair de ~3,8V (motor parado) para ~1,5–2,2V (marcha lenta).',
  },
  {
    codigo: '15',
    marca: 'Yamaha',
    piscadasLabel: '1 longa + 5 curtas (Código 15)',
    componente: 'Sensor TPS (Posição da Borboleta — Circuito Aberto ou Curto)',
    sintomaTipico: 'Perda de resposta do acelerador e engasgos.',
    oQueTestarPrimeiro: 'Conector do módulo de sensores no TBI e integridade da fiação.',
    testeMultimetro:
      'DCV 20V: fechado ~0,50 a 0,70V | totalmente aberto ~3,8 a 4,5V.',
  },
  {
    codigo: '19',
    marca: 'Yamaha',
    piscadasLabel: '1 longa + 9 curtas (Código 19)',
    componente: 'Interruptor do Cavalete Lateral (Fio Azul/Amarelo à ECU)',
    sintomaTipico: 'Moto não dá partida ou corta ao engatar marcha mesmo com o pezinho recolhido.',
    oQueTestarPrimeiro:
      'Lama/graxa travando o pino do interruptor no cavalete lateral ou fio partido por pedras na parte inferior do quadro.',
    testeMultimetro:
      'Continuidade no interruptor do cavalete: pezinho recolhido = circuito FECHADO (continuidade 0 Ω); pezinho baixado = ABERTO (OL).',
  },
  {
    codigo: '21',
    marca: 'Yamaha',
    piscadasLabel: '2 longas + 1 curta (Código 21)',
    componente: 'Sensor de Temperatura do Motor',
    sintomaTipico: 'Partida difícil pela manhã com etanol (BlueFlex) e funcionamento irregular.',
    oQueTestarPrimeiro: 'Conector de 2 vias do sensor rosqueado no cabeçote/cilindro.',
    testeMultimetro:
      'Escala 20 kΩ: a 20 °C mede ~2,3 a 2,7 kΩ; a 80 °C cai para ~0,29 a 0,35 kΩ.',
  },
  {
    codigo: '22',
    marca: 'Yamaha',
    piscadasLabel: '2 longas + 2 curtas (Código 22)',
    componente: 'Sensor de Temperatura do Ar de Admissão (IAT)',
    sintomaTipico: 'Correção de mistura ar/combustível desativada (ECU assume valor fixo de emergência).',
    oQueTestarPrimeiro: 'Conector do conjunto de sensores no TBI.',
    testeMultimetro: 'Escala 20 kΩ: ~2,2 a 2,7 kΩ a 20 °C.',
  },
  {
    codigo: '24',
    marca: 'Yamaha',
    piscadasLabel: '2 longas + 4 curtas (Código 24)',
    componente: 'Sonda Lambda (Sensor O2)',
    sintomaTipico: 'Consumo elevado e falha de leitura de mistura Flex.',
    oQueTestarPrimeiro: 'Chicote da sonda próximo ao escapamento e limpeza do conector.',
    testeMultimetro: 'DCV 2V (motor quente): oscilação entre 0,1V e 0,9V.',
  },
  {
    codigo: '30',
    marca: 'Yamaha',
    piscadasLabel: '3 longas (Código 30)',
    componente: 'Sensor de Queda / Inclinação Acionado',
    sintomaTipico: 'Moto tombou ou o sensor de inclinação se soltou do coxim de borracha.',
    oQueTestarPrimeiro:
      'Posicionar o sensor na vertical com a inscrição "UP" para cima, desligar a chave por 5 segundos e religar.',
    testeMultimetro: 'DCV 20V: vertical ~0,4 a 1,4V | inclinado > 65° sobe para ~3,7 a 4,4V.',
  },
  {
    codigo: '33',
    marca: 'Yamaha',
    piscadasLabel: '3 longas + 3 curtas (Código 33)',
    componente: 'Bobina de Ignição (Falha no Circuito Primário)',
    sintomaTipico: 'Motor sem centelha na vela e não entra em funcionamento.',
    oQueTestarPrimeiro:
      'Verificar se os terminais faston (Laranja e Vermelho/Branco) da bobina de ignição sob o tanque escaparam ou estão frouxos.',
    testeMultimetro:
      'Escala 200 Ω no primário da bobina: 2,16 a 2,64 Ω | Secundário (20 kΩ): 8,64 a 12,96 kΩ.',
  },
  {
    codigo: '37',
    marca: 'Yamaha',
    piscadasLabel: '3 longas + 7 curtas (Código 37)',
    componente: 'Válvula ISC (Controle de Marcha Lenta Travada Aberta)',
    sintomaTipico: 'Marcha lenta acelerada acima de 2.500 rpm ou oscilando.',
    oQueTestarPrimeiro:
      'Descarbonizar o êmbolo e a sede da válvula ISC no TBI e ciclar a chave de ignição 3x para reinicializar o batente.',
    testeMultimetro: 'Escala 200 Ω nos 2 pares de bobinas da ISC: ~18 a 24 Ω.',
  },
  {
    codigo: '39',
    marca: 'Yamaha',
    piscadasLabel: '3 longas + 9 curtas (Código 39)',
    componente: 'Bico Injetor (Circuito Aberto ou Curto)',
    sintomaTipico: 'Motor gira mas não injeta combustível.',
    oQueTestarPrimeiro: 'Conector de 2 vias do bico injetor e continuidade até a ECU.',
    testeMultimetro: 'Escala 200 Ω nos pinos do bico injetor: ~11,5 a 12,5 Ω (a 20 °C).',
  },
  {
    codigo: '46',
    marca: 'Yamaha',
    piscadasLabel: '4 longas + 6 curtas (Código 46)',
    componente: 'Tensão de Alimentação do Sistema de Carga Anormal',
    sintomaTipico:
      'Bateria fraca (< 11V em funcionamento) ou retificador enviando sobrecarga (> 16V).',
    oQueTestarPrimeiro:
      'Medir tensão nos polos da bateria com motor funcionando e testar estator/retificador.',
    testeMultimetro: 'DCV 20V na bateria a 5.000 rpm: deve estabilizar entre 13,5V e 14,8V.',
  },
];

// ===========================================================================
// 2. Testes de Bancada no Multímetro
// ===========================================================================

export const TESTES_MULTIMETRO_BANCADA: readonly TesteMultimetroBancada[] = [
  {
    id: 'teste-bateria-carga',
    titulo: '1. Bateria & Tensão de Carga em Funcionamento',
    subtitulo: 'O teste nº 1 da oficina: avalia saúde dos vasos da bateria, arranque e regulador.',
    dificuldade: 'intermediario',
    armadilhaId: 'bateria_eletrica',
    escalaMultimetro: 'DCV 20V (Tensão Contínua — V⎓)',
    valorNormal:
      'Repouso: 12,5V a 12,8V | Na partida: >= 10,5V | A 5.000 RPM (farol aceso): 13,5V a 14,8V',
    valorDefeito:
      'Repouso < 12,2V (descarregada) | Cai p/ < 9,5V na partida (vaso em curto) | < 13,2V acelerando (não carrega) | > 15,0V (sobrecarga: retificador em curto!)',
    pontasDeProva: 'Ponta Vermelha no polo Positivo (+) e Ponta Preta no polo Negativo (-) da bateria.',
    passoAPasso: [
      'Com a chave desligada há pelo menos 15 minutos, meça a tensão de repouso nos bornes da bateria: uma bateria 100% saudável marca entre 12,6V e 12,8V.',
      'Mantenha as pontas nos polos e aperte o botão de partida elétrica: a tensão não deve despencar abaixo de 10,0V–10,5V. Se cair para 7V ou 8V mesmo após carga lenta, a bateria perdeu CCA e precisa ser substituída.',
      'Com o motor funcionando e o farol aceso, acelere até cerca de 5.000 RPM: a leitura deve subir gradualmente e estabilizar entre 13,5V e 14,8V.',
      'ALERTA CRÍTICO: se a tensão passar de 15,0V (chegando a 16V ou 18V ao acelerar), desligue imediatamente e troque o Retificador/Regulador — sobrecarga estufa a bateria, queima lâmpadas LED/halógenas e pode queimar o módulo ECM!',
    ],
    dicaBancada:
      'Confira sempre o fusível principal ao lado da bateria (continuidade/bip nos terminais superiores). Em motos com partida elétrica e injeção eletrônica, uma bateria abaixo de 12,4V em repouso pode girar o motor lentamente e causar falha de leitura dos sensores do ECM na partida a frio.',
  },
  {
    id: 'teste-estator',
    titulo: '2. Estator (Bobinas de Carga e Iluminação)',
    subtitulo: 'Diagnóstico definitivo para saber se o defeito de carga está no estator ou no retificador.',
    dificuldade: 'intermediario',
    escalaMultimetro: 'Ω 200 (Resistência) + Continuidade (Bip) + ACV 200V (Tensão Alternada — V~)',
    valorNormal:
      'Resistência das bobinas: 0,3 a 1,5 Ω | Isolamento c/ terra (chassi): OL (Infinito / Sem Bip) | Tensão AC a 5.000 RPM: 45V a 80V AC',
    valorDefeito:
      'Resistência "OL" (fio da bobina rompido) | Dando Bip/continuidade com o chassi em estator isolado (bobina torrada em curto com a massa!)',
    pontasDeProva:
      'No conector que sobe da tampa esquerda do motor (fios Brancos / Amarelos desconectados do chicote).',
    passoAPasso: [
      'Desligue a moto e desconecte o plug principal que sobe do estator (tampa esquerda do motor).',
      'TESTE 1 — Resistência da Bobina (Ω 200): encoste uma ponta no outro para descontar a resistência dos cabos do multímetro (~0,2 Ω). Depois meça entre os fios de carga do estator (ex.: Branco x Verde na Honda monofásica, ou Branco x Branco na Yamaha): deve marcar entre 0,3 e 1,5 Ω.',
      'TESTE 2 — Curto com a Massa (Continuidade / Bip): em sistemas bifásicos/trifásicos isolados do terra (fios Brancos da Yamaha 150 / Honda injetadas), coloque a ponta preta no bloco do motor e a vermelha nos fios Brancos do estator: NÃO PODE APITAR (deve dar "OL"). Se apitar, o verniz do cobre derreteu e entrou em curto com a carcaça.',
      'TESTE 3 — Geração a Vazio (ACV 200V~): com o plug do estator ainda desconectado, ligue o motor, coloque o multímetro em Tensão Alternada (200V AC~) e acelere a 5.000 RPM: o estator deve gerar entre 45V e 80V AC vigorosos.',
    ],
    dicaBancada:
      'Atenção: nas motos antigas com corrente alternada no farol (CG 125/150 carburadas e YBR 125 antigas), o estator compartilha o terra (fio Verde ou Preto) na carcaça. Já nas injetadas com farol DC (corrente contínua), a bobina de carga dos fios Brancos é 100% isolada do chassi!',
  },
  {
    id: 'teste-retificador-regulador',
    titulo: '3. Retificador / Regulador de Voltagem',
    subtitulo: 'Verificação da ponte de diodos interna e da linha de referência pós-chave.',
    dificuldade: 'intermediario',
    armadilhaId: 'bateria_eletrica',
    escalaMultimetro: 'Escala de Diodo (→|—) e DCV 20V',
    valorNormal:
      'Queda de tensão direta nos diodos: 0,450V a 0,750V | Sentido inverso: OL (bloqueio) | Saída no fio Vermelho: 13,5V a 14,8V DC',
    valorDefeito:
      '0,000V nos dois sentidos (diodo em curto — descarrega a bateria da noite para o dia!) ou OL nos dois sentidos (diodo aberto — não carrega)',
    pontasDeProva:
      'Nos terminais do próprio retificador desconectado (Teste de Diodo) e no conector ligado (DCV 20V).',
    passoAPasso: [
      'Antes de condenar o retificador porque a bateria não carrega: com o multímetro em DCV 20V, verifique se o fio Vermelho do conector do retificador tem a mesma tensão da bateria (12,5V) — se não tiver, o fusível principal queimou ou o fio partiu!',
      'Confira também a continuidade do fio de aterramento do conector do retificador (Verde na Honda / Preto na Yamaha / Preto-Branco na Suzuki) com o polo negativo da bateria.',
      'Desconecte o retificador e selecione a escala de DIODO (→|—) no multímetro.',
      'Coloque a ponta PRETA no pino de saída Positiva (onde vai o fio Vermelho) e a ponta VERMELHA nos pinos de entrada AC (onde entram os fios Brancos do estator): o multímetro deve mostrar a queda do diodo entre 0,450V e 0,750V. Inverta as pontas: deve mostrar "OL" (bloqueado).',
    ],
    dicaBancada:
      'Quando uma moto amanhece com a bateria zerada todos os dias, desconecte o retificador à noite: se no dia seguinte a bateria segurar carga, há um diodo em fuga dentro do retificador roubando corrente em repouso.',
  },
  {
    id: 'teste-bobina-pulso-ckp',
    titulo: '4. Bobina de Pulso (Sensor CKP de Rotação)',
    subtitulo: 'O sensor que avisa ao CDI/ECM o momento exato de soltar a faísca na vela.',
    dificuldade: 'intermediario',
    escalaMultimetro: 'Ω 200 ou Ω 2k (Resistência) + ACV 2V (ou Adaptador de Pico de Voltagem)',
    valorNormal:
      'Honda: 180 a 280 Ω | Yamaha: 190 a 300 Ω | Suzuki: 130 a 220 Ω | Pulso na partida: >= 0,7V',
    valorDefeito:
      'Resistência "OL" (bobina aberta), abaixo de 100 Ω (espiras em curto) ou cortando sinal apenas quando o óleo do motor esquenta.',
    pontasDeProva:
      'Nos 2 fios do conector da bobina de pulso (Honda: Azul/Amarelo + Branco/Amarelo ou Verde | Yamaha: Branco/Vermelho + Branco/Azul | Suzuki: Azul/Amarelo + Verde/Branco).',
    passoAPasso: [
      'Desconecte o plug de 2 vias (ou os 2 pinos correspondentes no conector do estator) da bobina de pulso.',
      'Selecione a escala de 2k Ω (2.000 Ohms) no multímetro e encoste as pontas nos dois terminais que vêm do motor.',
      'Compare a leitura a frio (20 °C) com a faixa da fabricante: Honda (~180–280 Ω), Yamaha (~190–300 Ω), Suzuki (~130–220 Ω).',
      'Com o multímetro em escala baixa de milivolts/ACV 2V (ou com adaptador de pico de tensão), dê partida no motor: a leitura deve saltar imediatamente acima de 0,7V indicando que o imã está gerando pulso.',
    ],
    dicaBancada:
      'Defeito clássico de oficina: a moto funciona fria, roda 15 minutos, morre sozinha sem faísca e só pega depois de esfriar meia hora. Meça a resistência da bobina de pulso NO MOMENTO EM QUE ELA MORRE QUENTE: você verá que a bobina dilatou e abriu ("OL").',
  },
  {
    id: 'teste-bobina-ignicao-cachimbo',
    titulo: '5. Bobina de Ignição & Cachimbo Supressivo de Vela',
    subtitulo: 'Teste completo de alta tensão para falhas de centelha, engasgos na chuva e cortes em alta.',
    dificuldade: 'intermediario',
    escalaMultimetro: 'Ω 200 (Enrolamento Primário) e Ω 20k (Secundário e Cachimbo)',
    valorNormal:
      'Primário: 0,4 a 2,8 Ω | Secundário (sem cachimbo): 3,5 a 9,5 kΩ | Cachimbo NGK isolado: ~5,0 kΩ (3,8 a 6,2 kΩ)',
    valorDefeito:
      'Cachimbo oxidado marcando "OL" (sem passagem para a vela) ou trinca na borracha desviando faísca para o cabeçote.',
    pontasDeProva:
      'Primário: entre os 2 terminais de entrada da bobina | Secundário: entre o terminal positivo primário e a ponta do cabo de vela.',
    passoAPasso: [
      'Desrosqueie o cachimbo da ponta do cabo de alta tensão (gire no sentido anti-horário).',
      'TESTE DO CACHIMBO (Escala 20 kΩ): coloque uma ponta do multímetro onde entra o cabo e a outra onde encaixa a vela. O resistor interno supressivo de ruído deve medir cerca de 5,0 kΩ (4,0 a 6,0 kΩ). Se der "OL", o resistor interno abriu: troque o cachimbo!',
      'Se a ponta do cabo de vela estiver com os fios de cobre verdes de zinabre, corte 5 mm da ponta do cabo para expor cobre novo antes de rosquear o cachimbo de volta.',
      'TESTE DO PRIMÁRIO (Escala 200 Ω): solte os fios de entrada da bobina sob o tanque e meça entre os dois terminais primários (ou terminal + núcleo metálico nas bobinas de 1 pino): deve medir entre 0,4 e 2,8 Ω.',
      'TESTE DO SECUNDÁRIO (Escala 20 kΩ): meça entre o terminal primário e a ponta do cabo de vela (sem cachimbo): deve marcar entre 3,5 e 9,5 kΩ.',
    ],
    dicaBancada:
      'Sempre que uma moto injetada der erro aleatório no painel ou resetar o painel ao acelerar, verifique se colocaram uma vela SEM resistor (ex.: DP8EA-9 sem o "R" ou cachimbo direto sem os 5 kΩ): a interferência eletromagnética enlouquece o módulo ECM.',
  },
  {
    id: 'teste-bomba-combustivel-fusivel',
    titulo: '6. Bomba de Combustível (Alimentação 12V & Pressão) e Fusíveis',
    subtitulo: 'Exclusivo para motos com injeção eletrônica: temporização de 3 segundos do ECM e pressão de linha.',
    dificuldade: 'intermediario',
    escalaMultimetro: 'DCV 20V + Continuidade (Bip) + Manômetro de Linha (0–7 bar)',
    apenasInjecao: true,
    valorNormal:
      'Alimentação ao virar a chave: ~12V durante 2 a 3 segundos | Pressão Honda PGM-FI: 2,9–3,0 bar (43 psi) | Pressão Yamaha BlueFlex: 2,5 bar (36 psi)',
    valorDefeito:
      'Zero volts ao ligar a chave (fusível, relé, sensor de inclinação ou fio partido) | Pressão abaixo de 2,2 bar (moto dá falta em alta e pipoca)',
    pontasDeProva:
      'No conector da bomba de combustível sob o tanque (fios de potência do motor da bomba: Marrom/Preto e Verde na Honda).',
    passoAPasso: [
      'TESTE DOS FUSÍVEIS (Continuidade / DCV 20V): abra a caixa de fusíveis ao lado da bateria e teste continuidade nos dois pontos metálicos superiores de cada fusível (Principal 15A/20A/25A e Secundários 10A).',
      'TESTE DE TEMPORIZAÇÃO 12V DA BOMBA (DCV 20V): desconecte o plug da bomba sob o tanque, encoste as pontas nos 2 pinos de alimentação do refil (não nos pinos da boia!) e vire a chave de ignição para ON: o multímetro DEVE marcar ~12V por 2 a 3 segundos e depois cortar a zero (proteção do ECM enquanto o motor não gira).',
      'Se chegarem os 12V por 3 segundos no chicote mas a bomba não fizer o barulho característico ("zzzz"), o refil interno da bomba travou ou queimou.',
      'Se a bomba gira mas a moto falha quando esquenta ou perde força na subida, instale o manômetro em série na mangueira de engate rápido: a pressão deve cravar em 2,9–3,0 bar (Honda) ou 2,5 bar (Yamaha) sem cair ao acelerar.',
    ],
    dicaBancada:
      'Não confunda os fios no conector de 4 ou 5 pinos da flange da bomba: 2 fios mais grossos alimentam o motor da bomba (12V) e os outros 2 fios mais finos são do sensor de nível (boia de combustível do painel).',
  },
];

// ===========================================================================
// 3. Guia Visual de Cores de Fios do Chicote (Honda / Yamaha / Suzuki)
// ===========================================================================

export const GUIA_CORES_FIOS: readonly LinhaCorChicote[] = [
  {
    id: 'terra-massa',
    funcaoCircuito: 'Terra / Massa Geral (-)',
    ondeEncontrar: 'Todo o chicote, farol, lanterna, setas, sensores e aterramento no chassi',
    Honda: {
      nomeCor: 'Verde',
      codigoSigla: 'G (Green)',
      hexPrimaria: '#16a34a',
      detalhe: 'Terra universal em qualquer Honda do mundo',
    },
    Yamaha: {
      nomeCor: 'Preto',
      codigoSigla: 'B (Black)',
      hexPrimaria: '#18181b',
      detalhe: 'Terra universal em todo o chicote Yamaha',
    },
    Suzuki: {
      nomeCor: 'Preto com listra Branca',
      codigoSigla: 'B/W',
      hexPrimaria: '#18181b',
      hexListra: '#f4f4f5',
      detalhe: 'Atenção: Preto puro na Suzuki é seta esquerda!',
    },
  },
  {
    id: 'positivo-bateria',
    funcaoCircuito: 'Positivo Direto da Bateria (12V Permanente)',
    ondeEncontrar: 'Saída do fusível principal, entrada da chave de ignição e saída do retificador',
    Honda: {
      nomeCor: 'Vermelho',
      codigoSigla: 'R (Red)',
      hexPrimaria: '#dc2626',
      detalhe: 'Tem 12V mesmo com a chave desligada',
    },
    Yamaha: {
      nomeCor: 'Vermelho',
      codigoSigla: 'R (Red)',
      hexPrimaria: '#dc2626',
      detalhe: 'Direto do fusível principal até a ignição',
    },
    Suzuki: {
      nomeCor: 'Vermelho',
      codigoSigla: 'R (Red)',
      hexPrimaria: '#dc2626',
      detalhe: 'Alimentação constante 12V+',
    },
  },
  {
    id: 'pos-chave',
    funcaoCircuito: 'Pós-Chave 12V+ (Ignição Ligada em ON)',
    ondeEncontrar: 'Saída da chave de contato, entrada do relé de seta, interruptor de freio e painel',
    Honda: {
      nomeCor: 'Preto (ou Preto c/ Branco na injeção)',
      codigoSigla: 'Bl (Black)',
      hexPrimaria: '#18181b',
      detalhe: 'CUIDADO: Fio Preto na Honda é POSITIVO 12V pós-chave (nunca ligue no terra!)',
    },
    Yamaha: {
      nomeCor: 'Marrom',
      codigoSigla: 'Br (Brown)',
      hexPrimaria: '#854d0e',
      detalhe: 'Positivo pós-chave universal Yamaha',
    },
    Suzuki: {
      nomeCor: 'Laranja',
      codigoSigla: 'O (Orange)',
      hexPrimaria: '#ea580c',
      detalhe: 'Positivo pós-chave universal Suzuki',
    },
  },
  {
    id: 'seta-esquerda',
    funcaoCircuito: 'Seta / Pisca Esquerdo (Dianteiro e Traseiro)',
    ondeEncontrar: 'Chave de seta no punho esquerdo, chicote do farol e rabeta',
    Honda: {
      nomeCor: 'Laranja',
      codigoSigla: 'O (Orange)',
      hexPrimaria: '#f97316',
    },
    Yamaha: {
      nomeCor: 'Marrom Escuro (Chocolate)',
      codigoSigla: 'Ch (Chocolate)',
      hexPrimaria: '#451a03',
    },
    Suzuki: {
      nomeCor: 'Preto',
      codigoSigla: 'B (Black)',
      hexPrimaria: '#18181b',
      detalhe: 'Positivo da seta esquerda (o terra é Preto/Branco)',
    },
  },
  {
    id: 'seta-direita',
    funcaoCircuito: 'Seta / Pisca Direito (Dianteiro e Traseiro)',
    ondeEncontrar: 'Chave de seta no punho esquerdo, chicote do farol e rabeta',
    Honda: {
      nomeCor: 'Azul Claro (Celeste)',
      codigoSigla: 'Lb (Light Blue)',
      hexPrimaria: '#38bdf8',
    },
    Yamaha: {
      nomeCor: 'Verde Escuro',
      codigoSigla: 'Dg (Dark Green)',
      hexPrimaria: '#14532d',
    },
    Suzuki: {
      nomeCor: 'Verde Claro',
      codigoSigla: 'Lg (Light Green)',
      hexPrimaria: '#4ade80',
    },
  },
  {
    id: 'farol-baixo',
    funcaoCircuito: 'Farol Baixo',
    ondeEncontrar: 'Soquete H4/HS1 do bloco óptico e chave comutadora alta/baixa',
    Honda: {
      nomeCor: 'Branco',
      codigoSigla: 'W (White)',
      hexPrimaria: '#f4f4f5',
    },
    Yamaha: {
      nomeCor: 'Verde',
      codigoSigla: 'G (Green)',
      hexPrimaria: '#16a34a',
    },
    Suzuki: {
      nomeCor: 'Branco',
      codigoSigla: 'W (White)',
      hexPrimaria: '#f4f4f5',
    },
  },
  {
    id: 'farol-alto',
    funcaoCircuito: 'Farol Alto & Luz Piloto Azul no Painel',
    ondeEncontrar: 'Soquete do farol, chave comutadora e indicador de luz alta no painel',
    Honda: {
      nomeCor: 'Azul Escuro',
      codigoSigla: 'Bu (Blue)',
      hexPrimaria: '#1d4ed8',
    },
    Yamaha: {
      nomeCor: 'Amarelo',
      codigoSigla: 'Y (Yellow)',
      hexPrimaria: '#eab308',
    },
    Suzuki: {
      nomeCor: 'Amarelo',
      codigoSigla: 'Y (Yellow)',
      hexPrimaria: '#eab308',
    },
  },
  {
    id: 'lanterna-painel',
    funcaoCircuito: 'Lanterna Traseira (Meia-Luz) & Iluminação do Painel',
    ondeEncontrar: 'Chicote da rabeta (polo de 5W da lâmpada 2 polos) e pingo do farol',
    Honda: {
      nomeCor: 'Marrom (ou Amarelo nas carburadas AC)',
      codigoSigla: 'Br (Brown)',
      hexPrimaria: '#92400e',
    },
    Yamaha: {
      nomeCor: 'Azul',
      codigoSigla: 'L (Blue)',
      hexPrimaria: '#2563eb',
    },
    Suzuki: {
      nomeCor: 'Cinza (ou Marrom)',
      codigoSigla: 'Gr (Gray)',
      hexPrimaria: '#71717a',
    },
  },
  {
    id: 'luz-freio',
    funcaoCircuito: 'Luz de Freio (Retorno das Cebolinhas Diant./Tras.)',
    ondeEncontrar: 'Saída dos interruptores de manete/pedal até o polo de 21W da lanterna traseira',
    Honda: {
      nomeCor: 'Verde com listra Amarela',
      codigoSigla: 'G/Y',
      hexPrimaria: '#16a34a',
      hexListra: '#facc15',
    },
    Yamaha: {
      nomeCor: 'Amarelo (ou Verde c/ Amarelo)',
      codigoSigla: 'Y ou G/Y',
      hexPrimaria: '#eab308',
      hexListra: '#16a34a',
    },
    Suzuki: {
      nomeCor: 'Branco com listra Preta',
      codigoSigla: 'W/B',
      hexPrimaria: '#f4f4f5',
      hexListra: '#18181b',
    },
  },
  {
    id: 'buzina',
    funcaoCircuito: 'Acionamento da Buzina',
    ondeEncontrar: 'Terminais da buzina abaixo do farol e botão do punho esquerdo',
    Honda: {
      nomeCor: 'Verde Claro',
      codigoSigla: 'Lg (Light Green)',
      hexPrimaria: '#86efac',
      detalhe: 'Recebe 12V positivo ao apertar o botão (ou fecha negativo em alguns modelos)',
    },
    Yamaha: {
      nomeCor: 'Rosa',
      codigoSigla: 'P (Pink)',
      hexPrimaria: '#f472b6',
      detalhe: 'A buzina tem 12V fixo (Marrom) e o botão fecha o terra pelo fio Rosa',
    },
    Suzuki: {
      nomeCor: 'Verde com listra Branca (ou Azul)',
      codigoSigla: 'G/W',
      hexPrimaria: '#16a34a',
      hexListra: '#f4f4f5',
    },
  },
  {
    id: 'partida-rele',
    funcaoCircuito: 'Sinal do Botão de Partida até o Relé de Partida',
    ondeEncontrar: 'Punho direito (Start) até a bobina de comando do relé de partida',
    Honda: {
      nomeCor: 'Amarelo com listra Vermelha',
      codigoSigla: 'Y/R',
      hexPrimaria: '#eab308',
      hexListra: '#dc2626',
    },
    Yamaha: {
      nomeCor: 'Azul com listra Branca',
      codigoSigla: 'L/W',
      hexPrimaria: '#2563eb',
      hexListra: '#f4f4f5',
    },
    Suzuki: {
      nomeCor: 'Amarelo com listra Verde',
      codigoSigla: 'Y/G',
      hexPrimaria: '#eab308',
      hexListra: '#16a34a',
    },
  },
  {
    id: 'estator-carga',
    funcaoCircuito: 'Saída AC do Estator para o Retificador',
    ondeEncontrar: 'Plug que sobe da tampa esquerda do motor até o retificador',
    Honda: {
      nomeCor: 'Branco (Carga) + Amarelo (Iluminação AC)',
      codigoSigla: 'W / Y',
      hexPrimaria: '#f4f4f5',
      hexListra: '#eab308',
      detalhe: 'Nas injetadas com farol DC são 2 fios Brancos',
    },
    Yamaha: {
      nomeCor: 'Branco (2 ou 3 fios Brancos)',
      codigoSigla: 'W (White)',
      hexPrimaria: '#f4f4f5',
    },
    Suzuki: {
      nomeCor: 'Amarelo / Branco c/ Vermelho',
      codigoSigla: 'Y / W-R',
      hexPrimaria: '#eab308',
      hexListra: '#dc2626',
    },
  },
  {
    id: 'bobina-pulso',
    funcaoCircuito: 'Sinal da Bobina de Pulso (CKP) ao CDI / ECM',
    ondeEncontrar: 'Conector de 2 vias junto à saída do estator',
    Honda: {
      nomeCor: 'Azul com listra Amarela',
      codigoSigla: 'Bu/Y',
      hexPrimaria: '#1d4ed8',
      hexListra: '#facc15',
    },
    Yamaha: {
      nomeCor: 'Branco c/ Vermelho (ou Azul c/ Amarelo)',
      codigoSigla: 'W/R',
      hexPrimaria: '#f4f4f5',
      hexListra: '#dc2626',
    },
    Suzuki: {
      nomeCor: 'Azul com listra Amarela',
      codigoSigla: 'Bu/Y',
      hexPrimaria: '#1d4ed8',
      hexListra: '#facc15',
    },
  },
];
