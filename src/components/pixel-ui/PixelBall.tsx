import { useEffect, useRef, useState, useCallback, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';

// Physics constants
const GRAVITY = 0.12;      // Slightly slower fall
const BOUNCE = 0.7;        // More bouncy (was 0.55)
const FRICTION = 0.995;    // Less friction (was 0.98)
const MAX_VELOCITY = 10;   // Allow faster movement
const PIXEL_SIZE = 8; // Size of each "pixel" block
const GRID_SIZE = 8;  // 8x8 grid
const BALL_SIZE = PIXEL_SIZE * GRID_SIZE; // 64px total

// Pixel pattern for a circle (8x8 grid, 1 = filled, 0 = empty)
const CIRCLE_PATTERN = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
];

interface PixelBallProps {
  color: string;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isErasing: boolean;
  eraserPos: { x: number; y: number } | null;
  brushSize: number;
}

interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pixels: boolean[][]; // Which pixels are visible (for eraser effect)
}

export function PixelBall({ color, canvasRef, isErasing, eraserPos, brushSize }: PixelBallProps) {
  const navigate = useNavigate();
  const ballRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const [ballState, setBallState] = useState<BallState | null>(null);
  const [isRespawning, setIsRespawning] = useState(false);
  const lastClickTimeRef = useRef<number>(0);

  // Initialize ball with random position from top-left or top-right
  const initBall = useCallback((): BallState => {
    const fromRight = Math.random() > 0.5;
    const x = fromRight
      ? window.innerWidth - 100 - Math.random() * 100
      : 100 + Math.random() * 100;
    const y = -BALL_SIZE - Math.random() * 50;

    // Initialize pixels from the circle pattern
    const pixels = CIRCLE_PATTERN.map(row => row.map(v => v === 1));

    return {
      x,
      y,
      vx: fromRight ? -2 - Math.random() * 2 : 2 + Math.random() * 2,
      vy: 2 + Math.random(), // Start with more initial velocity
      pixels,
    };
  }, []);

  // Check if all pixels are erased
  const allPixelsErased = useCallback((pixels: boolean[][]): boolean => {
    return pixels.every(row => row.every(p => !p));
  }, []);

  // Respawn ball after delay
  const respawnBall = useCallback(() => {
    setIsRespawning(true);
    setTimeout(() => {
      setBallState(initBall());
      setIsRespawning(false);
    }, 2000);
  }, [initBall]);

  // Initialize ball on mount
  useEffect(() => {
    setBallState(initBall());
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initBall]);

  // Check collision with canvas pixels
  const checkCanvasCollision = useCallback((
    x: number,
    y: number,
    vx: number,
    vy: number
  ): { hit: boolean; normalX: number; normalY: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { hit: false, normalX: 0, normalY: 0 };

    const ctx = canvas.getContext('2d');
    if (!ctx) return { hit: false, normalX: 0, normalY: 0 };

    const dpr = window.devicePixelRatio || 1;

    // Sample points around the ball's edge in the direction of movement
    const samplePoints: { px: number; py: number }[] = [];

    // Check bottom edge if moving down
    if (vy > 0) {
      for (let i = 0; i < BALL_SIZE; i += 4) {
        samplePoints.push({ px: x + i, py: y + BALL_SIZE + 2 });
      }
    }
    // Check top edge if moving up
    if (vy < 0) {
      for (let i = 0; i < BALL_SIZE; i += 4) {
        samplePoints.push({ px: x + i, py: y - 2 });
      }
    }
    // Check right edge if moving right
    if (vx > 0) {
      for (let i = 0; i < BALL_SIZE; i += 4) {
        samplePoints.push({ px: x + BALL_SIZE + 2, py: y + i });
      }
    }
    // Check left edge if moving left
    if (vx < 0) {
      for (let i = 0; i < BALL_SIZE; i += 4) {
        samplePoints.push({ px: x - 2, py: y + i });
      }
    }

    let hitCount = 0;
    let avgNormalX = 0;
    let avgNormalY = 0;

    for (const { px, py } of samplePoints) {
      if (px < 0 || py < 0 || px >= window.innerWidth || py >= window.innerHeight) continue;

      try {
        const pixel = ctx.getImageData(px * dpr, py * dpr, 1, 1).data;
        // Check if pixel is not transparent (has content)
        if (pixel[3] > 10) {
          hitCount++;
          // Calculate normal direction (away from the obstacle)
          const centerX = x + BALL_SIZE / 2;
          const centerY = y + BALL_SIZE / 2;
          avgNormalX += centerX - px;
          avgNormalY += centerY - py;
        }
      } catch {
        // Canvas might have tainted content
      }
    }

    if (hitCount > 0) {
      const len = Math.sqrt(avgNormalX * avgNormalX + avgNormalY * avgNormalY);
      if (len > 0) {
        avgNormalX /= len;
        avgNormalY /= len;
      }
      return { hit: true, normalX: avgNormalX, normalY: avgNormalY };
    }

    return { hit: false, normalX: 0, normalY: 0 };
  }, [canvasRef]);

  // Physics update loop
  useEffect(() => {
    if (!ballState || isRespawning) return;

    const updatePhysics = () => {
      setBallState(prev => {
        if (!prev) return prev;

        let { x, y, vx, vy, pixels } = prev;

        // Apply gravity
        vy += GRAVITY;

        // Apply friction
        vx *= FRICTION;

        // Clamp velocity
        vx = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, vx));
        vy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, vy));

        // Check canvas collision before moving
        const collision = checkCanvasCollision(x, y, vx, vy);
        if (collision.hit) {
          // Reflect velocity based on collision normal
          const dot = vx * collision.normalX + vy * collision.normalY;
          vx = (vx - 2 * dot * collision.normalX) * BOUNCE;
          vy = (vy - 2 * dot * collision.normalY) * BOUNCE;

          // Add small random variation
          vx += (Math.random() - 0.5) * 0.5;
        }

        // Update position
        x += vx;
        y += vy;

        // Boundary collisions
        const maxX = window.innerWidth - BALL_SIZE;
        const maxY = window.innerHeight - BALL_SIZE;

        // Floor bounce
        if (y > maxY) {
          y = maxY;
          vy = -vy * BOUNCE;
          vx *= 0.98; // Keep more horizontal velocity on floor bounce
        }

        // Ceiling
        if (y < 0) {
          y = 0;
          vy = -vy * BOUNCE;
        }

        // Walls
        if (x < 0) {
          x = 0;
          vx = -vx * BOUNCE;
        }
        if (x > maxX) {
          x = maxX;
          vx = -vx * BOUNCE;
        }

        // Stop very slow motion (lower threshold for more bounces)
        if (Math.abs(vx) < 0.005) vx = 0;
        if (Math.abs(vy) < 0.1 && y >= maxY - 1) vy = 0;

        return { x, y, vx, vy, pixels };
      });

      animationRef.current = requestAnimationFrame(updatePhysics);
    };

    animationRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [ballState, isRespawning, checkCanvasCollision]);

  // Handle eraser interaction
  useEffect(() => {
    if (!isErasing || !eraserPos || !ballState || isRespawning) return;

    const { x, y, pixels } = ballState;
    // Make eraser radius generous for easier interaction
    const eraserRadius = Math.max(brushSize, PIXEL_SIZE) + PIXEL_SIZE;

    // Check each pixel of the ball against eraser position
    let pixelsChanged = false;
    const newPixels = pixels.map((row, rowIdx) =>
      row.map((pixel, colIdx) => {
        if (!pixel) return false;

        // Calculate pixel center position
        const pixelCenterX = x + colIdx * PIXEL_SIZE + PIXEL_SIZE / 2;
        const pixelCenterY = y + rowIdx * PIXEL_SIZE + PIXEL_SIZE / 2;

        // Check distance to eraser
        const dx = pixelCenterX - eraserPos.x;
        const dy = pixelCenterY - eraserPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < eraserRadius + PIXEL_SIZE / 2) {
          pixelsChanged = true;
          return false;
        }
        return true;
      })
    );

    if (pixelsChanged) {
      setBallState(prev => prev ? { ...prev, pixels: newPixels } : prev);

      // Check if all pixels erased
      if (allPixelsErased(newPixels)) {
        respawnBall();
      }
    }
  }, [isErasing, eraserPos, ballState, brushSize, isRespawning, allPixelsErased, respawnBall]);

  // Handle mouse interaction - push the ball when hovering
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ballState || isRespawning) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const ballCenterX = rect.left + rect.width / 2;
    const ballCenterY = rect.top + rect.height / 2;

    // Calculate push direction (away from mouse)
    const dx = ballCenterX - mouseX;
    const dy = ballCenterY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < BALL_SIZE && distance > 0) {
      // Normalize and apply gentle push
      const pushStrength = 0.5;
      setBallState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          vx: prev.vx + (dx / distance) * pushStrength,
          vy: prev.vy + (dy / distance) * pushStrength,
        };
      });
    }
  }, [ballState, isRespawning]);

  // Handle click - make ball jump
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();

    if (now - lastClickTimeRef.current < 300) {
      // Double click detected - navigate to About
      navigate('/about');
    } else {
      // Single click - make ball jump up
      setBallState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          vy: -6, // Jump up
          vx: prev.vx + (Math.random() - 0.5) * 2, // Small random horizontal
        };
      });
    }
    lastClickTimeRef.current = now;
  }, [navigate]);

  if (!ballState || isRespawning) return null;

  const { x, y, pixels } = ballState;

  return (
    <div
      ref={ballRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      className="pixel-ball fixed cursor-pointer select-none"
      style={{
        left: x,
        top: y,
        width: BALL_SIZE,
        height: BALL_SIZE,
        zIndex: 100,
        transform: 'translate3d(0,0,0)', // GPU acceleration
      }}
      title="Click to bounce, double-click to learn more"
    >
      {/* Render ball as pixel grid */}
      <div className="relative w-full h-full">
        {pixels.map((row, rowIdx) =>
          row.map((pixel, colIdx) =>
            pixel && (
              <div
                key={`${rowIdx}-${colIdx}`}
                className="absolute"
                style={{
                  left: colIdx * PIXEL_SIZE,
                  top: rowIdx * PIXEL_SIZE,
                  width: PIXEL_SIZE,
                  height: PIXEL_SIZE,
                  backgroundColor: color,
                  // Subtle pixel border for that classic look
                  boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.2), inset 1px 1px 0 rgba(255,255,255,0.2)',
                }}
              />
            )
          )
        )}
      </div>
    </div>
  );
}
