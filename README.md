# Guia de Oficina

Aplicativo desktop **gratuito e 100% offline** para consulta técnica rápida de motocicletas em ambiente de oficina (Windows `.exe`).

> [!IMPORTANT]
> **Projeto em desenvolvimento ativo e uso transparente de IA:**
> O **Guia de Oficina** ainda está em evolução contínua. A extração, organização e auditoria dos dados técnicos contaram com **auxílio de Inteligência Artificial** a partir dos manuais oficiais das montadoras. Embora o catálogo passe por verificações rigorosas, **sempre confira torques críticos, folgas e procedimentos diretamente no Manual PDF oficial embutido no próprio aplicativo** em caso de dúvida.

---

## Público-Alvo

- **Mecânicos de motocicletas** (iniciantes e experientes) que precisam de dados confiáveis na bancada sem depender de internet.
- **Estudantes de mecânica** buscando referências organizadas por arquitetura real (carburada vs. injetada, tambor vs. disco/CBS/ABS).
- **Proprietários** que realizam manutenções preventivas e corretivas básicas a intermediárias por conta própria.

---

## O que a Aplicação Oferece

- **Catálogo Técnico Estruturado (`Marca → Modelo → Versão → Ano/Geração`):**
  - Cobertura de motocicletas **Honda**, **Yamaha** e **Suzuki** até 190cc, com ramificações dedicadas de versão para famílias com diferenças visuais e mecânicas marcantes (**Honda CG 125 / 150 / 160**, **Yamaha Fazer 150 YS150/FZ15**, **YBR / Factor 125** e **Crosser 150 S/Z**).
- **Ficha Técnica e Torques Oficiais:**
  - Especificação e volumes de óleo do motor, folga de válvulas, vela de ignição, marcha lenta, suspensão dianteira, relação/corrente, medidas e calibragem de pneus, bateria, fusíveis, lâmpadas e torques de aperto oficiais.
- **Manual de Revisões e Roteiro Guiado (*Iniciar Revisão*):**
  - Checklists preventivos e roteiros passo a passo (Básica, Completa e Pré-Viagem) adaptados automaticamente à arquitetura real da moto (carburada vs. injetada, freio a tambor vs. disco/CBS/ABS), com suporte a impressão/PDF.
- **Elétrica & Injeção + Diagnóstico Corretivo:**
  - Consulta rápida de testes elétricos, sensores e códigos de falha compatíveis com cada geração.
- **Biblioteca Offline de Manuais PDF (78 Manuais Oficiais):**
  - 78 manuais oficiais otimizados e **100% pesquisáveis** com busca instantânea por palavra-chave, salto direto para a página, **Modo Leitura em texto** e botão para abrir no navegador/leitor externo do sistema.
- **Experiência Leve de Bancada:**
  - Alternância entre **Tema Claro** e **Tema Escuro**, inicialização rápida em janela nativa Windows (Tauri v2 + WebView2) e funcionamento **100% offline** — sem Docker, sem servidor externo e sem internet para o usuário final.

---

## Download Pronto para Uso (Windows `.exe`)

Para apenas instalar e usar (sem precisar compilar nada), baixe o instalador pronto **`Guia de Oficina_1.6.0_x64-setup.exe`** na aba **Releases** deste repositório:

- **[Baixar última versão (Releases)](https://github.com/Kiy0n/guia-de-oficina/releases/latest)**

> [!NOTE]
> **Aviso do Windows Defender SmartScreen:** por se tratar de um software gratuito sem certificado digital pago, o Windows pode exibir uma tela de proteção na primeira execução. Para prosseguir, clique em **"Mais informações"** → **"Executar assim mesmo"**. A instalação é feita no modo usuário (`currentUser`), sem exigir senha de administrador.

---

## Como Compilar o Projeto (Desenvolvedores / Usuários Avançados)

### Pré-requisitos no Windows

1. **Node.js (LTS)** — https://nodejs.org/
2. **Rust (`rustup` / `cargo`)** — https://rustup.rs/
3. **Microsoft Visual Studio C++ Build Tools** — instale com a carga de trabalho *"Desenvolvimento para desktop com C++"* (*Desktop development with C++*).
4. **Docker Desktop** *(opcional)* — usado apenas para desenvolvimento web (Express 5) e scripts de auditoria.

### Passo a Passo de Compilação

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/Kiy0n/guia-de-oficina.git
   cd guia-de-oficina
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Adicionar os manuais PDF *(opcional para embutir a biblioteca completa)*:**
   - Os arquivos `.pdf` de `public/manuals/` não são versionados no Git (`.gitignore`).
   - Caso queira embutir a biblioteca completa no instalador, coloque os PDFs seguindo a estrutura documentada em `public/manuals/README.md` (e gere o índice em `data/manuals-index/` se desejar busca instantânea pré-indexada).

4. **Gerar o instalador `.exe` nativo (Tauri v2):**
   ```bash
   npm run tauri build
   ```

5. **Localizar o instalador gerado:**
   - O instalador NSIS final é gerado em:
     ```text
     src-tauri/target/release/bundle/nsis/Guia de Oficina_1.6.0_x64-setup.exe
     ```
