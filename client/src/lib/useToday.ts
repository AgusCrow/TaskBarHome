import { useEffect, useState } from 'react';
import { todayLocal } from './dates';

/** Fecha de hoy (AAAA-MM-DD) que se actualiza sola al cambiar el día. */
export function useToday(): string {
  const [today, setToday] = useState(todayLocal());
  useEffect(() => {
    const id = setInterval(() => setToday(todayLocal()), 30_000);
    return () => clearInterval(id);
  }, []);
  return today;
}
