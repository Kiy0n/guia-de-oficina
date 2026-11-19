import { useEffect, useState } from 'react';
import { Activity, BookOpen, Gauge, Stethoscope, Wrench } from 'lucide-react';
import { CILINDRADA_MAXIMA, type Marca } from '@/types/moto';

type ApiStatus = 'verificando' | 'online' | 'offline';

const MARCAS: Marca[] = ['Honda', 'Yamaha'];

const MODULOS = [
  { icon: Gauge, titulo: 'Fichas Técnicas', descricao: 'Torques, folgas, fluidos e especificações.' },
  { icon: Wrench, titulo: 'Preventiva', descricao: 'Plano de revisões por quilometragem.' },
  { icon: Stethoscope, titulo: 'Corretiva', descricao: 'Diagnóstico por sintoma e soluções.' },
  { icon: BookOpen, titulo: 'Procedimentos', descricao: 'Passo a passo de bancada.' },
] as const;

export default function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('verificando');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal })
      .then((res) => setApiStatus(res.ok ? 'online' : 'offline'))
      .catch((err: unknown) => {
        if (!(err instanceof DOMException && err.name === 'AbortError')) setApiStatus('offline');
      });
    return () => controller.abort();
  }, []);

  const statusColor =
    apiStatus === 'online' ? 'text-emerald-400' : apiStatus === 'offline' ? 'text-red-400' : 'text-neutral-400';

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
      <header className="flex items-center justify-between border-b border-neutral-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-500/15 p-2.5 text-brand-400">
            <Wrench className="size-7" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MotoTech Pro</h1>
            <p className="text-sm text-neutral-400">
              Bancada de manutenção · {MARCAS.join(' & ')} até {CILINDRADA_MAXIMA}cc
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 text-sm ${statusColor}`}>
          <Activity className="size-4" aria-hidden />
          API {apiStatus}
        </div>
      </header>

      <main className="grid flex-1 content-start gap-4 py-10 sm:grid-cols-2">
        {MODULOS.map(({ icon: Icon, titulo, descricao }) => (
          <div
            key={titulo}
            className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 transition hover:border-brand-500/50"
          >
            <Icon className="mb-3 size-6 text-brand-400" aria-hidden />
            <h2 className="font-semibold">{titulo}</h2>
            <p className="mt-1 text-sm text-neutral-400">{descricao}</p>
          </div>
        ))}
      </main>

      <footer className="border-t border-neutral-800 pt-6 text-xs text-neutral-500">
        Projeto pessoal · dados técnicos estáticos em <code className="font-mono">src/data</code>
      </footer>
    </div>
  );
}
