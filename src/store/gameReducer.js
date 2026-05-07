import { SYMBOL_IDS, SYMBOL_VALUES, CONFIG, PAYLINES } from '../game/config.js';

// ─── Phases ────────────────────────────────────────────────────────────────
export const Phase = Object.freeze({
  IDLE:       'idle',
  SPINNING:   'spinning',
  EVALUATING: 'evaluating',
  WIN:        'win',
  LOSE:       'lose',
  GAME_OVER:  'game_over',
});

// ─── Initial state ─────────────────────────────────────────────────────────
export const initialState = {
  phase:      Phase.IDLE,
  balance:    CONFIG.STARTING_BALANCE,
  bet:        CONFIG.BET_AMOUNT,
  lastWin:    0,
  totalSpins: 0,
  result:     null,   // string[][] — 3 reels × 3 rows
  winLines:   [],     // winning paylines from last spin
};

// ─── Actions ───────────────────────────────────────────────────────────────
export const Actions = Object.freeze({
  SPIN_START:    'SPIN_START',
  SPIN_COMPLETE: 'SPIN_COMPLETE',
  RESET_ROUND:   'RESET_ROUND',
  ADJUST_BET:    'ADJUST_BET',
});

// ─── Reducer ───────────────────────────────────────────────────────────────
export function gameReducer(state, action) {
  switch (action.type) {

    case Actions.SPIN_START: {
      if (state.phase !== Phase.IDLE)         return state;
      if (state.balance < state.bet)          return state;
      return {
        ...state,
        phase:      Phase.SPINNING,
        balance:    state.balance - state.bet,
        totalSpins: state.totalSpins + 1,
        lastWin:    0,
        winLines:   [],
        result:     null,
      };
    }

    case Actions.SPIN_COMPLETE: {
      if (state.phase !== Phase.SPINNING) return state;

      const result   = action.payload.result;
      const winLines = evaluatePaylines(result, state.bet);
      const winTotal = winLines.reduce((sum, l) => sum + l.amount, 0);

      const nextBalance = state.balance + winTotal;
      const nextPhase =
        winTotal > 0             ? Phase.WIN :
        nextBalance < state.bet  ? Phase.GAME_OVER :
                                   Phase.LOSE;

      return {
        ...state,
        phase:   nextPhase,
        balance: nextBalance,
        lastWin: winTotal,
        result,
        winLines,
      };
    }

    case Actions.RESET_ROUND: {
      const canContinue = state.balance >= state.bet;
      return {
        ...state,
        phase:    canContinue ? Phase.IDLE : Phase.GAME_OVER,
        lastWin:  0,
        winLines: [],
      };
    }

    case Actions.ADJUST_BET: {
      if (state.phase !== Phase.IDLE) return state;
      const next = state.bet + action.payload;
      const bet  = Math.max(CONFIG.BET_MIN, Math.min(CONFIG.BET_MAX, next));
      return { ...state, bet };
    }

    default:
      return state;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Generate a random 3×3 result grid */
export function generateResult() {
  return Array.from({ length: CONFIG.REEL_COUNT }, () =>
    Array.from({ length: CONFIG.ROWS }, () =>
      SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)]
    )
  );
}

/** Returns array of winning paylines with amounts */
function evaluatePaylines(result, bet) {
  return PAYLINES.flatMap((payline) => {
    const symbols = payline.positions.map((row, col) => result[col][row]);
    const base    = symbols.find(s => s !== 'wild') ?? 'wild';
    const isWin   = symbols.every(s => s === base || s === 'wild');

    if (!isWin) return [];
    const amount = Math.floor(SYMBOL_VALUES[base] * bet * payline.multiplier);
    return [{ ...payline, symbols, amount }];
  });
}
