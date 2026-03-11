import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react';
import { CanvasToolbar } from './CanvasToolbar';

// 8-bit sound generator using Web Audio API
class PixelSoundGenerator {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy initialization of AudioContext
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // Generate 8-bit style sound based on position
  playDrawSound(x: number, y: number, canvasWidth: number, canvasHeight: number) {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();

      // Create oscillator for 8-bit sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Map position to frequency (higher pitch for higher Y position)
      const baseFreq = 200;
      const freqRange = 600;
      const normalizedY = 1 - (y / canvasHeight);
      const frequency = baseFreq + normalizedY * freqRange;

      // Map X position to slight pitch variation
      const normalizedX = x / canvasWidth;
      const pitchVariation = (normalizedX - 0.5) * 50;

      oscillator.type = 'square'; // Classic 8-bit waveform
      oscillator.frequency.setValueAtTime(frequency + pitchVariation, ctx.currentTime);

      // Short decay for clicky sound
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio might not be available
    }
  }

  // Play clear canvas sound
  playClearSound() {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio might not be available
    }
  }
}

interface PixelCanvasProps {
  children: ReactNode;
  showToolbar?: boolean;
}

// Default brush size is now bigger (8px)
const DEFAULT_BRUSH_SIZE = 8;

export function PixelCanvas({ children, showToolbar = true }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#8b5cf6');
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);
  const [isEraser, setIsEraser] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundRef = useRef<PixelSoundGenerator | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const soundThrottleRef = useRef<number>(0);

  // Initialize sound generator
  useEffect(() => {
    soundRef.current = new PixelSoundGenerator();
    return () => {
      soundRef.current = null;
    };
  }, []);

  // Update sound enabled state
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setEnabled(soundEnabled);
    }
  }, [soundEnabled]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;

      // Store current canvas content
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx && canvas.width > 0 && canvas.height > 0) {
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCtx.drawImage(canvas, 0, 0);
      }

      // Resize canvas to full window
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        // Restore content
        if (tempCanvas.width > 0 && tempCanvas.height > 0) {
          ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width / dpr, tempCanvas.height / dpr);
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCanvasCoordinates = useCallback((e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    let clientX: number, clientY: number;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX,
      y: clientY,
    };
  }, []);

  const drawPixel = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Snap to pixel grid
    const pixelX = Math.floor(x / brushSize) * brushSize;
    const pixelY = Math.floor(y / brushSize) * brushSize;

    if (isEraser) {
      ctx.clearRect(pixelX, pixelY, brushSize, brushSize);
    } else {
      ctx.fillStyle = selectedColor;
      ctx.fillRect(pixelX, pixelY, brushSize, brushSize);
    }

    // Play sound with throttling
    const now = Date.now();
    if (now - soundThrottleRef.current > 50) {
      soundThrottleRef.current = now;
      soundRef.current?.playDrawSound(x, y, window.innerWidth, window.innerHeight);
    }
  }, [brushSize, isEraser, selectedColor]);

  const drawLine = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const sx = from.x < to.x ? brushSize : -brushSize;
    const sy = from.y < to.y ? brushSize : -brushSize;
    let err = dx - dy;

    let x = from.x;
    let y = from.y;

    while (true) {
      drawPixel(x, y);

      if (Math.abs(x - to.x) < brushSize && Math.abs(y - to.y) < brushSize) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }, [brushSize, drawPixel]);

  // Direct window event handlers for drawing
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Only draw if clicking on the background (not on UI elements)
      const target = e.target as HTMLElement;
      if (target.closest('.pixel-ui-content')) return;

      const coords = getCanvasCoordinates(e);
      if (!coords) return;

      setIsDrawing(true);
      lastPosRef.current = coords;
      drawPixel(coords.x, coords.y);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return;

      const coords = getCanvasCoordinates(e);
      if (!coords) return;

      if (lastPosRef.current) {
        drawLine(lastPosRef.current, coords);
      }
      lastPosRef.current = coords;
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
      lastPosRef.current = null;
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.pixel-ui-content')) return;

      const coords = getCanvasCoordinates(e);
      if (!coords) return;

      setIsDrawing(true);
      lastPosRef.current = coords;
      drawPixel(coords.x, coords.y);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDrawing) return;

      const coords = getCanvasCoordinates(e);
      if (!coords) return;

      if (lastPosRef.current) {
        drawLine(lastPosRef.current, coords);
      }
      lastPosRef.current = coords;
    };

    const handleTouchEnd = () => {
      setIsDrawing(false);
      lastPosRef.current = null;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDrawing, getCanvasCoordinates, drawPixel, drawLine]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    soundRef.current?.playClearSound();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Drawing canvas (background) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{
          zIndex: 0,
          cursor: 'crosshair',
        }}
      />

      {/* Pixel grid overlay - thicker grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '16px 16px',
        }}
      />

      {/* Toolbar */}
      {showToolbar && (
        <CanvasToolbar
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          isEraser={isEraser}
          onEraserToggle={() => setIsEraser(!isEraser)}
          onClear={handleClear}
          soundEnabled={soundEnabled}
          onSoundToggle={() => setSoundEnabled(!soundEnabled)}
        />
      )}

      {/* UI content layer - marked so we can detect clicks on it */}
      <div className="pixel-ui-content relative" style={{ zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}
