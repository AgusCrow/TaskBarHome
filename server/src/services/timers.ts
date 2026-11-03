import type { TimerItem } from '../types.js';

let timers: TimerItem[] = [
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    totalSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    isRunning: false,
    endsAt: null
  },
  {
    id: 'short-break',
    label: 'Descanso Corto',
    totalSeconds: 5 * 60,
    remainingSeconds: 5 * 60,
    isRunning: false,
    endsAt: null
  },
  {
    id: 'kitchen-timer',
    label: 'Cocina / Quehacer',
    totalSeconds: 15 * 60,
    remainingSeconds: 15 * 60,
    isRunning: false,
    endsAt: null
  }
];

let intervalId: NodeJS.Timeout | null = null;
let onTimerChangeCallback: (() => void) | null = null;

export function registerTimerListener(callback: () => void) {
  onTimerChangeCallback = callback;
}

function updateActiveTimers() {
  const now = Date.now();
  let changed = false;

  for (const timer of timers) {
    if (timer.isRunning && timer.endsAt) {
      const remaining = Math.max(0, Math.round((timer.endsAt - now) / 1000));
      if (remaining !== timer.remainingSeconds) {
        timer.remainingSeconds = remaining;
        changed = true;
      }
      if (remaining <= 0) {
        timer.isRunning = false;
        timer.endsAt = null;
        changed = true;
      }
    }
  }

  const hasRunning = timers.some(t => t.isRunning);
  if (!hasRunning && intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  if (changed && onTimerChangeCallback) {
    onTimerChangeCallback();
  }
}

export function getTimers(): TimerItem[] {
  updateActiveTimers();
  return timers;
}

export function startTimer(id: string): TimerItem | null {
  const timer = timers.find(t => t.id === id);
  if (!timer) return null;

  if (timer.remainingSeconds <= 0) {
    timer.remainingSeconds = timer.totalSeconds;
  }

  timer.isRunning = true;
  timer.endsAt = Date.now() + timer.remainingSeconds * 1000;

  if (!intervalId) {
    intervalId = setInterval(updateActiveTimers, 1000);
  }

  if (onTimerChangeCallback) onTimerChangeCallback();
  return timer;
}

export function pauseTimer(id: string): TimerItem | null {
  const timer = timers.find(t => t.id === id);
  if (!timer) return null;

  updateActiveTimers();
  timer.isRunning = false;
  timer.endsAt = null;

  if (onTimerChangeCallback) onTimerChangeCallback();
  return timer;
}

export function resetTimer(id: string): TimerItem | null {
  const timer = timers.find(t => t.id === id);
  if (!timer) return null;

  timer.isRunning = false;
  timer.endsAt = null;
  timer.remainingSeconds = timer.totalSeconds;

  if (onTimerChangeCallback) onTimerChangeCallback();
  return timer;
}

export function setCustomTimer(id: string, label: string, minutes: number): TimerItem {
  let timer = timers.find(t => t.id === id);
  const totalSeconds = Math.max(10, minutes * 60);

  if (timer) {
    timer.label = label;
    timer.totalSeconds = totalSeconds;
    timer.remainingSeconds = totalSeconds;
    timer.isRunning = false;
    timer.endsAt = null;
  } else {
    timer = {
      id,
      label,
      totalSeconds,
      remainingSeconds: totalSeconds,
      isRunning: false,
      endsAt: null
    };
    timers.push(timer);
  }

  if (onTimerChangeCallback) onTimerChangeCallback();
  return timer;
}

