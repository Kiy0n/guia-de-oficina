import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type StatusSincronizacaoFerramentas = 'sincronizado' | 'salvando' | 'offline';

interface FerramentasContextValue {
  ferramentasPossuidas: string[];
  possuiFerramenta: (id: string) => boolean;
  toggleFerramenta: (id: string) => void;
  marcarFerramentaPossuida: (id: string) => void;
  definirListaFerramentas: (ids: string[]) => void;
  statusSincronizacao: StatusSincronizacaoFerramentas;
  recarregarFerramentas: () => Promise<void>;
}

const STORAGE_KEY = 'mototech:ferramentas-possuidas:v1';

const FerramentasContext = createContext<FerramentasContextValue | null>(null);

function lerEspelhoLocal(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return Array.from(
      new Set(parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)),
    );
  } catch {
    return [];
  }
}

function gravarEspelhoLocal(lista: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    // ignore quota errors
  }
}

export function FerramentasProvider({ children }: { children: ReactNode }) {
  const [ferramentasPossuidas, setFerramentasPossuidas] = useState<string[]>(() => lerEspelhoLocal());
  const [statusSincronizacao, setStatusSincronizacao] =
    useState<StatusSincronizacaoFerramentas>('salvando');

  // Referência da última lista para evitar condições de corrida em cliques rápidos
  const listaAtualRef = useRef<string[]>(ferramentasPossuidas);
  listaAtualRef.current = ferramentasPossuidas;

  const persistirNaApi = useCallback(async (novaLista: string[]) => {
    setStatusSincronizacao('salvando');
    gravarEspelhoLocal(novaLista);

    try {
      const res = await fetch('/api/ferramentas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ ferramentasPossuidas: novaLista }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as { ferramentasPossuidas?: unknown };
      if (Array.isArray(data.ferramentasPossuidas)) {
        const confirmadas = data.ferramentasPossuidas.filter(
          (x): x is string => typeof x === 'string',
        );
        gravarEspelhoLocal(confirmadas);
      }
      setStatusSincronizacao('sincronizado');
    } catch {
      setStatusSincronizacao('offline');
    }
  }, []);

  const recarregarFerramentas = useCallback(async () => {
    setStatusSincronizacao('salvando');
    try {
      const res = await fetch('/api/ferramentas', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as { ferramentasPossuidas?: unknown };
      const remotas = Array.isArray(data.ferramentasPossuidas)
        ? data.ferramentasPossuidas.filter((x): x is string => typeof x === 'string')
        : [];

      const locais = lerEspelhoLocal();
      // Se o servidor estiver vazio mas o usuário já tinha itens salvos localmente offline, sincroniza
      if (remotas.length === 0 && locais.length > 0) {
        setFerramentasPossuidas(locais);
        await persistirNaApi(locais);
        return;
      }

      setFerramentasPossuidas(remotas);
      gravarEspelhoLocal(remotas);
      setStatusSincronizacao('sincronizado');
    } catch {
      setFerramentasPossuidas(lerEspelhoLocal());
      setStatusSincronizacao('offline');
    }
  }, [persistirNaApi]);

  useEffect(() => {
    void recarregarFerramentas();
  }, [recarregarFerramentas]);

  const setPossuidas = useMemo(
    () => new Set(ferramentasPossuidas),
    [ferramentasPossuidas],
  );

  const possuiFerramenta = useCallback(
    (id: string) => setPossuidas.has(id),
    [setPossuidas],
  );

  const toggleFerramenta = useCallback(
    (id: string) => {
      const atual = listaAtualRef.current;
      const jaTem = atual.includes(id);
      const novaLista = jaTem ? atual.filter((item) => item !== id) : [...atual, id];
      listaAtualRef.current = novaLista;
      setFerramentasPossuidas(novaLista);
      void persistirNaApi(novaLista);
    },
    [persistirNaApi],
  );

  const marcarFerramentaPossuida = useCallback(
    (id: string) => {
      const atual = listaAtualRef.current;
      if (atual.includes(id)) return;
      const novaLista = [...atual, id];
      listaAtualRef.current = novaLista;
      setFerramentasPossuidas(novaLista);
      void persistirNaApi(novaLista);
    },
    [persistirNaApi],
  );

  const definirListaFerramentas = useCallback(
    (ids: string[]) => {
      const unicos = Array.from(new Set(ids.map((i) => i.trim()).filter(Boolean)));
      listaAtualRef.current = unicos;
      setFerramentasPossuidas(unicos);
      void persistirNaApi(unicos);
    },
    [persistirNaApi],
  );

  const value = useMemo<FerramentasContextValue>(
    () => ({
      ferramentasPossuidas,
      possuiFerramenta,
      toggleFerramenta,
      marcarFerramentaPossuida,
      definirListaFerramentas,
      statusSincronizacao,
      recarregarFerramentas,
    }),
    [
      ferramentasPossuidas,
      possuiFerramenta,
      toggleFerramenta,
      marcarFerramentaPossuida,
      definirListaFerramentas,
      statusSincronizacao,
      recarregarFerramentas,
    ],
  );

  return <FerramentasContext.Provider value={value}>{children}</FerramentasContext.Provider>;
}

export function useFerramentas(): FerramentasContextValue {
  const ctx = useContext(FerramentasContext);
  if (!ctx) {
    throw new Error('useFerramentas deve ser utilizado dentro de <FerramentasProvider>.');
  }
  return ctx;
}
