// ==================== Common Types ====================

export interface Size {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Rect extends Position, Size {}

// ==================== Paper & Frame ====================

export type PaperType = 'a4' | 'a5' | 'letter' | '4x6' | '6x4' | 'custom';
export type FrameType = 'polaroid' | 'instax-mini' | 'super8';
export type ImageMode = 'frame' | 'inner';

export interface PaperSize extends Size {
  name: string;
}

export interface FrameSize extends Size {
  innerRatio: number;
  borderTop: number;
  borderBottom: number;
  borderLeft: number;
  borderRight: number;
}

// ==================== Layout ====================

export interface LayoutConfig {
  paper: PaperSize;
  frameType: FrameType;
  imageMode: ImageMode;
  columns: number;
  gap: number;
  padding: number;
}

export interface LayoutResult {
  columns: number;
  rows: number;
  perPage: number;
  totalPages: number;
  imageWidth: number;
  imageHeight: number;
  positions: Position[];
}

// ==================== Image Processing ====================

export interface ProcessedImage {
  id: string;
  file: File;
  originalUrl: string;
  processedUrl?: string;
  processedBlob?: Blob;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
}

export interface CropperSettings {
  enablePerspective: boolean;
  threshold: number;
  namingMode: 'numeric' | 'prefix' | 'original';
  prefix: string;
  startNumber: number;
}

// ==================== Print Settings ====================

export interface PrintImage {
  id: string;
  file: File;
  url: string;
  offset: Position;
  whiteBorder?: Rect;
}

export interface PrintSettings {
  paperType: PaperType;
  customPaper?: Size;
  frameType: FrameType;
  imageMode: ImageMode;
  columns: number;
  gap: number;
  padding: number;
  showCutMarks: boolean;
}

export interface ExportSettings {
  format: 'pdf' | 'png';
  dpi: 150 | 300 | 600;
  filename: string;
}

// ==================== State ====================

export interface CropperState {
  images: ProcessedImage[];
  settings: CropperSettings;
  isProcessing: boolean;
  progress: number;
}

export interface PrintState {
  images: PrintImage[];
  settings: PrintSettings;
  layout: LayoutResult | null;
  currentPage: number;
  selectedImageId: string | null;
}
