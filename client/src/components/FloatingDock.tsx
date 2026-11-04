import React from 'react';
import {
  LayoutDashboard,
  Kanban,
  CheckSquare,
  Calendar,
  Timer,
  FileText,
  Cpu,
  Plus
} from 'lucide-react';

export type NavView = 'stage' | 'kanban' | 'tasks' | 'calendar' | 'timers' | 'notes' | 'workflows';

interface FloatingDockProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenQuickAdd: () => void;
  isTvMode?: boolean;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  currentView,
  onSelectView,
  onOpenQuickAdd,
  isTvMode = false
}) => {
  const items: Array<{ id: NavView; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'stage', label: 'Home / Stage', icon: LayoutDashboard },
    { id: 'kanban', label: 'Proyectos', icon: Kanban },
    { id: 'tasks', label: 'Tareas', icon: CheckSquare },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'timers', label: 'Timers', icon: Timer },
    { id: 'notes', label: 'Notas', icon: FileText },
    { id: 'workflows', label: 'Workflows IA', icon: Cpu }
  ];

  return (
    <nav
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${
        isTvMode ? 'opacity-90 hover:opacity-100 scale-105' : 'opacity-95 hover:opacity-100'
      }`}
      aria-label="Navegación principal"
    >
      <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-[#14272c]/85 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`relative px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 group ${
                isActive
                  ? 'bg-[var(--accent)] text-[#1a2d33] font-semibold shadow-md'
                  : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/[0.06]'
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4" />
              {isActive && (
                <span className="text-xs tracking-tight hidden sm:inline-block">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}

        <div className="w-[1px] h-5 bg-white/10 mx-1" />

        <button
          onClick={onOpenQuickAdd}
          className="px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-[var(--ink)] transition-all flex items-center gap-1.5 text-xs font-medium"
          title="Captura rápida (Obsidian)"
        >
          <Plus className="w-4 h-4 text-[var(--accent)]" />
          <span className="hidden sm:inline-block">Captura</span>
        </button>
      </div>
    </nav>
  );
};
