import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { PrintState, PrintImage, PrintSettings, LayoutResult, Position, CustomPaperSize } from '@/types';
import { calculateLayout, calculateTotalPages, PAPER_SIZES } from '@/lib/picture-print-engine/layout';

interface PrintActions {
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  setImageOffset: (id: string, offset: Position) => void;
  resetImageOffset: (id: string) => void;
  selectImage: (id: string | null) => void;
  updateSettings: (settings: Partial<PrintSettings>) => void;
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  recalculateLayout: () => void;
  addCustomPaperSize: (name: string, width: number, height: number) => void;
  removeCustomPaperSize: (id: string) => void;
  applyCustomPaperSize: (id: string) => void;
}

interface PrintStoreState extends PrintState {
  customPaperSizes: CustomPaperSize[];
}

type PrintStore = PrintStoreState & PrintActions;

const defaultSettings: PrintSettings = {
  paperType: 'a4',
  frameType: 'polaroid',
  imageMode: 'frame',
  columns: 3,
  gap: 2,
  padding: 10,
  showCutMarks: true,
  cropAdjust: 0,
};

export const usePrintStore = create<PrintStore>()(
  devtools(
    persist(
      (set, get) => ({
        images: [],
        settings: defaultSettings,
        layout: null,
        currentPage: 0,
        selectedImageId: null,
        customPaperSizes: [],

        addImages: (files) => {
          const existingImages = get().images;

          // De-duplicate by file name + size
          const newImages: PrintImage[] = files
            .filter((file) => {
              return !existingImages.some(
                (existing) =>
                  existing.file.name === file.name && existing.file.size === file.size
              );
            })
            .map((file) => ({
              id: crypto.randomUUID(),
              file,
              url: URL.createObjectURL(file),
              offset: { x: 0, y: 0 },
            }));

          if (newImages.length > 0) {
            set((state) => ({
              images: [...state.images, ...newImages],
            }));
            get().recalculateLayout();
          }
        },

        removeImage: (id) => {
          const image = get().images.find((img) => img.id === id);
          if (image) {
            URL.revokeObjectURL(image.url);
          }

          set((state) => ({
            images: state.images.filter((img) => img.id !== id),
            selectedImageId: state.selectedImageId === id ? null : state.selectedImageId,
          }));

          get().recalculateLayout();
        },

        clearImages: () => {
          get().images.forEach((img) => URL.revokeObjectURL(img.url));
          set({ images: [], currentPage: 0, selectedImageId: null });
          get().recalculateLayout();
        },

        setImageOffset: (id, offset) => {
          set((state) => ({
            images: state.images.map((img) =>
              img.id === id ? { ...img, offset } : img
            ),
          }));
        },

        resetImageOffset: (id) => {
          set((state) => ({
            images: state.images.map((img) =>
              img.id === id ? { ...img, offset: { x: 0, y: 0 } } : img
            ),
          }));
        },

        selectImage: (id) => {
          set({ selectedImageId: id });
        },

        updateSettings: (newSettings) => {
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          }));
          get().recalculateLayout();
        },

        setCurrentPage: (page) => {
          const { layout } = get();
          if (!layout) return;
          const maxPage = layout.totalPages - 1;
          set({ currentPage: Math.max(0, Math.min(page, maxPage)) });
        },

        nextPage: () => {
          const { currentPage, layout } = get();
          if (layout && currentPage < layout.totalPages - 1) {
            set({ currentPage: currentPage + 1 });
          }
        },

        prevPage: () => {
          const { currentPage } = get();
          if (currentPage > 0) {
            set({ currentPage: currentPage - 1 });
          }
        },

        recalculateLayout: () => {
          const { images, settings } = get();

          if (images.length === 0) {
            set({ layout: null, currentPage: 0 });
            return;
          }

          const paper = settings.customPaper || PAPER_SIZES[settings.paperType];

          const layout: LayoutResult = calculateLayout({
            paper: { ...paper, name: settings.paperType },
            frameType: settings.frameType,
            imageMode: settings.imageMode,
            columns: settings.columns,
            gap: settings.gap,
            padding: settings.padding,
          });

          layout.totalPages = calculateTotalPages(images.length, layout.perPage);

          set((state) => ({
            layout,
            currentPage: Math.min(state.currentPage, Math.max(0, layout.totalPages - 1)),
          }));
        },

        addCustomPaperSize: (name, width, height) => {
          const newSize: CustomPaperSize = {
            id: crypto.randomUUID(),
            name,
            width,
            height,
          };

          set((state) => ({
            customPaperSizes: [...state.customPaperSizes, newSize],
            settings: {
              ...state.settings,
              paperType: 'custom',
              customPaper: { width, height },
            },
          }));

          get().recalculateLayout();
        },

        removeCustomPaperSize: (id) => {
          set((state) => ({
            customPaperSizes: state.customPaperSizes.filter((s) => s.id !== id),
          }));
        },

        applyCustomPaperSize: (id) => {
          const size = get().customPaperSizes.find((s) => s.id === id);
          if (size) {
            set((state) => ({
              settings: {
                ...state.settings,
                paperType: 'custom',
                customPaper: { width: size.width, height: size.height },
              },
            }));
            get().recalculateLayout();
          }
        },
      }),
      {
        name: 'print-storage',
        partialize: (state) => ({
          settings: state.settings,
          customPaperSizes: state.customPaperSizes,
        }),
      }
    ),
    { name: 'print-store' }
  )
);
