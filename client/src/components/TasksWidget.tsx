import React, { useState, useMemo } from 'react';
import { CheckSquare2, CheckCircle2, Plus } from 'lucide-react';
import type { TaskItem } from '../types';
import { useActions } from '../lib/actions';
import { useToday } from '../lib/useToday';
import { TaskRow } from './TaskRow';

interface TasksWidgetProps {
  tasks: TaskItem[];
  isTvMode?: boolean;
}

export const TasksWidget: React.FC<TasksWidgetProps> = ({ tasks, isTvMode = false }) => {
  const { addTask } = useActions();
  const today = useToday();
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const [filterTab, setFilterTab] = useState<'pending' | 'today' | 'urgent' | 'completed'>('pending');

  const pendingTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);
  const todayTasks = useMemo(
    () => pendingTasks.filter((t) => t.dueDate === today || (t.project && t.project.includes(today))),
    [pendingTasks, today]
  );
  const urgentTasks = useMemo(
    () =>
      pendingTasks.filter(
        (t) =>
          t.priority === 'highest' ||
          t.priority === 'high' ||
          t.tags.includes('urgente') ||
          (t.dueDate && t.dueDate < today)
      ),
    [pendingTasks, today]
  );

  const displayedTasks = useMemo(() => {
    switch (filterTab) {
      case 'today':
        return todayTasks;
      case 'urgent':
        return urgentTasks;
      case 'completed':
        return completedTasks;
      case 'pending':
      default:
        return pendingTasks;
    }
  }, [filterTab, todayTasks, urgentTasks, completedTasks, pendingTasks]);

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
      {/* Header del Widget */}
      <div className="flex items-center justify-between mb-3 border-b border-[var(--line)] pb-3">
        <div className="flex items-center gap-2.5">
          <CheckSquare2 className="w-5 h-5 text-[var(--accent)]" />
          <h2 className="font-medium text-lg text-[var(--ink)] tracking-tight">Quehaceres &amp; Tareas</h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
          {pendingTasks.length} pendientes
        </span>
      </div>

      {/* Filtros por pestaña */}
      <div className="flex items-center gap-1.5 mb-3 p-1 rounded-xl bg-black/20 border border-white/5 overflow-x-auto text-xs">
        <button
          onClick={() => setFilterTab('pending')}
          className={`px-3 py-1 rounded-lg transition-all ${
            filterTab === 'pending'
              ? 'bg-[var(--accent)] text-[#1a2d33] font-semibold'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          Todas ({pendingTasks.length})
        </button>
        <button
          onClick={() => setFilterTab('today')}
          className={`px-3 py-1 rounded-lg transition-all ${
            filterTab === 'today'
              ? 'bg-[var(--accent)] text-[#1a2d33] font-semibold'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          Hoy ({todayTasks.length})
        </button>
        <button
          onClick={() => setFilterTab('urgent')}
          className={`px-3 py-1 rounded-lg transition-all ${
            filterTab === 'urgent'
              ? 'bg-[var(--accent)] text-[#1a2d33] font-semibold'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          Urgentes ({urgentTasks.length})
        </button>
        <button
          onClick={() => setFilterTab('completed')}
          className={`px-3 py-1 rounded-lg transition-all ${
            filterTab === 'completed'
              ? 'bg-[var(--accent)] text-[#1a2d33] font-semibold'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          Hechas ({completedTasks.length})
        </button>
      </div>

      {/* Input de captura rápida en el widget */}
      {!isTvMode && (
        <form onSubmit={submit} className="flex gap-2 mb-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nueva tarea para Obsidian…"
            maxLength={300}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-black/30 border border-[var(--line)] text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--accent)]"
          />
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            aria-label="Fecha límite"
            className="w-[7.5rem] px-2 py-2 rounded-xl bg-black/30 border border-[var(--line)] text-xs text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={!text.trim() || busy}
            aria-label="Agregar tarea"
            className="px-3 rounded-xl bg-[var(--accent)] text-[#1a2d33] font-semibold hover:brightness-105 disabled:opacity-40 transition-all flex items-center justify-center shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Lista de tareas */}
      <div className="space-y-2 flex-1 overflow-y-auto max-h-[420px] pr-1">
        {displayedTasks.map((task) => (
          <TaskRow key={task.id} task={task} today={today} isTvMode={isTvMode} />
        ))}

        {displayedTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-[var(--muted)] text-sm">
            <CheckCircle2 className="w-8 h-8 text-[var(--accent)]/50 mb-2" />
            <p>No hay tareas en esta sección.</p>
          </div>
        )}
      </div>
    </div>
  );
};
