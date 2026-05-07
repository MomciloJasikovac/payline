import { useEffect, useRef } from 'react';
import { PixiController } from '../game/PixiController.js';
import { CONFIG } from '../game/config.js';

/**
 * Mounts the PixiJS canvas and exposes a ref to the controller.
 * This is the only place React and Pixi meet.
 *
 * @param {{ controllerRef: React.MutableRefObject }} props
 */
export function GameCanvas({ controllerRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new PixiController();

    controller.mount(canvasRef.current)
      .then(() => {
        if (!cancelled) controllerRef.current = controller;
      })
      .catch((err) => {
        console.error('PixiController mount failed', err);
      });

    return () => {
      cancelled = true;
      controller.destroy();
      controllerRef.current = null;
    };
  }, [controllerRef]);

  return (
      <div style={{
        width:           CONFIG.CANVAS_WIDTH,
        height:          CONFIG.CANVAS_HEIGHT,
        borderRadius:    12,
        background:      '#0d0d1a',
        overflow:        'hidden',
      }}>
        <canvas ref={canvasRef} style={{ display: 'block' }} />
      </div>
  );
}
