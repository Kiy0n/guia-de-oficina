import { useCallback, useEffect, useRef, useState } from 'react';

export function useWakeLock(habilitado: boolean) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const [ativoNoNavegador, setAtivoNoNavegador] = useState(false);
  const [motivoIndisponivel, setMotivoIndisponivel] = useState<string | null>(null);

  const suportado =
    typeof navigator !== 'undefined' &&
    'wakeLock' in navigator &&
    typeof navigator.wakeLock?.request === 'function';

  const liberar = useCallback(async () => {
    const atual = sentinelRef.current;
    sentinelRef.current = null;
    setAtivoNoNavegador(false);
    if (atual && !atual.released) {
      await atual.release().catch(() => undefined);
    }
  }, []);

  const solicitar = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || typeof navigator.wakeLock?.request !== 'function') {
      setMotivoIndisponivel(
        'Seu navegador ou conexão HTTP local não libera a API Tela Acesa (requer localhost ou HTTPS).',
      );
      setAtivoNoNavegador(false);
      return false;
    }

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      sentinelRef.current = sentinel;
      setAtivoNoNavegador(true);
      setMotivoIndisponivel(null);

      sentinel.addEventListener('release', () => {
        setAtivoNoNavegador(false);
      });
      return true;
    } catch {
      setAtivoNoNavegador(false);
      setMotivoIndisponivel(
        'Não foi possível travar a tela acesa neste contexto (verifique economia de bateria ou use localhost/HTTPS).',
      );
      return false;
    }
  }, []);

  useEffect(() => {
    if (!habilitado) {
      void liberar();
      setMotivoIndisponivel(null);
      return;
    }

    void solicitar();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && habilitado) {
        void solicitar();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      void liberar();
    };
  }, [habilitado, solicitar, liberar]);

  return {
    suportado,
    ativoNoNavegador,
    motivoIndisponivel,
  };
}
