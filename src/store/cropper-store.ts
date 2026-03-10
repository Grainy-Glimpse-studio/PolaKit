import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CropperState, ProcessedImage, CropperSettings } from '@/types';
import { processPolaroidImage } from '@/lib/cropper/perspective';

interface CropperActions {
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  updateSettings: (settings: Partial<CropperSettings>) => void;
  processAllImages: () => Promise<void>;
  processImage: (id: string) => Promise<void>;
}

type CropperStore = CropperState & CropperActions;

const defaultSettings: CropperSettings = {
  enablePerspective: true,
  threshold: 180,
  namingMode: 'numeric',
  prefix: 'polaroid',
  startNumber: 1,
};

export const useCropperStore = create<CropperStore>()(
  devtools(
    (set, get) => ({
      images: [],
      settings: defaultSettings,
      isProcessing: false,
      progress: 0,

      addImages: (files) => {
        const newImages: ProcessedImage[] = files.map((file) => ({
          id: crypto.randomUUID(),
          file,
          originalUrl: URL.createObjectURL(file),
          status: 'pending',
        }));

        set((state) => ({
          images: [...state.images, ...newImages],
        }));
      },

      removeImage: (id) => {
        const image = get().images.find((img) => img.id === id);
        if (image) {
          URL.revokeObjectURL(image.originalUrl);
          if (image.processedUrl) {
            URL.revokeObjectURL(image.processedUrl);
          }
        }

        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
        }));
      },

      clearImages: () => {
        get().images.forEach((img) => {
          URL.revokeObjectURL(img.originalUrl);
          if (img.processedUrl) {
            URL.revokeObjectURL(img.processedUrl);
          }
        });
        set({ images: [], progress: 0 });
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      processAllImages: async () => {
        const { images, settings } = get();
        const pendingImages = images.filter((img) => img.status === 'pending');

        if (pendingImages.length === 0) return;

        set({ isProcessing: true, progress: 0 });

        for (let i = 0; i < pendingImages.length; i++) {
          const img = pendingImages[i];

          set((state) => ({
            images: state.images.map((item) =>
              item.id === img.id ? { ...item, status: 'processing' } : item
            ),
          }));

          const result = await processPolaroidImage(img.file, {
            threshold: settings.threshold,
            enablePerspective: settings.enablePerspective,
          });

          set((state) => ({
            images: state.images.map((item) =>
              item.id === img.id
                ? {
                    ...item,
                    status: result.success ? 'done' : 'error',
                    processedBlob: result.blob,
                    processedUrl: result.blob
                      ? URL.createObjectURL(result.blob)
                      : undefined,
                    error: result.error,
                  }
                : item
            ),
            progress: ((i + 1) / pendingImages.length) * 100,
          }));
        }

        set({ isProcessing: false });
      },

      processImage: async (id) => {
        const { images, settings } = get();
        const image = images.find((img) => img.id === id);

        if (!image) return;

        set((state) => ({
          images: state.images.map((item) =>
            item.id === id ? { ...item, status: 'processing' } : item
          ),
        }));

        const result = await processPolaroidImage(image.file, {
          threshold: settings.threshold,
          enablePerspective: settings.enablePerspective,
        });

        set((state) => ({
          images: state.images.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: result.success ? 'done' : 'error',
                  processedBlob: result.blob,
                  processedUrl: result.blob
                    ? URL.createObjectURL(result.blob)
                    : undefined,
                  error: result.error,
                }
              : item
          ),
        }));
      },
    }),
    { name: 'cropper-store' }
  )
);
