import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  Tv,
  Smartphone,
  Plus,
  CloudSun,
  Sun,
  CloudRain
} from 'lucide-react';
import type { WeatherData } from '../types';

interface HeaderProps {
  weather: WeatherData | null;
  isConnected: boolean;
  isTvMode: boolean;
  onToggleTvMode: () => void;
  onOpenQuickAdd: () => void;
  currentBreadcrumb?: string;
}

export const Header: React.FC<HeaderProps> = ({
  weather,
  isConnected,
  isTvMode,
  onToggleTvMode,
  onOpenQuickAdd,
  currentBreadcrumb = 'Home'
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

  const seconds = isTvMode ? time.toLocaleTimeString('es-AR', { second: '2-digit' }) : null;

  const formattedDate = time.toLocaleDateString('es-AR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Icono dinámico según el clima
  const getWeatherIcon = () => {
    if (!weather) return <CloudSun className={isTvMode ? 'w-8 h-8 text-[var(--accent)]' : 'w-4 h-4 text-[var(--accent)]'} />;
    const code = weather.weatherCode;
    if (code === 0 || code === 1) {
      return <Sun className={isTvMode ? 'w-8 h-8 text-amber-300 animate-spin-slow' : 'w-4 h-4 text-amber-300'} />;
    }
    if (code >= 51 && code <= 67) {
      return <CloudRain className={isTvMode ? 'w-8 h-8 text-sky-400' : 'w-4 h-4 text-sky-400'} />;
    }
    return <CloudSun className={isTvMode ? 'w-8 h-8 text-[var(--accent)]' : 'w-4 h-4 text-[var(--accent)]'} />;
  };

  return (
    <header className="w-full flex items-center justify-between py-2 text-xs text-[var(--muted)] select-none">
      {/* Breadcrumb a la izquierda (TBH / Home) */}
      <div className="flex items-center gap-2">
        <span className={`font-bold tracking-wider text-[var(--ink)] ${isTvMode ? 'text-sm' : 'text-xs'}`}>
          TBH
        </span>
        <span className="opacity-40">/</span>
        <span className={`font-normal text-[var(--ink)]/90 capitalize ${isTvMode ? 'text-sm' : 'text-xs'}`}>
          {currentBreadcrumb}
        </span>

        {/* Sync status dot */}
        <span
          className={`w-2 h-2 rounded-full ml-1.5 transition-colors ${
            isConnected ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-rose-400 animate-ping'
          }`}
          title={isConnected ? 'Sincronizado en tiempo real' : 'Reconectando...'}
        />
      </div>

      {/* Controles centrales discretos */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg hover:text-[var(--ink)] hover:bg-white/5 transition-colors opacity-70 hover:opacity-100"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa (F11)'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Lado derecho: Reloj + Clima (En modo TV mucho más grande) */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Clima destacado */}
        {weather && (
          <div className={`flex items-center gap-2.5 ${isTvMode ? 'bg-black/25 px-3 py-1.5 rounded-2xl border border-white/5' : 'text-xs opacity-85'}`}>
            {getWeatherIcon()}
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`font-medium text-[var(--ink)] tracking-tight ${isTvMode ? 'text-2xl md:text-3xl' : 'text-sm'}`}>
                  {weather.temperature}°
                </span>
                <span className="text-[10px] text-[var(--muted)] uppercase font-mono">C</span>
              </div>
              {isTvMode && (
                <div className="text-[11px] text-[var(--muted)] leading-none capitalize">
                  {weather.description}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reloj y Fecha (Gigante en modo TV) */}
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-1">
            <span
              className={`font-light text-[var(--ink)] tracking-tight font-sans ${
                isTvMode
                  ? 'text-4xl md:text-5xl lg:text-6xl leading-none'
                  : 'text-lg md:text-xl'
              }`}
            >
              {hoursMinutes}
            </span>
            {seconds && isTvMode && (
              <span className="text-xs md:text-sm font-mono text-[var(--muted)] opacity-60">
                :{seconds}
              </span>
            )}
          </div>
          <span
            className={`text-[var(--accent)] font-medium capitalize ${
              isTvMode ? 'text-xs md:text-sm mt-0.5' : 'text-[11px] opacity-80'
            }`}
          >
            {formattedDate}
          </span>
        </div>

        {/* Botón de acción rápida (Solo en modo control o si no es TV) */}
        {!isTvMode && (
          <button
            onClick={onOpenQuickAdd}
            className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-[var(--ink)] transition-all flex items-center gap-1.5 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="hidden md:inline">Capturar</span>
          </button>
        )}

        {/* Toggle Modo TV */}
        <button
          onClick={onToggleTvMode}
          className={`p-2 rounded-xl border transition-all ${
            isTvMode
              ? 'bg-[var(--accent)]/15 border-[var(--accent)]/40 text-[var(--accent)]'
              : 'bg-white/[0.04] border-white/10 text-[var(--muted)] hover:text-white'
          }`}
          title={isTvMode ? 'Modo TV activado (clic para modo control)' : 'Modo Control activado'}
        >
          {isTvMode ? <Tv className="w-5 h-5" /> : <Smartphone className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
