import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './app/App.jsx';
import { isElectronRuntime } from './app/runtime/isElectron.js';
import './styles/global.css';
import { initPersistence } from './services/persistence.js';

document.documentElement.dataset.runtime = isElectronRuntime() ? 'electron' : 'web';
const Router = isElectronRuntime() ? HashRouter : BrowserRouter;

// Initialize persistence (sqlite migrations if enabled/available; otherwise no-op)
void initPersistence();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
);
