import type { Template } from '@/types/template';
import type { CropperSettings, PrintSettings, LayoutResult } from '@/types';
import type { GaussianSettings } from '@/store/gaussian-store';
import { opencvWorkerService } from '@/lib/cropper/opencv-worker-service';
import { exportAsBlob } from '@/lib/gaussian/composite';
import { PAPER_SIZES, calculateLayout, calculateTotalPages, getImagePosition } from '@/lib/picture-print-engine/layout';

// Default settings for each module
const defaultCropperSettings: CropperSettings = {
  enablePerspective: true,
  cropBlackBorder: true,
  threshold: 180,
  extractInnerImage: false,
  useGlobalPrefix: false,
  globalPrefix: 'Polaroid_',
  useDatePrefix: false,
  useNumeric: true,
  padding: 3,
  startNumber: 1,
};

const defaultGaussianSettings: GaussianSettings = {
  ratio: '1:1',
  customRatioW: 4,
  customRatioH: 3,
  polaroidSize: 70,
  polaroidOffsetX: 0,
  polaroidOffsetY: 0,
  bgType: 'blur',
  blurIntensity: 30,
  bgScale: 100,
  bgOffsetX: 0,
  bgOffsetY: 0,
  brightness: 100,
  bgColor: '#ffffff',
  bgImageUrl: '',
  bgVideoUrl: '',
  bgVideoTime: 0,
  shadow: true,
  shadowBlur: 25,
  shadowOpacity: 35,
  resolution: 2160,
};

const defaultPrintSettings: PrintSettings = {
  paperType: 'a4',
  orientation: 'portrait',
  frameType: 'polaroid',
  imageMode: 'frame',
  columns: 3,
  gap: 2,
  padding: 10,
  showCutMarks: true,
  cropAdjust: 0,
};

export interface ProcessingProgress {
  module: 'cropper' | 'gaussian' | 'print';
  current: number;
  total: number;
  status: 'processing' | 'done' | 'error';
  error?: string;
}

export interface ProcessingResult {
  cropper: Blob[];
  gaussian: Blob[];
  print: Blob[];
}

export type ProgressCallback = (progress: ProcessingProgress) => void;

// Process files through Cropper module
async function processCropperModule(
  files: File[],
  templateSettings: Partial<CropperSettings>,
  onProgress: ProgressCallback
): Promise<Blob[]> {
  const settings = { ...defaultCropperSettings, ...templateSettings };
  const results: Blob[] = [];

  // Wait for OpenCV to be ready
  if (!opencvWorkerService.isReady()) {
    await new Promise<void>((resolve, reject) => {
      const unsubReady = opencvWorkerService.onReady(() => {
        unsubReady();
        resolve();
      });
      const unsubError = opencvWorkerService.onError((err) => {
        unsubError();
        reject(new Error(err));
      });
    });
  }

  for (let i = 0; i < files.length; i++) {
    onProgress({
      module: 'cropper',
      current: i + 1,
      total: files.length,
      status: 'processing',
    });

    const result = await opencvWorkerService.processImage(files[i], {
      threshold: settings.threshold,
      enablePerspective: settings.enablePerspective,
      extractInnerImage: settings.extractInnerImage,
    });

    if (result.success && result.blob) {
      results.push(result.blob);
    }
  }

  onProgress({
    module: 'cropper',
    current: files.length,
    total: files.length,
    status: 'done',
  });

  return results;
}

// Load image from File
async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

// Process files through Gaussian module
async function processGaussianModule(
  files: File[],
  templateSettings: Partial<GaussianSettings>,
  onProgress: ProgressCallback
): Promise<Blob[]> {
  const settings = { ...defaultGaussianSettings, ...templateSettings };
  const results: Blob[] = [];

  for (let i = 0; i < files.length; i++) {
    onProgress({
      module: 'gaussian',
      current: i + 1,
      total: files.length,
      status: 'processing',
    });

    try {
      const image = await loadImage(files[i]);
      const blob = await exportAsBlob(settings, image, 'jpeg', 0.92);
      results.push(blob);
    } catch (error) {
      console.error('Failed to process image with Gaussian:', error);
    }
  }

  onProgress({
    module: 'gaussian',
    current: files.length,
    total: files.length,
    status: 'done',
  });

  return results;
}

// Process files through Print module (generates PDF pages)
async function processPrintModule(
  files: File[],
  templateSettings: Partial<PrintSettings>,
  onProgress: ProgressCallback
): Promise<Blob[]> {
  const settings = { ...defaultPrintSettings, ...templateSettings };

  onProgress({
    module: 'print',
    current: 0,
    total: 1,
    status: 'processing',
  });

  // Calculate layout
  const basePaper = PAPER_SIZES[settings.paperType] || PAPER_SIZES.a4;
  const paper = settings.orientation === 'landscape'
    ? { width: basePaper.height, height: basePaper.width, name: settings.paperType }
    : { ...basePaper, name: settings.paperType };

  const layout: LayoutResult = calculateLayout({
    paper,
    frameType: settings.frameType,
    imageMode: settings.imageMode,
    columns: settings.columns,
    gap: settings.gap,
    padding: settings.padding,
  });

  layout.totalPages = calculateTotalPages(files.length, layout.perPage);

  // Generate PDF
  const jspdfModule = await import('jspdf');
  const { jsPDF } = jspdfModule;

  const pdf = new jsPDF({
    orientation: paper.width > paper.height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [paper.width, paper.height],
  });

  // DPI for high quality output (used for export)

  // Load all images first
  const images: HTMLImageElement[] = [];
  for (const file of files) {
    try {
      const img = await loadImage(file);
      images.push(img);
    } catch (error) {
      console.error('Failed to load image for print:', error);
    }
  }

  for (let pageIdx = 0; pageIdx < layout.totalPages; pageIdx++) {
    if (pageIdx > 0) {
      pdf.addPage();
    }

    const startIdx = pageIdx * layout.perPage;
    const endIdx = Math.min(startIdx + layout.perPage, images.length);
    const pageImages = images.slice(startIdx, endIdx);

    for (let i = 0; i < pageImages.length; i++) {
      const img = pageImages[i];
      const pos = getImagePosition(layout, i, settings.padding, settings.gap);

      // Convert image to data URL
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.92),
        'JPEG',
        pos.x,
        pos.y,
        layout.imageWidth,
        layout.imageHeight
      );
    }

    // Draw cut marks if enabled
    if (settings.showCutMarks) {
      drawCutMarks(pdf, layout, settings.padding, settings.gap);
    }
  }

  const pdfBlob = pdf.output('blob') as unknown as Blob;

  onProgress({
    module: 'print',
    current: 1,
    total: 1,
    status: 'done',
  });

  return [pdfBlob];
}

// Draw cut marks on PDF
function drawCutMarks(
  pdf: InstanceType<typeof import('jspdf').jsPDF>,
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

// Main processing function
export async function processWithTemplate(
  files: File[],
  template: Template,
  templateSettings: {
    cropper: Partial<CropperSettings>;
    gaussian: Partial<GaussianSettings>;
    print: Partial<PrintSettings>;
  },
  onProgress: ProgressCallback
): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    cropper: [],
    gaussian: [],
    print: [],
  };

  const promises: Promise<void>[] = [];

  if (template.enabledModules.cropper) {
    promises.push(
      processCropperModule(files, templateSettings.cropper, onProgress)
        .then((blobs) => { result.cropper = blobs; })
    );
  }

  if (template.enabledModules.gaussian) {
    promises.push(
      processGaussianModule(files, templateSettings.gaussian, onProgress)
        .then((blobs) => { result.gaussian = blobs; })
    );
  }

  if (template.enabledModules.print) {
    promises.push(
      processPrintModule(files, templateSettings.print, onProgress)
        .then((blobs) => { result.print = blobs; })
    );
  }

  await Promise.all(promises);

  return result;
}

// Create ZIP with folder structure
export async function createTemplateZip(result: ProcessingResult): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // Add cropper results
  if (result.cropper.length > 0) {
    const cropperFolder = zip.folder('cropper')!;
    result.cropper.forEach((blob, i) => {
      cropperFolder.file(`${String(i + 1).padStart(3, '0')}.png`, blob);
    });
  }

  // Add gaussian results
  if (result.gaussian.length > 0) {
    const gaussianFolder = zip.folder('gaussian')!;
    result.gaussian.forEach((blob, i) => {
      gaussianFolder.file(`${String(i + 1).padStart(3, '0')}.jpg`, blob);
    });
  }

  // Add print results
  if (result.print.length > 0) {
    const printFolder = zip.folder('print')!;
    result.print.forEach((blob, i) => {
      printFolder.file(`page_${i + 1}.pdf`, blob);
    });
  }

  return zip.generateAsync({ type: 'blob' });
}
