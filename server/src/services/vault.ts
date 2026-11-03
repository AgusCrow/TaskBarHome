import fs from 'node:fs';
import path from 'node:path';
import chokidar, { FSWatcher } from 'chokidar';
import { parseKanban, parseTasks, parseCalendar, parseNotes } from '../parsers/markdown.js';
import type { KanbanBoard, TaskItem, CalendarEvent, NoteItem } from '../types.js';

let watcher: FSWatcher | null = null;
let onVaultChangeCallback: (() => void) | null = null;

let currentKanban: KanbanBoard | null = null;
let currentTasks: TaskItem[] = [];
let currentCalendar: CalendarEvent[] = [];
let currentNotes: NoteItem[] = [];

export function registerVaultListener(callback: () => void) {
  onVaultChangeCallback = callback;
}

export function parseVault(vaultPath: string) {
  if (!fs.existsSync(vaultPath)) {
    console.warn(`[Vault] Path does not exist: ${vaultPath}`);
    return;
  }

  const files = fs.readdirSync(vaultPath, { withFileTypes: true });
  const allTasks: TaskItem[] = [];
  const allCalendar: CalendarEvent[] = [];
  const allNotes: NoteItem[] = [];
  let foundKanban: KanbanBoard | null = null;

  for (const entry of files) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

    const fullPath = path.join(vaultPath, entry.name);
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lowerName = entry.name.toLowerCase();

      // Check for Kanban
      if (content.includes('kanban-plugin:') || lowerName.includes('kanban')) {
        foundKanban = parseKanban(content, entry.name);
      }

      // Check for Tasks / To-Do
      if (lowerName.includes('task') || lowerName.includes('todo') || lowerName.includes('quehacer')) {
        const parsed = parseTasks(content);
        allTasks.push(...parsed);
      } else {
        // Also extract standalone checkboxes from other files if present
        const inlineTasks = parseTasks(content);
        if (inlineTasks.length > 0 && !lowerName.includes('kanban')) {
          allTasks.push(...inlineTasks);
        }
      }

      // Check for Calendar / Events
      if (lowerName.includes('calendar') || lowerName.includes('agenda') || lowerName.includes('evento')) {
        const parsedEvents = parseCalendar(content);
        allCalendar.push(...parsedEvents);
      }

      // Parse as Note if not strictly a kanban board
      if (!content.includes('kanban-plugin:')) {
        const note = parseNotes(content, entry.name);
        allNotes.push(note);
      }
    } catch (err) {
      console.error(`[Vault] Error reading ${entry.name}:`, err);
    }
  }

  currentKanban = foundKanban;
  currentTasks = allTasks;
  currentCalendar = allCalendar;
  currentNotes = allNotes;
}

export function startVaultWatcher(vaultPath: string) {
  parseVault(vaultPath);

  if (watcher) {
    watcher.close();
  }

  watcher = chokidar.watch(vaultPath, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
    depth: 2
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
    notes: currentNotes
  };
}

