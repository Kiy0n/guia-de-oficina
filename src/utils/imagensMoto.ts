/**
 * Helper de resolução de fotos de referência das motocicletas em `public/motos/`.
 *
 * Convenção de nomes (`.webp` para manter o instalador Tauri leve):
 * - Modelos padrão: `/motos/<geracaoId>.webp`
 *   Ex.: `/motos/honda-biz-125-2018-2024.webp`
 * - Família CG com versão selecionada: `/motos/<modeloBase>-<versaoSlug>-<anos>.webp`
 *   Ex.: `/motos/honda-cg-160-fan-2016-2017.webp`
 *   Ex.: `/motos/honda-cg-160-start-2016-2017.webp` (não duplica `start`)
 */
export function getImagemReferenciaMoto(geracaoId: string, versaoSlug?: string): string {
  const cleanId = geracaoId.trim().toLowerCase();
  const slug = versaoSlug?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

  if (slug && !cleanId.includes(`-${slug}-`)) {
    // Insere o slug da versão logo antes da faixa de anos (ex.: honda-cg-160-2016-2017 -> honda-cg-160-fan-2016-2017)
    const matchAnos = cleanId.match(/^(.*)-(\d{4}-\d{4})$/);
    if (matchAnos && matchAnos[1] && matchAnos[2]) {
      return `/motos/${matchAnos[1]}-${slug}-${matchAnos[2]}.webp`;
    }
    return `/motos/${cleanId}-${slug}.webp`;
  }

  return `/motos/${cleanId}.webp`;
}

/**
 * Retorna a lista ordenada de caminhos candidatos para tentativa silenciosa:
 * 1) Foto específica da versão+geração (ex.: `/motos/honda-cg-160-fan-2016-2017.webp`)
 * 2) Foto genérica da geração (ex.: `/motos/honda-cg-160-2016-2017.webp`), caso a específica ainda não exista.
 */
export function getCandidatosImagemMoto(geracaoId: string, versaoSlug?: string): string[] {
  const principal = getImagemReferenciaMoto(geracaoId, versaoSlug);
  const generica = `/motos/${geracaoId.trim().toLowerCase()}.webp`;
  return principal === generica ? [principal] : [principal, generica];
}
