# TBH — TV Dashboard & Obsidian Headless Backend

Dashboard ambient e interactivo para televisión, sincronizado en tiempo real con PC y celular, usando una bóveda local de Obsidian como backend de contenidos.

---

## Arquitectura

* **Backend Headless (Node.js + TypeScript + Fastify + WebSockets):**
  * Monitorea la bóveda de Obsidian en tiempo real con `chokidar`.
  * Parsea archivos Markdown: Kanban (`obsidian-kanban`), tareas To-Do con fechas/tags, eventos de calendario y notas rápidas.
  * Emite cambios vía WebSockets hacia la interfaz de la TV y dispositivos conectados.
  * Sirve el almacenamiento local de fotos para el carrusel de fondo.
* **Frontend Kiosk & Control (Vite + React + TypeScript + Tailwind CSS):**
  * **Modo TV (Display Ambient):** Tipografía grande, alto contraste, widgets modulares (Kanban, Calendario, To-Do, Clima, Timers) y carrusel fotográfico de fondo.
  * **Modo Control (PC / Móvil):** Acceso rápido para disparar timers y ajustar vistas.
* **Integraciones Nativas:**
  * **Clima:** Open-Meteo API (sin necesidad de API keys).
  * **Timers:** Pomodoro, cuentas regresivas y cronómetros sincronizados en tiempo real.

```text
TBH/
├── AGENTS.md             # Reglas y directrices del proyecto
├── README.md             # Documentación y roadmap
├── GRAPH_REPORT.md       # Grafo de arquitectura (Mermaid)
├── graph.json            # Nodos y relaciones del proyecto
├── .env.example          # Variables de entorno de referencia
├── mock-vault/           # Bóveda de Obsidian de ejemplo para testing
│   ├── kanban.md
│   ├── tasks.md
│   ├── calendar.md
│   └── notes.md
├── server/               # Servicio Node.js (watcher, parser, WS, API)
└── client/               # Interfaz web Vite + React + Tailwind
```

---

## Roadmap & Checklist

- [x] Scaffolding del proyecto e inicialización de Git
- [x] Configuración de reglas (`AGENTS.md`) y arquitectura inicial
- [x] Implementar mock vault de Obsidian con Kanban, To-Do, Calendario y Notas
- [x] Desarrollar parser backend para Markdown, Kanban de Obsidian y tareas
- [x] Implementar servidor Fastify con File Watcher y WebSocket broadcast
- [x] Desarrollar frontend en Vite + React con Tailwind CSS
- [x] Crear widgets de TV: Kanban, Calendario semanal, To-Do, Timers, Clima y Fondo de fotos
- [x] Desarrollar modo Kiosk / Fullscreen para navegador de Smart TV
- [x] Verificar funcionamiento end-to-end con recarga en vivo al editar en Obsidian
- [ ] Conectar con tu bóveda real de Obsidian (actualizando `.env`)

---

## Puesta en marcha

1. Configurar `.env` con la ruta a tu bóveda de Obsidian (`OBSIDIAN_VAULT_PATH`).
2. Instalar dependencias e iniciar servidor y cliente en modo desarrollo.
