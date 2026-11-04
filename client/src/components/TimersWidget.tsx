import React, { useState } from 'react';
import { Timer as TimerIcon, Play, Pause, RotateCcw, Plus } from 'lucide-react';
import type { TimerItem } from '../types';

interface TimersWidgetProps {
  timers: TimerItem[];
  onTimerAction: (id: string, action: 'start' | 'pause' | 'reset' | 'custom', minutes?: number, label?: string) => void;
  isTvMode?: boolean;
}

export const TimersWidget: React.FC<TimersWidgetProps> = ({
  timers,
  onTimerAction,
  isTvMode = false
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newMinutes, setNewMinutes] = useState(10);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel) return;
    const id = `custom-${Date.now()}`;
    onTimerAction(id, 'custom', newMinutes, newLabel);
    setNewLabel('');
    setShowAddModal(false);
  };

  return (
    <div className="emai-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-[var(--line)] pb-3">
        <div className="flex items-center gap-2.5">
          <TimerIcon className="w-5 h-5 text-[var(--accent)]" />
          <h2 className="font-medium text-lg text-[var(--ink)] tracking-tight">Temporizadores</h2>
        </div>
        {!isTvMode && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25 border border-[var(--accent)]/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo</span>
          </button>
        )}
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
        {timers.map((timer) => {
          const progressPercent = Math.max(
            0,
            Math.min(100, ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100)
          );

          const isFinished = timer.remainingSeconds === 0;

          return (
            <div
              key={timer.id}
              className={`p-3.5 rounded-xl border transition-all ${
                timer.isRunning
                  ? 'bg-black/30 border-[var(--accent)]/50 shadow-sm'
                  : isFinished
                  ? 'bg-rose-950/40 border-rose-500/60 animate-pulse'
                  : 'bg-black/20 border-[var(--line)]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-sm text-[var(--ink)] block">{timer.label}</span>
                  <span className="text-[11px] text-[var(--muted)] font-medium">
                    Total: {Math.round(timer.totalSeconds / 60)} min
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-2xl font-normal font-mono tracking-tight ${
                      isFinished
                        ? 'text-rose-400 font-bold'
                        : timer.isRunning
                        ? 'text-[var(--accent)]'
                        : 'text-[var(--muted)]'
                    }`}
                  >
                    {formatSeconds(timer.remainingSeconds)}
                  </span>

                  {/* Controls */}
                  <div className="flex items-center gap-1.5">
                    {timer.isRunning ? (
                      <button
                        onClick={() => onTimerAction(timer.id, 'pause')}
                        className="p-1.5 rounded-lg bg-black/40 text-amber-300 hover:bg-black/60 border border-[var(--line)]"
                        title="Pausar"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onTimerAction(timer.id, 'start')}
                        className="p-1.5 rounded-lg bg-[var(--accent)] text-[#20393f] hover:brightness-110 shadow-sm"
                        title="Iniciar"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    )}

                    <button
                      onClick={() => onTimerAction(timer.id, 'reset')}
                      className="p-1.5 rounded-lg bg-black/40 text-[var(--muted)] hover:text-[var(--ink)] hover:bg-black/60 border border-[var(--line)]"
                      title="Reiniciar"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-[var(--line)]">
                <div
                  className={`h-full transition-all duration-300 ${
                    isFinished ? 'bg-rose-500' : 'bg-[var(--accent)]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to add custom timer */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustom}
            className="emai-card p-5 rounded-2xl w-full max-w-sm space-y-4 border border-[var(--line)] shadow-xl"
          >
            <h3 className="text-base font-normal text-[var(--ink)]">Nuevo Temporizador</h3>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Nombre</label>
              <input
                type="text"
                required
                placeholder="Ej. Focus Deep Work, Pausa..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-[var(--line)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Minutos</label>
              <input
                type="number"
                min="1"
                max="180"
                value={newMinutes}
                onChange={(e) => setNewMinutes(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-[var(--line)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent)] text-[#20393f] hover:brightness-110 shadow-sm"
              >
                Crear
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

