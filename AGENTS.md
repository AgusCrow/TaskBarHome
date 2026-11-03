# Proyecto: TBH (TV Dashboard & Obsidian Backend)

- **Entorno:** Proyectos personales (`d:\Proyectos\AGENTS.md`)
- **Objetivo:** Dashboard ambient para TV que visualiza y sincroniza en tiempo real notas, tareas to-do, kanban boards, calendario, fotos, timers y clima, utilizando una bóveda de Obsidian como backend headless.

---

## Reglas Específicas del Proyecto

1. **Stack Tecnológico:**
   - **Frontend (Client):** Vite + React + TypeScript + Tailwind CSS + Lucide Icons. Optimizado para visualización en pantallas grandes (Modo TV / Kiosk) y controles interactivos en PC/Móvil.
   - **Backend (Server):** Node.js + TypeScript + Fastify + WebSockets + Chokidar (file watcher para la bóveda de Obsidian).
   - **Sin dependencias innecesarias:** Mantener el parser y los servicios livianos y directos.
2. **Convenciones de Código:**
   - Identificadores, tipos y funciones en inglés.
   - Comentarios y documentación en español.
   - Commits con prefijo convencional (`feat:`, `fix:`, etc.) en inglés y mensaje en español.
3. **Graphify:**
   - Mantener actualizado el grafo de arquitectura (`graph.json` y `GRAPH_REPORT.md`) ante cambios estructurales.
