import { useCallback, useEffect, useRef, useState } from 'react';
import { useGaussianStore } from '@/store/gaussian-store';
import { renderComposite, exportAsBlob } from '@/lib/gaussian/composite';
import { downloadBlob } from '@/lib/export/zip';

// Lazy import video export functions to avoid loading issues
const importVideoExport = () => import('@/lib/gaussian/video-export');

export function useGaussianPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [bgVideoFrame, setBgVideoFrame] = useState<HTMLCanvasElement | null>(null);
  const [exporting, setExporting] = useState(false);

  const {
    images,
    currentIndex,
    applyMode,
    namingMode,
    exportFormat,
    videoDuration,
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
    setNamingMode,
    setExportFormat,
    setVideoDuration,
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

  // Load background image when bgImageUrl changes
  useEffect(() => {
    if (!effectiveSettings.bgImageUrl || effectiveSettings.bgType !== 'image') {
      setBgImage(null);
      return;
    }

    const img = new Image();
    img.onload = () => setBgImage(img);
    img.onerror = () => setBgImage(null);
    img.src = effectiveSettings.bgImageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [effectiveSettings.bgImageUrl, effectiveSettings.bgType]);

  // Capture video frame when video URL/time changes
  useEffect(() => {
    if (!effectiveSettings.bgVideoUrl || effectiveSettings.bgType !== 'video') {
      setBgVideoFrame(null);
      return;
    }

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    videoRef.current = video;

    const captureFrame = () => {
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = video.videoWidth;
      frameCanvas.height = video.videoHeight;
      const ctx = frameCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        setBgVideoFrame(frameCanvas);
      }
    };

    video.onloadedmetadata = () => {
      video.currentTime = effectiveSettings.bgVideoTime;
    };

    video.onseeked = () => {
      captureFrame();
    };

    video.src = effectiveSettings.bgVideoUrl;
    video.load();

    return () => {
      video.onloadedmetadata = null;
      video.onseeked = null;
      videoRef.current = null;
    };
  }, [effectiveSettings.bgVideoUrl, effectiveSettings.bgVideoTime, effectiveSettings.bgType]);

  // Render preview
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;

    renderComposite({
      settings: effectiveSettings,
      image: loadedImage,
      canvas,
      scale: 0.5, // Preview at half resolution
      bgImage: effectiveSettings.bgType === 'image' ? bgImage : null,
      bgVideoFrame: effectiveSettings.bgType === 'video' ? bgVideoFrame : null,
    });
  }, [loadedImage, effectiveSettings, bgImage, bgVideoFrame]);

  useEffect(() => {
    render();
  }, [render]);

  // Get export filename based on naming mode
  const getExportFilename = useCallback((originalName: string, index: number) => {
    const baseName = originalName.replace(/\.[^.]+$/, '');
    switch (namingMode) {
      case 'suffix':
        return `${baseName}_gaussian.jpg`;
      case 'numbered':
        return `${String(index + 1).padStart(3, '0')}.jpg`;
      case 'original':
        return `${baseName}.jpg`;
      default:
        return `${baseName}_gaussian.jpg`;
    }
  }, [namingMode]);

  // Export single image
  const exportSingle = useCallback(async () => {
    if (!loadedImage) return;

    setExporting(true);
    try {
      // Load bg image for export if needed
      let exportBgImage: HTMLImageElement | null = null;
      let exportVideoFrame: HTMLCanvasElement | null = null;

      if (effectiveSettings.bgType === 'image' && effectiveSettings.bgImageUrl) {
        exportBgImage = await loadImage(effectiveSettings.bgImageUrl);
      } else if (effectiveSettings.bgType === 'video' && effectiveSettings.bgVideoUrl) {
        exportVideoFrame = await captureVideoFrame(effectiveSettings.bgVideoUrl, effectiveSettings.bgVideoTime);
      }

      const blob = await exportAsBlob(effectiveSettings, loadedImage, 'jpeg', 0.92, exportBgImage, exportVideoFrame);
      const filename = getExportFilename(currentImage?.file.name || 'image', currentIndex);
      await downloadBlob(blob, filename);
    } finally {
      setExporting(false);
    }
  }, [loadedImage, effectiveSettings, currentImage, currentIndex, getExportFilename]);

  // Export as video
  const exportVideo = useCallback(async () => {
    if (!loadedImage || !effectiveSettings.bgVideoUrl) return;

    setExporting(true);
    try {
      const { exportAsVideo, loadVideo } = await importVideoExport();
      const video = await loadVideo(effectiveSettings.bgVideoUrl);
      const blob = await exportAsVideo({
        settings: effectiveSettings,
        polaroidImage: loadedImage,
        bgVideo: video,
        startTime: effectiveSettings.bgVideoTime,
        duration: videoDuration,
        fps: 30,
        onProgress: (p) => console.log(`Exporting video: ${p.toFixed(1)}%`),
      });

      const baseName = (currentImage?.file.name || 'video').replace(/\.[^.]+$/, '');
      await downloadBlob(blob, `${baseName}_gaussian.mp4`);
    } catch (error) {
      console.error('Video export failed:', error);
      alert('Video export failed. Your browser may not support WebCodecs API.');
    } finally {
      setExporting(false);
    }
  }, [loadedImage, effectiveSettings, currentImage, videoDuration]);

  // Export as GIF
  const exportGif = useCallback(async () => {
    if (!loadedImage || !effectiveSettings.bgVideoUrl) return;

    setExporting(true);
    try {
      const { exportAsGif, loadVideo } = await importVideoExport();
      const video = await loadVideo(effectiveSettings.bgVideoUrl);
      const blob = await exportAsGif({
        settings: effectiveSettings,
        polaroidImage: loadedImage,
        bgVideo: video,
        startTime: effectiveSettings.bgVideoTime,
        duration: Math.min(videoDuration, 5), // Limit GIF to 5 seconds
        fps: 15,
        quality: 10,
        onProgress: (p) => console.log(`Exporting GIF: ${p.toFixed(1)}%`),
      });

      const baseName = (currentImage?.file.name || 'image').replace(/\.[^.]+$/, '');
      await downloadBlob(blob, `${baseName}_gaussian.gif`);
    } catch (error) {
      console.error('GIF export failed:', error);
      alert('GIF export failed.');
    } finally {
      setExporting(false);
    }
  }, [loadedImage, effectiveSettings, currentImage, videoDuration]);

  // Export all images
  const exportAll = useCallback(async () => {
    if (images.length === 0) return;

    setExporting(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Load bg image/video frame once if needed
      let exportBgImage: HTMLImageElement | null = null;
      let exportVideoFrame: HTMLCanvasElement | null = null;

      if (settings.bgType === 'image' && settings.bgImageUrl) {
        exportBgImage = await loadImage(settings.bgImageUrl);
      } else if (settings.bgType === 'video' && settings.bgVideoUrl) {
        exportVideoFrame = await captureVideoFrame(settings.bgVideoUrl, settings.bgVideoTime);
      }

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imageEl = await loadImage(img.url);

        const imgSettings = applyMode === 'single' && img.settings
          ? { ...settings, ...img.settings }
          : settings;

        // Load per-image bg if needed (for single mode)
        let imgBgImage = exportBgImage;
        let imgVideoFrame = exportVideoFrame;

        if (applyMode === 'single' && img.settings?.bgType === 'image' && img.settings?.bgImageUrl) {
          imgBgImage = await loadImage(img.settings.bgImageUrl);
          imgVideoFrame = null;
        } else if (applyMode === 'single' && img.settings?.bgType === 'video' && img.settings?.bgVideoUrl) {
          imgVideoFrame = await captureVideoFrame(img.settings.bgVideoUrl, img.settings.bgVideoTime || 0);
          imgBgImage = null;
        }

        const blob = await exportAsBlob(imgSettings, imageEl, 'jpeg', 0.92, imgBgImage, imgVideoFrame);
        const filename = getExportFilename(img.file.name || `image_${i + 1}`, i);
        zip.file(filename, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      await downloadBlob(zipBlob, 'gaussian_images.zip');
    } finally {
      setExporting(false);
    }
  }, [images, settings, applyMode, getExportFilename]);

  return {
    canvasRef,
    images,
    currentIndex,
    currentImage,
    loadedImage,
    settings: effectiveSettings,
    applyMode,
    namingMode,
    exportFormat,
    videoDuration,
    activePreset,
    customPresets,
    exporting,
    hasImages: images.length > 0,
    hasVideo: effectiveSettings.bgType === 'video' && !!effectiveSettings.bgVideoUrl,
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
    exportVideo,
    exportGif,
    exportAll,
    setApplyMode: useGaussianStore.getState().setApplyMode,
    setNamingMode,
    setExportFormat,
    setVideoDuration,
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

function captureVideoFrame(videoUrl: string, time: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;

    video.onloadedmetadata = () => {
      video.currentTime = time;
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        resolve(canvas);
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    video.onerror = () => reject(new Error('Failed to load video'));
    video.src = videoUrl;
    video.load();
  });
}
