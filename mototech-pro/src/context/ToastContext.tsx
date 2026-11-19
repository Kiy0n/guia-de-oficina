import {
  createContext,
  useCallback,
  useContext,
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
}

interface ToastItem extends ToastInput {
  id: string;
  variante: ToastVariante;
}

interface ToastContextValue {
  mostrarToast: (input: ToastInput) => string;
  dispensarToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dispensarToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const mostrarToast = useCallback(
    (input: ToastInput) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const variante = input.variante ?? 'default';
      const duracao = input.duracaoMs ?? (input.acaoDesfazer ? 5200 : 3400);

      setToasts((prev) => [...prev.slice(-3), { ...input, id, variante }]);

      const timer = window.setTimeout(() => {
        dispensarToast(id);
      }, duracao);
      timersRef.current.set(id, timer);

      return id;
    },
    [dispensarToast],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ mostrarToast, dispensarToast }),
    [mostrarToast, dispensarToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Container flutuante de Toasts (acima da barra mobile em telas pequenas) */}
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
