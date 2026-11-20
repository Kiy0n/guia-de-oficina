# Fotos de Referência das Motocicletas — Guia de Oficina

Coloque aqui as fotos das motos em formato **`.webp`** (recomendado: largura ~640–800 px, proporção `16:10` ou fundo neutro/transparente, `< 80 KB` por arquivo) para exibição automática nos cards de seleção de **Ano / Geração** em `MotoSelectorWizard.tsx`.

- Se a foto de uma geração ainda não existir nesta pasta, o card oculta o bloco de imagem automaticamente (sem ícone quebrado e sem afetar o layout).
- Esta pasta é copiada automaticamente para `dist/motos/` no build do Vite, funcionando **100% offline** tanto no Docker quanto no aplicativo desktop **Tauri (`.exe`)**.

---

## 1. Família Honda CG (com ramificação por versão)

O sistema tenta primeiro a foto específica da **versão + geração** e, caso não exista, faz fallback opcional para a foto genérica da geração (ex.: `honda-cg-160-2016-2017.webp`).

### CG 125
| Versão | Geração | Arquivo Esperado (`public/motos/...`) |
| :--- | :--- | :--- |
| **Titan** | 2000–2004 (OHV) | `honda-cg-125-titan-2000-2008.webp` |
| **Fan** | 2005–2008 (OHV) | `honda-cg-125-fan-2000-2008.webp` |
| **Fan** | 2009–2015 (OHC Carburada) | `honda-cg-125-fan-2009-2015.webp` |
| **Fan 125i** | 2016–2018 (PGM-FI) | `honda-cg-125-fan-2016-2018.webp` |
| **Cargo** | 2000–2008 (OHV) | `honda-cg-125-cargo-2000-2008.webp` |
| **Cargo** | 2009–2015 (OHC Carburada) | `honda-cg-125-cargo-2009-2015.webp` |
| **Cargo 125i** | 2016–2018 (PGM-FI) | `honda-cg-125-cargo-2016-2018.webp` |

### CG 150
| Versão | Geração | Arquivo Esperado (`public/motos/...`) |
| :--- | :--- | :--- |
| **Titan** | 2004–2008 (Carburada) | `honda-cg-150-titan-2004-2008.webp` |
| **Titan** | 2009–2015 (PGM-FI / Mix / Flex) | `honda-cg-150-titan-2009-2015.webp` |
| **Fan** | 2009–2015 (ESi / ESDi) | `honda-cg-150-fan-2009-2015.webp` |
| **Cargo** | 2014–2015 (PGM-FI) | `honda-cg-150-cargo-2009-2015.webp` |
| **Sport** | 2005–2008 (Carburada) | `honda-cg-150-sport-2004-2008.webp` |

### CG 160
| Versão | Geração | Arquivo Esperado (`public/motos/...`) |
| :--- | :--- | :--- |
| **Start** | 2016–2017 (Tambor) | `honda-cg-160-start-2016-2017.webp` |
| **Start** | 2018–2024 (CBS Tambor) | `honda-cg-160-start-2018-2024.webp` |
| **Start** | 2025–2026 (Disco CBS) | `honda-cg-160-start-2025-2026.webp` |
| **Fan** | 2016–2017 (Lançamento) | `honda-cg-160-fan-2016-2017.webp` |
| **Fan** | 2018–2024 (CBS) | `honda-cg-160-fan-2018-2024.webp` |
| **Fan** | 2025–2026 (LED / CBS) | `honda-cg-160-fan-2025-2026.webp` |
| **Titan** | 2016–2017 (Lançamento) | `honda-cg-160-titan-2016-2017.webp` |
| **Titan** | 2018–2024 (CBS) | `honda-cg-160-titan-2018-2024.webp` |
| **Titan** | 2025–2026 (ABS / LED) | `honda-cg-160-titan-2025-2026.webp` |
| **Cargo** | 2016–2017 (Lançamento) | `honda-cg-160-cargo-2016-2017.webp` |
| **Cargo** | 2018–2024 (CBS) | `honda-cg-160-cargo-2018-2024.webp` |
| **Cargo** | 2025–2026 (CBS) | `honda-cg-160-cargo-2025-2026.webp` |

---

## 2. Demais Modelos Honda
| Modelo | Geração | Arquivo Esperado (`public/motos/...`) |
| :--- | :--- | :--- |
| **Biz 100** | 1998–2005 (C100) | `honda-biz-100-1998-2005.webp` |
| **Biz 100** | 2013–2015 | `honda-biz-100-2013-2015.webp` |
| **Biz 110i** | 2016–2024 | `honda-biz-110i-2016-2024.webp` |
| **Biz 125** | 2006–2008 (Carburada) | `honda-biz-125-2006-2008.webp` |
| **Biz 125** | 2009–2010 (PGM-FI Gasolina) | `honda-biz-125-2009-2010.webp` |
| **Biz 125** | 2011–2017 (Flex) | `honda-biz-125-2011-2017.webp` |
| **Biz 125** | 2018–2026 (CBS / 2025+) | `honda-biz-125-2018-2026.webp` |
| **NXR 125 Bros** | 2003–2005 (OHV) | `honda-nxr-125-bros-2003-2005.webp` |
| **NXR 125 Bros** | 2013–2015 (OHC) | `honda-nxr-125-bros-2013-2015.webp` |
| **NXR 150 Bros** | 2003–2008 (Carburada) | `honda-nxr-150-bros-2003-2008.webp` |
| **NXR 150 Bros** | 2009–2014 (Mix / Flex) | `honda-nxr-150-bros-2009-2014.webp` |
| **NXR 160 Bros** | 2015–2024 | `honda-nxr-160-bros-2015-2024.webp` |
| **NXR 160 Bros** | 2025–2026 (ABS / CBS LED) | `honda-nxr-160-bros-2025-2026.webp` |
| **Pop 100** | 2007–2015 | `honda-pop-100-2007-2015.webp` |
| **Pop 110i** | 2016–2024 | `honda-pop-110i-2016-2024.webp` |
| **Pop 110i** | 2025–2026 (ES Semiautomática) | `honda-pop-110i-2025-2026.webp` |
| **XRE 190** | 2016–2024 | `honda-xre-190-2016-2024.webp` |
| **XRE 190** | 2025–2026 (LED / 33 mm) | `honda-xre-190-2025-2026.webp` |

---

## 3. Modelos Yamaha
| Modelo | Geração | Arquivo Esperado (`public/motos/...`) |
| :--- | :--- | :--- |
| **Crosser 150** | 2015–2018 | `yamaha-crosser-150-2015-2018.webp` |
| **Crosser 150** | 2019–2026 (ABS / LED) | `yamaha-crosser-150-2019-2026.webp` |
| **Factor 150** | 2016–2024 (Blueflex) | `yamaha-factor-150-2016-2024.webp` |
| **Factor 150** | 2025–2026 (LED / DX) | `yamaha-factor-150-2025-2026.webp` |
| **Fazer 125** | 2016–2024 | `yamaha-fazer-125-2016-2024.webp` |
| **Fazer 150** | 2014–2024 (YS150) | `yamaha-fazer-150-2014-2024.webp` |
| **Fazer 150** | 2023–2026 (FZ15 ABS) | `yamaha-fazer-150-2023-2026.webp` |
| **YBR 125 / Factor 125** | 2000–2008 (YBR 125) | `yamaha-ybr-factor-125-2000-2008.webp` |
| **YBR 125 / Factor 125** | 2009–2016 (Factor Carburada) | `yamaha-ybr-factor-125-2009-2016.webp` |
| **YBR 125 / Factor 125** | 2017–2024 (Factor 125i) | `yamaha-ybr-factor-125-2017-2024.webp` |

---

## 4. Modelos Suzuki
| Modelo | Geração | Arquivo Esperado (`public/motos/...`) |
| :--- | :--- | :--- |
| **Intruder 125** | 2002–2007 (VM22) | `suzuki-intruder-125-2002-2007.webp` |
| **Intruder 125** | 2008–2016 (BS26) | `suzuki-intruder-125-2008-2016.webp` |
| **Yes 125 / EN125** | 2005–2016 | `suzuki-yes-125-2005-2016.webp` |
