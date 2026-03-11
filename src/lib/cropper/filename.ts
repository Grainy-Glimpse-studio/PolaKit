import type { CropperSettings, ProcessedImage } from '@/types';

/**
 * 生成日期前缀
 * 格式：YYYY-MM-DD_HH-mm
 */
export function generateDatePrefix(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}_${hour}-${minute}_`;
}

/**
 * 根据设置生成文件名
 */
export function generateFilename(
  image: ProcessedImage,
  index: number,
  settings: CropperSettings,
  datePrefix?: string
): string {
  const ext = getExtension(image.file.name);
  const parts: string[] = [];

  // 1. 如果有单张命名，优先使用
  if (image.customName && image.customName.trim()) {
    parts.push(image.customName.trim());
  } else {
    // 2. 全局前缀
    if (settings.useGlobalPrefix && settings.globalPrefix) {
      parts.push(settings.globalPrefix);
    }

    // 3. 日期前缀
    if (settings.useDatePrefix && datePrefix) {
      parts.push(datePrefix);
    }
  }

  // 4. 数字序号
  if (settings.useNumeric) {
    const num = settings.startNumber + index;
    const paddedNum = String(num).padStart(settings.padding, '0');
    parts.push(paddedNum);
  }

  // 如果没有任何命名部分，使用原文件名（不含扩展名）
  if (parts.length === 0) {
    const originalName = image.file.name.replace(/\.[^.]+$/, '');
    return `${originalName}.${ext}`;
  }

  return `${parts.join('')}.${ext}`;
}

/**
 * 生成预览文件名列表
 */
export function generateFilenamePreview(
  images: ProcessedImage[],
  settings: CropperSettings,
  maxPreview = 5
): string[] {
  const previewCount = Math.min(images.length, maxPreview);
  const previews: string[] = [];
  const datePrefix = settings.useDatePrefix ? generateDatePrefix() : undefined;

  for (let i = 0; i < previewCount; i++) {
    previews.push(generateFilename(images[i], i, settings, datePrefix));
  }

  return previews;
}

/**
 * 获取文件扩展名
 */
function getExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext === 'jpeg' ? 'jpg' : ext || 'png';
}
