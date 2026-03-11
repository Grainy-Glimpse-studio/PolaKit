import * as StackBlur from 'stackblur-canvas';

export function applyGaussianBlur(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  blurRadius: number,
  brightness: number = 100
): void {
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  // No blur needed
  if (blurRadius <= 0) {
    ctx.save();
    if (brightness !== 100) {
      ctx.filter = `brightness(${brightness}%)`;
    }
    ctx.drawImage(image, x, y, width, height);
    ctx.restore();
    return;
  }

  // Step 1: Draw image to a temporary canvas at full resolution
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvasWidth;
  tempCanvas.height = canvasHeight;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  // Enable high quality image smoothing
  tempCtx.imageSmoothingEnabled = true;
  tempCtx.imageSmoothingQuality = 'high';

  // Draw the image onto temp canvas
  tempCtx.drawImage(image, x, y, width, height);

  // Step 2: Apply StackBlur for true Gaussian-like blur (cross-browser compatible)
  // StackBlur radius is in pixels, scale based on canvas size for consistent appearance
  // Clamp radius to reasonable range (1-180 as per StackBlur docs)
  const effectiveRadius = Math.min(Math.max(Math.round(blurRadius), 1), 180);
  StackBlur.canvasRGBA(tempCanvas, 0, 0, canvasWidth, canvasHeight, effectiveRadius);

  // Step 3: Draw the blurred result to the main canvas
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Apply brightness filter if needed
  if (brightness !== 100) {
    ctx.filter = `brightness(${brightness}%)`;
  }

  ctx.drawImage(tempCanvas, 0, 0);
  ctx.restore();
}

export function drawSolidBackground(
  ctx: CanvasRenderingContext2D,
  color: string,
  width: number,
  height: number
): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

export function drawImageBackground(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | HTMLCanvasElement,
  canvasWidth: number,
  canvasHeight: number,
  scale: number = 100,
  offsetX: number = 0,
  offsetY: number = 0
): void {
  const bgScale = scale / 100;
  const imgRatio = image.width / image.height;
  const canvasRatio = canvasWidth / canvasHeight;

  let bgWidth: number, bgHeight: number;

  // Cover mode: fill the entire canvas
  if (imgRatio > canvasRatio) {
    bgHeight = canvasHeight * bgScale;
    bgWidth = bgHeight * imgRatio;
  } else {
    bgWidth = canvasWidth * bgScale;
    bgHeight = bgWidth / imgRatio;
  }

  const bgX = (canvasWidth - bgWidth) / 2 + offsetX;
  const bgY = (canvasHeight - bgHeight) / 2 + offsetY;

  ctx.drawImage(image, bgX, bgY, bgWidth, bgHeight);
}
