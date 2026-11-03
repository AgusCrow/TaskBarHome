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
    <div className="glass-panel rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          <TimerIcon className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-lg text-white tracking-wide">Temporizadores</h2>
        </div>
        {!isTvMode && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-colors"
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
                  ? 'bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-950/40'
                  : isFinished
                  ? 'bg-rose-950/40 border-rose-500/60 animate-pulse'
                  : 'bg-slate-800/80 border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-sm text-slate-200 block">{timer.label}</span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Total: {Math.round(timer.totalSeconds / 60)} min
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-2xl font-black font-mono tracking-tight ${
                      isFinished
                        ? 'text-rose-400'
                        : timer.isRunning
                        ? 'text-amber-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {formatSeconds(timer.remainingSeconds)}
                  </span>

                  {/* Controls (visible or larger in control mode) */}
                  <div className="flex items-center gap-1.5">
                    {timer.isRunning ? (
                      <button
                        onClick={() => onTimerAction(timer.id, 'pause')}
                        className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40"
                        title="Pausar"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onTimerAction(timer.id, 'start')}
                        className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40"
                        title="Iniciar"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onTimerAction(timer.id, 'reset')}
                      className="p-1.5 rounded-lg bg-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-600/50"
                      title="Reiniciar"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700/40">
                <div
                  className={`h-full transition-all duration-300 ${
                    isFinished ? 'bg-rose-500' : 'bg-amber-400'
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustom}
            className="bg-slate-900 border border-slate-700 p-5 rounded-2xl w-full max-w-sm space-y-4 shadow-xl"
          >
            <h3 className="text-base font-bold text-white">Nuevo Temporizador</h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nombre</label>
              <input
                type="text"
                required
                placeholder="Ej. Tarta al horno, Lectura..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Minutos</label>
              <input
                type="number"
                min="1"
                max="180"
                value={newMinutes}
                onChange={(e) => setNewMinutes(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950"
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

