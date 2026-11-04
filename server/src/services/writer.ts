import fs from 'node:fs';
import path from 'node:path';
import { splitLines } from '../parsers/markdown.js';
import type { LineRef } from '../types.js';

/**
 * Capa de escritura sobre la bóveda de Obsidian.
 *
 * Reglas:
 *  - Solo se tocan archivos .md del nivel raíz de la bóveda.
 *  - Toda edición sobre una línea existente verifica que la línea siga siendo
 *    exactamente la que vio el cliente (si no, 409) para no pisar cambios hechos
 *    en Obsidian entre tanto.
 *  - Las escrituras se serializan y son atómicas (archivo temporal + rename).
 *  - Se conserva el fin de línea original (\n o \r\n).
 */

export class WriteError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// ---------- utilidades ----------

let queue: Promise<unknown> = Promise.resolve();

/** Ejecuta las operaciones de a una, en orden. */
export function serialize<T>(fn: () => T): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

export function todayStr(d = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}

interface Doc {
  file: string;
  full: string;
  lines: string[];
  eol: string;
}

function resolveFile(vault: string, file: string): string {
  if (!file || !file.toLowerCase().endsWith('.md')) {
    throw new WriteError(400, 'Archivo inválido');
  }
  const clean = file.replace(/\\/g, '/');
  if (clean.includes('..')) {
    throw new WriteError(400, 'Ruta no permitida');
  }

  const direct = path.join(vault, clean);
  if (fs.existsSync(direct)) return direct;

  const inHuman = path.join(vault, '00 Human', clean);
  if (fs.existsSync(inHuman)) return inHuman;

  const inProj = path.join(vault, '00 Human', '30 Projects', clean);
  if (fs.existsSync(inProj)) return inProj;

  return direct;
}

function readDoc(vault: string, file: string): Doc {
  const full = resolveFile(vault, file);
  if (!fs.existsSync(full)) throw new WriteError(404, `No existe ${file}`);
  const content = fs.readFileSync(full, 'utf-8');
  return {
    file,
    full,
    lines: splitLines(content),
    eol: content.includes('\r\n') ? '\r\n' : '\n'
  };
}

function writeDoc(doc: Doc): void {
  const data = doc.lines.join(doc.eol);
  const tmp = `${doc.full}.tbh-${process.pid}.tmp`;
  try {
    fs.writeFileSync(tmp, data, 'utf-8');
    fs.renameSync(tmp, doc.full);
  } catch {
    // Algunos montajes no permiten rename: escribir directo como último recurso.
    try {
      fs.rmSync(tmp, { force: true });
    } catch {
      /* ignore */
    }
    fs.writeFileSync(doc.full, data, 'utf-8');
  }
}

function checkRef(doc: Doc, ref: LineRef): void {
  if (
    !Number.isInteger(ref.line) ||
    ref.line < 0 ||
    ref.line >= doc.lines.length ||
    doc.lines[ref.line] !== ref.raw
  ) {
    throw new WriteError(409, 'El archivo cambió en otro dispositivo. Actualizado, probá de nuevo.');
  }
}

function listMd(vault: string): string[] {
  if (!fs.existsSync(vault)) throw new WriteError(500, 'La bóveda no existe en el servidor');
  const files: string[] = [];
  const scan = (dir: string, rel: string = '') => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.') || e.name === 'node_modules') continue;
      const subRel = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) scan(path.join(dir, e.name), subRel);
      else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) files.push(subRel);
    }
  };
  scan(vault);
  return files;
}

/** Busca un archivo por nombre; si no existe devuelve el nombre por defecto (se crea al escribir). */
function pickFile(vault: string, test: RegExp, fallback: string): string {
  return listMd(vault).find(n => test.test(n)) ?? fallback;
}

function openOrCreate(vault: string, file: string, header: string): Doc {
  const full = resolveFile(vault, file);
  if (!fs.existsSync(full)) {
    return { file, full, lines: [header, ''], eol: '\n' };
  }
  return readDoc(vault, file);
}

function appendLine(doc: Doc, ...newLines: string[]): void {
  while (doc.lines.length > 0 && doc.lines[doc.lines.length - 1].trim() === '') doc.lines.pop();
  doc.lines.push(...newLines, '');
}

function cleanText(input: unknown, max = 300): string {
  const text = String(input ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (!text) throw new WriteError(400, 'El texto no puede estar vacío');
  return text.slice(0, max);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{1,2}:\d{2}$/;
const TASK_RE = /^(\s*[-*]\s*)\[( |x|X)\](.*)$/;
const STAMP_RE = /\s*✅\s*\d{4}-\d{2}-\d{2}/g;
const DONE_COLUMN_RE = /complet|done|hecho|termin|finaliz/i;

// ---------- tareas ----------

export function addTask(vault: string, input: { text: unknown; due?: unknown; tags?: unknown }): void {
  const text = cleanText(input.text);
  const parts = [`- [ ] ${text}`];
  if (input.due) {
    const due = String(input.due);
    if (!DATE_RE.test(due)) throw new WriteError(400, 'Fecha inválida (usar AAAA-MM-DD)');
    parts.push(`📅 ${due}`);
  }
  const tags = Array.isArray(input.tags) ? input.tags : [];
  for (const t of tags) {
    const tag = String(t).replace(/^#/, '').replace(/[^\w-]/g, '');
    if (tag) parts.push(`#${tag}`);
  }

  const file = pickFile(vault, /task|todo|quehacer/i, 'tasks.md');
  const doc = openOrCreate(vault, file, '# Quehaceres & Tareas');
  appendLine(doc, parts.join(' '));
  writeDoc(doc);
}

/** Tilda / destilda una tarea (o tarjeta kanban). En tareas agrega la fecha ✅ como Obsidian Tasks. */
export function toggleCheckbox(vault: string, ref: LineRef, stamp: boolean): void {
  const doc = readDoc(vault, ref.file);
  checkRef(doc, ref);
  const m = TASK_RE.exec(doc.lines[ref.line]);
  if (!m) throw new WriteError(400, 'Esa línea no es una tarea');

  const wasDone = m[2] !== ' ';
  const rest = m[3].replace(STAMP_RE, '');
  doc.lines[ref.line] = wasDone
    ? `${m[1]}[ ]${rest}`
    : `${m[1]}[x]${rest}${stamp ? ` ✅ ${todayStr()}` : ''}`;
  writeDoc(doc);
}

// ---------- eventos ----------

export function addEvent(vault: string, input: { date: unknown; time?: unknown; title: unknown }): void {
  const title = cleanText(input.title, 200);
  const date = String(input.date ?? '');
  if (!DATE_RE.test(date)) throw new WriteError(400, 'Fecha inválida (usar AAAA-MM-DD)');
  let time = '';
  if (input.time) {
    time = String(input.time);
    if (!TIME_RE.test(time)) throw new WriteError(400, 'Hora inválida (usar HH:MM)');
    time = time.padStart(5, '0');
  }

  const file = pickFile(vault, /calendar|agenda|evento/i, 'calendar.md');
  const doc = openOrCreate(vault, file, '# Agenda y Compromisos');
  appendLine(doc, `- ${date}${time ? ' ' + time : ''} - ${title}`);
  writeDoc(doc);
}

// ---------- notas ----------

export function addNote(vault: string, input: { title: unknown; content?: unknown }): void {
  const title = cleanText(input.title, 120);
  const content = String(input.content ?? '').replace(/\r\n/g, '\n').trim().slice(0, 2000);

  const file = pickFile(vault, /^(notes?|notas?)\.md$/i, 'notes.md');
  const doc = openOrCreate(vault, file, '# Notas Rápidas & Tablón');
  appendLine(doc, '', `## ${title}`, ...(content ? content.split('\n') : []));
  writeDoc(doc);
}

// ---------- kanban ----------

interface Section {
  name: string;
  heading: number;
  end: number; // exclusivo
}

function kanbanSections(lines: string[]): Section[] {
  const sections: Section[] = [];
  let inFrontmatter = false;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    if (inFrontmatter || t.startsWith('%%')) continue;
    if (t.startsWith('## ')) sections.push({ name: t.slice(3).trim(), heading: i, end: lines.length });
  }
  sections.forEach((s, k) => {
    let end = k + 1 < sections.length ? sections[k + 1].heading : lines.length;
    for (let j = s.heading + 1; j < end; j++) {
      if (lines[j].trim().startsWith('%%')) {
        end = j;
        break;
      }
    }
    s.end = end;
  });
  return sections;
}

/** Inserta una línea al final de la columna, respetando los espacios en blanco del formato del plugin. */
function insertIntoSection(lines: string[], section: Section, line: string): void {
  let at = section.end;
  while (at > section.heading + 1 && lines[at - 1].trim() === '') at--;
  if (at === section.heading + 1) {
    lines.splice(at, 0, '', line);
  } else {
    lines.splice(at, 0, line);
  }
}

function findSection(sections: Section[], name?: string): Section {
  if (sections.length === 0) throw new WriteError(400, 'El tablero Kanban no tiene columnas');
  if (!name) return sections[0];
  const wanted = name.trim().toLowerCase();
  const found = sections.find(s => s.name.toLowerCase() === wanted);
  if (!found) throw new WriteError(404, `No existe la columna "${name}"`);
  return found;
}

export function addKanbanCard(vault: string, kanbanFile: string | undefined, input: { text: unknown; column?: unknown }): void {
  if (!kanbanFile) throw new WriteError(404, 'No hay tablero Kanban en la bóveda');
  const text = cleanText(input.text);
  const doc = readDoc(vault, kanbanFile);
  const section = findSection(kanbanSections(doc.lines), input.column ? String(input.column) : undefined);
  insertIntoSection(doc.lines, section, `- [ ] ${text}`);
  writeDoc(doc);
}

export function moveKanbanCard(vault: string, ref: LineRef, toColumn: unknown): void {
  const doc = readDoc(vault, ref.file);
  checkRef(doc, ref);
  const line = doc.lines[ref.line];
  if (!/^\s*-\s/.test(line)) throw new WriteError(400, 'Esa línea no es una tarjeta');

  const before = kanbanSections(doc.lines);
  const from = before.find(s => ref.line > s.heading && ref.line < s.end);
  const target = findSection(before, String(toColumn ?? ''));
  if (!from) throw new WriteError(400, 'La tarjeta no está dentro de una columna');
  if (from.heading === target.heading) return;

  // Al pasar a una columna "Completado" se tilda; al salir de ella se destilda.
  let moved = line;
  const m = TASK_RE.exec(line);
  if (m) {
    const toDone = DONE_COLUMN_RE.test(target.name);
    const fromDone = DONE_COLUMN_RE.test(from.name);
    if (toDone && m[2] === ' ') moved = `${m[1]}[x]${m[3]}`;
    else if (!toDone && fromDone && m[2] !== ' ') moved = `${m[1]}[ ]${m[3]}`;
  }

  doc.lines.splice(ref.line, 1);
  const after = kanbanSections(doc.lines);
  const dest = after.find(s => s.name === target.name);
  if (!dest) throw new WriteError(500, 'No se pudo ubicar la columna de destino');
  insertIntoSection(doc.lines, dest, moved);
  writeDoc(doc);
}

// ---------- borrado ----------

/** Borra una línea de tarea, tarjeta o evento (nunca encabezados ni otro texto). */
export function deleteItem(vault: string, ref: LineRef): void {
  const doc = readDoc(vault, ref.file);
  checkRef(doc, ref);
  const line = doc.lines[ref.line];
  const isItem = /^\s*[-*]\s/.test(line) || /^\s*\d{4}-\d{2}-\d{2}/.test(line);
  if (!isItem) throw new WriteError(400, 'Solo se pueden borrar tareas, tarjetas o eventos');
  doc.lines.splice(ref.line, 1);
  writeDoc(doc);
}
