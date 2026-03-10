import { useEffect, useRef, useId } from 'react';
import { Link } from 'react-router-dom';
import p5 from 'p5';

interface Tool {
  id: string;
  name: string;
  subtitle: string;
  path: string;
}

interface PixelPolaroidProps {
  tool: Tool;
  index: number;
  size?: number;
}

// Polaroid rainbow colors
const COLORS = [
  [255, 107, 107], // red
  [255, 230, 109], // yellow
  [78, 205, 196],  // teal
  [69, 183, 209],  // blue
  [150, 206, 180], // mint
];

export function PixelPolaroid({
  tool,
  index,
  size = 240,
}: PixelPolaroidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const containerId = useId();

  const pixelSize = 20;
  const width = size;
  const height = size + pixelSize * 2;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // If we already have an instance, don't create another
    if (p5InstanceRef.current) {
      return;
    }

    // Also check if there's already a canvas (from HMR or other)
    if (container.querySelector('canvas')) {
      return;
    }

    const cols = Math.floor(width / pixelSize);
    const rows = Math.floor(height / pixelSize);
    const thinBorder = 1;
    const thickBorder = 3;

    let pixels: { x: number; y: number; colorIndex: number }[] = [];
    let shineOffset = -200;

    const sketch = (p: p5) => {
      p.setup = () => {
        const canvas = p.createCanvas(width, height);
        canvas.style('display', 'block');
        p.noStroke();

        for (let col = 0; col < cols; col++) {
          for (let row = 0; row < rows; row++) {
            let shouldDraw = false;

            if (row < thinBorder) {
              shouldDraw = true;
            } else if (row >= rows - thickBorder) {
              shouldDraw = true;
            } else if (col < thinBorder && row >= thinBorder && row < rows - thickBorder) {
              shouldDraw = true;
            } else if (col >= cols - thinBorder && row >= thinBorder && row < rows - thickBorder) {
              shouldDraw = true;
            }

            if (shouldDraw) {
              pixels.push({
                x: col * pixelSize,
                y: row * pixelSize,
                colorIndex: Math.floor(p.random(COLORS.length)),
              });
            }
          }
        }
      };

      p.draw = () => {
        p.clear();

        const time = p.millis() / 1000;
        shineOffset += 5;
        if (shineOffset > width + height + 300) {
          shineOffset = -250;
        }

        pixels.forEach((pixel) => {
          const diagonalPos = pixel.x + pixel.y;
          const shineDistance = Math.abs(diagonalPos - shineOffset);
          const shineWidth = 180;

          const hueShift = (time * 30 + index * 50) % 360;
          const baseColor = COLORS[pixel.colorIndex];

          let brightness = 0.55;
          let alpha = 170;

          if (shineDistance < shineWidth) {
            const shineStrength = 1 - shineDistance / shineWidth;
            brightness = 0.55 + shineStrength * 0.7;
            alpha = 170 + shineStrength * 85;
          }

          p.colorMode(p.HSB, 360, 100, 100, 255);
          const c = p.color(baseColor[0], baseColor[1], baseColor[2]);
          const hue = (p.hue(c) + hueShift) % 360;
          const sat = p.saturation(c) * 0.75;
          const bri = p.brightness(c) * brightness;

          p.fill(hue, sat * 0.3, bri, alpha * 0.3);
          p.rect(pixel.x - 3, pixel.y - 3, pixelSize + 6, pixelSize + 6);

          p.fill(hue, sat, bri, alpha);
          p.rect(pixel.x + 1, pixel.y + 1, pixelSize - 2, pixelSize - 2);
        });
      };
    };

    p5InstanceRef.current = new p5(sketch, container);

    return () => {
      // Remove p5 instance
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
      // Also manually remove any canvas left behind
      if (container) {
        const canvases = container.querySelectorAll('canvas');
        canvases.forEach(c => c.remove());
      }
    };
  }, [width, height, index, pixelSize]);

  return (
    <Link
      to={tool.path}
      className="block relative group cursor-pointer"
      style={{ width, height: height + 45 }}
    >
      <div ref={containerRef} id={containerId} style={{ width, height }} />

      <div
        className="absolute flex items-center justify-center pointer-events-none"
        style={{
          top: pixelSize,
          left: pixelSize,
          right: pixelSize,
          bottom: pixelSize * 3 + 45,
        }}
      >
        <h3
          className="pixel-text text-center"
          style={{ fontSize: '16px', animationDelay: `${index * 0.5}s` }}
        >
          {tool.name}
        </h3>
      </div>

      <div className="text-center mt-3">
        <p className="text-sm text-white/60 font-medium">{tool.subtitle}</p>
      </div>
    </Link>
  );
}
