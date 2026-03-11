import { useMemo } from 'react';
import type { CropperSettings, ProcessedImage } from '@/types';
import { generateFilenamePreview } from '@/lib/cropper/filename';

interface FilenamePreviewProps {
  images: ProcessedImage[];
  settings: CropperSettings;
}

export function FilenamePreview({ images, settings }: FilenamePreviewProps) {
  const previews = useMemo(() => {
    return generateFilenamePreview(images, settings, 5);
  }, [images, settings]);

  if (images.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic">
        Upload images to see filename preview
      </div>
    );
  }

  // 检查是否有任何命名选项启用
  const hasNamingOptions = settings.useGlobalPrefix || settings.useDatePrefix || settings.useNumeric;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Preview</div>
      {!hasNamingOptions && (
        <p className="text-xs text-amber-600 mb-2">
          No naming options selected. Original filenames will be used.
        </p>
      )}
      <div className="space-y-1">
        {previews.map((name, i) => (
          <div
            key={i}
            className="text-sm text-gray-600 font-mono flex items-center gap-2"
          >
            <span className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
              {i + 1}
            </span>
            <span className="truncate">{name}</span>
          </div>
        ))}
        {images.length > 5 && (
          <div className="text-sm text-gray-400 italic pt-1">
            ...and {images.length - 5} more
          </div>
        )}
      </div>
    </div>
  );
}
