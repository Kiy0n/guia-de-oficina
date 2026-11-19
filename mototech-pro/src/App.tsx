import { useEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';

import { AppShell } from '@/components/AppShell';
import { MotoSelectorWizard } from '@/components/MotoSelectorWizard';
import { MotoProvider, useMoto } from '@/context/MotoContext';
import { PreferenciasProvider, usePreferencias } from '@/context/PreferenciasContext';
import { ToastProvider } from '@/context/ToastContext';

const VIEW_TRANSITION = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1] as const,
};

function Router() {
  const { view, moto } = useMoto();
  const { registrarAcessoMoto } = usePreferencias();
  const isWizard = view.tipo === 'wizard' || !moto;
  const start = view.tipo === 'wizard' ? view.start : { step: 1 as const };

  useEffect(() => {
    if (moto) {
      registrarAcessoMoto(moto.modelo.id, moto.geracao.id);
    }
  }, [moto, registrarAcessoMoto]);

  return (
    <AnimatePresence mode="wait">
      {isWizard ? (
        <motion.div
          key={`wizard-${JSON.stringify(start)}`}
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.99 }}
          transition={VIEW_TRANSITION}
        >
          <MotoSelectorWizard start={start} />
        </motion.div>
      ) : (
        <motion.div
          key="app-shell"
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.99 }}
          transition={VIEW_TRANSITION}
        >
          <AppShell />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <PreferenciasProvider>
          <MotoProvider>
            <Router />
          </MotoProvider>
        </PreferenciasProvider>
      </ToastProvider>
    </MotionConfig>
  );
}
