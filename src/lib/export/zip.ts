import type { ProcessedImage } from '@/types';

interface ExportZipOptions {
  images: ProcessedImage[];
  filename?: string;
}

export async function exportToZip(options: ExportZipOptions): Promise<Blob> {
  const { images } = options;

  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  const successImages = images.filter(
    (img) => img.status === 'done' && img.processedBlob
  );

  for (let i = 0; i < successImages.length; i++) {
    const img = successImages[i];
    const ext = getExtension(img.file.name);
    const name = `${String(i + 1).padStart(3, '0')}.${ext}`;
    zip.file(name, img.processedBlob!);
  }

  return zip.generateAsync({ type: 'blob' });
}

function getExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext === 'jpg' || ext === 'jpeg' ? 'jpg' : 'png';
}

export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
