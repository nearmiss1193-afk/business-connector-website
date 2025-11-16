import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render( // Fixed: as HTMLElement stops type error
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
