/** Fecha local en formato AAAA-MM-DD (sin saltos por zona horaria). */
export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayLocal(): string {
  return toDateStr(new Date());
}

/** Convierte AAAA-MM-DD a Date local (mediodía, para evitar corrimientos). */
export function parseDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

/** Días entre dos fechas AAAA-MM-DD (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((parseDateStr(b).getTime() - parseDateStr(a).getTime()) / 86400000);
}

/** "hoy", "mañana", "vie 6 nov", "hace 2 días"… */
export function relativeDay(date: string, today: string): string {
  const diff = daysBetween(today, date);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  if (diff === -1) return 'Ayer';
  if (diff < 0) return `Hace ${-diff} días`;
  if (diff < 7) {
    return parseDateStr(date).toLocaleDateString('es-AR', { weekday: 'long' });
  }
  return parseDateStr(date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
}
