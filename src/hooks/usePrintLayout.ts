import { useCallback } from 'react';
import { usePrintStore } from '@/store/print-store';
import { exportToPdf } from '@/lib/export/pdf';
import { downloadBlob, createZip } from '@/lib/export/zip';
import { PAPER_SIZES, getImagePosition, FRAME_SIZES } from '@/lib/picture-print-engine/layout';
import { drawImageCover } from '@/lib/utils/canvas';

export function usePrintLayout() {
  const store = usePrintStore();

  const handleFilesSelect = useCallback(
    (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        store.addImages(imageFiles);
      }
    },
    [store]
  );

  const handleExportPdf = useCallback(
    async (dpi: 150 | 300 | 600 = 300) => {
      if (!store.layout || store.images.length === 0) return;

      const blob = await exportToPdf({
        images: store.images,
        settings: store.settings,
        layout: store.layout,
        dpi,
        filename: `${store.settings.frameType}-print`,
      });

      await downloadBlob(blob, `${store.settings.frameType}-print.pdf`);
    },
    [store]
  );

  const handleExportPng = useCallback(
    async (dpi: 150 | 300 | 600 = 300) => {
      if (!store.layout || store.images.length === 0) return;

      const basePaper = store.settings.customPaper || PAPER_SIZES[store.settings.paperType];
      // Apply orientation
      const paper = store.settings.orientation === 'landscape'
        ? { width: basePaper.height, height: basePaper.width }
        : basePaper;
      const scale = dpi / 25.4; // mm to pixels at given DPI
      const canvasWidth = Math.round(paper.width * scale);
      const canvasHeight = Math.round(paper.height * scale);

      const files: { name: string; blob: Blob }[] = [];

      // Load all images first
      const loadedImages = new Map<string, HTMLImageElement>();
      await Promise.all(
        store.images.map(
          (img) =>
            new Promise<void>((resolve) => {
              const imgEl = new Image();
              imgEl.onload = () => {
                loadedImages.set(img.id, imgEl);
                resolve();
              };
              imgEl.onerror = () => resolve();
              imgEl.src = img.url;
            })
        )
      );

      // Generate each page
      for (let page = 0; page < store.layout.totalPages; page++) {
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw images for this page
        const startIdx = page * store.layout.perPage;
        const endIdx = Math.min(startIdx + store.layout.perPage, store.images.length);
        const pageImages = store.images.slice(startIdx, endIdx);

        pageImages.forEach((img, idx) => {
          const loadedImg = loadedImages.get(img.id);
          if (!loadedImg) return;

          const pos = getImagePosition(store.layout!, idx, store.settings.padding, store.settings.gap);
          const x = pos.x * scale;
          const y = pos.y * scale;
          const width = store.layout!.imageWidth * scale;
          const height = store.layout!.imageHeight * scale;

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

          // Draw cut marks if enabled
          if (store.settings.showCutMarks) {
            drawCutMarksForImage(ctx, x, y, width, height, scale);
          }
        });

        // Convert to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });

        files.push({
          name: `page_${String(page + 1).padStart(2, '0')}.png`,
          blob,
        });
      }

      // Create and download ZIP
      const zipBlob = await createZip(files);
      await downloadBlob(zipBlob, `${store.settings.frameType}-print.zip`);
    },
    [store]
  );

  const handleDownloadSingle = useCallback(
    async (imageId: string) => {
      const image = store.images.find((img) => img.id === imageId);
      if (!image || !store.layout) return;

      const frame = FRAME_SIZES[store.settings.frameType];
      const dpi = 300;
      const scale = dpi / 25.4;

      const canvasWidth = Math.round(frame.width * scale);
      const canvasHeight = Math.round(frame.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load image
      const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = image.url;
      });

      // Draw
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      drawImageCover(
        ctx,
        imgEl,
        0,
        0,
        canvasWidth,
        canvasHeight,
        image.offset.x * scale,
        image.offset.y * scale
      );

      // Download
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const filename = image.file.name.replace(/\.[^/.]+$/, '') + '_print.png';
      await downloadBlob(blob, filename);
    },
    [store]
  );

  return {
    ...store,
    addImages: handleFilesSelect,
    exportPdf: handleExportPdf,
    exportPng: handleExportPng,
    downloadSingle: handleDownloadSingle,
  };
}

function drawCutMarksForImage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number
): void {
  const markLength = 3 * scale;
  const markOffset = 1 * scale;

  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 0.5 * scale;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(x - markOffset, y);
  ctx.lineTo(x - markOffset - markLength, y);
  ctx.moveTo(x, y - markOffset);
  ctx.lineTo(x, y - markOffset - markLength);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(x + width + markOffset, y);
  ctx.lineTo(x + width + markOffset + markLength, y);
  ctx.moveTo(x + width, y - markOffset);
  ctx.lineTo(x + width, y - markOffset - markLength);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x - markOffset, y + height);
  ctx.lineTo(x - markOffset - markLength, y + height);
  ctx.moveTo(x, y + height + markOffset);
  ctx.lineTo(x, y + height + markOffset + markLength);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + width + markOffset, y + height);
  ctx.lineTo(x + width + markOffset + markLength, y + height);
  ctx.moveTo(x + width, y + height + markOffset);
  ctx.lineTo(x + width, y + height + markOffset + markLength);
  ctx.stroke();
}
