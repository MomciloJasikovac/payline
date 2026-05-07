import { Phase } from '../store/gameReducer.js';

export function SpinButton({ phase, onSpin }) {
  const disabled = phase !== Phase.IDLE;

  return (
    <button
      onClick={onSpin}
      disabled={disabled}
      style={{
        marginTop:    24,
        padding:      '14px 60px',
        fontSize:     22,
        fontFamily:   'monospace',
        fontWeight:   'bold',
        letterSpacing: 6,
        background:    disabled ? '#444' : '#e74c3c',
        color:         '#fff',
        border:        'none',
        borderRadius:  32,
        cursor:        disabled ? 'default' : 'pointer',
        opacity:       disabled ? 0.5 : 1,
        transition:    'background 0.15s, opacity 0.15s',
      }}
    >
      SPIN
    </button>
  );
}
