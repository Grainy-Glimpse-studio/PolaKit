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
  ctx.save();

  ctx.filter = `blur(${blurRadius}px) brightness(${brightness}%)`;

  ctx.drawImage(image, x, y, width, height);

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
