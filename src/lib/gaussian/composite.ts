import type { GaussianSettings } from '@/store/gaussian-store';
import { getRatioDimensions } from './presets';
import { applyGaussianBlur, drawSolidBackground } from './blur';

export interface CompositeOptions {
  settings: GaussianSettings;
  image: HTMLImageElement;
  canvas: HTMLCanvasElement;
  scale?: number;
}

export function renderComposite(options: CompositeOptions): void {
  const { settings, image, canvas, scale = 1 } = options;

  const { width, height } = getRatioDimensions(
    settings.ratio,
    settings.customRatioW,
    settings.customRatioH,
    settings.resolution * scale
  );

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Draw background
  if (settings.bgType === 'solid') {
    drawSolidBackground(ctx, settings.bgColor, width, height);
  } else if (settings.bgType === 'blur') {
    // Calculate background cover dimensions
    const bgScale = settings.bgScale / 100;
    const imgRatio = image.width / image.height;
    const canvasRatio = width / height;

    let bgWidth: number, bgHeight: number;
    if (imgRatio > canvasRatio) {
      bgHeight = height * bgScale;
      bgWidth = bgHeight * imgRatio;
    } else {
      bgWidth = width * bgScale;
      bgHeight = bgWidth / imgRatio;
    }

    const bgX = (width - bgWidth) / 2 + settings.bgOffsetX * scale;
    const bgY = (height - bgHeight) / 2 + settings.bgOffsetY * scale;

    applyGaussianBlur(
      ctx,
      image,
      bgX,
      bgY,
      bgWidth,
      bgHeight,
      settings.blurIntensity * scale,
      settings.brightness
    );
  }

  // Calculate polaroid dimensions and position
  const polaroidScale = settings.polaroidSize / 100;
  const polaroidMaxSize = Math.min(width, height) * 0.9;

  const imgRatio = image.width / image.height;
  let polaroidWidth: number, polaroidHeight: number;

  if (imgRatio > 1) {
    polaroidWidth = polaroidMaxSize * polaroidScale;
    polaroidHeight = polaroidWidth / imgRatio;
  } else {
    polaroidHeight = polaroidMaxSize * polaroidScale;
    polaroidWidth = polaroidHeight * imgRatio;
  }

  const polaroidX = (width - polaroidWidth) / 2 + settings.polaroidOffsetX * scale;
  const polaroidY = (height - polaroidHeight) / 2 + settings.polaroidOffsetY * scale;

  // Draw shadow
  if (settings.shadow) {
    ctx.save();
    ctx.shadowColor = `rgba(0, 0, 0, ${settings.shadowOpacity / 100})`;
    ctx.shadowBlur = settings.shadowBlur * scale;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4 * scale;

    ctx.fillStyle = 'white';
    ctx.fillRect(polaroidX, polaroidY, polaroidWidth, polaroidHeight);
    ctx.restore();
  }

  // Draw polaroid image
  ctx.drawImage(image, polaroidX, polaroidY, polaroidWidth, polaroidHeight);
}

export async function exportAsBlob(
  settings: GaussianSettings,
  image: HTMLImageElement,
  format: 'png' | 'jpeg' = 'jpeg',
  quality: number = 0.92
): Promise<Blob> {
  const canvas = document.createElement('canvas');

  renderComposite({
    settings,
    image,
    canvas,
    scale: 1,
  });

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      `image/${format}`,
      quality
    );
  });
}
