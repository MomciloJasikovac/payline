import { useRef, useEffect, useCallback } from 'react';
import { useGame } from './store/GameContext.jsx';
import { Actions, Phase, generateResult } from './store/gameReducer.js';
import { GameCanvas } from './components/GameCanvas.jsx';
import { SpinButton } from './components/SpinButton.jsx';
import { HUD } from './components/HUD.jsx';

export function App() {
  const { state, dispatch }  = useGame();
  const pixiRef = useRef(null); // holds PixiController instance

  // ── Spin flow ────────────────────────────────────────────────────────────
  const handleSpin = useCallback(async () => {
    if (state.phase !== Phase.IDLE) return;
    if (state.balance < state.bet)  return;

    const result = generateResult();

    dispatch({ type: Actions.SPIN_START });

    // Run Pixi animation — Pixi is the visual layer only
    await pixiRef.current?.spin(result);

    dispatch({ type: Actions.SPIN_COMPLETE, payload: { result } });

    // Brief pause so the player can read WIN/LOSE state, then reset
    const pause = result ? 2000 : 800;
    setTimeout(() => dispatch({ type: Actions.RESET_ROUND }), pause);
  }, [state.phase, state.balance, state.bet, state.totalSpins, dispatch]);

  // ── Keyboard shortcut ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => { if (e.code === 'Space') handleSpin(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSpin]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      gap:            0,
    }}>
      <HUD
        balance={state.balance}
        bet={state.bet}
        lastWin={state.lastWin}
        phase={state.phase}
        totalSpins={state.totalSpins}
      />

      {state.phase === Phase.GAME_OVER && (
          <p style={{ marginTop: 16, textAlign: 'center' , color: '#e74c3c', letterSpacing: 3 }}>
            GAME OVER <br/> out of coins
          </p>
      )}

      <GameCanvas controllerRef={pixiRef} />

      <SpinButton phase={state.phase} onSpin={handleSpin} />
    </div>
  );
}
