// ─── Symbols ───────────────────────────────────────────────────────────────
export const SYMBOL_IDS = ['cherry', 'lemon', 'orange', 'plum', 'bell', 'bar', 'seven', 'wild'];

export const SYMBOL_DISPLAY = {
  cherry: { label: '🍒', color: 0xe74c3c },
  lemon:  { label: '🍋', color: 0xf1c40f },
  orange: { label: '🍊', color: 0xe67e22 },
  plum:   { label: '🍇', color: 0x9b59b6 },
  bell:   { label: '🔔', color: 0xf39c12 },
  bar:    { label: 'BAR', color: 0x2ecc71 },
  seven:  { label: '7',  color: 0xe74c3c },
  wild:   { label: '★',  color: 0xffd700 },
};

// Base payout multiplier per symbol (× bet)
export const SYMBOL_VALUES = {
  cherry: 2,  lemon: 3,  orange: 4, plum: 5,
  bell: 8,    bar: 10,   seven: 15, wild: 25,
};

// ─── Paylines ──────────────────────────────────────────────────────────────
// positions[i] = which row of reel i must match (0=top, 1=mid, 2=bot)
export const PAYLINES = [
  { positions: [1, 1, 1], name: 'Middle',       multiplier: 1.0 },
  { positions: [0, 0, 0], name: 'Top',           multiplier: 0.8 },
  { positions: [2, 2, 2], name: 'Bottom',        multiplier: 0.8 },
  { positions: [0, 1, 2], name: 'Diagonal ↘',   multiplier: 1.5 },
  { positions: [2, 1, 0], name: 'Diagonal ↗',   multiplier: 1.5 },
];

// ─── Layout / timing ───────────────────────────────────────────────────────
export const CONFIG = {
  CANVAS_WIDTH:  800,
  CANVAS_HEIGHT: 500,
  REEL_COUNT:    3,
  ROWS:          3,
  SYMBOL_SIZE:   120,
  SYMBOL_GAP:    8,
  STARTING_BALANCE: 100,
  BET_AMOUNT:       10,
  BET_MIN:          5,
  BET_MAX:          100,
  BET_STEP:         5,
  SPIN_BASE_MS:     900,
  SPIN_STAGGER_MS:  260,
};
