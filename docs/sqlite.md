## SQLite / better-sqlite3 in BBM-Pro

- **Pfad DB-Datei:** `%USERPROFILE%/.bbmpro/bbm-pro.db` (siehe `src/node-sqlite/client.js`).
- **Initialisierung:** Electron-Main startet `runMigrations()` (siehe `electron/main.js` → `electron/sqliteBootstrap.js` → `src/node-sqlite/migrations.js`). Bei Fehler: Log + App beendet.
- **IPC-Bridge:** `electron/preload.js` (`desktopApi.invoke`) + Handler in `electron/ipcHandlers.js`. Renderer nutzt ausschließlich IPC; `nodeIntegration` ist aus, `contextIsolation` an.
- **Repos über IPC:** projects, meetings, tops, meeting_tops, project_firms, project_persons, meeting_participants, printData.
- **Persistenzmodus:** Renderer → `ipc`; Main → native SQLite. Fallback auf localStorage nur außerhalb von Electron/Web, nicht im Electron-Renderer (fehlende Bridge wirft Fehler).
- **Rebuild better-sqlite3 für Electron:**  
  1) `npm install`  
  2) `npm run electron:rebuild` (setzt Headers passend zur `electron`-Version aus package.json)  
  3) Danach normal `npm run electron:dev` oder `npm run electron:start`
- **Fehlersichtbarkeit:** Scheitern von Migration/IPC im Main beendet die App mit Log. IPC-Bridge fehlt → Fehler schon beim Repository-Selector im Renderer.
- **Web/Preview:** Ohne Electron greift `getRepos()` auf localStorage-Implementierung zurück (bewusster Dev-Fallback).

Optional (nicht umgesetzt): Migration localStorage → SQLite, Backup/Restore.
