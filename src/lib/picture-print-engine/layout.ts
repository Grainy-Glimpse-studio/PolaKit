import type {
  PaperType,
  PaperSize,
  FrameType,
  FrameSize,
  LayoutConfig,
  LayoutResult,
  Position,
} from '@/types';

// ==================== Preset Sizes ====================

export const PAPER_SIZES: Record<PaperType, PaperSize> = {
  a4: { width: 210, height: 297, name: 'A4' },
  a5: { width: 148, height: 210, name: 'A5' },
  letter: { width: 215.9, height: 279.4, name: 'Letter' },
  '4x6': { width: 101.6, height: 152.4, name: '4x6"' },
  '6x4': { width: 152.4, height: 101.6, name: '6x4"' },
  custom: { width: 210, height: 297, name: 'Custom' },
};

export const FRAME_SIZES: Record<FrameType, FrameSize> = {
  polaroid: {
    width: 88,
    height: 107,
    innerRatio: 79 / 88,
    borderTop: 8,
    borderBottom: 20,
    borderLeft: 4.5,
    borderRight: 4.5,
  },
  'instax-mini': {
    width: 54,
    height: 86,
    innerRatio: 46 / 54,
    borderTop: 5,
    borderBottom: 20,
    borderLeft: 4,
    borderRight: 4,
  },
  super8: {
    width: 60,
    height: 45,
    innerRatio: 1,
    borderTop: 0,
    borderBottom: 0,
    borderLeft: 0,
    borderRight: 0,
  },
};

// ==================== Core Functions ====================

export function getFrameRatio(frameType: FrameType, withFrame: boolean): number {
  const frame = FRAME_SIZES[frameType];
  if (withFrame) {
    return frame.height / frame.width;
  }
  const innerWidth = frame.width - frame.borderLeft - frame.borderRight;
  const innerHeight = frame.height - frame.borderTop - frame.borderBottom;
  return innerHeight / innerWidth;
}

export function calculateLayout(config: LayoutConfig): LayoutResult {
  const { paper, frameType, imageMode, columns, gap, padding } = config;

  const withFrame = imageMode === 'frame';
  const ratio = getFrameRatio(frameType, withFrame);

  const availableWidth = paper.width - padding * 2 - gap * (columns - 1);
  const imageWidth = availableWidth / columns;
  const imageHeight = imageWidth * ratio;

  const availableHeight = paper.height - padding * 2;
  const rows = Math.floor((availableHeight + gap) / (imageHeight + gap));

  const perPage = columns * rows;

  return {
    columns,
    rows,
    perPage,
    totalPages: 0,
    imageWidth,
    imageHeight,
    positions: [],
  };
}

export function getImagePosition(
  layout: LayoutResult,
  index: number,
  padding: number,
  gap: number
): Position {
  const { columns, imageWidth, imageHeight } = layout;

  const col = index % columns;
  const row = Math.floor(index / columns);

  return {
    x: padding + col * (imageWidth + gap),
    y: padding + row * (imageHeight + gap),
  };
}

export function calculateTotalPages(imageCount: number, perPage: number): number {
  return Math.ceil(imageCount / perPage);
}

export function getPageImageRange(
  pageIndex: number,
  perPage: number,
  totalImages: number
): { start: number; end: number } {
  const start = pageIndex * perPage;
  const end = Math.min(start + perPage, totalImages);
  return { start, end };
}
