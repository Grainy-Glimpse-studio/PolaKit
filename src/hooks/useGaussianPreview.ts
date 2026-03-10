import { useCallback, useEffect, useRef, useState } from 'react';
import { useGaussianStore } from '@/store/gaussian-store';
import { renderComposite, exportAsBlob } from '@/lib/gaussian/composite';
import { downloadBlob } from '@/lib/export/zip';

export function useGaussianPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [exporting, setExporting] = useState(false);

  const {
    images,
    currentIndex,
    applyMode,
    settings,
    addImages,
    removeImage,
    clearImages,
    setCurrentIndex,
    nextImage,
    prevImage,
    updateSettings,
    updateImageSettings,
    applyPreset,
    activePreset,
    customPresets,
    saveCustomPreset,
    deleteCustomPreset,
    reset,
  } = useGaussianStore();

  const currentImage = images[currentIndex];

  // Get effective settings (global or per-image)
  const effectiveSettings = applyMode === 'single' && currentImage?.settings
    ? { ...settings, ...currentImage.settings }
    : settings;

  // Load current image
  useEffect(() => {
    if (!currentImage) {
      setLoadedImage(null);
      return;
    }

    const img = new Image();
    img.onload = () => setLoadedImage(img);
    img.src = currentImage.url;

    return () => {
      img.onload = null;
    };
  }, [currentImage?.url]);

  // Render preview
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;

    renderComposite({
      settings: effectiveSettings,
      image: loadedImage,
      canvas,
      scale: 0.5, // Preview at half resolution
    });
  }, [loadedImage, effectiveSettings]);

  useEffect(() => {
    render();
  }, [render]);

  // Export single image
  const exportSingle = useCallback(async () => {
    if (!loadedImage) return;

    setExporting(true);
    try {
      const blob = await exportAsBlob(effectiveSettings, loadedImage);
      const filename = currentImage?.file.name.replace(/\.[^.]+$/, '') || 'gaussian';
      await downloadBlob(blob, `${filename}_gaussian.jpg`);
    } finally {
      setExporting(false);
    }
  }, [loadedImage, effectiveSettings, currentImage]);

  // Export all images
  const exportAll = useCallback(async () => {
    if (images.length === 0) return;

    setExporting(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imageEl = await loadImage(img.url);

        const imgSettings = applyMode === 'single' && img.settings
          ? { ...settings, ...img.settings }
          : settings;

        const blob = await exportAsBlob(imgSettings, imageEl);
        const filename = img.file.name.replace(/\.[^.]+$/, '') || `image_${i + 1}`;
        zip.file(`${filename}_gaussian.jpg`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      await downloadBlob(zipBlob, 'gaussian_images.zip');
    } finally {
      setExporting(false);
    }
  }, [images, settings, applyMode]);

  return {
    canvasRef,
    images,
    currentIndex,
    currentImage,
    loadedImage,
    settings: effectiveSettings,
    applyMode,
    activePreset,
    customPresets,
    exporting,
    hasImages: images.length > 0,
    addImages,
    removeImage,
    clearImages,
    setCurrentIndex,
    nextImage,
    prevImage,
    updateSettings,
    updateImageSettings: (s: Parameters<typeof updateImageSettings>[1]) => {
      if (currentImage) updateImageSettings(currentImage.id, s);
    },
    applyPreset,
    saveCustomPreset,
    deleteCustomPreset,
    reset,
    exportSingle,
    exportAll,
    setApplyMode: useGaussianStore.getState().setApplyMode,
  };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
