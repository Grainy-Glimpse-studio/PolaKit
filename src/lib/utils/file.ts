export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function filterImageFiles(files: FileList | File[]): File[] {
  return Array.from(files).filter(isImageFile);
}

export function generateFileName(
  index: number,
  mode: 'numeric' | 'prefix' | 'original',
  options: {
    prefix?: string;
    startNumber?: number;
    originalName?: string;
  } = {}
): string {
  const { prefix = 'img', startNumber = 1, originalName = '' } = options;

  switch (mode) {
    case 'numeric':
      return String(index + startNumber).padStart(3, '0');
    case 'prefix':
      return `${prefix}_${String(index + startNumber).padStart(3, '0')}`;
    case 'original':
      return originalName.replace(/\.[^.]+$/, '');
    default:
      return String(index + 1).padStart(3, '0');
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
