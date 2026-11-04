import React from 'react';
import { StickyNote } from 'lucide-react';
import type { NoteItem } from '../types';

interface NotesWidgetProps {
  notes: NoteItem[];
  isTvMode?: boolean;
}

export const NotesWidget: React.FC<NotesWidgetProps> = ({ notes, isTvMode = false }) => {
  return (
    <div className="emai-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-[var(--line)] pb-3">
        <div className="flex items-center gap-2.5">
          <StickyNote className="w-5 h-5 text-[var(--accent)]" />
          <h2 className="font-medium text-lg text-[var(--ink)] tracking-tight">Notas & Contexto</h2>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
          {notes.length} documentos
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
        {notes.flatMap((note) =>
          note.sections.map((section, idx) => (
            <div
              key={`${note.id}-${idx}`}
              className={`p-3.5 rounded-xl bg-black/25 border border-[var(--line)] text-[var(--ink)] flex flex-col justify-between shadow-sm hover:border-[var(--accent)]/40 transition-colors ${
                isTvMode ? 'text-sm' : 'text-xs'
              }`}
            >
              <div>
                <h3 className="font-medium text-[var(--accent)] text-sm mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  {section.title}
                </h3>
                <p className="whitespace-pre-line text-[var(--muted)] leading-relaxed font-sans opacity-95">
                  {section.content}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[var(--line)] text-[10px] text-[var(--muted)]/60 font-mono">
                Origen: {note.title}
              </div>
            </div>
          ))
        )}

        {notes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-8 text-[var(--muted)] text-sm">
            <StickyNote className="w-8 h-8 text-[var(--accent)]/30 mb-2" />
            <p>No se encontraron notas en `00 Human/notes.md`</p>
          </div>
        )}
      </div>
    </div>
  );
};

