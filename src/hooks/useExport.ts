import { useCallback, useState } from 'react';
import { useCropperStore } from '@/store/cropper-store';
import { exportToZip, downloadBlob } from '@/lib/export/zip';

export function useExport() {
  const { images, settings } = useCropperStore();
  const [exporting, setExporting] = useState(false);

  const exportAsZip = useCallback(async () => {
    const processedImages = images.filter(
      (img) => img.status === 'done' && img.processedBlob
    );

    if (processedImages.length === 0) return;

    setExporting(true);

    try {
      const blob = await exportToZip({
        images: processedImages,
        filename: settings.prefix || 'polaroid-cropped',
      });

      await downloadBlob(blob, `${settings.prefix || 'polaroid-cropped'}.zip`);
    } finally {
      setExporting(false);
    }
  }, [images, settings.prefix]);

  const downloadSingle = useCallback(
    async (imageId: string) => {
      const image = images.find((img) => img.id === imageId);
      if (!image?.processedBlob) return;

      const ext = image.file.name.split('.').pop() || 'png';
      await downloadBlob(image.processedBlob, `cropped.${ext}`);
    },
    [images]
  );

  return {
    exporting,
    exportAsZip,
    downloadSingle,
    hasProcessedImages: images.some((img) => img.status === 'done'),
  };
}
