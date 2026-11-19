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
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, RotateCcw, X, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ToastVariante = 'default' | 'sucesso' | 'aviso' | 'erro';

export interface ToastInput {
  titulo: string;
  descricao?: string;
  variante?: ToastVariante;
  duracaoMs?: number;
  acaoDesfazer?: () => void | Promise<void>;
  labelAcao?: string;
  /** Chave estável opcional para substituir/atualizar toasts do mesmo grupo (ex.: 'tema', 'modo-bancada'). */
  dedupeKey?: string;
}

interface ToastItem extends ToastInput {
  id: string;
  variante: ToastVariante;
  criadoEmMs: number;
}

interface ToastContextValue {
  mostrarToast: (input: ToastInput) => string;
  dispensarToast: (id: string) => void;
}

const ANTI_DUPLICATE_WINDOW_MS = 400;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastsRef = useRef<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  toastsRef.current = toasts;

  const limparTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const dispensarToast = useCallback(
    (id: string) => {
      limparTimer(id);
      setToasts((prev) => {
        const next = prev.filter((t) => t.id !== id);
        toastsRef.current = next;
        return next;
      });
    },
    [limparTimer],
  );

  const agendarAutoFechamento = useCallback(
    (id: string, duracaoMs: number) => {
      limparTimer(id);
      const timer = window.setTimeout(() => {
        dispensarToast(id);
      }, duracaoMs);
      timersRef.current.set(id, timer);
    },
    [limparTimer, dispensarToast],
  );

  // Limpa todos os timers ao desmontar o provider
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const mostrarToast = useCallback(
    (input: ToastInput) => {
      const agora = Date.now();
      const variante = input.variante ?? 'default';
      const duracao = input.duracaoMs ?? (input.acaoDesfazer ? 5200 : 3400);
      const ativos = toastsRef.current;

      // 1) Substituição por dedupeKey (evita empilhar toggles rápidos como Sol <-> Oficina)
      if (input.dedupeKey) {
        const existenteChave = ativos.find((t) => t.dedupeKey === input.dedupeKey);
        if (existenteChave) {
          const atualizado: ToastItem = {
            ...input,
            id: existenteChave.id,
            variante,
            criadoEmMs: agora,
          };
          const proximos = ativos.map((t) => (t.id === existenteChave.id ? atualizado : t));
          toastsRef.current = proximos;
          setToasts(proximos);
          agendarAutoFechamento(existenteChave.id, duracao);
          return existenteChave.id;
        }
      }

      // 2) Proteção automática anti-duplicata dentro de 400ms para toasts idênticos
      const duplicadoRecente = ativos.find(
        (t) =>
          t.titulo === input.titulo &&
          (t.descricao ?? '') === (input.descricao ?? '') &&
          t.variante === variante &&
          agora - t.criadoEmMs <= ANTI_DUPLICATE_WINDOW_MS,
      );

      if (duplicadoRecente) {
        const atualizado: ToastItem = {
          ...duplicadoRecente,
          criadoEmMs: agora,
        };
        const proximos = ativos.map((t) => (t.id === duplicadoRecente.id ? atualizado : t));
        toastsRef.current = proximos;
        setToasts(proximos);
        agendarAutoFechamento(duplicadoRecente.id, duracao);
        return duplicadoRecente.id;
      }

      // 3) Novo toast (mantendo no máximo 4 visíveis; limpa timer do que sair)
      const id = `toast-${agora}-${Math.random().toString(36).slice(2, 7)}`;
      const novo: ToastItem = {
        ...input,
        id,
        variante,
        criadoEmMs: agora,
      };

      const removidosPorLimite = ativos.length >= 4 ? ativos.slice(0, ativos.length - 3) : [];
      for (const r of removidosPorLimite) {
        limparTimer(r.id);
      }

      const proximos = [...ativos.slice(-3), novo];
      toastsRef.current = proximos;
      setToasts(proximos);
      agendarAutoFechamento(id, duracao);

      return id;
    },
    [agendarAutoFechamento, limparTimer],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ mostrarToast, dispensarToast }),
    [mostrarToast, dispensarToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Container único de Toasts (acima da barra mobile em telas pequenas) */}
      <div
        aria-live="polite"
        className="no-print pointer-events-none fixed right-3 bottom-20 z-50 flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-2 md:right-5 md:bottom-5"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const Icon =
              toast.variante === 'sucesso'
                ? CheckCircle2
                : toast.variante === 'aviso'
                  ? AlertTriangle
                  : toast.variante === 'erro'
                    ? XCircle
                    : Info;

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'pointer-events-auto flex items-start gap-2.5 rounded-xl border bg-card/95 p-3.5 text-card-foreground shadow-xl backdrop-blur',
                  toast.variante === 'sucesso' && 'border-emerald-500/45',
                  toast.variante === 'aviso' && 'border-amber-500/45',
                  toast.variante === 'erro' && 'border-rose-500/50',
                )}
              >
                <Icon
                  className={cn(
                    'mt-0.5 size-4 shrink-0',
                    toast.variante === 'sucesso' && 'text-emerald-400',
                    toast.variante === 'aviso' && 'text-amber-400',
                    toast.variante === 'erro' && 'text-rose-400',
                    toast.variante === 'default' && 'text-primary',
                  )}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-snug">{toast.titulo}</p>
                  {toast.descricao && (
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      {toast.descricao}
                    </p>
                  )}

                  {toast.acaoDesfazer && (
                    <div className="mt-2">
                      <Button
                        type="button"
                        data-compact="true"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          void toast.acaoDesfazer?.();
                          dispensarToast(toast.id);
                        }}
                        className="h-7 gap-1.5 px-2.5 text-xs font-bold"
                      >
                        <RotateCcw className="size-3" />
                        {toast.labelAcao ?? 'Desfazer'}
                      </Button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  data-compact="true"
                  onClick={() => dispensarToast(toast.id)}
                  aria-label="Fechar notificação"
                  className="rounded-md p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve ser usado dentro de <ToastProvider>.');
  }
  return ctx;
}
