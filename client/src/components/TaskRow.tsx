import React from 'react';
import { Calendar, Tag, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import type { TaskItem } from '../types';
import { useActions } from '../lib/actions';
import { daysBetween, relativeDay } from '../lib/dates';

interface TaskRowProps {
  task: TaskItem;
  today: string;
  isTvMode: boolean;
  /** Tamaño de tipografía mayor (panel Hoy/Foco en la TV). */
  large?: boolean;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, today, isTvMode, large = false }) => {
  const { toggleTask, deleteItem } = useActions();
  const overdue = !!task.dueDate && !task.completed && daysBetween(today, task.dueDate) < 0;
  const dueToday = !!task.dueDate && task.dueDate === today;

  return (
    <div
      className={`group p-3 rounded-xl border flex items-start justify-between gap-3 shadow-sm transition-colors ${
        task.completed
          ? 'bg-slate-950/40 border-slate-800/60'
          : overdue
          ? 'bg-rose-950/30 border-rose-800/50'
          : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
      } ${large || isTvMode ? 'text-base' : 'text-sm'}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        {isTvMode ? (
          task.completed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
          ) : (
            <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
          )
        ) : (
          <button
            onClick={() => toggleTask(task)}
            aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como hecha'}
            className="shrink-0 -m-1.5 p-1.5 rounded-full active:scale-90 transition-transform"
          >
            {task.completed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <Circle className="w-6 h-6 text-slate-400 hover:text-emerald-300" />
            )}
          </button>
        )}

        <div className="min-w-0">
          <p
            className={`font-medium leading-snug break-words ${
              task.completed ? 'line-through text-slate-500' : 'text-slate-100'
            }`}
          >
            {task.text}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {task.dueDate && !task.completed && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border ${
                  overdue
                    ? 'text-rose-300 bg-rose-950/50 border-rose-800/60'
                    : dueToday
                    ? 'text-amber-200 bg-amber-900/40 border-amber-600/50'
                    : 'text-amber-300/90 bg-amber-950/40 border-amber-800/40'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {relativeDay(task.dueDate, today)}
              </span>
            )}
            {task.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                  tag.toLowerCase() === 'urgente'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                    : 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/40'
                }`}
              >
                <Tag className="w-2.5 h-2.5" />#{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {!isTvMode && (
        <button
          onClick={() => {
            if (window.confirm(`¿Eliminar "${task.text}"?`)) deleteItem(task);
          }}
          aria-label="Eliminar tarea"
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
