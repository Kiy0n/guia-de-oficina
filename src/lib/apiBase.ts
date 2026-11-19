import { useEffect, useState } from 'react';

let cachedBaseUrl: string | null = null;
let pendingBaseUrl: Promise<string> | null = null;

/** Detecta se o app está rodando dentro do runtime nativo Tauri v2. */
export function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Retorna a URL base da API local:
 * - No Tauri v2: `http://127.0.0.1:<porta>` obtida uma única vez via comando Rust `get_api_base_url`.
 * - No navegador / Docker (Express 5): `""` (mantém URLs relativas intactas).
 */
export function getApiBaseUrl(): Promise<string> {
  if (cachedBaseUrl !== null) {
    return Promise.resolve(cachedBaseUrl);
  }
  if (!isTauriRuntime()) {
    cachedBaseUrl = '';
    return Promise.resolve('');
  }
  if (!pendingBaseUrl) {
    pendingBaseUrl = import('@tauri-apps/api/core')
      .then(({ invoke }) => invoke<string>('get_api_base_url'))
      .then((url) => {
        const clean = typeof url === 'string' ? url.replace(/\/+$/, '') : '';
        cachedBaseUrl = clean;
        return clean;
      })
      .catch((err: unknown) => {
        console.error('[apiBase] Falha ao obter get_api_base_url do Tauri:', err);
        pendingBaseUrl = null;
        return '';
      });
  }
  return pendingBaseUrl;
}

/** Combina uma URL base com um caminho relativo (`/api/...` ou `/manuals/...`). */
export function prefixApiUrl(baseUrl: string, path: string): string {
  if (!path) return baseUrl;
  if (/^https?:\/\//i.test(path)) return path;
  if (!baseUrl) return path;
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Versão assíncrona para uso em `fetch(...)`. */
export async function resolveApiUrl(path: string): Promise<string> {
  const baseUrl = await getApiBaseUrl();
  return prefixApiUrl(baseUrl, path);
}

/** Hook React para componentes que precisam da URL base de forma reativa (ex.: `<iframe src>`). */
export function useApiBaseUrl(): string {
  const [baseUrl, setBaseUrl] = useState<string>(() => cachedBaseUrl ?? '');

  useEffect(() => {
    if (cachedBaseUrl !== null) {
      setBaseUrl(cachedBaseUrl);
      return;
    }
    let ativo = true;
    void getApiBaseUrl().then((url) => {
      if (ativo) setBaseUrl(url);
    });
    return () => {
      ativo = false;
    };
  }, []);

  return baseUrl;
}
