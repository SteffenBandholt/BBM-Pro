import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './app/App.jsx';
import { isElectronRuntime } from './app/runtime/isElectron.js';
import './styles/global.css';

document.documentElement.dataset.runtime = isElectronRuntime() ? 'electron' : 'web';
const Router = isElectronRuntime() ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
);
