import type { jsPDF } from 'jspdf';
import type { PrintImage, PrintSettings, LayoutResult } from '@/types';
import { getImagePosition, PAPER_SIZES } from '@/lib/picture-print-engine/layout';

interface ExportPdfOptions {
  images: PrintImage[];
  settings: PrintSettings;
  layout: LayoutResult;
  dpi?: number;
  filename?: string;
}

export async function exportToPdf(options: ExportPdfOptions): Promise<Blob> {
  const { images, settings, layout, dpi = 300 } = options;

  const jspdfModule = await import('jspdf');
  const { jsPDF: JsPDF } = jspdfModule;

  const paper = settings.customPaper || PAPER_SIZES[settings.paperType];
  const pdf = new JsPDF({
    orientation: paper.width > paper.height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [paper.width, paper.height],
  });

  const scale = dpi / 25.4;
  const totalPages = layout.totalPages;

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (pageIdx > 0) {
      pdf.addPage();
    }

    const startIdx = pageIdx * layout.perPage;
    const endIdx = Math.min(startIdx + layout.perPage, images.length);
    const pageImages = images.slice(startIdx, endIdx);

    for (let i = 0; i < pageImages.length; i++) {
      const img = pageImages[i];
      const pos = getImagePosition(layout, i, settings.padding, settings.gap);

      await addImageToPdf(pdf, img.url, {
        x: pos.x,
        y: pos.y,
        width: layout.imageWidth,
        height: layout.imageHeight,
        offsetX: img.offset.x / scale,
        offsetY: img.offset.y / scale,
      });
    }

    if (settings.showCutMarks) {
      drawCutMarks(pdf, layout, settings.padding, settings.gap);
    }
  }

  return pdf.output('blob') as unknown as Blob;
}

async function addImageToPdf(
  pdf: jsPDF,
  imageUrl: string,
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  }
): Promise<void> {
  const { x, y, width, height, offsetX, offsetY } = options;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      pdf.addImage(
        img,
        'JPEG',
        x + offsetX,
        y + offsetY,
        width,
        height
      );
      resolve();
    };
    img.onerror = () => resolve();
    img.src = imageUrl;
  });
}

function drawCutMarks(
  pdf: jsPDF,
  layout: LayoutResult,
  padding: number,
  gap: number
): void {
  const markLength = 3;
  const markOffset = 2;

  pdf.setDrawColor(128);
  pdf.setLineWidth(0.1);

  for (let row = 0; row <= layout.rows; row++) {
    for (let col = 0; col <= layout.columns; col++) {
      const x = padding + col * (layout.imageWidth + gap) - gap / 2;
      const y = padding + row * (layout.imageHeight + gap) - gap / 2;

      if (col > 0 && col < layout.columns) {
        pdf.line(x, y - markOffset - markLength, x, y - markOffset);
        pdf.line(x, y + markOffset, x, y + markOffset + markLength);
      }

      if (row > 0 && row < layout.rows) {
        pdf.line(x - markOffset - markLength, y, x - markOffset, y);
        pdf.line(x + markOffset, y, x + markOffset + markLength, y);
      }
    }
  }
}
