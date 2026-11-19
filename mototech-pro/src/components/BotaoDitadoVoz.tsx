import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternativeLike | undefined;
}

interface SpeechRecognitionEventLike {
  results: {
    readonly length: number;
    [index: number]: SpeechRecognitionResultLike | undefined;
  };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface WindowWithSpeech extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as WindowWithSpeech;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface BotaoDitadoVozProps {
  onTranscricao: (texto: string) => void;
  className?: string;
  compacto?: boolean;
}

export function BotaoDitadoVoz({
  onTranscricao,
  className,
  compacto = false,
}: BotaoDitadoVozProps) {
  const ctor = getSpeechRecognitionCtor();
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const [ouvindo, setOuvindo] = useState(false);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  // Fallback silencioso se o navegador não suportar Web Speech API
  if (!ctor) return null;

  const alternarGravacao = () => {
    if (ouvindo) {
      try {
        recRef.current?.stop();
      } catch {
        // ignore
      }
      setOuvindo(false);
      return;
    }

    try {
      const rec = new ctor();
      rec.lang = 'pt-BR';
      rec.interimResults = false;
      rec.continuous = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => setOuvindo(true);
      rec.onend = () => setOuvindo(false);
      rec.onerror = () => setOuvindo(false);
      rec.onresult = (event) => {
        const partes: string[] = [];
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const alt = res?.[0];
          if (alt?.transcript) {
            partes.push(alt.transcript.trim());
          }
        }
        const textoFinal = partes.join(' ').trim();
        if (textoFinal) {
          onTranscricao(textoFinal);
        }
      };

      recRef.current = rec;
      rec.start();
    } catch {
      setOuvindo(false);
    }
  };

  return (
    <Button
      type="button"
      data-compact={compacto ? 'true' : undefined}
      variant={ouvindo ? 'destructive' : 'outline'}
      size="sm"
      onClick={alternarGravacao}
      title={ouvindo ? 'Parar ditado por voz' : 'Ditar observação por voz (pt-BR)'}
      aria-label={ouvindo ? 'Parar ditado por voz' : 'Ditar observação por voz'}
      className={cn(
        'shrink-0 gap-1.5 text-xs',
        ouvindo && 'animate-pulse',
        className,
      )}
    >
      {ouvindo ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
      <span>{ouvindo ? 'Ouvindo...' : compacto ? 'Voz' : 'Ditar por voz'}</span>
    </Button>
  );
}
