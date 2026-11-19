# Biblioteca de Manuais Técnicos em PDF — MotoTech Pro

Coloque os manuais oficiais em formato `.pdf` dentro desta estrutura de pastas para que o **MotoTech Pro** os descubra automaticamente via API (`GET /api/manuais`) e os exiba no **Visualizador de PDF Integrado** dentro da aplicação.

## Convenção de Pastas

```text
public/manuals/<fabricante>/<modelo>/<ano-ou-geracao>/<arquivo>.pdf
```

### Exemplos suportados:
- **Por ano específico** (o sistema agrupa automaticamente dentro da faixa de anos da geração correspondente):
  - `public/manuals/honda/cg125/2000/CG 125 Titan e Cargo 2000.pdf` → associado à **CG 125 (2000–2008)**
  - `public/manuals/honda/cg125/2011/CG 125 Fan e Cargo 2011.pdf` → associado à **CG 125 (2009–2018)**
  - `public/manuals/honda/cg150/2004/CG 150 Titan, Sport e Job 2004.pdf` → associado à **CG 150 (2004–2008)**
  - `public/manuals/honda/cg150/2009/CG 150 Titan 2009.pdf` → associado à **CG 150 (2009–2015)**
- **Por faixa de anos da geração:**
  - `public/manuals/honda/cg-160/2018-2024/manual-servico-cg160.pdf`
  - `public/manuals/yamaha/factor-150/2016-2024/manual-proprietario.pdf`
  - `public/manuals/suzuki/intruder-125/2008-2016/manual-servico-gn125.pdf`
- **Geral do modelo (aplicável a todas as gerações daquele modelo):**
  - `public/manuals/suzuki/yes-125/catalogo-pecas-en125.pdf`

## Observações
- Nomes de pasta com ou sem hífen são reconhecidos automaticamente (`cg150` ou `cg-150`, `nxr160` ou `nxr-160-bros`).
- Todos os arquivos `.pdf` dentro de `public/manuals/` são ignorados pelo Git (`.gitignore`) para manter o repositório leve.
- Após adicionar um novo PDF, basta clicar em **"Recarregar lista de PDFs"** na interface — não é necessário reiniciar o Docker.
