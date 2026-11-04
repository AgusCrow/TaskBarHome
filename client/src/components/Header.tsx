import React, { useState, useEffect } from 'react';
import { CloudSun, Wind, Wifi, Maximize2, Minimize2, Tv, Smartphone } from 'lucide-react';
import type { WeatherData } from '../types';

interface HeaderProps {
  weather: WeatherData | null;
  isConnected: boolean;
  isTvMode: boolean;
  onToggleTvMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  weather,
  isConnected,
  isTvMode,
  onToggleTvMode
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

  const formattedTime = time.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: isTvMode ? undefined : '2-digit',
    hour12: false
  });

  const formattedDate = time.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="glass-panel rounded-3xl border border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4 mb-6 shadow-2xl">
      {/* Clock & Date */}
      <div className="flex items-baseline gap-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-mono text-white drop-shadow">
          {formattedTime}
        </h1>
        <p className="text-sm md:text-base font-medium text-slate-300 capitalize">
          {formattedDate}
        </p>
      </div>

      {/* Weather Pill */}
      {weather && (
        <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <CloudSun className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{weather.temperature}°C</span>
              <span className="text-xs text-slate-300 font-medium">({weather.city})</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{weather.description}</span>
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-sky-400" /> {weather.windSpeed} km/h
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Controls & Sync Status */}
      <div className="flex items-center gap-3">
        {/* Sync Indicator */}
        <div
          title={isConnected ? 'Sincronizado con Obsidian' : 'Desconectado'}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
          <Wifi className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isConnected ? 'Obsidian Live' : 'Reconectando...'}</span>
        </div>

        {/* TV Mode Toggle */}
        <button
          onClick={onToggleTvMode}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
            isTvMode
              ? 'bg-sky-500/20 border-sky-400/40 text-sky-300'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title="Alternar Modo TV / Modo Control"
        >
          {isTvMode ? <Tv className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          <span>{isTvMode ? 'Modo TV' : 'Modo Control'}</span>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          title="Pantalla completa"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

