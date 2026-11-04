import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AmbientBackground } from './components/AmbientBackground';
import { Header } from './components/Header';
import { KanbanWidget } from './components/KanbanWidget';
import { TasksWidget } from './components/TasksWidget';
import { CalendarWidget } from './components/CalendarWidget';
import { TimersWidget } from './components/TimersWidget';
import { NotesWidget } from './components/NotesWidget';
import { FocusPanel } from './components/FocusPanel';
import { GamificationWidget } from './components/GamificationWidget';
import { QuickAdd } from './components/QuickAdd';
import { TimerAlert } from './components/TimerAlert';
import { Toast, type ToastState } from './components/Toast';
import { ActionsProvider } from './lib/actions';
import type { DashboardPayload } from './types';

const MODE_KEY = 'tbh-mode';

/** ?mode=tv / ?mode=control fija el modo y lo recuerda; sin parámetro usa el último guardado (por defecto TV). */
function initialIsTvMode(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get('mode');
    if (param === 'tv' || param === 'control') {
      localStorage.setItem(MODE_KEY, param);
      return param === 'tv';
    }
    return localStorage.getItem(MODE_KEY) !== 'control';
  } catch {
    return true;
  }
}

export const App: React.FC = () => {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTvMode, setIsTvMode] = useState(initialIsTvMode);
  const [toast, setToast] = useState<ToastState | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const notify = useCallback((msg: string, kind: 'ok' | 'error' = 'ok') => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), msg, kind });
    toastTimer.current = setTimeout(() => setToast(null), kind === 'error' ? 4500 : 2200);
  }, []);

  const toggleMode = () =>
    setIsTvMode((prev) => {
      try {
        localStorage.setItem(MODE_KEY, prev ? 'control' : 'tv');
      } catch {
        /* sin almacenamiento */
      }
      return !prev;
    });

  // Initial fetch as fallback
  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((initialData) => {
        if (initialData) setData(initialData);
      })
      .catch((err) => console.error('Error fetching dashboard fallback:', err));
  }, []);

  // WebSocket Connection
  useEffect(() => {
    let reconnectTimeout: any;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        console.log('[WebSocket] Connected to TBH server');
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'dashboard:init' || msg.type === 'dashboard:update') {
            setData(msg.payload);
          }
        } catch (e) {
          console.error('[WebSocket] Parse error:', e);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        console.log('[WebSocket] Disconnected. Reconnecting in 3s...');
        reconnectTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = (err) => {
        console.error('[WebSocket] Error:', err);
        socket.close();
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const handleTimerAction = (
    id: string,
    action: 'start' | 'pause' | 'reset' | 'custom',
    minutes?: number,
    label?: string
  ) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'timer:action',
          id,
          action,
          minutes,
          label
        })
      );
    } else {
      // Fallback to REST
      const endpoint = action === 'custom' ? '/api/timers/custom' : `/api/timers/${id}/${action}`;
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: action === 'custom' ? JSON.stringify({ id, label, minutes }) : undefined
      }).catch((e) => console.error('Timer action failed:', e));
    }
  };

  return (
    <ActionsProvider notify={notify}>
    <div className="min-h-screen text-slate-100 p-4 md:p-6 lg:p-8 flex flex-col justify-between relative selection:bg-sky-500 selection:text-white">
      {/* Dynamic Background Slideshow */}
      <AmbientBackground photos={data?.photos || []} />

      {/* Header with Clock, Weather, TV toggle & Status */}
      <Header
        weather={data?.weather || null}
        isConnected={isConnected}
        isTvMode={isTvMode}
        onToggleTvMode={toggleMode}
      />

      {/* Aviso cuando termina un temporizador */}
      <TimerAlert
        timers={data?.timers || []}
        isTvMode={isTvMode}
        onDismiss={(id) => handleTimerAction(id, 'reset')}
      />

      {/* Barra de Gamificación (Rachas, XP y Progreso) */}
      <GamificationWidget tasks={data?.tasks || []} isTvMode={isTvMode} />

      {/* Hoy / Foco: lo que requiere atención ahora */}
      <FocusPanel data={data} isTvMode={isTvMode} />

      {/* Main Grid Content */}
      <main className="flex-1 flex flex-col gap-6">
        {/* Kanban Board Section */}
        <section className="w-full">
          <KanbanWidget board={data?.kanban || null} isTvMode={isTvMode} />
        </section>

        {/* 3-Column Lower Dashboard Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
          {/* Column 1: Tasks & Quehaceres */}
          <TasksWidget tasks={data?.tasks || []} isTvMode={isTvMode} />

          {/* Column 2: Calendar & Events */}
          <CalendarWidget events={data?.calendar || []} isTvMode={isTvMode} />

          {/* Column 3: Timers & Notes */}
          <div className="flex flex-col gap-6">
            <TimersWidget
              timers={data?.timers || []}
              onTimerAction={handleTimerAction}
              isTvMode={isTvMode}
            />
            <NotesWidget notes={data?.notes || []} isTvMode={isTvMode} />
          </div>
        </section>
      </main>

      {/* Minimalistic ambient footer */}
      <footer className="mt-6 flex items-center justify-between text-[11px] text-slate-400/80 px-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">TBH Ambient Dashboard</span>
          <span>•</span>
          <span>Obsidian Local-First</span>
        </div>
        {data?.lastUpdated && (
          <div>
            Última sync:{' '}
            {new Date(data.lastUpdated).toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        )}
      </footer>

      {/* Captura rápida (solo Modo Control) */}
      {!isTvMode && <QuickAdd />}
      <Toast toast={toast} />
    </div>
    </ActionsProvider>
  );
};

export default App;