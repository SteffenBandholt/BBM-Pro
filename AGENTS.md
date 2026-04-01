# AGENTS.md

## Repo-Zweck
Dieses Repository enthält eine bestehende React/Vite-Anwendung für BBM-Pro. Der bestehende Renderer bleibt erhalten; Electron wird als Desktop-Hülle ergänzt.

## Zielarchitektur
- `src/` bleibt der bestehende Renderer.
- `electron/main.js` enthält ausschließlich den Electron-Main-Prozess.
- `electron/preload.js` enthält ausschließlich die sichere Bridge zum Renderer.
- Renderer, Main und Preload müssen klar getrennt bleiben.

## Relevante Befehle
- `npm run dev` - Vite-Renderer lokal starten
- `npm run build` - Renderer-Build erzeugen
- `npm run preview` - gebauten Renderer lokal prüfen

## Arbeitsregeln
- Alles auf Deutsch: Ausgaben, Pläne, Zusammenfassungen, Erklärungen und Dokumentation.
- Bestehende UI und Navigation in `src/` beibehalten, nicht neu entwerfen.
- Keine unsichere Node-Freigabe im Renderer, insbesondere kein ungeprüftes `nodeIntegration`.
- Electron-Funktionen nur über den Main-Prozess und eine gezielte Preload-Bridge anbinden.
- Keine Vermischung von Browser-Logik mit Main- oder Preload-Code.
- Neue Kommentare nur dort und auf Deutsch, wo sie wirklich helfen.

## Done-Kriterien
- Der bestehende Renderer läuft unverändert weiter.
- Electron ist sauber in Main, Preload und Renderer getrennt.
- Neue Electron-Zugriffe sind nur über freigegebene, geprüfte APIs möglich.
- Keine UI-Neuerfindung oder unnötige Strukturänderung im bestehenden `src/`.
- Relevante Befehle laufen oder sind klar dokumentiert, falls noch nicht implementiert.
