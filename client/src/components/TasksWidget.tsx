import React from 'react';
import { CheckSquare2, Calendar, Tag, CheckCircle2, Circle } from 'lucide-react';
import type { TaskItem } from '../types';

interface TasksWidgetProps {
  tasks: TaskItem[];
  isTvMode?: boolean;
}

export const TasksWidget: React.FC<TasksWidgetProps> = ({ tasks, isTvMode = false }) => {
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          <CheckSquare2 className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-lg text-white tracking-wide">Quehaceres & Tareas</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {pendingTasks.length} pendientes
          </span>
        </div>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px] pr-1">
        {pendingTasks.map((task) => (
          <div
            key={task.id}
            className={`p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start justify-between gap-3 shadow-sm hover:border-slate-600 transition-colors ${
              isTvMode ? 'text-base' : 'text-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
              <div>
                <p className="font-medium text-slate-100 leading-snug">{task.text}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {task.dueDate && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-300/90 font-medium bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                      <Calendar className="w-3 h-3" />
                      {task.dueDate}
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
                      <Tag className="w-2.5 h-2.5" />
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {pendingTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 opacity-60" />
            <p>¡No hay tareas pendientes en este momento!</p>
          </div>
        )}

        {/* Completed list preview */}
        {completedTasks.length > 0 && !isTvMode && (
          <div className="pt-3 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Completadas recientemente ({completedTasks.length})
            </h4>
            <div className="space-y-1.5 opacity-60">
              {completedTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 text-xs text-slate-400 line-through px-2 py-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{task.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
