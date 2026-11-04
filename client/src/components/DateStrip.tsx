import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { CalendarEvent } from '../types';
import { useToday } from '../lib/useToday';

interface DateStripProps {
  events: CalendarEvent[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DateStrip: React.FC<DateStripProps> = ({
  events,
  selectedDate,
  onSelectDate
}) => {
  const today = useToday();

  // Generate 7 days centered on today
  const days = React.useMemo(() => {
    const list = [];
    const base = new Date();
    for (let offset = -2; offset <= 4; offset++) {
      const d = new Date(base);
      d.setDate(base.getDate() + offset);
      const iso = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(d);

      const dayName = d.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase().replace('.', '');
      const dayNum = d.getDate();
      const hasEvents = events.some(e => e.date === iso);

      list.push({
        iso,
        dayName,
        dayNum,
        isToday: iso === today,
        hasEvents
      });
    }
    return list;
  }, [today, events]);

  return (
    <div className="mb-6 pb-3 border-b border-[var(--line)]">
      <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2.5">
        <span className="flex items-center gap-1.5 font-medium">
          <CalendarIcon className="w-3.5 h-3.5 text-[var(--accent)]" />
          Calendario Semanal
        </span>
        <span className="text-[11px] opacity-70">
          Hoy: {today}
        </span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {days.map((d) => {
          const isSelected = d.iso === selectedDate;
          return (
            <button
              key={d.iso}
              onClick={() => onSelectDate(d.iso)}
              className={`flex-1 min-w-[70px] max-w-[120px] p-2.5 rounded-xl border transition-all text-center relative ${
                isSelected
                  ? 'bg-[#d4e4e1] text-[#233f45] border-[#d4e4e1] font-bold shadow-md'
                  : d.isToday
                  ? 'bg-[var(--surface)] text-[var(--accent)] border-[var(--accent)] font-semibold'
                  : 'bg-[var(--surface)]/60 text-[var(--ink)] border-[var(--line)] hover:bg-[var(--surface)]'
              }`}
            >
              <div className="text-[11px] uppercase tracking-wider opacity-70">
                {d.dayName}
              </div>
              <div className="text-xl font-normal mt-0.5">
                {d.dayNum}
              </div>

              {/* Event indicator dot */}
              {d.hasEvents && (
                <div className="flex justify-center mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#233f45]' : 'bg-[var(--accent)]'}`} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
