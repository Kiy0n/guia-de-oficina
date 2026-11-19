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

import { useToast } from '@/context/ToastContext';
import { useWakeLock } from '@/hooks/useWakeLock';
import { resolverSelecao } from '@/utils/catalog';

export type TemaBancada = 'oficina' | 'sol';

export interface MotoAtalho {
  modeloId: string;
  geracaoId: string;
  ultimoAcesso: string;
}

interface PreferenciasPersistidas {
  tema: TemaBancada;
  modoBancada: boolean;
  manterTelaAcesa: boolean;
  menuLateralAberto: boolean;
  recentes: MotoAtalho[];
  favoritas: MotoAtalho[];
}

interface PreferenciasContextValue {
  tema: TemaBancada;
  modoBancada: boolean;
  manterTelaAcesa: boolean;
  menuLateralAberto: boolean;
  wakeLockAtivo: boolean;
  wakeLockSuportado: boolean;
  wakeLockMotivoIndisponivel: string | null;
  recentes: MotoAtalho[];
  favoritas: MotoAtalho[];
  alternarTema: () => void;
  alternarModoBancada: () => void;
  alternarTelaAcesa: () => void;
  alternarMenuLateral: () => void;
  registrarAcessoMoto: (modeloId: string, geracaoId: string) => void;
  toggleFavorita: (modeloId: string, geracaoId: string) => void;
  isFavorita: (modeloId: string, geracaoId: string) => boolean;
}

const STORAGE_KEY = 'guia-oficina:prefs:v1';

const DEFAULT_PREFS: PreferenciasPersistidas = {
  tema: 'oficina',
  modoBancada: false,
  manterTelaAcesa: false,
  menuLateralAberto: true,
  recentes: [],
  favoritas: [],
};

const PreferenciasContext = createContext<PreferenciasContextValue | null>(null);

function normalizarListaAtalhos(raw: unknown, max: number): MotoAtalho[] {
  if (!Array.isArray(raw)) return [];
  const lista: MotoAtalho[] = [];
  const vistos = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;
    const modeloId = typeof obj.modeloId === 'string' ? obj.modeloId : '';
    const geracaoId = typeof obj.geracaoId === 'string' ? obj.geracaoId : '';
    const ultimoAcesso =
      typeof obj.ultimoAcesso === 'string' ? obj.ultimoAcesso : new Date().toISOString();
    if (!modeloId || !geracaoId) continue;
    if (!resolverSelecao(modeloId, geracaoId)) continue;
    const chave = `${modeloId}::${geracaoId}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    lista.push({ modeloId, geracaoId, ultimoAcesso });
    if (lista.length >= max) break;
  }
  return lista;
}

function lerPreferencias(): PreferenciasPersistidas {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<PreferenciasPersistidas>;
    return {
      tema: parsed.tema === 'sol' ? 'sol' : 'oficina',
      modoBancada: Boolean(parsed.modoBancada),
      manterTelaAcesa: Boolean(parsed.manterTelaAcesa),
      menuLateralAberto:
        typeof parsed.menuLateralAberto === 'boolean' ? parsed.menuLateralAberto : true,
      recentes: normalizarListaAtalhos(parsed.recentes, 4),
      favoritas: normalizarListaAtalhos(parsed.favoritas, 8),
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const { mostrarToast } = useToast();
  const [prefs, setPrefs] = useState<PreferenciasPersistidas>(lerPreferencias);
  const prefsRef = useRef<PreferenciasPersistidas>(prefs);
  prefsRef.current = prefs;

  const { suportado, ativoNoNavegador, motivoIndisponivel } = useWakeLock(
    prefs.manterTelaAcesa,
  );

  // Persiste no localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [prefs]);

  // Aplica classes globais no <html> (.dark vs .theme-sol e .modo-bancada)
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.tema === 'sol') {
      root.classList.remove('dark');
      root.classList.add('theme-sol');
    } else {
      root.classList.remove('theme-sol');
      root.classList.add('dark');
    }

    if (prefs.modoBancada) {
      root.classList.add('modo-bancada');
    } else {
      root.classList.remove('modo-bancada');
    }

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', prefs.tema === 'sol' ? '#ffffff' : '#141519');
    }
  }, [prefs.tema, prefs.modoBancada]);

  const alternarTema = useCallback(() => {
    const atual = prefsRef.current;
    const proximo: TemaBancada = atual.tema === 'oficina' ? 'sol' : 'oficina';
    const atualizado: PreferenciasPersistidas = { ...atual, tema: proximo };
    prefsRef.current = atualizado;
    setPrefs(atualizado);

    mostrarToast({
      dedupeKey: 'tema',
      titulo:
        proximo === 'sol'
          ? 'Tema Claro ativado'
          : 'Tema Escuro ativado',
      variante: 'default',
      duracaoMs: 2200,
    });
  }, [mostrarToast]);

  const alternarMenuLateral = useCallback(() => {
    const atual = prefsRef.current;
    const atualizado: PreferenciasPersistidas = {
      ...atual,
      menuLateralAberto: !atual.menuLateralAberto,
    };
    prefsRef.current = atualizado;
    setPrefs(atualizado);
  }, []);

  const alternarModoBancada = useCallback(() => {
    const atual = prefsRef.current;
    const proximo = !atual.modoBancada;
    const atualizado: PreferenciasPersistidas = { ...atual, modoBancada: proximo };
    prefsRef.current = atualizado;
    setPrefs(atualizado);

    mostrarToast({
      dedupeKey: 'modo-bancada',
      titulo: proximo ? 'Modo Bancada (A+) ativado' : 'Modo Bancada desativado',
      descricao: proximo
        ? 'Botões maiores (48px+) e valores técnicos ampliados para leitura à distância.'
        : 'Layout padrão restaurado.',
      variante: 'default',
      duracaoMs: 2600,
    });
  }, [mostrarToast]);

  const alternarTelaAcesa = useCallback(() => {
    const atual = prefsRef.current;
    const proximo = !atual.manterTelaAcesa;

    if (proximo && !suportado) {
      const atualizado: PreferenciasPersistidas = { ...atual, manterTelaAcesa: false };
      prefsRef.current = atualizado;
      setPrefs(atualizado);

      mostrarToast({
        dedupeKey: 'wake-lock',
        titulo: 'Tela Acesa indisponível neste navegador',
        descricao:
          'A API Wake Lock exige localhost ou HTTPS (em HTTP na rede local, ajuste o tempo de tela nas configurações do celular).',
        variante: 'aviso',
        duracaoMs: 4500,
      });
      return;
    }

    const atualizado: PreferenciasPersistidas = { ...atual, manterTelaAcesa: proximo };
    prefsRef.current = atualizado;
    setPrefs(atualizado);

    mostrarToast({
      dedupeKey: 'wake-lock',
      titulo: proximo ? 'Tela Acesa ativada' : 'Tela Acesa desativada',
      descricao: proximo
        ? 'A tela permanecerá ligada enquanto você consulta a bancada.'
        : 'Bloqueio automático de tela liberado.',
      variante: 'sucesso',
      duracaoMs: 2400,
    });
  }, [suportado, mostrarToast]);

  const registrarAcessoMoto = useCallback((modeloId: string, geracaoId: string) => {
    setPrefs((prev) => {
      const filtrados = prev.recentes.filter(
        (r) => !(r.modeloId === modeloId && r.geracaoId === geracaoId),
      );
      const novo: MotoAtalho = {
        modeloId,
        geracaoId,
        ultimoAcesso: new Date().toISOString(),
      };
      return {
        ...prev,
        recentes: [novo, ...filtrados].slice(0, 4),
      };
    });
  }, []);

  const toggleFavorita = useCallback(
    (modeloId: string, geracaoId: string) => {
      const atual = prefsRef.current;
      const existe = atual.favoritas.some(
        (f) => f.modeloId === modeloId && f.geracaoId === geracaoId,
      );
      const novas = existe
        ? atual.favoritas.filter(
            (f) => !(f.modeloId === modeloId && f.geracaoId === geracaoId),
          )
        : [
            { modeloId, geracaoId, ultimoAcesso: new Date().toISOString() },
            ...atual.favoritas,
          ].slice(0, 8);

      const atualizado: PreferenciasPersistidas = { ...atual, favoritas: novas };
      prefsRef.current = atualizado;
      setPrefs(atualizado);

      mostrarToast({
        dedupeKey: 'favorita',
        titulo: existe ? 'Removida das suas motos favoritas' : 'Moto fixada em Minhas Motos ⭐',
        variante: existe ? 'default' : 'sucesso',
        duracaoMs: 2200,
      });
    },
    [mostrarToast],
  );

  const isFavorita = useCallback(
    (modeloId: string, geracaoId: string) =>
      prefs.favoritas.some((f) => f.modeloId === modeloId && f.geracaoId === geracaoId),
    [prefs.favoritas],
  );

  const value = useMemo<PreferenciasContextValue>(
    () => ({
      tema: prefs.tema,
      modoBancada: prefs.modoBancada,
      manterTelaAcesa: prefs.manterTelaAcesa,
      menuLateralAberto: prefs.menuLateralAberto,
      wakeLockAtivo: ativoNoNavegador,
      wakeLockSuportado: suportado,
      wakeLockMotivoIndisponivel: motivoIndisponivel,
      recentes: prefs.recentes,
      favoritas: prefs.favoritas,
      alternarTema,
      alternarModoBancada,
      alternarTelaAcesa,
      alternarMenuLateral,
      registrarAcessoMoto,
      toggleFavorita,
      isFavorita,
    }),
    [
      prefs,
      ativoNoNavegador,
      suportado,
      motivoIndisponivel,
      alternarTema,
      alternarModoBancada,
      alternarTelaAcesa,
      alternarMenuLateral,
      registrarAcessoMoto,
      toggleFavorita,
      isFavorita,
    ],
  );

  return <PreferenciasContext.Provider value={value}>{children}</PreferenciasContext.Provider>;
}

export function usePreferencias(): PreferenciasContextValue {
  const ctx = useContext(PreferenciasContext);
  if (!ctx) {
    throw new Error('usePreferencias deve ser usado dentro de <PreferenciasProvider>.');
  }
  return ctx;
}
