import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AmbientBackground } from './components/AmbientBackground';
import { Header } from './components/Header';
import { NorthStarHero } from './components/NorthStarHero';
import { DateStrip } from './components/DateStrip';
import { WorkflowsView } from './components/WorkflowsView';
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
  const [activeTab, setActiveTab] = useState<'today' | 'kanban' | 'workflows'>('today');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Intl.DateTimeFormat('en-CA').format(new Date()));
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

  const handleStartFocusTimer = () => {
    const focusTimer = data?.timers.find((t) => /focus|pomodoro|enfoque/i.test(t.label));
    if (focusTimer) {
      handleTimerAction(focusTimer.id, 'start');
      notify(`Iniciando ${focusTimer.label}`);
    } else {
      const id = `focus-${Date.now()}`;
      handleTimerAction(id, 'custom', 25, 'Focus Deep Work');
      notify('Timer de foco (25m) iniciado');
    }
  };

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
    <div className="min-h-screen text-[var(--ink)] p-4 md:p-6 lg:p-8 flex flex-col justify-between relative selection:bg-[var(--accent)] selection:text-[#162a30]">
      {/* Dynamic Background Slideshow */}
      <AmbientBackground photos={data?.photos || []} />

      {/* Header with Masthead Clock, Weather, TV toggle & Tabs */}
      <Header
        weather={data?.weather || null}
        isConnected={isConnected}
        isTvMode={isTvMode}
        onToggleTvMode={toggleMode}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Aviso cuando termina un temporizador */}
      <TimerAlert
        timers={data?.timers || []}
        isTvMode={isTvMode}
        onDismiss={(id) => handleTimerAction(id, 'reset')}
      />

      {/* Main Content Area based on Active Tab */}
      <main className="flex-1 flex flex-col gap-6">
        {activeTab === 'today' && (
          <>
            {/* North Star Hero: Next Move / Objetivo Prioritario del Día */}
            <NorthStarHero
              dailyFocus={data?.dailyFocus || null}
              isTvMode={isTvMode}
              onStartFocusTimer={handleStartFocusTimer}
            />

            {/* DateStrip Selector */}
            <DateStrip
              events={data?.calendar || []}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {/* Barra de Gamificación (Rachas, XP y Progreso) */}
            <GamificationWidget tasks={data?.tasks || []} isTvMode={isTvMode} />

            {/* Hoy / Foco: lo que requiere atención ahora */}
            <FocusPanel data={data} isTvMode={isTvMode} />

            {/* 3-Column Bento Dashboard Grid */}
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
          </>
        )}

        {activeTab === 'kanban' && (
          <div className="space-y-6">
            <KanbanWidget board={data?.kanban || null} isTvMode={isTvMode} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TasksWidget tasks={data?.tasks || []} isTvMode={isTvMode} />
              <NotesWidget notes={data?.notes || []} isTvMode={isTvMode} />
            </div>
          </div>
        )}

        {activeTab === 'workflows' && (
          <WorkflowsView
            workflows={data?.workflows || []}
            projects={data?.projects || []}
            isTvMode={isTvMode}
          />
        )}
      </main>

      {/* Minimalistic ambient footer */}
      <footer className="mt-8 flex items-center justify-between text-[11px] text-[var(--muted)] opacity-80 px-2 border-t border-[var(--line)] pt-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--ink)]">TBH Ambient Dashboard</span>
          <span>•</span>
          <span>Obsidian Local-First · Two-Hemisphere System</span>
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