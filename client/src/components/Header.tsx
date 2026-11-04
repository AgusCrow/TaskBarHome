import React, { useState, useEffect } from 'react';
import { CloudSun, Wind, Wifi, Maximize2, Minimize2, Tv, Smartphone, LayoutDashboard, Kanban, Cpu } from 'lucide-react';
import type { WeatherData } from '../types';

interface HeaderProps {
  weather: WeatherData | null;
  isConnected: boolean;
  isTvMode: boolean;
  onToggleTvMode: () => void;
  activeTab: 'today' | 'kanban' | 'workflows';
  onSelectTab: (tab: 'today' | 'kanban' | 'workflows') => void;
}

export const Header: React.FC<HeaderProps> = ({
  weather,
  isConnected,
  isTvMode,
  onToggleTvMode,
  activeTab,
  onSelectTab
}) => {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const hoursMinutes = time.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const seconds = isTvMode
    ? null
    : time.toLocaleTimeString('es-AR', { second: '2-digit' });

  const formattedDate = time.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="mb-6">
      {/* Top Nav Line */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-[var(--line)]">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-[#283135] font-black text-xs shadow-md">
            TBH
          </div>
          <span className="text-sm font-medium tracking-wide text-[var(--ink)]">
            Command Center <span className="text-[var(--muted)] opacity-60">· Obsidian HQ</span>
          </span>
        </div>

        {/* Navigation Tabs (Hoy / Kanban / Workflows) */}
        <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-black/20 border border-[var(--line)]">
          <button
            onClick={() => onSelectTab('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'today'
                ? 'bg-[#d4e4e1] text-[#233f45] font-semibold shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Hoy</span>
          </button>
          <button
            onClick={() => onSelectTab('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'kanban'
                ? 'bg-[#d4e4e1] text-[#233f45] font-semibold shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Proyectos</span>
          </button>
          <button
            onClick={() => onSelectTab('workflows')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'workflows'
                ? 'bg-[#d4e4e1] text-[#233f45] font-semibold shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Workflows IA</span>
          </button>
        </nav>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-3">
          {/* Live Sync Dot */}
          <div
            title={isConnected ? 'Sincronizado en tiempo real' : 'Reconectando...'}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <Wifi className="w-3 h-3" />
            <span className="hidden sm:inline">{isConnected ? 'En vivo' : 'Offline'}</span>
          </div>

          {/* Mode Switcher */}
          <button
            onClick={onToggleTvMode}
            className="action-btn text-xs !min-h-[34px] !py-1 !px-2.5"
            title="Alternar Modo TV y Modo Control"
          >
            {isTvMode ? <Tv className="w-3.5 h-3.5 text-[var(--accent)]" /> : <Smartphone className="w-3.5 h-3.5 text-[var(--accent)]" />}
            <span className="hidden sm:inline">{isTvMode ? 'TV Mode' : 'Control'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
            title="Pantalla completa"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* EMAI Masthead Clock & Weather */}
      <div className="flex flex-wrap items-baseline justify-between gap-6 pt-2">
        {/* Huge 72px Rubik Clock */}
        <div className="flex items-baseline gap-4 md:gap-6">
          <div className="flex items-baseline">
            <span className="text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-[var(--ink)] font-sans">
              {hoursMinutes}
            </span>
            {seconds && (
              <span className="text-2xl md:text-3xl font-light text-[var(--muted)] opacity-60 ml-1">
                :{seconds}
              </span>
            )}
          </div>
          <span className="text-base md:text-lg text-[var(--muted)] capitalize font-normal">
            {formattedDate}
          </span>
        </div>

        {/* Weather Glance Pill */}
        {weather && (
          <div className="flex items-center gap-3.5 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
            <CloudSun className="w-7 h-7 text-[var(--accent)] shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[var(--ink)]">{weather.temperature}°C</span>
                <span className="text-xs text-[var(--muted)]">({weather.city})</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <span>{weather.description}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3 text-[var(--accent)]" /> {weather.windSpeed} km/h
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
