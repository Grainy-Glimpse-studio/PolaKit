import { useCallback } from 'react';
import { useCropperStore } from '@/store/cropper-store';
import { useOpenCV } from './useOpenCV';

export function useImageProcessor() {
  const { ready, loading, error } = useOpenCV();
  const {
    images,
    settings,
    isProcessing,
    progress,
    addImages,
    removeImage,
    clearImages,
    updateSettings,
    processAllImages,
    processImage,
  } = useCropperStore();

  const handleFilesSelect = useCallback(
    (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        addImages(imageFiles);
      }
    },
    [addImages]
  );

  const handleProcess = useCallback(async () => {
    if (!ready) return;
    await processAllImages();
  }, [ready, processAllImages]);

  return {
    cvReady: ready,
    cvLoading: loading,
    cvError: error,
    images,
    settings,
    isProcessing,
    progress,
    addImages: handleFilesSelect,
    removeImage,
    clearImages,
    updateSettings,
    processAllImages: handleProcess,
    processImage,
  };
}
