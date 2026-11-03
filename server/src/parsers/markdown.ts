import type { KanbanBoard, KanbanColumn, KanbanCard, TaskItem, CalendarEvent, NoteItem, NoteSection } from '../types.js';

/**
 * Parses an Obsidian Kanban board file into structured columns and cards.
 */
export function parseKanban(content: string, filename: string): KanbanBoard {
  const lines = content.split('\n');
  const columns: KanbanColumn[] = [];
  let currentColumn: KanbanColumn | null = null;
  let inFrontmatter = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (line === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    if (inFrontmatter || line.startsWith('%%')) {
      continue;
    }

    if (line.startsWith('## ')) {
      const colName = line.replace('## ', '').trim();
      currentColumn = {
        id: `col-${columns.length}-${colName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: colName,
        cards: []
      };
      columns.push(currentColumn);
      continue;
    }

    if (currentColumn && line.startsWith('- ')) {
      const isCompleted = line.startsWith('- [x]') || line.startsWith('- [X]');
      const cardText = line.replace(/^- \[( |x|X)\]\s*/, '').replace(/^- \s*/, '').trim();

      if (cardText.length > 0) {
        currentColumn.cards.push({
          id: `card-${currentColumn.cards.length}-${Math.random().toString(36).substring(2, 7)}`,
          text: cardText,
          completed: isCompleted
        });
      }
    }
  }

  const title = filename.replace(/\.md$/, '').replace(/[-_]/g, ' ');
  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    columns
  };
}

/**
 * Parses markdown tasks (standard checklists, with optional dates and tags).
 */
export function parseTasks(content: string): TaskItem[] {
  const lines = content.split('\n');
  const tasks: TaskItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('- [ ]') && !line.startsWith('- [x]') && !line.startsWith('- [X]')) {
      continue;
    }

    const completed = line.startsWith('- [x]') || line.startsWith('- [X]');
    let rawText = line.replace(/^- \[( |x|X)\]\s*/, '').trim();

    // Extract due date: 📅 YYYY-MM-DD or due:YYYY-MM-DD
    const dateMatch = rawText.match(/(?:📅|due:)\s*(\d{4}-\d{2}-\d{2})/);
    const dueDate = dateMatch ? dateMatch[1] : undefined;
    if (dateMatch) {
      rawText = rawText.replace(dateMatch[0], '').trim();
    }

    // Extract tags (#urgente, #casa, etc.)
    const tagMatches = rawText.match(/#([\w-]+)/g);
    const tags = tagMatches ? tagMatches.map(t => t.replace('#', '')) : [];
    if (tagMatches) {
      rawText = rawText.replace(/#([\w-]+)/g, '').trim();
    }

    tasks.push({
      id: `task-${tasks.length}-${Math.random().toString(36).substring(2, 7)}`,
      text: rawText,
      completed,
      dueDate,
      tags
    });
  }

  return tasks;
}

/**
 * Parses calendar / event lines.
 * Supported formats:
 * - 2026-11-04 19:00 - Event Name
 * - 2026-11-04 - Event Name
 */
export function parseCalendar(content: string): CalendarEvent[] {
  const lines = content.split('\n');
  const events: CalendarEvent[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const eventMatch = line.match(/^(?:-\s*)?(\d{4}-\d{2}-\d{2})(?:\s+(\d{1,2}:\d{2}))?\s*[-–:]\s*(.+)$/);

    if (eventMatch) {
      const [, date, time, title] = eventMatch;
      events.push({
        id: `event-${events.length}-${Math.random().toString(36).substring(2, 7)}`,
        date,
        time: time || undefined,
        title: title.trim()
      });
    }
  }

  // Sort events chronologically
  return events.sort((a, b) => {
    const valA = `${a.date} ${a.time || '00:00'}`;
    const valB = `${b.date} ${b.time || '00:00'}`;
    return valA.localeCompare(valB);
  });
}

/**
 * Parses markdown notes into organized sections.
 */
export function parseNotes(content: string, filename: string): NoteItem {
  const lines = content.split('\n');
  const sections: NoteSection[] = [];
  let currentSection: NoteSection | null = null;
  let inFrontmatter = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    if (inFrontmatter) continue;

    if (trimmed.startsWith('## ')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: trimmed.replace('## ', '').trim(),
        content: ''
      };
      continue;
    }

    if (currentSection) {
      currentSection.content += `${line}\n`;
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  const cleanTitle = filename.replace(/\.md$/, '').replace(/[-_]/g, ' ');
  return {
    id: `note-${filename.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
    sections: sections.map(s => ({ title: s.title, content: s.content.trim() })),
    raw: content
  };
}

