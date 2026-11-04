import React from 'react';
import { Cpu, Terminal, FileText, BookOpen, Layers } from 'lucide-react';
import type { WorkflowItem, ProjectItem } from '../types';

interface WorkflowsViewProps {
  workflows: WorkflowItem[];
  projects: ProjectItem[];
  isTvMode?: boolean;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({
  workflows,
  projects,
  isTvMode = false
}) => {
  return (
    <div className={`space-y-6 ${isTvMode ? 'text-base' : 'text-sm'}`}>
      {/* Intro Banner */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
            <Cpu className="w-4 h-4" />
            Hemisferio Máquina · Agentes & Workflows
          </div>
          <h2 className="text-2xl font-normal text-[var(--ink)]">
            Automatizaciones & Recibos de IA
          </h2>
          <p className="text-xs md:text-sm text-[var(--muted)] mt-1 max-w-2xl">
            Tus notas viven bajo <code className="text-[var(--accent)]">00 Human</code>. Los agentes de IA operan exclusivamente bajo <code className="text-[var(--accent)]">Machine/Workflows</code>, dejando borradores y recibos sin tocar tus notas originales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-black/30 border border-[var(--line)] text-center">
            <span className="block text-2xl font-bold text-[var(--ink)]">{workflows.length}</span>
            <span className="text-[11px] text-[var(--muted)] uppercase font-semibold">Workflows</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-black/30 border border-[var(--line)] text-center">
            <span className="block text-2xl font-bold text-[var(--accent)]">
              {projects.filter(p => p.status === 'active').length}
            </span>
            <span className="text-[11px] text-[var(--muted)] uppercase font-semibold">Proyectos Activos</span>
          </div>
        </div>
      </div>

      {/* Grid of Workflows & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflows Column */}
        <div className="emai-card p-5">
          <h3 className="text-base font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[var(--accent)]" />
            Flujos Disponibles (`Machine/Workflows`)
          </h3>

          <div className="space-y-3">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className="p-4 rounded-xl bg-black/25 border border-[var(--line)] hover:border-[var(--accent)]/50 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-base text-[var(--ink)]">{wf.name}</h4>
                    <span className="text-xs text-[var(--muted)] font-mono">{wf.path}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                    Listo
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--line)]/50 text-xs text-[var(--muted)]">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                    {wf.findingsCount} Lecciones en FINDINGS.md
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    AGENTS.md & WORKFLOW.md configurados
                  </span>
                </div>
              </div>
            ))}

            {workflows.length === 0 && (
              <p className="text-sm text-[var(--muted)] italic py-4">
                No se encontraron carpetas de workflows en `Machine/Workflows`.
              </p>
            )}
          </div>
        </div>

        {/* Projects Index Column */}
        <div className="emai-card p-5">
          <h3 className="text-base font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent)]" />
            Proyectos Indexados (`00 Human/30 Projects`)
          </h3>

          <div className="space-y-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-black/25 border border-[var(--line)] flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-semibold text-sm text-[var(--ink)]">{p.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[var(--muted)]">
                    <span className="font-mono text-[11px]">{p.file}</span>
                    {p.area && <span>· {p.area}</span>}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    p.status === 'active'
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400'
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}

            {projects.length === 0 && (
              <p className="text-sm text-[var(--muted)] italic py-4">
                No se encontraron proyectos con frontmatter `type: project` en la bóveda.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
