import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GameProvider } from './store/GameContext.jsx';
import { App } from './App.jsx';

createRoot(document.getElementById('root')).render(
    <GameProvider>
      <App />
    </GameProvider>
);
