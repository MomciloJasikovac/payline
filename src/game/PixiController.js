import * as PIXI from 'pixi.js';
import { CONFIG, SYMBOL_IDS, SYMBOL_DISPLAY } from './config.js';

const { SYMBOL_SIZE, SYMBOL_GAP, ROWS, REEL_COUNT, SPIN_BASE_MS, SPIN_STAGGER_MS } = CONFIG;
const STEP = SYMBOL_SIZE + SYMBOL_GAP;

// ─── Easing ─────────────────────────────────────────────────────────────────
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// ─── SymbolView ──────────────────────────────────────────────────────────────
class SymbolView {
  constructor(id) {
    this.container = new PIXI.Container();
    this._id = null;
    this.setSymbol(id);
  }

  get symbolId() { return this._id; }

  setSymbol(id) {
    if (id === this._id) return;
    this._id = id;
    this.container.removeChildren();

    const { label, color } = SYMBOL_DISPLAY[id];
    const size = SYMBOL_SIZE;

    const bg = new PIXI.Graphics();
    bg.roundRect(2, 2, size - 4, size - 4, 10);
    bg.fill({ color, alpha: 0.22 });
    bg.stroke({ color, width: 2, alpha: 0.55 });
    this.container.addChild(bg);

    const text = new PIXI.Text({
      text: label,
      style: {
        fontSize:   label.length > 1 ? 40 : 52,
        fill:       0xffffff,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        align:      'center',
      },
    });
    text.anchor.set(0.5);
    text.x = size / 2;
    text.y = size / 2;
    this.container.addChild(text);
  }
}

// ─── Reel ─────────────────────────────────────────────────────────────────────
class Reel {
  constructor(ticker) {
    this.ticker    = ticker;
    this.container = new PIXI.Container();
    this._symbols  = [];
    this._offset   = 0;

    const stripLen = ROWS + 2;
    const mask = new PIXI.Graphics();
    mask.rect(0, 0, SYMBOL_SIZE, ROWS * STEP - SYMBOL_GAP);
    mask.fill(0xffffff);
    this.container.addChild(mask);
    this.container.mask = mask;

    for (let i = 0; i < stripLen; i++) {
      const sym = new SymbolView(SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)]);
      sym.container.y = (i - 1) * STEP;
      this.container.addChild(sym.container);
      this._symbols.push(sym);
    }
  }

  spin(targetSymbols, duration) {
    return new Promise((resolve) => {
      const start    = performance.now();
      const distance = 5 * (ROWS + 2) * STEP;

      const tick = () => {
        const progress = Math.min((performance.now() - start) / duration, 1);
        this._offset = distance * easeOutExpo(progress);
        this._updatePositions();

        if (progress >= 1) {
          this.ticker.remove(tick);
          this._snap(targetSymbols);
          resolve();
        }
      };

      this.ticker.add(tick);
    });
  }

  _updatePositions() {
    // Tile stripLen symbols across wrapLen, normalized to [-STEP, wrapLen - STEP).
    // Earlier code clamped to [-STEP, ROWS*STEP] which is one STEP narrower than
    // wrapLen, so during a spin one symbol could land outside the band and leave
    // a gap on the reel for that frame.
    const wrapLen = this._symbols.length * STEP;
    this._symbols.forEach((sym, i) => {
      const raw = (i - 1) * STEP - this._offset + STEP;
      sym.container.y = ((raw % wrapLen) + wrapLen) % wrapLen - STEP;
    });
  }

  _snap(targetSymbols) {
    for (let row = 0; row < ROWS; row++) {
      this._symbols[row + 1].setSymbol(targetSymbols[row]);
      this._symbols[row + 1].container.y = row * STEP;
    }
    const rnd = () => SYMBOL_IDS[Math.floor(Math.random() * SYMBOL_IDS.length)];
    this._symbols[0].setSymbol(rnd());
    this._symbols[0].container.y = -STEP;
    this._symbols[ROWS + 1].setSymbol(rnd());
    this._symbols[ROWS + 1].container.y = ROWS * STEP;
    this._offset = 0;
  }
}

// ─── PixiController ──────────────────────────────────────────────────────────
// Owns the Pixi Application. Knows nothing about React.
export class PixiController {
  constructor() {
    this.app   = null;
    this.reels = [];
    this._destroyed = false;
  }

  async mount(canvas) {
    this.app = new PIXI.Application();
    await this.app.init({
      canvas,
      width:       CONFIG.CANVAS_WIDTH,
      height:      CONFIG.CANVAS_HEIGHT,
      background:  0x0a0a12,
      antialias:   true,
      resolution:  window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Wait for the system emoji font before rasterizing symbol glyphs —
    // otherwise the first paint can cache empty/tofu glyphs for 🍒🍋… etc.
    if (document.fonts?.ready) await document.fonts.ready;

    if (this._destroyed) {
      this.app.destroy({ removeView: false });
      this.app = null;
      return;
    }
    this._buildReelPanel();
  }

  destroy() {
    this._destroyed = true;
    if (this.app) {
      this.app.destroy({ removeView: false });
      this.app = null;
    }
  }

  /** Spin all reels, staggered. result is string[][]. */
  async spin(result) {
    const promises = this.reels.map((reel, i) =>
      reel.spin(result[i], SPIN_BASE_MS + i * SPIN_STAGGER_MS)
    );
    await Promise.all(promises);
  }

  _buildReelPanel() {
    const PAD  = 20;
    const W    = REEL_COUNT * SYMBOL_SIZE + (REEL_COUNT - 1) * SYMBOL_GAP + PAD * 2;
    const H    = ROWS * STEP - SYMBOL_GAP + PAD * 2;

    const panel = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, W, H, 16);
    bg.fill({ color: 0x0d0d1a });
    bg.stroke({ color: 0x2a2a4a, width: 2 });
    panel.addChild(bg);

    for (let i = 0; i < REEL_COUNT; i++) {
      const reel = new Reel(this.app.ticker);
      reel.container.x = PAD + i * (SYMBOL_SIZE + SYMBOL_GAP);
      reel.container.y = PAD;
      panel.addChild(reel.container);
      this.reels.push(reel);
    }

    panel.x = (CONFIG.CANVAS_WIDTH  - W) / 2;
    panel.y = (CONFIG.CANVAS_HEIGHT - H) / 2;
    this.app.stage.addChild(panel);
  }
}
