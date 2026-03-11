import { useRef, useEffect, useCallback, useState } from 'react';
import type { PrintImage, PrintSettings, LayoutResult, Position } from '@/types';
import { getImagePosition, PAPER_SIZES } from '@/lib/picture-print-engine/layout';
import { usePrintCanvasDrag } from '@/hooks/usePrintCanvasDrag';
import { drawImageCover } from '@/lib/utils/canvas';

interface PrintCanvasProps {
  images: PrintImage[];
  settings: PrintSettings;
  layout: LayoutResult;
  currentPage: number;
  selectedImageId: string | null;
  onImageSelect: (id: string | null) => void;
  onImageOffsetChange: (id: string, offset: Position) => void;
}

export function PrintCanvas({
  images,
  settings,
  layout,
  currentPage,
  selectedImageId,
  onImageSelect,
  onImageOffsetChange,
}: PrintCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const imageRects = useRef<Map<string, { x: number; y: number; width: number; height: number }>>(new Map());

  const basePaper = settings.customPaper || PAPER_SIZES[settings.paperType];
  // Apply orientation - swap width/height for landscape
  const paper = settings.orientation === 'landscape'
    ? { width: basePaper.height, height: basePaper.width }
    : basePaper;
  const scale = 2;
  const canvasWidth = paper.width * scale;
  const canvasHeight = paper.height * scale;

  const startIdx = currentPage * layout.perPage;
  const endIdx = Math.min(startIdx + layout.perPage, images.length);
  const pageImages = images.slice(startIdx, endIdx);

  useEffect(() => {
    const newLoadedImages = new Map<string, HTMLImageElement>();
    let loadCount = 0;

    if (pageImages.length === 0) {
      setLoadedImages(newLoadedImages);
      return;
    }

    pageImages.forEach((img) => {
      if (loadedImages.has(img.id)) {
        newLoadedImages.set(img.id, loadedImages.get(img.id)!);
        loadCount++;
        if (loadCount === pageImages.length) {
          setLoadedImages(newLoadedImages);
        }
      } else {
        const imgEl = new Image();
        imgEl.onload = () => {
          newLoadedImages.set(img.id, imgEl);
          loadCount++;
          if (loadCount === pageImages.length) {
            setLoadedImages(newLoadedImages);
          }
        };
        imgEl.src = img.url;
      }
    });
  }, [pageImages.map((i) => i.id).join(',')]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    imageRects.current.clear();

    pageImages.forEach((img, idx) => {
      const pos = getImagePosition(layout, idx, settings.padding, settings.gap);
      const x = pos.x * scale;
      const y = pos.y * scale;
      const width = layout.imageWidth * scale;
      const height = layout.imageHeight * scale;

      imageRects.current.set(img.id, { x, y, width, height });

      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(x, y, width, height);

      const loadedImg = loadedImages.get(img.id);
      if (loadedImg) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();

        drawImageCover(
          ctx,
          loadedImg,
          x,
          y,
          width,
          height,
          img.offset.x * scale,
          img.offset.y * scale
        );

        ctx.restore();
      }

      if (img.id === selectedImageId) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
      }
    });

    if (settings.showCutMarks) {
      drawCutMarks(ctx, layout, settings.padding * scale, settings.gap * scale, scale);
    }
  }, [
    canvasWidth,
    canvasHeight,
    pageImages,
    layout,
    settings,
    loadedImages,
    selectedImageId,
    scale,
  ]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getImageAtPoint = useCallback(
    (point: Position): string | null => {
      for (const [id, rect] of imageRects.current) {
        if (
          point.x >= rect.x &&
          point.x <= rect.x + rect.width &&
          point.y >= rect.y &&
          point.y <= rect.y + rect.height
        ) {
          return id;
        }
      }
      return null;
    },
    []
  );

  const { isDragging, handleMouseDown, handleTouchStart } = usePrintCanvasDrag(
    canvasRef,
    getImageAtPoint,
    {
      onDragStart: (id) => {
        onImageSelect(id);
      },
      onDragMove: (id, delta) => {
        const img = images.find((i) => i.id === id);
        if (img) {
          onImageOffsetChange(id, {
            x: img.offset.x + delta.x / scale,
            y: img.offset.y + delta.y / scale,
          });
        }
      },
      onClick: (id) => {
        onImageSelect(id);
      },
    }
  );

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`border border-gray-300 shadow-lg select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          width: `${paper.width * 1.5}px`,
          height: `${paper.height * 1.5}px`,
          touchAction: 'none',
        }}
      />
    </div>
  );
}

function drawCutMarks(
  ctx: CanvasRenderingContext2D,
  layout: LayoutResult,
  padding: number,
  gap: number,
  scale: number
): void {
  const markLength = 4 * scale;
  const markOffset = 2 * scale;

  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 0.5;

  for (let row = 0; row <= layout.rows; row++) {
    for (let col = 0; col <= layout.columns; col++) {
      const x = padding + col * (layout.imageWidth * scale + gap) - gap / 2;
      const y = padding + row * (layout.imageHeight * scale + gap) - gap / 2;

      if (col > 0 && col < layout.columns) {
        ctx.beginPath();
        ctx.moveTo(x, y - markOffset - markLength);
        ctx.lineTo(x, y - markOffset);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y + markOffset);
        ctx.lineTo(x, y + markOffset + markLength);
        ctx.stroke();
      }
    }
  }
}
