import { useEffect, useState } from 'react';

export type ApiStatus = 'verificando' | 'online' | 'offline';

/** Consulta `/api/health` ao montar e a cada `intervalMs`. */
export function useApiHealth(intervalMs = 30_000): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>('verificando');

  useEffect(() => {
    let controller: AbortController | null = null;

    const check = () => {
      controller?.abort();
      controller = new AbortController();
      fetch('/api/health', { signal: controller.signal, cache: 'no-store' })
        .then((res) => setStatus(res.ok ? 'online' : 'offline'))
        .catch((err: unknown) => {
          if (!(err instanceof DOMException && err.name === 'AbortError')) setStatus('offline');
        });
    };

    check();
    const id = window.setInterval(check, intervalMs);
    return () => {
      window.clearInterval(id);
      controller?.abort();
    };
  }, [intervalMs]);

  return status;
}
