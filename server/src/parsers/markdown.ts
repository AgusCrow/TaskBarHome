import type { KanbanBoard, KanbanColumn, TaskItem, CalendarEvent, NoteItem, NoteSection } from '../types.js';

/** Divide un archivo en líneas aceptando tanto \n como \r\n. */
export function splitLines(content: string): string[] {
  return content.split(/\r?\n/);
}

/**
 * Parses an Obsidian Kanban board file into structured columns and cards.
 * Cada tarjeta guarda `file`, `line` y `raw` para poder escribir de vuelta.
 */
export function parseKanban(content: string, filename: string): KanbanBoard {
  const lines = splitLines(content);
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
          id: `${filename}:${i}`,
          text: cardText,
          completed: isCompleted,
          file: filename,
          line: i,
          raw: rawLine
        });
      }
    }
  }

  const title = filename.replace(/\.md$/, '').replace(/[-_]/g, ' ');
  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    file: filename,
    columns
  };
}

/** Deducir el nombre del proyecto o contexto según el archivo */
function inferProjectContext(filename: string): string {
  const norm = filename.replace(/\\/g, '/');
  if (norm.includes('30 Projects/') || norm.includes('Projects/')) {
    const base = norm.split('/').pop() || norm;
    return base.replace(/\.md$/, '');
  }
  if (norm.includes('10 Daily Notes/') || norm.includes('Daily Notes/')) {
    const match = norm.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? `Diaria (${match[1]})` : 'Nota Diaria';
  }
  if (norm.endsWith('tasks.md')) {
    return 'Bandeja Principal';
  }
  const base = norm.split('/').pop() || norm;
  return base.replace(/\.md$/, '');
}

/**
 * Parses markdown tasks (standard checklists, with full Obsidian Tasks metadata).
 */
export function parseTasks(content: string, filename: string): TaskItem[] {
  const lines = splitLines(content);
  const tasks: TaskItem[] = [];
  const project = inferProjectContext(filename);

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line.startsWith('- [ ]') && !line.startsWith('- [x]') && !line.startsWith('- [X]')) {
      continue;
    }

    const completed = line.startsWith('- [x]') || line.startsWith('- [X]');
    let rawText = line.replace(/^- \[( |x|X)\]\s*/, '').trim();

    // Fecha de cierre (Done): ✅ YYYY-MM-DD
    const doneMatch = rawText.match(/✅\s*(\d{4}-\d{2}-\d{2})/);
    const completedDate = doneMatch ? doneMatch[1] : undefined;
    if (doneMatch) {
      rawText = rawText.replace(doneMatch[0], '').trim();
    }

    // Due date: 📅 YYYY-MM-DD o due:YYYY-MM-DD
    const dateMatch = rawText.match(/(?:📅|due:)\s*(\d{4}-\d{2}-\d{2})/);
    const dueDate = dateMatch ? dateMatch[1] : undefined;
    if (dateMatch) {
      rawText = rawText.replace(dateMatch[0], '').trim();
    }

    // Scheduled date: ⏳ YYYY-MM-DD
    const schedMatch = rawText.match(/⏳\s*(\d{4}-\d{2}-\d{2})/);
    const scheduledDate = schedMatch ? schedMatch[1] : undefined;
    if (schedMatch) {
      rawText = rawText.replace(schedMatch[0], '').trim();
    }

    // Start date: 🛫 YYYY-MM-DD
    const startMatch = rawText.match(/🛫\s*(\d{4}-\d{2}-\d{2})/);
    const startDate = startMatch ? startMatch[1] : undefined;
    if (startMatch) {
      rawText = rawText.replace(startMatch[0], '').trim();
    }

    // Recurrencia: 🔁 ...
    const recurMatch = rawText.match(/🔁\s*([^📅⏳🛫✅🔺⏫🔼🔽⏬#]+)/);
    const recurrence = recurMatch ? recurMatch[1].trim() : undefined;
    if (recurMatch) {
      rawText = rawText.replace(recurMatch[0], '').trim();
    }

    // Prioridad de Obsidian Tasks (🔺 ⏫ 🔼 🔽 ⏬)
    let priority: TaskItem['priority'];
    if (/[🔺⏫]/.test(rawText)) {
      priority = 'highest';
      rawText = rawText.replace(/[🔺⏫]/g, '').trim();
    } else if (/🔼/.test(rawText)) {
      priority = 'high';
      rawText = rawText.replace(/🔼/g, '').trim();
    } else if (/🔽/.test(rawText)) {
      priority = 'medium';
      rawText = rawText.replace(/🔽/g, '').trim();
    } else if (/⏬/.test(rawText)) {
      priority = 'low';
      rawText = rawText.replace(/⏬/g, '').trim();
    }

    // Extract tags (#urgente, #casa, etc.)
    const tagMatches = rawText.match(/#([\w-]+)/g);
    const tags = tagMatches ? tagMatches.map(t => t.replace('#', '')) : [];
    if (tagMatches) {
      rawText = rawText.replace(/#([\w-]+)/g, '').replace(/\s{2,}/g, ' ').trim();
    }

    // Si tiene tags de alta prioridad y no tiene prioridad explícita
    if (!priority && (tags.includes('urgente') || tags.includes('alta') || tags.includes('foco'))) {
      priority = 'high';
    }

    // Ignorar checklists vacías o placeholders
    if (!rawText || rawText.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '').length === 0) {
      continue;
    }

    tasks.push({
      id: `${filename}:${i}`,
      text: rawText,
      completed,
      priority,
      dueDate,
      scheduledDate,
      startDate,
      completedDate,
      recurrence,
      tags,
      project,
      file: filename,
      line: i,
      raw: rawLine
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
export function parseCalendar(content: string, filename: string): CalendarEvent[] {
  const lines = splitLines(content);
  const events: CalendarEvent[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    const eventMatch = line.match(/^(?:-\s*)?(\d{4}-\d{2}-\d{2})(?:\s+(\d{1,2}:\d{2}))?\s*[-–:]\s*(.+)$/);

    if (eventMatch) {
      const [, date, time, title] = eventMatch;
      events.push({
        id: `${filename}:${i}`,
        date,
        time: time || undefined,
        title: title.trim(),
        file: filename,
        line: i,
        raw: rawLine
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
  const lines = splitLines(content);
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
    file: filename,
    sections: sections.map(s => ({ title: s.title, content: s.content.trim() })),
    raw: content
  };
}
