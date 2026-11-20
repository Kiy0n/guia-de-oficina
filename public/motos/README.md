# Fotos de Referência das Motocicletas — Guia de Oficina

Coloque aqui as fotos das motos para exibição automática nos cards de seleção de **Ano / Geração** em `MotoSelectorWizard.tsx`.

- **Formato recomendado:** **`.webp`** (largura ~640–800 px, proporção `16:10`, `< 80 KB` por arquivo para manter o instalador Tauri leve).
- **Fallback automático de extensão:** caso você salve temporariamente como **`.png`** ou **`.jpg`** com o mesmo nome-base, o aplicativo carrega automaticamente na ordem `.webp` → `.png` → `.jpg`.
- **Fallback invisível:** se a foto ainda não existir nesta pasta, o card oculta o bloco de imagem sem ícone quebrado e sem alterar o layout.
- **Offline (Docker + Tauri):** o `vite.config.ts` copia `public/motos/` para `dist/motos/` no build (enquanto mantém `public/manuals/` fora de `dist/`).

---

## Honda

### Honda → CG 125 (com ramificação de versão)
| Versão | Ano / Geração | Arquivo Esperado (`public/motos/...`) |
| :--- | :--- | :--- |
| **Titan** | 2000–2004 (OHV) | `honda-cg-125-titan-2000-2008.webp` |
| **Fan** | 2005–2008 (OHV) | `honda-cg-125-fan-2000-2008.webp` |
| **Fan** | 2009–2015 (OHC Carburada) | `honda-cg-125-fan-2009-2015.webp` |
| **Fan 125i** | 2016–2018 (PGM-FI) | `honda-cg-125-fan-2016-2018.webp` |
| **Cargo** | 2000–2008 (OHV) | `honda-cg-125-cargo-2000-2008.webp` |
| **Cargo** | 2009–2015 (OHC Carburada) | `honda-cg-125-cargo-2009-2015.webp` |
| **Cargo 125i** | 2016–2018 (PGM-FI) | `honda-cg-125-cargo-2016-2018.webp` |

### Honda → CG 150 (com ramificação de versão)
| Versão | Ano / Geração | Arquivo Esperado (`public/motos/...`) |
| :--- | :--- | :--- |
| **Titan** | 2004–2008 (Carburada) | `honda-cg-150-titan-2004-2008.webp` |
| **Titan** | 2009–2015 (PGM-FI / Mix / Flex) | `honda-cg-150-titan-2009-2015.webp` |
| **Fan** | 2009–2015 (ESi / ESDi) | `honda-cg-150-fan-2009-2015.webp` |
| **Cargo** | 2014–2015 (PGM-FI) | `honda-cg-150-cargo-2009-2015.webp` |
| **Sport** | 2005–2008 (Carburada) | `honda-cg-150-sport-2004-2008.webp` |

### Honda → CG 160 (com ramificação de versão)
| Versão | Ano / Geração | Arquivo Esperado (`public/motos/...`) |
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

### Honda → Demais Modelos (fluxo direto Modelo → Ano)
| Modelo | Ano / Geração | Arquivo Esperado (`public/motos/...`) |
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

## Yamaha

### Yamaha → Fazer 150 (com ramificação de versão)
| Versão | Ano / Geração | Arquivo Esperado (`public/motos/...`) |
| :--- | :--- | :--- |
| **YS150 Fazer** | 2014–2024 (ED / SED / UBS) | `yamaha-fazer-150-ys150-2014-2024.webp` |
| **FZ15 ABS** | 2023–2026 (ABS / LED) | `yamaha-fazer-150-fz15-2023-2026.webp` |

### Yamaha → YBR 125 / Factor 125 (com ramificação de versão)
| Versão | Ano / Geração | Arquivo Esperado (`public/motos/...`) |
| :--- | :--- | :--- |
| **YBR 125** | 2000–2008 (Carburada) | `yamaha-ybr-factor-125-ybr125-2000-2008.webp` |
| **Factor 125** | 2009–2016 (Carburada) | `yamaha-ybr-factor-125-factor125-2009-2016.webp` |
| **Factor 125i** | 2017–2024 (Injetada Blueflex) | `yamaha-ybr-factor-125-factor125i-2017-2024.webp` |

### Yamaha → Crosser 150 (com ramificação de versão)
| Versão | Ano / Geração | Arquivo Esperado (`public/motos/...`) |
| :--- | :--- | :--- |
| **Crosser S** *(para-lama baixo)* | 2015–2018 (E / ED / S) | `yamaha-crosser-150-s-2015-2018.webp` |
| **Crosser S** *(para-lama baixo)* | 2019–2026 (ABS / LED) | `yamaha-crosser-150-s-2019-2026.webp` |
| **Crosser Z** *(para-lama alto)* | 2015–2018 (Z) | `yamaha-crosser-150-z-2015-2018.webp` |
| **Crosser Z** *(para-lama alto)* | 2019–2026 (ABS / LED) | `yamaha-crosser-150-z-2019-2026.webp` |

### Yamaha → Demais Modelos (fluxo direto Modelo → Ano)
| Modelo | Ano / Geração | Arquivo Esperado (`public/motos/...`) |
| :--- | :--- | :--- |
| **Factor 150** | 2016–2024 (Blueflex) | `yamaha-factor-150-2016-2024.webp` |
| **Factor 150** | 2025–2026 (LED / DX) | `yamaha-factor-150-2025-2026.webp` |
| **Fazer 125** | 2016–2024 | `yamaha-fazer-125-2016-2024.webp` |

---

## Suzuki

### Suzuki → Modelos (fluxo direto Modelo → Ano)
| Modelo | Ano / Geração | Arquivo Esperado (`public/motos/...`) |
| :--- | :--- | :--- |
| **Intruder 125** | 2002–2007 (VM22) | `suzuki-intruder-125-2002-2007.webp` |
| **Intruder 125** | 2008–2016 (BS26) | `suzuki-intruder-125-2008-2016.webp` |
| **Yes 125 / EN125** | 2005–2016 | `suzuki-yes-125-2005-2016.webp` |
