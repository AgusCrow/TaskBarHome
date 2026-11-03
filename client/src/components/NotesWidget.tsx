import React from 'react';
import { StickyNote } from 'lucide-react';
import type { NoteItem } from '../types';

interface NotesWidgetProps {
  notes: NoteItem[];
  isTvMode?: boolean;
}

export const NotesWidget: React.FC<NotesWidgetProps> = ({ notes, isTvMode = false }) => {
  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          <StickyNote className="w-5 h-5 text-amber-300" />
          <h2 className="font-bold text-lg text-white tracking-wide">Notas & Recordatorios</h2>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
          {notes.length} documentos
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
        {notes.flatMap((note) =>
          note.sections.map((section, idx) => (
            <div
              key={`${note.id}-${idx}`}
              className={`p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30 text-amber-100 flex flex-col justify-between shadow-sm hover:border-amber-700/50 transition-colors ${
                isTvMode ? 'text-sm' : 'text-xs'
              }`}
            >
              <div>
                <h3 className="font-bold text-amber-300 text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {section.title}
                </h3>
                <p className="whitespace-pre-line text-slate-200 leading-relaxed font-sans opacity-90">
                  {section.content}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-amber-900/40 text-[10px] text-amber-400/60 font-mono">
                Origen: {note.title}
              </div>
            </div>
          ))
        )}

        {notes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-8 text-slate-400 text-sm">
            <StickyNote className="w-8 h-8 text-amber-400 mb-2 opacity-50" />
            <p>No se encontraron notas en `notes.md`</p>
          </div>
        )}
      </div>
    </div>
  );
};

