import { createContext, useContext, useReducer } from 'react';
import { gameReducer, initialState } from './gameReducer.js';

// ─── Context ───────────────────────────────────────────────────────────────
const GameContext = createContext(null);

// ─── Provider ──────────────────────────────────────────────────────────────
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
