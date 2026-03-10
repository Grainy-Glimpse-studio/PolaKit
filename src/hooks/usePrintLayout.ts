import { useCallback } from 'react';
import { usePrintStore } from '@/store/print-store';
import { exportToPdf } from '@/lib/export/pdf';
import { downloadBlob } from '@/lib/export/zip';

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

  return {
    ...store,
    addImages: handleFilesSelect,
    exportPdf: handleExportPdf,
  };
}
