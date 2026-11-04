import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Pin,
  EyeOff,
  RefreshCw,
  ArrowRight,
  Zap,
  Activity
} from 'lucide-react';
import type { DailyFocus, TaskItem, ProjectItem, WorkflowItem } from '../types';

interface StageHeroCarouselProps {
  dailyFocus: DailyFocus | null;
  tasks: TaskItem[];
  projects: ProjectItem[];
  workflows: WorkflowItem[];
  onStartFocus: (label?: string) => void;
  onOpenQuickAdd: () => void;
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
  actionKind: 'focus' | 'task' | 'project' | 'workflow';
  artTheme: 'waves' | 'mountains' | 'nebula' | 'dawn';
}

export const StageHeroCarousel: React.FC<StageHeroCarouselProps> = ({
  dailyFocus,
  tasks,
  projects,
  workflows,
  onStartFocus,
  onOpenQuickAdd,
  isTvMode = false
}) => {
  // Construir las diapositivas con datos reales de la bóveda
  const slides: StageSlide[] = React.useMemo(() => {
    const list: StageSlide[] = [];

    // 1. Focus principal del día
    list.push({
      id: 'focus-today',
      category: 'TBH / TODAY',
      subhead: 'Today\'s Focus • 00 Human / 10 Daily Notes',
      title: dailyFocus?.focus || 'Definir el objetivo prioritario del día en tu nota diaria.',
      energyScore: dailyFocus?.energyScore,
      focusScore: dailyFocus?.focusQualityScore,
      buttonLabel: 'Iniciar foco',
      actionKind: 'focus',
      artTheme: 'mountains'
    });

    // 2. Tarea prioritaria pendiente
    const pendingUrgent = tasks.find((t) => !t.completed && (t.tags.includes('urgente') || t.tags.includes('foco'))) ||
      tasks.find((t) => !t.completed);
    if (pendingUrgent) {
      list.push({
        id: 'task-priority',
        category: 'TBH / NEXT ACTION',
        subhead: `Task • ${pendingUrgent.file}`,
        title: pendingUrgent.text,
        meta: pendingUrgent.dueDate ? `Vence: ${pendingUrgent.dueDate}` : undefined,
        buttonLabel: 'Hacer ahora',
        actionKind: 'task',
        artTheme: 'waves'
      });
    }

    // 3. Proyecto activo
    const activeProject = projects.find((p) => p.status === 'active');
    if (activeProject) {
      list.push({
        id: 'project-active',
        category: 'TBH / PROJECT',
        subhead: `Active Project • ${activeProject.area || 'Workspace'}`,
        title: activeProject.title,
        meta: '00 Human / 30 Projects',
        buttonLabel: 'Abrir proyecto',
        actionKind: 'project',
        artTheme: 'dawn'
      });
    }

    // 4. Workflow de Machine
    if (workflows.length > 0) {
      const wf = workflows[0];
      list.push({
        id: 'workflow-machine',
        category: 'EMAI / MACHINE',
        subhead: `Automation • ${wf.path}`,
        title: `${wf.name}: Preparado para ejecutar drafts sin tocar tus notas`,
        meta: `${wf.findingsCount} lecciones aprendidas registradas`,
        buttonLabel: 'Ver workflow',
        actionKind: 'workflow',
        artTheme: 'nebula'
      });
    }

    return list;
  }, [dailyFocus, tasks, projects, workflows]);

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
    } else if (current.actionKind === 'task') {
      onStartFocus(`Tarea: ${current.title}`);
    } else {
      onOpenQuickAdd();
    }
  };

  return (
    <div className="relative w-full my-auto py-2 flex items-center justify-center select-none">
      {/* Tarjeta previa asomándose a la izquierda */}
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

      {/* Tarjeta Central Cinemática (Idéntica a la captura de EMAI HQ) */}
      <div className="w-full max-w-4xl min-h-[380px] md:min-h-[420px] rounded-3xl border border-[var(--line)] bg-gradient-to-br from-[#183138] via-[#122428] to-[#0c181b] shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col justify-between p-6 md:p-10 z-10">
        {/* Fondo Artístico Procedural Estilo Paisaje Volumétrico / Olas Orientales */}
        <div className="absolute inset-0 pointer-events-none opacity-45 overflow-hidden">
          {/* Degradado luminoso derecho */}
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-[var(--accent)]/15 rounded-full blur-3xl" />
          <div className="absolute right-0 bottom-0 w-[55%] h-full opacity-60">
            <svg
              viewBox="0 0 500 400"
              className="w-full h-full object-cover"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Nubes y ondas estilizadas */}
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
              {/* Crestas de relieve */}
              <circle cx="420" cy="140" r="38" fill="#e7d4c0" fillOpacity="0.25" />
              <circle cx="460" cy="130" r="48" fill="#e7d4c0" fillOpacity="0.15" />
              <circle cx="380" cy="160" r="32" fill="#203d45" fillOpacity="0.6" />
            </svg>
          </div>
        </div>

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

            {/* Scores de Energía y Foco si aplican */}
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
            <p className="text-xs md:text-sm text-[var(--muted)] mt-2 font-mono opacity-80">
              {current.meta}
            </p>
          )}
        </div>

        {/* Footer de la tarjeta con acciones e interacción */}
        <div className="relative z-10 pt-8 mt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
          {/* Botones de acción rápida a la izquierda */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/30 border border-white/5 text-[var(--muted)]">
            <button
              onClick={() => {}}
              className="p-1.5 rounded-lg hover:text-[var(--ink)] hover:bg-white/10 transition-colors"
              title="Priorizar / Like"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {}}
              className="p-1.5 rounded-lg hover:text-[var(--ink)] hover:bg-white/10 transition-colors"
              title="Postergar / Dislike"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {}}
              className="p-1.5 rounded-lg hover:text-[var(--ink)] hover:bg-white/10 transition-colors"
              title="Fijar en Home"
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {}}
              className="p-1.5 rounded-lg hover:text-[var(--ink)] hover:bg-white/10 transition-colors"
              title="Ocultar"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextSlide}
              className="p-1.5 rounded-lg hover:text-[var(--ink)] hover:bg-white/10 transition-colors"
              title="Siguiente idea"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Botón de acción principal melocotón (Exacto a la captura) */}
          <button
            onClick={handleAction}
            className="px-6 py-2.5 rounded-2xl bg-[var(--accent)] text-[#1a2d33] font-semibold text-sm hover:brightness-105 active:scale-95 transition-all shadow-[0_4px_16px_rgba(241,188,144,0.3)] flex items-center gap-2 group"
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

      {/* Tarjeta siguiente asomándose a la derecha */}
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
    </div>
  );
};
