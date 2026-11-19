import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_SECTION, isSectionId, type SectionId } from '@/lib/sections';
import type { Marca, MotoSelecionada } from '@/types/moto';
import { resolverSelecao } from '@/utils/catalog';

const STORAGE_KEY = 'mototech-pro:moto:v1';

interface PersistedState {
  modeloId: string;
  geracaoId: string;
  section: SectionId;
}

/** Ponto de entrada do wizard ao trocar de moto. */
export interface WizardStart {
  step: 1 | 2 | 3;
  marca?: Marca;
  modeloId?: string;
}

type View = { tipo: 'wizard'; start: WizardStart } | { tipo: 'workspace' };

interface MotoContextValue {
  moto: MotoSelecionada | null;
  section: SectionId;
  view: View;
  selecionarMoto: (modeloId: string, geracaoId: string) => void;
  /** Troca apenas o ano/geração do modelo atual com 1 clique, mantendo a aba ativa. */
  selecionarGeracao: (geracaoId: string) => void;
  setSection: (section: SectionId) => void;
  /** Abre o wizard; `'ano'` começa no passo 3 com o modelo atual. */
  trocarMoto: (inicio?: 'fabricante' | 'ano') => void;
  /** Volta ao workspace sem alterar a moto (se houver uma selecionada). */
  cancelarTroca: () => void;
}

const MotoContext = createContext<MotoContextValue | null>(null);

function lerStorage(): { moto: MotoSelecionada | null; section: SectionId } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { moto: null, section: DEFAULT_SECTION };
    const data = JSON.parse(raw) as Partial<PersistedState>;
    const moto =
      typeof data.modeloId === 'string' && typeof data.geracaoId === 'string'
        ? resolverSelecao(data.modeloId, data.geracaoId)
        : null;
    return { moto, section: isSectionId(data.section) ? data.section : DEFAULT_SECTION };
  } catch {
    return { moto: null, section: DEFAULT_SECTION };
  }
}

export function MotoProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(lerStorage);
  const [moto, setMoto] = useState<MotoSelecionada | null>(initial.moto);
  const [section, setSection] = useState<SectionId>(initial.section);
  const [view, setView] = useState<View>(
    initial.moto ? { tipo: 'workspace' } : { tipo: 'wizard', start: { step: 1 } },
  );

  useEffect(() => {
    try {
      if (!moto) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      const data: PersistedState = { modeloId: moto.modelo.id, geracaoId: moto.geracao.id, section };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage indisponível (modo privado / cota) — segue só em memória.
    }
  }, [moto, section]);

  const selecionarMoto = useCallback((modeloId: string, geracaoId: string) => {
    const selecao = resolverSelecao(modeloId, geracaoId);
    if (!selecao) return;
    setMoto(selecao);
    setSection(DEFAULT_SECTION);
    setView({ tipo: 'workspace' });
  }, []);

  const selecionarGeracao = useCallback(
    (geracaoId: string) => {
      if (!moto) return;
      const selecao = resolverSelecao(moto.modelo.id, geracaoId);
      if (!selecao) return;
      setMoto(selecao);
      setView({ tipo: 'workspace' });
    },
    [moto],
  );

  const trocarMoto = useCallback(
    (inicio: 'fabricante' | 'ano' = 'fabricante') => {
      if (inicio === 'ano' && moto) {
        setView({ tipo: 'wizard', start: { step: 3, marca: moto.marca, modeloId: moto.modelo.id } });
      } else {
        setView({ tipo: 'wizard', start: { step: 1 } });
      }
    },
    [moto],
  );

  const cancelarTroca = useCallback(() => {
    if (moto) setView({ tipo: 'workspace' });
  }, [moto]);

  const value = useMemo<MotoContextValue>(
    () => ({
      moto,
      section,
      view,
      selecionarMoto,
      selecionarGeracao,
      setSection,
      trocarMoto,
      cancelarTroca,
    }),
    [moto, section, view, selecionarMoto, selecionarGeracao, trocarMoto, cancelarTroca],
  );

  return <MotoContext.Provider value={value}>{children}</MotoContext.Provider>;
}

export function useMoto(): MotoContextValue {
  const ctx = useContext(MotoContext);
  if (!ctx) throw new Error('useMoto deve ser usado dentro de <MotoProvider>.');
  return ctx;
}

/** Versão para telas do workspace, onde a moto é obrigatória. */
export function useMotoSelecionada(): MotoSelecionada {
  const { moto } = useMoto();
  if (!moto) throw new Error('Nenhuma moto selecionada.');
  return moto;
}
