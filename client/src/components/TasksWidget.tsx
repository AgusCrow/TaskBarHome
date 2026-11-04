import React, { useState } from 'react';
import { CheckSquare2, CheckCircle2, Plus } from 'lucide-react';
import type { TaskItem } from '../types';
import { useActions } from '../lib/actions';
import { useToday } from '../lib/useToday';
import { TaskRow } from './TaskRow';

interface TasksWidgetProps {
  tasks: TaskItem[];
  isTvMode?: boolean;
}

/** Con fecha primero (la más próxima arriba), después urgentes, después el resto. */
function sortPending(a: TaskItem, b: TaskItem): number {
  if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  const ua = a.tags.includes('urgente') ? 0 : 1;
  const ub = b.tags.includes('urgente') ? 0 : 1;
  return ua - ub;
}

export const TasksWidget: React.FC<TasksWidgetProps> = ({ tasks, isTvMode = false }) => {
  const { addTask } = useActions();
  const today = useToday();
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);

  const pendingTasks = tasks.filter((t) => !t.completed).sort(sortPending);
  const completedTasks = tasks.filter((t) => t.completed);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    const ok = await addTask({ text: text.trim(), due: due || undefined });
    setBusy(false);
    if (ok) {
      setText('');
      setDue('');
    }
  };

  return (
    <div className="emai-card p-5 flex flex-col h-full border border-[var(--line)] shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          <CheckSquare2 className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-lg text-white tracking-wide">Quehaceres &amp; Tareas</h2>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          {pendingTasks.length} pendientes
        </span>
      </div>

      {!isTvMode && (
        <form onSubmit={submit} className="flex gap-2 mb-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nueva tarea…"
            maxLength={300}
            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
          />
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            aria-label="Fecha límite"
            className="w-[7.5rem] px-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            disabled={!text.trim() || busy}
            aria-label="Agregar tarea"
            className="px-3 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      )}

      <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px] pr-1">
        {pendingTasks.map((task) => (
          <TaskRow key={task.id} task={task} today={today} isTvMode={isTvMode} />
        ))}

        {pendingTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 opacity-60" />
            <p>¡No hay tareas pendientes en este momento!</p>
          </div>
        )}

        {completedTasks.length > 0 && !isTvMode && (
          <div className="pt-3 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Completadas ({completedTasks.length})
            </h4>
            <div className="space-y-2 opacity-70">
              {completedTasks.slice(0, 5).map((task) => (
                <TaskRow key={task.id} task={task} today={today} isTvMode={isTvMode} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
