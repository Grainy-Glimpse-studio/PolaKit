import type { GaussianSettings } from '@/store/gaussian-store';
import { getRatioDimensions } from './presets';
import { applyGaussianBlur, drawSolidBackground, drawImageBackground } from './blur';

export interface CompositeOptions {
  settings: GaussianSettings;
  image: HTMLImageElement;
  canvas: HTMLCanvasElement;
  scale?: number;
  bgImage?: HTMLImageElement | null;
  bgVideoFrame?: HTMLCanvasElement | null;
}

export function renderComposite(options: CompositeOptions): void {
  const { settings, image, canvas, scale = 1, bgImage, bgVideoFrame } = options;

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

    // Note: blur radius should not scale with canvas size for consistent appearance
    // Use a minimum blur to ensure visibility, scaled proportionally to canvas
    const effectiveBlur = Math.max(settings.blurIntensity, 1);

    applyGaussianBlur(
      ctx,
      image,
      bgX,
      bgY,
      bgWidth,
      bgHeight,
      effectiveBlur,
      settings.brightness
    );
  } else if (settings.bgType === 'image' && bgImage) {
    drawImageBackground(
      ctx,
      bgImage,
      width,
      height,
      settings.bgScale,
      settings.bgOffsetX * scale,
      settings.bgOffsetY * scale
    );
  } else if (settings.bgType === 'video' && bgVideoFrame) {
    drawImageBackground(
      ctx,
      bgVideoFrame,
      width,
      height,
      settings.bgScale,
      settings.bgOffsetX * scale,
      settings.bgOffsetY * scale
    );
  } else {
    // Fallback to solid white if no background is set
    drawSolidBackground(ctx, '#ffffff', width, height);
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
    // Use original values for shadow - don't scale down for preview
    ctx.shadowColor = `rgba(0, 0, 0, ${settings.shadowOpacity / 100})`;
    ctx.shadowBlur = settings.shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.max(4, settings.shadowBlur * 0.2);

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
  quality: number = 0.92,
  bgImage?: HTMLImageElement | null,
  bgVideoFrame?: HTMLCanvasElement | null
): Promise<Blob> {
  const canvas = document.createElement('canvas');

  renderComposite({
    settings,
    image,
    canvas,
    scale: 1,
    bgImage,
    bgVideoFrame,
  });

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      `image/${format}`,
      quality
    );
  });
}
