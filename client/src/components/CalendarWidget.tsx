import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import type { CalendarEvent } from '../types';
import { useActions } from '../lib/actions';
import { useToday } from '../lib/useToday';
import { parseDateStr, relativeDay, toDateStr } from '../lib/dates';
import { ConfirmModal } from './ConfirmModal';

interface CalendarWidgetProps {
  events: CalendarEvent[];
  isTvMode?: boolean;
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events, isTvMode = false }) => {
  const { addEvent, deleteItem } = useActions();
  const today = useToday();
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [busy, setBusy] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) map.set(ev.date, [...(map.get(ev.date) ?? []), ev]);
    return map;
  }, [events]);

  // Grilla del mes (semanas que empiezan en lunes)
  const cells = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const list: (string | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      list.push(toDateStr(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d)));
    }
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [viewMonth]);

  const visibleEvents = events.filter((ev) => {
    if (selected) return ev.date === selected;
    return showPast && !isTvMode ? true : ev.date >= today;
  });

  const shiftMonth = (delta: number) =>
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  const pickDay = (d: string) => {
    if (isTvMode) return;
    setSelected((cur) => (cur === d ? null : d));
    setDate(d);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || busy) return;
    setBusy(true);
    const ok = await addEvent({ title: title.trim(), date, time: time || undefined });
    setBusy(false);
    if (ok) {
      setTitle('');
      setTime('');
    }
  };

  const monthLabel = viewMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  return (
    <div className="emai-card p-5 flex flex-col h-full border border-[var(--line)] shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-lg text-white tracking-wide">Agenda &amp; Calendario</h2>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
          {visibleEvents.length} eventos
        </span>
      </div>

      {/* Mes */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-semibold text-slate-200 capitalize">{monthLabel}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => shiftMonth(-1)} aria-label="Mes anterior" className="p-1 rounded-md text-slate-400 hover:bg-slate-700/60">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => { const d = new Date(); setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1)); }}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-300 hover:bg-slate-700/60"
            >
              Hoy
            </button>
            <button onClick={() => shiftMonth(1)} aria-label="Mes siguiente" className="p-1 rounded-md text-slate-400 hover:bg-slate-700/60">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="text-[10px] font-semibold text-slate-500">{w}</span>
          ))}
          {cells.map((d, i) => {
            if (!d) return <span key={i} />;
            const count = eventsByDate.get(d)?.length ?? 0;
            const isToday = d === today;
            const isSel = d === selected;
            return (
              <button
                key={d}
                onClick={() => pickDay(d)}
                disabled={isTvMode}
                className={`relative h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
                  isSel
                    ? 'bg-indigo-500 text-white'
                    : isToday
                    ? 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/60'
                    : 'text-slate-300 hover:bg-slate-700/50'
                } ${isTvMode ? 'cursor-default' : ''}`}
              >
                {Number(d.slice(8))}
                {count > 0 && (
                  <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSel ? 'bg-white' : 'bg-indigo-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Agregar evento */}
      {!isTvMode && (
        <form onSubmit={submit} className="flex flex-wrap gap-2 mb-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nuevo evento…"
            maxLength={200}
            className="flex-1 min-w-[9rem] px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Fecha"
            required
            className="w-[7.5rem] px-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-400"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-label="Hora"
            className="w-[5.5rem] px-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={!title.trim() || !date || busy}
            aria-label="Agregar evento"
            className="px-3 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Agenda */}
      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
        {visibleEvents.map((event) => {
          const past = event.date < today;
          return (
            <div
              key={event.id}
              className={`p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3 shadow-sm hover:border-indigo-500/40 transition-colors ${
                isTvMode ? 'text-base' : 'text-sm'
              } ${past ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="px-2.5 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-center shrink-0 min-w-[3.25rem]">
                  <span className="block text-[11px] uppercase font-bold text-indigo-400">
                    {parseDateStr(event.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-100 leading-snug break-words">{event.title}</p>
                  <p className="text-xs text-slate-400 capitalize">{relativeDay(event.date, today)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {event.time && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs font-mono font-medium text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>{event.time}</span>
                  </div>
                )}
                {!isTvMode && (
                  <button
                    onClick={() => setEventToDelete(event)}
                    aria-label="Eliminar evento"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {visibleEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-slate-400 text-sm">
            <CalendarIcon className="w-8 h-8 text-indigo-400 mb-2 opacity-50" />
            <p>{selected ? 'Sin eventos ese día' : 'No hay eventos próximos'}</p>
          </div>
        )}
      </div>

      {!isTvMode && !selected && (
        <button
          onClick={() => setShowPast((v) => !v)}
          className="mt-2 self-start text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-2"
        >
          {showPast ? 'Ocultar eventos pasados' : 'Mostrar eventos pasados'}
        </button>
      )}

      <ConfirmModal
        isOpen={Boolean(eventToDelete)}
        title="¿Eliminar evento de la agenda?"
        message={`Esta acción eliminará "${eventToDelete?.title ?? ''}" de tu calendario en Obsidian.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDestructive={true}
        onConfirm={() => {
          if (eventToDelete) {
            deleteItem(eventToDelete);
            setEventToDelete(null);
          }
        }}
        onCancel={() => setEventToDelete(null)}
      />
    </div>
  );
};
