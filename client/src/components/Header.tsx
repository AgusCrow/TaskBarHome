import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  Tv,
  Smartphone,
  Plus
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

  const formattedDate = time.toLocaleDateString('es-AR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="w-full flex items-center justify-between py-2 text-xs text-[var(--muted)] select-none">
      {/* Breadcrumb a la izquierda (EMAI / Home) */}
      <div className="flex items-center gap-2">
        <span className="font-bold tracking-wider text-[var(--ink)]">TBH</span>
        <span className="opacity-40">/</span>
        <span className="font-normal text-[var(--ink)]/90 capitalize">{currentBreadcrumb}</span>
        
        {/* Sync status dot */}
        <span
          className={`w-1.5 h-1.5 rounded-full ml-1.5 transition-colors ${
            isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-400 animate-ping'
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

      {/* Lado derecho: Reloj + Fecha + Botón Acción + TV Toggle */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Clima sutil */}
        {weather && (
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[var(--muted)] opacity-80">
            <span>{weather.city}:</span>
            <span className="font-medium text-[var(--ink)]">{weather.temperature}°C</span>
          </div>
        )}

        {/* Reloj y Fecha (Exacto a la captura) */}
        <div className="flex items-baseline gap-2">
          <span className="font-normal text-lg md:text-xl text-[var(--ink)] tracking-tight font-sans">
            {hoursMinutes}
          </span>
          <span className="hidden sm:inline text-xs text-[var(--muted)] opacity-80 font-light capitalize">
            {formattedDate}
          </span>
        </div>

        {/* Botón de acción rápida con borde sutil */}
        <button
          onClick={onOpenQuickAdd}
          className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-[var(--ink)] transition-all flex items-center gap-1.5 text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="hidden md:inline">Capturar</span>
        </button>

        {/* Toggle Modo TV */}
        <button
          onClick={onToggleTvMode}
          className={`p-1.5 rounded-xl border transition-all ${
            isTvMode
              ? 'bg-[var(--accent)]/15 border-[var(--accent)]/40 text-[var(--accent)]'
              : 'bg-white/[0.04] border-white/10 text-[var(--muted)] hover:text-white'
          }`}
          title={isTvMode ? 'Modo TV activado' : 'Modo Control activado'}
        >
          {isTvMode ? <Tv className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
