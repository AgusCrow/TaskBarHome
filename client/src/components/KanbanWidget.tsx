import React, { useState } from 'react';
import { Columns3, CheckCircle2, Circle, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { KanbanBoard, KanbanCard } from '../types';
import { useActions } from '../lib/actions';
import { ConfirmModal } from './ConfirmModal';

interface KanbanWidgetProps {
  board: KanbanBoard | null;
  isTvMode?: boolean;
}

type ColStyle = { headerBg: string; text: string; dot: string; ring: string };

/** El color se decide por el nombre de la columna (tolera emojis y nombres en español/inglés). */
function columnStyle(name: string): ColStyle {
  const n = name.toLowerCase();
  if (/complet|done|hecho|termin|finaliz/.test(n))
    return { headerBg: 'bg-emerald-950/40', text: 'text-emerald-300', dot: 'bg-emerald-400', ring: 'ring-emerald-400/60' };
  if (/curso|progress|doing|haciendo/.test(n))
    return { headerBg: 'bg-sky-950/40', text: 'text-sky-300', dot: 'bg-sky-400', ring: 'ring-sky-400/60' };
  if (/por hacer|to.?do|pendiente/.test(n))
    return { headerBg: 'bg-amber-950/40', text: 'text-amber-300', dot: 'bg-amber-400', ring: 'ring-amber-400/60' };
  return { headerBg: 'bg-slate-800/80', text: 'text-slate-300', dot: 'bg-slate-400', ring: 'ring-slate-300/60' };
}

export const KanbanWidget: React.FC<KanbanWidgetProps> = ({ board, isTvMode = false }) => {
  const { moveCard, toggleCard, deleteItem } = useActions();
  const [dragging, setDragging] = useState<KanbanCard | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<KanbanCard | null>(null);

  if (!board || board.columns.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 h-64">
        <Columns3 className="w-10 h-10 mb-2 opacity-50 text-slate-500" />
        <p className="text-sm">Sin tablero Kanban activo en Obsidian (`kanban.md`).</p>
      </div>
    );
  }

  const columns = board.columns;
  const canEdit = !isTvMode;

  const drop = (columnName: string) => {
    if (dragging) moveCard(dragging, columnName);
    setDragging(null);
    setOverColumn(null);
  };

  return (
    <div className="emai-card p-5 flex flex-col h-full border border-[var(--line)] shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          <Columns3 className="w-5 h-5 text-sky-400" />
          <h2 className="font-bold text-lg text-white tracking-wide">{board.title}</h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700">
          {columns.reduce((acc, col) => acc + col.cards.length, 0)} tarjetas
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 overflow-x-auto">
        {columns.map((column, colIdx) => {
          const style = columnStyle(column.name);
          const isOver = overColumn === column.id && dragging !== null;

          return (
            <div
              key={column.id}
              onDragOver={canEdit ? (e) => { e.preventDefault(); setOverColumn(column.id); } : undefined}
              onDragLeave={canEdit ? () => setOverColumn((c) => (c === column.id ? null : c)) : undefined}
              onDrop={canEdit ? (e) => { e.preventDefault(); drop(column.name); } : undefined}
              className={`flex flex-col rounded-xl bg-slate-900/60 border border-slate-800/80 p-3 min-h-[180px] transition-shadow ${
                isOver ? `ring-2 ${style.ring}` : ''
              }`}
            >
              <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg mb-2.5 ${style.headerBg}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider truncate ${style.text}`}>
                    {column.name}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400 bg-black/30 px-1.5 py-0.5 rounded">
                  {column.cards.length}
                </span>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto max-h-[340px] pr-1">
                {column.cards.map((card) => (
                  <div
                    key={card.id}
                    draggable={canEdit}
                    onDragStart={canEdit ? (e) => { setDragging(card); e.dataTransfer.setData('text/plain', card.id); e.dataTransfer.effectAllowed = 'move'; } : undefined}
                    onDragEnd={canEdit ? () => { setDragging(null); setOverColumn(null); } : undefined}
                    className={`rounded-lg p-2.5 border transition-all ${
                      card.completed
                        ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                        : 'bg-slate-800/90 border-slate-700/80 text-slate-100 hover:border-sky-500/50 shadow-sm'
                    } ${canEdit ? 'cursor-grab active:cursor-grabbing' : ''} ${
                      dragging?.id === card.id ? 'opacity-40' : ''
                    } ${isTvMode ? 'text-sm' : 'text-xs'}`}
                  >
                    <div className="flex items-start gap-2">
                      {canEdit ? (
                        <button
                          onClick={() => toggleCard(card)}
                          aria-label={card.completed ? 'Marcar como pendiente' : 'Marcar como hecha'}
                          className="shrink-0 -m-1 p-1 rounded-full active:scale-90"
                        >
                          {card.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-500 hover:text-emerald-300" />
                          )}
                        </button>
                      ) : card.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <span className={`font-normal leading-snug break-words flex-1 ${card.completed ? 'line-through' : ''}`}>
                        {card.text}
                      </span>
                    </div>

                    {canEdit && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
                        <div className="flex items-center gap-1">
                          <button
                            disabled={colIdx === 0}
                            onClick={() => moveCard(card, columns[colIdx - 1].name)}
                            aria-label={`Mover a ${columns[colIdx - 1]?.name ?? ''}`}
                            className="p-1 rounded-md bg-slate-700/50 text-slate-300 hover:bg-slate-600 disabled:opacity-25"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            disabled={colIdx === columns.length - 1}
                            onClick={() => moveCard(card, columns[colIdx + 1].name)}
                            aria-label={`Mover a ${columns[colIdx + 1]?.name ?? ''}`}
                            className="p-1 rounded-md bg-slate-700/50 text-slate-300 hover:bg-slate-600 disabled:opacity-25"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => setCardToDelete(card)}
                          aria-label="Eliminar tarjeta"
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {column.cards.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-xs text-slate-500 italic">
                    {canEdit ? 'Arrastrá una tarjeta acá' : 'Sin tareas'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={Boolean(cardToDelete)}
        title="¿Eliminar tarjeta del tablero?"
        message={`Esta acción removerá "${cardToDelete?.text ?? ''}" del archivo kanban.md en tu bóveda.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={() => {
          if (cardToDelete) {
            deleteItem(cardToDelete);
            setCardToDelete(null);
          }
        }}
        onCancel={() => setCardToDelete(null)}
      />
    </div>
  );
};
