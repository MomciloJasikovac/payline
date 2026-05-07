# Slot Game - React + PixiJS

A 3×3 slot machine built with PixiJS v8 for rendering and React 18 for state. Showcases a clean separation between visual layer and game logic, paylines with wild substitution, and a deterministic reducer-driven state machine.

## Tech Stack

| Layer       | Tech                              |
|-------------|-----------------------------------|
| Rendering   | PixiJS v8 (WebGL)                 |
| UI & State  | React 18 + `useReducer` + Context |
| Build       | Vite 5                            |
| Language    | JavaScript (ESM)                  |

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

Press **SPIN** or hit **Space**.

## Architecture

> React owns all state. PixiJS owns all rendering. They never import each other.

```
src/
├── game/
│   ├── config.js           Pure constants - symbols, paylines, layout, timing
│   └── PixiController.js   Pixi app + reels + spin animation. Zero React imports.
│
├── store/
│   ├── gameReducer.js      Pure reducer + payline evaluation + result RNG
│   └── GameContext.jsx     Context provider + useGame() hook
│
├── components/
│   ├── GameCanvas.jsx      The bridge - mounts PixiController on a <canvas> ref
│   ├── HUD.jsx             Balance / bet controls / spin counter / win display
│   └── SpinButton.jsx      Spin trigger
│
├── App.jsx                 Wires reducer -> Pixi -> UI, drives the spin flow
└── main.jsx                React root + GameProvider
```

### State Machine

```
IDLE - SPIN_START -> SPINNING - SPIN_COMPLETE -> WIN - RESET_ROUND -> IDLE
                                              ├─► LOSE - RESET_ROUND -> IDLE
                                              └─► GAME_OVER (terminal)
```

Phases live in the reducer. The `App` component drives transitions but never owns derived state.

### The Bridge

`GameCanvas.jsx` is the only file that touches both worlds:

- Instantiates `PixiController` on mount, calls `destroy()` on unmount
- Exposes the controller through a ref, so `App.jsx` can call `pixiRef.current.spin(result)` as a plain async function
- No event bus, no globals, no circular deps

The async `spin(result)` returns when the reel animation lands — `App.jsx` then dispatches `SPIN_COMPLETE` with the same `result` it generated. Pixi is purely an output: it never decides what to show.

### Paylines & Wild Substitution

5 paylines defined in `config.js`:

| Line       | Pattern    | Multiplier |
|------------|------------|------------|
| Middle     | row 1      | 1.0×       |
| Top        | row 0      | 0.8×       |
| Bottom     | row 2      | 0.8×       |
| Diagonal ↘ | 0 → 1 → 2  | 1.5×       |
| Diagonal ↗ | 2 → 1 → 0  | 1.5×       |

A line wins when all three symbols match a single base symbol, with `wild` substituting for any. All-wild lines pay the wild rate.

```
payout = SYMBOL_VALUES[base] × bet × payline.multiplier
```

### Reel Animation

Each reel holds `ROWS + 2` symbols (one above, one below the visible mask) so the strip wraps cleanly during the spin.

- `easeOutExpo` for the deceleration feel
- Per-reel `SPIN_STAGGER_MS` delay so reels land sequentially
- After easing completes, `_snap()` sets the final symbols to the result the reducer chose

## Configuration

Tuning knobs in `src/game/config.js`:

```js
{
  CANVAS_WIDTH:    800,
  CANVAS_HEIGHT:   500,
  REEL_COUNT:      3,
  ROWS:            3,
  SYMBOL_SIZE:     120,
  SYMBOL_GAP:      8,
  STARTING_BALANCE: 100,
  BET_AMOUNT:       10,
  BET_MIN:           5,
  BET_MAX:         100,
  BET_STEP:          5,
  SPIN_BASE_MS:    900,
  SPIN_STAGGER_MS: 260,
}
```

Symbols, palette, and payline definitions live in the same file.

## Roadmap

- [ ] Win effects - payline overlay, symbol pulse on winning cells
- [ ] Sprite atlas (`@pixi/spritesheet`) instead of emoji glyphs - predictable rendering across platforms
- [ ] `BitmapText` for symbol labels - zero per-frame rasterization cost
- [ ] Sound (Howler.js) - spin loop, reel stop click, win jingle
- [ ] Blur filter on spinning reels (`PIXI.BlurFilter`)
- [ ] Auto-spin (hold-to-spin)
- [ ] Particle burst on big wins (`@pixi/particle-emitter`)
- [ ] Vitest suite for `gameReducer` and `evaluatePaylines`
- [ ] TypeScript migration

## Design Notes

A few decisions worth calling out:

- **Result generation in the reducer, not on the server.** Swap `generateResult()` for an API call when wiring up real RNG - same shape, no flow change. Keeping it in the store means action logs are replayable.
- **Pixi as a pure visual function of state.** No two-way binding, no shared mutable state. The reel is a presentation detail; the source of truth is React.
- **Wild substitution favours the player at all-wild lines.** Three wilds pay the wild rate (highest), not a fallback rate.
- **`autoDensity` + `devicePixelRatio` resolution** - keeps canvas crisp on retina without manual scaling.

## License

MIT
