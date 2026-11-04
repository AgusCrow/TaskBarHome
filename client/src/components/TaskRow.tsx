import React, { useState } from 'react';
import { Calendar, Tag, CheckCircle2, Circle, Trash2, AlertCircle, Folder } from 'lucide-react';
import type { TaskItem } from '../types';
import { useActions } from '../lib/actions';
import { daysBetween, relativeDay } from '../lib/dates';
import { ConfirmModal } from './ConfirmModal';

interface TaskRowProps {
  task: TaskItem;
  today: string;
  isTvMode: boolean;
  large?: boolean;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, today, isTvMode, large = false }) => {
  const { toggleTask, deleteItem } = useActions();
  const [showConfirm, setShowConfirm] = useState(false);
  const overdue = !!task.dueDate && !task.completed && daysBetween(today, task.dueDate) < 0;
  const dueToday = !!task.dueDate && task.dueDate === today;

  return (
    <div
      className={`group p-3 rounded-xl border flex items-start justify-between gap-3 shadow-sm transition-all ${
        task.completed
          ? 'bg-black/20 border-white/5 opacity-60'
          : overdue
          ? 'bg-rose-950/25 border-rose-500/40'
          : 'bg-black/30 border-[var(--line)] hover:border-[var(--accent)]/40'
      } ${large || isTvMode ? 'text-base' : 'text-sm'}`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {isTvMode ? (
          task.completed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
          ) : (
            <Circle className="w-4 h-4 text-[var(--muted)] shrink-0 mt-1" />
          )
        ) : (
          <button
            onClick={() => toggleTask(task)}
            aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como hecha'}
            className="shrink-0 -m-1 p-1 rounded-full active:scale-90 transition-transform"
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Circle className="w-5 h-5 text-[var(--muted)] hover:text-[var(--accent)]" />
            )}
          </button>
        )}

        <div className="min-w-0 flex-1">
          <p
            className={`font-normal leading-snug break-words ${
              task.completed ? 'line-through text-[var(--muted)] opacity-60' : 'text-[var(--ink)]'
            }`}
          >
            {task.text}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* Proyecto o Contexto de origen */}
            {task.project && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-[var(--muted)] font-mono">
                <Folder className="w-2.5 h-2.5 opacity-60" />
                {task.project}
              </span>
            )}

            {/* Prioridad */}
            {task.priority && !task.completed && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                  task.priority === 'highest' || task.priority === 'high'
                    ? 'bg-rose-950/50 text-rose-300 border-rose-500/40'
                    : task.priority === 'medium'
                    ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700'
                }`}
              >
                <AlertCircle className="w-2.5 h-2.5" />
                {task.priority === 'highest' ? 'Alta+' : task.priority === 'high' ? 'Alta' : task.priority}
              </span>
            )}

            {/* Fecha de vencimiento */}
            {task.dueDate && !task.completed && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                  overdue
                    ? 'text-rose-300 bg-rose-950/50 border-rose-800/60'
                    : dueToday
                    ? 'text-[var(--accent)] bg-[var(--accent)]/15 border-[var(--accent)]/30 font-semibold'
                    : 'text-[var(--muted)] bg-black/40 border-white/10'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {relativeDay(task.dueDate, today)}
              </span>
            )}

            {/* Tags */}
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-[var(--muted)]"
              >
                <Tag className="w-2.5 h-2.5 opacity-60" />#{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {!isTvMode && (
        <>
          <button
            onClick={() => setShowConfirm(true)}
            aria-label="Eliminar tarea"
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-rose-400 hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <ConfirmModal
            isOpen={showConfirm}
            title="¿Eliminar tarea?"
            message={`¿Estás seguro de que querés borrar permanentemente "${task.text}" de la bóveda de Obsidian?`}
            confirmText="Eliminar"
            cancelText="Cancelar"
            isDestructive={true}
            onConfirm={() => {
              deleteItem(task);
              setShowConfirm(false);
            }}
            onCancel={() => setShowConfirm(false)}
          />
        </>
      )}
    </div>
  );
};
