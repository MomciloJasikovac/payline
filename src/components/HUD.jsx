import {Actions, Phase} from '../store/gameReducer.js';
import {useGame} from "../store/GameContext.jsx";
import {CONFIG} from '../game/config.js';

const cell = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 };
const labelStyle = { fontSize: 11, letterSpacing: 3, color: '#7f8c8d' };
const valueStyle = { fontSize: 28, fontWeight: 'bold', fontFamily: 'monospace', color: '#ffd700' };
const winStyle   = { ...valueStyle, color: '#2ecc71' };
const btnStyle = {
    background: 'none',
    border: '1px solid #ffd700',
    color: '#ffd700',
    borderRadius: 6,
    width: 28,
    height: 28,
    cursor: 'pointer',
    fontSize: 18,
    lineHeight: 1,
};

export function HUD({ balance, bet, lastWin, totalSpins, phase }) {
    const showWin = phase === Phase.WIN && lastWin > 0;
    const { dispatch } = useGame();
    const canChange = phase === Phase.IDLE;
    const adjustBet = (delta) => dispatch({ type: Actions.ADJUST_BET, payload: delta });

    const decDisabled = !canChange || bet <= CONFIG.BET_MIN;
    const incDisabled = !canChange || bet >= CONFIG.BET_MAX;

  return (
    <div style={{
      display:        'flex',
      justifyContent: 'space-between',
      alignItems:     'start',
      width:          480,
      padding:        '12px 24px',
      background:     '#0d0d1a',
      borderRadius:   12,
      border:         '2px solid #2a2a4a',
      marginBottom:   8,
    }}>
      <div style={cell}>
        <span style={labelStyle}>BALANCE</span>
        <span style={valueStyle}>{balance}</span>
      </div>

      <div style={cell}>
        {showWin ? (
          <>
            <span style={{ ...labelStyle, color: '#2ecc71' }}>WIN</span>
            <span style={winStyle}>+{lastWin}</span>
          </>
        ) : (
          <>
              <span style={labelStyle}>BET</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                      onClick={() => adjustBet(-CONFIG.BET_STEP)}
                      disabled={decDisabled}
                      aria-label="Decrease bet"
                      style={{ ...btnStyle, opacity: decDisabled ? 0.4 : 1 }}
                  >−</button>
                  <span style={valueStyle}>{bet}</span>
                  <button
                      onClick={() => adjustBet(CONFIG.BET_STEP)}
                      disabled={incDisabled}
                      aria-label="Increase bet"
                      style={{ ...btnStyle, opacity: incDisabled ? 0.4 : 1 }}
                  >+</button>
              </div>
          </>
        )}
      </div>

      <div style={cell}>
        <span style={labelStyle}>SPINS</span>
        <span style={{ ...valueStyle, fontSize: 22 }}>
            {totalSpins}
        </span>
      </div>
    </div>
  );
}
