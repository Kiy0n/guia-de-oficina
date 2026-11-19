import { AppShell } from '@/components/AppShell';
import { MotoSelectorWizard } from '@/components/MotoSelectorWizard';
import { MotoProvider, useMoto } from '@/context/MotoContext';

function Router() {
  const { view, moto } = useMoto();

  if (view.tipo === 'wizard' || !moto) {
    const start = view.tipo === 'wizard' ? view.start : { step: 1 as const };
    // `key` reinicia o estado interno do wizard a cada nova abertura.
    return <MotoSelectorWizard key={JSON.stringify(start)} start={start} />;
  }

  return <AppShell />;
}

export default function App() {
  return (
    <MotoProvider>
      <Router />
    </MotoProvider>
  );
}
