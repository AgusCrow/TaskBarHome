import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Zap,
  Activity,
  Image as ImageIcon,
  Play,
  Pause,
  Maximize2,
  FolderKanban
} from 'lucide-react';
import type { DailyFocus, TaskItem, ProjectItem, KanbanBoard } from '../types';

interface StageHeroCarouselProps {
  dailyFocus: DailyFocus | null;
  tasks: TaskItem[];
  projects: ProjectItem[];
  kanban: KanbanBoard | null;
  photos: string[];
  onStartFocus: (label?: string) => void;
  onOpenQuickAdd: () => void;
  onSelectView: (view: 'stage' | 'kanban' | 'tasks' | 'calendar' | 'timers' | 'notes' | 'workflows') => void;
  isTvMode?: boolean;
}

interface StageSlide {
  id: string;
  category: string;
  subhead: string;
  title: string;
  meta?: string;
  energyScore?: number;
  focusScore?: number;
  buttonLabel: string;
  actionKind: 'focus' | 'task' | 'project' | 'photos';
  artTheme: 'mountains' | 'waves' | 'dawn' | 'photo';
  imageUrl?: string;
}

export const StageHeroCarousel: React.FC<StageHeroCarouselProps> = ({
  dailyFocus,
  tasks,
  projects,
  kanban,
  photos,
  onStartFocus,
  onOpenQuickAdd,
  onSelectView,
  isTvMode = false
}) => {
  // Manejo de foto actual y auto-play para el widget de fotos
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isPhotoAutoPlay, setIsPhotoAutoPlay] = useState(true);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!isPhotoAutoPlay || photos.length <= 1) return;
    const interval = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [isPhotoAutoPlay, photos.length]);

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length === 0) return;
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length === 0) return;
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const toggleAutoPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPhotoAutoPlay((prev) => !prev);
  };

  // Construir diapositivas con datos reales de la bóveda (Sin mockups de Machine)
  const slides: StageSlide[] = React.useMemo(() => {
    const list: StageSlide[] = [];

    // 1. Focus principal del día
    list.push({
      id: 'focus-today',
      category: '00 HUMAN / TODAY',
      subhead: "Today's Focus • 00 Human / 10 Daily Notes",
      title: dailyFocus?.focus || 'Definir el objetivo prioritario del día en tu nota diaria.',
      energyScore: dailyFocus?.energyScore,
      focusScore: dailyFocus?.focusQualityScore,
      buttonLabel: 'Iniciar foco (25m)',
      actionKind: 'focus',
      artTheme: 'mountains'
    });

    // 2. Proyectos Reales de Obsidian (Kanban Board y notas de proyectos)
    const kanbanTotal = kanban?.columns.reduce((acc, col) => acc + col.cards.length, 0) || 0;
    const inProgressCards =
      kanban?.columns.find((c) => /curso|progress|doing|haciendo/i.test(c.name))?.cards.length || 0;
    const completedCards =
      kanban?.columns.find((c) => /complet|done|hecho|termin/i.test(c.name))?.cards.length || 0;
    const activeProjectsCount = projects.filter(p => p.status === 'active').length || projects.length;

    list.push({
      id: 'projects-kanban',
      category: '00 HUMAN / PROYECTOS',
      subhead: `Tablero Kanban • ${activeProjectsCount} proyectos activos`,
      title: `${kanbanTotal} tareas en el tablero: ${inProgressCards} en curso, ${completedCards} terminadas`,
      meta: kanban?.title ? `${kanban.title} • 00 Human/30 Projects` : '00 Human / 30 Projects / Kanban Board.md',
      buttonLabel: 'Abrir tablero Kanban',
      actionKind: 'project',
      artTheme: 'dawn'
    });

    // 3. Tarea prioritaria pendiente de la lista
    const pendingUrgent =
      tasks.find(
        (t) => !t.completed && (t.priority === 'highest' || t.priority === 'high' || t.tags.includes('urgente'))
      ) || tasks.find((t) => !t.completed);

    if (pendingUrgent) {
      list.push({
        id: 'task-priority',
        category: '00 HUMAN / TAREA PRIORITARIA',
        subhead: `Task • ${pendingUrgent.project || pendingUrgent.file}`,
        title: pendingUrgent.text,
        meta: pendingUrgent.dueDate ? `📅 Vencimiento: ${pendingUrgent.dueDate}` : undefined,
        buttonLabel: 'Marcar en foco',
        actionKind: 'task',
        artTheme: 'waves'
      });
    }

    // 4. Slide de Galería Familiar si hay fotos
    if (photos.length > 0) {
      list.push({
        id: 'family-photos',
        category: 'AMBIENT / FOTOS',
        subhead: `Álbum Familiar • ${photos.length} fotos cargadas`,
        title: 'Recuerdos y Álbum Familiar de Fondo',
        meta: 'Carpeta /photos en ZacrowServer',
        buttonLabel: 'Ver fotos',
        actionKind: 'photos',
        artTheme: 'photo',
        imageUrl: photos[photoIndex % photos.length]
      });
    }

    return list;
  }, [dailyFocus, kanban, tasks, photos, photoIndex]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  const current = slides[currentIndex] || slides[0];

  const handleAction = () => {
    if (current.actionKind === 'focus') {
      onStartFocus(current.title);
    } else if (current.actionKind === 'project') {
      onSelectView('kanban');
    } else if (current.actionKind === 'task') {
      onSelectView('tasks');
    } else if (current.actionKind === 'photos') {
      if (photos.length > 0) {
        setFullscreenPhoto(photos[photoIndex % photos.length]);
      }
    }
  };

  return (
    <div className="relative w-full my-auto py-2 flex items-center justify-center select-none">
      {/* Tarjeta previa a la izquierda */}
      <div
        onClick={prevSlide}
        className="hidden xl:block absolute left-0 w-[18%] h-[82%] rounded-3xl bg-[#112328]/50 border border-white/5 opacity-30 scale-95 cursor-pointer blur-[1px] hover:opacity-50 transition-all pointer-events-auto overflow-hidden p-6"
      >
        <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-2">
          {slides[(currentIndex - 1 + slides.length) % slides.length]?.category}
        </span>
        <h4 className="text-sm font-light text-[var(--ink)] line-clamp-3">
          {slides[(currentIndex - 1 + slides.length) % slides.length]?.title}
        </h4>
      </div>

      {/* Flecha Izquierda */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-6 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-[var(--muted)] hover:text-white border border-white/10 backdrop-blur-md transition-all shadow-lg"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Tarjeta Central Cinemática */}
      <div className="w-full max-w-4xl min-h-[380px] md:min-h-[420px] rounded-3xl border border-[var(--line)] bg-gradient-to-br from-[#183138] via-[#122428] to-[#0c181b] shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col justify-between p-6 md:p-10 z-10">
        {/* Fondo Artístico o Foto */}
        {current.imageUrl ? (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
            <img
              src={current.imageUrl}
              alt="Foto familiar"
              className="w-full h-full object-cover scale-105 filter blur-[0.5px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c181b] via-[#122428]/80 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 pointer-events-none opacity-45 overflow-hidden">
            <div className="absolute -right-24 -top-24 w-96 h-96 bg-[var(--accent)]/15 rounded-full blur-3xl" />
            <div className="absolute right-0 bottom-0 w-[55%] h-full opacity-60">
              <svg
                viewBox="0 0 500 400"
                className="w-full h-full object-cover"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M150 400 C 200 320, 260 300, 320 330 C 380 360, 440 290, 500 310 L 500 400 Z"
                  fill="#203d45"
                  fillOpacity="0.7"
                />
                <path
                  d="M220 400 C 270 280, 340 250, 400 280 C 450 300, 480 260, 500 270 L 500 400 Z"
                  fill="#2c515a"
                  fillOpacity="0.5"
                />
                <path
                  d="M300 400 C 340 220, 410 200, 470 230 C 500 245, 500 220, 500 220 L 500 400 Z"
                  fill="#f1bc90"
                  fillOpacity="0.18"
                />
                <circle cx="420" cy="140" r="38" fill="#e7d4c0" fillOpacity="0.25" />
                <circle cx="460" cy="130" r="48" fill="#e7d4c0" fillOpacity="0.15" />
                <circle cx="380" cy="160" r="32" fill="#203d45" fillOpacity="0.6" />
              </svg>
            </div>
          </div>
        )}

        {/* Header de la tarjeta */}
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-[var(--accent)] uppercase">
                {current.category}
              </span>
              <span className="text-[var(--muted)] opacity-40">•</span>
              <span className="text-xs text-[var(--muted)] font-medium">
                {current.subhead}
              </span>
            </div>

            {/* Scores o Contador */}
            <div className="flex items-center gap-2">
              {current.energyScore !== undefined && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                  <Zap className="w-2.5 h-2.5 text-emerald-400" />
                  {current.energyScore}/10
                </span>
              )}
              {current.focusScore !== undefined && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
                  <Activity className="w-2.5 h-2.5 text-indigo-400" />
                  {current.focusScore}/10
                </span>
              )}
              <span className="text-xs font-mono text-[var(--muted)] opacity-60 ml-2">
                0{currentIndex + 1} / 0{slides.length}
              </span>
            </div>
          </div>

          {/* Título Principal */}
          <h2
            className={`font-normal text-[var(--ink)] tracking-tight max-w-2xl leading-tight ${
              isTvMode
                ? 'text-3xl md:text-5xl lg:text-5xl'
                : 'text-2xl md:text-4xl'
            }`}
          >
            {current.title}
          </h2>

          {current.meta && (
            <p className="text-xs md:text-sm text-[var(--muted)] mt-2 font-mono opacity-80 flex items-center gap-2">
              {current.actionKind === 'project' && <FolderKanban className="w-3.5 h-3.5 text-[var(--accent)]" />}
              <span>{current.meta}</span>
            </p>
          )}
        </div>

        {/* Footer: Widget REAL de Fotos a la izquierda + Botón de acción a la derecha */}
        <div className="relative z-10 pt-6 mt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
          {/* Control y visor de FOTOS en lugar de botones decorativos */}
          <div className="flex items-center gap-2.5 p-1.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
            {photos.length > 0 ? (
              <>
                {/* Miniatura de la foto */}
                <div
                  onClick={() => setFullscreenPhoto(photos[photoIndex % photos.length])}
                  className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 cursor-pointer hover:brightness-110 transition-all shrink-0 bg-slate-900"
                  title="Ver foto en pantalla completa"
                >
                  <img
                    src={photos[photoIndex % photos.length]}
                    alt="Miniatura"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Controles de fotos */}
                <div className="flex items-center gap-1 text-[var(--muted)]">
                  <button
                    onClick={prevPhoto}
                    className="p-1 rounded-lg hover:text-[var(--ink)] hover:bg-white/10 transition-colors"
                    title="Foto anterior"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={toggleAutoPlay}
                    className="p-1 rounded-lg hover:text-[var(--ink)] hover:bg-white/10 transition-colors text-[var(--accent)]"
                    title={isPhotoAutoPlay ? 'Pausar carrusel' : 'Reproducir carrusel'}
                  >
                    {isPhotoAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={nextPhoto}
                    className="p-1 rounded-lg hover:text-[var(--ink)] hover:bg-white/10 transition-colors"
                    title="Foto siguiente"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[11px] font-mono px-1 opacity-80">
                    {photoIndex + 1}/{photos.length}
                  </span>

                  <button
                    onClick={() => setFullscreenPhoto(photos[photoIndex % photos.length])}
                    className="p-1 rounded-lg hover:text-[var(--ink)] hover:bg-white/10 transition-colors ml-0.5"
                    title="Ver en grande"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onOpenQuickAdd}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                title="Abrir captura rápida"
              >
                <ImageIcon className="w-4 h-4 text-[var(--accent)]" />
                <span className="font-light">Cargar fotos en <code className="text-[var(--accent)] font-mono">photos/</code></span>
              </button>
            )}
          </div>

          {/* Botón de acción principal melocotón estilo EMAI */}
          <button
            onClick={handleAction}
            className="px-6 py-2.5 rounded-full bg-[var(--accent)] text-[#15272c] font-medium text-sm hover:brightness-105 active:scale-95 transition-all shadow-[0_4px_18px_rgba(241,188,144,0.3)] flex items-center gap-2 group"
          >
            <span>{current.buttonLabel}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Flecha Derecha */}
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-6 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-[var(--muted)] hover:text-white border border-white/10 backdrop-blur-md transition-all shadow-lg"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Tarjeta siguiente a la derecha */}
      <div
        onClick={nextSlide}
        className="hidden xl:block absolute right-0 w-[18%] h-[82%] rounded-3xl bg-[#112328]/50 border border-white/5 opacity-30 scale-95 cursor-pointer blur-[1px] hover:opacity-50 transition-all pointer-events-auto overflow-hidden p-6"
      >
        <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-2">
          {slides[(currentIndex + 1) % slides.length]?.category}
        </span>
        <h4 className="text-sm font-light text-[var(--ink)] line-clamp-3">
          {slides[(currentIndex + 1) % slides.length]?.title}
        </h4>
      </div>

      {/* Modal de Foto Completa */}
      {fullscreenPhoto && (
        <div
          onClick={() => setFullscreenPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
            <img
              src={fullscreenPhoto}
              alt="Foto ampliada"
              className="w-full h-full object-contain max-h-[85vh]"
            />
            <button
              onClick={() => setFullscreenPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
