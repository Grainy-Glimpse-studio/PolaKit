// ==================== Common Types ====================

export type WizardStep = 1 | 2 | 3 | 4;

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
  customName?: string; // 单张命名
}

export interface CropperSettings {
  enablePerspective: boolean;
  cropBlackBorder: boolean;
  threshold: number;
  extractInnerImage: boolean;  // 裁掉白边，只保留内部照片
  // 命名选项（可叠加）
  useGlobalPrefix: boolean;   // 是否使用全局前缀
  globalPrefix: string;       // 全局前缀内容
  useDatePrefix: boolean;     // 是否使用日期前缀
  useNumeric: boolean;        // 是否加数字序号
  padding: number;            // 数字位数 2/3/4
  startNumber: number;        // 起始数字
}

// ==================== Print Settings ====================

export interface PrintImage {
  id: string;
  file: File;
  url: string;
  offset: Position;
  whiteBorder?: Rect;
}

export type PaperOrientation = 'portrait' | 'landscape';

export interface PrintSettings {
  paperType: PaperType;
  customPaper?: Size;
  orientation: PaperOrientation;
  frameType: FrameType;
  imageMode: ImageMode;
  columns: number;
  gap: number;
  padding: number;
  showCutMarks: boolean;
  cropAdjust: number; // -5 to +5, for Inner mode
}

export interface CustomPaperSize extends Size {
  id: string;
  name: string;
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
