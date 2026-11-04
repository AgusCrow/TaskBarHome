import React from 'react';
import { Target, Zap, Activity, Play } from 'lucide-react';
import type { DailyFocus } from '../types';

interface NorthStarHeroProps {
  dailyFocus: DailyFocus | null;
  isTvMode?: boolean;
  onStartFocusTimer?: () => void;
  onOpenQuickAdd?: () => void;
}

export const NorthStarHero: React.FC<NorthStarHeroProps> = ({
  dailyFocus,
  isTvMode = false,
  onStartFocusTimer,
  onOpenQuickAdd
}) => {
  const focusText = dailyFocus?.focus || 'Definir el objetivo prioritario del día en tu nota diaria.';

  return (
    <section className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-[rgba(26,52,60,0.85)] via-[var(--surface)] to-[rgba(26,52,60,0.85)] border border-[var(--line)] shadow-xl relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent)] opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-end justify-between gap-6 relative z-10">
        <div className="max-w-3xl">
          {/* Label & Scores */}
          <div className="flex items-center gap-3 mb-2.5">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              <Target className="w-4 h-4" />
              Next Move · Hoy
            </span>

            {dailyFocus?.energyScore !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/50 border border-emerald-500/30 text-emerald-300">
                <Zap className="w-3 h-3 text-emerald-400" />
                Energía: {dailyFocus.energyScore}/10
              </span>
            )}

            {dailyFocus?.focusQualityScore !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-950/50 border border-indigo-500/30 text-indigo-300">
                <Activity className="w-3 h-3 text-indigo-400" />
                Enfoque: {dailyFocus.focusQualityScore}/10
              </span>
            )}
          </div>

          {/* Big Editorial Heading */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal leading-tight text-[var(--ink)] tracking-tight">
            "{focusText}"
          </h1>
          <p className="text-xs md:text-sm text-[var(--muted)] mt-2 font-normal">
            Extraído automáticamente de <span className="font-mono text-[var(--ink)] opacity-80">{dailyFocus?.file || '10 Daily Notes'}</span>
          </p>
        </div>

        {/* Quick Actions (EMAI buttons) */}
        {!isTvMode && (
          <div className="flex items-center gap-3 shrink-0">
            {onStartFocusTimer && (
              <button onClick={onStartFocusTimer} className="action-btn primary shadow-md">
                <Play className="w-4 h-4 fill-current" />
                <span>Enfocar 25 min</span>
              </button>
            )}
            {onOpenQuickAdd && (
              <button onClick={onOpenQuickAdd} className="action-btn">
                <span>+ Tarea Rápida</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
