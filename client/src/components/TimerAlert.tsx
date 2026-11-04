import React from 'react';
import { BellRing, X } from 'lucide-react';
import type { TimerItem } from '../types';

interface TimerAlertProps {
  timers: TimerItem[];
  isTvMode: boolean;
  onDismiss: (id: string) => void;
}

/** Banner grande cuando un temporizador termina; se descarta desde el celular o la PC. */
export const TimerAlert: React.FC<TimerAlertProps> = ({ timers, isTvMode, onDismiss }) => {
  const finished = timers.filter((t) => !t.isRunning && t.remainingSeconds === 0);
  if (finished.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {finished.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between gap-4 px-6 py-4 rounded-2xl border-2 border-rose-500/70 bg-rose-950/70 backdrop-blur animate-pulse shadow-lg shadow-rose-950/50"
        >
          <div className="flex items-center gap-4 min-w-0">
            <BellRing className={`text-rose-300 shrink-0 ${isTvMode ? 'w-10 h-10' : 'w-7 h-7'}`} />
            <p className={`font-extrabold text-white truncate ${isTvMode ? 'text-3xl' : 'text-lg'}`}>
              {t.label} terminó
            </p>
          </div>
          {!isTvMode && (
            <button
              onClick={() => onDismiss(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/20 text-rose-100 border border-rose-400/50 hover:bg-rose-500/30 text-sm font-semibold shrink-0"
            >
              <X className="w-4 h-4" /> Descartar
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
