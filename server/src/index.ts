import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import dotenv from 'dotenv';
import crypto from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { startVaultWatcher, getVaultData, registerVaultListener, refreshVault } from './services/vault.js';
import {
  WriteError,
  serialize,
  addTask,
  toggleCheckbox,
  addEvent,
  addNote,
  addKanbanCard,
  moveKanbanCard,
  deleteItem
} from './services/writer.js';
import { getTimers, startTimer, pauseTimer, resetTimer, setCustomTimer, registerTimerListener } from './services/timers.js';
import { fetchWeather } from './services/weather.js';
import { getPhotos } from './services/photos.js';
import type { DashboardPayload } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root or server dir
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

const VAULT_PATH = path.resolve(
  __dirname,
  '../../',
  process.env.OBSIDIAN_VAULT_PATH || './mock-vault'
);

const PHOTOS_PATH = path.resolve(
  __dirname,
  '../../',
  process.env.PHOTOS_PATH || './mock-vault/photos'
);

const WEATHER_LAT = parseFloat(process.env.WEATHER_LATITUDE || '-34.6037');
const WEATHER_LON = parseFloat(process.env.WEATHER_LONGITUDE || '-58.3816');
const WEATHER_CITY = process.env.WEATHER_CITY_NAME || 'Buenos Aires';

// PIN opcional para escribir en la bóveda (recomendado si exponés el puerto por Tailscale)
const CONTROL_PIN = process.env.CONTROL_PIN || '';

function pinOk(request: FastifyRequest): boolean {
  if (!CONTROL_PIN) return true;
  const sent = String(request.headers['x-tbh-pin'] ?? '');
  const a = Buffer.from(sent);
  const b = Buffer.from(CONTROL_PIN);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const fastify = Fastify({ logger: true });

async function buildDashboardPayload(): Promise<DashboardPayload> {
  const vault = getVaultData();
  const timers = getTimers();
  const weather = await fetchWeather(WEATHER_LAT, WEATHER_LON, WEATHER_CITY);
  const photos = getPhotos(PHOTOS_PATH);

  return {
    kanban: vault.kanban,
    tasks: vault.tasks,
    calendar: vault.calendar,
    notes: vault.notes,
    timers,
    weather,
    photos,
    lastUpdated: new Date().toISOString()
  };
}

async function start() {
  await fastify.register(cors, {
    origin: true
  });

  await fastify.register(fastifyWebsocket);

  // Ensure photos directory exists before static plugin
  if (!fs.existsSync(PHOTOS_PATH)) {
    fs.mkdirSync(PHOTOS_PATH, { recursive: true });
  }

  // Serve photos statically
  await fastify.register(fastifyStatic, {
    root: PHOTOS_PATH,
    prefix: '/api/photos/view/',
    decorateReply: false
  });

  // Start watching Obsidian vault
  startVaultWatcher(VAULT_PATH);

  // Broadcast to all active WebSocket clients
  const activeSockets = new Set<any>();

  async function broadcastUpdate() {
    if (activeSockets.size === 0) return;
    try {
      const payload = await buildDashboardPayload();
      const message = JSON.stringify({ type: 'dashboard:update', payload });
      for (const client of activeSockets) {
        if (client.readyState === 1) { // OPEN
          client.send(message);
        }
      }
    } catch (err) {
      fastify.log.error(err, 'Failed to broadcast update');
    }
  }

  // Register listeners for real-time broadcasts
  registerVaultListener(() => {
    broadcastUpdate();
  });

  registerTimerListener(() => {
    broadcastUpdate();
  });

  // WebSocket Route
  fastify.get('/ws', { websocket: true }, (socket, req) => {
    activeSockets.add(socket);
    fastify.log.info('WebSocket client connected');

    // Send initial state immediately
    buildDashboardPayload().then(payload => {
      socket.send(JSON.stringify({ type: 'dashboard:init', payload }));
    });

    socket.on('close', () => {
      activeSockets.delete(socket);
      fastify.log.info('WebSocket client disconnected');
    });

    socket.on('message', async (rawMsg: any) => {
      try {
        const data = JSON.parse(rawMsg.toString());
        if (data.type === 'timer:action') {
          const { id, action, minutes, label } = data;
          if (action === 'start') startTimer(id);
          else if (action === 'pause') pauseTimer(id);
          else if (action === 'reset') resetTimer(id);
          else if (action === 'custom') setCustomTimer(id, label || 'Temporizador', minutes || 10);
        }
      } catch (e) {
        fastify.log.error(e, 'Invalid WS message');
      }
    });
  });

  // REST API Routes
  fastify.get('/api/dashboard', async () => {
    return buildDashboardPayload();
  });

  fastify.get('/api/photos', async () => {
    return { photos: getPhotos(PHOTOS_PATH) };
  });

  fastify.get('/api/weather', async () => {
    return fetchWeather(WEATHER_LAT, WEATHER_LON, WEATHER_CITY);
  });

  fastify.post('/api/timers/:id/start', async (request, reply) => {
    const { id } = request.params as { id: string };
    const timer = startTimer(id);
    if (!timer) return reply.status(404).send({ error: 'Timer not found' });
    return timer;
  });

  fastify.post('/api/timers/:id/pause', async (request, reply) => {
    const { id } = request.params as { id: string };
    const timer = pauseTimer(id);
    if (!timer) return reply.status(404).send({ error: 'Timer not found' });
    return timer;
  });

  fastify.post('/api/timers/:id/reset', async (request, reply) => {
    const { id } = request.params as { id: string };
    const timer = resetTimer(id);
    if (!timer) return reply.status(404).send({ error: 'Timer not found' });
    return timer;
  });

  fastify.post('/api/timers/custom', async (request) => {
    const { id, label, minutes } = request.body as { id: string; label: string; minutes: number };
    return setCustomTimer(id || `custom-${Date.now()}`, label, minutes);
  });

  // ---------- Escritura sobre la bóveda ----------
  fastify.get('/api/config', async () => ({ pinRequired: Boolean(CONTROL_PIN) }));

  /** Registra una ruta de escritura: valida PIN, serializa, guarda y empuja el estado nuevo a todos. */
  function vaultWrite(route: string, op: (body: any) => void) {
    fastify.post(route, async (request: FastifyRequest, reply: FastifyReply) => {
      if (!pinOk(request)) return reply.status(401).send({ error: 'PIN incorrecto o faltante' });
      try {
        await serialize(() => op((request.body ?? {}) as any));
        refreshVault(VAULT_PATH);
        return { ok: true };
      } catch (err) {
        if (err instanceof WriteError) {
          if (err.status === 409) refreshVault(VAULT_PATH); // el cliente estaba desactualizado
          return reply.status(err.status).send({ error: err.message });
        }
        fastify.log.error(err, `Vault write failed: ${route}`);
        return reply.status(500).send({ error: 'No se pudo escribir en la bóveda' });
      }
    });
  }

  const ref = (b: any) => ({ file: String(b.file ?? ''), line: Number(b.line), raw: String(b.raw ?? '') });

  vaultWrite('/api/vault/tasks', b => addTask(VAULT_PATH, b));
  vaultWrite('/api/vault/tasks/toggle', b => toggleCheckbox(VAULT_PATH, ref(b), true));
  vaultWrite('/api/vault/events', b => addEvent(VAULT_PATH, b));
  vaultWrite('/api/vault/notes', b => addNote(VAULT_PATH, b));
  vaultWrite('/api/vault/kanban/cards', b => addKanbanCard(VAULT_PATH, getVaultData().kanban?.file, b));
  vaultWrite('/api/vault/kanban/toggle', b => toggleCheckbox(VAULT_PATH, ref(b), false));
  vaultWrite('/api/vault/kanban/move', b => moveKanbanCard(VAULT_PATH, ref(b), b.toColumn));
  vaultWrite('/api/vault/delete', b => deleteItem(VAULT_PATH, ref(b)));

  // Serve compiled client if present (production / single-port mode)
  const CLIENT_DIST_PATH = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(CLIENT_DIST_PATH)) {
    await fastify.register(fastifyStatic, {
      root: CLIENT_DIST_PATH,
      prefix: '/',
      decorateReply: false
    });

    fastify.setNotFoundHandler((req, reply) => {
      if (req.raw.url && req.raw.url.startsWith('/api')) {
        return reply.status(404).send({ error: 'Endpoint not found' });
      }
      // sendFile no está decorado (decorateReply: false), se envía el index a mano
      return reply.type('text/html; charset=utf-8').send(
        fs.readFileSync(path.join(CLIENT_DIST_PATH, 'index.html'))
      );
    });
    fastify.log.info(`Serving client build from: ${CLIENT_DIST_PATH}`);
  }

  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`\n========================================`);
    console.log(`  TBH Server running on http://${HOST}:${PORT}`);
    console.log(`  Obsidian Vault: ${VAULT_PATH}`);
    console.log(`  Photos Directory: ${PHOTOS_PATH}`);
    console.log(`========================================\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();