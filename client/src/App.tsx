import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AmbientBackground } from './components/AmbientBackground';
import { Header } from './components/Header';
import { DateStrip } from './components/DateStrip';
import { StageHeroCarousel } from './components/StageHeroCarousel';
import { FloatingDock, type NavView } from './components/FloatingDock';
import { WorkflowsView } from './components/WorkflowsView';
import { KanbanWidget } from './components/KanbanWidget';
import { TasksWidget } from './components/TasksWidget';
import { CalendarWidget } from './components/CalendarWidget';
import { TimersWidget } from './components/TimersWidget';
import { NotesWidget } from './components/NotesWidget';
import { FocusPanel } from './components/FocusPanel';
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
  const [currentView, setCurrentView] = useState<NavView>('stage');
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Intl.DateTimeFormat('en-CA').format(new Date())
  );
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
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

  const handleStartFocusTimer = (label = 'Focus Deep Work') => {
    const focusTimer = data?.timers.find((t) => /focus|pomodoro|enfoque/i.test(t.label));
    if (focusTimer) {
      handleTimerAction(focusTimer.id, 'start');
      notify(`Iniciando ${focusTimer.label}`);
    } else {
      const id = `focus-${Date.now()}`;
      handleTimerAction(id, 'custom', 25, label);
      notify(`Timer iniciado: ${label} (25 min)`);
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

  const getBreadcrumbLabel = () => {
    switch (currentView) {
      case 'stage':
        return 'Home';
      case 'kanban':
        return 'Proyectos / Kanban';
      case 'tasks':
        return 'Tareas';
      case 'calendar':
        return 'Agenda';
      case 'timers':
        return 'Temporizadores';
      case 'notes':
        return 'Notas';
      case 'workflows':
        return 'Workflows IA';
      default:
        return 'Home';
    }
  };

  return (
    <ActionsProvider notify={notify}>
      <div className="min-h-screen text-[var(--ink)] px-4 md:px-8 py-3 md:py-4 flex flex-col justify-between relative selection:bg-[var(--accent)] selection:text-[#162a30] pb-24">
        {/* Dynamic Background Slideshow */}
        <AmbientBackground photos={data?.photos || []} />

        {/* Top Header Strip (EMAI / Home + Clock + Controls) */}
        <Header
          weather={data?.weather || null}
          isConnected={isConnected}
          isTvMode={isTvMode}
          onToggleTvMode={toggleMode}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          currentBreadcrumb={getBreadcrumbLabel()}
        />

        {/* Horizontal DateStrip Bar with Indicators & Badges */}
        <DateStrip
          events={data?.calendar || []}
          tasks={data?.tasks || []}
          workflows={data?.workflows || []}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          isTvMode={isTvMode}
        />

        {/* Aviso cuando termina un temporizador */}
        <TimerAlert
          timers={data?.timers || []}
          isTvMode={isTvMode}
          onDismiss={(id) => handleTimerAction(id, 'reset')}
        />

        {/* Main Interactive Stage */}
        <main className="flex-1 flex flex-col justify-center my-2">
          {currentView === 'stage' && (
            <div className="flex flex-col gap-8 w-full">
              {/* Central Cinematic Coverflow Hero Card (Exacto a captura EMAI) */}
              <StageHeroCarousel
                dailyFocus={data?.dailyFocus || null}
                tasks={data?.tasks || []}
                projects={data?.projects || []}
                workflows={data?.workflows || []}
                onStartFocus={handleStartFocusTimer}
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
                isTvMode={isTvMode}
              />

              {/* Paneles Bento de Apoyo (Visibles al hacer scroll o en pantallas amplias) */}
              <div className="space-y-6 pt-4 border-t border-white/5 opacity-85 hover:opacity-100 transition-opacity">
                <FocusPanel data={data} isTvMode={isTvMode} />
              </div>
            </div>
          )}

          {currentView === 'kanban' && (
            <div className="w-full space-y-6 py-4 animate-in fade-in duration-300">
              <KanbanWidget board={data?.kanban || null} isTvMode={isTvMode} />
            </div>
          )}

          {currentView === 'tasks' && (
            <div className="w-full max-w-5xl mx-auto py-4 animate-in fade-in duration-300">
              <TasksWidget tasks={data?.tasks || []} isTvMode={isTvMode} />
            </div>
          )}

          {currentView === 'calendar' && (
            <div className="w-full max-w-5xl mx-auto py-4 animate-in fade-in duration-300">
              <CalendarWidget events={data?.calendar || []} isTvMode={isTvMode} />
            </div>
          )}

          {currentView === 'timers' && (
            <div className="w-full max-w-4xl mx-auto py-4 animate-in fade-in duration-300">
              <TimersWidget
                timers={data?.timers || []}
                onTimerAction={handleTimerAction}
                isTvMode={isTvMode}
              />
            </div>
          )}

          {currentView === 'notes' && (
            <div className="w-full max-w-5xl mx-auto py-4 animate-in fade-in duration-300">
              <NotesWidget notes={data?.notes || []} isTvMode={isTvMode} />
            </div>
          )}

          {currentView === 'workflows' && (
            <div className="w-full max-w-6xl mx-auto py-4 animate-in fade-in duration-300">
              <WorkflowsView
                workflows={data?.workflows || []}
                projects={data?.projects || []}
                isTvMode={isTvMode}
              />
            </div>
          )}
        </main>

        {/* Floating Dock de Navegación Inferior (Estilo macOS / iPadOS) */}
        <FloatingDock
          currentView={currentView}
          onSelectView={setCurrentView}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          isTvMode={isTvMode}
        />

        {/* Modal de Captura Rápida */}
        {isQuickAddOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg relative">
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="absolute -top-3 -right-3 z-50 w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 text-sm font-bold shadow-lg"
              >
                ✕
              </button>
              <QuickAdd />
            </div>
          </div>
        )}

        {/* Ambient Footer Info */}
        <footer className="w-full flex items-center justify-between text-[11px] text-[var(--muted)] opacity-60 px-2 mt-4 select-none">
          <div className="flex items-center gap-2">
            <span>TBH Ambient Dashboard</span>
            <span>•</span>
            <span>Obsidian Two-Hemisphere</span>
          </div>
          {data?.lastUpdated && (
            <div>
              Sync:{' '}
              {new Date(data.lastUpdated).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </footer>

        <Toast toast={toast} />
      </div>
    </ActionsProvider>
  );
};

export default App;
