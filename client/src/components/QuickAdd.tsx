import React, { useEffect, useRef, useState } from 'react';
import { Plus, X, Inbox, CheckSquare2, CalendarPlus, StickyNote } from 'lucide-react';
import { useActions } from '../lib/actions';
import { todayLocal } from '../lib/dates';

type Tab = 'inbox' | 'task' | 'event' | 'note';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'inbox', label: 'Bandeja', icon: <Inbox className="w-4 h-4" /> },
  { id: 'task', label: 'Tarea', icon: <CheckSquare2 className="w-4 h-4" /> },
  { id: 'event', label: 'Evento', icon: <CalendarPlus className="w-4 h-4" /> },
  { id: 'note', label: 'Nota', icon: <StickyNote className="w-4 h-4" /> }
];

const fieldCls =
  'w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400';

/**
 * Captura rápida: botón flotante que abre una hoja para tirar una idea, tarea,
 * evento o nota a la bóveda en pocos segundos desde el celular.
 */
export const QuickAdd: React.FC = () => {
  const { addCard, addTask, addEvent, addNote } = useActions();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('inbox');
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const [date, setDate] = useState(todayLocal());
  const [time, setTime] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDate(todayLocal());
      setTimeout(() => firstField.current?.focus(), 50);
    }
  }, [open, tab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const reset = () => {
    setText('');
    setDue('');
    setTime('');
    setContent('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    let ok = false;
    if (tab === 'inbox') ok = await addCard(t);
    else if (tab === 'task') ok = await addTask({ text: t, due: due || undefined });
    else if (tab === 'event') ok = await addEvent({ title: t, date, time: time || undefined });
    else ok = await addNote({ title: t, content: content.trim() || undefined });
    setBusy(false);
    if (ok) {
      reset();
      setOpen(false);
    }
  };

  const placeholder = {
    inbox: 'Idea, compra o recordatorio…',
    task: '¿Qué hay que hacer?',
    event: 'Nombre del evento',
    note: 'Título de la nota'
  }[tab];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Agregar rápido"
        className="fixed right-5 bottom-5 z-40 w-14 h-14 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-xl shadow-sky-950/60 flex items-center justify-center active:scale-95 transition-transform safe-bottom"
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <form
            onSubmit={submit}
            className="w-full sm:max-w-md bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Agregar rápido</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-800/70">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-lg text-[11px] font-semibold transition-colors ${
                    tab === t.id ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:bg-slate-700/60'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            <input
              ref={firstField}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              maxLength={300}
              className={fieldCls}
            />

            {tab === 'task' && (
              <label className="block text-xs text-slate-400">
                Fecha límite (opcional)
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={`${fieldCls} mt-1`} />
              </label>
            )}

            {tab === 'event' && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-slate-400">
                  Fecha
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={`${fieldCls} mt-1`} />
                </label>
                <label className="block text-xs text-slate-400">
                  Hora (opcional)
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`${fieldCls} mt-1`} />
                </label>
              </div>
            )}

            {tab === 'note' && (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Contenido (opcional)"
                rows={4}
                maxLength={2000}
                className={fieldCls}
              />
            )}

            {tab === 'inbox' && (
              <p className="text-xs text-slate-500">Se guarda en la primera columna del tablero Kanban para clasificar después.</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-[var(--muted)] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!text.trim() || busy}
                className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[#1a2d33] font-semibold text-xs hover:brightness-105 active:scale-95 transition-all shadow-[0_4px_16px_rgba(241,188,144,0.25)] disabled:opacity-40"
              >
                {busy ? 'Guardando…' : 'Guardar en la bóveda'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
