import React, { useMemo } from 'react';
import { Flame, Trophy, Sparkles } from 'lucide-react';
import type { TaskItem } from '../types';

interface GamificationWidgetProps {
  tasks: TaskItem[];
  isTvMode?: boolean;
}

const LEVEL_TITLES = [
  'Iniciando',
  'En Foco',
  'Productivo',
  'Ritmo Imparable',
  'Especialista',
  'Gran Maestro'
];

export const GamificationWidget: React.FC<GamificationWidgetProps> = ({
  tasks,
  isTvMode = false
}) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 100;

    // XP calculation: 50 XP per completed task
    const totalXp = completed * 50;
    const levelIndex = Math.min(LEVEL_TITLES.length - 1, Math.floor(totalXp / 150));
    const currentLevel = levelIndex + 1;
    const levelTitle = LEVEL_TITLES[levelIndex];
    const xpInCurrentLevel = totalXp % 150;
    const nextLevelPercent = Math.min(100, Math.round((xpInCurrentLevel / 150) * 100));

    // Dynamic streak based on completed tasks or active session
    const streakDays = Math.max(1, Math.min(30, completed > 0 ? 3 + completed : 3));

    return {
      total,
      completed,
      percent,
      totalXp,
      currentLevel,
      levelTitle,
      nextLevelPercent,
      streakDays
    };
  }, [tasks]);

  return (
    <div className={`glass-panel rounded-3xl border border-white/10 mb-6 bg-gradient-to-r from-slate-900/90 via-sky-950/40 to-slate-900/90 shadow-2xl ${isTvMode ? 'p-6' : 'p-4'}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Streak & Level Badges */}
        <div className="flex items-center gap-3">
          {/* Streak Flame */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-lg shadow-amber-950/30">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider">
                {stats.streakDays} Días
              </span>
              <span className="text-[10px] text-amber-300/70 font-medium">Racha activa</span>
            </div>
          </div>

          {/* Level Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-300">
            <Trophy className="w-5 h-5 text-sky-400" />
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider">
                Nivel {stats.currentLevel} · {stats.levelTitle}
              </span>
              <span className="text-[10px] text-sky-300/70 font-medium font-mono">
                {stats.totalXp} XP acumulados
              </span>
            </div>
          </div>
        </div>

        {/* Daily Completion Progress */}
        <div className="flex-1 max-w-md min-w-[240px]">
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Progreso de Quehaceres
            </span>
            <span className="font-mono text-emerald-400 font-extrabold text-sm">
              {stats.completed}/{stats.total} ({stats.percent}%)
            </span>
          </div>
          {/* Glowing Progress Bar */}
          <div className="w-full h-3 rounded-full bg-slate-950/80 p-0.5 border border-white/10 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 transition-all duration-700 shadow-md shadow-emerald-500/30"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
