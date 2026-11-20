const EXTENSOES_SUPORTADAS = ['webp', 'png', 'jpg'] as const;

function montarBaseNomeFoto(geracaoId: string, versaoSlug?: string): string {
  const cleanId = geracaoId.trim().toLowerCase();
  const slug = versaoSlug?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

  if (slug && !cleanId.includes(`-${slug}-`)) {
    const matchAnos = cleanId.match(/^(.*)-(\d{4}-\d{4})$/);
    if (matchAnos && matchAnos[1] && matchAnos[2]) {
      return `${matchAnos[1]}-${slug}-${matchAnos[2]}`;
    }
    return `${cleanId}-${slug}`;
  }

  return cleanId;
}

/**
 * Retorna o caminho preferencial (`.webp`) da foto de referência em `public/motos/`.
 *
 * Exemplos:
 * - Padrão: `/motos/honda-biz-125-2018-2026.webp`
 * - Honda CG com versão: `/motos/honda-cg-160-fan-2016-2017.webp`, `/motos/honda-cg-160-start-2016-2017.webp`
 * - Yamaha com versão: `/motos/yamaha-crosser-150-z-2019-2026.webp`, `/motos/yamaha-fazer-150-fz15-2023-2026.webp`
 */
export function getImagemReferenciaMoto(geracaoId: string, versaoSlug?: string): string {
  return `/motos/${montarBaseNomeFoto(geracaoId, versaoSlug)}.webp`;
}

/**
 * Retorna a lista ordenada de caminhos candidatos para carregamento silencioso:
 * 1) Foto específica da versão+geração em `.webp`, `.png`, `.jpg`
 * 2) Foto genérica da geração em `.webp`, `.png`, `.jpg` (fallback caso a específica não exista)
 */
export function getCandidatosImagemMoto(geracaoId: string, versaoSlug?: string): string[] {
  const baseEspecifica = montarBaseNomeFoto(geracaoId, versaoSlug);
  const baseGenerica = geracaoId.trim().toLowerCase();

  const bases =
    baseEspecifica === baseGenerica ? [baseEspecifica] : [baseEspecifica, baseGenerica];

  const candidatos: string[] = [];
  for (const base of bases) {
    for (const ext of EXTENSOES_SUPORTADAS) {
      candidatos.push(`/motos/${base}.${ext}`);
    }
  }
  return candidatos;
}
