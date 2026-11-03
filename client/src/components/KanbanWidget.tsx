import React from 'react';
import { Columns3, CheckCircle2, Circle } from 'lucide-react';
import type { KanbanBoard } from '../types';

interface KanbanWidgetProps {
  board: KanbanBoard | null;
  isTvMode?: boolean;
}

const COLUMN_COLORS: Record<string, { headerBg: string; text: string; dot: string }> = {
  backlog: { headerBg: 'bg-slate-800/80', text: 'text-slate-300', dot: 'bg-slate-400' },
  'to-do': { headerBg: 'bg-amber-950/40', text: 'text-amber-300', dot: 'bg-amber-400' },
  'in-progress': { headerBg: 'bg-sky-950/40', text: 'text-sky-300', dot: 'bg-sky-400' },
  done: { headerBg: 'bg-emerald-950/40', text: 'text-emerald-300', dot: 'bg-emerald-400' }
};

export const KanbanWidget: React.FC<KanbanWidgetProps> = ({ board, isTvMode = false }) => {
  if (!board || board.columns.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 h-64">
        <Columns3 className="w-10 h-10 mb-2 opacity-50 text-slate-500" />
        <p className="text-sm">Sin tablero Kanban activo en Obsidian (`kanban.md`).</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          <Columns3 className="w-5 h-5 text-sky-400" />
          <h2 className="font-bold text-lg text-white tracking-wide">{board.title}</h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700">
          {board.columns.reduce((acc, col) => acc + col.cards.length, 0)} tarjetas
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 overflow-x-auto">
        {board.columns.map((column) => {
          const colKey = column.name.toLowerCase().replace(/\s+/g, '-');
          const style = COLUMN_COLORS[colKey] || {
            headerBg: 'bg-slate-800/80',
            text: 'text-slate-200',
            dot: 'bg-sky-400'
          };

          return (
            <div
              key={column.id}
              className="flex flex-col rounded-xl bg-slate-900/60 border border-slate-800/80 p-3 min-h-[180px]"
            >
              {/* Column Header */}
              <div
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg mb-2.5 ${style.headerBg}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>
                    {column.name}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400 bg-black/30 px-1.5 py-0.5 rounded">
                  {column.cards.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[340px] pr-1">
                {column.cards.map((card) => (
                  <div
                    key={card.id}
                    className={`rounded-lg p-2.5 border transition-all ${
                      card.completed
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60 line-through text-slate-400'
                        : 'bg-slate-800/90 border-slate-700/80 text-slate-100 hover:border-sky-500/50 shadow-sm'
                    } ${isTvMode ? 'text-sm' : 'text-xs'}`}
                  >
                    <div className="flex items-start gap-2">
                      {card.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <span className="font-normal leading-snug">{card.text}</span>
                    </div>
                  </div>
                ))}

                {column.cards.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-xs text-slate-500 italic">
                    Sin tareas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

