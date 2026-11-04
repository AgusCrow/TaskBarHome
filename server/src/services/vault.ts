import fs from 'node:fs';
import path from 'node:path';
import chokidar, { FSWatcher } from 'chokidar';
import { parseKanban, parseTasks, parseCalendar, parseNotes, splitLines } from '../parsers/markdown.js';
import type { KanbanBoard, TaskItem, CalendarEvent, NoteItem, DailyFocus, ProjectItem, WorkflowItem } from '../types.js';

let watcher: FSWatcher | null = null;
let onVaultChangeCallback: (() => void) | null = null;

let currentKanban: KanbanBoard | null = null;
let currentTasks: TaskItem[] = [];
let currentCalendar: CalendarEvent[] = [];
let currentNotes: NoteItem[] = [];
let currentDailyFocus: DailyFocus | null = null;
let currentProjects: ProjectItem[] = [];
let currentWorkflows: WorkflowItem[] = [];

export function registerVaultListener(callback: () => void) {
  onVaultChangeCallback = callback;
}

export function refreshVault(vaultPath: string) {
  parseVault(vaultPath);
  if (onVaultChangeCallback) onVaultChangeCallback();
}

/** Recursively lists all markdown files relative to baseDir */
function getMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'photos') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getMarkdownFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const rel = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      results.push(rel);
    }
  }
  return results;
}

function parseFrontmatter(content: string): Record<string, any> {
  const lines = splitLines(content);
  if (lines[0]?.trim() !== '---') return {};
  const meta: Record<string, any> = {};
  let inMeta = false;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l === '---') {
      if (!inMeta) { inMeta = true; continue; }
      else break;
    }
    if (inMeta) {
      const colon = l.indexOf(':');
      if (colon > 0) {
        const key = l.slice(0, colon).trim();
        let val = l.slice(colon + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        meta[key] = val;
      }
    }
  }
  return meta;
}

export function parseVault(vaultPath: string) {
  if (!fs.existsSync(vaultPath)) {
    console.warn(`[Vault] Path does not exist: ${vaultPath}`);
    return;
  }

  const relFiles = getMarkdownFiles(vaultPath);
  const tasksMap = new Map<string, TaskItem>();
  const allCalendar: CalendarEvent[] = [];
  const allNotes: NoteItem[] = [];
  const allProjects: ProjectItem[] = [];
  let foundKanban: KanbanBoard | null = null;
  let latestDaily: DailyFocus | null = null;

  const todayStr = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  for (const relFile of relFiles) {
    const norm = relFile.replace(/\\/g, '/');

    // Ignorar plantillas, sistema o ejemplos para no generar datos fantasma
    if (
      norm.includes('80 Templates/') ||
      norm.includes('Templates/') ||
      norm.includes('System/') ||
      norm.includes('examples/')
    ) {
      continue;
    }

    const fullPath = path.join(vaultPath, relFile);
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const baseName = path.basename(relFile);
      const lowerName = baseName.toLowerCase();
      const meta = parseFrontmatter(content);

      // Check for Daily Notes / Today's Focus
      if (norm.includes('Daily Notes') || meta.type === 'daily' || /^\d{4}-\d{2}-\d{2}\.md$/.test(baseName)) {
        const dateMatch = baseName.match(/(\d{4}-\d{2}-\d{2})/);
        const noteDate = meta.date || (dateMatch ? dateMatch[1] : todayStr);

        // Extract "Today's Focus"
        let focusText = '';
        const focusMatch = content.match(/##\s+Today['’]?s\s+Focus\s*\n+([^#\n]+)/i);
        if (focusMatch) {
          focusText = focusMatch[1].trim();
        }

        const candidateDaily: DailyFocus = {
          date: noteDate,
          focus: focusText || 'Mantener el foco en las prioridades del día.',
          energyScore: meta.energy_score ? Number(meta.energy_score) : undefined,
          focusQualityScore: meta.focus_quality_score ? Number(meta.focus_quality_score) : undefined,
          file: relFile
        };

        if (noteDate === todayStr || !latestDaily || noteDate > latestDaily.date) {
          latestDaily = candidateDaily;
        }

        // Also extract tasks from daily note
        const dailyTasks = parseTasks(content, relFile);
        for (const t of dailyTasks) {
          tasksMap.set(t.id, t);
        }
      }

      // Check for Projects (Properties: type is project)
      if (meta.type === 'project' || norm.includes('Projects/')) {
        allProjects.push({
          id: `project-${relFile.replace(/[^a-z0-9]/gi, '-')}`,
          title: baseName.replace(/\.md$/, ''),
          file: relFile,
          status: meta.status || 'active',
          type: meta.type || 'project',
          area: meta.area,
          tags: meta.tags ? [meta.tags] : []
        });
      }

      // Check for Kanban
      if (content.includes('kanban-plugin:') || lowerName.includes('kanban')) {
        foundKanban = parseKanban(content, relFile);
      }

      // Check for Tasks / To-Do
      if (lowerName.includes('task') || lowerName.includes('todo') || lowerName.includes('quehacer')) {
        const parsed = parseTasks(content, relFile);
        for (const t of parsed) {
          tasksMap.set(t.id, t);
        }
      } else if (!norm.includes('Daily Notes')) {
        const inlineTasks = parseTasks(content, relFile);
        if (inlineTasks.length > 0 && !lowerName.includes('kanban') && !content.includes('kanban-plugin:')) {
          for (const t of inlineTasks) {
            tasksMap.set(t.id, t);
          }
        }
      }

      // Check for Calendar
      if (lowerName.includes('calendar') || lowerName.includes('agenda') || lowerName.includes('evento')) {
        const parsedEvents = parseCalendar(content, relFile);
        allCalendar.push(...parsedEvents);
      }

      // Notes (if not purely daily or kanban)
      if (!content.includes('kanban-plugin:') && !norm.includes('Daily Notes') && meta.type !== 'daily') {
        const note = parseNotes(content, relFile);
        allNotes.push({ ...note, file: relFile });
      }
    } catch (err) {
      console.error(`[Vault] Error reading ${relFile}:`, err);
    }
  }

  // Parse Workflows from Machine/Workflows
  const workflows: WorkflowItem[] = [];
  const workflowsDir = path.join(vaultPath, 'Machine', 'Workflows');
  if (fs.existsSync(workflowsDir)) {
    const entries = fs.readdirSync(workflowsDir, { withFileTypes: true });
    for (const wf of entries) {
      if (!wf.isDirectory()) continue;
      const findingsPath = path.join(workflowsDir, wf.name, 'FINDINGS.md');
      let findingsCount = 0;
      if (fs.existsSync(findingsPath)) {
        const findingsContent = fs.readFileSync(findingsPath, 'utf-8');
        findingsCount = (findingsContent.match(/^\d{4}-\d{2}-\d{2}/gm) || []).length;
      }
      workflows.push({
        id: `wf-${wf.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: wf.name,
        path: `Machine/Workflows/${wf.name}`,
        findingsCount
      });
    }
  }

  // Ordenamiento inteligente de tareas
  const priorityWeights: Record<string, number> = {
    highest: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const sortedTasks = Array.from(tasksMap.values()).sort((a, b) => {
    // 1. Incompletas primero
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // 2. Prioridad más alta primero
    const weightA = a.priority ? (priorityWeights[a.priority] || 0) : 0;
    const weightB = b.priority ? (priorityWeights[b.priority] || 0) : 0;
    if (weightA !== weightB) {
      return weightB - weightA;
    }
    // 3. Due date más próxima primero
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    return a.file.localeCompare(b.file);
  });

  currentKanban = foundKanban;
  currentTasks = sortedTasks;
  currentCalendar = allCalendar;
  currentNotes = allNotes;
  currentDailyFocus = latestDaily;
  currentProjects = allProjects;
  currentWorkflows = workflows;
}

export function startVaultWatcher(vaultPath: string) {
  parseVault(vaultPath);

  if (watcher) {
    watcher.close();
  }

  watcher = chokidar.watch(vaultPath, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
    depth: 4
  });

  const handleChange = (filePath: string) => {
    if (!filePath.endsWith('.md')) return;
    console.log(`[Vault] File changed: ${filePath}. Refreshing data...`);
    parseVault(vaultPath);
    if (onVaultChangeCallback) {
      onVaultChangeCallback();
    }
  };

  watcher.on('add', handleChange);
  watcher.on('change', handleChange);
  watcher.on('unlink', handleChange);
}

export function getVaultData() {
  return {
    kanban: currentKanban,
    tasks: currentTasks,
    calendar: currentCalendar,
    notes: currentNotes,
    dailyFocus: currentDailyFocus,
    projects: currentProjects,
    workflows: currentWorkflows
  };
}
