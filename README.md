# BBM-Pro

## Architektur
- `src/` ist der bestehende React/Vite-Renderer.
- `electron/main.js` ist der Electron-Main-Prozess.
- `electron/preload.js` stellt die sichere Bridge zum Renderer bereit.

## Installieren
```bash
npm install
```

## Browser-Entwicklung
```bash
npm run dev
```

## Desktop-Entwicklung
```bash
npm run electron:dev
```

## Desktop-Build für Windows
```bash
npm run electron:build
```
