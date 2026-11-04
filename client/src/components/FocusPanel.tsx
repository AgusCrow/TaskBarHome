import React from 'react';
import { CalendarClock, AlertTriangle, Zap, Timer as TimerIcon, Clock, Circle, CheckCircle2 } from 'lucide-react';
import type { DashboardPayload } from '../types';
import { useActions } from '../lib/actions';
import { useToday } from '../lib/useToday';
import { daysBetween, relativeDay } from '../lib/dates';
import { TaskRow } from './TaskRow';

interface FocusPanelProps {
  data: DashboardPayload | null;
  isTvMode: boolean;
}

const fmt = (sec: number) =>
  `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

const Card: React.FC<{
  icon: React.ReactNode;
  title: string;
  count?: number;
  tone: string;
  children: React.ReactNode;
}> = ({ icon, title, count, tone, children }) => (
  <div className="glass-panel rounded-2xl p-4 flex flex-col min-h-[140px]">
    <div className="flex items-center justify-between mb-3">
      <div className={`flex items-center gap-2 font-bold text-sm uppercase tracking-wider ${tone}`}>
        {icon}
        <span>{title}</span>
      </div>
      {count !== undefined && (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/30 text-slate-300">{count}</span>
      )}
    </div>
    <div className="flex-1 space-y-2 overflow-y-auto max-h-[260px] pr-1">{children}</div>
  </div>
);

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-slate-500 italic py-2">{children}</p>
);

/**
 * Panel "Hoy / Foco": lo que requiere atención ahora, para no tener que buscarlo
 * entre todos los widgets. Se arma solo a partir de los datos de la bóveda.
 */
export const FocusPanel: React.FC<FocusPanelProps> = ({ data, isTvMode }) => {
  const { toggleCard } = useActions();
  const today = useToday();
  if (!data) return null;

  const pending = data.tasks.filter((t) => !t.completed);
  const overdue = pending
    .filter((t) => t.dueDate && daysBetween(today, t.dueDate) < 0)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));
  const dueToday = pending.filter((t) => t.dueDate === today);
  const urgent = pending.filter((t) => t.tags.includes('urgente') && !overdue.includes(t) && !dueToday.includes(t));
  const attention = [...overdue, ...dueToday, ...urgent];

  const todayEvents = data.calendar.filter((e) => e.date === today);
  const upcoming = data.calendar.filter((e) => e.date > today).slice(0, 3);

  const inProgressCol = data.kanban?.columns.find((c) => /curso|progress|doing|haciendo/i.test(c.name));
  const inProgress = (inProgressCol?.cards ?? []).filter((c) => !c.completed);

  const timers = data.timers.filter((t) => t.isRunning || t.remainingSeconds === 0);

  const big = isTvMode ? 'text-lg' : 'text-sm';

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <Card
        icon={<AlertTriangle className="w-4 h-4" />}
        title="Requiere atención"
        count={attention.length}
        tone="text-rose-300"
      >
        {attention.length === 0 ? (
          <Empty>Nada urgente. ¡Día tranquilo!</Empty>
        ) : (
          attention.map((t) => <TaskRow key={t.id} task={t} today={today} isTvMode={isTvMode} large />)
        )}
      </Card>

      <Card
        icon={<CalendarClock className="w-4 h-4" />}
        title="Agenda de hoy"
        count={todayEvents.length}
        tone="text-indigo-300"
      >
        {todayEvents.length === 0 && <Empty>Sin eventos hoy.</Empty>}
        {todayEvents.map((e) => (
          <div key={e.id} className={`flex items-center justify-between gap-3 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 ${big}`}>
            <span className="font-semibold text-slate-100 break-words min-w-0">{e.title}</span>
            {e.time && (
              <span className="flex items-center gap-1 font-mono text-sky-300 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                {e.time}
              </span>
            )}
          </div>
        ))}
        {upcoming.length > 0 && (
          <div className="pt-2 border-t border-slate-700/50">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5">Próximos</p>
            {upcoming.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-2 py-1 text-sm text-slate-300">
                <span className="truncate">{e.title}</span>
                <span className="text-xs text-slate-500 shrink-0 capitalize">
                  {relativeDay(e.date, today)}
                  {e.time ? ` · ${e.time}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        icon={<Zap className="w-4 h-4" />}
        title="En curso"
        count={inProgress.length}
        tone="text-sky-300"
      >
        {inProgress.length === 0 && <Empty>Nada en curso en el tablero.</Empty>}
        {inProgress.map((c) => (
          <div key={c.id} className={`flex items-start gap-2.5 p-2.5 rounded-xl bg-sky-950/30 border border-sky-800/40 ${big}`}>
            {isTvMode ? (
              <Circle className="w-4 h-4 text-sky-400 shrink-0 mt-1" />
            ) : (
              <button onClick={() => toggleCard(c)} aria-label="Marcar como hecha" className="shrink-0 -m-1 p-1 rounded-full active:scale-90">
                <Circle className="w-6 h-6 text-sky-400 hover:text-emerald-300" />
              </button>
            )}
            <span className="font-medium text-slate-100 leading-snug break-words">{c.text}</span>
          </div>
        ))}
      </Card>

      <Card
        icon={<TimerIcon className="w-4 h-4" />}
        title="Timers activos"
        count={timers.length}
        tone="text-amber-300"
      >
        {timers.length === 0 && <Empty>Ningún timer en marcha.</Empty>}
        {timers.map((t) => {
          const finished = t.remainingSeconds === 0;
          return (
            <div
              key={t.id}
              className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border ${
                finished ? 'bg-rose-950/40 border-rose-500/60 animate-pulse' : 'bg-amber-950/30 border-amber-500/40'
              }`}
            >
              <span className={`font-semibold text-slate-100 truncate ${big}`}>{t.label}</span>
              {finished ? (
                <span className="flex items-center gap-1 text-rose-300 font-bold text-sm shrink-0">
                  <CheckCircle2 className="w-4 h-4" /> ¡Listo!
                </span>
              ) : (
                <span className={`font-mono font-black text-amber-300 shrink-0 ${isTvMode ? 'text-3xl' : 'text-xl'}`}>
                  {fmt(t.remainingSeconds)}
                </span>
              )}
            </div>
          );
        })}
      </Card>
    </section>
  );
};

