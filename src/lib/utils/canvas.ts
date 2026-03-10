export function createHiDPICanvas(
  width: number,
  height: number,
  dpr: number = window.devicePixelRatio || 1
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }

  return canvas;
}

export function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  offsetX: number = 0,
  offsetY: number = 0
): void {
  const imgRatio = img.width / img.height;
  const targetRatio = width / height;

  let srcX = 0;
  let srcY = 0;
  let srcWidth = img.width;
  let srcHeight = img.height;

  if (imgRatio > targetRatio) {
    srcWidth = img.height * targetRatio;
    srcX = (img.width - srcWidth) / 2;
  } else {
    srcHeight = img.width / targetRatio;
    srcY = (img.height - srcHeight) / 2;
  }

  srcX -= offsetX * (srcWidth / width);
  srcY -= offsetY * (srcHeight / height);

  ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, x, y, width, height);
}
