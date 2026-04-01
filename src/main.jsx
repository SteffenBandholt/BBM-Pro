import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App.jsx';
import { isElectronRuntime } from './app/runtime/isElectron.js';
import './styles/global.css';

document.documentElement.dataset.runtime = isElectronRuntime() ? 'electron' : 'web';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
