import React from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import type { CalendarEvent } from '../types';

interface CalendarWidgetProps {
  events: CalendarEvent[];
  isTvMode?: boolean;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events, isTvMode = false }) => {
  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-lg text-white tracking-wide">Agenda & Calendario</h2>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
          {events.length} eventos
        </span>
      </div>

      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
        {events.map((event) => {
          return (
            <div
              key={event.id}
              className={`p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3 shadow-sm hover:border-indigo-500/40 transition-colors ${
                isTvMode ? 'text-base' : 'text-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-center shrink-0">
                  <span className="block text-[11px] uppercase font-bold text-indigo-400">
                    {event.date.slice(5)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-100 leading-snug">{event.title}</p>
                  <p className="text-xs text-slate-400">{event.date}</p>
                </div>
              </div>

              {event.time && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs font-mono font-medium text-slate-300 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>{event.time}</span>
                </div>
              )}
            </div>
          );
        })}

        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-sm">
            <CalendarIcon className="w-8 h-8 text-indigo-400 mb-2 opacity-50" />
            <p>No hay eventos registrados en `calendar.md`</p>
          </div>
        )}
      </div>
    </div>
  );
};

