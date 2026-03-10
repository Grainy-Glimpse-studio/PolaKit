import type { AspectRatio } from '@/store/gaussian-store';

export const ASPECT_RATIOS: Record<AspectRatio, { w: number; h: number; label: string }> = {
  '1:1': { w: 1, h: 1, label: '1:1 (Square)' },
  '4:5': { w: 4, h: 5, label: '4:5 (Portrait)' },
  '9:16': { w: 9, h: 16, label: '9:16 (Story)' },
  '16:9': { w: 16, h: 9, label: '16:9 (Landscape)' },
  'custom': { w: 1, h: 1, label: 'Custom' },
};

export function getRatioDimensions(
  ratio: AspectRatio,
  customW: number,
  customH: number,
  baseSize: number
): { width: number; height: number } {
  const r = ratio === 'custom'
    ? { w: customW, h: customH }
    : ASPECT_RATIOS[ratio];

  if (r.w >= r.h) {
    return {
      width: baseSize,
      height: Math.round(baseSize * (r.h / r.w)),
    };
  } else {
    return {
      width: Math.round(baseSize * (r.w / r.h)),
      height: baseSize,
    };
  }
}
