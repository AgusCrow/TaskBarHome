import React from 'react';
import { Mail, PlayCircle, Radio } from 'lucide-react';
import type { CalendarEvent, TaskItem, WorkflowItem } from '../types';
import { useToday } from '../lib/useToday';

interface DateStripProps {
  events: CalendarEvent[];
  tasks: TaskItem[];
  workflows: WorkflowItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  isTvMode?: boolean;
}

export const DateStrip: React.FC<DateStripProps> = ({
  events,
  tasks,
  workflows,
  selectedDate,
  onSelectDate,
  isTvMode = false
}) => {
  const today = useToday();

  // Generar 7 días centrados en la fecha de hoy
  const days = React.useMemo(() => {
    const list = [];
    const base = new Date();
    for (let offset = -1; offset <= 5; offset++) {
      const d = new Date(base);
      d.setDate(base.getDate() + offset);
      const iso = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(d);

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const hasEvents = events.some((e) => e.date === iso);
      const hasTasks = tasks.some((t) => !t.completed && t.dueDate === iso);

      list.push({
        iso,
        dayName,
        dayNum,
        isToday: iso === today,
        hasIndicator: hasEvents || hasTasks
      });
    }
    return list;
  }, [today, events, tasks]);

  // Contadores para el lado derecho
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const workflowsCount = workflows.length;

  return (
    <div
      className={`w-full my-3 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs select-none ${
        isTvMode ? 'p-2 md:p-3 text-sm' : 'p-1.5 md:p-2 text-xs'
      }`}
    >
      {/* Tira horizontal de días */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-0.5">
        {days.map((item) => {
          const isSelected = selectedDate === item.iso;

          return (
            <button
              key={item.iso}
              onClick={() => onSelectDate(item.iso)}
              className={`relative px-3 sm:px-4 py-1.5 rounded-xl transition-all duration-200 flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-[var(--accent)] text-[#1a2d33] font-semibold shadow-sm scale-105'
                  : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <span className="opacity-80 font-normal">{item.dayName}</span>
                <span className="font-medium">{item.dayNum}</span>
              </div>

              {/* Puntito indicador */}
              {item.hasIndicator && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-[var(--accent)] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Lado derecho: Badges informativos (Needs you, Automations, Feed on) */}
      <div className="flex items-center gap-3 sm:gap-5 text-xs text-[var(--muted)]">
        {/* Needs you */}
        <div className="flex items-center gap-1.5 hover:text-[var(--ink)] transition-colors">
          <Mail className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="font-light">Needs you ·</span>
          <span className="font-semibold text-[var(--ink)]">{pendingCount} items</span>
        </div>

        {/* Automations */}
        <div className="hidden sm:flex items-center gap-1.5 hover:text-[var(--ink)] transition-colors">
          <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-light">Automations ·</span>
          <span className="font-semibold text-[var(--ink)]">{workflowsCount} active</span>
        </div>

        {/* Ambient / Feed tag */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/5 text-[11px] font-medium text-[var(--accent)]">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Feed on</span>
        </div>
      </div>
    </div>
  );
};
